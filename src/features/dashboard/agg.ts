import { db } from "../../data/db";
import type { PeriodKey, Exercise, SetEntry } from "../../shared/types";
import { periodRange, daysBetween, ymd } from "../../shared/constants/periods";
import { colorForScore } from "../../shared/constants/muscles";

type MuscleAgg = { volume: number; volNorm: number; prog: number; score: number };
type TrendPoint = { date: string; volume: number };

export async function computeMuscleAgg(period: PeriodKey): Promise<Record<string, MuscleAgg>> {
  const { start, end } = periodRange(period);

  // determine workout IDs to include (completed only)
  const completed = await db.workouts.where("status").equals("completed").toArray();
  const inRangeIds = new Set<string>();
  for (const w of completed) {
    const ws = new Date(w.startedAt);
    const include = period === "last"
      ? (w.id === completed.sort((a,b)=>a.startedAt<b.startedAt?1:-1)[0]?.id)
      : ((start ?? new Date(0)) <= ws && ws <= end);
    if (include) inRangeIds.add(w.id);
  }

  // collect sets in range
  const sets: SetEntry[] = [];
  for (const id of inRangeIds) {
    const s = await db.sets.where("workoutId").equals(id).toArray();
    sets.push(...s);
  }

  // volumes by muscle for the selected period
  const volByMuscle: Record<string, number> = {};
  for (const s of sets) {
    const v = s.effectiveVolume; // warmups already 0
    for (const [m, pct] of Object.entries(s.targetMuscles)) {
      volByMuscle[m] = (volByMuscle[m] ?? 0) + v * (pct / 100);
    }
  }

  // build denominator based on max moving window within last 90 days
  const windowDays = (() => {
    if (period === "last") return 1;
    if (period === "all") return 30; // heuristic
    const n = Number(period);
    return Number.isFinite(n) && n > 0 ? n : 30;
  })();

  const now = new Date();
  const start90 = new Date(now.getTime() - 90 * 86400000);
  // collect sets in last 90d
  const completed90 = completed.filter(w => new Date(w.startedAt) >= start90 && new Date(w.startedAt) <= now);
  const sets90: SetEntry[] = [];
  for (const w of completed90) {
    const s = await db.sets.where("workoutId").equals(w.id).toArray();
    sets90.push(...s);
  }
  // daily volumes per muscle
  const daily: Record<string, Record<string, number>> = {}; // muscle -> {date->vol}
  for (const s of sets90) {
    const d = ymd(new Date(s.createdAt));
    for (const [m, pct] of Object.entries(s.targetMuscles)) {
      const add = s.effectiveVolume * (pct / 100);
      daily[m] = daily[m] ?? {};
      daily[m][d] = (daily[m][d] ?? 0) + add;
    }
  }
  const denomByMuscle: Record<string, number> = {};
  const eps = 1e-6;
  for (const [m, series] of Object.entries(daily)) {
    // create ordered date list
    const dates = Object.keys(series).sort();
    // build moving sum
    let maxSum = 0;
    for (let i = 0; i < dates.length; i++) {
      let sum = 0;
      const startDate = new Date(dates[i]);
      const endDate = new Date(startDate.getTime() + (windowDays - 1) * 86400000);
      for (const d of dates) {
        const dd = new Date(d);
        if (dd >= startDate && dd <= endDate) sum += series[d];
      }
      if (sum > maxSum) maxSum = sum;
    }
    denomByMuscle[m] = Math.max(maxSum, eps);
  }

  // progression via e1RM (median delta)
  const progByMuscle: Record<string, number> = {};
  // Fetch exercises to map to muscles
  const exercises = await db.exercises.toArray();
  const exMap = new Map<string, Exercise>();
  for (const e of exercises) exMap.set(e.id, e);

  // collect e1rm records current+prev periods
  const rangeCurrent = (() => {
    if (period === "last") {
      // use last workout day
      const last = completed.sort((a,b)=>a.startedAt<b.startedAt?1:-1)[0];
      if (!last) return null;
      const d = new Date(last.startedAt);
      return { start: new Date(d.getFullYear(), d.getMonth(), d.getDate()), end: new Date(d.getFullYear(), d.getMonth(), d.getDate()) };
    }
    const r = periodRange(period);
    return { start: r.start ?? new Date(0), end: r.end };
  })();
  if (rangeCurrent) {
    const days = Math.max(1, Math.ceil((rangeCurrent.end.getTime() - rangeCurrent.start.getTime())/86400000));
    const prevStart = new Date(rangeCurrent.start.getTime() - days*86400000);
    const prevEnd = new Date(rangeCurrent.start.getTime() - 86400000);

    const curRows = await db.exercise_e1rm.toArray();
    const prevRows = curRows; // same table read; we'll filter
    const curByExercise = new Map<string, number>();
    const prevByExercise = new Map<string, number>();

    for (const r of curRows) {
      const d = new Date(r.date);
      if (d >= rangeCurrent.start && d <= rangeCurrent.end) {
        const v = curByExercise.get(r.exerciseId) ?? 0;
        if (r.e1rm > v) curByExercise.set(r.exerciseId, r.e1rm);
      }
    }
    for (const r of prevRows) {
      const d = new Date(r.date);
      if (d >= prevStart && d <= prevEnd) {
        const v = prevByExercise.get(r.exerciseId) ?? 0;
        if (r.e1rm > v) prevByExercise.set(r.exerciseId, r.e1rm);
      }
    }

    // aggregate per muscle via weighted median-like average
    const perMuscleVals: Record<string, number[]> = {};
    for (const [exId, val] of curByExercise.entries()) {
      const ex = exMap.get(exId);
      if (!ex) continue;
      for (const [m, pct] of Object.entries(ex.muscles)) {
        const contrib = val * (pct / 100);
        (perMuscleVals[m] = perMuscleVals[m] ?? []).push(contrib);
      }
    }
    const perMusclePrev: Record<string, number[]> = {};
    for (const [exId, val] of prevByExercise.entries()) {
      const ex = exMap.get(exId);
      if (!ex) continue;
      for (const [m, pct] of Object.entries(ex.muscles)) {
        const contrib = val * (pct / 100);
        (perMusclePrev[m] = perMusclePrev[m] ?? []).push(contrib);
      }
    }

    for (const m of new Set([...Object.keys(perMuscleVals), ...Object.keys(perMusclePrev)])) {
      const curList = (perMuscleVals[m] ?? []).sort((a,b)=>a-b);
      const prevList = (perMusclePrev[m] ?? []).sort((a,b)=>a-b);
      const median = (arr: number[]) => {
        if (arr.length === 0) return 0;
        const mid = Math.floor(arr.length/2);
        return arr.length % 2 ? arr[mid] : (arr[mid-1]+arr[mid])/2;
      };
      const curMed = median(curList);
      const prevMed = median(prevList);
      const delta = prevMed > 0 ? (curMed - prevMed) / prevMed : (curMed > 0 ? 0.2 : 0); // assume +20% if new signal
      const clamped = Math.max(-0.2, Math.min(0.2, delta));
      const mapped = (clamped + 0.2) / 0.4; // 0..1
      progByMuscle[m] = mapped;
    }
  }

  const out: Record<string, MuscleAgg> = {};
  for (const m of Object.keys({ ...volByMuscle, ...denomByMuscle, ...progByMuscle })) {
    const vol = volByMuscle[m] ?? 0;
    const denom = denomByMuscle[m] ?? 1e-6;
    const volNorm = Math.max(0, Math.min(1, vol / denom));
    const prog = Math.max(0, Math.min(1, progByMuscle[m] ?? 0));
    const score = 0.6 * volNorm + 0.4 * prog;
    out[m] = { volume: vol, volNorm, prog, score };
    // cache write
    const id = `${period}:${m}`;
    await db.muscle_agg_cache.put({
      id,
      periodKey: period,
      muscle: m,
      volNorm,
      prog,
      score,
      updatedAt: new Date().toISOString(),
    });
  }
  return out;
}

export async function computeTrend(period: PeriodKey): Promise<TrendPoint[]> {
  const { start, end } = periodRange(period);
  const s = start ?? new Date(0);
  const days = Math.max(1, Math.ceil((end.getTime() - s.getTime())/86400000));
  const groupDaily = days <= 31;

  // completed workouts in range
  const completed = await db.workouts.where("status").equals("completed").toArray();
  const inRangeIds = completed
    .filter(w => (start ?? new Date(0)) <= new Date(w.startedAt) && new Date(w.startedAt) <= end)
    .map(w => w.id);

  const sets = [];
  for (const id of inRangeIds) {
    sets.push(...await db.sets.where("workoutId").equals(id).toArray());
  }

  const agg: Record<string, number> = {};
  for (const se of sets) {
    const key = groupDaily ? ymd(new Date(se.createdAt)) : `${new Date(se.createdAt).getFullYear()}-W${weekOfYear(new Date(se.createdAt))}`;
    agg[key] = (agg[key] ?? 0) + se.effectiveVolume;
  }

  return Object.entries(agg).sort((a,b)=>a[0] < b[0] ? -1 : 1).map(([k,v]) => ({ date: k, volume: Number(v.toFixed(2)) }));
}

function weekOfYear(date: Date): number {
  const firstJan = new Date(date.getFullYear(),0,1);
  const pastDays = Math.floor((date.getTime() - firstJan.getTime())/86400000);
  return Math.ceil((pastDays + firstJan.getDay()+1)/7);
}

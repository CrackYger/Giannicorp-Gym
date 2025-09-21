import { db } from "../db";
import type { Exercise, ExerciseTargets, PRRow, PRCategory, SetEntry, Workout } from "../../shared/types";
import { getPrefs } from "./prefs";
import { getSettings } from "./settings";
import { setTargets, getTargets } from "./targets";
import { upsertPR, bestPR } from "./prs";
import { estimateE1RM } from "./e1rm";
import { roundToStep } from "../../shared/lib/utils";

type EvalResult = {
  exercise: Exercise;
  bestSet?: SetEntry;
  suggestion: ExerciseTargets;
  prs: PRRow[];
  summary: { totalVolume: number; avgRpe: number; };
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0,10);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

async function getStep(exerciseId: string): Promise<number> {
  const prefs = await getPrefs();
  const s = await getSettings(exerciseId);
  return s?.incrementStep ?? prefs.roundingStep ?? 0.5;
}

async function getRepWindow(exerciseId: string): Promise<{low: number; high: number; rpeTarget: number}> {
  const s = await getSettings(exerciseId);
  return {
    low: s?.repWindowLow ?? 8,
    high: s?.repWindowHigh ?? 12,
    rpeTarget: s?.rpeTarget ?? 8,
  };
}

function approxEqual(a: number, b: number, tol = 0.25): boolean {
  return Math.abs(a - b) <= tol;
}

function pickBestSet(sets: SetEntry[]): SetEntry | undefined {
  let best: SetEntry | undefined;
  let bestE1 = -1;
  for (const s of sets) {
    if (s.warmup || s.isWorking === false) continue;
    const e = (s.weight * (1 + s.reps / 30)); // epley
    if (e > bestE1) {
      bestE1 = e;
      best = s;
    }
  }
  return best;
}

async function computeSuggestion(exercise: Exercise, sets: SetEntry[]): Promise<ExerciseTargets> {
  const best = pickBestSet(sets);
  const now = new Date().toISOString();
  const step = await getStep(exercise.id);
  const { low, high } = await getRepWindow(exercise.id);
  const current = await getTargets(exercise.id);
  let nextWeight = (best?.weight ?? current?.nextWeight ?? 0);
  let nextLow = current?.nextRepsLow ?? low;
  let nextHigh = current?.nextRepsHigh ?? high;

  if (best) {
    const r = best.reps;
    const rpe = best.rpe;
    let deltaSteps = 0;
    let deloadPct = 0;

    // base rule: increase reps until upper bound; then +1 step weight
    if (r >= high) {
      deltaSteps = 1;
      nextLow = low;
      nextHigh = high;
    } else {
      // target one more rep up to high
      nextLow = Math.min(high, r + 1);
      nextHigh = high;
    }

    // RPE modifiers
    if (rpe <= 7) deltaSteps += 2;
    else if (rpe >= 7.5 && rpe <= 8.5) deltaSteps += 0;
    else if (rpe > 8.5 && rpe <= 9.5) {
      // hold (if already planning weight increase, micro increase instead)
      deltaSteps = Math.min(deltaSteps, 0.5);
    } else if (rpe > 9.5) {
      deloadPct = (r < low - 1 ? 0.10 : 0.075); // hard fail → 10%, sonst 7.5%
    }

    if (deloadPct > 0) {
      nextWeight = Math.max(0, roundToStep(best.weight * (1 - deloadPct), step));
      nextLow = low;
      nextHigh = high;
    } else {
      nextWeight = roundToStep(best.weight + step * deltaSteps, step);
    }
  }

  return {
    exerciseId: exercise.id,
    nextWeight,
    nextRepsLow: nextLow,
    nextRepsHigh: nextHigh,
    updatedAt: now,
  };
}

async function detectPRs(exercise: Exercise, workout: Workout, sets: SetEntry[]): Promise<PRRow[]> {
  const day = dayKey(new Date(workout.startedAt));
  const prs: PRRow[] = [];
  // e1RM (best of day)
  let bestE = 0;
  let bestSet: SetEntry | undefined;
  for (const s of sets) {
    if (s.warmup || s.isWorking === false) continue;
    const e = estimateE1RM(s.weight, s.reps);
    if (e > bestE) { bestE = e; bestSet = s; }
  }
  if (bestSet) {
    const prev = await bestPR(exercise.id, "e1rm");
    if (bestE > prev) {
      prs.push({
        id: `${exercise.id}:e1rm:${day}`,
        exerciseId: exercise.id,
        category: "e1rm",
        value: Number(bestE.toFixed(2)),
        meta: { setWeight: bestSet.weight, setReps: bestSet.reps },
        setId: bestSet.id,
        workoutId: workout.id,
        date: day,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // rep@weight and weight@reps and volume
  const byWeight: Map<number, number> = new Map(); // weight -> max reps
  const byReps: Map<number, number> = new Map();   // reps -> max weight
  let bestVol = 0;
  let bestVolSet: SetEntry | undefined;

  for (const s of sets) {
    if (s.warmup || s.isWorking === false) continue;
    // reps at (approx) weight
    let foundKey: number | null = null;
    for (const k of byWeight.keys()) {
      if (Math.abs(k - s.weight) <= 0.25) { foundKey = k; break; }
    }
    const wKey = foundKey ?? s.weight;
    byWeight.set(wKey, Math.max(byWeight.get(wKey) ?? 0, s.reps));

    // weight at reps
    byReps.set(s.reps, Math.max(byReps.get(s.reps) ?? 0, s.weight));

    // volume
    if (s.effectiveVolume > bestVol) { bestVol = s.effectiveVolume; bestVolSet = s; }
  }

  // rep@weight PRs (best across weights, compare to previous by exact weight key)
  for (const [wKey, reps] of byWeight.entries()) {
    const cat: PRCategory = "rep_at_weight";
    const prev = (await db.prs.where({ exerciseId: exercise.id, category: cat }).toArray())
      .filter(r => Math.abs((r.meta?.weight as number ?? 0) - wKey) <= 0.25)
      .reduce((m, r) => Math.max(m, r.value), 0);
    if (reps > prev) {
      const set = sets.find(s => Math.abs(s.weight - wKey) <= 0.25 && s.reps === reps && !s.warmup && s.isWorking !== false);
      const sid = set?.id ?? (bestSet?.id ?? sets[0]?.id!);
      prs.push({
        id: `${exercise.id}:rep_at_weight:${day}`,
        exerciseId: exercise.id,
        category: cat,
        value: reps,
        meta: { weight: Number(wKey.toFixed(2)) },
        setId: sid,
        workoutId: workout.id,
        date: day,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // weight@reps PRs
  for (const [reps, weight] of byReps.entries()) {
    const cat: PRCategory = "weight_at_reps";
    const prev = (await db.prs.where({ exerciseId: exercise.id, category: cat }).toArray())
      .filter(r => (r.meta?.reps as number ?? 0) === reps)
      .reduce((m, r) => Math.max(m, r.value), 0);
    if (weight > prev) {
      const set = sets.find(s => s.reps === reps && !s.warmup && s.isWorking !== false && approxEqual(s.weight, weight));
      const sid = set?.id ?? (bestSet?.id ?? sets[0]?.id!);
      prs.push({
        id: `${exercise.id}:weight_at_reps:${day}`,
        exerciseId: exercise.id,
        category: cat,
        value: Number(weight.toFixed(2)),
        meta: { reps },
        setId: sid,
        workoutId: workout.id,
        date: day,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // volume PR
  if (bestVolSet) {
    const cat: PRCategory = "volume";
    const prev = await bestPR(exercise.id, cat);
    if (bestVolSet.effectiveVolume > prev) {
      prs.push({
        id: `${exercise.id}:volume:${day}`,
        exerciseId: exercise.id,
        category: cat,
        value: Number(bestVolSet.effectiveVolume.toFixed(2)),
        meta: { weight: bestVolSet.weight, reps: bestVolSet.reps },
        setId: bestVolSet.id,
        workoutId: workout.id,
        date: day,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // enforce one PR per category per day: reduce duplicates
  const unique: Record<string, PRRow> = {};
  for (const p of prs) { unique[`${p.category}`] = p; }
  return Object.values(unique);
}

export async function previewProgressionForWorkout(workoutId: string) {
  const w = await db.workouts.get(workoutId);
  if (!w) return { list: [], prs: [], summary: { totalVolume: 0, avgRpe: 0 } };
  const setsAll = await db.sets.where("workoutId").equals(workoutId).toArray();
  const byEx = new Map<string, SetEntry[]>();
  for (const s of setsAll) {
    const arr = byEx.get(s.exerciseId) ?? [];
    arr.push(s);
    byEx.set(s.exerciseId, arr);
  }
  const list: EvalResult[] = [];
  let totalVol = 0;
  let rpeSum = 0, rpeCount = 0;
  const allPRs: PRRow[] = [];
  for (const [exId, sets] of byEx.entries()) {
    const ex = await db.exercises.get(exId);
    if (!ex) continue;
    for (const s of sets) {
      totalVol += s.effectiveVolume;
      if (!s.warmup && s.isWorking !== false) { rpeSum += s.rpe; rpeCount++; }
    }
    const suggestion = await computeSuggestion(ex, sets);
    const prs = await detectPRs(ex, w, sets);
    allPRs.push(...prs);
    list.push({ exercise: ex, bestSet: pickBestSet(sets), suggestion, prs, summary: { totalVolume: 0, avgRpe: 0 } });
  }
  const summary = { totalVolume: Number(totalVol.toFixed(2)), avgRpe: rpeCount ? Number((rpeSum/rpeCount).toFixed(2)) : 0 };
  return { list, prs: allPRs, summary };
}

export async function finalizeProgressionForWorkout(workoutId: string): Promise<{ achievedPrs: number; }> {
  const w = await db.workouts.get(workoutId);
  if (!w) return { achievedPrs: 0 };
  const preview = await previewProgressionForWorkout(workoutId);
  // write targets
  for (const row of preview.list) {
    await setTargets(row.suggestion);
  }
  // write PRs
  for (const pr of preview.prs) {
    await upsertPR(pr);
  }
  // write summary
  const next: Workout = {
    ...w,
    summary: {
      totalVolume: preview.summary.totalVolume,
      avgRpe: preview.summary.avgRpe,
      achievedPrs: preview.prs.length,
    },
  };
  await db.workouts.put(next);
  return { achievedPrs: preview.prs.length };
}

import { db } from "../db";
import type { PeriodKey, PRRow, Workout, SetEntry } from "../../shared/types";
import { getPrefs, markBadgesRetroDone } from "./prefs";

function uuid(): string { return (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2); }

export type BadgeCode = "pr_hunter" | "volume_streak" | "heatmap_master";

async function alreadyAwarded(code: BadgeCode, sinceISO: string): Promise<boolean> {
  const items = await db.badges.where("code").equals(code).toArray();
  const since = new Date(sinceISO).getTime();
  return items.some(b => new Date(b.awardedAt).getTime() >= since);
}

export async function checkBadgesAfterWorkout(workoutId: string): Promise<BadgeCode[]> {
  const awarded: BadgeCode[] = [];
  const got = await Promise.all([awardPrHunter(), awardVolumeStreak(), awardHeatmapMaster()]);
  for (const code of got) if (code) awarded.push(code);
  return awarded;
}

export async function retroAwardBadges(): Promise<void> {
  const prefs = await getPrefs();
  if (prefs.badgesRetroDoneAt) return;
  await awardPrHunter(90);
  await awardVolumeStreak(90);
  await awardHeatmapMaster(90);
  await markBadgesRetroDone();
}

// --- Individual badges ---

async function awardPrHunter(lookbackDays = 14): Promise<BadgeCode | null> {
  const since = Date.now() - lookbackDays * 86400000;
  const prs: PRRow[] = await db.prs.toArray();
  const count = prs.filter(p => new Date(p.date).getTime() >= since).length;
  if (count >= 5) {
    // avoid duplicate award in the same window
    const sinceISO = new Date(since).toISOString();
    if (!(await alreadyAwarded("pr_hunter", sinceISO))) {
      await db.badges.put({
        id: uuid(),
        userId: "local",
        code: "pr_hunter",
        awardedAt: new Date().toISOString(),
        periodFrom: new Date(since).toISOString(),
        periodTo: new Date().toISOString(),
        meta: { count }
      } as any);
      return "pr_hunter";
    }
  }
  return null;
}

async function awardVolumeStreak(lookbackDays = 30): Promise<BadgeCode | null> {
  const prefs = await getPrefs();
  const target = prefs.target_sets_per_week ?? 45;

  const since = Date.now() - lookbackDays * 86400000;
  const sets: SetEntry[] = await db.sets.toArray();
  const inRange = sets.filter(s => new Date(s.createdAt).getTime() >= since);

  // group by calendar week (ISO) for last 3 weeks
  const byWeek = new Map<string, number>();
  function isoWeek(d: Date): string {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
  }

  for (const s of inRange) {
    if (s.warmup) continue;
    const w = isoWeek(new Date(s.createdAt));
    byWeek.set(w, (byWeek.get(w) || 0) + 1);
  }

  // check last 3 full weeks including current
  const now = new Date();
  const weeks: string[] = [];
  const ref = new Date(now);
  for (let i=0;i<3;i++){
    const w = isoWeek(ref);
    weeks.unshift(w);
    ref.setDate(ref.getDate() - 7);
  }
  const ok = weeks.every(w => (byWeek.get(w) || 0) >= target);
  if (ok) {
    const sinceISO = new Date(since).toISOString();
    if (!(await alreadyAwarded("volume_streak", sinceISO))) {
      await db.badges.put({
        id: uuid(),
        userId: "local",
        code: "volume_streak",
        awardedAt: new Date().toISOString(),
        periodFrom: new Date(since).toISOString(),
        periodTo: new Date().toISOString(),
        meta: { weeks: weeks.map(w => ({ week: w, sets: byWeek.get(w)||0 })), target }
      } as any);
      return "volume_streak";
    }
  }
  return null;
}

async function awardHeatmapMaster(lookbackDays = 30): Promise<BadgeCode | null> {
  const prefs = await getPrefs();
  const thr = prefs.heatmap_green_threshold ?? 0.5;
  const targetPct = prefs.heatmap_target_green_pct ?? 0.7;

  const since = Date.now() - lookbackDays * 86400000;
  const sets: SetEntry[] = await db.sets.toArray();
  const inRange = sets.filter(s => new Date(s.createdAt).getTime() >= since);

  // Approximate "segment score" using effectiveVolume normalized to 90d max per segment
  const vol: Record<string, number> = {};
  const vol90: Record<string, number> = {};
  const since90 = Date.now() - 90 * 86400000;
  const sets90 = sets.filter(s => new Date(s.createdAt).getTime() >= since90);

  function addVol(map: Record<string, number>, key: string, v: number) {
    map[key] = (map[key] || 0) + v;
  }

  function musclesToKeys(targetMuscles: Record<string, number>, side: string): string[] {
    // Map canonical muscle names to keys (L/R where appropriate)
    const keys: string[] = [];
    for (const name of Object.keys(targetMuscles)) {
      const n = name.toLowerCase();
      if (/(lat|lats)/.test(n)) keys.push("lats");
      else if (/front.*delt/.test(n)) keys.push("front_delts");
      else if (/side.*delt/.test(n)) keys.push("side_delts");
      else if (/rear.*delt/.test(n)) keys.push("rear_delts");
      else if (/bicep/.test(n)) keys.push("biceps");
      else if (/tricep/.test(n)) keys.push("triceps");
      else if (/forearm/.test(n)) keys.push("forearms");
      else if (/quad/.test(n)) keys.push("quads");
      else if (/ham/.test(n)) keys.push("hamstrings");
      else if (/glute/.test(n)) keys.push("glutes");
      else if (/calf/.test(n)) keys.push("calves");
      else if (/abs|oblique/.test(n)) keys.push("abs");
      else if (/chest|pect/.test(n)) keys.push("chest");
      else if (/upper.*back/.test(n)) keys.push("upper_back");
      else if (/lower.*back/.test(n)) keys.push("lower_back");
      else if (/trap/.test(n)) keys.push("traps");
    }
    return keys;
  }

  for (const s of sets90) {
    const volSet = s.effectiveVolume || (s.weight * s.reps);
    const sideFactor = s.side === "both" ? 0.5 : 1;
    for (const key of musclesToKeys(s.targetMuscles || {}, s.side)) {
      addVol(vol90, key, volSet * sideFactor);
    }
  }
  for (const s of inRange) {
    const volSet = s.effectiveVolume || (s.weight * s.reps);
    const sideFactor = s.side === "both" ? 0.5 : 1;
    for (const key of musclesToKeys(s.targetMuscles || {}, s.side)) {
      addVol(vol, key, volSet * sideFactor);
    }
  }

  const vals = Object.values(vol);
  if (vals.length === 0) return null;
  const maxMapVal = Math.max(...Object.values(vol90).concat([1]));
  const greenCount = Object.keys(vol).filter(k => (vol[k] / (maxMapVal || 1)) >= thr).length;
  const pct = greenCount / Object.keys(vol).length;
  if (pct >= targetPct) {
    const sinceISO = new Date(since).toISOString();
    if (!(await alreadyAwarded("heatmap_master", sinceISO))) {
      await db.badges.put({
        id: uuid(),
        userId: "local",
        code: "heatmap_master",
        awardedAt: new Date().toISOString(),
        periodFrom: new Date(since).toISOString(),
        periodTo: new Date().toISOString(),
        meta: { thr, pct }
      } as any);
      return "heatmap_master";
    }
  }
  return null;
}

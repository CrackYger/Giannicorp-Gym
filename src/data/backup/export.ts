import { db } from "../db";
import type { BackupPayload, Prefs, SetEntry, Workout } from "../../shared/types";
import { getPrefs, setExportOptions } from "../stores/prefs";

function ymd(d: Date): string {
  return d.toISOString().slice(0,10);
}

function filename(date = new Date()): string {
  return `giannicorp-gym-backup_${ymd(date)}.json`;
}

function withinRange(dateISO: string, days: number): boolean {
  const t = new Date(dateISO).getTime();
  const since = Date.now() - days * 86400000;
  return t >= since;
}

export async function buildBackup(options?: { scope?: "all" | "30" | "90" | "365"; excludeWarmups?: boolean }): Promise<{ fileName: string; json: BackupPayload }> {
  const prefs: Prefs = await getPrefs();
  const scope = options?.scope ?? prefs.exportScope ?? "all";
  const excludeWarmups = options?.excludeWarmups ?? prefs.excludeWarmupsInExport ?? false;
  const days = scope === "all" ? Infinity : Number(scope);

  const [exercises, templates, workouts, sets, settings, targets, prs, e1rm] = await Promise.all([
    db.exercises.toArray(),
    db.templates.toArray(),
    db.workouts.toArray(),
    db.sets.toArray(),
    db.exercise_settings.toArray(),
    db.exercise_targets.toArray(),
    db.prs.toArray(),
    db.exercise_e1rm.toArray(),
  ]);

  const filteredWorkouts = days === Infinity ? workouts : workouts.filter((w: Workout) => withinRange(w.startedAt, days));
  const workoutIds = new Set(filteredWorkouts.map(w => w.id));
  let filteredSets = sets.filter(s => workoutIds.has(s.workoutId));
  if (excludeWarmups) filteredSets = filteredSets.filter((s: SetEntry) => !s.warmup && s.isWorking !== false);

  const payload: BackupPayload = {
    meta: { app: "Giannicorp Gym", version: "v0.6.0", schema: 6, exported_at: new Date().toISOString() },
    data: {
      profiles: [], spaces: [], memberships: [],
      exercises, templates,
      workouts: filteredWorkouts,
      sets: filteredSets,
      exercise_settings: settings,
      exercise_targets: targets,
      prs, exercise_e1rm: e1rm,
    },
  };

  await setExportOptions(scope === "all" ? "all" : (String(days) as any), excludeWarmups);

  return { fileName: filename(), json: payload };
}

export async function downloadBackup(options?: { scope?: "all" | "30" | "90" | "365"; excludeWarmups?: boolean }): Promise<void> {
  const { fileName, json } = await buildBackup(options);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

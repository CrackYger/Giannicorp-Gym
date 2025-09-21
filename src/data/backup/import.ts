import { db } from "../db";
import type { BackupPayload, Exercise } from "../../shared/types";
import { buildBackup, downloadBackup } from "./export";

export type ImportPreview = {
  ok: boolean;
  schema: number;
  counts: Record<string, number>;
  warnings: string[];
};

export async function parseBackupFile(file: File, onProgress?: (pct: number) => void): Promise<BackupPayload> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onabort = () => reject(new Error("Lesen abgebrochen"));
    fr.onprogress = (e) => { if (onProgress && e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
    fr.onload = () => {
      try {
        const json = JSON.parse(String(fr.result || "{}"));
        resolve(json);
      } catch (e) {
        reject(e);
      }
    };
    fr.readAsText(file);
  });
}

export async function previewBackup(data: BackupPayload): Promise<ImportPreview> {
  const schema = Number(data?.meta?.schema ?? 0);
  const curr = 6;
  const warnings: string[] = [];
  if (schema < curr) warnings.push("Backup-Schema ist älter. Import wird konvertiert (so gut wie möglich).");
  if (schema > curr) warnings.push("Backup-Schema ist neuer. Nicht alle Felder werden evtl. importiert.");

  const counts: Record<string, number> = {};
  for (const [k, v] of Object.entries(data.data)) counts[k] = Array.isArray(v) ? v.length : 0;

  return { ok: true, schema, counts, warnings };
}

function lww(local?: { updatedAt?: string | null }, incoming?: { updatedAt?: string | null }): boolean {
  const l = local?.updatedAt ? new Date(local.updatedAt).getTime() : -1;
  const r = incoming?.updatedAt ? new Date(incoming.updatedAt).getTime() : 0;
  return r >= l;
}

export async function importBackup(data: BackupPayload, { dryRun = false } = {}): Promise<{ imported: Record<string, number> }> {
  // Block if active workout exists
  const active = await db.workouts.where("status").equals("active").first();
  if (active) throw new Error("Import während eines aktiven Workouts nicht möglich. Bitte Workout abschließen.");

  const imported: Record<string, number> = {
    exercises: 0, templates: 0, workouts: 0, sets: 0, exercise_settings: 0, exercise_targets: 0, prs: 0, exercise_e1rm: 0,
  };

  if (dryRun) return { imported };

  // auto local backup
  await downloadBackup({ scope: "all", excludeWarmups: false });

  // dedupe helpers
  const exKey = (e: Exercise) => `${"space_id" in (e as any) ? (e as any).space_id : "local"}::${e.name.toLowerCase()}`;
  const existingExercises = await db.exercises.toArray();
  const exIndex = new Map(existingExercises.map(e => [exKey(e), e.id]));

  await db.transaction("rw", db.exercises, db.templates, db.workouts, db.sets, db.exercise_settings, db.exercise_targets, db.prs, db.exercise_e1rm, async () => {
    // exercises (dedupe by (space_id, name))
    for (const e of data.data.exercises) {
      const key = exKey(e as any);
      const foundId = exIndex.get(key);
      if (foundId && lww(await db.exercises.get(foundId) as any, e as any)) {
        await db.exercises.put({ ...e, id: foundId });
      } else if (!foundId) {
        await db.exercises.put(e as any);
        exIndex.set(key, (e as any).id);
      }
      imported.exercises++;
    }

    // templates (straight upsert)
    for (const t of data.data.templates) {
      await db.templates.put(t as any);
      imported.templates++;
    }

    // workouts
    for (const w of data.data.workouts) {
      await db.workouts.put(w as any);
      imported.workouts++;
    }

    // sets (optionally could filter warmups based on prefs; but import keeps as in file)
    for (const s of data.data.sets) {
      await db.sets.put(s as any);
      imported.sets++;
    }

    for (const r of data.data.exercise_settings) {
      await db.exercise_settings.put(r as any);
      imported.exercise_settings++;
    }
    for (const r of data.data.exercise_targets) {
      await db.exercise_targets.put(r as any);
      imported.exercise_targets++;
    }
    for (const r of data.data.prs) {
      await db.prs.put(r as any);
      imported.prs++;
    }
    for (const r of data.data.exercise_e1rm) {
      await db.exercise_e1rm.put(r as any);
      imported.exercise_e1rm++;
    }
  });

  return { imported };
}

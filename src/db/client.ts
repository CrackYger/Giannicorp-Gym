import Dexie, { Table } from "dexie";
import type { Exercise, WorkoutSet, Template, MuscleAggCache, AppLog, PendingChange, SyncStatusRow } from "./schema";
import { formatISO } from "../lib/time/iso";
import { quotaEvents } from "../lib/events/emitter";

export const SCHEMA_VERSION = 10;

export class AppDB extends Dexie {
  exercises!: Table<Exercise, string>;
  sets!: Table<WorkoutSet, string>;
  templates!: Table<Template, string>;
  badges!: Table<any, string>;
  invites!: Table<any, string>;
  coach_notes!: Table<any, string>;
  exercise_settings!: Table<any, string>;
  exercise_targets!: Table<any, string>;
  muscle_agg_cache!: Table<MuscleAggCache, number>;
  logs!: Table<AppLog, number>;
  pending_changes!: Table<PendingChange, number>;
  sync_status!: Table<SyncStatusRow, number>;
  constructor() {
    super("giannicorp_gym");
    this.version(SCHEMA_VERSION).stores({
      exercises: "id, name, sidedness, updated_at",
      sets: "id, workout_id, exercise_id, performed_at, side, is_warmup, is_working, updated_at",
      templates: "id, name, shared, updated_at",
      badges: "id, user_id, awarded_at",
      invites: "id, space_id, code, role, created_at",
      coach_notes: "id, user_id, workout_id, created_at",
      exercise_settings: "id, exercise_id, key, updated_at",
      exercise_targets: "id, exercise_id, metric, updated_at",
      muscle_agg_cache: "++id, cache_key, updated_at",
      logs: "++id, ts, level",
      pending_changes: "++id, table, op, pk, ts",
      sync_status: "++id, key, updated_at",
    }).upgrade(async (tx) => {
      const now = formatISO(new Date());
      try {
        const ex = await tx.table("exercises").toArray();
        for (const e of ex) {
          const anyE: any = e;
          if (!anyE.sidedness) { anyE.sidedness = "bilateral"; anyE.updated_at = now; await tx.table("exercises").put(anyE); }
        }
        const sets = await tx.table("sets").toArray();
        for (const s of sets) {
          const anyS: any = s; let changed = false;
          if (!anyS.side) { anyS.side = "both"; changed = true; }
          if (typeof anyS.is_warmup !== "boolean") { anyS.is_warmup = false; changed = true; }
          if (typeof anyS.is_working !== "boolean") { anyS.is_working = !(anyS.is_warmup === true); changed = true; }
          if (changed) { anyS.updated_at = now; await tx.table("sets").put(anyS); }
        }
        const templates = await tx.table("templates").toArray();
        for (const t of templates) {
          const anyT: any = t;
          if (typeof anyT.shared !== "boolean") { anyT.shared = false; anyT.updated_at = now; await tx.table("templates").put(anyT); }
        }
      } catch (err) { throw err; }
    });
  }
}
export const db = new AppDB();
export async function openDB(): Promise<AppDB> {
  try { await db.open(); return db; }
  catch (err: any) {
    const name = err?.name ?? "OpenFailedError";
    if (name === "QuotaExceededError" || name === "VersionError" || name === "OpenFailedError") {
      quotaEvents.emit("quota_error", { name, message: err?.message ?? String(err), when: formatISO(new Date()) });
      return db;
    }
    throw err;
  }
}
export async function withRw<T>(fn: (db: AppDB) => Promise<T>): Promise<T> {
  return db.transaction("rw", db.exercises, db.sets, db.templates, db.badges, db.invites, db.coach_notes, db.exercise_settings, db.exercise_targets, db.muscle_agg_cache, db.logs, db.pending_changes, db.sync_status, async () => fn(db));
}

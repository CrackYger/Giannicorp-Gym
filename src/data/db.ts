import Dexie, { type Table } from "dexie";
import type {
  User, Exercise, Workout, SetEntry, Template, Prefs,
  ExerciseE1RM, MuscleAggCache, ExerciseSettings, ExerciseTargets, PRRow
, Plan, PlanDay, PlanDayExercise } from "../shared/types";

export interface SyncState {
  table: string;
  last_pulled_at?: string | null;
  last_pushed_at?: string | null;
}

export interface PendingChange {
  id: string;           // `${table}:${localId}:${ts}`
  table: string;
  op: "insert" | "update" | "delete";
  record: any;          // JSON payload
  updated_at: string;   // local timestamp; server will set its own clock
}

export interface SyncConflict {
  id: string;           // `${table}:${localId}:${ts}`
  table: string;
  op: string;
  reason: string;
  record: any;
  created_at: string;
}

class GymDB extends Dexie {
  plans!: Table<Plan, string>;
  plan_days!: Table<PlanDay, string>;
  plan_day_exercises!: Table<PlanDayExercise, string>;
  users!: Table<User, string>;
  exercises!: Table<Exercise>;
  workouts!: Table<Workout, string>;
  sets!: Table<SetEntry>;
  templates!: Table<Template, string>;
  prefs!: Table<Prefs, number>;
  exercise_e1rm!: Table<ExerciseE1RM, string>;
  muscle_agg_cache!: Table<MuscleAggCache, string>;
  exercise_settings!: Table<ExerciseSettings, string>;
  exercise_targets!: Table<ExerciseTargets, string>;
  prs!: Table<PRRow, string>;
  badges!: Table<any, string>;

  sync_state!: Table<SyncState, string>;
  _pending_changes!: Table<PendingChange, string>;
  _sync_conflicts!: Table<SyncConflict, string>;

  constructor() {
    super("giannicorp_gym_db");

    this.version(1).stores({
      users: "id, createdAt",
      exercises: "id, name, isFavorite, lastUsedAt",
      workouts: "id, status, startedAt, endedAt",
      sets: "id, workoutId, exerciseId, createdAt",
      templates: "id, name, suggested",
      prefs: "id",
    });

    this.version(2).stores({
      users: "id, createdAt",
      exercises: "id, name, isFavorite, lastUsedAt",
      workouts: "id, status, startedAt, endedAt",
      sets: "id, workoutId, exerciseId, createdAt",
      templates: "id, name, suggested",
      prefs: "id",
    });

    this.version(3).stores({
      users: "id, createdAt",
      exercises: "id, name, isFavorite, lastUsedAt",
      workouts: "id, status, startedAt, endedAt",
      sets: "id, workoutId, exerciseId, createdAt",
      templates: "id, name, suggested",
      prefs: "id",
      exercise_e1rm: "id, exerciseId, date",
      muscle_agg_cache: "id, periodKey, muscle, updatedAt",
    });

    this.version(4).stores({
      users: "id, createdAt",
      exercises: "id, name, isFavorite, lastUsedAt",
      workouts: "id, status, startedAt, endedAt",
      sets: "id, workoutId, exerciseId, createdAt",
      templates: "id, name, suggested",
      prefs: "id",
      exercise_e1rm: "id, exerciseId, date",
      muscle_agg_cache: "id, periodKey, muscle, updatedAt",
      exercise_settings: "exerciseId, updatedAt",
      exercise_targets: "exerciseId, updatedAt",
      prs: "id, exerciseId, category, date, createdAt",
    });

    this.version(5).stores({
      users: "id, createdAt",
      exercises: "id, name, isFavorite, lastUsedAt",
      workouts: "id, status, startedAt, endedAt",
      sets: "id, workoutId, exerciseId, createdAt",
      templates: "id, name, suggested",
      prefs: "id",
      exercise_e1rm: "id, exerciseId, date",
      muscle_agg_cache: "id, periodKey, muscle, updatedAt",
      exercise_settings: "exerciseId, updatedAt",
      exercise_targets: "exerciseId, updatedAt",
      prs: "id, exerciseId, category, date, createdAt",
      sync_state: "table",
      _pending_changes: "id, table, updated_at",
      _sync_conflicts: "id, table, created_at",
    }).upgrade(() => {
      // no-op: initialize empty sync tables
    });

    
  this.version(6).stores({
    users: "id, createdAt",
exercises: "id, name, isFavorite, lastUsedAt, sidedness",
workouts: "id, status, startedAt, endedAt",
sets: "id, workoutId, exerciseId, createdAt",
templates: "id, name, suggested",
prefs: "id",
exercise_e1rm: "id, exerciseId, date",
muscle_agg_cache: "id, periodKey, muscle, updatedAt",
exercise_settings: "exerciseId, updatedAt",
exercise_targets: "exerciseId, updatedAt",
prs: "id, exerciseId, category, date, createdAt",
badges: "id, userId, code, awardedAt",
sync_state: "table",
_pending_changes: "id, table, updated_at",
_sync_conflicts: "id, table, created_at",

  }).upgrade(async (tx) => {
    // Backfill default side on legacy sets
    await tx.table("sets").toCollection().modify((s: any) => {
      if (s.side == null) s.side = "both";
    });
  });

  this.version(7).stores({
    plans: "id, name, updated_at, archived",
    plan_days: "id, plan_id, order",
    plan_day_exercises: "id, plan_day_id, order",
    exercises: "id, name, isFavorite, lastUsedAt, slug, name_de, equipment, mechanics, category, searchKey"
  }).upgrade(async (tx) => {
    const exTable = tx.table("exercises");
    await exTable.toCollection().modify((e: any) => {
      const deaccent = (s: string) => s?.toLowerCase()?.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
      const parts: string[] = [];
      if (e.slug) parts.push(e.slug);
      if (e.name) parts.push(e.name);
      if (e.name_de) parts.push(e.name_de);
      if (Array.isArray(e.alt_names)) parts.push(...e.alt_names);
      if (e.equipment) parts.push(e.equipment);
      if (e.mechanics) parts.push(e.mechanics);
      e.searchKey = deaccent(parts.join(" "));
      if (!e.side_mode) e.side_mode = "both";
    });
  });

  }
}

export const db = new GymDB();

export type UUID = string;

export type ThemeMode = "dark" | "light";
export type Units = "kg" | "lbs";


export type Equipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "kettlebell" | "bands" | "other" | "ez";
export type Category = "compound" | "isolation" | "warmup";
export type Mechanics = "hinge" | "squat" | "push" | "pull" | "carry" | "rotation" | "anti-rotation";
export type SideMode = "both" | "left_right" | "separate";
export type SelectedView = "front" | "back";

export type WorkoutStatus = "active" | "completed" | "discarded";

export interface User {
  id: UUID;
  createdAt: string;
}

export interface Exercise {
  id: UUID;
  name: string;
  muscles: Record<string, number>;
  isFavorite: boolean;
  lastUsedAt?: string | null;
  // v0.12
  slug?: string;
  name_de?: string;
  alt_names?: string[];
  equipment?: Equipment;
  category?: Category;
  mechanics?: Mechanics;
  unilateral?: boolean;
  side_mode?: SideMode;
  rep_range_default?: { low: number; high: number } | null;
  rpe_target_default?: number | null;
  increment_kg?: number | null;
  searchKey?: string | null;
}

export interface WorkoutSummary {
  totalVolume: number;
  avgRpe: number;
  achievedPrs: number;
}

export interface Workout {
  id: UUID;
  status: WorkoutStatus;
  startedAt: string;
  endedAt?: string | null;
  notes?: string | null;
  summary?: WorkoutSummary;
}

export interface SetEntry {
  id: UUID;
  workoutId: UUID;
  exerciseId: UUID;
  createdAt: string;
  weight: number;
  reps: number;
  rpe: number;
  warmup: boolean;
  isWorking?: boolean;
  restSeconds?: number | null;
  notes?: string | null;
  effectiveVolume: number;
  targetMuscles: Record<string, number>;
}

export interface TemplateBlock {
  exercise: {
    name: string;
    muscles: Record<string, number>;
    isFavorite?: boolean;
  };
  targetSets: number;
  targetReps: number;
  targetRpeMin: number;
  targetRpeMax: number;
  note?: string;
}

export interface Template {
  id: UUID;
  name: string;
  suggested: boolean;
  blocks: TemplateBlock[];
}

export type PeriodKey = "last" | "7" | "14" | "30" | "90" | "180" | "365" | "all";

export interface Prefs {
  id: number;
  theme: ThemeMode;
  units: Units;
  defaultRpe: number;
  roundingStep: number;
  quickRestPresets: number[];
  selectedPeriod?: PeriodKey;
  excludeWarmups?: boolean;

  // v0.6.0
  exportScope?: "all" | "30" | "90" | "365";
  excludeWarmupsInExport?: boolean;
  lastExportAt?: string | null;

  // v0.7.1 UI Prefs
  selected_view?: SelectedView;
}

export interface ExerciseE1RM {
  id: string;
  exerciseId: UUID;
  date: string;
  e1rm: number;
}

export interface MuscleAggCache {
  id: string;
  periodKey: PeriodKey;
  muscle: string;
  volNorm: number;
  prog: number;
  score: number;
  updatedAt: string;
}

export interface ExerciseSettings {
  exerciseId: UUID;
  incrementStep?: number;
  repWindowLow?: number;
  repWindowHigh?: number;
  rpeTarget?: number;
  updatedAt: string;
}

export interface ExerciseTargets {
  exerciseId: UUID;
  nextWeight: number;
  nextRepsLow: number;
  nextRepsHigh: number;
  updatedAt: string;
}

export type PRCategory = "e1rm" | "rep_at_weight" | "weight_at_reps" | "volume";

export interface PRRow {
  id: string;
  exerciseId: UUID;
  category: PRCategory;
  value: number;
  meta: Record<string, unknown>;
  setId: UUID;
  workoutId: UUID;
  date: string;
  createdAt: string;
}

// Backup
export interface BackupMeta {
  app: "Giannicorp Gym";
  version: string; // app version string
  schema: number;  // local schema version
  exported_at: string; // ISO
}

export interface BackupPayload {
  meta: BackupMeta;
  data: {
    profiles: any[];
    spaces: any[];
    memberships: any[];
    exercises: Exercise[];
    templates: Template[];
    workouts: Workout[];
    sets: SetEntry[];
    exercise_settings: ExerciseSettings[];
    exercise_targets: ExerciseTargets[];
    prs: PRRow[];
    exercise_e1rm: ExerciseE1RM[];
  };
}


export interface Plan {
  id: UUID;
  name: string;
  notes: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}
export interface PlanDay {
  id: UUID;
  plan_id: string;
  name: string;
  order: number;
  weekdays: number[] | null;
}
export interface PlanDayExerciseDefaults {
  sets: number;
  reps_low: number;
  reps_high: number;
  rpe: number;
  rest_sec: number;
  warmup_sets: boolean;
  notes?: string;
}
export interface PlanDayExercise {
  id: UUID;
  plan_day_id: string;
  exercise_slug: string;
  order: number;
  defaults: PlanDayExerciseDefaults;
}

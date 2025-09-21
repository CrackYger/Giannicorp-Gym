import type { UUID, ISODateTime, Sidedness, Side } from "../types/global";
export interface Exercise { id: UUID; name: string; primary_muscle?: string; secondary_muscles?: string[]; sidedness: Sidedness; created_at?: ISODateTime; updated_at?: ISODateTime; }
export interface WorkoutSet { id: UUID; workout_id: UUID; exercise_id: UUID; performed_at: ISODateTime; side: Side; reps: number; weight: number; rpe?: number | null; rest_sec?: number | null; is_warmup: boolean; is_working: boolean; notes?: string | null; created_at?: ISODateTime; updated_at?: ISODateTime; }
export interface Template { id: UUID; name: string; shared: boolean; data: unknown; created_at?: ISODateTime; updated_at?: ISODateTime; }
export interface Badge { id: UUID; user_id: UUID; space_id?: UUID | null; code: string; awarded_at: ISODateTime; period_from?: ISODateTime | null; period_to?: ISODateTime | null; meta?: Record<string, unknown> | null; }
export interface Invite { id: UUID; space_id: UUID; code: string; role: "owner" | "coach" | "member"; created_at: ISODateTime; used_by?: UUID | null; used_at?: ISODateTime | null; }
export interface CoachNote { id: UUID; user_id: UUID; workout_id?: UUID | null; note: string; created_at: ISODateTime; }
export interface ExerciseSetting { id: UUID; exercise_id: UUID; key: string; value: unknown; updated_at: ISODateTime; }
export interface ExerciseTarget { id: UUID; exercise_id: UUID; metric: "volume" | "sets" | "reps" | "weight"; value: number; period_days: number; updated_at: ISODateTime; }
export interface MuscleAggCache { id?: number; cache_key: string; updated_at: ISODateTime; payload: unknown; }
export type LogLevel = "info" | "warn" | "error";
export interface AppLog { id?: number; ts: ISODateTime; level: LogLevel; message: string; stack?: string | null; meta?: Record<string, unknown> | null; }
export interface PendingChange { id?: number; table: string; op: "insert" | "update" | "delete"; pk: string; payload: unknown; ts: ISODateTime; }
export interface SyncStatusRow { id?: number; key: string; value: unknown; updated_at: ISODateTime; }
export interface DBSchema { exercises: Exercise; sets: WorkoutSet; templates: Template; badges: Badge; invites: Invite; coach_notes: CoachNote; exercise_settings: ExerciseSetting; exercise_targets: ExerciseTarget; muscle_agg_cache: MuscleAggCache; logs: AppLog; pending_changes: PendingChange; sync_status: SyncStatusRow; }

// v0.7.0: data extensions for L/R heatmap and badges
import type { Exercise, SetEntry, UUID } from "./index";

/** Whether an exercise is bilateral, unilateral, or can be performed either way */
export type Sidedness = "bilateral" | "unilateral" | "either";

/** Which side a set belongs to */
export type Side = "left" | "right" | "both";

/** Optional extension of Exercise for v0.7.0 */
export type ExerciseRowV2 = Exercise & {
  /** If omitted, treat as "either" */
  sidedness?: Sidedness;
};

/** Extension of SetEntry for v0.7.0 */
export type SetEntryRowV2 = SetEntry & {
  /** Defaults to "both" for legacy rows */
  side: Side;
};

/** Badges awarded to users (local/Dexie representation) */
export interface Badge {
  id: UUID;
  spaceId: UUID;
  userId: UUID;
  code: string;
  awardedAt: string;      // ISO timestamp
  periodFrom?: string | null;
  periodTo?: string | null;
  meta: Record<string, unknown>;
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}

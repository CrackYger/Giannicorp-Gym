import { db } from "../db";
import type { ExerciseE1RM } from "../../shared/types";

export function estimateE1RM(weight: number, reps: number): number {
  // Epley formula: 1RM ~= w * (1 + reps/30)
  return Number((weight * (1 + reps / 30)).toFixed(2));
}

export async function upsertDailyE1RM(exerciseId: string, date: string, value: number): Promise<void> {
  const id = `${exerciseId}:${date}`;
  const existing = await db.exercise_e1rm.get(id);
  if (!existing || value > existing.e1rm) {
    const row: ExerciseE1RM = { id, exerciseId, date, e1rm: existing ? Math.max(existing.e1rm, value) : value };
    await db.exercise_e1rm.put(row);
  }
}

import { db } from "../db";
import type { ExerciseTargets } from "../../shared/types";

export async function getTargets(exerciseId: string): Promise<ExerciseTargets | undefined> {
  return db.exercise_targets.get(exerciseId);
}

export async function setTargets(row: ExerciseTargets): Promise<void> {
  await db.exercise_targets.put(row);
}

export async function listTargets(limit = 5): Promise<ExerciseTargets[]> {
  const all = await db.exercise_targets.orderBy("updatedAt").reverse().toArray();
  return all.slice(0, limit);
}

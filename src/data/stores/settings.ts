import { db } from "../db";
import type { ExerciseSettings } from "../../shared/types";

export async function getSettings(exerciseId: string): Promise<ExerciseSettings | undefined> {
  return db.exercise_settings.get(exerciseId);
}

export async function upsertSettings(exerciseId: string, partial: Partial<Omit<ExerciseSettings, "exerciseId" | "updatedAt">>): Promise<void> {
  const existing = await db.exercise_settings.get(exerciseId);
  const next: ExerciseSettings = {
    exerciseId,
    incrementStep: existing?.incrementStep,
    repWindowLow: existing?.repWindowLow,
    repWindowHigh: existing?.repWindowHigh,
    rpeTarget: existing?.rpeTarget,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  await db.exercise_settings.put(next);
}

import { EXERCISE_SYNONYMS } from "../exerciseSynonyms";
import { db } from "../db";
import type { Exercise } from "../../shared/types";
import { normalizeMuscleMap } from "../../shared/lib/muscles";
import { uid } from "../../shared/lib/utils";

export async function createExercise(input: Omit<Exercise, "id" | "lastUsedAt">): Promise<Exercise> {
  const ex: Exercise = { ...input, id: uid(), lastUsedAt: null };
  ex.muscles = normalizeMuscleMap(ex.muscles);
  await db.exercises.put(ex);
  return ex;
}

export async function upsertExerciseByName(name: string, muscles: Record<string, number>, isFavorite = false) {
  const existing = await db.exercises.where("name").equalsIgnoreCase(name).first();
  if (existing) {
    if (Object.keys(muscles).length > 0) {
      existing.muscles = normalizeMuscleMap(muscles);
    }
    existing.isFavorite = existing.isFavorite || isFavorite;
    await db.exercises.put(existing);
    return existing;
  }
  return createExercise({ name, muscles, isFavorite });
}

export async function listExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy("name").toArray();
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const q = deaccent(query.trim());
  if (!q) return listExercises();
  const all = await listExercises();
  const tokens = q.split(/\s+/).filter(Boolean).flatMap(t => {
    const base = t.toLowerCase();
    const syns = EXERCISE_SYNONYMS[base] || [];
    return [base, ...syns];
  });
  return all.filter((e) => {
    const key = ((e as any).searchKey || buildSearchKey(e)).toLowerCase();
    return tokens.every(t => key.includes(t) || key.split(/\s+/).some(w => w.startsWith(t)));
  });
}


export async function toggleFavorite(exerciseId: string): Promise<void> {
  const e = await db.exercises.get(exerciseId);
  if (!e) return;
  await db.exercises.put({ ...e, isFavorite: !e.isFavorite });
}

export async function markUsed(exerciseId: string): Promise<void> {
  const e = await db.exercises.get(exerciseId);
  if (!e) return;
  await db.exercises.put({ ...e, lastUsedAt: new Date().toISOString() });
}

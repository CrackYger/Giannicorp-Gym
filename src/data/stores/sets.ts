import { db } from "../db";
import type { SetEntry } from "../../shared/types";
import { uid } from "../../shared/lib/utils";
import { getPrefs } from "./prefs";
import { clamp, roundToStep } from "../../shared/lib/utils";

export async function listSetsForWorkout(workoutId: string): Promise<SetEntry[]> {
  return db.sets.where("workoutId").equals(workoutId).sortBy("createdAt");
}

export async function listSetsForExercise(workoutId: string, exerciseId: string): Promise<SetEntry[]> {
  const all = await listSetsForWorkout(workoutId);
  return all.filter((s) => s.exerciseId === exerciseId);
}

export function computeEffectiveVolume(weight: number, reps: number, warmup: boolean, isWorking = true): number {
  if (warmup || !isWorking) return 0;
  return Number((weight * reps).toFixed(2));
}

export async function createSet(input: Omit<SetEntry, "id" | "createdAt" | "effectiveVolume" | "isWorking">): Promise<SetEntry> {
  const prefs = await getPrefs();
  const weight = Math.max(0, roundToStep(input.weight, prefs.roundingStep));
  const reps = clamp(input.reps, 1, 50);
  const rpe = Math.round(input.rpe * 2) / 2;
  const warmup = !!input.warmup;
  const isWorking = !warmup;
  const s: SetEntry = {
    ...input,
    side: (input as any).side ?? "both",
    id: uid(),
    createdAt: new Date().toISOString(),
    weight,
    reps,
    rpe,
    warmup,
    isWorking,
    effectiveVolume: computeEffectiveVolume(weight, reps, warmup, isWorking),
  };
  await db.sets.put(s);
  return s;
}

export async function updateSet(id: string, partial: Partial<Omit<SetEntry, "id" | "workoutId" | "exerciseId" | "createdAt">>): Promise<void> {
  const existing = await db.sets.get(id);
  if (!existing) return;
  const prefs = await getPrefs();
  const next = { ...existing, ...partial };
  next.weight = Math.max(0, roundToStep(next.weight, prefs.roundingStep));
  next.reps = clamp(next.reps, 1, 50);
  next.rpe = Math.round(next.rpe * 2) / 2;
  // If warmup flips to true, force isWorking=false
  if (partial.warmup === true) next.isWorking = false;
  if (partial.warmup === false && typeof partial.isWorking === "undefined") {
    next.isWorking = true;
  }
  next.effectiveVolume = computeEffectiveVolume(next.weight, next.reps, next.warmup, next.isWorking ?? true);
  await db.sets.put(next);
}

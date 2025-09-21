import { db } from "../db";
import type { Exercise, Template, Workout, PlanDay, PlanDayExercise } from "../../shared/types";
import { uid } from "../../shared/lib/utils";
import { upsertExerciseByName, markUsed } from "./exercises";
import { estimateE1RM, upsertDailyE1RM } from "./e1rm";
import { finalizeProgressionForWorkout } from "./progression";

export async function getActiveWorkout(): Promise<Workout | undefined> {
  return db.workouts.where("status").equals("active").first();
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  return db.workouts.get(id);
}

export async function listCompletedWorkouts(): Promise<Workout[]> {
  const arr = await db.workouts.where("status").equals("completed").toArray();
  return arr.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)); // desc
}

export async function startNewWorkout(): Promise<Workout> {
  const active = await getActiveWorkout();
  if (active) return active;
  const w: Workout = {
    id: uid(),
    status: "active",
    startedAt: new Date().toISOString(),
    notes: null,
    endedAt: null,
  };
  await db.workouts.put(w);
  return w;
}

export async function startFromTemplate(t: Template): Promise<Workout> {
  const w = await startNewWorkout();
  for (const b of t.blocks) {
    const ex = await upsertExerciseByName(b.exercise.name, b.exercise.muscles, !!b.exercise.isFavorite);
    await markUsed(ex.id);
  }
  return w;
}

export async function completeWorkout(id: string): Promise<void> {
  const w = await db.workouts.get(id);
  if (!w) return;
  const end = new Date().toISOString();
  await db.workouts.put({ ...w, status: "completed", endedAt: end });

  // e1RM best per exercise for the day
  const sets = await db.sets.where("workoutId").equals(id).toArray();
  const byExercise = new Map<string, number>();
  for (const s of sets) {
    if (s.warmup || s.isWorking === false) continue;
    const e = estimateE1RM(s.weight, s.reps);
    const prev = byExercise.get(s.exerciseId) ?? 0;
    if (e > prev) byExercise.set(s.exerciseId, e);
  }
  if (byExercise.size > 0) {
    const date = (w.startedAt ?? end).slice(0, 10);
    for (const [exerciseId, best] of byExercise.entries()) {
      await upsertDailyE1RM(exerciseId, date, best);
    }
  }

  // Progression & PRs
  await finalizeProgressionForWorkout(id);
}

export async function discardWorkout(id: string): Promise<void> {
  const w = await db.workouts.get(id);
  if (!w) return;
  await db.transaction("rw", db.sets, db.workouts, async () => {
    const sets = await db.sets.where("workoutId").equals(id).toArray();
    for (const s of sets) await db.sets.delete(s.id);
    await db.workouts.put({ ...w, status: "discarded", endedAt: new Date().toISOString() });
  });
}

export async function workoutExercises(id: string): Promise<Exercise[]> {
  const sets = await db.sets.where("workoutId").equals(id).toArray();
  const exIds = Array.from(new Set(sets.map((s) => s.exerciseId)));
  const result: Exercise[] = [];
  for (const exId of exIds) {
    const e = await db.exercises.get(exId);
    if (e) result.push(e);
  }
  return result;
}


export async function startFromPlanDay(plan_day_id: string): Promise<Workout> {
  const w = await startNewWorkout();
  const xs = await db.plan_day_exercises.where("plan_day_id").equals(plan_day_id).sortBy("order");
  for (const x of xs) {
    const exName = (x as any).exercise_slug || "Unbenannte Übung";
    const e = await upsertExerciseByName(exName, {}, false);
    await markUsed(e.id);
    for (let s=0; s<(x.defaults?.sets ?? 3); s++) {
      await db.sets.put({
        id: uid(),
        workoutId: w.id,
        exerciseId: e.id,
        createdAt: new Date().toISOString(),
        side: "both",
        warmup: !!x.defaults?.warmup_sets && s===0,
        isWorking: !(!!x.defaults?.warmup_sets && s===0),
        weight: 0,
        reps: x.defaults?.reps_high ?? 10,
        rpe: x.defaults?.rpe ?? 8,
        restSec: x.defaults?.rest_sec ?? 120,
        note: x.defaults?.notes ?? null,
      } as any);
    }
  }
  return w;
}

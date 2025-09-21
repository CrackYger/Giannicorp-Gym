
import { db } from "../db";
import type { Plan, PlanDay, PlanDayExercise, PlanDayExerciseDefaults } from "../../shared/types";
import { uid } from "../../shared/lib/utils";

export async function createPlan(name: string, notes: string = ""): Promise<Plan> {
  const now = new Date().toISOString();
  const p: Plan = { id: uid(), name, notes, archived: false, created_at: now, updated_at: now };
  await db.plans.put(p);
  return p;
}

export async function listPlans(): Promise<Plan[]> {
  return db.plans.orderBy('updated_at').reverse().toArray();
}

export async function getPlan(id: string): Promise<Plan | undefined> {
  return db.plans.get(id);
}

export async function renamePlan(id: string, name: string): Promise<void> {
  const p = await db.plans.get(id); if (!p) return;
  await db.plans.put({ ...p, name, updated_at: new Date().toISOString() });
}

export async function duplicatePlan(id: string): Promise<Plan | undefined> {
  const p = await db.plans.get(id); if (!p) return;
  const now = new Date().toISOString();
  const copy: Plan = { ...p, id: uid(), name: p.name + " (Kopie)", created_at: now, updated_at: now, archived: false };
  await db.transaction('rw', db.plans, db.plan_days, db.plan_day_exercises, async () => {
    await db.plans.put(copy);
    const days = await db.plan_days.where('plan_id').equals(p.id).toArray();
    const idMap = new Map<string,string>();
    for (const d of days) {
      const nd: PlanDay = { ...d, id: uid(), plan_id: copy.id };
      idMap.set(d.id, nd.id);
      await db.plan_days.put(nd);
    }
    for (const d of days) {
      const exs = await db.plan_day_exercises.where('plan_day_id').equals(d.id).toArray();
      for (const x of exs) {
        const nx: PlanDayExercise = { ...x, id: uid(), plan_day_id: idMap.get(d.id)! };
        await db.plan_day_exercises.put(nx);
      }
    }
  });
  return copy;
}

export async function archivePlan(id: string): Promise<void> {
  const p = await db.plans.get(id); if (!p) return;
  await db.plans.put({ ...p, archived: true, updated_at: new Date().toISOString() });
}

export async function addDay(plan_id: string, name: string): Promise<PlanDay> {
  const count = await db.plan_days.where('plan_id').equals(plan_id).count();
  const d: PlanDay = { id: uid(), plan_id, name, order: count, weekdays: null };
  await db.plan_days.put(d);
  return d;
}

export async function listPlanDays(plan_id: string): Promise<PlanDay[]> {
  return db.plan_days.where('plan_id').equals(plan_id).sortBy('order');
}

export async function renameDay(id: string, name: string): Promise<void> {
  const d = await db.plan_days.get(id); if (!d) return;
  await db.plan_days.put({ ...d, name });
}

export async function reorderDay(plan_id: string, fromIdx: number, toIdx: number): Promise<void> {
  const days = await listPlanDays(plan_id);
  const [moved] = days.splice(fromIdx, 1);
  days.splice(toIdx, 0, moved);
  for (let i=0;i<days.length;i++) {
    await db.plan_days.put({ ...days[i], order: i });
  }
}

export async function removeDay(id: string): Promise<void> {
  await db.transaction('rw', db.plan_day_exercises, db.plan_days, async () => {
    await db.plan_day_exercises.where('plan_day_id').equals(id).delete();
    await db.plan_days.delete(id);
  });
}

export async function addExerciseToDay(plan_day_id: string, exercise_slug: string, defaults: PlanDayExerciseDefaults): Promise<PlanDayExercise> {
  const order = await db.plan_day_exercises.where('plan_day_id').equals(plan_day_id).count();
  const x: PlanDayExercise = { id: uid(), plan_day_id, exercise_slug, order, defaults };
  await db.plan_day_exercises.put(x);
  return x;
}

export async function listDayExercises(plan_day_id: string): Promise<PlanDayExercise[]> {
  return db.plan_day_exercises.where('plan_day_id').equals(plan_day_id).sortBy('order');
}

export async function removeExerciseFromDay(id: string): Promise<void> {
  await db.plan_day_exercises.delete(id);
}

export async function reorderDayExercise(plan_day_id: string, fromIdx: number, toIdx: number): Promise<void> {
  const xs = await listDayExercises(plan_day_id);
  const [moved] = xs.splice(fromIdx, 1);
  xs.splice(toIdx, 0, moved);
  for (let i=0;i<xs.length;i++) await db.plan_day_exercises.put({ ...xs[i], order: i });
}

export async function ensureStarterPlans(): Promise<void> {
  const count = await db.plans.count();
  if (count > 0) return;
  const ppl = await createPlan("PPL (6 Tage)");
  const push = await addDay(ppl.id, "Push");
  const pull = await addDay(ppl.id, "Pull");
  const legs = await addDay(ppl.id, "Legs");
  await addDay(ppl.id, "Push 2");
  await addDay(ppl.id, "Pull 2");
  await addDay(ppl.id, "Legs 2");
  const add = (dayId: string, slug: string, sets=3, repsL=8, repsH=12, rpe=8, rest=120)=> addExerciseToDay(dayId, slug, { sets, reps_low: repsL, reps_high: repsH, rpe, rest_sec: rest, warmup_sets: false });
  await add(push.id, "barbell-bench-press", 4, 5, 8, 8, 180);
  await add(push.id, "overhead-press-barbell", 3, 5, 8, 8, 150);
  await add(push.id, "lateral-raise", 3, 12, 15, 8, 90);
  await add(push.id, "cable-triceps-pushdown", 3, 10, 12, 8, 90);
  await add(push.id, "cable-fly-mid", 3, 12, 15, 8, 90);
  await add(push.id, "dumbbell-bench-press", 3, 8, 12, 8, 120);

  await add(pull.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
  await add(pull.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
  await add(pull.id, "face-pull", 3, 12, 15, 8, 90);
  await add(pull.id, "dumbbell-curl", 3, 8, 12, 8, 90);
  await add(pull.id, "straight-arm-pulldown", 3, 10, 12, 8, 90);
  await add(pull.id, "shrugs", 3, 8, 12, 8, 90);

  await add(legs.id, "back-squat-high-bar", 4, 5, 8, 8, 180);
  await add(legs.id, "romanian-deadlift", 3, 6, 10, 8, 150);
  await add(legs.id, "leg-press", 3, 8, 12, 8, 150);
  await add(legs.id, "leg-extension", 3, 10, 15, 8, 90);
  await add(legs.id, "hamstring-curl", 3, 10, 15, 8, 90);
  await add(legs.id, "calf-raise-standing", 4, 10, 15, 8, 60);

  const ul = await createPlan("Upper/Lower (4 Tage)");
  const upper = await addDay(ul.id, "Upper");
  const lower = await addDay(ul.id, "Lower");
  await add(upper.id, "barbell-bench-press", 4, 5, 8, 8, 180);
  await add(upper.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
  await add(upper.id, "overhead-press-barbell", 3, 6, 10, 8, 150);
  await add(upper.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
  await add(upper.id, "lateral-raise", 3, 12, 15, 8, 90);
  await add(upper.id, "cable-triceps-pushdown", 3, 10, 12, 8, 90);

  await add(lower.id, "back-squat-high-bar", 4, 5, 8, 8, 180);
  await add(lower.id, "romanian-deadlift", 3, 6, 10, 8, 150);
  await add(lower.id, "leg-press", 3, 8, 12, 8, 150);
  await add(lower.id, "hamstring-curl", 3, 10, 15, 8, 90);
  await add(lower.id, "calf-raise-standing", 4, 10, 15, 8, 60);

  const fb = await createPlan("Ganzkörper (3 Tage)");
  const gk = await addDay(fb.id, "Full Body");
  await add(gk.id, "back-squat-high-bar", 4, 5, 8, 8, 180);
  await add(gk.id, "barbell-bench-press", 4, 5, 8, 8, 180);
  await add(gk.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
  await add(gk.id, "lateral-raise", 3, 12, 15, 8, 90);
  await add(gk.id, "hamstring-curl", 3, 10, 15, 8, 90);
  await add(gk.id, "calf-raise-standing", 4, 10, 15, 8, 60);
}



export async function createStarterTemplateByFrequency(freq: number): Promise<string> {
  if (freq <= 3) {
    // PPL (3 Tage)
    const plan = await createPlan("Starter: PPL (3 Tage)");
    const push = await addDay(plan.id, "Push");
    const pull = await addDay(plan.id, "Pull");
    const legs = await addDay(plan.id, "Legs");
    const add = (dayId: string, slug: string, sets=3, repsL=8, repsH=12, rpe=7.5, rest=90) =>
      addExerciseToDay(dayId, slug, { sets, reps_low: repsL, reps_high: repsH, rpe, rest_sec: rest, warmup_sets: false });
    await add(push.id, "barbell-bench-press", 4, 5, 8, 8, 180);
    await add(push.id, "overhead-press-barbell", 3, 6, 10, 8, 150);
    await add(push.id, "lateral-raise", 3, 12, 15, 8, 90);
    await add(pull.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
    await add(pull.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
    await add(pull.id, "face-pull", 3, 12, 15, 8, 90);
    await add(legs.id, "barbell-back-squat", 4, 5, 8, 8, 180);
    await add(legs.id, "romanian-deadlift-barbell", 3, 6, 10, 8, 150);
    await add(legs.id, "leg-extension", 3, 12, 15, 8, 90);
    return plan.id;
  } else if (freq === 4) {
    // UL/UL
    const plan = await createPlan("Starter: Upper/Lower (4 Tage)");
    const u1 = await addDay(plan.id, "Upper A");
    const l1 = await addDay(plan.id, "Lower A");
    const u2 = await addDay(plan.id, "Upper B");
    const l2 = await addDay(plan.id, "Lower B");
    const add = (dayId: string, slug: string, sets=3, repsL=8, repsH=12, rpe=8, rest=120) =>
      addExerciseToDay(dayId, slug, { sets, reps_low: repsL, reps_high: repsH, rpe, rest_sec: rest, warmup_sets: false });
    await add(u1.id, "barbell-bench-press", 4, 5, 8, 8, 180);
    await add(u1.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
    await add(u1.id, "overhead-press-barbell", 3, 6, 10, 8, 150);
    await add(l1.id, "barbell-back-squat", 4, 5, 8, 8, 180);
    await add(l1.id, "romanian-deadlift-barbell", 3, 6, 10, 8, 150);
    await add(l1.id, "leg-extension", 3, 12, 15, 8, 90);
    await add(u2.id, "dumbbell-bench-press", 3, 8, 12, 8, 120);
    await add(u2.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
    await add(u2.id, "face-pull", 3, 12, 15, 8, 90);
    await add(l2.id, "deadlift-trap-bar", 3, 5, 8, 8, 180);
    await add(l2.id, "leg-press", 3, 10, 12, 8, 120);
    await add(l2.id, "calf-raise", 3, 12, 15, 8, 90);
    return plan.id;
  } else {
    // 5–6: PPL PPL minimal
    const plan = await createPlan("Starter: PPL x2 (5–6 Tage)");
    const push = await addDay(plan.id, "Push");
    const pull = await addDay(plan.id, "Pull");
    const legs = await addDay(plan.id, "Legs");
    const push2 = await addDay(plan.id, "Push 2");
    const pull2 = await addDay(plan.id, "Pull 2");
    if (freq >= 6) { await addDay(plan.id, "Legs 2"); }
    const add = (dayId: string, slug: string, sets=3, repsL=8, repsH=12, rpe=8, rest=120) =>
      addExerciseToDay(dayId, slug, { sets, reps_low: repsL, reps_high: repsH, rpe, rest_sec: rest, warmup_sets: false });
    await add(push.id, "barbell-bench-press", 4, 5, 8, 8, 180);
    await add(push.id, "overhead-press-barbell", 3, 6, 10, 8, 150);
    await add(push.id, "lateral-raise", 3, 12, 15, 8, 90);
    await add(pull.id, "barbell-row-pendlay", 4, 5, 8, 8, 180);
    await add(pull.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
    await add(pull.id, "face-pull", 3, 12, 15, 8, 90);
    await add(legs.id, "barbell-back-squat", 4, 5, 8, 8, 180);
    await add(legs.id, "romanian-deadlift-barbell", 3, 6, 10, 8, 150);
    await add(legs.id, "leg-press", 3, 10, 12, 8, 120);
    await add(push2.id, "dumbbell-bench-press", 3, 8, 12, 8, 120);
    await add(push2.id, "cable-fly-mid", 3, 12, 15, 8, 90);
    await add(push2.id, "cable-triceps-pushdown", 3, 10, 12, 8, 90);
    await add(pull2.id, "t-bar-row", 3, 6, 10, 8, 150);
    await add(pull2.id, "lat-pulldown-neutral", 3, 8, 12, 8, 120);
    await add(pull2.id, "barbell-curl", 3, 10, 12, 8, 90);
    return plan.id;
  }
}


import { db } from "../db";
import type { Template, TemplateBlock } from "../../shared/types";
import { uid } from "../../shared/lib/utils";
import { normalizeMuscleMap } from "../../shared/lib/muscles";

export async function listTemplates(): Promise<Template[]> {
  return db.templates.orderBy("name").toArray();
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  return db.templates.get(id);
}

export async function createTemplate(input: Omit<Template, "id">): Promise<Template> {
  const t: Template = { ...input, id: uid() };
  t.blocks = t.blocks.map((b) => ({
    ...b,
    exercise: { ...b.exercise, muscles: normalizeMuscleMap(b.exercise.muscles) },
  }));
  await db.templates.put(t);
  return t;
}

export async function updateTemplate(id: string, partial: Partial<Omit<Template, "id">>): Promise<void> {
  const t = await db.templates.get(id);
  if (!t) return;
  const next: Template = { ...t, ...partial };
  if (partial.blocks) {
    next.blocks = partial.blocks.map((b) => ({
      ...b,
      exercise: { ...b.exercise, muscles: normalizeMuscleMap(b.exercise.muscles) },
    }));
  }
  await db.templates.put(next);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id);
}

export async function ensureSuggestedTemplates(): Promise<void> {
  const existing = await db.templates.where("suggested").equals(true).count();
  if (existing > 0) return;

  const mk = (name: string, blocks: TemplateBlock[]): Template => ({
    id: uid(),
    name,
    suggested: true,
    blocks,
  });

  const PPL_Push = mk("PPL — Push", [
    { exercise: { name: "Schrägbankdrücken KH", muscles: { chest: 60, front_delts: 25, triceps: 15 } }, targetSets: 4, targetReps: 8, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Schulterdrücken KH", muscles: { front_delts: 55, triceps: 25, side_delts: 20 } }, targetSets: 3, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Trizeps Pushdown", muscles: { triceps: 80, front_delts: 10, chest: 10 } }, targetSets: 3, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  const PPL_Pull = mk("PPL — Pull", [
    { exercise: { name: "Latziehen", muscles: { lats: 60, biceps: 30, forearms: 10 } }, targetSets: 4, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Rudern Maschine", muscles: { upper_back: 50, lats: 30, biceps: 20 } }, targetSets: 3, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Bizeps Curls KH", muscles: { biceps: 80, forearms: 20 } }, targetSets: 3, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  const PPL_Legs = mk("PPL — Legs", [
    { exercise: { name: "Beinpresse", muscles: { quads: 55, glutes: 25, hamstrings: 20 } }, targetSets: 4, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Beinstrecker", muscles: { quads: 90, core: 10 } }, targetSets: 3, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Beinbeuger", muscles: { hamstrings: 80, glutes: 20 } }, targetSets: 3, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  const Upper = mk("Oberkörper", [
    { exercise: { name: "Bankdrücken", muscles: { chest: 55, triceps: 25, front_delts: 20 } }, targetSets: 4, targetReps: 6, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Rudern Langhantel", muscles: { upper_back: 50, lats: 30, biceps: 20 } }, targetSets: 4, targetReps: 8, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Seitheben", muscles: { side_delts: 90, rear_delts: 10 } }, targetSets: 3, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  const Lower = mk("Unterkörper", [
    { exercise: { name: "Beinpresse", muscles: { quads: 55, glutes: 25, hamstrings: 20 } }, targetSets: 4, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Beinbeuger Maschine", muscles: { hamstrings: 80, glutes: 20 } }, targetSets: 4, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Wadenheben", muscles: { calves: 90, hamstrings: 10 } }, targetSets: 4, targetReps: 12, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  const Full = mk("Ganzkörper", [
    { exercise: { name: "Bankdrücken", muscles: { chest: 55, triceps: 25, front_delts: 20 } }, targetSets: 3, targetReps: 6, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Latziehen", muscles: { lats: 60, biceps: 30, forearms: 10 } }, targetSets: 3, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
    { exercise: { name: "Beinpresse", muscles: { quads: 55, glutes: 25, hamstrings: 20 } }, targetSets: 3, targetReps: 10, targetRpeMin: 7, targetRpeMax: 8.5 },
  ]);

  await db.templates.bulkPut([PPL_Push, PPL_Pull, PPL_Legs, Upper, Lower, Full]);
}

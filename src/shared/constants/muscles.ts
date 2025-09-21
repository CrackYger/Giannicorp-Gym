// 16 Muscle groups
export const MUSCLE_GROUPS = [
  "chest","upper_back","lats","front_delts","side_delts","rear_delts",
  "biceps","triceps","forearms","quads","hamstrings","glutes","calves",
  "abs","obliques","lower_back","traps"
] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const HEAT_COLORS: { threshold: number; color: string }[] = [
  { threshold: 0.05, color: "#7f1d1d" }, // dunkelrot
  { threshold: 0.25, color: "#dc2626" }, // rot
  { threshold: 0.5,  color: "#f59e0b" }, // gelblich
  { threshold: 0.8,  color: "#22c55e" }, // grün
  { threshold: 1.1,  color: "#14532d" }, // dunkelgrün (>=1 mapped to last)
];

export function colorForScore(score: number): string {
  const s = Math.max(0, Math.min(1, score));
  for (const stop of HEAT_COLORS) {
    if (s <= stop.threshold) return stop.color;
  }
  return HEAT_COLORS[HEAT_COLORS.length - 1].color;
}

export type Muscle =
  | "Chest" | "Upper Back" | "Lats" | "Front Delts" | "Side Delts" | "Rear Delts"
  | "Biceps" | "Triceps" | "Forearms" | "Quads" | "Hamstrings" | "Glutes"
  | "Calves" | "Abs/Obliques" | "Lower Back" | "Traps";

export const LEFT_RIGHT_MUSCLES: Muscle[] = [
  "Lats","Front Delts","Side Delts","Rear Delts","Biceps","Triceps","Forearms","Quads","Hamstrings","Glutes","Calves"
];

export const CENTRAL_MUSCLES: Muscle[] = ["Chest","Upper Back","Lower Back","Traps","Abs/Obliques"];

// SVG region ids (front/back + L/R). Ensure each ID appears exactly once across buckets.
export const REGION_IDS: Record<string, string[]> = {
  "front:left": ["flats","ffdelts","fsdelts","fbiceps","fforearms","fquads","fcalves"],
  "front:right": ["frlats","frdelts","fsdelts_r","fbiceps_r","fforearms_r","fquads_r","fcalves_r"],
  "front:center": ["fchest","fuppercore","ftraps","fabs"],
  "back:left": ["blats","breardelts","btriceps","bforearms","bhamstrings","bglutes","bcalves"],
  "back:right": ["brlats","breardelts_r","btriceps_r","bforearms_r","bhamstrings_r","bglutes_r","bcalves_r"],
  "back:center": ["bupperback","btraps_c","blowerback"],
};

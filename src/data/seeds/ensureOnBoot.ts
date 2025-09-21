
import { db } from "../../data/db";
import { createExercise } from "../../data/stores/exercises";

type Equip = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "kettlebell" | "bands" | "other" | "ez";
type Cat = "compound" | "isolation" | "warmup";
type Mech = "hinge" | "squat" | "push" | "pull" | "carry" | "rotation" | "anti-rotation";

interface SeedItem {
  slug: string;
  name: string;
  name_de: string;
  alt_names?: string[];
  equipment: Equip;
  category: Cat;
  mechanics: Mech;
  unilateral: boolean;
  side_mode: "both" | "left_right" | "separate";
  muscles: Record<string, number>;
}

const BASE_60: SeedItem[] = [
  { slug:"barbell-bench-press", name:"Barbell Bench Press", name_de:"Bankdrücken (Langhantel)", alt_names:["Bench Press"], equipment:"barbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug:"dumbbell-bench-press", name:"Dumbbell Bench Press", name_de:"Bankdrücken (Kurzhantel)", alt_names:["DB Bench"], equipment:"dumbbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:65, triceps:20, front_delts:15 } },
  { slug:"incline-barbell-bench-press", name:"Incline Barbell Bench Press", name_de:"Schrägbankdrücken (Langhantel)", alt_names:["Incline Bench"], equipment:"barbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:60, front_delts:25, triceps:15 } },
  { slug:"incline-dumbbell-bench-press", name:"Incline Dumbbell Bench Press", name_de:"Schrägbankdrücken (Kurzhantel)", alt_names:["Incline DB Bench"], equipment:"dumbbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:60, front_delts:25, triceps:15 } },
  { slug:"decline-bench-press", name:"Decline Bench Press", name_de:"Negativ-Bankdrücken (Langhantel)", alt_names:["Decline Bench"], equipment:"barbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug:"weighted-dips", name:"Weighted Dips", name_de:"Dips (zusätzliches Gewicht)", alt_names:["Dips"], equipment:"bodyweight", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:55, triceps:35, front_delts:10 } },
  { slug:"push-up", name:"Push-Up", name_de:"Liegestütz", alt_names:["Pushup"], equipment:"bodyweight", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:60, triceps:25, front_delts:15 } },
  { slug:"cable-fly-mid", name:"Cable Fly (Mid)", name_de:"Kabelzüge Fly (Brust, Mitte)", alt_names:["Cable Fly"], equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:90, front_delts:10 } },
  { slug:"pec-deck", name:"Pec Deck", name_de:"Butterfly (Pec Deck)", equipment:"machine", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:95, front_delts:5 } },
  { slug:"overhead-press-barbell", name:"Overhead Press (Barbell)", name_de:"Schulterdrücken (Langhantel)", alt_names:["OHP"], equipment:"barbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:45, side_delts:25, triceps:20, upper_back:10 } },
  { slug:"dumbbell-shoulder-press", name:"Dumbbell Shoulder Press", name_de:"Schulterdrücken (Kurzhantel)", equipment:"dumbbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:45, side_delts:25, triceps:20, upper_back:10 } },
  { slug:"lateral-raise", name:"Lateral Raise", name_de:"Seitheben", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ side_delts:85, traps:15 } },
  { slug:"cable-lateral-raise", name:"Cable Lateral Raise", name_de:"Seitheben (Kabel)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ side_delts:85, traps:15 } },
  { slug:"rear-delt-fly-reverse-pec-deck", name:"Rear Delt Fly (Reverse Pec Deck)", name_de:"Reverse Butterfly (hintere Schulter)", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ rear_delts:70, upper_back:30 } },
  { slug:"skull-crushers-ez", name:"Skull Crushers (EZ)", name_de:"French Press (SZ)", equipment:"ez", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:100 } },
  { slug:"cable-triceps-pushdown", name:"Cable Triceps Pushdown", name_de:"Trizepsdrücken (Kabel)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:100 } },
  { slug:"overhead-triceps-extension-db", name:"Overhead Triceps Extension (DB)", name_de:"Überkopf Trizepsdrücken (Kurzhantel)", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:100 } },

  { slug:"deadlift-conventional", name:"Conventional Deadlift", name_de:"Kreuzheben (konventionell)", equipment:"barbell", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ lower_back:35, hamstrings:30, glutes:25, lats:10 } },
  { slug:"romanian-deadlift", name:"Romanian Deadlift", name_de:"Rumänisches Kreuzheben", equipment:"barbell", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ hamstrings:50, glutes:35, lower_back:15 } },
  { slug:"barbell-row-pendlay", name:"Barbell Row (Pendlay)", name_de:"Rudern (Pendlay)", equipment:"barbell", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:45, upper_back:35, biceps:15, lower_back:5 } },
  { slug:"one-arm-dumbbell-row", name:"One-Arm DB Row", name_de:"Einarmiges Rudern (Kurzhantel)", equipment:"dumbbell", category:"compound", mechanics:"pull", unilateral:true, side_mode:"left_right", muscles:{ lats:55, upper_back:30, biceps:15 } },
  { slug:"chest-supported-row", name:"Chest-Supported Row", name_de:"Rudern (Brustgestützt)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:50, upper_back:35, biceps:15 } },
  { slug:"lat-pulldown-wide", name:"Lat Pulldown (Wide)", name_de:"Latziehen (weiter Griff)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:60, biceps:20, upper_back:20 } },
  { slug:"lat-pulldown-neutral", name:"Lat Pulldown (Neutral/V-Grip)", name_de:"Latziehen (Neutral/V-Griff)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:60, biceps:20, upper_back:20 } },
  { slug:"pull-up", name:"Pull-Up/Chin-Up (Weighted)", name_de:"Klimmzug (ggf. Zusatzgewicht)", equipment:"bodyweight", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:55, biceps:25, upper_back:20 } },
  { slug:"seated-cable-row-v", name:"Seated Cable Row (V-Grip)", name_de:"Rudern sitzend (V-Griff)", equipment:"cable", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:55, upper_back:35, biceps:10 } },
  { slug:"face-pull", name:"Face Pull", name_de:"Face Pull (Kabel)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ rear_delts:60, upper_back:40 } },
  { slug:"barbell-curl", name:"Barbell Curl", name_de:"Langhantelcurl", equipment:"barbell", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
  { slug:"dumbbell-curl", name:"Dumbbell Curl (Alt./Incline)", name_de:"Kurzhantelcurl (alternierend/Schrägbank)", equipment:"dumbbell", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
  { slug:"preacher-curl-ez", name:"Preacher Curl (EZ)", name_de:"Scott-Curl (SZ)", equipment:"ez", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
  { slug:"cable-curl", name:"Cable Curl (Straight/Rope)", name_de:"Kabelcurl (Stange/Seil)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
  { slug:"hammer-curl", name:"Hammer Curl", name_de:"Hammer-Curl", equipment:"dumbbell", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ brachialis:60, brachioradialis:25, biceps:15 } },

  { slug:"back-squat-high-bar", name:"Back Squat (High-Bar)", name_de:"Kniebeuge (High-Bar)", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug:"front-squat", name:"Front Squat", name_de:"Frontkniebeuge", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:65, glutes:25, hamstrings:10 } },
  { slug:"hack-squat", name:"Hack Squat", name_de:"Hackenschmidt", equipment:"machine", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:65, glutes:25, hamstrings:10 } },
  { slug:"leg-press", name:"Leg Press", name_de:"Beinpresse", equipment:"machine", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:60, glutes:30, hamstrings:10 } },
  { slug:"bulgarian-split-squat", name:"Bulgarian Split Squat", name_de:"Bulgarian Split Squat", equipment:"dumbbell", category:"compound", mechanics:"squat", unilateral:true, side_mode:"left_right", muscles:{ quads:50, glutes:40, hamstrings:10 } },
  { slug:"walking-lunge", name:"Walking Lunge", name_de:"Ausfallschritte gehend", equipment:"dumbbell", category:"compound", mechanics:"squat", unilateral:true, side_mode:"left_right", muscles:{ quads:45, glutes:40, hamstrings:15 } },
  { slug:"leg-extension", name:"Leg Extension", name_de:"Beinstrecker", equipment:"machine", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ quads:100 } },
  { slug:"hamstring-curl", name:"Hamstring Curl (Lying/Seated)", name_de:"Beinbeuger (liegend/sitzend)", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ hamstrings:100 } },
  { slug:"hip-thrust-barbell", name:"Hip Thrust (Barbell)", name_de:"Hip Thrust (Langhantel)", equipment:"barbell", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ glutes:70, hamstrings:20, quads:10 } },
  { slug:"glute-bridge", name:"Glute Bridge", name_de:"Glute Bridge", equipment:"bodyweight", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ glutes:70, hamstrings:20, lower_back:10 } },
  { slug:"good-morning", name:"Good Morning", name_de:"Good Morning", equipment:"barbell", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ lower_back:40, hamstrings:40, glutes:20 } },
  { slug:"calf-raise-standing", name:"Calf Raise (Standing)", name_de:"Wadenheben (stehend)", equipment:"machine", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ calves:100 } },
  { slug:"calf-raise-seated", name:"Seated Calf Raise", name_de:"Wadenheben (sitzend)", equipment:"machine", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ calves:100 } },

  { slug:"plank", name:"Plank", name_de:"Unterarmstütz (Plank)", equipment:"bodyweight", category:"warmup", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ abs:80, lower_back:20 } },
  { slug:"hanging-leg-raise", name:"Hanging Leg Raise", name_de:"Beinheben hängend", equipment:"bodyweight", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ abs:90, hip_flexors:10 } },
  { slug:"cable-crunch", name:"Cable Crunch", name_de:"Kabel-Crunch", equipment:"cable", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ abs:100 } },
  { slug:"pallof-press", name:"Pallof Press", name_de:"Pallof Press", equipment:"cable", category:"warmup", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ abs:70, obliques:30 } },
  { slug:"farmers-carry", name:"Farmer’s Carry", name_de:"Farmer's Walk", equipment:"dumbbell", category:"compound", mechanics:"carry", unilateral:true, side_mode:"separate", muscles:{ traps:30, forearms:30, abs:40 } },

  { slug:"upright-row-ez", name:"Upright Row (EZ)", name_de:"Aufrechtes Rudern (SZ)", equipment:"ez", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ side_delts:50, traps:40, front_delts:10 } },
  { slug:"shrugs", name:"Shrugs (DB/BB)", name_de:"Shrugs", equipment:"dumbbell", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ traps:90, upper_back:10 } },
  { slug:"straight-arm-pulldown", name:"Straight-Arm Pulldown", name_de:"Gerade Armzug (Kabel)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:85, rear_delts:15 } },
  { slug:"reverse-fly-cable", name:"Reverse Fly (Cable)", name_de:"Reverse Fly (Kabel)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ rear_delts:75, upper_back:25 } },

  { slug:"low-to-high-cable-fly", name:"Low-to-High Cable Fly", name_de:"Cable Fly (unten → oben)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:90, front_delts:10 } },
  { slug:"high-to-low-cable-fly", name:"High-to-Low Cable Fly", name_de:"Cable Fly (oben → unten)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:90, front_delts:10 } },

  { slug:"hip-abduction", name:"Hip Abduction", name_de:"Abduktoren-Maschine", equipment:"machine", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ glute_med:100 } },
  { slug:"hip-adduction", name:"Hip Adduction", name_de:"Adduktoren-Maschine", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ adductors:100 } },

  { slug:"concentration-curl", name:"Concentration Curl", name_de:"Konzentrationscurl", equipment:"dumbbell", category:"isolation", mechanics:"pull", unilateral:true, side_mode:"left_right", muscles:{ biceps:100 } },
  { slug:"overhead-cable-curl", name:"Overhead Cable Curl", name_de:"Überkopf Kabelcurl", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
];

const EXTRA: SeedItem[] = [
  { slug:"smith-bench-press", name:"Smith Bench Press", name_de:"Bankdrücken (Multipresse)", equipment:"machine", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug:"machine-chest-press", name:"Machine Chest Press", name_de:"Brustpresse (Maschine)", equipment:"machine", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:75, triceps:15, front_delts:10 } },
  { slug:"incline-machine-press", name:"Incline Machine Press", name_de:"Schrägbankpresse (Maschine)", equipment:"machine", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:65, front_delts:25, triceps:10 } },
  { slug:"decline-dumbbell-bench-press", name:"Decline Dumbbell Bench Press", name_de:"Negativ-Bankdrücken (Kurzhantel)", equipment:"dumbbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug:"dumbbell-fly", name:"Dumbbell Fly", name_de:"Kurzhantel-Fliegende", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:90, front_delts:10 } },
  { slug:"incline-dumbbell-fly", name:"Incline Dumbbell Fly", name_de:"Fliegende (Schrägbank)", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:85, front_delts:15 } },
  { slug:"squeeze-press-db", name:"DB Squeeze Press", name_de:"Squeeze Press (Kurzhantel)", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ chest:85, triceps:15 } },
  { slug:"diamond-push-up", name:"Diamond Push-Up", name_de:"Liegestütz (eng)", equipment:"bodyweight", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:50, chest:40, front_delts:10 } },
  { slug:"archer-push-up", name:"Archer Push-Up", name_de:"Archer Push-Up", equipment:"bodyweight", category:"compound", mechanics:"push", unilateral:true, side_mode:"separate", muscles:{ chest:55, triceps:25, front_delts:20 } },
  { slug:"front-raise-dumbbell", name:"Front Raise (DB)", name_de:"Frontheben (Kurzhantel)", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:85, traps:15 } },
  { slug:"front-raise-cable", name:"Front Raise (Cable)", name_de:"Frontheben (Kabel)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:85, traps:15 } },
  { slug:"lateral-raise-machine", name:"Lateral Raise (Machine)", name_de:"Seitheben (Maschine)", equipment:"machine", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ side_delts:90, traps:10 } },
  { slug:"arnold-press", name:"Arnold Press", name_de:"Arnold Press", equipment:"dumbbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:45, side_delts:25, triceps:20, upper_back:10 } },
  { slug:"machine-shoulder-press", name:"Machine Shoulder Press", name_de:"Schulterpresse (Maschine)", equipment:"machine", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ front_delts:45, side_delts:25, triceps:20, upper_back:10 } },
  { slug:"close-grip-bench-press", name:"Close-Grip Bench Press", name_de:"Bankdrücken (enger Griff)", equipment:"barbell", category:"compound", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:50, chest:40, front_delts:10 } },
  { slug:"overhead-triceps-extension-rope", name:"Overhead Triceps Extension (Rope)", name_de:"Überkopf Trizeps (Seil)", equipment:"cable", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:100 } },
  { slug:"triceps-kickback", name:"Triceps Kickback", name_de:"Trizeps-Kickback", equipment:"dumbbell", category:"isolation", mechanics:"push", unilateral:true, side_mode:"left_right", muscles:{ triceps:100 } },
  { slug:"skull-crushers-barbell", name:"Skull Crushers (Barbell)", name_de:"French Press (Langhantel)", equipment:"barbell", category:"isolation", mechanics:"push", unilateral:false, side_mode:"both", muscles:{ triceps:100 } },

  { slug:"t-bar-row", name:"T-Bar Row", name_de:"T-Bar Rudern", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:45, upper_back:35, biceps:15, lower_back:5 } },
  { slug:"machine-row-high", name:"High Row (Machine)", name_de:"High Row (Maschine)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:45, upper_back:40, biceps:15 } },
  { slug:"cable-row-wide", name:"Cable Row (Wide)", name_de:"Kabelrudern (weiter Griff)", equipment:"cable", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:50, upper_back:35, biceps:15 } },
  { slug:"single-arm-cable-row", name:"Single-Arm Cable Row", name_de:"Einarmiges Kabelrudern", equipment:"cable", category:"compound", mechanics:"pull", unilateral:true, side_mode:"left_right", muscles:{ lats:55, upper_back:30, biceps:15 } },
  { slug:"machine-pullover", name:"Machine Pullover", name_de:"Pullover (Maschine)", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:85, chest:10, triceps:5 } },
  { slug:"lat-pulldown-close", name:"Lat Pulldown (Close Grip)", name_de:"Latziehen (enger Griff)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:60, biceps:20, upper_back:20 } },
  { slug:"lat-pulldown-underhand", name:"Lat Pulldown (Underhand)", name_de:"Latziehen (Untergriff)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:55, biceps:25, upper_back:20 } },
  { slug:"assisted-pull-up", name:"Assisted Pull-Up", name_de:"Klimmzug (unterstützt)", equipment:"machine", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:55, biceps:25, upper_back:20 } },
  { slug:"inverted-row", name:"Inverted Row", name_de:"Umgekehrtes Rudern", equipment:"bodyweight", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:45, upper_back:40, biceps:15 } },
  { slug:"seal-row", name:"Seal Row", name_de:"Seal Row (Langhantel)", equipment:"barbell", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:45, upper_back:40, biceps:15 } },
  { slug:"kroc-row", name:"Kroc Row", name_de:"Kroc Row (einarmig)", equipment:"dumbbell", category:"compound", mechanics:"pull", unilateral:true, side_mode:"left_right", muscles:{ lats:55, upper_back:30, biceps:15 } },
  { slug:"cable-rear-delt-row", name:"Cable Rear Delt Row", name_de:"Rear Delt Row (Kabel)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ rear_delts:70, upper_back:30 } },
  { slug:"barbell-shrug", name:"Barbell Shrug", name_de:"Shrug (Langhantel)", equipment:"barbell", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ traps:95, upper_back:5 } },
  { slug:"ez-bar-curl", name:"EZ-Bar Curl", name_de:"SZ-Curl", equipment:"ez", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },
  { slug:"reverse-curl-ez", name:"Reverse Curl (EZ)", name_de:"Reverse Curl (SZ)", equipment:"ez", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ brachioradialis:60, brachialis:25, biceps:15 } },
  { slug:"cable-hammer-curl", name:"Cable Hammer Curl (Rope)", name_de:"Kabel-Hammer-Curl (Seil)", equipment:"cable", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ brachialis:60, brachioradialis:25, biceps:15 } },
  { slug:"preacher-curl-machine", name:"Preacher Curl (Machine)", name_de:"Scott-Curl (Maschine)", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ biceps:100 } },

  { slug:"back-squat-low-bar", name:"Back Squat (Low-Bar)", name_de:"Kniebeuge (Low-Bar)", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:45, glutes:40, hamstrings:15 } },
  { slug:"pause-squat", name:"Pause Squat", name_de:"Pause Squat", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug:"zercher-squat", name:"Zercher Squat", name_de:"Zercher Squat", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:50, glutes:35, hamstrings:15 } },
  { slug:"box-squat", name:"Box Squat", name_de:"Box Squat", equipment:"barbell", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug:"smith-squat", name:"Smith Squat", name_de:"Kniebeuge (Multipresse)", equipment:"machine", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug:"belt-squat", name:"Belt Squat", name_de:"Belt Squat", equipment:"machine", category:"compound", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:60, glutes:30, hamstrings:10 } },
  { slug:"step-up-dumbbell", name:"Step-Up (DB)", name_de:"Step-Up (Kurzhantel)", equipment:"dumbbell", category:"compound", mechanics:"squat", unilateral:true, side_mode:"left_right", muscles:{ quads:50, glutes:40, hamstrings:10 } },
  { slug:"reverse-lunge", name:"Reverse Lunge", name_de:"Reverse Lunge", equipment:"dumbbell", category:"compound", mechanics:"squat", unilateral:true, side_mode:"left_right", muscles:{ quads:45, glutes:40, hamstrings:15 } },
  { slug:"cable-pull-through", name:"Cable Pull-Through", name_de:"Cable Pull-Through", equipment:"cable", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ hamstrings:45, glutes:45, lower_back:10 } },
  { slug:"nordic-ham-curl", name:"Nordic Ham Curl", name_de:"Nordic Ham Curl", equipment:"other", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ hamstrings:100 } },
  { slug:"glute-ham-raise", name:"Glute Ham Raise (GHR)", name_de:"Glute-Ham Raise", equipment:"machine", category:"isolation", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ hamstrings:80, glutes:20 } },
  { slug:"reverse-hyperextension", name:"Reverse Hyperextension", name_de:"Reverse Hyperextension", equipment:"machine", category:"isolation", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ glutes:50, hamstrings:30, lower_back:20 } },
  { slug:"back-extension", name:"Back Extension", name_de:"Rückenstrecker (Hyperextension)", equipment:"machine", category:"isolation", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ lower_back:70, glutes:20, hamstrings:10 } },
  { slug:"hip-thrust-machine", name:"Hip Thrust (Machine)", name_de:"Hip Thrust (Maschine)", equipment:"machine", category:"compound", mechanics:"hinge", unilateral:false, side_mode:"both", muscles:{ glutes:70, hamstrings:20, quads:10 } },
  { slug:"single-leg-press", name:"Single-Leg Press", name_de:"Beinpresse einbeinig", equipment:"machine", category:"compound", mechanics:"squat", unilateral:true, side_mode:"separate", muscles:{ quads:60, glutes:30, hamstrings:10 } },
  { slug:"sissy-squat", name:"Sissy Squat", name_de:"Sissy Squat", equipment:"other", category:"isolation", mechanics:"squat", unilateral:false, side_mode:"both", muscles:{ quads:100 } },
  { slug:"donkey-calf-raise", name:"Donkey Calf Raise", name_de:"Donkey Wadenheben", equipment:"machine", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ calves:100 } },
  { slug:"leg-press-calf-raise", name:"Leg Press Calf Raise", name_de:"Wadenheben (Beinpresse)", equipment:"machine", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ calves:100 } },
  { slug:"single-leg-calf-raise", name:"Single-Leg Calf Raise", name_de:"Wadenheben einbeinig", equipment:"dumbbell", category:"isolation", mechanics:"carry", unilateral:true, side_mode:"left_right", muscles:{ calves:100 } },
  { slug:"tibialis-raise", name:"Tibialis Raise", name_de:"Tibialis Raise", equipment:"other", category:"isolation", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ tibialis:100 } },

  { slug:"ab-wheel-rollout", name:"Ab Wheel Rollout", name_de:"AB-Rad Rollout", equipment:"other", category:"isolation", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ abs:85, lower_back:15 } },
  { slug:"dead-bug", name:"Dead Bug", name_de:"Dead Bug", equipment:"bodyweight", category:"warmup", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ abs:80, hip_flexors:20 } },
  { slug:"hollow-hold", name:"Hollow Hold", name_de:"Hollow Hold", equipment:"bodyweight", category:"warmup", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ abs:90, hip_flexors:10 } },
  { slug:"russian-twist", name:"Russian Twist", name_de:"Russian Twist", equipment:"other", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ obliques:80, abs:20 } },
  { slug:"side-plank", name:"Side Plank", name_de:"Seitstütz", equipment:"bodyweight", category:"warmup", mechanics:"anti-rotation", unilateral:false, side_mode:"both", muscles:{ obliques:80, abs:20 } },
  { slug:"toes-to-bar", name:"Toes-to-Bar", name_de:"Toes-to-Bar", equipment:"bodyweight", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ abs:80, hip_flexors:20 } },
  { slug:"hanging-knee-raise", name:"Hanging Knee Raise", name_de:"Knieheben hängend", equipment:"bodyweight", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ abs:85, hip_flexors:15 } },
  { slug:"wood-chop-high-to-low", name:"Cable Wood Chop (High→Low)", name_de:"Holzhacker (oben→unten)", equipment:"cable", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ obliques:70, abs:30 } },
  { slug:"wood-chop-low-to-high", name:"Cable Wood Chop (Low→High)", name_de:"Holzhacker (unten→oben)", equipment:"cable", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ obliques:70, abs:30 } },
  { slug:"weighted-crunch-machine", name:"Weighted Crunch (Machine)", name_de:"Crunch (Maschine)", equipment:"machine", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ abs:100 } },
  { slug:"suitcase-carry", name:"Suitcase Carry", name_de:"Suitcase Carry", equipment:"dumbbell", category:"compound", mechanics:"carry", unilateral:true, side_mode:"separate", muscles:{ obliques:40, abs:30, forearms:30 } },
  { slug:"overhead-carry", name:"Overhead Carry (DB)", name_de:"Overhead Carry (Kurzhantel)", equipment:"dumbbell", category:"compound", mechanics:"carry", unilateral:true, side_mode:"separate", muscles:{ shoulders:40, abs:30, forearms:30 } },
  { slug:"zercher-carry", name:"Zercher Carry", name_de:"Zercher Carry", equipment:"barbell", category:"compound", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ abs:40, forearms:30, upper_back:30 } },
  { slug:"yoke-carry", name:"Yoke Carry", name_de:"Yoke Carry", equipment:"other", category:"compound", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ traps:35, abs:35, forearms:30 } },
  { slug:"sled-push", name:"Sled Push", name_de:"Schlitten Schieben", equipment:"other", category:"compound", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ quads:40, glutes:30, calves:30 } },
  { slug:"sled-drag-backward", name:"Sled Drag (Backward)", name_de:"Schlitten Ziehen (rückwärts)", equipment:"other", category:"compound", mechanics:"carry", unilateral:false, side_mode:"both", muscles:{ quads:50, calves:30, glutes:20 } },

  { slug:"landmine-rotation", name:"Landmine Rotation", name_de:"Landmine Rotation", equipment:"other", category:"isolation", mechanics:"rotation", unilateral:false, side_mode:"both", muscles:{ obliques:80, abs:20 } },
  { slug:"meadows-row", name:"Meadows Row", name_de:"Meadows Row", equipment:"other", category:"compound", mechanics:"pull", unilateral:true, side_mode:"left_right", muscles:{ lats:55, upper_back:30, biceps:15 } },
  { slug:"landmine-row", name:"Landmine Row (2-Hand)", name_de:"Landmine Rudern (2-Hand)", equipment:"other", category:"compound", mechanics:"pull", unilateral:false, side_mode:"both", muscles:{ lats:50, upper_back:35, biceps:15 } }
];

const ALL: SeedItem[] = [...BASE_60, ...EXTRA];

async function fallbackFullSeed() {
  for (const s of ALL) {
    try {
      const exists = await db.exercises.where("slug").equals(s.slug).first();
      if (exists) continue;
      await createExercise({ ...(s as any), isFavorite: false, lastUsedAt: null, alt_names: (s.alt_names||[]), rep_range_default: { low: 5, high: 12 }, rpe_target_default: 8, increment_kg: 2.5 } as any);
    } catch (e) {
      console.warn("Seed insert failed for", s.slug, e);
    }
  }
}

export async function ensureSeedOnBoot(){
  const count = await db.exercises.count();
  if (count >= 120) return;
  try {
    const mod: any = await import("./exercises.seed");
    const keys = Object.keys(mod || {});
    const candidateName = keys.find(k => /seed/i.test(k) && typeof (mod as any)[k] === "function");
    const candidate = candidateName ? (mod as any)[candidateName] : (typeof mod?.default === "function" ? mod.default : null);
    if (candidate) {
      await candidate();
    } else {
      await fallbackFullSeed();
    }
  } catch (e) {
    console.warn("Seed module dynamic import failed, using fallback seed.", e);
    await fallbackFullSeed();
  }
}

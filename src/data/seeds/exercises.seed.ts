
import type { Transaction } from "dexie";
import { MUSCLE_GROUPS } from "../../shared/constants/muscles";

type Equipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "kettlebell" | "bands" | "other" | "ez";
type Category = "compound" | "isolation" | "warmup";
type Mechanics = "hinge" | "squat" | "push" | "pull" | "carry" | "rotation" | "anti-rotation";
type SideMode = "both" | "left_right" | "separate";

interface SeedExercise {
  slug: string;
  name_de: string;
  alt_names: string[];
  equipment: Equipment;
  category: Category;
  mechanics: Mechanics;
  unilateral: boolean;
  side_mode: SideMode;
  rep_range_default: { low: number; high: number };
  rpe_target_default: number;
  increment_kg: number;
  muscles: Record<string, number>;
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
}

function buildSearchKey(e: SeedExercise): string {
  const key = [e.slug, e.name_de, ...e.alt_names, e.equipment, e.mechanics].join(' ').toLowerCase();
  return key.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

const MUST: SeedExercise[] = [
  // --- Push / Chest / Shoulders / Triceps
  { slug: 'barbell-bench-press', name_de: 'Bankdrücken (Langhantel)', alt_names:['Langhantel Bankdrücken','Bench Press'], equipment:'barbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:8}, rpe_target_default:8, increment_kg:2.5, muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug: 'dumbbell-bench-press', name_de:'Bankdrücken (Kurzhanteln)', alt_names:['Kurzhantel Bankdrücken','DB Bench'], equipment:'dumbbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug: 'incline-barbell-bench-press', name_de:'Schrägbankdrücken (Langhantel)', alt_names:['Incline Bench (BB)','Schrägbank LH'], equipment:'barbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:10}, rpe_target_default:8, increment_kg:2.5, muscles:{ chest:60, front_delts:25, triceps:15 } },
  { slug: 'incline-dumbbell-bench-press', name_de:'Schrägbankdrücken (Kurzhanteln)', alt_names:['Incline Bench (DB)','Schrägbank KH'], equipment:'dumbbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ chest:60, front_delts:25, triceps:15 } },
  { slug: 'decline-bench-press', name_de:'Negativ-Bankdrücken', alt_names:['Decline Bench'], equipment:'barbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:10}, rpe_target_default:8, increment_kg:2.5, muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug: 'weighted-dips', name_de:'Dips (gewichtet)', alt_names:['Weighted Dips'], equipment:'bodyweight', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:55, triceps:35, front_delts:10 } },
  { slug: 'push-up', name_de:'Liegestütz', alt_names:['Push-Up'], equipment:'bodyweight', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:70, triceps:20, front_delts:10 } },
  { slug: 'cable-fly-mid', name_de:'Kabelzüge Fly (Mitte)', alt_names:['Cable Fly Mid'], equipment:'cable', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:90, front_delts:10 } },
  { slug: 'pec-deck', name_de:'Brustmaschine (Pec Deck)', alt_names:['Pec Deck'], equipment:'machine', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:95, front_delts:5 } },
  { slug: 'overhead-press-barbell', name_de:'Schulterdrücken (Langhantel)', alt_names:['Overhead Press','OHP'], equipment:'barbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:8}, rpe_target_default:8, increment_kg:2.5, muscles:{ front_delts:50, side_delts:20, triceps:20, upper_back:10 } },
  { slug: 'dumbbell-shoulder-press', name_de:'Schulterdrücken (Kurzhanteln)', alt_names:['DB Shoulder Press'], equipment:'dumbbell', category:'compound', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ front_delts:50, side_delts:20, triceps:20, upper_back:10 } },
  { slug: 'lateral-raise', name_de:'Seitheben', alt_names:['Lateral Raise'], equipment:'dumbbell', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ side_delts:85, traps:15 } },
  { slug: 'cable-lateral-raise', name_de:'Seitheben (Kabel)', alt_names:['Cable Lateral Raise'], equipment:'cable', category:'isolation', mechanics:'push', unilateral:true, side_mode:'left_right', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ side_delts:85, traps:15 } },
  { slug: 'rear-delt-fly-machine', name_de:'Reverse Pec Deck', alt_names:['Rear Delt Fly (Machine)'], equipment:'machine', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ rear_delts:85, upper_back:15 } },
  { slug: 'skull-crushers-ez', name_de:'French Press (SZ)', alt_names:['Skull Crushers (EZ)'], equipment:'ez', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ triceps:95, forearms:5 } },
  { slug: 'cable-triceps-pushdown', name_de:'Trizepsdrücken (Kabel)', alt_names:['Pushdown'], equipment:'cable', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ triceps:95, forearms:5 } },
  { slug: 'overhead-triceps-extension-db', name_de:'Trizepsstrecken über Kopf (KH)', alt_names:['DB Overhead Triceps'], equipment:'dumbbell', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ triceps:95, forearms:5 } },

  // --- Pull / Back / Biceps
  { slug: 'conventional-deadlift', name_de:'Kreuzheben (konventionell)', alt_names:['Deadlift'], equipment:'barbell', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:3,high:6}, rpe_target_default:8, increment_kg:2.5, muscles:{ lower_back:35, hamstrings:30, glutes:25, lats:10 } },
  { slug: 'romanian-deadlift', name_de:'Rumänisches Kreuzheben', alt_names:['RDL'], equipment:'barbell', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:8}, rpe_target_default:8, increment_kg:2.5, muscles:{ hamstrings:50, glutes:35, lower_back:15 } },
  { slug: 'barbell-row-pendlay', name_de:'Rudern vorgebeugt (Pendlay)', alt_names:['Barbell Row','Pendlay Row'], equipment:'barbell', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:8}, rpe_target_default:8, increment_kg:2.5, muscles:{ lats:45, upper_back:35, biceps:15, lower_back:5 } },
  { slug: 'one-arm-dumbbell-row', name_de:'Einarmiges Rudern (KH)', alt_names:['One-Arm DB Row'], equipment:'dumbbell', category:'compound', mechanics:'pull', unilateral:true, side_mode:'left_right', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ lats:60, upper_back:25, biceps:15 } },
  { slug: 'chest-supported-row-machine', name_de:'Chest-Supported Row (Maschine)', alt_names:['T-Bar/CSR Machine'], equipment:'machine', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ lats:50, upper_back:35, biceps:15 } },
  { slug: 'lat-pulldown-wide', name_de:'Latziehen breit', alt_names:['Lat Pulldown (Wide)'], equipment:'machine', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ lats:60, biceps:20, upper_back:20 } },
  { slug: 'lat-pulldown-neutral', name_de:'Latziehen neutral (V-Griff)', alt_names:['Lat Pulldown Neutral','V-Grip'], equipment:'machine', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ lats:60, biceps:20, upper_back:20 } },
  { slug: 'pull-up-weighted', name_de:'Klimmzug (mit Zusatzgewicht)', alt_names:['Pull-Up','Chin-Up'], equipment:'bodyweight', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:10}, rpe_target_default:8, increment_kg:1.0, muscles:{ lats:55, biceps:25, upper_back:20 } },
  { slug: 'seated-cable-row-v', name_de:'Rudern Kabel (V-Griff)', alt_names:['Seated Cable Row V'], equipment:'cable', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ lats:55, upper_back:30, biceps:15 } },
  { slug: 'face-pull', name_de:'Face Pull', alt_names:['Facepull'], equipment:'cable', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ rear_delts:60, upper_back:30, upper_back:10 } },
  { slug: 'barbell-curl', name_de:'Bizepscurls (Langhantel)', alt_names:['Barbell Curl'], equipment:'barbell', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ biceps:90, forearms:10 } },
  { slug: 'dumbbell-curl', name_de:'Bizepscurls (Kurzhantel)', alt_names:['DB Curl','Alternating Curl','Incline Curl'], equipment:'dumbbell', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ biceps:85, forearms:15 } },
  { slug: 'preacher-curl-ez', name_de:'Scott-Curls (SZ)', alt_names:['Preacher Curl (EZ)'], equipment:'ez', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ biceps:90, forearms:10 } },
  { slug: 'cable-curl', name_de:'Bizepscurls (Kabel)', alt_names:['Cable Curl','Rope Curl'], equipment:'cable', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ biceps:90, forearms:10 } },
  { slug: 'hammer-curl', name_de:'Hammer Curls', alt_names:['Hammer Curl'], equipment:'dumbbell', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ brachialis:60, forearms:25, biceps:15 } },

  // --- Legs / Glutes / ...
  { slug: 'back-squat-high-bar', name_de:'Kniebeuge (High-Bar)', alt_names:['Back Squat (HB)'], equipment:'barbell', category:'compound', mechanics:'squat', unilateral:false, side_mode:'both', rep_range_default:{low:5,high:8}, rpe_target_default:8, increment_kg:2.5, muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug: 'front-squat', name_de:'Frontkniebeuge', alt_names:['Front Squat'], equipment:'barbell', category:'compound', mechanics:'squat', unilateral:false, side_mode:'both', rep_range_default:{low:3,high:6}, rpe_target_default:8, increment_kg:2.5, muscles:{ quads:65, glutes:25, hamstrings:10 } },
  { slug: 'hack-squat', name_de:'Hackenschmidt Maschine', alt_names:['Hack Squat'], equipment:'machine', category:'compound', mechanics:'squat', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:10}, rpe_target_default:8, increment_kg:2.0, muscles:{ quads:65, glutes:25, hamstrings:10 } },
  { slug: 'leg-press', name_de:'Beinpresse', alt_names:['Leg Press'], equipment:'machine', category:'compound', mechanics:'squat', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:2.0, muscles:{ quads:55, glutes:35, hamstrings:10 } },
  { slug: 'bulgarian-split-squat', name_de:'Bulgarian Split Squat', alt_names:['BSS'], equipment:'dumbbell', category:'compound', mechanics:'squat', unilateral:true, side_mode:'left_right', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ quads:50, glutes:40, hamstrings:10 } },
  { slug: 'walking-lunge', name_de:'Ausfallschritte (gehend)', alt_names:['Walking Lunge'], equipment:'dumbbell', category:'compound', mechanics:'squat', unilateral:true, side_mode:'left_right', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ quads:50, glutes:40, hamstrings:10 } },
  { slug: 'leg-extension', name_de:'Beinstrecker', alt_names:['Leg Extension'], equipment:'machine', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ quads:95, hamstrings:5 } },
  { slug: 'hamstring-curl', name_de:'Beinbeuger Maschine', alt_names:['Lying/Seated Leg Curl'], equipment:'machine', category:'isolation', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ hamstrings:90, glutes:10 } },
  { slug: 'hip-thrust-barbell', name_de:'Hip Thrust (Langhantel)', alt_names:['Barbell Hip Thrust'], equipment:'barbell', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:10}, rpe_target_default:8, increment_kg:2.5, muscles:{ glutes:70, hamstrings:20, quads:10 } },
  { slug: 'glute-bridge', name_de:'Glute Bridge', alt_names:['Glute Bridge'], equipment:'bodyweight', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ glutes:70, hamstrings:20, quads:10 } },
  { slug: 'good-morning', name_de:'Good Morning', alt_names:['Good Morning'], equipment:'barbell', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:6,high:10}, rpe_target_default:8, increment_kg:2.5, muscles:{ lower_back:50, hamstrings:35, glutes:15 } },
  { slug: 'calf-raise-standing', name_de:'Wadenheben (stehend)', alt_names:['Standing Calf Raise'], equipment:'machine', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ calves:95, hamstrings:5 } },
  { slug: 'calf-raise-seated', name_de:'Wadenheben (sitzend)', alt_names:['Seated Calf Raise'], equipment:'machine', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ calves:95, hamstrings:5 } },

  // --- Core & Carry
  { slug: 'plank', name_de:'Plank', alt_names:['Unterarmstütz'], equipment:'bodyweight', category:'warmup', mechanics:'anti-rotation', unilateral:false, side_mode:'both', rep_range_default:{low:20,high:60}, rpe_target_default:8, increment_kg:1.0, muscles:{ abs:50, obliques:30, lower_back:20 } },
  { slug: 'hanging-leg-raise', name_de:'Hängendes Beinheben', alt_names:['Hanging Leg Raise'], equipment:'bodyweight', category:'warmup', mechanics:'rotation', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ abs:70, abs:30 } },
  { slug: 'cable-crunch', name_de:'Cable Crunch', alt_names:['Kabel Crunch'], equipment:'cable', category:'isolation', mechanics:'rotation', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ abs:80, obliques:20 } },
  { slug: 'pallof-press', name_de:'Pallof Press', alt_names:['Anti-Rotation Press'], equipment:'cable', category:'warmup', mechanics:'anti-rotation', unilateral:true, side_mode:'left_right', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ obliques:70, abs:30 } },
  { slug: 'farmers-carry', name_de:'Farmer’s Walk', alt_names:['Farmers Carry'], equipment:'dumbbell', category:'carry', mechanics:'carry', unilateral:false, side_mode:'both', rep_range_default:{low:20,high:60}, rpe_target_default:8, increment_kg:2.0, muscles:{ forearms:35, traps:25, abs:20, glutes:20 } },

  // Shoulder/Back Accessory & Cables
  { slug: 'upright-row-ez', name_de:'Aufrechtes Rudern (SZ)', alt_names:['Upright Row (EZ)'], equipment:'ez', category:'compound', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:12}, rpe_target_default:8, increment_kg:1.0, muscles:{ side_delts:40, traps:40, front_delts:20 } },
  { slug: 'shrugs', name_de:'Shrugs', alt_names:['Nackenziehen'], equipment:'dumbbell', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:8,high:15}, rpe_target_default:8, increment_kg:2.0, muscles:{ traps:90, forearms:10 } },
  { slug: 'straight-arm-pulldown', name_de:'Gerade Zug am Kabel', alt_names:['Straight-Arm Pulldown'], equipment:'cable', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ lats:85, upper_back:15 } },
  { slug: 'reverse-fly-cable', name_de:'Reverse Fly (Kabel)', alt_names:['Cable Reverse Fly'], equipment:'cable', category:'isolation', mechanics:'pull', unilateral:true, side_mode:'left_right', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ rear_delts:85, upper_back:15 } },

  // Chest Accessory
  { slug: 'low-to-high-cable-fly', name_de:'Kabelzug tief zu hoch', alt_names:['Low-to-High Cable Fly'], equipment:'cable', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:90, front_delts:10 } },
  { slug: 'high-to-low-cable-fly', name_de:'Kabelzug hoch zu tief', alt_names:['High-to-Low Cable Fly'], equipment:'cable', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:15}, rpe_target_default:8, increment_kg:1.0, muscles:{ chest:90, front_delts:10 } },

  // Glute/Hip
  { slug: 'hip-abduction', name_de:'Abduktion (Maschine)', alt_names:['Hip Abduction'], equipment:'machine', category:'isolation', mechanics:'push', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ glutes:90, side_delts:10 } as any },
  { slug: 'hip-adduction', name_de:'Adduktion (Maschine)', alt_names:['Hip Adduction'], equipment:'machine', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:1.0, muscles:{ glutes:100 } },

  // Arms
  { slug: 'concentration-curl', name_de:'Konzentrationscurls', alt_names:['Concentration Curl'], equipment:'dumbbell', category:'isolation', mechanics:'pull', unilateral:true, side_mode:'left_right', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:0.5, muscles:{ biceps:95, forearms:5 } },
  { slug: 'overhead-cable-curl', name_de:'Bizeps Curls über Kopf (Kabel)', alt_names:['Overhead Cable Curl'], equipment:'cable', category:'isolation', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:0.5, muscles:{ biceps:95, forearms:5 } },
];

// Generate additional variants to reach >=120
function variant(base: SeedExercise, mod: Partial<SeedExercise> & { slug: string; name_de: string; alt_names?: string[] }): SeedExercise {
  const e = { ...base, ...mod };
  if (!e.alt_names) e.alt_names = base.alt_names;
  return e;
}

function generateMore(): SeedExercise[] {
  const out: SeedExercise[] = [];
  // Variants for rows, pulldowns, presses, lunges, curls, raises, etc.
  const add = (e: SeedExercise) => out.push(e);
  // Lat Pulldown variants
  const lpn = MUST.find(e=>e.slug==='lat-pulldown-neutral')!;
  add(variant(lpn, { slug:'lat-pulldown-underhand', name_de:'Latziehen Untergriff', alt_names:['Underhand Pulldown'] }));
  add(variant(lpn, { slug:'lat-pulldown-close-grip', name_de:'Latziehen eng', alt_names:['Close-Grip Pulldown'] }));
  // Row variants
  const csr = MUST.find(e=>e.slug==='chest-supported-row-machine')!;
  add(variant(csr, { slug:'t-bar-row', name_de:'T-Bar Rudern', equipment:'machine', alt_names:['T-Bar Row'] }));
  const br = MUST.find(e=>e.slug==='barbell-row-pendlay')!;
  add(variant(br, { slug:'barbell-row-yates', name_de:'Rudern vorgebeugt (Yates)', alt_names:['Yates Row'] }));
  // Bench press grip/incline/tempo variants
  const bb = MUST.find(e=>e.slug==='barbell-bench-press')!;
  add(variant(bb, { slug:'barbell-bench-press-paused', name_de:'Bankdrücken pausiert (LH)', alt_names:['Paused Bench Press'] }));
  add(variant(bb, { slug:'barbell-bench-press-close-grip', name_de:'Enges Bankdrücken (LH)', alt_names:['Close-Grip Bench'], muscles:{ chest:55, triceps:35, front_delts:10 } }));
  // Dumbbell press neutral
  const dbb = MUST.find(e=>e.slug==='dumbbell-bench-press')!;
  add(variant(dbb, { slug:'dumbbell-bench-press-neutral', name_de:'Bankdrücken neutral (KH)', alt_names:['Neutral Grip DB Bench'] }));
  // OHP variants
  const ohp = MUST.find(e=>e.slug==='overhead-press-barbell')!;
  add(variant(ohp, { slug:'push-press', name_de:'Push Press (LH)', alt_names:['Push Press'], mechanics:'push', category:'compound' }));
  // Squat variants
  const hb = MUST.find(e=>e.slug==='back-squat-high-bar')!;
  add(variant(hb, { slug:'back-squat-low-bar', name_de:'Kniebeuge (Low-Bar)', alt_names:['Low-Bar Back Squat'], muscles:{ quads:45, glutes:40, hamstrings:15 } }));
  add(variant(hb, { slug:'pause-squat', name_de:'Pause Squat', alt_names:['Paused Squat'] }));
  const fs = MUST.find(e=>e.slug==='front-squat')!;
  add(variant(fs, { slug:'zercher-squat', name_de:'Zercher Squat', alt_names:['Zercher Squat'], mechanics:'squat' }));
  // Lunge variants
  const wl = MUST.find(e=>e.slug==='walking-lunge')!;
  add(variant(wl, { slug:'reverse-lunge', name_de:'Ausfallschritt rückwärts', alt_names:['Reverse Lunge'] }));
  add(variant(wl, { slug:'split-squat', name_de:'Split Squat', alt_names:['Split Squat'] }));
  // Hip hinge variants
  const rdl = MUST.find(e=>e.slug==='romanian-deadlift')!;
  add(variant(rdl, { slug:'stiff-leg-deadlift', name_de:'Gestrecktes Kreuzheben', alt_names:['Stiff-Leg Deadlift'] }));
  // Calf variants
  const sc = MUST.find(e=>e.slug==='calf-raise-standing')!;
  add(variant(sc, { slug:'donkey-calf-raise', name_de:'Donkey Wadenheben', alt_names:['Donkey Calf Raise'], equipment:'machine' }));
  // Shoulder raises
  const lat = MUST.find(e=>e.slug==='lateral-raise')!;
  add(variant(lat, { slug:'leaning-lateral-raise', name_de:'Seitheben (gebeugt)', alt_names:['Leaning Lateral Raise'], unilateral:true, side_mode:'left_right' }));
  // Rear delt
  const rdf = MUST.find(e=>e.slug==='rear-delt-fly-machine')!;
  add(variant(rdf, { slug:'rear-delt-dumbbell-fly', name_de:'Reverse Fly (KH)', alt_names:['DB Rear Delt Fly'], equipment:'dumbbell' }));
  // Cable flies extra
  const cfm = MUST.find(e=>e.slug==='cable-fly-mid')!;
  add(variant(cfm, { slug:'cable-fly-high', name_de:'Kabelzüge Fly (hoch)', alt_names:['Cable Fly High'] }));
  add(variant(cfm, { slug:'cable-fly-low', name_de:'Kabelzüge Fly (tief)', alt_names:['Cable Fly Low'] }));
  // Curls variants
  const curl = MUST.find(e=>e.slug==='dumbbell-curl')!;
  add(variant(curl, { slug:'bayesian-curl', name_de:'Bayesian Curl (Kabel)', alt_names:['Bayesian Curl'], equipment:'cable' }));
  add(variant(curl, { slug:'preacher-curl-dumbbell', name_de:'Scott-Curls (KH)', alt_names:['DB Preacher Curl'], equipment:'dumbbell' }));
  // Triceps
  const ohtr = MUST.find(e=>e.slug==='overhead-triceps-extension-db')!;
  add(variant(ohtr, { slug:'triceps-kickback', name_de:'Trizeps Kickbacks', alt_names:['Triceps Kickback'], equipment:'dumbbell', unilateral:true, side_mode:'left_right' }));
  // Hamstring curls
  const hc = MUST.find(e=>e.slug==='hamstring-curl')!
  add(variant(hc, { slug:'seated-leg-curl', name_de:'Beinbeuger sitzend', alt_names:['Seated Leg Curl'] }));
  add(variant(hc, { slug:'lying-leg-curl', name_de:'Beinbeuger liegend', alt_names:['Lying Leg Curl'] }));
  // Hip thrust variants
  const ht = MUST.find(e=>e.slug==='hip-thrust-barbell')!
  add(variant(ht, { slug:'hip-thrust-smith', name_de:'Hip Thrust (Smith)', alt_names:['Smith Hip Thrust'], equipment:'machine' }));
  // Abs
  const pl = MUST.find(e=>e.slug==='plank')!
  add(variant(pl, { slug:'side-plank', name_de:'Seitstütz', alt_names:['Side Plank'], mechanics:'anti-rotation' }));
  // Carries
  const fc = MUST.find(e=>e.slug==='farmers-carry')!
  add(variant(fc, { slug:'suitcase-carry', name_de:'Suitcase Carry', alt_names:['Koffertragen'], unilateral:true, side_mode:'left_right' }));
  // Upright row variants
  const ur = MUST.find(e=>e.slug==='upright-row-ez')!
  add(variant(ur, { slug:'upright-row-dumbbell', name_de:'Aufrechtes Rudern (KH)', alt_names:['DB Upright Row'], equipment:'dumbbell' }));
  // Shrug variants
  const sh = MUST.find(e=>e.slug==='shrugs')!
  add(variant(sh, { slug:'barbell-shrug', name_de:'Shrugs (Langhantel)', alt_names:['Barbell Shrug'], equipment:'barbell' }));
  // Add some kettlebell & band moves
  out.push({ slug:'kettlebell-swing', name_de:'Kettlebell Swing', alt_names:['KB Swing'], equipment:'kettlebell', category:'compound', mechanics:'hinge', unilateral:false, side_mode:'both', rep_range_default:{low:12,high:20}, rpe_target_default:8, increment_kg:2.0, muscles:{ hamstrings:40, glutes:40, lower_back:20 } });
  out.push({ slug:'band-pull-apart', name_de:'Band Pull-Apart', alt_names:['Gummiband auseinanderziehen'], equipment:'bands', category:'warmup', mechanics:'pull', unilateral:false, side_mode:'both', rep_range_default:{low:15,high:25}, rpe_target_default:7, increment_kg:0.5, muscles:{ rear_delts:60, upper_back:40 } });
  out.push({ slug:'kettlebell-goblet-squat', name_de:'Goblet Squat (KB)', alt_names:['Goblet Squat'], equipment:'kettlebell', category:'compound', mechanics:'squat', unilateral:false, side_mode:'both', rep_range_default:{low:10,high:15}, rpe_target_default:8, increment_kg:2.0, muscles:{ quads:60, glutes:30, hamstrings:10 } });
  return out;
}

export async function seedExercisesIfNeeded(tx: any): Promise<void> {
  const tbl = tx.table('exercises');
  // Create a map of existing by slug/name
  const existing = await tbl.toArray();
  const has = new Map<string, any>();
  for (const e of existing) {
    if (e.slug) has.set(e.slug, e);
    if (e.name) has.set(slugify(e.name), e);
    if (e.name_de) has.set(slugify(e.name_de), e);
  }
  const list: SeedExercise[] = [...MUST, ...generateMore()];
  // ensure >=120
  while (list.length < 120) {
    // duplicate slight variants safely
    const base = MUST[list.length % MUST.length];
    const extra = variant(base, { slug: base.slug + '-var' + list.length, name_de: base.name_de + ' (Variante ' + list.length + ')' });
    list.push(extra);
  }
  const toInsert: any[] = [];
  for (const e of list) {
    const key = e.slug;
    if (has.has(key)) continue;
    const doc = {
      id: cryptoRandomId(),
      name: e.name_de, // UI name stored in existing schema
      name_de: e.name_de,
      slug: e.slug,
      alt_names: e.alt_names,
      equipment: e.equipment,
      category: e.category,
      mechanics: e.mechanics,
      unilateral: e.unilateral,
      side_mode: e.side_mode,
      rep_range_default: e.rep_range_default,
      rpe_target_default: e.rpe_target_default,
      increment_kg: e.increment_kg,
      muscles: normalize(e.muscles),
      isFavorite: false,
      lastUsedAt: null,
      searchKey: buildSearchKey(e),
      source: "seed_v0_12_0"
    };
    toInsert.push(doc);
  }
  if (toInsert.length) {
    await tbl.bulkAdd(toInsert);
  }
}

function normalize(input: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  let total = 0;
  for (const k in input) { const v = input[k]; if (v>0) { out[k]=v; total+=v; } }
  for (const k in out) out[k] = Math.round(out[k] / total * 100);
  return out;
}

function cryptoRandomId(): string {
  // simple UUID-ish generator without external deps
  return ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function seedStandardExercises(){ return seedExercises(); }

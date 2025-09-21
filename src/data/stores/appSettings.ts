
import { db } from "../db";
import { create } from "../../shared/zustand-lite";

export type GoalKey = "muscle" | "strength" | "endurance" | "fatloss";
export type ExperienceKey = "beginner" | "intermediate" | "advanced";

export interface AppSettings {
  unit: "kg" | "lbs";
  plateSet: number[];
  roundingIncrement: number;

  restPresets: number[];
  defaultRestSec: number;

  rpeMin: number;
  rpeMax: number;
  rpeStep: number;

  enableAutofillLast: boolean;
  enableHaptics: boolean;
  enablePRBanners: boolean;

  weeklyFrequency: number;
  goal: GoalKey;
  focusMuscles: string[]; // exercise slugs or muscle ids
  experience: ExperienceKey;

  onboardingStep?: string | null;
  onboardedAt?: string | null;
  createdStarterTemplateId?: string | null;
}

const DEFAULTS: AppSettings = {
  unit: "kg",
  plateSet: [20,15,10,5,2.5,1.25],
  roundingIncrement: 2.5,

  restPresets: [60,90,120,180],
  defaultRestSec: 90,

  rpeMin: 5,
  rpeMax: 10,
  rpeStep: 0.5,

  enableAutofillLast: true,
  enableHaptics: true,
  enablePRBanners: true,

  weeklyFrequency: 3,
  goal: "muscle",
  focusMuscles: [],
  experience: "beginner",

  onboardingStep: null,
  onboardedAt: null,
  createdStarterTemplateId: null,
};

// We persist inside prefs (id=1) to avoid new Dexie version bump right now.
// We use field names prefixed with 'app_' to minimize collisions.
type PrefsLike = any;

export async function loadAppSettings(): Promise<AppSettings> {
  const prefs: PrefsLike = await db.prefs.get(1);
  if (!prefs) {
    const next = { id: 1, ...mapToPrefs(DEFAULTS) };
    await db.prefs.put(next);
    return DEFAULTS;
  }
  return mapFromPrefs(prefs);
}

export async function saveAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadAppSettings();
  const next: AppSettings = { ...current, ...patch };
  await db.prefs.put({ id: 1, ...mapToPrefs(next) });
  return next;
}

export function useAppSettings() {
  return create<AppSettings & { set: (p: Partial<AppSettings>) => void }>((set, get) => ({
    ...DEFAULTS,
    set: (p) => {
      const merged = { ...get(), ...p };
      set(p);
      void db.prefs.put({ id: 1, ...mapToPrefs(merged) });
    },
  }));
}

export async function resetOnboarding(): Promise<void> {
  const cur = await loadAppSettings();
  await saveAppSettings({ ...cur, onboardingStep: "welcome", onboardedAt: null, createdStarterTemplateId: null });
}

// Mapping helpers
function mapToPrefs(s: AppSettings): Record<string, any> {
  return {
    units: s.unit,
    app_plateSet: s.plateSet,
    app_roundingIncrement: s.roundingIncrement,
    quickRestPresets: s.restPresets,
    app_defaultRestSec: s.defaultRestSec,
    app_rpeMin: s.rpeMin,
    app_rpeMax: s.rpeMax,
    app_rpeStep: s.rpeStep,
    app_enableAutofillLast: s.enableAutofillLast,
    app_enableHaptics: s.enableHaptics,
    app_enablePRBanners: s.enablePRBanners,
    app_weeklyFrequency: s.weeklyFrequency,
    app_goal: s.goal,
    app_focusMuscles: s.focusMuscles,
    app_experience: s.experience,
    app_onboardingStep: s.onboardingStep ?? null,
    app_onboardedAt: s.onboardedAt ?? null,
    app_createdStarterTemplateId: s.createdStarterTemplateId ?? null,
  };
}

function mapFromPrefs(p: any): AppSettings {
  const s: AppSettings = {
    unit: (p.units ?? DEFAULTS.unit),
    plateSet: (p.app_plateSet ?? DEFAULTS.plateSet),
    roundingIncrement: (p.app_roundingIncrement ?? DEFAULTS.roundingIncrement),
    restPresets: (p.quickRestPresets ?? DEFAULTS.restPresets),
    defaultRestSec: (p.app_defaultRestSec ?? DEFAULTS.defaultRestSec),
    rpeMin: (p.app_rpeMin ?? DEFAULTS.rpeMin),
    rpeMax: (p.app_rpeMax ?? DEFAULTS.rpeMax),
    rpeStep: (p.app_rpeStep ?? DEFAULTS.rpeStep),
    enableAutofillLast: (p.app_enableAutofillLast ?? DEFAULTS.enableAutofillLast),
    enableHaptics: (p.app_enableHaptics ?? DEFAULTS.enableHaptics),
    enablePRBanners: (p.app_enablePRBanners ?? DEFAULTS.enablePRBanners),
    weeklyFrequency: (p.app_weeklyFrequency ?? DEFAULTS.weeklyFrequency),
    goal: (p.app_goal ?? DEFAULTS.goal),
    focusMuscles: (p.app_focusMuscles ?? DEFAULTS.focusMuscles),
    experience: (p.app_experience ?? DEFAULTS.experience),
    onboardingStep: (p.app_onboardingStep ?? null),
    onboardedAt: (p.app_onboardedAt ?? null),
    createdStarterTemplateId: (p.app_createdStarterTemplateId ?? null),
  };
  return s;
}

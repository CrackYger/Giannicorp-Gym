import { db } from "../db";
import type { Prefs, PeriodKey, ThemeMode, Units } from "../../shared/types";

const DEFAULTS: Prefs = {
  id: 1,
  theme: "dark",
  units: "kg",
  defaultRpe: 8,
  roundingStep: 0.5,
  quickRestPresets: [30,60,90,120],
  selectedPeriod: "30",
  excludeWarmups: true,
  exportScope: "all",
  excludeWarmupsInExport: false,
  lastExportAt: null,
  selected_view: "front",
};

async function ensurePrefs(): Promise<Prefs> {
  const p = await db.prefs.get(1);
  if (!p) {
    await db.prefs.put(DEFAULTS);
    return DEFAULTS;
  }
  // merge defaults for new keys
  const merged: Prefs = { ...DEFAULTS, ...p };
  if (JSON.stringify(merged) !== JSON.stringify(p)) await db.prefs.put(merged);
  return merged;
}

export async function getPrefs(): Promise<Prefs> {
  return ensurePrefs();
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, theme });
}

export async function setUnits(units: Units): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, units });
}

export async function setSelectedPeriod(selectedPeriod: PeriodKey): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, selectedPeriod });
}

export async function setExcludeWarmups(excludeWarmups: boolean): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, excludeWarmups });
}

// v0.6.0
export async function setExportOptions(scope: "all" | "30" | "90" | "365", excludeWU: boolean): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, exportScope: scope, excludeWarmupsInExport: excludeWU, lastExportAt: new Date().toISOString() });
}


export async function setSelectedView(view: "front" | "back"): Promise<void> {
  const p = await ensurePrefs();
  await db.prefs.put({ ...p, selected_view: view });
}

export async function getSelectedView(): Promise<"front" | "back"> {
  const p = await ensurePrefs();
  return (p.selected_view ?? "front");
}


// v0.13.0: backward-compat stub; avoids schema changes
export async function markBadgesRetroDone(): Promise<void> {
  // no-op; kept for compatibility
}

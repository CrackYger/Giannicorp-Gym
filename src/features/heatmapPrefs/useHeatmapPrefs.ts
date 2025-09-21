import * as React from "react";
import type { HeatmapPrefs, HeatmapView, SideMode, PeriodKey } from "./types";

const KEY = "heatmap.prefs.v2";

function load(): HeatmapPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as HeatmapPrefs;
  } catch {}
  return {
    selected_view: "front",
    side_mode: "both",
    selected_period: "30",
    show_values: false,
    exclude_warmups: true,
  };
}

function save(p: HeatmapPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

let state: HeatmapPrefs = load();
const listeners = new Set<() => void>();
function setState(next: HeatmapPrefs) {
  state = next;
  save(state);
  for (const l of Array.from(listeners)) l();
}
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function getSnapshot(): HeatmapPrefs { return state; }

export interface PrefsState extends HeatmapPrefs {
  setView: (v: HeatmapView) => void;
  setSide: (s: SideMode) => void;
  setPeriod: (p: PeriodKey) => void;
  toggleValues: () => void;
  toggleExcludeWarmups: () => void;
  replace: (p: HeatmapPrefs) => void;
}

export function useHeatmapPrefs(): PrefsState {
  const snap = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const api = React.useMemo(() => ({
    setView: (v: HeatmapView) => setState({ ...state, selected_view: v }),
    setSide: (s: SideMode) => setState({ ...state, side_mode: s }),
    setPeriod: (p: PeriodKey) => setState({ ...state, selected_period: p }),
    toggleValues: () => setState({ ...state, show_values: !state.show_values }),
    toggleExcludeWarmups: () => setState({ ...state, exclude_warmups: !state.exclude_warmups }),
    replace: (p: HeatmapPrefs) => setState({ ...p }),
  }), []);
  return { ...snap, ...api };
}

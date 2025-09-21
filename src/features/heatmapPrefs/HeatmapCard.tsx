import * as React from "react";
import { useHeatmapPrefs } from "./useHeatmapPrefs";
import type { HeatmapPrefs } from "./types";
import { useDebouncedValue } from "./useDebouncedValue";
import { useReducedMotion } from "./useReducedMotion";
import { HeatmapLegend } from "./HeatmapLegend";
import { useNavigate } from "react-router-dom";

type Props = { renderBody?: (prefs: HeatmapPrefs) => React.ReactNode };

export const HeatmapCard: React.FC<Props> = ({ renderBody }) => {
  const prefs = useHeatmapPrefs();
  const reduced = useReducedMotion();
  const prefsDebounced = useDebouncedValue(prefs, reduced ? 0 : 220);
  const nav = useNavigate();

  return (
    <section className="rounded-2xl border dark:border-zinc-800 p-4 md:p-5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Legende */}
      <div className="mb-3 flex items-center justify-end">
        <HeatmapLegend />
      </div>

      {/* Fix: definierte, responsive Höhe + Clipping + Zentrierung */}
      <div className="relative mx-auto w-full h-[clamp(320px,45vh,560px)] overflow-hidden">
        <div className="absolute inset-0 grid place-items-center">
          {renderBody ? renderBody(prefsDebounced) : null}
        </div>
      </div>

      {/* Dezent: CTA bei dünnen Daten */}
      <div className="mt-3 text-center text-xs text-zinc-500">
        <button
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800/40"
          onClick={() => nav("/start")}
        >
          Workout starten
        </button>
      </div>
    </section>
  );
};

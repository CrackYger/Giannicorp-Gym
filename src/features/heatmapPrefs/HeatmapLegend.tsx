import * as React from "react";
export const HeatmapLegend: React.FC = () => {
  // Vorgaben: 0.05 · 0.25 · 0.5 · 0.8 · 1.0
  const stops = ["0.05","0.25","0.5","0.8","1.0"];
  return (
    <div className="flex items-center gap-3 text-xs select-none">
      <div className="h-2 w-28 rounded bg-gradient-to-r from-red-700 via-yellow-500 to-green-600" aria-hidden />
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        {stops.map(s => (<span key={s} className="tabular-nums">{s}</span>))}
      </div>
    </div>
  );
};
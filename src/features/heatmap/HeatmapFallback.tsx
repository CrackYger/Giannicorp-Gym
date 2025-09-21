
import React from "react";
import { computeMuscleAgg } from "../../lib/heatmap/workerClient";

type Props = {
  args: { period: number; sideMode: "both" | "left" | "right"; selectedView: "front" | "back"; excludeWarmups: boolean };
  onData: (data: unknown) => void;
};

export const HeatmapFallback: React.FC<Props> = ({ args, onData }) => {
  const [error, setError] = React.useState<string | null>(null);
  const retry = async () => {
    setError(null);
    const { data, error } = await computeMuscleAgg(args);
    if (error) setError(error);
    if (data) onData(data);
  };
  return (
    <div className="p-4 rounded-2xl border border-neutral-300 dark:border-neutral-800">
      <div className="text-sm opacity-80 mb-2">Leere Heatmap. Du kannst es erneut versuchen.</div>
      <button className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={retry}>Erneut berechnen</button>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
};

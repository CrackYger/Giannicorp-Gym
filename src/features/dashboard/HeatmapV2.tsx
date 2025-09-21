import React, { useEffect, useMemo, useState } from "react";
import { REGION_IDS } from "../../config/constants/muscles_lr";
import { colorForScore } from "../../shared/constants/muscles";
import type { PeriodKey } from "../../shared/types";
import { SilhouetteFront } from "./SilhouetteFront";
import { SilhouetteBack } from "./SilhouetteBack";
import { getSelectedView } from "../../data/stores/prefs";
import { useNavigate } from "react-router-dom";

export type SideMode = "both" | "left" | "right";
export interface HeatmapData { [regionId: string]: { score: number; volume: number; trend: number } }

type Props = {
  data: HeatmapData;
  side: SideMode;
  period?: PeriodKey;
  view?: "front" | "back";
  showValues?: boolean;
};

export function HeatmapV2({ data, side, period = "30", view, showValues = false }: Props) {
  const [internalView, setInternalView] = useState<"front"|"back">("front");
  const v = view ?? internalView;
  const nav = useNavigate();

  useEffect(() => {
    if (view) return;
    (async () => { setInternalView(await getSelectedView()); })();
  }, [view]);

  const segments = useMemo(() => {
    const ids: string[] = [];
    const bucket = (v === "front") ? ["front:left","front:right","front:center"] : ["back:left","back:right","back:center"];
    for (const key of bucket) ids.push(...(REGION_IDS as any)[key]);
    return ids.map((id) => {
      const d = data[id] || { score: 0, volume: 0, trend: 0 };
      const fill = colorForScore(d.score || 0);
      const alpha = isCenter(id) ? 1 : (side === "both" ? 1 : (matchesSide(id, side) ? 1 : 0.2));
      return { id, label: id, value: d.score, volume: d.volume, trend: d.trend, fill, alpha };
    });
  }, [data, side, v]);

  const thinData = useMemo(() => {
    const active = Object.values(data).filter(d => (d.volume ?? 0) > 0).length;
    return active < 4;
  }, [data]);

  return (
    <div className="relative h-full" role="img" aria-label="Muskel-Heatmap">
      <div className="relative overflow-hidden h-full">
        <div className="transition-opacity duration-200">
          {v === "front" ? (
            <SilhouetteFront segments={segments as any} showValues={showValues ?? false} />
          ) : (
            <SilhouetteBack segments={segments as any} showValues={showValues ?? false} />
          )}
        </div>
      </div>

      {thinData ? (
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
          <button
            className="rounded-lg border border-zinc-700 bg-black/30 px-3 py-1 text-xs backdrop-blur hover:bg-black/40"
            onClick={() => nav("/start")}
          >
            Wenig Daten im Zeitraum – Workout starten
          </button>
        </div>
      ) : null}
    </div>
  );
}

function isCenter(id: string): boolean {
  return /(?:center|chest|uppercore|traps|abs|upperback|lowerback)/.test(id);
}
function matchesSide(id: string, side: SideMode): boolean {
  if (side === "both") return true;
  const isLeft = /(?:^|_)l(?:ats|delts|biceps|forearms|quads|calves|glutes|hamstrings)/.test(id);
  const isRight = /(?:^|_)r(?:lats|delts|biceps|forearms|quads|calves|glutes|hamstrings)/.test(id);
  return side === "left" ? isLeft : isRight;
}

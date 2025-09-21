import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import type { PeriodKey } from "../../shared/types";
import { HeatmapV2, type SideMode } from "./HeatmapV2";
import { useAggWorker } from "./useAggWorker";

export function HeatmapCardV2({ defaultPeriod = "30" as PeriodKey }) {
  const [period, setPeriod] = useState<PeriodKey>(defaultPeriod);
  const [side, setSide] = useState<SideMode>("both");
  const { heatmap, error } = useAggWorker(period, side);

  useEffect(() => {}, [period, side]);

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <div className="text-sm text-zinc-400">Heatmap v2</div>
        <div className="ml-auto">
          <select className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm" value={period} onChange={(e)=>setPeriod(e.target.value as PeriodKey)}>
            <option value="last">Letztes</option>
            <option value="7">7</option>
            <option value="14">14</option>
            <option value="30">30</option>
            <option value="90">90</option>
            <option value="365">365</option>
            <option value="all">Alle</option>
          </select>
        </div>
      </div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      <HeatmapV2 data={heatmap as any} side={side} onSideChange={setSide} period={period} />
    </Card>
  );
}

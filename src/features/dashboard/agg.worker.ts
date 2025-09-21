import { computeMuscleAggV2 } from "./agg_v2";
import type { PeriodKey } from "../../shared/types";
import type { SideMode } from "./HeatmapV2";

type Msg =
  | { type: "heatmap"; period: PeriodKey; side: SideMode }
  | { type: "trend"; period: PeriodKey; side: SideMode };

self.onmessage = async (e: MessageEvent<Msg>) => {
  try {
    if (e.data.type === "heatmap") {
      const data = await computeMuscleAggV2(e.data.period, e.data.side);
      (self as any).postMessage({ type: "heatmap", data });
    } else if (e.data.type === "trend") {
      // simple trend = total volume per day over period (for now basic)
      const agg = await computeMuscleAggV2(e.data.period, e.data.side);
      const trend = Object.keys(agg).map(k => ({ key: k, score: agg[k].score }));
      (self as any).postMessage({ type: "trend", data: trend });
    }
  } catch (err: any) {
    (self as any).postMessage({ type: "error", message: String(err?.message || err) });
  }
};

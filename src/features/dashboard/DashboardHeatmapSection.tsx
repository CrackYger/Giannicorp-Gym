import * as React from "react";
import { HeatmapCard } from "../heatmapPrefs/HeatmapCard";
import type { HeatmapPrefs } from "../heatmapPrefs/types";

export const DashboardHeatmapSection: React.FC<{
  renderBody?: (prefs: HeatmapPrefs) => React.ReactNode;
}> = ({ renderBody }) => {
  return (
    <div className="mb-6 md:mb-8">
      <HeatmapCard renderBody={renderBody} />
    </div>
  );
};

import * as React from 'react';
import { HeatmapCard } from './HeatmapCard';
import type { HeatmapPrefs } from './types';

/**
 * Ein fertiger Abschnitt fürs Dashboard.
 * - Platziere ihn oberhalb deiner KPIs.
 * - Nur EINE Heatmap auf dem Dashboard (Duplikate/Legacy entfernen).
 */
export const DashboardHeatmapSection: React.FC<{
  renderBody?: (prefs: HeatmapPrefs) => React.ReactNode;
  isThin?: boolean;
}> = ({ renderBody, isThin }) => {
  return (
    <div className="mb-6 md:mb-8">
      <HeatmapCard renderBody={renderBody} isThin={isThin} />
    </div>
  );
};

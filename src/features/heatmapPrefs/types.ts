export type HeatmapView = "front" | "back";
export type SideMode = "both" | "left" | "right";
export type PeriodKey = "last" | "7" | "14" | "30" | "90" | "180" | "365" | "all";

export interface HeatmapPrefs {
  selected_view: HeatmapView;
  side_mode: SideMode;
  selected_period: PeriodKey;
  show_values: boolean;
  exclude_warmups: boolean;
}

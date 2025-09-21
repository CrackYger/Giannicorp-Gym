import type { CSSProperties } from "react";
import { colorForScore } from "../../shared/constants/muscles";

type Props = {
  scores: Record<string, number>;
  back?: boolean;
  style?: CSSProperties;
};

// Minimal human silhouette with labeled regions (ids)
export function HeatmapSVG({ scores, back = false, style }: Props) {
  const s = (key: string) => colorForScore(scores[key] ?? 0);

  if (!back) {
    // FRONT
    return (
      <svg viewBox="0 0 300 600" width="100%" style={style}>
        <rect x="0" y="0" width="300" height="600" fill="#0a0a0a" rx="24" />
        {/* Chest */}
        <polygon id="chest" points="120,120 180,120 210,170 90,170" fill={s("chest")} />
        {/* Abs */}
        <polygon id="abs" points="120,170 180,170 185,250 115,250" fill={s("abs")} />
        {/* Obliques */}
        <polygon id="obliques_left" points="90,170 120,170 115,250 85,240" fill={s("obliques")} />
        <polygon id="obliques_right" points="180,170 210,170 215,240 185,250" fill={s("obliques")} />
        {/* Front delts & side delts */}
        <circle id="front_delts_left" cx="100" cy="140" r="16" fill={s("front_delts")} />
        <circle id="front_delts_right" cx="200" cy="140" r="16" fill={s("front_delts")} />
        <circle id="side_delts_left" cx="80" cy="160" r="12" fill={s("side_delts")} />
        <circle id="side_delts_right" cx="220" cy="160" r="12" fill={s("side_delts")} />
        {/* Biceps / Triceps / Forearms */}
        <rect id="biceps_left" x="60" y="190" width="20" height="40" fill={s("biceps")} rx="8" />
        <rect id="biceps_right" x="220" y="190" width="20" height="40" fill={s("biceps")} rx="8" />
        <rect id="triceps_left" x="40" y="190" width="20" height="40" fill={s("triceps")} rx="8" />
        <rect id="triceps_right" x="240" y="190" width="20" height="40" fill={s("triceps")} rx="8" />
        <rect id="forearms_left" x="50" y="240" width="25" height="50" fill={s("forearms")} rx="8" />
        <rect id="forearms_right" x="225" y="240" width="25" height="50" fill={s("forearms")} rx="8" />
        {/* Quads */}
        <polygon id="quads_left" points="120,250 145,250 140,350 115,350" fill={s("quads")} />
        <polygon id="quads_right" points="155,250 180,250 185,350 160,350" fill={s("quads")} />
        {/* Calves */}
        <polygon id="calves_left" points="120,410 135,410 130,500 115,500" fill={s("calves")} />
        <polygon id="calves_right" points="165,410 180,410 185,500 170,500" fill={s("calves")} />
        {/* Traps hint on front */}
        <polygon id="traps_front" points="120,90 180,90 170,120 130,120" fill={s("traps")} />
      </svg>
    );
  }

  // BACK
  return (
    <svg viewBox="0 0 300 600" width="100%" style={style}>
      <rect x="0" y="0" width="300" height="600" fill="#0a0a0a" rx="24" />
      {/* Upper back & traps */}
      <polygon id="traps" points="120,90 180,90 200,120 100,120" fill={s("traps")} />
      <polygon id="upper_back" points="100,120 200,120 220,170 80,170" fill={s("upper_back")} />
      <polygon id="lats" points="80,170 220,170 200,240 100,240" fill={s("lats")} />
      {/* Rear delts */}
      <circle id="rear_delts_left" cx="85" cy="160" r="12" fill={s("rear_delts")} />
      <circle id="rear_delts_right" cx="215" cy="160" r="12" fill={s("rear_delts")} />
      {/* Lower back */}
      <polygon id="lower_back" points="120,240 180,240 185,280 115,280" fill={s("lower_back")} />
      {/* Glutes */}
      <polygon id="glutes" points="110,280 190,280 195,330 105,330" fill={s("glutes")} />
      {/* Hamstrings */}
      <polygon id="hamstrings_left" points="120,330 145,330 140,410 115,410" fill={s("hamstrings")} />
      <polygon id="hamstrings_right" points="155,330 180,330 185,410 160,410" fill={s("hamstrings")} />
      {/* Calves (back) */}
      <polygon id="calves_left_b" points="120,410 135,410 130,500 115,500" fill={s("calves")} />
      <polygon id="calves_right_b" points="165,410 180,410 185,500 170,500" fill={s("calves")} />
    </svg>
  );
}

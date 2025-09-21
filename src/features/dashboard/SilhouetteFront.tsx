import React, { useEffect } from "react";

export type SegmentData = { id: string; label: string; value?: number; fill: string; alpha: number };

export function SilhouetteFront({ segments, showValues }: { segments: SegmentData[]; showValues: boolean }) {
  
  useEffect(() => {
    for (const s of segments) {
      const el = document.getElementById(s.id);
      if (el && el.namespaceURI === "http://www.w3.org/2000/svg") {
        const ns = "http://www.w3.org/2000/svg";
        let t = el.querySelector("title");
        const score = Number((s as any).value ?? 0);
        const label = el.getAttribute("data-muscle") || (s as any).label || (s as any).id;
        const vol = (s as any).volume ?? 0; const tr = (s as any).trend ?? 0;
        const titleText = `Muskel: ${label}, Score ${score.toFixed(2).replace('.', ',')} (${(score*100).toFixed(1).replace('.', ',')} %), Volumen: ${(vol/1000).toFixed(2).replace('.', ',')} k, Trend: ${tr>=0 ? '▲' : '▼'} ${Math.abs(tr*100).toFixed(1).replace('.', ',')} %`;
        if (!t) { t = document.createElementNS(ns, "title"); el.insertBefore(t, el.firstChild); }
        if (t) t.textContent = titleText;
        el.setAttribute("aria-label", titleText);
        el.setAttribute("tabindex", "0");
      }
    }
  }, [segments]);
return (
    <svg viewBox="0 0 320 640" role="img" aria-label="Muskel-Silhouette" className="w-full max-w-[520px] mx-auto block" preserveAspectRatio="xMidYMid meet">
      <defs><style>{`path,rect,circle { stroke: #3f3f46; stroke-width: 1; } * { transition: fill 240ms linear; } @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }`}</style></defs>\n      <g transform="translate(0,0)">
        {/* Torso */}
        <path id="fchest" data-muscle="chest" d="M120,140 L200,140 L220,200 L100,200 Z" fill={getFill(segments, "fchest")} opacity={getAlpha(segments,"fchest")} />
        <path id="fuppercore" data-muscle="upper_core" d="M110,200 L210,200 L210,260 L110,260 Z" fill={getFill(segments, "fuppercore")} opacity={getAlpha(segments,"fuppercore")} />
        <path id="fabs" data-muscle="abs" d="M120,260 L200,260 L200,340 L120,340 Z" fill={getFill(segments, "fabs")} opacity={getAlpha(segments,"fabs")} />
        <path id="ftraps" data-muscle="traps" d="M120,120 L200,120 L200,140 L120,140 Z" fill={getFill(segments, "ftraps")} opacity={getAlpha(segments,"ftraps")} />

        {/* Lats left/right */}
        <path id="flats" data-muscle="lats_left" d="M90,200 C70,230 70,270 95,300 L110,280 L110,220 Z" fill={getFill(segments, "flats")} opacity={getAlpha(segments,"flats")} />
        <path id="frlats" data-muscle="lats_right" d="M230,200 C250,230 250,270 225,300 L210,280 L210,220 Z" fill={getFill(segments, "frlats")} opacity={getAlpha(segments,"frlats")} />

        {/* Delts */}
        <circle id="ffdelts" data-muscle="front_delts_left" cx="95" cy="180" r="18" fill={getFill(segments, "ffdelts")} opacity={getAlpha(segments,"ffdelts")} />
        <circle id="frdelts" data-muscle="front_delts_right" cx="225" cy="180" r="18" fill={getFill(segments, "frdelts")} opacity={getAlpha(segments,"frdelts")} />
        <circle id="fsdelts" data-muscle="side_delts_left" cx="85" cy="210" r="16" fill={getFill(segments, "fsdelts")} opacity={getAlpha(segments,"fsdelts")} />
        <circle id="fsdelts_r" data-muscle="side_delts_right" cx="235" cy="210" r="16" fill={getFill(segments, "fsdelts_r")} opacity={getAlpha(segments,"fsdelts_r")} />

        {/* Biceps */}
        <rect id="fbiceps" data-muscle="biceps_left" x="70" y="240" width="24" height="40" rx="6" fill={getFill(segments, "fbiceps")} opacity={getAlpha(segments,"fbiceps")} />
        <rect id="fbiceps_r" data-muscle="biceps_right" x="226" y="240" width="24" height="40" rx="6" fill={getFill(segments, "fbiceps_r")} opacity={getAlpha(segments,"fbiceps_r")} />

        {/* Forearms */}
        <rect id="fforearms" data-muscle="forearms_left" x="62" y="290" width="22" height="50" rx="6" fill={getFill(segments, "fforearms")} opacity={getAlpha(segments,"fforearms")} />
        <rect id="fforearms_r" data-muscle="forearms_right" x="236" y="290" width="22" height="50" rx="6" fill={getFill(segments, "fforearms_r")} opacity={getAlpha(segments,"fforearms_r")} />

        {/* Quads */}
        <rect id="fquads" data-muscle="quads_left" x="120" y="360" width="34" height="110" rx="10" fill={getFill(segments, "fquads")} opacity={getAlpha(segments,"fquads")} />
        <rect id="fquads_r" data-muscle="quads_right" x="166" y="360" width="34" height="110" rx="10" fill={getFill(segments, "fquads_r")} opacity={getAlpha(segments,"fquads_r")} />

        {/* Calves */}
        <rect id="fcalves" data-muscle="calves_left" x="120" y="480" width="30" height="80" rx="10" fill={getFill(segments, "fcalves")} opacity={getAlpha(segments,"fcalves")} />
        <rect id="fcalves_r" data-muscle="calves_right" x="170" y="480" width="30" height="80" rx="10" fill={getFill(segments, "fcalves_r")} opacity={getAlpha(segments,"fcalves_r")} />
      </g>

      {showValues && segments.map(s => {
        const el = document.getElementById(s.id);
        return null;
      })}
    </svg>
  );
}

function getFill(segments: SegmentData[], id: string): string {
  const s = segments.find(x => x.id === id);
  return s ? withTransition(s.fill) : withTransition("#27272a");
}
function getAlpha(segments: SegmentData[], id: string): number {
  const s = segments.find(x => x.id === id);
  return s ? Math.max(0, Math.min(1, s.alpha)) : 0.3;
}
function withTransition(color: string) {
  return color;
}

import React, { useEffect } from "react";

export type SegmentData = { id: string; label: string; value?: number; fill: string; alpha: number };

export function SilhouetteBack({ segments, showValues }: { segments: SegmentData[]; showValues: boolean }) {
  
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
      {/* Upper back / traps */}
      <path id="bupperback" data-muscle="upper_back" d="M110,140 L210,140 L230,200 L90,200 Z" fill={getFill(segments,"bupperback")} opacity={getAlpha(segments,"bupperback")} />
      <path id="btraps_c" data-muscle="traps" d="M120,120 L200,120 L200,140 L120,140 Z" fill={getFill(segments,"btraps_c")} opacity={getAlpha(segments,"btraps_c")} />
      <rect id="blowerback" data-muscle="lower_back" x="120" y="210" width="80" height="60" rx="6" fill={getFill(segments,"blowerback")} opacity={getAlpha(segments,"blowerback")} />

      {/* Lats */}
      <path id="blats" data-muscle="lats_left" d="M90,200 C70,230 70,270 95,300 L110,280 L110,220 Z" fill={getFill(segments, "blats")} opacity={getAlpha(segments,"blats")} />
      <path id="brlats" data-muscle="lats_right" d="M230,200 C250,230 250,270 225,300 L210,280 L210,220 Z" fill={getFill(segments, "brlats")} opacity={getAlpha(segments,"brlats")} />

      {/* Rear delts */}
      <circle id="breardelts" data-muscle="rear_delts_left" cx="95" cy="200" r="16" fill={getFill(segments, "breardelts")} opacity={getAlpha(segments,"breardelts")} />
      <circle id="breardelts_r" data-muscle="rear_delts_right" cx="225" cy="200" r="16" fill={getFill(segments, "breardelts_r")} opacity={getAlpha(segments,"breardelts_r")} />

      {/* Triceps */}
      <rect id="btriceps" data-muscle="triceps_left" x="70" y="240" width="24" height="40" rx="6" fill={getFill(segments, "btriceps")} opacity={getAlpha(segments,"btriceps")} />
      <rect id="btriceps_r" data-muscle="triceps_right" x="226" y="240" width="24" height="40" rx="6" fill={getFill(segments, "btriceps_r")} opacity={getAlpha(segments,"btriceps_r")} />

      {/* Forearms */}
      <rect id="bforearms" data-muscle="forearms_left" x="62" y="290" width="22" height="50" rx="6" fill={getFill(segments, "bforearms")} opacity={getAlpha(segments,"bforearms")} />
      <rect id="bforearms_r" data-muscle="forearms_right" x="236" y="290" width="22" height="50" rx="6" fill={getFill(segments, "bforearms_r")} opacity={getAlpha(segments,"bforearms_r")} />

      {/* Glutes / Hamstrings / Calves */}
      <rect id="bglutes" data-muscle="glutes_left" x="120" y="360" width="34" height="50" rx="10" fill={getFill(segments, "bglutes")} opacity={getAlpha(segments,"bglutes")} />
      <rect id="bglutes_r" data-muscle="glutes_right" x="166" y="360" width="34" height="50" rx="10" fill={getFill(segments, "bglutes_r")} opacity={getAlpha(segments,"bglutes_r")} />
      <rect id="bhamstrings" data-muscle="hamstrings_left" x="120" y="412" width="34" height="60" rx="10" fill={getFill(segments, "bhamstrings")} opacity={getAlpha(segments,"bhamstrings")} />
      <rect id="bhamstrings_r" data-muscle="hamstrings_right" x="166" y="412" width="34" height="60" rx="10" fill={getFill(segments, "bhamstrings_r")} opacity={getAlpha(segments,"bhamstrings_r")} />
      <rect id="bcalves" data-muscle="calves_left" x="120" y="476" width="30" height="80" rx="10" fill={getFill(segments, "bcalves")} opacity={getAlpha(segments,"bcalves")} />
      <rect id="bcalves_r" data-muscle="calves_right" x="170" y="476" width="30" height="80" rx="10" fill={getFill(segments, "bcalves_r")} opacity={getAlpha(segments,"bcalves_r")} />
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

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAppSettings } from "../../data/stores/appSettings";
const steps = ["welcome","units","experience","frequency","defaults","haptics","import","starter","finish"] as const;
const nextOf=(s:string)=>steps[Math.min(steps.length-1, steps.indexOf(s as any)+1)]||"finish";
const prevOf=(s:string)=>{ const i=steps.indexOf(s as any); return i>0?steps[i-1]:"welcome"; };
export function StickyCTA({ onNext }: { onNext?: ()=>Promise<void>|void }) {
  const nav=useNavigate(); const loc=useLocation(); const current=(loc.pathname.split("/").pop()||"welcome") as string;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] cta-gradient">
      <div className="mx-auto w-full max-w-[540px] px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5 p-2 flex gap-2 items-center min-h-[64px]">
          <button className="min-h-[44px] min-w-[44px] rounded-2xl border border-zinc-700/60 px-4 py-2 text-base se:text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/70" onClick={()=>nav(`/onboarding/${prevOf(current)}`)}>Zurück</button>
          <button className="ml-auto min-h-[44px] min-w-[44px] rounded-2xl bg-accent text-black px-4 py-2 text-base se:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/70 active:scale-[0.98] transition" onClick={async()=>{ if(navigator.vibrate) navigator.vibrate(20); if(onNext) await onNext(); await saveAppSettings({onboardingStep: nextOf(current)}); nav(`/onboarding/${nextOf(current)}`); }}>Weiter</button>
          {current!=="finish" && current!=="welcome" && (<button className="min-h-[44px] min-w-[44px] rounded-2xl px-4 py-2 text-base se:text-sm text-zinc-400" onClick={()=>nav(`/onboarding/${nextOf(current)}`)}>Überspringen</button>)}
        </div>
      </div>
    </div>
  );
}

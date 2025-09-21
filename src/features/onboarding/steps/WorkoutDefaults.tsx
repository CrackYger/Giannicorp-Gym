import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { loadAppSettings, saveAppSettings } from "../../../data/stores/appSettings";
import { ONB } from "../../../i18n/onboarding.de";

export default function WorkoutDefaults() {
  const [rpeMin, setRpeMin] = useState(5);
  const [rpeMax, setRpeMax] = useState(10);
  const [rpeStep, setRpeStep] = useState(0.5);
  const [presets, setPresets] = useState<number[]>([60,90,120,180]);
  const [autofill, setAutofill] = useState(true);

  useEffect(() => { void (async()=> {
    const s = await loadAppSettings();
    setRpeMin(s.rpeMin); setRpeMax(s.rpeMax); setRpeStep(s.rpeStep);
    setPresets(s.restPresets); setAutofill(s.enableAutofillLast);
  })(); }, []);

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">{ONB.defaults_title}</h2>

      <div className="mb-3">
        <div className="text-sm mb-1">RPE Schritte</div>
        <div className="flex gap-2">
          {[0.25,0.5,1].map(s => (
            <button key={s} className={"rounded-2xl px-4 py-2 min-h-[44px] border " + (s===rpeStep? "border-accent/60 text-accent":"border-zinc-700/60")}
              onClick={async ()=>{ setRpeStep(s); await saveAppSettings({ rpeStep: s }); }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm mb-1">Rest-Presets</div>
        <div className="flex gap-2 flex-wrap">
          {[45,60,90,120,180].map(n => (
            <button key={n} className={"rounded-2xl px-4 py-2 min-h-[44px] border " + (presets.includes(n)? "border-accent/60 text-accent":"border-zinc-700/60")}
              onClick={async ()=> {
                const next = presets.includes(n) ? presets.filter(x=>x!==n) : [...presets, n].sort((a,b)=>a-b);
                setPresets(next); await saveAppSettings({ restPresets: next });
              }}>
              {n}s
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={autofill} onChange={async e => { setAutofill(e.target.checked); await saveAppSettings({ enableAutofillLast: e.target.checked }); }} />
        <span>Autofill „Letztes Mal“</span>
      </label>

      <div className="mt-2 text-sm text-zinc-400">{ONB.defaults_nudge}</div>
    </Card>
  );
}\n
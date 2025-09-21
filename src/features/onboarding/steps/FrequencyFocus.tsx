import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { loadAppSettings, saveAppSettings } from "../../../data/stores/appSettings";
import { ONB } from "../../../i18n/onboarding.de";

export default function FrequencyFocus() {
  const [freq, setFreq] = useState<number>(3);
  const sessionsPerYear = freq * 52;

  useEffect(() => { void (async()=> setFreq((await loadAppSettings()).weeklyFrequency))(); }, []);

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">{ONB.freq_title}</h2>
      <div className="flex gap-2 flex-wrap">
        {[2,3,4,5,6].map(n => (
          <button
            key={n}
            onClick={async ()=>{ setFreq(n); await saveAppSettings({ weeklyFrequency: n }); }}
            className={"rounded-2xl px-4 py-2 min-h-[44px] border " + (n===freq ? "border-accent/60 text-accent" : "border-zinc-700/60")}
            aria-pressed={n===freq}
          >{n}×</button>
        ))}
      </div>
      <div className="mt-2 text-sm text-emerald-400">{ONB.freq_live(sessionsPerYear)}</div>
    </Card>
  );
}
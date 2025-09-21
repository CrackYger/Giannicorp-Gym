import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { loadAppSettings, saveAppSettings } from "../../../data/stores/appSettings";
import { createStarterTemplateByFrequency } from "../../../data/stores/plans";
import { ONB } from "../../../i18n/onboarding.de";

export default function StarterTemplate() {
  const [freq, setFreq] = useState(3);
  const [optIn, setOptIn] = useState(true);
  const preview = freq<=3? ONB.starter_preview_ppl : (freq===4? ONB.starter_preview_ul : ONB.starter_preview_ppl);

  useEffect(()=>{ void (async()=> setFreq((await loadAppSettings()).weeklyFrequency))(); },[]);

  async function createIfNeeded() {
    if (!optIn) return;
    const id = await createStarterTemplateByFrequency(freq);
    await saveAppSettings({ createdStarterTemplateId: id });
  }

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">{ONB.starter_title}</h2>
      <div className="flex gap-2 items-center mb-2">
        <span className="rounded-2xl border border-accent/60 text-accent px-3 py-1 text-sm">{preview}</span>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={optIn} onChange={e=>setOptIn(e.target.checked)} />
          Template anlegen
        </label>
      </div>
      <Button onClick={()=>{ void createIfNeeded(); }}>Bestätigen</Button>
    </Card>
  );
}
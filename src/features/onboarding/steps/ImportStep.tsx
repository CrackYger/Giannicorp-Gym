
import { useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { OB } from "../strings";
import { Button } from "../../../shared/ui/Button";
import { parseBackupFile } from "../../../data/backup/import";
import { useNavigate } from "react-router-dom";
import { saveAppSettings } from "../../../data/stores/appSettings";

export default function ImportStep() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onFileSelected(f: File) {
    setBusy(true); setErr(null); setOk(null);
    try {
      const data = await parseBackupFile(f);
      // minimal validation
      setOk(`Import bereit: ${Object.keys(data.data).length} Tabellen`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">Optional: Daten importieren</h2>
      <p className="text-base se:text-sm text-zinc-400 mb-3">Du kannst ein älteres Backup importieren.</p>
      <input type="file" accept=".json" onChange={e=>{ const f=e.target.files?.[0]; if (f) void onFileSelected(f); }} />
      {busy && <div className="mt-2 text-base se:text-sm">Prüfe Datei…</div>}
      {err && <div className="mt-2 text-base se:text-sm text-red-400">{err}</div>}
      {ok && <div className="mt-2 text-base se:text-sm text-emerald-400">{ok}</div>}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={()=> nav(-1)}>Zurück</Button>
        <Button onClick={async()=>{ await saveAppSettings({ onboardingStep: "starter" }); nav("/onboarding/starter"); }}>Weiter</Button>
        <Button variant="ghost" onClick={async()=>{ await saveAppSettings({ onboardingStep: "starter" }); nav("/onboarding/starter"); }}>Überspringen</Button>
      </div>
    </Card>
  );
}

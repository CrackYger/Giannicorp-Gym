
import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { OB } from "../strings";
import { Button } from "../../../shared/ui/Button";
import { loadAppSettings, saveAppSettings } from "../../../data/stores/appSettings";
import { useNavigate } from "react-router-dom";

export default function Haptics() {
  const nav = useNavigate();
  const [haptics, setHaptics] = useState(true);
  const [prb, setPrb] = useState(true);

  useEffect(()=> { void (async()=> {
    const s = await loadAppSettings();
    setHaptics(s.enableHaptics);
    setPrb(s.enablePRBanners);
  })(); },[]);

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">Haptik & PR-Banner</h2>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={haptics} onChange={e=> setHaptics(e.target.checked)} />
        <span className="text-base se:text-sm">Vibrationen bei Aktionen</span>
      </label>
      <label className="mt-2 flex items-center gap-2">
        <input type="checkbox" checked={prb} onChange={e=> setPrb(e.target.checked)} />
        <span className="text-base se:text-sm">PR-Hinweise anzeigen</span>
      </label>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={()=> nav(-1)}>Zurück</Button>
        <Button onClick={async()=>{ await saveAppSettings({ enableHaptics: haptics, enablePRBanners: prb, onboardingStep: "import" }); nav("/onboarding/import"); }}>Weiter</Button>
      </div>
    </Card>
  );
}

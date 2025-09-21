
import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { OB } from "../strings";
import { Button } from "../../../shared/ui/Button";
import { saveAppSettings, loadAppSettings } from "../../../data/stores/appSettings";
import { useNavigate } from "react-router-dom";

export default function Units() {
  const nav = useNavigate();
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  useEffect(() => { void (async()=> { setUnit((await loadAppSettings()).unit); })(); }, []);

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">Einheiten</h2>
      <div className="flex gap-2">
        <button className={["rounded-2xl px-4 py-2 min-h-[44px]", unit==="kg" ? "bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-200"].join(" ")} onClick={()=> setUnit("kg")}>Kilogramm</button>
        <button className={["rounded-2xl px-4 py-2 min-h-[44px]", unit==="lbs" ? "bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-200"].join(" ")} onClick={()=> setUnit("lbs")}>Pounds</button>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={()=> nav(-1)}>Zurück</Button>
        <Button onClick={async()=>{ await saveAppSettings({ unit, onboardingStep: "experience" }); nav("/onboarding/experience"); }}>Weiter</Button>
      </div>
    </Card>
  );
}

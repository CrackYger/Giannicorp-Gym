
import { useEffect, useState } from "react";
import { Card } from "../../../shared/ui/Card";
import { OB } from "../strings";
import { Button } from "../../../shared/ui/Button";
import { loadAppSettings, saveAppSettings, type ExperienceKey, type GoalKey } from "../../../data/stores/appSettings";
import { useNavigate } from "react-router-dom";

export default function ExperienceGoal() {
  const nav = useNavigate();
  const [experience, setExperience] = useState<ExperienceKey>("beginner");
  const [goal, setGoal] = useState<GoalKey>("muscle");

  useEffect(()=> { void (async()=> {
    const s = await loadAppSettings();
    setExperience(s.experience);
    setGoal(s.goal);
  })(); },[]);

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <h2 className="text-2xl font-semibold mb-2">Erfahrung & Ziel</h2>
      <div className="mb-4">
        <div className="text-base se:text-sm text-zinc-400 mb-1">Erfahrung</div>
        <div className="flex gap-2">
          {(["beginner","intermediate","advanced"] as ExperienceKey[]).map(k => (
            <button key={k} className={["rounded-2xl px-4 py-2 min-h-[44px] capitalize", experience===k ? "bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-200"].join(" ")} onClick={()=> setExperience(k)}>{k}</button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="text-base se:text-sm text-zinc-400 mb-1">Ziel</div>
        <div className="flex gap-2">
          {(["muscle","strength","endurance","fatloss"] as GoalKey[]).map(k => (
            <button key={k} className={["rounded-2xl px-4 py-2 min-h-[44px] capitalize", goal===k ? "bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-200"].join(" ")} onClick={()=> setGoal(k)}>{k}</button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" onClick={()=> nav(-1)}>Zurück</Button>
        <Button onClick={async()=>{ await saveAppSettings({ experience, goal, onboardingStep: "frequency" }); nav("/onboarding/frequency"); }}>Weiter</Button>
      </div>
    </Card>
  );
}

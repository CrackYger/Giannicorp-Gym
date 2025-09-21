
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { getPlan, renamePlan, addDay, listPlanDays, renameDay, reorderDay, removeDay, listDayExercises, addExerciseToDay, removeExerciseFromDay, reorderDayExercise } from "../../data/stores/plans";

import type { Plan, PlanDay, PlanDayExercise } from "../../shared/types";

export default function PlanEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState<PlanDay[]>([]);
  const [rename, setRename] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [exs, setExs] = useState<Record<string, PlanDayExercise[]>>({});
  const [qp] = useSearchParams();
  const addSlug = qp.get("add");

  async function refresh() {
    if (!id) return;
    const p = await getPlan(id); if (p) { setPlan(p); setRename(p.name); }
    const d = await listPlanDays(id);
    setDays(d);
    const m: Record<string, PlanDayExercise[]> = {};
    for (const day of d) m[day.id] = await listDayExercises(day.id);
    setExs(m);
  }
  useEffect(()=>{ void refresh(); },[id]);

  useEffect(()=>{
    if (addSlug && selectedDay && id) {
      void (async ()=>{
        await addExerciseToDay(selectedDay, addSlug, { sets: 3, reps_low: 8, reps_high: 12, rpe: 8, rest_sec: 120, warmup_sets: false });
        const m = { ...exs };
        m[selectedDay] = await listDayExercises(selectedDay);
        setExs(m);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSlug, selectedDay]);

  if (!plan) return <div className="p-4">Laden...</div>;

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Plan bearbeiten</h1>
      <Card>
        <div className="flex gap-2 items-center">
          <Input value={rename} onChange={(e)=>setRename(e.target.value)} />
          <Button onClick={async()=>{ if (!id) return; await renamePlan(id, rename.trim()); await refresh(); }}>Umbenennen</Button>
          <Button variant="outline" onClick={async()=>{ if (!id) return; const d = await addDay(id, 'Day '+(days.length+1)); setDays([...days, d]); }}>Day hinzufügen</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {days.map((d, di) => (
          <Card key={d.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input className="bg-transparent border-b border-zinc-700 px-1" value={d.name} onChange={(e)=>{ const v = e.target.value; setDays(prev => prev.map(x=> x.id===d.id ? { ...x, name: v } : x)); }} onBlur={async()=>{ await renameDay(d.id, d.name); }} />
                <div className="text-xs text-zinc-500">#{d.order+1}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={async()=>{ if (di>0){ await reorderDay(plan.id, di, di-1); await refresh(); } }}>↑</Button>
                <Button variant="ghost" onClick={async()=>{ if (di<days.length-1){ await reorderDay(plan.id, di, di+1); await refresh(); } }}>↓</Button>
                <Button variant="outline" onClick={()=>{ setSelectedDay(d.id); }}>Übungen</Button>
                <Button variant="ghost" onClick={async()=>{ await removeDay(d.id); await refresh(); }}>Entfernen</Button>
              </div>
            </div>

            {selectedDay===d.id ? (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <Button onClick={()=> nav('/exercises?addTo=' + d.id)}>Aus Library hinzufügen</Button>
                </div>
                <ul className="divide-y divide-zinc-800">
                  {(exs[d.id] || []).map((x, xi) => (
                    <li key={x.id} className="flex items-center justify-between py-2">
                      <div className="text-sm">
                        <div className="font-medium">{x.exercise_slug}</div>
                        <div className="text-xs text-zinc-500">Sätze {x.defaults.sets} · {x.defaults.reps_low}-{x.defaults.reps_high} · RPE {x.defaults.rpe} · Pause {x.defaults.rest_sec}s</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={async()=>{ if (xi>0){ await reorderDayExercise(d.id, xi, xi-1); await refresh(); } }}>↑</Button>
                        <Button variant="ghost" onClick={async()=>{ if (xi<(exs[d.id]?.length||1)-1){ await reorderDayExercise(d.id, xi, xi+1); await refresh(); } }}>↓</Button>
                        <Button variant="ghost" onClick={async()=>{ await removeExerciseFromDay(x.id); await refresh(); }}>Entfernen</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

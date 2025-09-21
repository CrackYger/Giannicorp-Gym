
import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { createPlan, listPlans, duplicatePlan, archivePlan, ensureStarterPlans } from "../../data/stores/plans";
import type { Plan } from "../../shared/types";
import { useNavigate } from "react-router-dom";

export default function PlanList() {
  const [items, setItems] = useState<Plan[]>([]);
  const [name, setName] = useState("");
  const nav = useNavigate();

  async function refresh() {
    setItems(await listPlans());
  }
  useEffect(()=>{ (async()=>{ await ensureStarterPlans(); await refresh(); })(); },[]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Trainingspläne</h1>
      <Card>
        <div className="flex gap-2">
          <Input placeholder="Neuer Planname" value={name} onChange={(e)=>setName(e.target.value)} />
          <Button onClick={async()=>{ if (!name.trim()) return; const p = await createPlan(name.trim()); setName(''); nav(`/plans/${p.id}`); }}>Anlegen</Button>
        </div>
      </Card>
      <Card>
        <ul className="divide-y divide-zinc-800">
          {items.map(p => (
            <li key={p.id} className="flex items-center justify-between py-2">
              <button className="text-left" onClick={()=> nav(`/plans/${p.id}`)}>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-zinc-500">{new Date(p.updated_at).toLocaleDateString()}</div>
              </button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={async()=>{ const np = await duplicatePlan(p.id); if (np) { await refresh(); }}}>Duplizieren</Button>
                <Button variant="ghost" onClick={async()=>{ await archivePlan(p.id); await refresh(); }}>Archivieren</Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

import * as React from "react";
import type { PlanDayExerciseDefaults, Exercise } from "../../shared/types";
import { searchExercises, listExercises } from "../../data/stores/exercises";

export function BulkAddDialog({ open, onClose, onConfirm }:{ open:boolean; onClose:()=>void; onConfirm:(slugs:string[], defs:PlanDayExerciseDefaults)=>void }){
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<Exercise[]>([]);
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  const [defs, setDefs] = React.useState<PlanDayExerciseDefaults>({ sets:3, reps_low:8, reps_high:12, rpe:8, rest_sec:90, warmup_sets:false, notes:"" });

  React.useEffect(()=>{ void (async()=> setItems(await listExercises()))(); },[]);
  React.useEffect(()=>{ if (q) void (async()=> setItems(await searchExercises(q)))(); },[q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex">
      <div className="m-auto w-[92vw] max-w-md rounded-2xl bg-zinc-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bulk-Add Übungen</h2>
          <button onClick={onClose} className="text-zinc-400">Schließen</button>
        </div>

        <input className="w-full rounded-xl bg-zinc-800 px-3 py-2" placeholder="Suche..." value={q} onChange={e=>setQ(e.target.value)} />

        <div className="h-56 overflow-auto rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {items.map(e => {
            const key = (e as any).slug || String(e.id);
            const checked = !!sel[key];
            return (
              <label key={key} className="flex items-center gap-2 px-3 py-2">
                <input type="checkbox" checked={checked} onChange={()=> setSel(s=> ({...s, [key]: !checked}))} />
                <span className="truncate">{(e as any).name_de || e.name}</span>
                <span className="ml-auto text-xs text-zinc-500">{(e as any).equipment}</span>
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-zinc-400">Sätze
            <input type="number" min={1} max={10} className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.sets} onChange={e=>setDefs({...defs, sets: Number(e.target.value)})} />
          </label>
          <label className="text-xs text-zinc-400">RPE
            <input type="number" min={5} max={10} className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.rpe} onChange={e=>setDefs({...defs, rpe: Number(e.target.value)})} />
          </label>
          <label className="text-xs text-zinc-400">Reps von
            <input type="number" min={1} max={30} className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.reps_low} onChange={e=>setDefs({...defs, reps_low: Number(e.target.value)})} />
          </label>
          <label className="text-xs text-zinc-400">Reps bis
            <input type="number" min={1} max={30} className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.reps_high} onChange={e=>setDefs({...defs, reps_high: Number(e.target.value)})} />
          </label>
          <label className="col-span-2 text-xs text-zinc-400">Rest (Sek.)
            <input type="number" min={0} max={600} className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.rest_sec} onChange={e=>setDefs({...defs, rest_sec: Number(e.target.value)})} />
          </label>
          <label className="col-span-2 text-xs text-zinc-400">Notizen/Tempo
            <input className="w-full rounded bg-zinc-800 px-2 py-1" value={defs.notes||""} onChange={e=>setDefs({...defs, notes: e.target.value})} />
          </label>
        </div>

        <button
          className="w-full rounded-xl bg-emerald-600 py-2 font-medium"
          onClick={()=> onConfirm(Object.keys(sel).filter(k=>sel[k]), defs)}
        >
          Hinzufügen
        </button>
      </div>
    </div>
  );
}

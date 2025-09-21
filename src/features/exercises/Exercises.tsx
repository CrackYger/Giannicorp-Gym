
import { useEffect, useMemo, useState } from "react";
import { Input } from "../../shared/ui/Input";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Toggle } from "../../shared/ui/Toggle";
import { listExercises, searchExercises, toggleFavorite } from "../../data/stores/exercises";
import type { Exercise } from "../../shared/types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { seedStandardExercises } from "../../data/seeds/exercises.seed";

const EQUIP: string[] = ["barbell","dumbbell","machine","cable","bodyweight","kettlebell","bands","ez","other"];
const MECH: string[] = ["hinge","squat","push","pull","carry","rotation","anti-rotation"];

function ExerciseRow({ e, onAdd, onToggleFav }:{ e: Exercise; onAdd?: ()=>void; onToggleFav: ()=>void }) {
  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="min-w-0">
        <div className="truncate">{(e as any).name_de || e.name}</div>
        <div className="text-xs text-zinc-500 truncate">{(e as any).alt_names?.slice(0,3)?.join(", ")}</div>
      </div>
      <div className="flex items-center gap-2">
        {onAdd ? <Button size="sm" onClick={onAdd}>Hinzufügen</Button> : null}
        <button
          aria-label="Favorit"
          className={"p-1 rounded " + (e.isFavorite ? "text-yellow-400" : "text-zinc-500")}
          onClick={onToggleFav}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={e.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Exercises() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Exercise[]>([]);
  const [eq, setEq] = useState<string[]>([]);
  const [me, setMe] = useState<string[]>([]);
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const addTo = sp.get("addTo"); // plan_day_id

  useEffect(()=>{
    void (async()=>{
      const all = await listExercises();
      setItems(all);
    })();
  },[]);

  useEffect(()=>{ void (async()=>{ try { await seedStandardExercises(); } catch(e) {} })(); },[]);

  const filtered = useMemo(()=>{
    const runSearch = async()=>{
      if (!q) return;
      const r = await searchExercises(q);
      setItems(r);
    };
    if (q) void runSearch();
    let arr = items;
    if (eq.length) arr = arr.filter(e => eq.includes(((e as any).equipment||"other") as string));
    if (me.length) arr = arr.filter(e => me.includes(((e as any).mechanics||"") as string));
    arr = [...arr].sort((a,b)=> (b.isFavorite?1:0) - (a.isFavorite?1:0));
    return arr;
  }, [items, eq.join(","), me.join(","), q]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Übungsbibliothek</h1>
      <div className="flex gap-2">
        <Input placeholder="Suche (Name, Synonym, Gerät)..." value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {EQUIP.map(k => (
          <Toggle key={k} pressed={eq.includes(k)} onPressedChange={(v)=> setEq(p=> v ? p.concat(k) : p.filter(x=>x!==k))}>{k}</Toggle>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {MECH.map(k => (
          <Toggle key={k} pressed={me.includes(k)} onPressedChange={(v)=> setMe(p=> v ? p.concat(k) : p.filter(x=>x!==k))}>{k}</Toggle>
        ))}
      </div>
      <Card>
        {filtered.length === 0 ? (
          <p className="text-zinc-400">Keine Einträge.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {filtered.map(e => (
              <li key={e.id}>
                <ExerciseRow
                  e={e}
                  onAdd={addTo ? (()=> nav('/plans/' + addTo + '?add=' + String((e as any).slug || ""))) : undefined}
                  onToggleFav={()=>{ void (async()=>{ await toggleFavorite(e.id); setItems(prev => prev.map(x=> x.id===e.id ? {...x, isFavorite: !x.isFavorite} : x)); })(); }}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

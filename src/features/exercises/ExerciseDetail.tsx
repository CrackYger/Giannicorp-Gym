import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { db } from "../../data/db";

type Row = { date: string; weight: number; reps: number; rpe: number; workoutId: string };

export default function ExerciseDetail() {
  const { id } = useParams();
  const [name, setName] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const nav = useNavigate();
  const [qp] = useSearchParams();

  useEffect(() => {
    void (async () => {
      if (!id) return;
      const e = await db.exercises.get(id);
      setName(e?.name ?? "Übung");
      const sets = await db.sets.where("exerciseId").equals(id).reverse().sortBy("createdAt");
      const out: Row[] = sets.slice(0, 50).map(s => ({
        date: new Date(s.createdAt).toLocaleString(),
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        workoutId: s.workoutId,
      }));
      setRows(out);
    })();
  }, [id]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{name}</h1>
        <button className="text-sm text-emerald-500" onClick={()=>nav('/history')}>Verlauf</button>
      </div>
      <Card>
        {rows.length === 0 ? <div className="text-sm text-zinc-400">Keine Sätze gefunden.</div> : (
          <ul className="divide-y divide-zinc-800">
            {rows.map((r,i)=> (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-400">{r.date}</span>
                <span className="tabular-nums">{r.weight}×{r.reps} · RPE {r.rpe}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

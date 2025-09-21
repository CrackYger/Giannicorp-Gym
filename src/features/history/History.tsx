import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { listCompletedWorkouts } from "../../data/stores/workouts";
import { listSetsForWorkout } from "../../data/stores/sets";
import { useNavigate } from "react-router-dom";

export default function History() {
  const nav = useNavigate();
  const [items, setItems] = useState<{ id: string; date: string; duration: string; sets: number; exercises: number }[]>([]);

  useEffect(() => {
    void (async () => {
      const wos = await listCompletedWorkouts();
      const rows: typeof items = [];
      for (const w of wos) {
        const sets = await listSetsForWorkout(w.id);
        const exCount = new Set(sets.map((s) => s.exerciseId)).size;
        const start = new Date(w.startedAt);
        const end = w.endedAt ? new Date(w.endedAt) : new Date();
        const duration = Math.round((end.getTime() - start.getTime()) / 60000); // min
        rows.push({ id: w.id, date: start.toLocaleString(), duration: `${duration}m`, sets: sets.length, exercises: exCount });
      }
      setItems(rows.reverse());
    })();
  }, []);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Verlauf</h1>
      {items.length === 0 ? <Card><p className="text-zinc-300">Noch keine Workouts.</p><div className="text-sm text-zinc-400 mt-2">Noch keine Workouts – <a href="/start" className="underline underline-offset-2">Workout starten</a></div></Card> : null}
      <div className="space-y-2">
        {items.map((x) => (
          <button key={x.id} className="w-full text-left" onClick={() => nav(`/history/${x.id}`)}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{x.date}</div>
                  <div className="text-xs text-zinc-400">{x.exercises} Übungen • {x.sets} Sätze</div>
                </div>
                <div className="text-sm">{x.duration}</div>
              </div>
            <div className="text-sm text-zinc-400 mt-2">Noch keine Workouts – <a href="/start" className="underline underline-offset-2">Workout starten</a></div></Card>
          </button>
        ))}
      </div>
    </div>
  );
}

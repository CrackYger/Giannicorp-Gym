import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { computeMuscleAgg } from "../dashboard/agg";
import { db } from "../../data/db";
import { useNavigate } from "react-router-dom";
import { useHeatmapPrefs } from "../heatmapPrefs/useHeatmapPrefs";

type Suggestion = { muscle: string; exercises: { id: string; name: string }[] };

const MUSCLE_LABEL: Record<string,string> = {
  chest: "Brust", lats: "Lat", delts: "Schultern", biceps: "Bizeps", triceps: "Trizeps",
  forearms: "Unterarme", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Waden", abs: "Bauch", obliques: "Seitbauch", lower_back: "Unterer Rücken", traps: "Trapez"
};

export default function Undertrained() {
  const { selected_period } = useHeatmapPrefs();
  const nav = useNavigate();
  const [items, setItems] = useState<Suggestion[]>([]);

  useEffect(() => {
    void (async () => {
      const agg = await computeMuscleAgg(selected_period);
      const muscles = Object.entries(agg).sort((a,b)=> a[1].score - b[1].score).slice(0,3).map(([m])=>m);
      const out: Suggestion[] = [];
      for (const m of muscles) {
        const list = await db.exercises.toArray();
        const candidates = list.filter(e => (e.muscles && e.muscles[m] && e.muscles[m] > 0))
                               .sort((a,b)=> (b.isFavorite?1:0) - (a.isFavorite?1:0))
                               .slice(0,3)
                               .map(e => ({ id: e.id, name: e.name }));
        out.push({ muscle: m, exercises: candidates });
      }
      setItems(out);
    })();
  }, [selected_period]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Untertrainiert</h1>
      <Card>
        {items.length === 0 ? <div className="text-sm text-zinc-400">Keine Daten.</div> : (
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.muscle} className="border-b border-zinc-800 pb-3">
                <div className="font-medium">{MUSCLE_LABEL[it.muscle] ?? it.muscle}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {it.exercises.map(ex => (
                    <button key={ex.id} className="px-3 py-1 rounded-lg border border-zinc-700 text-sm"
                      onClick={() => nav(`/exercises/${ex.id}?tab=pr`)}>{ex.name}</button>
                  ))}
                  <button className="ml-auto px-3 py-1 rounded-lg border border-zinc-700 text-sm" onClick={()=>nav("/start?pick=1")}>
                    Aus Vorlage starten
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

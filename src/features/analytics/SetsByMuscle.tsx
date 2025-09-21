import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { VirtualList } from "../history/VirtualList";
import { db } from "../../data/db";
import { periodRange } from "../../shared/constants/periods";
import { useHeatmapPrefs } from "../heatmapPrefs/useHeatmapPrefs";

type Row = { muscle: string; sets: number; volume: number };

const MUSCLE_LABEL: Record<string,string> = {
  chest: "Brust", lats: "Lat", delts: "Schultern", biceps: "Bizeps", triceps: "Trizeps",
  forearms: "Unterarme", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Waden", abs: "Bauch", obliques: "Seitbauch", lower_back: "Unterer Rücken", traps: "Trapez"
};

export default function SetsByMuscle() {
  const { selected_period } = useHeatmapPrefs();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void (async () => {
      const { start, end } = periodRange(selected_period);
      const completed = await db.workouts.where("status").equals("completed").toArray();
      const ids = new Set<string>();
      for (const w of completed) {
        const ws = new Date(w.startedAt);
        const include = selected_period === "last"
          ? (w.id === completed.sort((a,b)=>a.startedAt<b.startedAt?1:-1)[0]?.id)
          : ((start ?? new Date(0)) <= ws && ws <= end);
        if (include) ids.add(w.id);
      }
      const sets = [];
      for (const id of ids) sets.push(...await db.sets.where("workoutId").equals(id).toArray());
      const map: Record<string, Row> = {};
      for (const s of sets) {
        if (s.effectiveVolume <= 0) continue;
        for (const [m, pct] of Object.entries(s.targetMuscles || {})) {
          const r = map[m] ?? { muscle: m, sets: 0, volume: 0 };
          r.sets += 1;
          r.volume += s.effectiveVolume * (pct/100);
          map[m] = r;
        }
      }
      const out = Object.values(map).sort((a,b)=> b.sets - a.sets);
      setRows(out);
    })();
  }, [selected_period]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Sätze je Muskel</h1>
      <Card>
        {rows.length === 0 ? <div className="text-sm text-zinc-400">Keine Daten im Zeitraum.</div> : (
          <VirtualList
            items={rows}
            rowHeight={48}
            renderRow={(r) => (
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <span>{MUSCLE_LABEL[r.muscle] ?? r.muscle}</span>
                <span className="tabular-nums text-sm text-zinc-400">{r.sets} Sätze · {r.volume.toFixed(0)} Vol</span>
              </div>
            )}
          />
        )}
      </Card>
    </div>
  );
}

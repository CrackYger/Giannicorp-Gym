import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { db } from "../../data/db";
import { periodRange, ymd } from "../../shared/constants/periods";
import { useHeatmapPrefs } from "../heatmapPrefs/useHeatmapPrefs";

export default function Frequency() {
  const { selected_period } = useHeatmapPrefs();
  const [daysPerWeek, setDaysPerWeek] = useState<number>(0);
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const { start, end } = periodRange(selected_period);
      const completed = await db.workouts.where("status").equals("completed").toArray();
      const ids = completed
        .filter(w => (selected_period === "last") ? true : ((start ?? new Date(0)) <= new Date(w.startedAt) && new Date(w.startedAt) <= end))
        .map(w => w.id);
      const setDays = new Set<string>();
      for (const id of ids) {
        const s = await db.sets.where("workoutId").equals(id).toArray();
        for (const row of s) setDays.add(ymd(new Date(row.createdAt)));
      }
      const all = Array.from(setDays).sort();
      setDays(all);
      if (all.length > 0 && start) {
        const weeks = Math.max(1, Math.ceil((end.getTime() - start.getTime())/ (7*86400000)));
        setDaysPerWeek(Number((all.length / weeks).toFixed(2)));
      } else {
        setDaysPerWeek(all.length > 0 ? 1 : 0);
      }
    })();
  }, [selected_period]);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Trainingsfrequenz</h1>
      <Card>
        <div className="text-sm text-zinc-400 mb-2">Ø Tage / Woche: <span className="tabular-nums">{daysPerWeek}</span></div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => <div key={d} title={d} className="h-4 rounded bg-emerald-600" />)}
        </div>
      </Card>
    </div>
  );
}

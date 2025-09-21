import * as React from "react";
import type { PeriodKey } from "../../shared/types";
import { db } from "../../data/db";
import { periodRange, daysBetween } from "../../shared/constants/periods";

type Row = { muscle: string; setsPerWeek: number };

export const WeeklySetsKPI: React.FC<{ period: PeriodKey }> = ({ period }) => {
  const [rows, setRows] = React.useState<Row[]>([]);
  React.useEffect(() => {
    (async () => {
      const p = period === "last" ? "30" as PeriodKey : period;
      const { start, end } = periodRange(p);
      if (!start) return;
      const completed = await db.workouts.where("status").equals("completed").toArray();
      const wids = new Set<string>();
      for (const w of completed) {
        const d = new Date(w.startedAt);
        if (d >= start && d <= end) wids.add(w.id);
      }
      const sets = await db.sets.where("workoutId").anyOf([...wids]).toArray();
      const buckets: Record<string, number> = {};
      for (const s of sets) {
        if (s.warmup || s.isWorking === false) continue;
        const m = s.targetMuscles || {};
        const denom = Object.values(m).reduce((a,b)=>a+b,0) || 100;
        for (const [k, v] of Object.entries(m)) {
          buckets[k] = (buckets[k] ?? 0) + (v/denom);
        }
      }
      const weeks = Math.max(1, daysBetween(start, end) / 7);
      const out = Object.entries(buckets).map(([muscle, count]) => ({ muscle, setsPerWeek: count / weeks }));
      out.sort((a,b)=> b.setsPerWeek - a.setsPerWeek);
      setRows(out.slice(0, 8));
    })();
  }, [period]);
  const colorFor = (x: number) => x < 12 ? "text-amber-400" : (x <= 20 ? "text-emerald-400" : "text-amber-400");
  return (
    <div>
      <div className="mb-2 text-sm text-zinc-400">Wöchentliche Sätze / Muskel (Ziel 12–20)</div>
      <ul className="grid grid-cols-2 gap-2">
        {rows.map((r,i)=>(
          <li key={i} className="rounded-lg border border-zinc-800 px-3 py-2 flex items-center justify-between">
            <span className="text-zinc-300">{r.muscle}</span>
            <span className={"font-semibold " + colorFor(r.setsPerWeek)}>{r.setsPerWeek.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

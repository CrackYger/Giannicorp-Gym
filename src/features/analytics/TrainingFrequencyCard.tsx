import * as React from "react";
import { db } from "../../data/db";

export const TrainingFrequencyCard: React.FC = () => {
  const [c7, setC7] = React.useState(0);
  const [c30, setC30] = React.useState(0);
  React.useEffect(() => {
    (async () => {
      const now = new Date();
      const start7 = new Date(now.getTime() - 7*86400000);
      const start30 = new Date(now.getTime() - 30*86400000);
      const done = await db.workouts.where("status").equals("completed").toArray();
      const days7 = new Set<string>(); const days30 = new Set<string>();
      for (const w of done) {
        const d = new Date(w.startedAt); const key = d.toISOString().slice(0,10);
        if (d >= start7) days7.add(key);
        if (d >= start30) days30.add(key);
      }
      setC7(days7.size); setC30(days30.size);
    })();
  }, []);
  return (
    <div>
      <div className="mb-2 text-sm text-zinc-400">Trainingsfrequenz</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-800 px-3 py-2 text-center">
          <div className="text-xs text-zinc-500">7 Tage</div>
          <div className="text-xl font-semibold">{c7}</div>
        </div>
        <div className="rounded-lg border border-zinc-800 px-3 py-2 text-center">
          <div className="text-xs text-zinc-500">30 Tage</div>
          <div className="text-xl font-semibold">{c30}</div>
        </div>
      </div>
    </div>
  );
};

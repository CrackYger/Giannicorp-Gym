import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { listSetsForWorkout } from "../../data/stores/sets";
import { db } from "../../data/db";
import type { Exercise, SetEntry } from "../../shared/types";

export default function HistoryDetail() {
  const { id } = useParams();
  const workoutId = id!;
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exMap, setExMap] = useState<Map<string, Exercise>>(new Map());

  useEffect(() => {
    void (async () => {
      const s = await listSetsForWorkout(workoutId);
      setSets(s);
      const map = new Map<string, Exercise>();
      for (const e of await db.exercises.toArray()) map.set(e.id, e);
      setExMap(map);
    })();
  }, [workoutId]);

  const grouped = useMemo(() => {
    const g = new Map<string, SetEntry[]>();
    for (const s of sets) {
      const arr = g.get(s.exerciseId) ?? [];
      arr.push(s);
      g.set(s.exerciseId, arr);
    }
    return g;
  }, [sets]);

  if (sets.length === 0) {
    return (
      <div className="mx-auto max-w-screen-sm p-4">
        <Card><p className="text-zinc-300">Keine Sätze.</p></Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Workout Details</h1>
      {[...grouped.entries()].map(([exId, sArr]) => {
        const ex = exMap.get(exId);
        return (
          <Card key={exId}>
            <div className="mb-2 font-medium">{ex?.name ?? "Übung"}</div>
            <div className="space-y-1">
              {sArr.map((s) => (
                <div key={s.id} className="text-sm text-zinc-300">
                  {s.warmup ? "[WU] " : ""} {s.weight} × {s.reps} • RPE {s.rpe.toFixed(1)} {s.restSeconds ? `• Rest ${s.restSeconds}s` : ""}
                  {s.notes ? ` • ${s.notes}` : ""}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { getWorkout, completeWorkout, discardWorkout } from "../../data/stores/workouts";
import { listSetsForWorkout } from "../../data/stores/sets";
import type { SetEntry } from "../../shared/types";
import { fmtDuration } from "../../shared/lib/utils";
import { previewProgressionForWorkout } from "../../data/stores/progression";
import { checkBadgesAfterWorkout } from "../../data/stores/badges";
import { useToast } from "../../shared/ui/Toast";

export default function Review() {
  const nav = useNavigate();
  const { id } = useParams();
  const workoutId = id!;
  const toast = useToast();
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [suggestions, setSuggestions] = useState<{ name: string; text: string }[]>([]);
  const [todaysPRs, setTodaysPRs] = useState<{ name: string; text: string }[]>([]);
  const [summary, setSummary] = useState<{ totalVolume: number; avgRpe: number }>({ totalVolume: 0, avgRpe: 0 });

  useEffect(() => {
    void (async () => {
      const w = await getWorkout(workoutId);
      setStartedAt(w?.startedAt ? new Date(w.startedAt) : null);
      const s = await listSetsForWorkout(workoutId);
      setSets(s);

      const p = await previewProgressionForWorkout(workoutId);
      setSummary(p.summary);
      setSuggestions(p.list.map(r => ({
        name: r.exercise.name,
        text: `${r.suggestion.nextWeight.toFixed(1)} × ${r.suggestion.nextRepsLow}-${r.suggestion.nextRepsHigh}`
      })));
      setTodaysPRs(p.prs.map(pr => ({ name: pr.category.toUpperCase(), text: `${pr.value} (${pr.meta ? JSON.stringify(pr.meta) : ""})` })));
    })();
  }, [workoutId]);

  const durationMs = startedAt ? Date.now() - startedAt.getTime() : 0;

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Workout Review</h1>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-zinc-400 text-sm">Dauer</div><div className="text-lg">{fmtDuration(durationMs)}</div></div>
          <div><div className="text-zinc-400 text-sm">Ø RPE</div><div className="text-lg">{summary.avgRpe.toFixed(2)}</div></div>
          <div><div className="text-zinc-400 text-sm">Volumen</div><div className="text-lg">{summary.totalVolume.toFixed(0)}</div></div>
        </div>
      </Card>

      <Card>
        <div className="mb-2 font-medium">Vorschläge für nächste Einheit</div>
        {suggestions.length === 0 ? <div className="text-sm text-zinc-400">Mehr Daten nötig.</div> : (
          <ul className="list-disc pl-5 space-y-1">
            {suggestions.map((s) => <li key={s.name}><span className="text-zinc-300">{s.name}:</span> {s.text}</li>)}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-2 font-medium">Heute erreichte PRs</div>
        {todaysPRs.length === 0 ? <div className="text-sm text-zinc-400">Keine PRs heute.</div> : (
          <ul className="list-disc pl-5 space-y-1">
            {todaysPRs.map((p, i) => <li key={i}><span className="text-zinc-300">{p.name}:</span> {p.text}</li>)}
          </ul>
        )}
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => nav(-1)}>Zurück</Button>
        <Button variant="outline" onClick={async () => { await discardWorkout(workoutId); nav("/history"); }}>Verwerfen</Button>
        <Button onClick={async () => { await completeWorkout(workoutId); const awarded = await checkBadgesAfterWorkout(workoutId); for (const c of awarded) { toast.show("success", `Badge: ${c}`); } nav("/history"); }}>Speichern</Button>
      </div>
    </div>
  );
}

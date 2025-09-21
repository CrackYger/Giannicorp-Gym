import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Chip } from "../../shared/ui/Chip";
import type { PeriodKey } from "../../shared/types";
import type { HeatmapPrefs } from "../heatmapPrefs/types";
import { useHeatmapPrefs } from "../heatmapPrefs/useHeatmapPrefs";
import { DashboardHeatmapSection as HeatmapSection } from "../heatmapPrefs/DashboardHeatmapSection";
import { TrendChart } from "./TrendChart";
import { HeatmapV2 } from "./HeatmapV2";
import { useAggWorker } from "./useAggWorker";
import { computeMuscleAgg, computeTrend } from "./agg";
import { listTargets } from "../../data/stores/targets";
import { recentPRs } from "../../data/stores/prs";
import { getActiveWorkout, startNewWorkout } from "../../data/stores/workouts";
import { BadgesCard } from "./BadgesCard";
import { useViewer, getAuthUserId } from "../coachlite/viewerStore";
import { setSelectedView } from "../../data/stores/prefs";

type TrendGroup = "day" | "week";
type TargetRow = { exerciseId: string; name: string; next_weight: number; next_reps_low: number; next_reps_high: number };
type PRItem = { id: string; exerciseId: string; exerciseName: string; category: string; value: number; delta: number; createdAt: string };

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "last", label: "Letztes" },
  { key: "7", label: "7" },
  { key: "14", label: "14" },
  { key: "30", label: "30" },
  { key: "90", label: "90" },
  { key: "180", label: "180" },
  { key: "365", label: "365" },
  { key: "all", label: "All" },
];

const MUSCLE_LABEL: Record<string, string> = {
  chest: "Brust", lats: "Lat", delts: "Schultern", biceps: "Bizeps", triceps: "Trizeps",
  forearms: "Unterarme", quads: "Quads", hamstrings: "Hamstrings", glutes: "Glutes",
  calves: "Waden", abs: "Bauch", obliques: "Seitbauch", lower_back: "Unterer Rücken", traps: "Trapez",
};

function weekOfYear(date: Date): number {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date.getTime() - firstJan.getTime()) / 86400000);
  return Math.ceil((pastDays + firstJan.getDay() + 1) / 7);
}

function HeatmapBody({ prefs }: { prefs: HeatmapPrefs }) {
  const side = prefs.side_mode as any;
  const period = prefs.selected_period;
  const { heatmap, error } = useAggWorker(period, side);

  useEffect(() => {
    // HeatmapV2 liest die Selektion aus Dexie; hier synchronisieren
    void setSelectedView(prefs.selected_view);
  }, [prefs.selected_view]);

  if (error) {
    return <div className="p-3 text-sm text-red-400">{error}</div>;
  }
  return (
    <HeatmapV2
      data={heatmap as any}
      side={side}
      period={period}
      view={prefs.selected_view as any}
      showValues={prefs.show_values}
    />
  );
}

export default function Dashboard() {
  const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

  const nav = useNavigate();
  const prefs = useHeatmapPrefs();
  const { viewerUserId } = useViewer();

  const [group, setGroup] = useState<TrendGroup>("day");
  const [avgSetsPerWeek, setAvgSetsPerWeek] = useState<number>(0);
  const [freqDaysPerWeek, setFreqDaysPerWeek] = useState<number>(0);
  const [undertrained, setUndertrained] = useState<{ muscle: string; score: number }[]>([]);
  const [trend, setTrend] = useState<{ date: string; volume: number }[]>([]);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [prs, setPRs] = useState<PRItem[]>([]);
  const [hasActive, setHasActive] = useState<boolean>(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const id = await getAuthUserId();
        setMyId(id);
      } catch {
        setMyId(null);
      }
    })();
  }, []);

  // Daten laden (nur UI, keine Logikänderung)
  useEffect(() => {
    void (async () => {
      // Trend
      const t = await computeTrend(prefs.selected_period);
      setTrend(t);

      // Untertrainiert
      const agg = await computeMuscleAgg(prefs.selected_period);
      const mins = Object.entries(agg)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 3)
        .map(([m, a]) => ({ muscle: m, score: a.score }));
      setUndertrained(mins);

      // Sätze/Frequenz
      const { periodRange } = await import("../../shared/constants/periods");
      const { db } = await import("../../data/db");
      const { start, end } = periodRange(prefs.selected_period);
      const completed = await db.workouts.where("status").equals("completed").toArray();
      const ids = completed
        .filter(w =>
          prefs.selected_period === "last"
            ? true
            : ((start ?? new Date(0)) <= new Date(w.startedAt) && new Date(w.startedAt) <= end)
        )
        .map(w => w.id);

      const allSets: any[] = [];
      for (const id of ids) {
        allSets.push(...await db.sets.where("workoutId").equals(id).toArray());
      }

      const totalSets = allSets.filter(s => s.effectiveVolume > 0).length;
      const dayKeys = new Set(allSets.map(s => String(s.createdAt).slice(0, 10)));

      if (start) {
        const weeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 86400000)));
        setAvgSetsPerWeek(Number((totalSets / weeks).toFixed(1)));
        setFreqDaysPerWeek(Number((dayKeys.size / weeks).toFixed(2)));
      } else {
        setAvgSetsPerWeek(totalSets);
        setFreqDaysPerWeek(dayKeys.size);
      }

      // Ziele
      const tgs = await listTargets(5);
      setTargets(tgs.map(t => ({
        exerciseId: t.exerciseId,
        name: t.exerciseName,
        next_weight: t.next_weight,
        next_reps_low: t.next_reps_low,
        next_reps_high: t.next_reps_high,
      })));

      // PRs
      const rec = await recentPRs(14);
      const exTable = (await import("../../data/db")).db.exercises;
      const prItems: PRItem[] = [];
      for (const r of rec) {
        const ex = await exTable.get(r.exerciseId);
        prItems.push({
          id: r.id,
          exerciseId: r.exerciseId,
          exerciseName: ex?.name ?? "Übung",
          category: r.category,
          value: r.value,
          delta: r.delta ?? 0,
          createdAt: r.createdAt,
        });
      }
      setPRs(prItems);

      // Active
      setHasActive(!!(await getActiveWorkout()));
    })();
  }, [prefs.selected_period]);

  const trendGrouped = useMemo(() => {
    if (group === "week") {
      const byWeek: Record<string, number> = {};
      for (const p of trend) {
        const k = p.date.includes("-W")
          ? p.date
          : `${p.date.slice(0, 4)}-W${weekOfYear(new Date(p.date))}`;
        byWeek[k] = (byWeek[k] ?? 0) + p.volume;
      }
      return Object.entries(byWeek)
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([date, volume]) => ({ date, volume }));
    }
    return trend;
  }, [trend, group]);

  const readOnly = !!viewerUserId && !!myId && viewerUserId !== myId;

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-5 space-y-4">
      {/* Header / Top-Leiste */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2 py-1 rounded-lg border border-zinc-800 text-sm">Ansicht: Ich</span>

        <div className="flex flex-wrap items-center gap-1 ml-auto">
          {PERIODS.map(p => (
            <Chip key={p.key} active={prefs.selected_period === p.key} onClick={() => prefs.setPeriod(p.key)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Chip active={prefs.selected_view === "front"} onClick={() => prefs.setView("front")}>Front</Chip>
            <Chip active={prefs.selected_view === "back"} onClick={() => prefs.setView("back")}>Back</Chip>
          </div>

          <div className="flex items-center gap-1">
            {(["both", "left", "right"] as const).map(s => (
              <Chip key={s} active={prefs.side_mode === s} onClick={() => prefs.setSide(s)}>
                {s === "both" ? "Beide" : s === "left" ? "Links" : "Rechts"}
              </Chip>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Chip active={prefs.show_values} onClick={() => prefs.toggleValues()}>Werte anzeigen</Chip>
            <Chip active={prefs.exclude_warmups} onClick={() => prefs.toggleExcludeWarmups()}>Warm-ups aus</Chip>
          </div>
        </div>
      </Card>

      {/* Exakt eine Heatmap */}
      <HeatmapSection renderBody={(p) => <HeatmapBody prefs={p} />} />

      {/* KPI-Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <button className="w-full text-left" onClick={() => nav("/analytics/sets-by-muscle")}>
            <div className="text-xs text-zinc-400">Wöchentliche Sätze (Ø)</div>
            <div className="text-3xl tabular-nums font-semibold mt-1">{nf.format(avgSetsPerWeek)}</div>
            <div className="text-xs text-zinc-500 mt-1">Tippen für Details</div>
          </button>
        </Card>
        <Card>
          <button className="w-full text-left" onClick={() => nav("/analytics/frequency")}>
            <div className="text-xs text-zinc-400">Trainingsfrequenz</div>
            <div className="text-3xl tabular-nums font-semibold mt-1">
              {nf.format(freqDaysPerWeek)} Tage/Woche
            </div>
            <div className="text-xs text-zinc-500 mt-1">Tippen für Timeline</div>
          </button>
        </Card>
      </div>

      {/* Untertrainiert */}
      <Card>
        <button className="w-full text-left" onClick={() => nav("/analytics/undertrained")}>
          <div className="text-xs text-zinc-400">Untertrainiert (Top-3)</div>
          {undertrained.length === 0 ? (
            <div className="text-sm text-zinc-500 mt-1">Keine Daten.</div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {undertrained.map(u => (
                <span key={u.muscle} className="px-2 py-1 rounded-md border border-zinc-700 text-sm">
                  {MUSCLE_LABEL[u.muscle] ?? u.muscle}
                </span>
              ))}
            </div>
          )}
        </button>
      </Card>

      {/* Volumen-Trend */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-zinc-400">Volumen-Trend</div>
          <div className="flex items-center gap-1">
            <Chip active={group === "day"} onClick={() => setGroup("day")}>Tag</Chip>
            <Chip active={group === "week"} onClick={() => setGroup("week")}>Woche</Chip>
          </div>
        </div>
        <button className="w-full text-left" onClick={() => nav(`/history?period=${prefs.selected_period}`)}>
          <TrendChart data={trendGrouped} />
        </button>
      </Card>

      {/* Nächste Ziele */}
      <Card>
        <div className="mb-2 text-sm text-zinc-400">Nächste Ziele</div>
        {targets.length === 0 ? (
          <div className="text-sm text-zinc-500">Mehr Daten nötig. Tippe unten auf „Workout starten“.</div>
        ) : (
          <ul className="space-y-2">
            {targets.map(t => (
              <li key={t.exerciseId} className="flex items-center justify-between">
                <button className="text-left" onClick={() => nav(`/exercises/${t.exerciseId}`)}>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-zinc-400">
                    Nächstes Ziel: {t.next_weight} kg · {t.next_reps_low}–{t.next_reps_high} Wdh
                  </div>
                </button>
                <button className="px-2 py-1 rounded-md border border-zinc-700 text-sm" onClick={() => nav(`/start?pick=1`)}>
                  Aus Vorlage
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Neue PRs */}
      <Card>
        <div className="mb-2 text-sm text-zinc-400">Neue PRs (14 Tage)</div>
        {prs.length === 0 ? (
          <div className="text-sm text-zinc-500">Keine neuen PRs.</div>
        ) : (
          <ul className="space-y-2">
            {prs.map(p => (
              <li key={p.id} className="flex items-center justify-between">
                <button className="text-left" onClick={() => nav(`/exercises/${p.exerciseId}?tab=pr`)}>
                  <div className="font-medium">{p.exerciseName}</div>
                  <div className="text-sm text-zinc-400">{p.category} · +{p.delta.toFixed(2)}</div>
                </button>
                <span className="text-xs text-zinc-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Badges */}
      <BadgesCard />

      {/* Quick-Actions */}
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={readOnly} onClick={async () => { const w = await startNewWorkout(); nav(`/workout/${w.id}`); }}>
            Workout starten
          </Button>
          <Button variant="outline" disabled={readOnly} onClick={() => nav("/start?pick=1")}>
            Vorlage wählen
          </Button>
          <Button
            variant="outline"
            disabled={readOnly || !hasActive}
            onClick={async () => { const w = await getActiveWorkout(); if (w) nav(`/workout/${w.id}`); }}
          >
            Letztes fortsetzen
          </Button>
        </div>
        {readOnly ? (
          <p className="mt-2 text-xs text-zinc-500">Nur eigene Daten bearbeitbar (Viewer-Modus aktiv).</p>
        ) : null}
      </Card>
    </div>
  );
}

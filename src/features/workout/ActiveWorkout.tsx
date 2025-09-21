import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { getWorkout } from "../../data/stores/workouts";
import { listSetsForWorkout, listSetsForExercise, createSet, updateSet } from "../../data/stores/sets";
import { listExercises, createExercise, searchExercises, toggleFavorite, markUsed } from "../../data/stores/exercises";
import type { Exercise, SetEntry } from "../../shared/types";
import { Modal } from "../../shared/ui/Modal";
import { RestTimer } from "./RestTimer";
import { QuickKeypad } from "./QuickKeypad";
import { detectPRKinds, type PRKinds } from "../../lib/performance";
import { Chip } from "../../shared/ui/Chip";
import { getPrefs } from "../../data/stores/prefs";
import { hapticOk, clamp } from "../../shared/lib/utils";
import { getTargets } from "../../data/stores/targets";

export default function ActiveWorkout() {
  const nav = useNavigate();
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<{ setId: string; field: "weight"|"reps"; init?: string }|null>(null);
  const [prMap, setPrMap] = useState<Record<string, PRKinds>>({});

  const { id } = useParams();
  const workoutId = id!;
  const [exists, setExists] = useState<boolean>(true);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);

  
  const computePRForSet = async (setId: string, exerciseId: string, weight: number, reps: number) => {
    const hist = await listSetsForExercise(workoutId, exerciseId);
    const history = hist.filter(h => h.id !== setId).map(h => ({ weightKg: h.weight, reps: h.reps, ts: new Date(h.createdAt).getTime() }));
    const kinds = detectPRKinds({ weightKg: weight, reps }, history);
    setPrMap(prev => ({ ...prev, [setId]: kinds }));
  };

useEffect(() => {
    void (async () => {
      const w = await getWorkout(workoutId);
      setExists(!!w && w.status === "active");
      const s = await listSetsForWorkout(workoutId);
      setSets(s);
      const ex = await listExercises();
      setExercises(ex);
    })();
  }, [workoutId]);

  const grouped = useMemo(() => {
    const g: Record<string, SetEntry[]> = {};
    for (const s of sets) {
      if (!g[s.exerciseId]) g[s.exerciseId] = [];
      g[s.exerciseId].push(s);
    }
    return g;
  }, [sets]);

  const exercisesInWorkout = useMemo(() => {
    return Object.keys(grouped);
  }, [grouped]);

  if (!exists) {
    return (
      <div className="mx-auto max-w-screen-sm p-4">
        <Card><p>Kein aktives Workout gefunden.</p></Card>
      </div>
    );
  }

  const addExerciseToWorkout = async (exercise: Exercise) => {
    await markUsed(exercise.id);
    setPickerOpen(false);
    const latestSets = await listSetsForWorkout(workoutId);
    setSets(latestSets);
    const ex = await listExercises();
    setExercises(ex);
    await addSet(exercise.id);
  };

  const addSet = async (exerciseId: string) => {
    const prev = (await listSetsForExercise(workoutId, exerciseId)).slice(-1)[0];
    const prefs = await getPrefs();
    const weight = (prefs.app_enableAutofillLast !== false && prev) ? prev.weight : 0;
    const reps = (prefs.app_enableAutofillLast !== false && prev) ? prev.reps : 8;
    const step = (prefs.app_rpeStep ?? 0.5);
    const minR = (prefs.app_rpeMin ?? 5);
    const maxR = (prefs.app_rpeMax ?? 10);
    const rpe = (prefs.app_enableAutofillLast !== false && prev) ? clamp(prev.rpe + step, minR, maxR) : (prefs.defaultRpe ?? 8);
    const warmup = false;
    const exercise = exercises.find((e) => e.id === exerciseId)!;
    const set = await createSet({
      workoutId,
      exerciseId,
      weight,
      reps,
      rpe,
      warmup,
      restSeconds: null,
      notes: "",
      targetMuscles: exercise.muscles,
    });
    (prefs.app_enableHaptics !== false) && hapticOk();
    const latestSets = await listSetsForWorkout(workoutId);
    setSets(latestSets);
  };

  const updateSetField = async (setId: string, field: Partial<SetEntry>) => {
    await updateSet(setId, field);
    (prefs.app_enableHaptics !== false) && hapticOk();
    const latestSets = await listSetsForWorkout(workoutId);
    setSets(latestSets);
  };

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Aktives Workout</h1>
        <Button onClick={() => nav(`/workout/${workoutId}/review`)}>Review</Button>
      </div>

      {exercisesInWorkout.length === 0 ? (
        <Card><p className="text-zinc-300">Noch keine Übungen hinzugefügt.</p></Card>
      ) : null}

      {exercisesInWorkout.map((exId) => {
  const ex = exercises.find((e) => e.id === exId);
  if (!ex) return null;
  const exSets = grouped[exId];
  return (
    <ExerciseBlock
      key={exId}
      ex={ex}
      exSets={exSets}
      addSet={addSet}
      updateSetField={updateSetField}
      toggleFavorite={toggleFavorite}
      workoutId={workoutId}
      onOpenKeypad={(setId, field, init) => { setEditTarget({ setId, field, init }); setKeypadVisible(true); }}
      prMap={prMap}
    />
  );
})}

      <Button onClick={() => setPickerOpen(true)} className="w-full">Übung hinzufügen</Button>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExerciseToWorkout}
        filterFavorites={onlyFav}
        setFilterFavorites={setOnlyFav}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
}

function ExerciseBlock({ ex, exSets, addSet, updateSetField, toggleFavorite, workoutId, onOpenKeypad, prMap }:{ 
  ex: Exercise; 
  exSets: SetEntry[]; 
  addSet: (id: string)=>Promise<void>; 
  updateSetField: (id: string, f: Partial<SetEntry>)=>Promise<void>;
  toggleFavorite: (id: string)=>Promise<void>;
  workoutId: string;
  onOpenKeypad: (setId: string, field: 'weight'|'reps', init: string)=>void;
  prMap?: Record<string, PRKinds>;
}) {
  const [hint, setHint] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const t = await getTargets(ex.id);
      if (t) setHint(`Ziel nächstes Mal: ${t.nextWeight.toFixed(1)} × ${t.nextRepsLow}-${t.nextRepsHigh}`);
      else setHint("");
    })();
  }, [ex.id]);

  return (
    <Card key={ex.id}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="font-medium flex items-center gap-2">{ex.name}{exSets.some(s => prMap && (prMap[s.id]?.repPR || prMap[s.id]?.loadPR || prMap[s.id]?.est1RMPR)) ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200">PR</span> : null}</div>
          <div className="text-xs text-zinc-400">Sätze: {exSets.length}</div>
          {hint ? <div className="text-xs text-zinc-500 mt-1">{hint}</div> : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => addSet(ex.id)}>Satz hinzufügen</Button>
          <button
            className={`rounded-lg px-2 py-1 text-sm border ${ex.isFavorite ? "border-accent" : "border-zinc-700"}`}
            onClick={async () => {
              await toggleFavorite(ex.id);
            }}
          >
            ★
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {exSets.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-16">Gewicht</span>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { weight: Math.max(0, s.weight - 0.5) })}>-</button>
                  <span className="min-w-[56px] text-center cursor-pointer underline decoration-dotted" onClick={() => onOpenKeypad(s.id, "weight", String(s.weight))}>{s.weight.toFixed(1)}</span>
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { weight: s.weight + 0.5 })}>+</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-16">Wdh.</span>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { reps: Math.max(1, s.reps - 1) })}>-</button>
                  <span className="min-w-[40px] text-center cursor-pointer underline decoration-dotted" onClick={() => onOpenKeypad(s.id, "reps", String(s.reps))}>{s.reps}</span>
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { reps: Math.min(50, s.reps + 1) })}>+</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-16">RPE</span>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { rpe: Math.max(5, Math.round((s.rpe - 0.5)*2)/2) })}>-</button>
                  <span className="min-w-[40px] text-center">{s.rpe.toFixed(1)}</span>
                  <button className="rounded-lg border border-zinc-700 px-2 py-1" onClick={() => updateSetField(s.id, { rpe: Math.min(10, Math.round((s.rpe + 0.5)*2)/2) })}>+</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 w-16">Warm-up</span>
                <button
                  className={`rounded-lg px-3 py-2 text-sm border ${s.warmup ? "border-accent" : "border-zinc-700"}`}
                  onClick={() => updateSetField(s.id, { warmup: !s.warmup })}
                >
                  {s.warmup ? "Ja" : "Nein"}
                </button>
              </div>
              <div className="col-span-2">
                <Input
                  className="w-full"
                  placeholder="Notiz"
                  value={s.notes ?? ""}
                  onChange={(e) => void updateSetField(s.id, { notes: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExercisePicker(props: {
  open: boolean;
  onClose: () => void;
  onSelect: (e: Exercise) => void;
  filterFavorites: boolean;
  setFilterFavorites: (v: boolean) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const { open, onClose, onSelect, filterFavorites, setFilterFavorites, search, setSearch } = props;
  const [items, setItems] = useState<Exercise[]>([]);

  useEffect(() => {
    void (async () => {
      const list = search ? await searchExercises(search) : await listExercises();
      setItems(filterFavorites ? list.filter((x) => x.isFavorite) : list);
    })();
  }, [search, filterFavorites]);

  const addNew = async () => {
    const name = prompt("Name der Übung:");
    if (!name) return;
    const ex = await createExercise({ name, muscles: { core: 1 }, isFavorite: false });
    setItems([ex, ...items]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Übung wählen">
      <div className="mb-2 flex items-center justify-between">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
          placeholder="Suche nach Name oder Muskel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="ml-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={() => setFilterFavorites(!filterFavorites)}>
          {filterFavorites ? "Alle" : "Nur Favoriten"}
        </button>
      </div>
      <div className="max-h-[50vh] overflow-auto space-y-1">
        {items.length === 0 ? <p className="text-zinc-300">Keine Übungen gefunden.</p> : null}
        {items.map((e) => (
          <button
            key={e.id}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left hover:bg-zinc-800"
            onClick={() => onSelect(e)}
          >
            {e.name}
            {e.isFavorite ? <span className="ml-2 text-xs text-accent">★</span> : null}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={addNew}>Neue Übung</button>
      </div>
    </Modal>
  );
}

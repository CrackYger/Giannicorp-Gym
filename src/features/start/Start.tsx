import { useEffect, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Modal } from "../../shared/ui/Modal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getActiveWorkout, startFromTemplate, startNewWorkout, startFromPlanDay } from "../../data/stores/workouts";
import { listPlans } from "../../data/stores/plans";
import { db } from "../../data/db";
import { ensureSuggestedTemplates, listTemplates } from "../../data/stores/templates";

type TemplateLite = { id: string; name: string };

export default function Start() {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const [active, setActive] = useState<{ id: string } | null>(null);
  const [openTemplates, setOpenTemplates] = useState(false);
  const [templates, setTemplates] = useState<TemplateLite[]>([]);
  const [openPlans, setOpenPlans] = useState(false);
  const [plans, setPlans] = useState<{ id: string; name: string; days: { id: string; name: string }[] }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const w = await getActiveWorkout();
        setActive(w ? { id: w.id } : null);
      } catch {
        setActive(null);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      await ensureSuggestedTemplates();
      const rows = await listTemplates();
      setTemplates(rows.map(r => ({ id: r.id, name: r.name })));
      if (qp.get("pick") === "1") setOpenTemplates(true);
    })();
  }, [qp]);

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-5 space-y-3">
      <h1 className="text-xl font-semibold">Start</h1>

      {/* Aktives Workout */}
      {active ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-emerald-300">Aktives Workout</div>
              <div className="text-xs text-zinc-400">Du hast ein laufendes Workout.</div>
            </div>
            <Button onClick={() => nav(`/workout/${active.id}`)}>Fortsetzen</Button>
          </div>
        </Card>
      ) : null}

      {/* Aktionen */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={async () => { const w = await startNewWorkout(); nav(`/workout/${w.id}`); }}>
            Neues Workout
          </Button>
          <Button variant="outline" onClick={() => setOpenTemplates(true)}>
            Aus Vorlage starten
          </Button>
          <Button variant="outline" disabled={!active} onClick={() => { if (active) nav(`/workout/${active.id}`); }}>
            Letztes fortsetzen
          </Button>
        </div>
      </Card>

      {/* Template-Picker */}
      <Modal open={openTemplates} onClose={() => setOpenTemplates(false)} title="Vorlagen">
        <div className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-sm text-zinc-400">Keine Vorlagen.</div>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                className="w-full rounded-lg border border-zinc-800 px-3 py-2 text-left hover:bg-zinc-800/50"
                onClick={async () => {
                  const tpl = { id: t.id } as any;
                  const w = await startFromTemplate(tpl);
                  setOpenTemplates(false);
                  nav(`/workout/${w.id}`);
                }}
              >
                {t.name}
              </button>
            ))
          )}
        </div>
      </Modal>
    
      <Modal title="Plan wählen" open={openPlans} onClose={()=>setOpenPlans(false)}>
        <div className="space-y-2">
          {plans.length===0 ? <div className="text-zinc-400">Keine Pläne.</div> : plans.map(p => (
            <div key={p.id}>
              <div className="font-medium mb-1">{p.name}</div>
              <div className="grid grid-cols-2 gap-2">
                {p.days.map(d => (
                  <Button key={d.id} variant="outline" onClick={async()=>{
                    const w = await startFromPlanDay(d.id);
                    setOpenPlans(false);
                    nav(`/workout/${w.id}`);
                  }}>{d.name}</Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

    </div>
  );
}

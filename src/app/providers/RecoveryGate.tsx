import { useEffect, useState } from "react";
import { getActiveWorkout } from "../../data/stores/workouts";
import { Modal } from "../../shared/ui/Modal";
import { useNavigate } from "react-router-dom";

export function RecoveryGate() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    void (async () => {
      const w = await getActiveWorkout();
      if (w) {
        setId(w.id);
        setOpen(true);
      }
    })();
  }, []);

  if (!open) return null;

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Aktives Workout fortsetzen?">
      <div className="space-y-3">
        <p className="text-zinc-300">Ein aktives Workout wurde gefunden. Möchtest du fortsetzen?</p>
        <div className="flex gap-2 justify-end">
          <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm" onClick={() => setOpen(false)}>Schließen</button>
          <button
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
            onClick={() => {
              if (id) nav(`/workout/${id}`);
              setOpen(false);
            }}
          >
            Fortsetzen
          </button>
        </div>
      </div>
    </Modal>
  );
}

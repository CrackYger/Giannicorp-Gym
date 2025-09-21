import React from "react";
type Props = { children: React.ReactNode; hasActiveWorkout?: boolean; onContinueActive?: () => void; onAbortActive?: () => void; tryStartNew?: () => void; };
export const ActiveWorkoutGuard: React.FC<Props> = ({ children, hasActiveWorkout, onContinueActive, onAbortActive, tryStartNew }) => {
  const [attempt, setAttempt] = React.useState(false);
  if (!hasActiveWorkout) return <>{children}</>;
  if (!attempt) {
    return (<div className="p-6 space-y-3"><h2 className="text-lg font-semibold">Aktives Workout gefunden</h2><p className="opacity-80 text-sm">Möchtest du fortsetzen oder abbrechen?</p><div className="flex gap-2"><button className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={onContinueActive}>Fortsetzen</button><button className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700" onClick={() => setAttempt(true)}>Neues starten</button></div></div>);
  }
  return (<div className="p-6 space-y-3"><h2 className="text-lg font-semibold">Sicher neues Workout starten?</h2><p className="opacity-80 text-sm">Das aktive Workout wird abgebrochen.</p><div className="flex gap-2"><button className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700" onClick={() => setAttempt(false)}>Zurück</button><button className="px-3 py-2 rounded-xl bg-red-600 text-white" onClick={onAbortActive}>Abbrechen & neues starten</button></div>{tryStartNew && <div className="pt-2"><button className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={tryStartNew}>Jetzt starten</button></div>}</div>);
};

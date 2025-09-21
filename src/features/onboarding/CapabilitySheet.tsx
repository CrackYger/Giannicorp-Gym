import React, { useEffect } from "react";

export function CapabilitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Was kann die App?">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Schließen" />
      <div className="absolute left-0 right-0 bottom-0 mx-auto max-w-[540px] px-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="glass rounded-2xl shadow-float border border-white/10 dark:border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">Was kann die App?</div>
            <button className="text-sm text-zinc-400" onClick={onClose}>Fertig</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["⚡️","Schnelles Logging"],
              ["📈","Fortschritt klar"],
              ["⏱️","Intelligente Pausen"],
              ["🏷️","PR‑Erkennung"],
              ["📋","Vorlagen & Pläne"],
              ["🔁","Autofill Letztes‑Mal"],
            ].map(([icon,label]) => (
              <div key={label} className="glass rounded-2xl p-3 text-sm flex items-center gap-2">
                <div className="text-base">{icon}</div>
                <div>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

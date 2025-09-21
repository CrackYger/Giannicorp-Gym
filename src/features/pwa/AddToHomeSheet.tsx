import React from "react";
export function AddToHomeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Zum Home-Bildschirm hinzufügen">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Schließen" />
      <div className="absolute left-0 right-0 bottom-0 mx-auto max-w-[540px] px-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="glass rounded-2xl shadow-float border border-white/10 dark:border-white/5 p-4">
          <div className="text-lg font-semibold mb-2">App installieren</div>
          <ol className="text-sm text-zinc-300 list-decimal pl-5 space-y-1">
            <li>Tippe auf <span aria-label="Teilen">Teilen</span> in Safari.</li>
            <li>Wähle <span className="font-medium">Zum Home-Bildschirm</span>.</li>
            <li>Bestätigen – fertig.</li>
          </ol>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <img src="/icons/a2hs-step1.png" alt="Schritt 1" className="rounded-xl border border-white/10" />
            <img src="/icons/a2hs-step2.png" alt="Schritt 2" className="rounded-xl border border-white/10" />
            <img src="/icons/a2hs-step3.png" alt="Schritt 3" className="rounded-xl border border-white/10" />
          </div>
          <div className="mt-3 text-right">
            <button className="rounded-2xl px-4 py-2 min-h-[44px] border border-zinc-700/60" onClick={onClose}>Fertig</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useOnline } from "../../hooks/useOnline";

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="fixed top-0 left-0 right-0 z-[70] mx-auto max-w-[540px] px-3 pt-[env(safe-area-inset-top)]">
      <div className="glass rounded-b-2xl px-3 py-2 text-xs text-amber-300 border border-amber-500/30">
        Offline – Daten werden lokal gesichert.
      </div>
    </div>
  );
}

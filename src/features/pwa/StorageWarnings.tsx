import React, { useEffect, useState } from "react";
import { checkIndexedDB, checkQuota } from "../../lib/storageGuards";

export function StorageWarnings() {
  const [warn, setWarn] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const ok = await checkIndexedDB();
      if (!ok) { setWarn("Privatmodus erkannt – Lokale Speicherung ist eingeschränkt."); return; }
      const { usage, quota } = await checkQuota();
      if (usage && quota && usage / quota > 0.8) setWarn("Speicher fast voll – bitte Platz schaffen, um Datenverlust zu vermeiden.");
    })();
  }, []);
  if (!warn) return null;
  return (
    <div className="fixed top-8 left-0 right-0 z-[65] mx-auto max-w-[540px] px-3">
      <div className="glass rounded-2xl px-3 py-2 text-xs text-amber-300 border border-amber-500/30">{warn}</div>
    </div>
  );
}

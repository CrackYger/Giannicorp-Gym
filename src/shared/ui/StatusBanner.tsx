import { useEffect, useState } from "react";
import { db } from "../../data/db";

export function StatusBanner() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [conflicts, setConflicts] = useState<number>(0);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    let mounted = true;
    (async () => {
      const c = await db._sync_conflicts.count();
      if (mounted) setConflicts(c);
    })();
    return () => {
      mounted = false;
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online && conflicts === 0) return null;
  return (
    <div className="sticky top-0 z-[999] w-full bg-amber-900/50 px-3 py-2 text-sm text-amber-200 backdrop-blur">
      {!online ? "Offline – Änderungen werden lokal gespeichert." : null}
      {online && conflicts > 0 ? `Konflikte in der Warteschlange: ${conflicts}` : null}
    </div>
  );
}

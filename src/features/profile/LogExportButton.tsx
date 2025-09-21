import React from "react";
import { db } from "../../db/client";
import { exportAppStateToFile } from "../../lib/exporter";
export const LogExportButton: React.FC = () => {
  const [conflicts, setConflicts] = React.useState<number>(0);
  React.useEffect(() => { let stale = false; const run = async () => { const row = await db.sync_status.where({ key: "conflict_count" }).first(); if (!stale) setConflicts(Number(row?.value ?? 0)); }; void run(); const id = setInterval(run, 3000); return () => { stale = true; clearInterval(id); }; }, []);
  return (<div className="flex items-center gap-3"><button className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={() => exportAppStateToFile()} title="Log exportieren (lokal)">Log exportieren</button><span className="text-sm opacity-80">Konflikte aktuell: <strong>{conflicts}</strong></span></div>);
};

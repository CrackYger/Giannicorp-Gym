import React from "react";
import { quotaEvents, QuotaEventPayload } from "../events/emitter";
import { exportAppStateToFile } from "../exporter";
import { Modal } from "../../components/modal/Modal";
export const StorageQuotaDialog: React.FC = () => {
  const [evt, setEvt] = React.useState<QuotaEventPayload | null>(null);
  React.useEffect(() => quotaEvents.on("quota_error", (e) => setEvt(e)), []);
  if (!evt) return null;
  return (
    <Modal isOpen onClose={() => setEvt(null)} ariaLabel="Speicher voll">
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Speicher voll – exportieren & bereinigen</h2>
        <p className="text-sm opacity-80">Beim Zugriff auf die lokale Datenbank ist ein Fehler aufgetreten ({evt.name}). Meist ist der Browser-Speicher voll oder die Version der Datenbank konnte nicht geöffnet werden.</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800" onClick={async () => { await exportAppStateToFile(); }}>Export starten</button>
          <button className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700" onClick={() => setEvt(null)}>Schließen</button>
        </div>
      </div>
    </Modal>
  );
};


import React from "react";
import { importFromFile } from "../../lib/importer";

export const ImportProgressBar: React.FC = () => {
  const [progress, setProgress] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onChoose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRunning(true);
    try {
      await importFromFile(file, ({ loadedBytes, totalBytes }) => {
        const p = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;
        setProgress(p);
      });
      alert("Import abgeschlossen.");
    } catch (err: any) {
      alert(err?.message ?? String(err));
    } finally {
      setRunning(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="application/json" onChange={onChoose} disabled={running} />
      {running && (
        <div className="w-full h-2 rounded bg-neutral-200 dark:bg-neutral-800">
          <div className="h-2 rounded bg-blue-600" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
        </div>
      )}
    </div>
  );
};

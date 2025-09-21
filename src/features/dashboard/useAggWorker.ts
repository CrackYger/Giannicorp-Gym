import { useEffect, useMemo, useRef, useState } from "react";

export function useAggWorker(period: any, side: "both"|"left"|"right") {
  const workerRef = useRef<Worker>();
  const [heatmap, setHeatmap] = useState<Record<string, any>>({});
  const [trend, setTrend] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    workerRef.current = new Worker(new URL("./agg.worker.ts", import.meta.url), { type: "module" });
    const w = workerRef.current;
    w.onmessage = (e: MessageEvent<any>) => {
      if (e.data.type === "heatmap") setHeatmap(e.data.data);
      if (e.data.type === "trend") setTrend(e.data.data);
      if (e.data.type === "error") setError(e.data.message);
    };
    return () => { w.terminate(); };
  }, []);

  useEffect(() => {
    const w = workerRef.current;
    if (!w) return;
    const t = setTimeout(() => {
      w.postMessage({ type: "heatmap", period, side });
      w.postMessage({ type: "trend", period, side });
    }, 120); // debounce
    return () => clearTimeout(t);
  }, [period]);

  return { heatmap, trend, error };
}

import { getCache, setCache } from "./cache";

type ComputeArgs = {
  period: number;
  sideMode: "both" | "left" | "right";
  selectedView: "front" | "back";
  excludeWarmups: boolean;
};

type ComputeResult = { data: unknown | null; error: string | null };

let workerInstance: Worker | null = null;
let currentAbort: AbortController | null = null;
let lastRun = 0;

function getWorker(): Worker {
  if (workerInstance) return workerInstance;
  // @ts-ignore
  workerInstance = new Worker(new URL("../../workers/heatmap.worker.ts", import.meta.url), { type: "module" });
  return workerInstance;
}

function cacheKeyOf(a: ComputeArgs): string {
  return `${a.selectedView}|${a.sideMode}|${a.period}|excludeWarmups=${a.excludeWarmups ? 1 : 0}`;
}

export async function computeMuscleAgg(args: ComputeArgs): Promise<ComputeResult> {
  const now = Date.now();
  if (now - lastRun < 150) { await new Promise((r) => setTimeout(r, 150 - (now - lastRun))); }
  lastRun = Date.now();

  const key = cacheKeyOf(args);
  const cached = await getCache(key);
  if (cached) return { data: cached, error: null };

  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();

  const worker = getWorker();

  return new Promise<ComputeResult>((resolve) => {
    const onMessage = async (ev: MessageEvent) => {
      const msg: any = ev.data;
      if (!msg) return;
      if (msg.type === "heatmap:result") {
        worker.removeEventListener("message", onMessage);
        await setCache(key, msg.payload);
        resolve({ data: msg.payload, error: null });
      } else if (msg.type === "heatmap:error") {
        worker.removeEventListener("message", onMessage);
        resolve({ data: null, error: msg.payload?.message ?? "Fehler im Worker" });
      }
    };
    const onError = (err: ErrorEvent) => {
      worker.removeEventListener("message", onMessage);
      resolve({ data: null, error: err.message || "Unbekannter Fehler im Worker" });
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError, { once: true } as any);
    (worker as any).postMessage({ type: "heatmap:compute", payload: args, abort: currentAbort?.signal });
    if (currentAbort) {
      currentAbort.signal.addEventListener("abort", () => {
        try { (worker as any).postMessage({ type: "heatmap:cancel" }); } catch {}
      }, { once: true });
    }
  });
}

/* eslint-disable no-restricted-globals */
interface ComputeArgs {
  period: number;
  sideMode: "both" | "left" | "right";
  selectedView: "front" | "back";
  excludeWarmups: boolean;
}
let canceled = false;
function computeDummy(args: ComputeArgs): unknown {
  return { meta: { period: args.period, sideMode: args.sideMode, view: args.selectedView, excludeWarmups: args.excludeWarmups }, segments: [] };
}
self.addEventListener("message", (ev) => {
  const data: any = ev.data; if (!data) return;
  if (data.type === "heatmap:cancel") { canceled = true; return; }
  if (data.type === "heatmap:compute") {
    canceled = false;
    try { const res = computeDummy(data.payload as ComputeArgs); if (!canceled) { (self as any).postMessage({ type: "heatmap:result", payload: res }); } }
    catch (e: any) { (self as any).postMessage({ type: "heatmap:error", payload: { message: e?.message ?? String(e) } }); }
  }
});

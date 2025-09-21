import { useEffect, useRef, useState } from "react";
import { getPrefs } from "../../data/stores/prefs";

const DEFAULT_PRESETS = [60, 90, 120, 180] as const;

export function RestTimer({ onDone }: { onDone?: () => void }) {
  const [sec, setSec] = useState<number | null>(null);
  const [presets, setPresets] = useState<number[]>([...DEFAULT_PRESETS]);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    void (async () => {
      const p = await getPrefs();
      const arr = (p.quickRestPresets ?? DEFAULT_PRESETS) as number[];
      setPresets([...arr]);
    })();
  }, []);

  useEffect(() => {
    if (sec === null) return;
    if (ref.current) window.clearInterval(ref.current);
    ref.current = window.setInterval(() => {
      setSec((v) => (v! > 0 ? (v! - 1) : 0));
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [sec]);

  useEffect(() => {
    if (sec === 0) {
      if (navigator.vibrate) navigator.vibrate(30);
      onDone?.();
    }
  }, [sec, onDone]);

  return (
    <div className="sticky bottom-0 z-30 w-full bg-black/70 backdrop-blur px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+8px)] border-t border-zinc-800">
      <div className="flex gap-2 justify-center">
        {presets.map(p => (
          <button key={p} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm"
            onClick={() => setSec(p)}>{p}s</button>
        ))}
        <button className="rounded-xl border border-zinc-700 px-3 py-2 text-sm"
          onClick={() => {
            const v = prompt("Custom Sekunde(n) (15s Raster):", "150");
            const n = v ? Math.max(15, Math.min(900, Math.round(parseInt(v, 10)/15)*15)) : null;
            if (n) setSec(n);
          }}>Custom</button>
        <button className="rounded-xl border border-zinc-700 px-3 py-2 text-sm"
          onClick={() => setSec(null)}>Stop</button>
      </div>
      <div className="text-center text-3xl mt-2">{sec ?? "—"}</div>
    </div>
  );
}
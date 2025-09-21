import * as React from "react";

type Field = "weight" | "reps";

export const QuickKeypad: React.FC<{
  visible: boolean;
  onClose?: () => void;
  onCommit?: (value: number) => void;
  initial?: string;
}> = ({ visible, onClose, onCommit, initial }) => {
  const [buf, setBuf] = React.useState<string>(initial ?? "");

  React.useEffect(() => { setBuf(initial ?? ""); }, [initial]);

  if (!visible) return null;

  const press = (k: string) => {
    if (k === "⌫") setBuf((b) => b.slice(0, -1));
    else setBuf((b) => (b === "0" ? k : (b + k)));
  };
  const commit = () => {
    const n = Number(buf.replace(",", "."));
    if (!Number.isNaN(n)) onCommit?.(n);
    onClose?.();
  };

  const keys = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-black/80 backdrop-blur-md border-t border-zinc-800 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <div className="mx-auto max-w-screen-sm p-3">
        <div className="text-center text-sm text-zinc-400 mb-1">Schnell-Eingabe</div>
        <div className="grid grid-cols-3 gap-2">
          {keys.map(k => (
            <button key={k}
              className="rounded-2xl border border-zinc-700 px-5 py-4 text-xl active:scale-95 transition"
              onClick={() => press(k)}>{k}</button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-lg">{buf || "0"}</div>
          <button className="rounded-xl border border-accent/60 text-accent px-4 py-2" onClick={commit}>Übernehmen</button>
          <button className="rounded-xl border border-zinc-700 px-4 py-2" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
};

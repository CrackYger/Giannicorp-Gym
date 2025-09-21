import React, { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; type: ToastType; message: string; timeout: number };

const Ctx = createContext<{ show: (type: ToastType, message: string, timeout?: number) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, message: string, timeout = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, type, message, timeout };
    setItems((arr) => [...arr, t]);
    window.setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), timeout);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-[1000] flex w-full justify-center">
        <div className="flex max-w-screen-sm flex-col gap-2 px-3">
          {items.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-lg px-3 py-2 text-sm shadow-md ${
                t.type === "success"
                  ? "bg-emerald-600/90 text-white"
                  : t.type === "error"
                  ? "bg-red-600/90 text-white"
                  : "bg-zinc-700/90 text-white"
              }`}
              role="status"
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

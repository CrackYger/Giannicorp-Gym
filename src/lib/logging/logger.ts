import { db } from "../../db/client";
import { formatISO } from "../time/iso";
import type { LogLevel } from "../../db/schema";
export async function log(level: LogLevel, message: string, meta?: Record<string, unknown>, stack?: string) {
  try { await db.logs.add({ ts: formatISO(new Date()) as any, level, message, meta: meta ?? null, stack: stack ?? null }); } catch {}
}
export function installGlobalErrorLogger(): void {
  if (typeof window === "undefined") return;
  if ((window as any).__giannicorp_logger_installed) return;
  (window as any).__giannicorp_logger_installed = true;
  window.addEventListener("error", (e) => {
    const anyE: any = e;
    const stack = anyE?.error?.stack ? String(anyE.error.stack) : undefined;
    void log("error", anyE?.message ?? "Unbekannter Fehler", {}, stack);
  });
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    const reason: any = (e as any).reason;
    const msg = typeof reason === "string" ? reason : (reason?.message ?? "Unhandled rejection");
    const stack = reason?.stack ? String(reason.stack) : undefined;
    void log("error", msg, {}, stack);
  });
}


import { db } from "./db";
import { logout } from "./sync/auth";

async function clearCaches() {
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {}
}

async function unregisterSW() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {}
}

/** Hard-Reset: löscht alle lokalen Daten, meldet ab und lädt App neu. */
export async function hardResetAll(): Promise<never> {
  try { await logout(); } catch {}
  try { await db.delete(); } catch {}
  try { localStorage.clear(); sessionStorage.clear(); } catch {}
  await clearCaches();
  await unregisterSW();
  // Reload to boot into Onboarding (First-Run-Gate)
  window.location.replace("/");
  throw new Error("redirect"); // satisfy TS return never
}

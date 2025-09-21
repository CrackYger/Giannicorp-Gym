
import { db, ensureDBReady } from "./db";
export type PrefValue = unknown;
export async function ensurePrefs(): Promise<void> { await ensureDBReady; try { await db.prefs.get("__touch__"); } catch { try { await db.prefs.put({ key: "__touch__", value: true } as any); } catch {} } }
export async function getPref(key: string, fallback: any){ await ensureDBReady; try { const row = await db.prefs.get(key as any); return (row?.value ?? fallback); } catch { return fallback; } }
export async function setPref(key: string, value: any){ await ensureDBReady; try { await db.prefs.put({ key, value } as any); } catch { try { await db.prefs.put({ key, value } as any); } catch {} } }
export async function getPrefs(keys: Record<string, { key: string; fallback: any }>) { const out: any = {}; for (const k in keys){ const { key, fallback } = keys[k]; out[k] = await getPref(key, fallback); } return out; }


import { db } from "../../db/client";
import { formatISO } from "../time/iso";

type Backoff = [number, number, number, number, number]; // ms
const DEFAULT_BACKOFF: Backoff = [1000, 3000, 6000, 10000, 10000];

export interface DeltaSyncOptions {
  supabase: { auth: { getSession: () => Promise<{ data: { session: any } }>; refreshSession: () => Promise<any> } };
  fetchTable: (table: string, since: string | null) => Promise<{ rows: any[]; status: number }>;
  pushChanges: (table: string, changes: any[]) => Promise<{ ok: boolean; status: number; body?: any }>;
  tables: string[];
  onStatus?: (s: { offline: boolean; message?: string }) => void;
  maxTries?: number;
}

export function createDeltaSync(opts: DeltaSyncOptions) {
  const backoff = DEFAULT_BACKOFF;
  const maxTries = typeof opts.maxTries === "number" ? opts.maxTries : 5;

  async function runOnce(): Promise<void> {
    let offline = false;
    opts.onStatus?.({ offline: false, message: "Synchronisiere…" });
    for (const table of opts.tables) {
      let tries = 0;
      // PULL
      for (;;) {
        try {
          const sinceRow = await db.sync_status.where({ key: `since_${table}` }).first();
          const since = (sinceRow?.value as string) ?? null;
          const res = await opts.fetchTable(table, since);
          if (res.status === 401 || res.status === 403) {
            await opts.supabase.auth.refreshSession();
            const retry = await opts.fetchTable(table, since);
            if (retry.status >= 400 && retry.status < 500) {
              opts.onStatus?.({ offline: false, message: "Berechtigung verweigert (RLS)" });
              break;
            }
            await applyPull(table, retry.rows);
            break;
          }
          if (res.status >= 500) throw new Error(`Serverfehler ${res.status}`);
          await applyPull(table, res.rows);
          break;
        } catch (e) {
          tries++;
          if (tries >= maxTries) { offline = true; opts.onStatus?.({ offline: true, message: "Offline oder Timeout – manuell erneut versuchen" }); break; }
          await sleep(backoff[Math.min(tries - 1, backoff.length - 1)]);
        }
      }

      // PUSH
      tries = 0;
      for (;;) {
        try {
          const changes = await db.pending_changes.where({ table }).toArray();
          if (!changes.length) break;
          const res = await opts.pushChanges(table, changes);
          if (res.status === 401 || res.status === 403) {
            await opts.supabase.auth.refreshSession();
            const retry = await opts.pushChanges(table, changes);
            if (retry.status >= 400 && retry.status < 500) {
              opts.onStatus?.({ offline: false, message: "Berechtigung verweigert (RLS)" });
              break;
            }
            await clearPending(table, changes.map((c) => c.id!));
            break;
          }
          if (res.status === 409 || (res.body && Array.isArray(res.body.conflicts) && res.body.conflicts.length > 0)) {
            await incrementConflictCount(res.body?.conflicts?.length ?? 1);
            // Last-Writer-Wins assumed; we fetched latest after push fail in next cycle
            break;
          }
          if (!res.ok) throw new Error(`Push fehlgeschlagen ${res.status}`);
          await clearPending(table, changes.map((c) => c.id!));
          break;
        } catch (e) {
          tries++;
          if (tries >= maxTries) { offline = true; opts.onStatus?.({ offline: true, message: "Offline oder Timeout – manuell erneut versuchen" }); break; }
          await sleep(backoff[Math.min(tries - 1, backoff.length - 1)]);
        }
      }
    }
    opts.onStatus?.({ offline, message: offline ? "Offline" : "Synchronisiert" });
  }

  async function applyPull(table: string, rows: any[]) {
    if (!Array.isArray(rows) || rows.length === 0) return;
    await db.transaction("rw", db.table(table as any), db.sync_status, async () => {
      const t: any = db.table(table as any);
      for (const r of rows) await t.put(r);
      await db.sync_status.put({ key: `since_${table}`, value: formatISO(new Date()), updated_at: formatISO(new Date()) } as any);
    });
  }

  async function clearPending(table: string, ids: number[]) {
    await db.transaction("rw", db.pending_changes, db.sync_status, async () => {
      for (const id of ids) await db.pending_changes.delete(id);
      await db.sync_status.put({ key: "pending_count", value: (await db.pending_changes.count()), updated_at: formatISO(new Date()) } as any);
    });
  }

  return { runOnce };
}

async function incrementConflictCount(n: number): Promise<void> {
  const row = await db.sync_status.where({ key: "conflict_count" }).first();
  const current = Number(row?.value ?? 0);
  await db.sync_status.put({ key: "conflict_count", value: current + n, updated_at: formatISO(new Date()) } as any);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

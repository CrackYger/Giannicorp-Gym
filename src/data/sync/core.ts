import { db } from "../db";
import { supabase } from "../../config/supabase";
import { runWithoutSync } from "./hooks";

export const SYNC_TABLES = ["exercises","workouts","sets","templates","exercise_settings","exercise_targets","prs","exercise_e1rm"] as const;

type Row = Record<string, any>;

function hasNet(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : false;
}

async function defaultSpaceId(): Promise<string | null> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("spaces")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error || !data?.[0]) return null;
  return data[0].id as string;
}

export async function deltaPull(): Promise<void> {
  if (!hasNet()) return;
  const sid = await defaultSpaceId();
  if (!sid) return;
  for (const table of SYNC_TABLES) {
    const state = await db.sync_state.get(table);
    const since = state?.last_pulled_at;
    let query = supabase.from(table).select("*").eq("space_id", sid);
    if (since) query = query.gt("updated_at", since);
    const { data, error } = await query;
    if (error) {
      await db._sync_conflicts.put({ id: `${table}:pull:${Date.now()}`, table, op: "pull", reason: error.message, record: null, created_at: new Date().toISOString() });
      continue;
    }
    if (!data) continue;
    await runWithoutSync(async () => {
      for (const row of data as Row[]) {
        if (row.deleted_at) {
          // apply soft delete locally
          // we simply delete the local row if exists
          // @ts-ignore
          await (db as any)[table].delete(row.id);
        } else {
          // upsert (strip server-only fields)
          const local = { ...row };
          delete local.space_id; delete local.user_id; delete local.created_at; delete local.updated_at; delete local.deleted_at;
          // @ts-ignore
          await (db as any)[table].put(local);
        }
      }
    });
    await db.sync_state.put({ table, last_pulled_at: new Date().toISOString(), last_pushed_at: state?.last_pushed_at ?? null });
  }
}

export async function deltaPush(): Promise<void> {
  if (!hasNet()) return;
  const user = (await supabase.auth.getUser()).data.user;
  const sid = await defaultSpaceId();
  if (!user || !sid) return;

  const items = await db._pending_changes.orderBy("updated_at").toArray();
  for (const it of items) {
    const payload: Row = { ...it.record, space_id: sid };
    if ("user_id" in payload === false && (it.table === "workouts" || it.table === "sets" || it.table === "prs" || it.table === "exercise_e1rm")) {
      payload.user_id = user.id;
    }
    let res;
    if (it.op === "delete") {
      // soft delete
      res = await supabase.from(it.table).upsert({ id: payload.id, space_id: sid, deleted_at: new Date().toISOString() });
    } else {
      res = await supabase.from(it.table).upsert(payload);
    }
    if (res.error) {
      await db._sync_conflicts.put({
        id: `${it.id}:err`,
        table: it.table,
        op: it.op,
        reason: res.error.message,
        record: it.record,
        created_at: new Date().toISOString(),
      });
    } else {
      await db._pending_changes.delete(it.id);
      const st = await db.sync_state.get(it.table);
      await db.sync_state.put({ table: it.table, last_pushed_at: new Date().toISOString(), last_pulled_at: st?.last_pulled_at ?? null });
    }
  }
}

export async function syncNow(): Promise<{ ok: boolean; conflicts: number }> {
  try {
    await deltaPush();
    await deltaPull();
    const conflicts = await db._sync_conflicts.count();
    return { ok: true, conflicts };
  } catch (e) {
    await db._sync_conflicts.put({
      id: `sync:${Date.now()}`,
      table: "_all",
      op: "sync",
      reason: e instanceof Error ? e.message : String(e),
      record: null,
      created_at: new Date().toISOString(),
    });
    return { ok: false, conflicts: await db._sync_conflicts.count() };
  }
}

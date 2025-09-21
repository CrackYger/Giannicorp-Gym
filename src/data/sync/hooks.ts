import { db } from "../db";

const TABLES = ["exercises","workouts","sets","templates","exercise_settings","exercise_targets","prs","exercise_e1rm"] as const;
type Op = "insert" | "update" | "delete";

let suppress = false;

export async function runWithoutSync<T>(fn: () => Promise<T>): Promise<T> {
  suppress = true;
  try { return await fn(); } finally { suppress = false; }
}

async function enqueue(table: string, op: Op, record: any) {
  if (suppress) return;
  const id = `${table}:${(record?.id ?? Math.random().toString(36).slice(2))}:${Date.now()}`;
  await db._pending_changes.put({
    id,
    table,
    op,
    record,
    updated_at: new Date().toISOString(),
  });
}

export function installDexieSyncHooks(): void {
  for (const t of TABLES) {
    // creating
    // @ts-ignore dynamic access
    db[t].hook("creating", async (_primKey: any, obj: any) => {
      await enqueue(t, "insert", obj);
    });
    // updating
    // @ts-ignore
    db[t].hook("updating", async (mods: any, _primKey: any, obj: any) => {
      await enqueue(t, "update", { ...obj, ...mods });
    });
    // deleting
    // @ts-ignore
    db[t].hook("deleting", async (_primKey: any, obj: any) => {
      await enqueue(t, "delete", obj);
    });
  }
}

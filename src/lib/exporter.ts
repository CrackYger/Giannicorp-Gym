import { db } from "../data/db";
import { APP_VERSION } from "../config/app";

type ExportPayload = {
  appVersion: string;
  exportedAt: number;
  tables: Record<string, any[]>;
};

const REQUIRED_TABLES = new Set(["sync_state", "_pending_changes", "_sync_conflicts"]);

export async function exportAll(): Promise<ExportPayload> {
  const tables = db.tables.map(t => t.name);
  const names = Array.from(new Set([...tables, ...REQUIRED_TABLES]));
  const result: Record<string, any[]> = {};
  for (const name of names) {
    try {
      const t: any = (db as any)[name] ?? db.table(name);
      result[name] = await t.toArray();
    } catch {
      result[name] = [];
    }
  }
  return {
    appVersion: APP_VERSION,
    exportedAt: Date.now(),
    tables: result,
  };
}

import { db } from "../data/db";

type ImportPayload = {
  appVersion?: string;
  exportedAt?: number;
  tables: Record<string, any[]>;
};

export async function importAll(payload: ImportPayload) {
  // Clear and bulkPut per table (best-effort)
  const tableNames = Object.keys(payload.tables || {});
  await db.transaction("rw", db.tables, async () => {
    for (const name of tableNames) {
      try {
        const t: any = (db as any)[name] ?? db.table(name);
        await t.clear();
        const rows = payload.tables[name] ?? [];
        if (rows.length) await t.bulkPut(rows as any[]);
      } catch {
        // table missing -> create via migration or ignore
      }
    }
  });
}

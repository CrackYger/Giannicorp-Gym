import { db } from "../db";
import type { PRRow, PRCategory } from "../../shared/types";

export async function upsertPR(row: PRRow): Promise<void> {
  // uniqueness is by id
  await db.prs.put(row);
}

export async function bestPR(exerciseId: string, category: PRCategory): Promise<number> {
  const rows = await db.prs.where({ exerciseId, category }).toArray();
  let best = 0;
  for (const r of rows) best = Math.max(best, r.value);
  return best;
}

export async function recentPRs(days = 14): Promise<PRRow[]> {
  const all = await db.prs.orderBy("createdAt").reverse().toArray();
  const since = new Date(Date.now() - days * 86400000);
  return all.filter(r => new Date(r.createdAt) >= since).slice(0, 20);
}

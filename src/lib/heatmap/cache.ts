import { db } from "../../db/client";

let dirty = false;

export async function getCache(cacheKey: string): Promise<unknown | null> {
  const row = await db.muscle_agg_cache.where({ cache_key: cacheKey }).first();
  if (!row) return null;
  const ttlMs = 24 * 60 * 60 * 1000;
  const updated = new Date((row as any).updated_at as string).getTime();
  if (Date.now() - updated > ttlMs) {
    await db.muscle_agg_cache.delete((row as any).id);
    return null;
  }
  if (dirty) return null;
  return (row as any).payload ?? null;
}

export async function setCache(cacheKey: string, payload: unknown): Promise<void> {
  await db.muscle_agg_cache.put({ cache_key: cacheKey, updated_at: new Date().toISOString(), payload } as any);
}

export function invalidateMuscleAggCache(): void {
  dirty = true;
  queueMicrotask(() => { dirty = false; });
}

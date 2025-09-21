import type { PeriodKey } from "../types";

export function periodRange(key: PeriodKey): { start: Date | null; end: Date } {
  const now = new Date();
  const end = now;
  if (key === "last") return { start: null, end };
  if (key === "all") return { start: new Date(0), end };
  const days = Number(key);
  const start = new Date(now.getTime() - days * 86400000);
  return { start, end };
}

export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}

export function ymd(d: Date): string {
  return d.toISOString().slice(0,10);
}

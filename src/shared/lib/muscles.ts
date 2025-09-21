export function normalizeMuscleMap(input: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  let total = 0;
  for (const k of Object.keys(input)) {
    const v = Number(input[k]);
    if (!Number.isFinite(v) || v <= 0) continue;
    out[k] = v;
    total += v;
  }
  if (total <= 0) return {};
  for (const k of Object.keys(out)) {
    out[k] = Math.round((out[k] / total) * 100);
  }
  return out;
}

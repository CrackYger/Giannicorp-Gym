export function epley1RM(weightKg: number, reps: number) {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

export type PRKinds = { repPR: boolean; loadPR: boolean; est1RMPR: boolean };

export function detectPRKinds(
  current: { weightKg: number; reps: number },
  history: Array<{ weightKg: number; reps: number; ts: number }>
): PRKinds {
  const estNow = epley1RM(current.weightKg, current.reps);
  let repMaxAtWeight = 0, loadMaxAtReps = 0, estMax = 0;
  for (const h of history) {
    if (h.weightKg === current.weightKg) repMaxAtWeight = Math.max(repMaxAtWeight, h.reps);
    if (h.reps === current.reps) loadMaxAtReps = Math.max(loadMaxAtReps, h.weightKg);
    estMax = Math.max(estMax, epley1RM(h.weightKg, h.reps));
  }
  return {
    repPR: current.reps > repMaxAtWeight,
    loadPR: current.weightKg > loadMaxAtReps,
    est1RMPR: estNow > estMax,
  };
}

import type { Session } from './types'

export function est1RM(weight: number, reps: number) {
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) return 0
  // Epley formula
  return Math.round((weight * (1 + reps / 30)) * 10) / 10
}

export type PRSummary = {
  prBySetId: Record<string, true>
  bestByExercise: Record<string, { value: number, date: string, setId: string }>
  list: Array<{ exerciseId: string, value: number, date: string, setId: string }>
}

export function computePRs(sessions: Session[]): PRSummary {
  const prBySetId: Record<string, true> = {}
  const bestByExercise: Record<string, { value: number, date: string, setId: string }> = {}
  const list: Array<{ exerciseId: string, value: number, date: string, setId: string }> = []

  const sorted = sessions.slice().sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime())
  for (const s of sorted) {
    for (const st of s.sets) {
      const est = est1RM(st.weight, st.reps)
      const cur = bestByExercise[st.exerciseId]?.value ?? 0
      if (est > cur) {
        prBySetId[st.id] = true
        bestByExercise[st.exerciseId] = { value: est, date: s.date, setId: st.id }
        list.push({ exerciseId: st.exerciseId, value: est, date: s.date, setId: st.id })
      }
    }
  }
  return { prBySetId, bestByExercise, list }
}

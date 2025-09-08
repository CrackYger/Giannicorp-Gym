import { create } from 'zustand'
import { load, save } from '../libs/storage'
import type { Exercise, Plan, Session, SetEntry } from '../libs/types'
import { defaultExercises, defaultPlan } from '../data/seed'

type State = {
  exercises: Exercise[]
  plans: Plan[]
  sessions: Session[]
  activeSessionId: string | null
}

type Actions = {
  init: () => void
  addExercise: (ex: Exercise) => void
  addPlan: (p: Plan) => void
  startSession: (planId: string | null, dayId: string | null) => string
  addSet: (exerciseId: string, weight: number, reps: number) => void
  endSession: () => void
}

export const useAppStore = create<State & Actions>((set, get) => ({
  exercises: [],
  plans: [],
  sessions: [],
  activeSessionId: null,

  init: () => {
    const data = load()
    if (data.exercises.length === 0 && data.plans.length === 0) {
      data.exercises = defaultExercises
      data.plans = [defaultPlan]
    }
    set({ ...data })
  },

  addExercise: (ex) => {
    const state = get()
    const exercises = [...state.exercises, ex]
    const data = { ...state, exercises }
    save(data); set(data)
  },

  addPlan: (p) => {
    const state = get()
    const plans = [...state.plans, p]
    const data = { ...state, plans }
    save(data); set(data)
  },

  startSession: (planId, dayId) => {
    const state = get()
    const id = crypto.randomUUID()
    const session: Session = { id, planId, dayId, date: new Date().toISOString(), sets: [], completed: false }
    const sessions = [...state.sessions, session]
    const data = { ...state, sessions, activeSessionId: id }
    save(data); set(data)
    return id
  },

  addSet: (exerciseId, weight, reps) => {
    const state = get()
    if (!state.activeSessionId) return
    const sessions = state.sessions.map(s => {
      if (s.id !== state.activeSessionId) return s
      const set: SetEntry = { id: crypto.randomUUID(), exerciseId, weight, reps }
      return { ...s, sets: [...s.sets, set] }
    })
    const data = { ...state, sessions }
    save(data); set(data)
  },

  endSession: () => {
    const state = get()
    if (!state.activeSessionId) return
    const sessions = state.sessions.map(s => s.id === state.activeSessionId ? { ...s, completed: true } : s)
    const data = { ...state, sessions, activeSessionId: null }
    save(data); set(data)
  }
}))

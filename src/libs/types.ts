export type Exercise = {
  id: string
  name: string
  bodypart: 'Chest'|'Back'|'Legs'|'Shoulders'|'Arms'|'Core'|'Other'
  notes?: string
}

export type Plan = {
  id: string
  name: string
  days: Array<{
    id: string
    name: string
    exerciseIds: string[]
  }>
}

export type SetEntry = {
  id: string
  exerciseId: string
  weight: number
  reps: number
}

export type Session = {
  id: string
  planId: string | null
  dayId: string | null
  date: string // ISO
  notes?: string
  sets: SetEntry[]
  completed: boolean
}

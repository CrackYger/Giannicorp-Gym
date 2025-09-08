import type { Exercise, Plan } from '../libs/types'

export const defaultExercises: Exercise[] = [
  { id: 'ex-db-incline', name: 'Schrägbankdrücken KH', bodypart: 'Chest' },
  { id: 'ex-tbar', name: 'T-Bar Row', bodypart: 'Back' },
  { id: 'ex-squat', name: 'Kniebeuge', bodypart: 'Legs' },
  { id: 'ex-ohp', name: 'Overhead Press', bodypart: 'Shoulders' },
]

export const defaultPlan: Plan = {
  id: 'plan-ppl',
  name: 'PPL (Push/Pull/Legs)',
  days: [
    { id: 'day-push', name: 'Push', exerciseIds: ['ex-db-incline','ex-ohp'] },
    { id: 'day-pull', name: 'Pull', exerciseIds: ['ex-tbar'] },
    { id: 'day-legs', name: 'Legs', exerciseIds: ['ex-squat'] },
  ]
}

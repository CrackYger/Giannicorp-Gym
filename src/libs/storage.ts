const KEY = 'gcf_data_v1';

export type DataShape = {
  exercises: any[]
  plans: any[]
  sessions: any[]
  activeSessionId: string | null
}

export function load(): DataShape {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) throw new Error('no data')
    return JSON.parse(raw)
  } catch {
    return { exercises: [], plans: [], sessions: [], activeSessionId: null }
  }
}

export function save(data: DataShape) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportCSV(sessions: any[]) {
  const rows = [['Datum','Übung','Gewicht(kg)','Wdh.']]
  sessions.forEach((s: any) => {
    s.sets.forEach((set: any) => {
      rows.push([new Date(s.date).toLocaleDateString(), set.exerciseName, set.weight, set.reps])
    })
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'giannicorp_fitness_log.csv'
  a.click()
  URL.revokeObjectURL(url)
}

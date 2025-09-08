import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
  import type { Session, SetEntry } from '../libs/types'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { exportCSV } from '../libs/storage'
import { est1RM, computePRs } from '../libs/lifts'

type RowSet = SetEntry & { exerciseName: string; est1rm: number }
type Row = { id: string; date: string; sets: RowSet[] }

export default function History() {
  const { sessions, exercises } = useAppStore()

  const rows = useMemo(()=>{
    return sessions.map((s: Session) => ({
      ...s,
      sets: s.sets.map((st: SetEntry) => ({
        ...st,
        exerciseName: exercises.find(e => e.id === st.exerciseId)?.name ?? '—',
        est1rm: est1RM(st.weight, st.reps)
      }))
    }))
  }, [sessions, exercises])

  const prs = useMemo(()=> computePRs(sessions), [sessions])
  const prCount = prs.list.length

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Verlauf & Export</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardTitle>CSV Export</CardTitle>
          <Button onClick={()=> exportCSV(rows)}>Export starten</Button>
        </Card>
        <Card>
          <CardTitle>PRs gesamt</CardTitle>
          <div className="text-3xl font-bold">{prCount}</div>
          <div className="text-xs text-gc-subtle mt-1">gezählt via geschätzter 1RM (Epley)</div>
        </Card>
        <Card>
          <CardTitle>Top-PRs (je Übung)</CardTitle>
          <ul className="text-sm">
            {Object.entries(prs.bestByExercise).map(([exId, info])=> (
              <li key={exId} className="flex items-center justify-between py-1 border-b border-white/10 last:border-b-0">
                <span>{exercises.find(e=>e.id===exId)?.name ?? exId}</span>
                <span className="chip">{info.value} kg 1RM</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4">
        {rows.slice().reverse().map((s: Row) => (
          <Card key={s.id}>
            <CardTitle>{new Date(s.date).toLocaleString()}</CardTitle>
            <table className="table">
              <thead>
                <tr>
                  <th>Übung</th>
                  <th>Gewicht</th>
                  <th>Wdh.</th>
                  <th>1RM (est.)</th>
                  <th>PR</th>
                </tr>
              </thead>
              <tbody>
                {s.sets.map((st: RowSet) => (
                  <tr key={st.id}>
                    <td>{st.exerciseName}</td>
                    <td>{st.weight}</td>
                    <td>{st.reps}</td>
                    <td>{st.est1rm}</td>
                    <td>{prs.prBySetId[st.id] ? '🏆' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { useMemo, useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { NumberField } from '../components/ui/NumberField'
import { Sheet } from '../components/ui/Sheet'
import ActiveSessionBar from '../components/layout/ActiveSessionBar'
import { Segmented } from '../components/ui/Segmented'

type SetLike = { weight: number; reps: number; exerciseId: string }

function suggestNext(last: SetLike | null): { weight: number | null; reps: number | null; rationale: string } {
  if (!last) return { weight: null, reps: null, rationale: 'Keine Historie – starte locker ein.' }
  const w = last.weight || 0
  const r = last.reps || 0
  if (r >= 12) return { weight: Math.round((w + 2.5)*2)/2, reps: 8, rationale: '≥12 Wdh → +2.5 kg & zurück auf 8' }
  if (r >= 9)  return { weight: w, reps: 10, rationale: '9–11 Wdh → Gewicht halten, auf 10 zielen' }
  if (r >= 7)  return { weight: w, reps: 8, rationale: '7–8 Wdh → Gewicht halten, auf 8 zielen' }
  return { weight: Math.max(0, Math.round((w - 2.5)*2)/2), reps: 8, rationale: '<7 Wdh → -2.5 kg & auf 8 zielen' }
}

export default function Workout() {
  const { plans, exercises, startSession, addSet, sessions, activeSessionId } = useAppStore()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(plans[0]?.id ?? null)
  const [exerciseId, setExerciseId] = useState<string>(exercises[0]?.id ?? '')
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(10)
  const [open, setOpen] = useState(false)
  const [rest, setRest] = useState<'60'|'90'|'120'>('90')

  // PR info state for the last saved set
  const [prInfo, setPrInfo] = useState<{ isPR: boolean; est: number } | null>(null)

  useEffect(()=> {
    if (!exerciseId && exercises[0]) setExerciseId(exercises[0].id)
  }, [exercises, exerciseId])

  const lastForExercise = useMemo(()=>{
    for (let i=sessions.length-1;i>=0;i--) {
      const s = sessions[i]
      const entry = s.sets.slice().reverse().find(st => st.exerciseId === exerciseId)
      if (entry) return entry
    }
    return null
  }, [sessions, exerciseId])

  const suggestion = useMemo(()=> suggestNext(lastForExercise as any), [lastForExercise?.id])

  useEffect(()=>{
    // Prefill with suggestion when switching exercise
    if (suggestion.weight != null) setWeight(suggestion.weight)
    if (suggestion.reps != null) setReps(suggestion.reps)
  }, [exerciseId])

  const quickReps = [5,8,10,12]
  const quickWeights = (lastForExercise
    ? [lastForExercise.weight-2.5, lastForExercise.weight, lastForExercise.weight+2.5, lastForExercise.weight+5]
    : [20,25,30,35]
  ).map(v=>Math.max(0,Math.round((v)*2)/2))

  const saveSet = () => {
    if (!activeSessionId) startSession(selectedPlan ?? null, null)
    // compute PR before adding
    let best = 0
    for (let i=sessions.length-1;i>=0;i--) {
      const s = sessions[i]
      for (let j=0;j<s.sets.length;j++){
        const st = s.sets[j]
        if (st.exerciseId !== exerciseId) continue
        const est = (st.weight||0) * (1 + (st.reps||0) / 30)
        if (est > best) best = est
      }
    }
    const currentEst = (Number(weight)||0) * (1 + (Number(reps)||0) / 30)
    const isPR = currentEst > best
    setPrInfo({ isPR, est: Math.round(currentEst*10)/10 })

    addSet(exerciseId, weight, reps)
    if (navigator.vibrate) navigator.vibrate(10)
    // Notify rest timer to start
    window.dispatchEvent(new CustomEvent('gcf:setSaved', { detail: { rest: Number(rest) } }))
    setOpen(true)
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Workout</h1>

      {!activeSessionId && (
        <Card>
          <CardTitle>Schnellstart</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select className="input-lg" value={selectedPlan ?? ''} onChange={e=>setSelectedPlan(e.target.value)}>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option value="">Ohne Plan</option>
            </select>
            <div className="grid">
              <label className="label">Pause</label>
              <Segmented
                options={[{label:'60s',value:'60'},{label:'90s',value:'90'},{label:'120s',value:'120'}]}
                value={rest} onChange={(v)=> setRest(v as any)}
              />
            </div>
            <Button className="btn-lg" onClick={()=> startSession(selectedPlan ?? null, null)}>Session starten</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Satz hinzufügen</CardTitle>
        <div className="grid gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select className="input-lg" value={exerciseId} onChange={e=>setExerciseId(e.target.value)}>
              {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
            <NumberField label="Gewicht (kg)" value={weight} onChange={setWeight} step={2.5} />
            <NumberField label="Wdh." value={reps} onChange={setReps} step={1} />
          </div>

          {/* Auto-Vorschlag */}
          <div className="seg flex items-center justify-between">
            <div className="px-3 py-1.5 text-sm">
              <span className="opacity-60">Vorschlag:</span>{' '}
              <span className="font-semibold">{suggestion.weight ?? '—'} kg × {suggestion.reps ?? '—'}</span>
              <span className="opacity-60"> – {suggestion.rationale}</span>
            </div>
            <button className="btn-ghost tap" onClick={()=> {
              if (suggestion.weight != null) setWeight(suggestion.weight!)
              if (suggestion.reps != null) setReps(suggestion.reps!)
            }}>Übernehmen</button>
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2">
            {quickWeights.map((w, i)=>(
              <button key={i} className="btn-ghost tap" onClick={()=> setWeight(w)}>{w} kg</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickReps.map((r)=>(
              <button key={r} className="btn-ghost tap" onClick={()=> setReps(r)}>{r}×</button>
            ))}
          </div>

          <Button className="btn-lg" onClick={saveSet}>Satz speichern</Button>
          {lastForExercise && <div className="text-xs text-gc-subtle">Letzter Satz: {lastForExercise.weight} kg × {lastForExercise.reps}</div>}
        </div>
      </Card>

      <Sheet open={open} onClose={()=> setOpen(false)} title={prInfo?.isPR ? '🎉 Neuer PR' : 'Satz gespeichert'}>
        <div className="grid gap-2">
          {prInfo?.isPR && <div className="chip">Neuer PR! Est. 1RM: {prInfo.est} kg</div>}
          <div className="text-sm text-gc-subtle">Pause läuft automatisch. Du kannst die Dauer im Schnellstart wählen.</div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost tap" onClick={()=> setOpen(false)}>OK</button>
            <Button className="tap" onClick={()=> { setOpen(false); }}>Noch ein Satz</Button>
          </div>
        </div>
      </Sheet>

      <ActiveSessionBar onAddSet={()=> setOpen(true)} />
    </div>
  )
}

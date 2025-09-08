import { useAppStore } from '../store/useAppStore'
import { Card, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useState } from 'react'

export default function Plan() {
  const { plans, exercises, addExercise, addPlan } = useAppStore()
  const [exName, setExName] = useState('')
  const [bp, setBp] = useState<'Chest'|'Back'|'Legs'|'Shoulders'|'Arms'|'Core'|'Other'>('Chest')
  const [planName, setPlanName] = useState('')

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Plan & Übungen</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardTitle>Übung hinzufügen</CardTitle>
          <div className="grid gap-3">
            <label className="label">Name</label>
            <Input placeholder="z.B. Schrägbankdrücken KH" value={exName} onChange={e=>setExName(e.target.value)} />
            <label className="label">Muskelgruppe</label>
            <select className="input" value={bp} onChange={e=>setBp(e.target.value as any)}>
              <option>Chest</option><option>Back</option><option>Legs</option>
              <option>Shoulders</option><option>Arms</option><option>Core</option><option>Other</option>
            </select>
            <Button
              onClick={()=>{
                if (!exName.trim()) return
                addExercise({ id: crypto.randomUUID(), name: exName.trim(), bodypart: bp })
                setExName('')
              }}>Speichern</Button>
            <div className="text-sm text-gc-subtle">Gesamt: {exercises.length}</div>
          </div>
        </Card>

        <Card>
          <CardTitle>Plan anlegen</CardTitle>
          <div className="grid gap-3">
            <label className="label">Planname</label>
            <Input placeholder="z.B. PPL (Push/Pull/Legs)" value={planName} onChange={e=>setPlanName(e.target.value)} />
            <Button
              onClick={()=>{
                if (!planName.trim()) return
                addPlan({ id: crypto.randomUUID(), name: planName.trim(), days: [] })
                setPlanName('')
              }}>Speichern</Button>
            <div className="text-sm text-gc-subtle">Pläne: {plans.length}</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4">
        {plans.map(p => (
          <Card key={p.id}>
            <CardTitle>{p.name}</CardTitle>
            <div className="text-sm text-gc-subtle">Tage: {p.days.length}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

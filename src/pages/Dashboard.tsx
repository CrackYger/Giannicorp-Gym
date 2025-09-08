import { useEffect, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import { ProgressRing } from '../components/ui/ProgressRing'
  import { computePRs } from '../libs/lifts'
import { Sparkline } from '../components/ui/Sparkline'

function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}

export default function Dashboard() {
  const { init, sessions, plans } = useAppStore()
  useEffect(() => { init() }, [])

  const completed = sessions.filter(s => s.completed).length
  const last = sessions.slice().reverse()[0]
  const allSets = useMemo(()=> sessions.flatMap(s => s.sets), [sessions])
  const setsTotal = allSets.length
  const volumeTotal = allSets.reduce((acc, st)=> acc + st.weight*st.reps, 0)
  const avgReps = allSets.length ? Math.round(allSets.reduce((a,s)=>a+s.reps,0)/allSets.length) : 0
  const avgWeight = allSets.length ? Math.round(allSets.reduce((a,s)=>a+s.weight,0)/allSets.length) : 0

  const today = new Date()
  const todaySets = useMemo(()=>{
    const s = sessions.find(s => sameDay(new Date(s.date), today))
    return s ? s.sets.length : 0
  }, [sessions])

  const streak7 = useMemo(()=>{
    let streak = 0
    for (let i=0;i<7;i++){
      const d = new Date(); d.setDate(d.getDate()-i)
      const done = sessions.some(s => sameDay(new Date(s.date), d) && s.completed)
      if (done) streak++
    }
    return streak
  }, [sessions])

  const recentCounts = useMemo(()=>{
    const arr:number[] = []
    for (let i=5;i>=0;i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const s = sessions.find(s => sameDay(new Date(s.date), d))
      arr.push(s ? s.sets.length : 0)
    }
    return arr
  }, [sessions])

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Dense KPI tiles like Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="tile"><div className="label">Workouts gesamt</div><div className="value">{completed}</div></div>
        <div className="tile"><div className="label">Aktiver Plan</div><div className="value text-lg">{plans[0]?.name ?? '—'}</div></div>
        <div className="tile"><div className="label">Sätze gesamt</div><div className="value">{setsTotal}</div></div>
        <div className="tile"><div className="label">Ø Wiederholungen</div><div className="value">{avgReps}</div></div>
        <div className="tile"><div className="label">Ø Gewicht/Satz</div><div className="value">{avgWeight} kg</div></div>
        <div className="tile">
          <div className="label">Streak (7 Tage)</div>
          <div className="flex items-center gap-3 mt-1">
            <div className="value">{streak7}/7</div>
            <ProgressRing value={(streak7/7)*100} size={40} stroke={6} />
          </div>
        </div>
      </div>

      {/* Charts / Cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-gc-subtle">Sätze (6T)</div>
          <div className="mt-2"><Sparkline data={recentCounts} width={280} height={60} /></div>
          <div className="text-xs text-gc-subtle mt-2">Heute: {todaySets}</div>
        </Card>

        <Card>
          <div className="text-sm text-gc-subtle">Letztes Training</div>
          <div className="text-xl font-semibold mt-1">{last ? new Date(last.date).toLocaleString() : '—'}</div>
          <div className="text-xs text-gc-subtle mt-2">Aktueller Plan: {plans[0]?.name ?? '—'}</div>
        </Card>

        <Card>
          <div className="text-sm text-gc-subtle">Volumen gesamt</div>
          <div className="text-3xl font-bold mt-1">{volumeTotal.toLocaleString()} kg·rep</div>
          <div className="text-xs text-gc-subtle mt-2">Ø {avgWeight} kg × {avgReps} Wdh.</div>
        </Card>
      </div>
    </div>
  )
}

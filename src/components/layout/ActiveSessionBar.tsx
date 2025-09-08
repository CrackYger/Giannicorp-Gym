import { useEffect, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../ui/Button'

export default function ActiveSessionBar({ onAddSet }: { onAddSet: ()=>void }) {
  const { sessions, activeSessionId, endSession } = useAppStore()
  const session = sessions.find(s => s.id === activeSessionId)

  // Elapsed timer for session
  const [sec, setSec] = useState(0)

  // Rest timer after saving a set
  const [restLeft, setRestLeft] = useState<number>(0)
  const [restRunning, setRestRunning] = useState(false)
  const [restDefault, setRestDefault] = useState<number>(90)

  useEffect(() => {
    if (!session) return
    const start = new Date(session.date).getTime()
    const t = setInterval(()=> setSec(Math.floor((Date.now()-start)/1000)), 1000)
    return ()=> clearInterval(t)
  }, [session])

  // Listen for "set saved" events to auto-start rest timer
  useEffect(() => {
    const onSaved = (e: any) => {
      const dur = Number(e?.detail?.rest) || restDefault
      setRestLeft(dur)
      setRestRunning(true)
    }
    window.addEventListener('gcf:setSaved', onSaved as any)
    return () => window.removeEventListener('gcf:setSaved', onSaved as any)
  }, [restDefault])

  useEffect(() => {
    if (!restRunning) return
    if (restLeft <= 0) {
      setRestRunning(false)
      setRestLeft(0)
      if (navigator.vibrate) navigator.vibrate([10,60,10])
      return
    }
    const t = setTimeout(()=> setRestLeft(l => l-1), 1000)
    return ()=> clearTimeout(t)
  }, [restRunning, restLeft])

  if (!session) return null

  const mm = String(Math.floor(sec/60)).padStart(2,'0')
  const ss = String(sec%60).padStart(2,'0')

  const rmm = String(Math.floor(restLeft/60)).padStart(2,'0')
  const rss = String(restLeft%60).padStart(2,'0')

  return (
    <div className="active-bar">
      <div className="active-bar-inner">
        <div className="flex items-center gap-3">
          <div className="chip">Session aktiv • {mm}:{ss}</div>
          <div className="chip">Pause: {rmm}:{rss}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost tap"
            onClick={()=> setRestRunning(r => !r)}
          >{restRunning ? 'Pause' : 'Start'}</button>
          <button className="btn-ghost tap" onClick={()=> setRestLeft(l => l+15)}>+15s</button>
          <button className="btn-ghost tap" onClick={()=> setRestLeft(l => Math.max(0, l-15))}>-15s</button>
          <button className="btn-ghost tap" onClick={()=> { setRestLeft(restDefault); setRestRunning(true) }}>Reset</button>
          <Button className="tap" onClick={()=> endSession()}>Beenden</Button>
        </div>
      </div>
    </div>
  )
}

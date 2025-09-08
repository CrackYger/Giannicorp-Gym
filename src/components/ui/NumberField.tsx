import { useState, useEffect } from 'react'
import { Input } from './Input'

export function NumberField({ label, value, onChange, step=1, min=0, placeholder='' }:
  { label: string; value: number; onChange: (v:number)=>void; step?: number; min?: number; placeholder?: string }) {

  const [v, setV] = useState(String(value ?? ''))
  useEffect(()=> setV(String(value ?? '')), [value])

  const commit = (nv: string) => {
    const num = Number(nv)
    if (Number.isFinite(num)) onChange(Math.max(min, num))
    setV(nv)
  }

  return (
    <div className="grid gap-1">
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <button className="btn-square tap" onClick={()=> onChange(Math.max(min, (value||0) - step))}>−</button>
        <Input className="input-lg text-center" inputMode="decimal" pattern="[0-9]*" placeholder={placeholder} value={v} onChange={e=>commit(e.target.value)} />
        <button className="btn-square tap" onClick={()=> onChange((value||0) + step)}>+</button>
      </div>
    </div>
  )
}

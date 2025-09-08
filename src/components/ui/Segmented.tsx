import type { PropsWithChildren } from 'react'
type Opt = { label: string; value: string }
export function Segmented({ options, value, onChange }: PropsWithChildren<{ options: Opt[]; value: string; onChange: (v:string)=>void }>) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.value} aria-pressed={o.value===value} onClick={()=>onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

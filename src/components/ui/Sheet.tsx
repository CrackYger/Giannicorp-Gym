import { PropsWithChildren } from 'react'

export function Sheet({ open, onClose, children, title }: PropsWithChildren<{ open: boolean; onClose: ()=>void; title?: string }>) {
  if (!open) return null
  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-panel safe-b" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

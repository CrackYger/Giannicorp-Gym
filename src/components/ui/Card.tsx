import type { PropsWithChildren } from 'react'

export function Card({ children }: PropsWithChildren) {
  return <div className="card">{children}</div>
}
export function CardTitle({ children }: PropsWithChildren) {
  return <h3 className="text-lg font-semibold mb-2">{children}</h3>
}
export function CardRow({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-between py-2">{children}</div>
}

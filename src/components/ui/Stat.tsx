export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="text-sm text-gc-subtle">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  )
}

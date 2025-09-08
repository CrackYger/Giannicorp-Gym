export function Sparkline({ data, width=160, height=40 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(1, ...data)
  const step = data.length > 1 ? width / (data.length - 1) : width
  const pts = data.map((v, i) => {
    const x = i * step
    const y = height - (v / max) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-80">
      <polyline fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" points={pts} />
    </svg>
  )
}

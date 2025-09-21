type Point = { date: string; volume: number };

export function TrendChart({ data }: { data: Point[] }) {
  if (data.length === 0) return <div className="text-zinc-400 text-sm">Keine Daten</div>;
  const w = 320;
  const h = 120;
  const pad = 10;
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.volume);
  const xMax = Math.max(1, xs[xs.length - 1]);
  const yMax = Math.max(1, ...ys);
  const points = data
    .map((d, i) => {
      const x = pad + ((w - 2 * pad) * i) / xMax;
      const y = h - pad - ((h - 2 * pad) * d.volume) / yMax;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <polyline fill="none" stroke="#22c55e" strokeWidth="2" points={points} />
    </svg>
  );
}

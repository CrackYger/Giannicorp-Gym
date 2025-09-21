export function vibrate(ms=20) {
  try {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    if ('vibrate' in navigator) (navigator as any).vibrate?.(ms);
  } catch {}
}

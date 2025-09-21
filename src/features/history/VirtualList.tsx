import { useEffect, useRef, useState } from "react";

interface RowRenderer<T> {
  (item: T, index: number): JSX.Element;
}

export function VirtualList<T>({ items, rowHeight, height, renderRow }: { items: T[]; rowHeight: number; height: number; renderRow: RowRenderer<T>; }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const total = items.length;
  const visibleCount = Math.ceil(height / rowHeight) + 4; // overscan
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const end = Math.min(total, start + visibleCount);
  const offsetY = start * rowHeight;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} style={{ height, overflowY: "auto", position: "relative" }}>
      <div style={{ height: total * rowHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
          {items.slice(start, end).map((it, i) => renderRow(it, start + i))}
        </div>
      </div>
    </div>
  );
}

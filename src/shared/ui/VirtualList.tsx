import * as React from "react";

type Render<T> = (item: T, index: number) => React.ReactNode;

export function VirtualList<T>({
  items, itemHeight = 72, overscan = 8, render,
}: { items: T[]; itemHeight?: number; overscan?: number; render: Render<T> }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const height = 600;

  const onScroll = () => setScrollTop(ref.current?.scrollTop || 0);

  const total = items.length * itemHeight;
  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIdx = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + overscan);
  const slice = items.slice(startIdx, endIdx);

  return (
    <div ref={ref} onScroll={onScroll} style={{ height, overflowY: 'auto' }}>
      <div style={{ height: total, position: 'relative' }}>
        {slice.map((it, i) => {
          const idx = startIdx + i;
          return (
            <div key={idx} style={{ position: 'absolute', top: idx*itemHeight, left: 0, right: 0, height: itemHeight }}>
              {render(it, idx)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

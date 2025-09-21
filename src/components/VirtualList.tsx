import React from "react";
type VirtualListProps = { itemCount: number; itemHeight: number; renderItem: (index: number) => React.ReactNode; className?: string; };
export const VirtualList: React.FC<VirtualListProps> = ({ itemCount, itemHeight, renderItem, className }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0); const [height, setHeight] = React.useState(400);
  React.useEffect(() => { const node = containerRef.current; if (!node) return;
    const onScroll = () => setScrollTop(node.scrollTop); node.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => setHeight(node.clientHeight)); ro.observe(node); setHeight(node.clientHeight);
    return () => { node.removeEventListener("scroll", onScroll); ro.disconnect(); }; }, []);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 4);
  const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + height) / itemHeight) + 4);
  const items: React.ReactNode[] = []; for (let i = startIndex; i <= endIndex; i++) { items.push(<div key={i} style={{ position: "absolute", top: i * itemHeight, left: 0, right: 0, height: itemHeight }}>{renderItem(i)}</div>); }
  return (<div ref={containerRef} className={["relative overflow-auto", className ?? ""].join(" ")} style={{ willChange: "transform" }}><div style={{ height: itemCount * itemHeight, position: "relative" }}>{items}</div></div>);
};

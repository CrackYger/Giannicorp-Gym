import React, { useEffect, useRef, useState } from "react";
let FM:any=null; void (async()=>{ try{ FM=await import("framer-motion"); }catch{ FM=null; } })();

type Card = { title: string; body: string; icon?: React.ReactNode };
export function FeatureCarousel({ cards }: { cards: Card[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduce = typeof window!=="undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = scroller.current; if (!el) return;
    const onScroll = () => { const w = el.clientWidth; setIndex(Math.round(el.scrollLeft / w)); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduce || !auto) return;
    const el = scroller.current; if (!el) return;
    const id = window.setInterval(() => {
      const w = el.clientWidth;
      const next = (index + 1) % cards.length;
      el.scrollTo({ left: next * w, behavior: "smooth" });
    }, 4000);
    return () => window.clearInterval(id);
  }, [index, auto, reduce, cards.length]);

  function snapTo(i: number) {
    const el = scroller.current; if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: i * w, behavior: "smooth" });
  }

  const MotionDiv = FM?.motion?.div;

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="overflow-x-auto snap-x snap-mandatory no-scrollbar flex -mx-3 px-3"
        style={{ scrollBehavior: "smooth" }}
        aria-roledescription="carousel"
        aria-label="Feature Carousel"
      >
        {cards.map((c, i) => {
          const content = (
            <div className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5 p-5 w-full shrink-0 snap-center mx-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">✨</div>
                <div className="text-lg font-semibold">{c.title}</div>
              </div>
              <div className="text-base text-zinc-300">{c.body}</div>
            </div>
          );
          if (MotionDiv && !reduce) {
            const M = MotionDiv as any;
            return (
              <M
                key={i}
                className="w-full shrink-0 snap-center"
                style={{ width: "100%" }}
                initial={{ opacity: 0.9, y: 6, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ amount: 0.6 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
              >
                {content}
              </M>
            );
          }
          return <div key={i} className="w-full shrink-0 snap-center">{content}</div>;
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            className={"h-2 w-2 rounded-full " + (i === index ? "bg-accent" : "bg-zinc-600")}
            aria-label={`Slide ${i + 1}`}
            onClick={() => snapTo(i)}
          />
        ))}
        <label className="ml-3 flex items-center gap-1 text-xs text-zinc-400">
          <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} aria-label="Auto-Snap aktivieren/deaktivieren" />
          Auto
        </label>
      </div>
    </div>
  );
}

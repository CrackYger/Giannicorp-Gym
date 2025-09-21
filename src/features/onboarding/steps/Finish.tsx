import { useEffect, useRef } from "react";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { saveAppSettings } from "../../../data/stores/appSettings";
import { useNavigate } from "react-router-dom";
import { ONB } from "../../../i18n/onboarding.de";

export default function Finish() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const w = c.width = c.offsetWidth;
    const h = c.height = 120;
    const parts = Array.from({length: 120}, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 2,
      sz: 2 + Math.random() * 3,
      hue: Math.floor(Math.random()*360)
    }));
    const t0 = performance.now();
    const tick = (t: number) => {
      ctx.clearRect(0,0,w,h);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = `hsl(${p.hue} 80% 60% / 0.9)`;
        ctx.fillRect(p.x, p.y, p.sz, p.sz);
      });
      if (t - t0 < 800) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  async function done(to?: string) {
    await saveAppSettings({ onboardedAt: new Date().toISOString(), onboardingStep: null });
    if (to) nav(to); else nav("/start");
  }

  return (
    <Card className="glass rounded-2xl shadow-card border border-white/10 dark:border-white/5">
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-24 pointer-events-none" />
      </div>
      <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
        Fertig ✨
        <span className="rounded-full bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5">{ONB.finish_badge}</span>
      </h2>
      <p className="text-base se:text-sm text-zinc-400 mb-3">{ONB.finish_title}</p>
      <div className="flex flex-col gap-2">
        <Button onClick={()=> { void done("/start"); }}>{ONB.finish_primary}</Button>
        <Button variant="outline" onClick={()=> { void done("/exercises"); }}>{ONB.finish_secondary}</Button>
        <Button variant="ghost" onClick={()=> { void done("/dashboard"); }}>Zum Dashboard</Button>
      </div>
    </Card>
  );
}\n
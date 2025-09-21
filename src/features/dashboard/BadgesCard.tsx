import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { db } from "../../data/db";

type Badge = { code: string; awardedAt: string };

function label(code: string): string {
  if (code === "pr_hunter") return "PR‑Jäger";
  if (code === "volume_streak") return "Volumen‑Streak";
  if (code === "heatmap_master") return "Heatmap‑Meister";
  return code;
}

export function BadgesCard() {
  const [items, setItems] = useState<Badge[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const all = await db.badges.orderBy("awardedAt").reverse().limit(5).toArray();
      setItems(all.map((b: any) => ({ code: b.code, awardedAt: b.awardedAt })));
      setTotal(await db.badges.count());
    })();
  }, []);

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-400">Badges</div>
        <div className="text-xs text-zinc-500">Gesamt: {total}</div>
      </div>
      {total === 0 ? <div className="text-sm text-zinc-400">Noch keine Badges.</div> : (
        <ul className="space-y-1">
          {items.map((b, i) => (
            <li key={i} className="flex items-center justify-between">
              <span>{label(b.code)}</span>
              <span className="text-xs text-zinc-500">{new Date(b.awardedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

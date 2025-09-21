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

export default function BadgesPage() {
  const [items, setItems] = useState<Badge[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const all = await db.badges.orderBy("awardedAt").reverse().toArray();
      setItems(all.map((b: any) => ({ code: b.code, awardedAt: b.awardedAt })));
      const c: Record<string, number> = {};
      for (const b of all) c[b.code] = (c[b.code] || 0) + 1;
      setCounts(c);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Badges</h1>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(["pr_hunter","volume_streak","heatmap_master"] as const).map((code) => (
          <Card key={code}>
            <div className="mb-2 font-medium">{label(code)}</div>
            <div className="text-2xl font-semibold">{counts[code] || 0}</div>
            <div className="mt-1 h-2 w-full rounded bg-zinc-800">
              <div className="h-2 rounded bg-emerald-600" style={{ width: `${Math.min(100, (counts[code]||0) * 20)}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-2 font-medium">Zuletzt verliehen</div>
        {items.length === 0 ? <div className="text-sm text-zinc-400">—</div> : (
          <ul className="space-y-1">
            {items.slice(0,30).map((b, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{label(b.code)}</span>
                <span className="text-xs text-zinc-500">{new Date(b.awardedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

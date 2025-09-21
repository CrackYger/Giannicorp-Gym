import * as React from "react";
import { recentPRs } from "../../data/stores/prs";

export const TopPRsCard: React.FC = () => {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => { (async () => { const r = await recentPRs(30); setRows(r.slice(0,5)); })(); }, []);
  return (
    <div>
      <div className="mb-2 text-sm text-zinc-400">Top-PRs (30 Tage)</div>
      {rows.length === 0 ? <div className="text-zinc-500 text-sm">Keine PRs.</div> : (
        <ul className="space-y-2">
          {rows.map((r,i)=>(
            <li key={i} className="rounded-lg border border-zinc-800 px-3 py-2 flex items-center justify-between">
              <span className="text-zinc-300">{String(r.category).toUpperCase()}</span>
              <span className="text-zinc-400 text-sm">{new Date(r.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

import { useEffect, useState } from "react";
import { Card } from "../../shared/ui/Card";
import { listTemplates } from "../../data/stores/templates";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function TemplatesPage() {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const nav = useNavigate();
  const [qp] = useSearchParams();
  useEffect(()=>{
    void (async()=>{
      const x = await listTemplates();
      setItems(x.map(t=>({ id: t.id, name: t.name })));
    })();
  },[]);
  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Vorlagen</h1>
      <Card>
        {items.length === 0 ? <div className="text-sm text-zinc-400">Keine Vorlagen.</div> : (
          <ul className="space-y-2">
            {items.map(i => (
              <li key={i.id}>
                <button className="w-full text-left" onClick={()=>nav('/start?pick=1')}>
                  <div className="rounded-lg border border-zinc-800 px-3 py-2">{i.name}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

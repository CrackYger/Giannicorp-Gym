import React from 'react';
import { addCoachNote, deleteCoachNote, listCoachNotes } from './api.coach_notes';
import type { UUID } from './types';

interface Props { workoutId: UUID; }

export const CoachNotesTab: React.FC<Props> = ({ workoutId }) => {
  const [items, setItems] = React.useState<Awaited<ReturnType<typeof listCoachNotes>>>([]);
  const [text, setText] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    const rows = await listCoachNotes(workoutId);
    setItems(rows);
  }, [workoutId]);

  React.useEffect(() => { reload(); }, [reload]);

  const onAdd = async () => {
    setBusy(true); setErr(null);
    try {
      await addCoachNote(workoutId, text);
      setText('');
      await reload();
    } catch (e: any) { setErr(e.message || String(e)); }
    finally { setBusy(false); }
  };

  const onDel = async (id: UUID) => {
    setBusy(true); setErr(null);
    try { await deleteCoachNote(id); await reload(); }
    catch (e: any) { setErr(e.message || String(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <textarea className="w-full border rounded p-2 bg-transparent" rows={3} placeholder="Coach-Notiz hinzufügen…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded-lg border disabled:opacity-50" onClick={onAdd} disabled={busy || !text.trim()}>
            Speichern
          </button>
        </div>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="space-y-2">
        {items.map(n => (
          <div key={n.id} className="rounded-lg border dark:border-gray-700 p-3">
            <div className="text-sm whitespace-pre-wrap">{n.note}</div>
            <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
            <div className="text-right mt-2">
              <button className="text-xs underline" onClick={() => onDel(n.id)}>Löschen</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">Noch keine Notizen.</div>}
      </div>
    </div>
  );
};

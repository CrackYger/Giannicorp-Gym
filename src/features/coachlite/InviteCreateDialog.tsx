import React from 'react';
import { createInvite, listInvites } from './api.invites';
import { ensureActiveSpace } from './spaceUtils';
import type { Invite } from './types';

export const InviteCreateDialog: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState<'member'|'coach'>('member');
  const [days, setDays] = React.useState(7);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const { spaceId } = await ensureActiveSpace();
    const rows = await listInvites(spaceId);
    setInvites(rows);
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  const onCreate = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { spaceId } = await ensureActiveSpace();
      await createInvite(spaceId, role, days);
      await refresh();
      setOpen(false);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (code: string) => { await navigator.clipboard.writeText(code); };

  return (
    <div>
      <button className="rounded-lg border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5" onClick={() => setOpen(true)}>
        Invite-Code erstellen
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-4 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Invite-Code erstellen</h3>
            <div className="grid gap-3">
              <label className="text-sm">Rolle</label>
              <select className="border rounded px-2 py-1 bg-transparent" value={role} onChange={e => setRole(e.target.value as 'member'|'coach')}>
                <option value="member">Member</option>
                <option value="coach">Coach</option>
              </select>
              <label className="text-sm">Gültig (Tage)</label>
              <input type="number" min={1} max={30} className="border rounded px-2 py-1 bg-transparent" value={days} onChange={e => setDays(parseInt(e.target.value || '7', 10))} />
            </div>
            {err && <p className="text-sm text-red-500 mt-2">{err}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 rounded-lg border" onClick={() => setOpen(false)}>Abbrechen</button>
              <button className="px-3 py-2 rounded-lg border bg-black/5 dark:bg-white/10" disabled={busy} onClick={onCreate}>Erstellen</button>
            </div>
            <hr className="my-4" />
            <div className="max-h-48 overflow-auto space-y-2">
              {invites.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <div className="font-mono">{i.code}</div>
                    <div className="text-gray-500">Rolle: {i.role} · Ablauf: {new Date(i.expires_at).toLocaleDateString()}</div>
                  </div>
                  <button className="text-xs underline" onClick={() => copy(i.code)}>Code kopieren</button>
                </div>
              ))}
              {invites.length === 0 && <div className="text-sm text-gray-500">Noch keine Invites.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

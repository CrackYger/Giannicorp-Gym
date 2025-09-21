import React, { useEffect, useState } from 'react';
import { listMemberships } from './api.memberships';
import { ensureActiveSpace } from './spaceUtils';
import type { Membership } from './types';
import { InviteCreateDialog } from './InviteCreateDialog';

export const MembersManagePage: React.FC = () => {
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { spaceId } = await ensureActiveSpace();
        const rows = await listMemberships(spaceId);
        if (mounted) setMembers(rows);
      } catch (e: any) {
        if (mounted) setErr(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Lade Mitglieder…</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Space &amp; Mitglieder</h1>
        <InviteCreateDialog />
      </div>
      <div className="grid gap-2">
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border dark:border-gray-700 p-3">
            <div>
              <div className="font-medium">{m.display_name || m.user_id.slice(0, 8)}</div>
              <div className="text-sm text-gray-500">Rolle: {m.role} · Consent: {m.share_training ? 'teilt' : 'teilt nicht'}</div>
            </div>
          </div>
        ))}
        {members.length === 0 && <div className="text-sm text-gray-500">Noch keine Mitglieder.</div>}
      </div>
    </div>
  );
};

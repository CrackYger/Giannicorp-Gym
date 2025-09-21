import React, { useEffect, useState } from 'react';
import { useViewer, getAuthUserId } from './viewerStore';
import { ensureActiveSpace } from './spaceUtils';
import type { Membership, UUID } from './types';

export const ViewerSwitcher: React.FC = () => {
  const { viewerUserId, setViewerUserId, ensureDefault, listViewableMembers } = useViewer();
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<UUID | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await ensureDefault();
        const me = await getAuthUserId();
        if (mounted) setMyId(me);
        const { spaceId } = await ensureActiveSpace();
        const list = await listViewableMembers(spaceId);
        if (mounted) setMembers(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ensureDefault, listViewableMembers]);

  if (loading || !viewerUserId || !myId) {
    return <div className="text-sm text-gray-400">Lade Viewer…</div>;
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span>Ansicht:</span>
      <select
        className="rounded-md border px-2 py-1 bg-transparent"
        value={viewerUserId}
        onChange={(e) => setViewerUserId(e.target.value as UUID)}
      >
        <option value={myId}>Ich</option>
        {members
          .filter(m => m.user_id !== myId)
          .map(m => (
            <option key={m.id} value={m.user_id}>
              {m.display_name || m.user_id.slice(0, 8)}
            </option>
          ))}
      </select>
    </label>
  );
};

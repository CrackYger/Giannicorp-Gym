import React from 'react';
import { useViewer, getAuthUserId } from './viewerStore';
import { ensureActiveSpace } from './spaceUtils';
import { supa } from './supabaseClient';

/** Zeigt Hinweis, wenn der aktuelle Viewer (Client) kein Consent erteilt hat. */
export const ConsentNotice: React.FC = () => {
  const { viewerUserId } = useViewer();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const my = await getAuthUserId();
      if (!viewerUserId || viewerUserId === my) { if (mounted) setShow(false); return; }
      const { spaceId } = await ensureActiveSpace();
      const { data, error } = await supa()
        .from('memberships')
        .select('share_training')
        .eq('space_id', spaceId)
        .eq('user_id', viewerUserId)
        .limit(1)
        .maybeSingle();
      if (!error) setShow(!(data?.share_training));
    })();
    return () => { mounted = false; };
  }, [viewerUserId]);

  if (!show) return null;
  return (
    <div className="rounded-xl border dark:border-gray-700 p-3 bg-yellow-50/60 dark:bg-yellow-900/20">
      <div className="text-sm">
        <strong>Hinweis:</strong> Dieser Client teilt keine Trainingsdaten. Du siehst ggf. keine Inhalte.
      </div>
    </div>
  );
};

import React from 'react';
import { ensureActiveSpace } from './spaceUtils';
import { setShareTraining } from './api.memberships';
import { supa } from './supabaseClient';

export const ConsentToggle: React.FC = () => {
  const [checked, setChecked] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { spaceId } = await ensureActiveSpace();
      const { data, error } = await supa()
        .from('memberships')
        .select('share_training')
        .eq('space_id', spaceId)
        .limit(1)
        .maybeSingle();
      if (!error && data && mounted) setChecked(!!data.share_training);
    })();
    return () => { mounted = false; };
  }, []);

  const onToggle = async () => {
    if (checked === null) return;
    setBusy(true);
    try {
      const { spaceId } = await ensureActiveSpace();
      await setShareTraining(spaceId, !checked);
      setChecked(!checked);
    } finally {
      setBusy(false);
    }
  };

  if (checked === null) return <div className="text-sm text-gray-400">Lade…</div>;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
      aria-pressed={checked}
    >
      <span className="w-9 h-5 bg-gray-300 dark:bg-gray-700 rounded-full relative">
        <span className={'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ' + (checked ? 'translate-x-4' : '')}></span>
      </span>
      <span className="text-sm">
        {checked ? 'Training mit Coach teilen: AN' : 'Training mit Coach teilen: AUS'}
      </span>
    </button>
  );
};

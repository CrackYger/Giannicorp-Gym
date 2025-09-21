import React from 'react';
import { listTemplatesFiltered, toggleTemplateShared } from './templates';
import { ensureActiveSpace } from './spaceUtils';
import type { TemplateItem, UUID } from './types';

export const TemplateFilterBar: React.FC<{ onChange: (items: TemplateItem[]) => void }> = ({ onChange }) => {
  const [mode, setMode] = React.useState<'mine'|'space'>('mine');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const { spaceId } = await ensureActiveSpace();
      const items = await listTemplatesFiltered(mode === 'mine' ? null : spaceId, mode === 'mine');
      if (mounted) onChange(items);
    })();
    return () => { mounted = false; };
  }, [mode, onChange]);

  return (
    <div className="inline-flex rounded-lg border overflow-hidden">
      <button className={'px-3 py-2 ' + (mode === 'mine' ? 'bg-black/5 dark:bg-white/10' : '')} onClick={() => setMode('mine')}>Meine</button>
      <button className={'px-3 py-2 ' + (mode === 'space' ? 'bg-black/5 dark:bg-white/10' : '')} onClick={() => setMode('space')}>Space</button>
    </div>
  );
};

export const TemplateShareToggle: React.FC<{ id: UUID; shared: boolean; onChange?: (val: boolean) => void }> = ({ id, shared, onChange }) => {
  const [checked, setChecked] = React.useState(shared);
  const [busy, setBusy] = React.useState(false);

  const onToggle = async () => {
    setBusy(true);
    try {
      await toggleTemplateShared(id, !checked);
      setChecked(!checked);
      onChange?.(!checked);
    } finally {
      setBusy(false);
    }
  };

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
        {checked ? 'Im Space geteilt' : 'Template privat'}
      </span>
    </button>
  );
};

import React, { useState } from 'react';
import { consumeInvite } from './api.invites';
import { upsertMembership } from './api.memberships';
import type { Role } from './types';
import { ensureActiveSpace, setActiveSpaceId } from './spaceUtils';
import { setShareTraining } from './api.memberships';

export const JoinSpacePage: React.FC = () => {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle'|'ok'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');
  const [askConsent, setAskConsent] = useState<{ spaceId: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('idle'); setMsg('');
    try {
      const { invite, space_id } = await consumeInvite(code.trim().toUpperCase());
      await upsertMembership(space_id, invite.used_by!, invite.role as Role);
      setActiveSpaceId(space_id);
      setState('ok');
      setMsg('Beitritt erfolgreich.');
      setAskConsent({ spaceId: space_id });
    } catch (e: any) {
      setState('error');
      setMsg(e.message || String(e));
    }
  };

  const onConsent = async (share: boolean) => {
    if (!askConsent) return;
    await setShareTraining(askConsent.spaceId as any, share);
    setAskConsent(null);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-3">Space beitreten</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm text-gray-500">Invite-Code</label>
        <input
          className="w-full border rounded px-3 py-2 bg-transparent"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Z. B. 7K4M2X9B"
          required
        />
        <button className="px-3 py-2 rounded-lg border" type="submit">Beitreten</button>
      </form>
      {state === 'ok' && <p className="text-green-600 mt-3">{msg}</p>}
      {state === 'error' && <p className="text-red-600 mt-3">{msg}</p>}
      <p className="text-sm text-gray-500 mt-4">Beim ersten Beitritt kannst du festlegen, ob du Trainingsdaten mit einem Coach teilst.</p>

      {askConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold">Training mit Coach teilen?</h3>
            <p className="text-sm text-gray-500 mt-1">Du kannst dies später jederzeit im Profil ändern.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 rounded-lg border" onClick={() => onConsent(false)}>Jetzt nicht</button>
              <button className="px-3 py-2 rounded-lg border bg-black/5 dark:bg-white/10" onClick={() => onConsent(true)}>Teilen aktivieren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

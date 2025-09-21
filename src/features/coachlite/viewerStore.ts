import * as React from 'react';
import type { UUID, Membership } from './types';
import { supa } from './supabaseClient';

const KEY = 'coachlite.viewerUserId';

let _viewerUserId: UUID | null = (localStorage.getItem(KEY) || null) as UUID | null;
const listeners = new Set<() => void>();

function notify() { for (const l of Array.from(listeners)) l(); }

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot(): UUID | null { return _viewerUserId; }

export async function getAuthUserId(): Promise<UUID> {
  const { data: session } = await supa().auth.getSession();
  const uid = session.session?.user.id as UUID | undefined;
  if (!uid) throw new Error('Nicht eingeloggt.');
  return uid;
}

async function ensureDefault(): Promise<UUID> {
  if (_viewerUserId) return _viewerUserId;
  const me = await getAuthUserId();
  _viewerUserId = me;
  localStorage.setItem(KEY, me);
  notify();
  return me;
}

async function listViewableMembers(spaceId: UUID): Promise<Membership[]> {
  const { data, error } = await supa()
    .from('memberships')
    .select('*')
    .eq('space_id', spaceId)
    .eq('share_training', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Membership[];
}

function setViewerUserId(id: UUID) {
  _viewerUserId = id;
  localStorage.setItem(KEY, id);
  notify();
}

export function useViewer(): {
  viewerUserId: UUID | null;
  setViewerUserId: (id: UUID) => void;
  ensureDefault: () => Promise<UUID>;
  listViewableMembers: (spaceId: UUID) => Promise<Membership[]>;
} {
  const viewerUserId = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const api = React.useMemo(() => ({
    setViewerUserId,
    ensureDefault,
    listViewableMembers,
  }), []);
  return { viewerUserId, ...api };
}

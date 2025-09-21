import type { UUID, Role } from './types';
import { supa } from './supabaseClient';

const KEY = 'coachlite.activeSpaceId';

export function getActiveSpaceId(): UUID | null {
  return (localStorage.getItem(KEY) || null) as UUID | null;
}

export function setActiveSpaceId(spaceId: UUID): void {
  localStorage.setItem(KEY, spaceId);
}

export async function ensureActiveSpace(): Promise<{ spaceId: UUID; role: Role }> {
  const current = getActiveSpaceId();
  if (current) {
    const { data, error } = await supa()
      .from('memberships')
      .select('space_id, role')
      .eq('space_id', current)
      .limit(1)
      .maybeSingle();
    if (!error && data) return { spaceId: data.space_id as UUID, role: data.role as Role };
  }
  const { data, error } = await supa()
    .from('memberships')
    .select('space_id, role')
    .order('created_at', { ascending: true })
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Kein Space gefunden.');
  const spaceId = data[0].space_id as UUID;
  localStorage.setItem(KEY, spaceId);
  return { spaceId, role: data[0].role as Role };
}

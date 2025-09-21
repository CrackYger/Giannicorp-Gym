import { supa } from './supabaseClient';
import type { Membership, Role, UUID } from './types';

export async function listMemberships(spaceId: UUID): Promise<Membership[]> {
  const { data, error } = await supa()
    .from('memberships')
    .select('*')
    .eq('space_id', spaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Membership[];
}

export async function upsertMembership(spaceId: UUID, userId: UUID, role: Role): Promise<Membership> {
  const { data, error } = await supa()
    .from('memberships')
    .upsert({ space_id: spaceId, user_id: userId, role }, { onConflict: 'space_id,user_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as Membership;
}

export async function setShareTraining(spaceId: UUID, share: boolean): Promise<void> {
  const { data: session } = await supa().auth.getSession();
  const userId = session.session?.user.id as UUID | undefined;
  if (!userId) throw new Error('Nicht eingeloggt.');
  const { error } = await supa()
    .from('memberships')
    .update({ share_training: share })
    .eq('space_id', spaceId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setDisplayName(spaceId: UUID, name: string | null): Promise<void> {
  const { data: session } = await supa().auth.getSession();
  const userId = session.session?.user.id as UUID | undefined;
  if (!userId) throw new Error('Nicht eingeloggt.');
  const { error } = await supa()
    .from('memberships')
    .update({ display_name: name })
    .eq('space_id', spaceId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function mySpaces(): Promise<{ space_id: UUID; role: Role }[]> {
  const { data, error } = await supa()
    .from('memberships')
    .select('space_id, role')
    .is('deleted_at', null);
  if (error) throw error;
  return data as { space_id: UUID; role: Role }[];
}

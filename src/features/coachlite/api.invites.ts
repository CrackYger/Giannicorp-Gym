import { supa } from './supabaseClient';
import type { Invite, UUID } from './types';

function generateCode(len = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function createInvite(spaceId: UUID, role: 'member'|'coach', daysValid = 7): Promise<Invite> {
  const { data: session } = await supa().auth.getSession();
  const userId = session.session?.user.id as UUID | undefined;
  if (!userId) throw new Error('Nicht eingeloggt.');

  const code = generateCode(8);
  const expires_at = new Date(Date.now() + daysValid * 86400 * 1000).toISOString();

  const { data, error } = await supa()
    .from('invites')
    .insert({ space_id: spaceId, role, created_by: userId, code, expires_at })
    .select('*')
    .single();
  if (error) throw error;
  return data as Invite;
}

export async function listInvites(spaceId: UUID): Promise<Invite[]> {
  const { data, error } = await supa()
    .from('invites')
    .select('*')
    .eq('space_id', spaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Invite[];
}

export async function consumeInvite(code: string): Promise<{ invite: Invite; space_id: UUID }> {
  const { data: session } = await supa().auth.getSession();
  const userId = session.session?.user.id as UUID | undefined;
  if (!userId) throw new Error('Nicht eingeloggt.');

  const { data: inv, error: e1 } = await supa()
    .from('invites')
    .select('*')
    .eq('code', code)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();

  if (e1) throw e1;
  if (!inv) throw new Error('Code ungültig.');
  if (inv.used_by) throw new Error('Code wurde bereits verwendet.');
  if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error('Code abgelaufen. Bitte neuen Code anfordern.');

  const { error: e2 } = await supa()
    .from('invites')
    .update({ used_by: userId })
    .eq('id', inv.id)
    .is('used_by', null);
  if (e2) throw e2;

  return { invite: inv as Invite, space_id: inv.space_id as UUID };
}

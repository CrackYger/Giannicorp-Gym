import { supa } from './supabaseClient';
import type { TemplateItem, UUID } from './types';

export async function listTemplatesFiltered(spaceId: UUID | null, mineOnly: boolean): Promise<TemplateItem[]> {
  const q = supa().from('templates').select('*').order('created_at', { ascending: false });
  if (mineOnly) {
    const { data: session } = await supa().auth.getSession();
    const uid = session.session?.user.id as UUID | undefined;
    if (!uid) throw new Error('Nicht eingeloggt.');
    const { data, error } = await q.eq('user_id', uid);
    if (error) throw error;
    return data as TemplateItem[];
  } else {
    if (!spaceId) return [];
    const { data, error } = await q.eq('space_id', spaceId).eq('shared', true);
    if (error) throw error;
    return data as TemplateItem[];
  }
}

export async function toggleTemplateShared(templateId: UUID, shared: boolean): Promise<void> {
  const { error } = await supa().from('templates').update({ shared }).eq('id', templateId);
  if (error) throw error;
}

import { supa } from './supabaseClient';
import type { CoachNote, UUID } from './types';

export async function listCoachNotes(workoutId: UUID): Promise<CoachNote[]> {
  const { data, error } = await supa()
    .from('coach_notes')
    .select('*')
    .eq('workout_id', workoutId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as CoachNote[];
}

export async function addCoachNote(workoutId: UUID, text: string): Promise<CoachNote> {
  if (!text.trim()) throw new Error('Notiz darf nicht leer sein.');
  const { data: session } = await supa().auth.getSession();
  const uid = session.session?.user.id as UUID | undefined;
  if (!uid) throw new Error('Nicht eingeloggt.');

  const { data, error } = await supa()
    .from('coach_notes')
    .insert({ workout_id: workoutId, author_id: uid, note: text.trim() })
    .select('*')
    .single();
  if (error) throw error;
  return data as CoachNote;
}

export async function deleteCoachNote(id: UUID): Promise<void> {
  const { error } = await supa().from('coach_notes').delete().eq('id', id);
  if (error) throw error;
}

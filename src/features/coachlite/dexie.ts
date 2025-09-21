import Dexie, { Table } from 'dexie';
import type { Invite, CoachNote, Membership, TemplateItem } from './types';

export class CoachLiteDB extends Dexie {
  invites!: Table<Invite, string>;
  coach_notes!: Table<CoachNote, string>;
  memberships!: Table<Membership, string>;
  templates!: Table<TemplateItem, string>;
  sync_state!: Table<{ id: string; table: string; since: string }, string>;

  constructor() {
    super('coachlite');
    this.version(1).stores({
      invites: 'id, space_id, code, updated_at, deleted_at',
      coach_notes: 'id, workout_id, author_id, updated_at, deleted_at',
      memberships: 'id, [space_id+user_id], role, share_training, updated_at, deleted_at',
      templates: 'id, [space_id+shared], updated_at',
      sync_state: 'id, table, since',
    });
  }
}

export const coachDb = new CoachLiteDB();

export async function getSince(table: string): Promise<string> {
  const row = await coachDb.sync_state.get(table);
  return row?.since ?? '1970-01-01T00:00:00Z';
}

export async function setSince(table: string, since: string): Promise<void> {
  await coachDb.sync_state.put({ id: table, table, since });
}

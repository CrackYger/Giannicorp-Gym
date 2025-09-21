export type UUID = string;
export type Role = 'owner' | 'coach' | 'member';

export interface Membership {
  id: UUID;
  space_id: UUID;
  user_id: UUID;
  role: Role;
  share_training: boolean;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Invite {
  id: UUID;
  space_id: UUID;
  code: string;
  role: 'member' | 'coach';
  created_by: UUID;
  expires_at: string;
  used_by: UUID | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CoachNote {
  id: UUID;
  workout_id: UUID;
  author_id: UUID;
  note: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TemplateItem {
  id: UUID;
  space_id: UUID | null;
  user_id: UUID;
  name: string;
  shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: UUID;
  space_id: UUID;
  user_id: UUID;
  name: string | null;
  performed_at: string;
  created_at: string;
  updated_at: string;
}

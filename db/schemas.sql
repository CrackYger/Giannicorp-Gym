-- Schema Entwurf (noch nicht migrieren)
create table if not exists profiles (
  id uuid primary key,
  created_at timestamp with time zone default now()
);

create table if not exists spaces (
  id uuid primary key,
  owner_id uuid not null,
  created_at timestamp with time zone default now()
);

create table if not exists memberships (
  space_id uuid not null,
  user_id uuid not null,
  role text not null,
  primary key (space_id, user_id)
);

create table if not exists exercises (
  id uuid primary key,
  space_id uuid not null,
  name text not null,
  muscles jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_by uuid
);

create table if not exists workouts (
  id uuid primary key,
  space_id uuid not null,
  user_id uuid not null,
  started_at timestamp with time zone not null,
  ended_at timestamp with time zone,
  notes text
);

create table if not exists sets (
  id uuid primary key,
  workout_id uuid not null,
  exercise_id uuid not null,
  weight numeric not null,
  reps int not null,
  rpe numeric,
  rest_seconds int,
  notes text
);

create table if not exists templates (
  id uuid primary key,
  space_id uuid not null,
  name text not null,
  structure jsonb not null default '{}'::jsonb
);

-- RLS-Hinweis:
-- Später: USING (space_id in (select space_id from memberships where user_id = auth.uid()))
-- und user_id = auth.uid() wo relevant.

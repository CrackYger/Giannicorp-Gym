
-- Giannicorp Gym – v0.8.0 Coach/Client Lite (NO-DO version)
-- Run this file once. It's idempotent via IF EXISTS / CREATE OR REPLACE / DROP IF EXISTS.

------------------------------------------------------------
-- 1) TABLES + COLUMNS + INDEXES (must come first)
------------------------------------------------------------
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  code text unique not null,
  role text not null check (role in ('member','coach')),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table if not exists public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

-- memberships: new columns
alter table public.memberships add column if not exists share_training boolean not null default false;
alter table public.memberships add column if not exists display_name text;

-- templates: new column
alter table public.templates add column if not exists shared boolean not null default false;

-- indexes
create index if not exists invites_space_code_idx on public.invites(space_id, code);
create index if not exists coach_notes_workout_idx on public.coach_notes(workout_id);
create index if not exists memberships_space_user_idx on public.memberships(space_id, user_id);
create index if not exists templates_space_shared_idx on public.templates(space_id, shared);

------------------------------------------------------------
-- 2) RLS ENABLE
------------------------------------------------------------
alter table if exists public.spaces enable row level security;
alter table if exists public.memberships enable row level security;
alter table if exists public.invites enable row level security;
alter table if exists public.coach_notes enable row level security;
alter table if exists public.templates enable row level security;
alter table if exists public.workouts enable row level security;
alter table if exists public.sets enable row level security;
alter table if exists public.prs enable row level security;
-- exercise_e1rm optional; enable if you have it
alter table if exists public.exercise_e1rm enable row level security;

------------------------------------------------------------
-- 3) FUNCTIONS (CREATE OR REPLACE; no DO)
------------------------------------------------------------
create or replace function public.stamp_timestamps() returns trigger
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_at is null then new.created_at = now(); end if;
    new.updated_at = now();
  elsif tg_op = 'UPDATE' then
    new.updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function public.is_member(space uuid) returns boolean
security definer
as $$
begin
  return exists (
    select 1 from public.memberships m
    where m.space_id = space and m.user_id = auth.uid() and m.deleted_at is null
  );
end;
$$ language plpgsql;

create or replace function public.has_role(space uuid, wanted_role text) returns boolean
security definer
as $$
begin
  return exists (
    select 1 from public.memberships m
    where m.space_id = space and m.user_id = auth.uid() and m.role = wanted_role and m.deleted_at is null
  );
end;
$$ language plpgsql;

create or replace function public.can_view_training(space uuid, owner_user uuid) returns boolean
security definer
as $$
begin
  if owner_user = auth.uid() then return true; end if;
  if not public.is_member(space) then return false; end if;
  return exists (
    select 1 from public.memberships ms
    where ms.space_id = space
      and ms.user_id = owner_user
      and coalesce(ms.share_training, false) = true
      and ms.deleted_at is null
  );
end;
$$ language plpgsql;

------------------------------------------------------------
-- 4) TRIGGERS (DROP IF EXISTS → CREATE)
------------------------------------------------------------
drop trigger if exists stamp_ts_invites on public.invites;
create trigger stamp_ts_invites before insert or update on public.invites
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_coach_notes on public.coach_notes;
create trigger stamp_ts_coach_notes before insert or update on public.coach_notes
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_memberships on public.memberships;
create trigger stamp_ts_memberships before insert or update on public.memberships
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_templates on public.templates;
create trigger stamp_ts_templates before insert or update on public.templates
  for each row execute procedure public.stamp_timestamps();

------------------------------------------------------------
-- 5) POLICIES (DROP IF EXISTS → CREATE)  — Alpha, sicher & simpel
------------------------------------------------------------

-- spaces
drop policy if exists spaces_select_members on public.spaces;
create policy spaces_select_members on public.spaces
  for select using (public.is_member(id));

drop policy if exists spaces_write_owner on public.spaces;
create policy spaces_write_owner on public.spaces
  for all using (public.has_role(id, 'owner'))
  with check (public.has_role(id, 'owner'));

-- memberships
drop policy if exists memberships_select_members on public.memberships;
create policy memberships_select_members on public.memberships
  for select using (public.is_member(space_id));

drop policy if exists memberships_update_self_fields on public.memberships;
create policy memberships_update_self_fields on public.memberships
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invites
drop policy if exists invites_select_owner_coach on public.invites;
create policy invites_select_owner_coach on public.invites
  for select using (public.has_role(space_id, 'owner') or public.has_role(space_id, 'coach'));

drop policy if exists invites_write_owner_coach on public.invites;
create policy invites_write_owner_coach on public.invites
  for all using (public.has_role(space_id, 'owner') or public.has_role(space_id, 'coach'))
  with check (public.has_role(space_id, 'owner') or public.has_role(space_id, 'coach'));

-- workouts
drop policy if exists workouts_select_self_or_consent on public.workouts;
create policy workouts_select_self_or_consent on public.workouts
  for select using (public.can_view_training(space_id, user_id));

drop policy if exists workouts_write_self on public.workouts;
create policy workouts_write_self on public.workouts
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- sets
drop policy if exists sets_select_self_or_consent on public.sets;
create policy sets_select_self_or_consent on public.sets
  for select using (
    exists (
      select 1 from public.workouts w
      where w.id = sets.workout_id and public.can_view_training(w.space_id, w.user_id)
    )
  );

drop policy if exists sets_write_self on public.sets;
create policy sets_write_self on public.sets
  for all using (
    exists (select 1 from public.workouts w where w.id = sets.workout_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.workouts w where w.id = sets.workout_id and w.user_id = auth.uid())
  );

-- prs
drop policy if exists prs_select_self_or_consent on public.prs;
create policy prs_select_self_or_consent on public.prs
  for select using (public.can_view_training(space_id, user_id));

drop policy if exists prs_write_self on public.prs;
create policy prs_write_self on public.prs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- exercise_e1rm (OPTIONAL — ausführen, wenn Tabelle existiert)
-- drop policy if exists exercise_e1rm_select_self_or_consent on public.exercise_e1rm;
-- create policy exercise_e1rm_select_self_or_consent on public.exercise_e1rm
--   for select using (public.can_view_training(space_id, user_id));
-- drop policy if exists exercise_e1rm_write_self on public.exercise_e1rm;
-- create policy exercise_e1rm_write_self on public.exercise_e1rm
--   for all using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

-- templates
drop policy if exists templates_select_members on public.templates;
create policy templates_select_members on public.templates
  for select using (public.is_member(space_id));

drop policy if exists templates_update_owner_only on public.templates;
create policy templates_update_owner_only on public.templates
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- coach_notes
drop policy if exists coach_notes_select_author_or_owner on public.coach_notes;
create policy coach_notes_select_author_or_owner on public.coach_notes
  for select using (
    exists (
      select 1
      from public.workouts w
      join public.memberships m on m.space_id = w.space_id and m.user_id = auth.uid()
      where w.id = coach_notes.workout_id
        and m.deleted_at is null
        and (m.role in ('coach','owner') or w.user_id = auth.uid())
    )
  );

drop policy if exists coach_notes_insert_coach_only on public.coach_notes;
create policy coach_notes_insert_coach_only on public.coach_notes
  for insert with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and (public.has_role(w.space_id, 'coach') or public.has_role(w.space_id, 'owner'))
    ) and auth.uid() = author_id
  );

drop policy if exists coach_notes_delete_author_only on public.coach_notes;
create policy coach_notes_delete_author_only on public.coach_notes
  for delete using (auth.uid() = author_id);

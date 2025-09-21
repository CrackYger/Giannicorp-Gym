
-- Giannicorp Gym – v0.8.0 Full Bootstrap (NO-DO)

------------------------------------------------------------
-- 0) CORE TABLES (create minimal versions if missing)
------------------------------------------------------------
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','coach','member')),
  share_training boolean not null default false,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists memberships_space_user_uidx on public.memberships(space_id, user_id);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  space_id uuid,
  user_id uuid not null,
  name text,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null,
  name text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid,
  side text,
  load numeric,
  reps integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.prs (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null,
  exercise_id uuid,
  weight numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.exercise_e1rm (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null,
  exercise_id uuid,
  e1rm numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

------------------------------------------------------------
-- 1) COACH LITE TABLES (as specified)
------------------------------------------------------------
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  code text unique not null,
  role text not null check (role in ('member','coach')),
  created_by uuid not null,
  expires_at timestamptz not null,
  used_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  author_id uuid not null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

------------------------------------------------------------
-- 2) INDEXES
------------------------------------------------------------
create index if not exists invites_space_code_idx on public.invites(space_id, code);
create index if not exists coach_notes_workout_idx on public.coach_notes(workout_id);
create index if not exists templates_space_shared_idx on public.templates(space_id, shared);

------------------------------------------------------------
-- 3) ENABLE RLS
------------------------------------------------------------
alter table public.spaces enable row level security;
alter table public.memberships enable row level security;
alter table public.templates enable row level security;
alter table public.workouts enable row level security;
alter table public.sets enable row level security;
alter table public.prs enable row level security;
alter table public.exercise_e1rm enable row level security;
alter table public.invites enable row level security;
alter table public.coach_notes enable row level security;

------------------------------------------------------------
-- 4) FUNCTIONS (no DO)
------------------------------------------------------------
create or replace function public.stamp_timestamps() returns trigger
language plpgsql
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
$$;

create or replace function public.is_member(space uuid) returns boolean
security definer
language plpgsql
as $$
begin
  return exists (
    select 1 from public.memberships m
    where m.space_id = space and m.user_id = auth.uid() and m.deleted_at is null
  );
end;
$$;

create or replace function public.has_role(space uuid, wanted_role text) returns boolean
security definer
language plpgsql
as $$
begin
  return exists (
    select 1 from public.memberships m
    where m.space_id = space and m.user_id = auth.uid() and m.role = wanted_role and m.deleted_at is null
  );
end;
$$;

create or replace function public.can_view_training(space uuid, owner_user uuid) returns boolean
security definer
language plpgsql
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
$$;

------------------------------------------------------------
-- 5) TRIGGERS (DROP → CREATE)
------------------------------------------------------------
drop trigger if exists stamp_ts_spaces on public.spaces;
create trigger stamp_ts_spaces before insert or update on public.spaces
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_memberships on public.memberships;
create trigger stamp_ts_memberships before insert or update on public.memberships
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_templates on public.templates;
create trigger stamp_ts_templates before insert or update on public.templates
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_workouts on public.workouts;
create trigger stamp_ts_workouts before insert or update on public.workouts
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_sets on public.sets;
create trigger stamp_ts_sets before insert or update on public.sets
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_prs on public.prs;
create trigger stamp_ts_prs before insert or update on public.prs
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_e1rm on public.exercise_e1rm;
create trigger stamp_ts_e1rm before insert or update on public.exercise_e1rm
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_invites on public.invites;
create trigger stamp_ts_invites before insert or update on public.invites
  for each row execute procedure public.stamp_timestamps();

drop trigger if exists stamp_ts_coach_notes on public.coach_notes;
create trigger stamp_ts_coach_notes before insert or update on public.coach_notes
  for each row execute procedure public.stamp_timestamps();

------------------------------------------------------------
-- 6) POLICIES (DROP → CREATE) — Alpha
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

-- exercise_e1rm
drop policy if exists e1rm_select_self_or_consent on public.exercise_e1rm;
create policy e1rm_select_self_or_consent on public.exercise_e1rm
  for select using (public.can_view_training(space_id, user_id));

drop policy if exists e1rm_write_self on public.exercise_e1rm;
create policy e1rm_write_self on public.exercise_e1rm
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

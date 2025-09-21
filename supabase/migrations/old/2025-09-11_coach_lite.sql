
-- Giannicorp Gym – v0.8.0 Coach/Client Lite
-- Datum: 2025-09-11

-- Helper: set_updated_at()
do $$
begin
  create or replace function public.set_updated_at() returns trigger as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$ language plpgsql;
end $$;

-- Helper: boolean function – prüft Mitgliedschaft im Space
do $$
begin
  create or replace function public.is_member(space uuid) returns boolean as $$
  begin
    return exists (
      select 1 from public.memberships m
      where m.space_id = space and m.user_id = auth.uid() and m.deleted_at is null
    );
  end;
  $$ language plpgsql security definer;
exception when duplicate_function then
  null;
end $$;

-- Helper: Rolle prüfen
do $$
begin
  create or replace function public.has_role(space uuid, wanted_role text) returns boolean as $$
  begin
    return exists (
      select 1 from public.memberships m
      where m.space_id = space
        and m.user_id = auth.uid()
        and m.role = wanted_role
        and m.deleted_at is null
    );
  end;
  $$ language plpgsql security definer;
exception when duplicate_function then
  null;
end $$;

-- Helper: Darf Trainingsdaten eines Users sehen? (Consent via memberships.share_training)
do $$
begin
  create or replace function public.can_view_training(space uuid, owner_user uuid) returns boolean as $$
  begin
    -- gleiche Person immer erlaubt
    if owner_user = auth.uid() then return true; end if;

    -- im selben Space?
    if not public.is_member(space) then return false; end if;

    -- Consent gegeben?
    return exists (
      select 1
      from public.memberships ms
      where ms.space_id = space
        and ms.user_id = owner_user
        and coalesce(ms.share_training, false) = true
        and ms.deleted_at is null
    );
  end;
  $$ language plpgsql security definer;
exception when duplicate_function then
  null;
end $$;

-- ===========================
-- Tabellen
-- ===========================
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  code text unique not null,
  role text not null check (role in ('owner','coach','member')),
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

-- memberships erweitern
do $$ begin
  alter table public.memberships add column if not exists share_training boolean not null default false;
exception when duplicate_column then null; end $$;
do $$ begin
  alter table public.memberships add column if not exists display_name text;
exception when duplicate_column then null; end $$;

-- Indizes
create index if not exists invites_space_code_idx on public.invites(space_id, code);
create index if not exists coach_notes_workout_idx on public.coach_notes(workout_id);
create index if not exists memberships_space_user_idx on public.memberships(space_id, user_id);

-- updated_at Trigger
do $$ begin
  create trigger set_updated_at_invites
    before update on public.invites
    for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at_coach_notes
    before update on public.coach_notes
    for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at_memberships
    before update on public.memberships
    for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;

-- ===========================
-- RLS aktivieren
-- ===========================
alter table public.invites enable row level security;
alter table public.coach_notes enable row level security;
alter table public.memberships enable row level security;
-- Vorhandene Tabellen für Trainingsdaten
alter table if exists public.workouts enable row level security;
alter table if exists public.sets enable row level security;
alter table if exists public.prs enable row level security;
alter table if exists public.exercise_e1rm enable row level security;

-- ===========================
-- Policies
-- ===========================

-- INVITES
do $$
begin
  create policy invites_select_owner_coach on public.invites
    for select using (
      -- Owner sieht alle Invites; Coach darf sehen, wenn er Coach ist
      public.has_role(space_id, 'owner') or public.has_role(space_id, 'coach')
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy invites_insert_owner_coach on public.invites
    for insert with check (
      -- Owner & Coach dürfen Einladungen erstellen
      public.has_role(space_id, 'owner') or public.has_role(space_id, 'coach')
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy invites_delete_owner on public.invites
    for delete using (public.has_role(space_id, 'owner'));
exception when duplicate_object then null; end $$;

-- MEMBERSHIPS
do $$
begin
  create policy memberships_select_members on public.memberships
    for select using (public.is_member(space_id));
exception when duplicate_object then null; end $$;

-- Update nur share_training/ display_name durch Eigentümer des Accounts
do $$
begin
  create policy memberships_update_self_consent on public.memberships
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- WORKOUTS
do $$
begin
  create policy workouts_select_self_or_consent on public.workouts
    for select using (
      space_id is not null and
      public.can_view_training(space_id, user_id)
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy workouts_write_self on public.workouts
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- SETS (über workouts verknüpft)
do $$
begin
  create policy sets_select_self_or_consent on public.sets
    for select using (
      exists (
        select 1 from public.workouts w
        where w.id = sets.workout_id
          and public.can_view_training(w.space_id, w.user_id)
      )
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy sets_write_self on public.sets
    for all using (
      exists (select 1 from public.workouts w where w.id = sets.workout_id and w.user_id = auth.uid())
    )
    with check (
      exists (select 1 from public.workouts w where w.id = sets.workout_id and w.user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- PRS
do $$
begin
  create policy prs_select_self_or_consent on public.prs
    for select using (
      public.can_view_training(space_id, user_id)
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy prs_write_self on public.prs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- EXERCISE_E1RM (falls Tabelle vorhanden)
do $$
declare
  relid oid;
begin
  select c.oid into relid from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'exercise_e1rm' and c.relkind = 'r'; -- 'r' = table
  if relid is not null then
    execute $$
      create policy exercise_e1rm_select_self_or_consent on public.exercise_e1rm
        for select using (public.can_view_training(space_id, user_id));
    $$;
    execute $$
      create policy exercise_e1rm_write_self on public.exercise_e1rm
        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    $$;
  end if;
exception when duplicate_object then null; end $$;

-- COACH NOTES
do $$
begin
  create policy coach_notes_select_owner_or_coach on public.coach_notes
    for select using (
      exists (
        select 1 from public.workouts w
        join public.memberships m on m.space_id = w.space_id and m.user_id = auth.uid()
        where w.id = coach_notes.workout_id
          and m.deleted_at is null
          and (
            m.role = 'coach' or w.user_id = auth.uid()
          )
      )
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy coach_notes_insert_by_coach on public.coach_notes
    for insert with check (
      exists (
        select 1 from public.workouts w
        where w.id = workout_id
          and public.has_role(w.space_id, 'coach')
      ) and auth.uid() = author_id
    );
exception when duplicate_object then null; end $$;

do $$
begin
  create policy coach_notes_delete_by_author on public.coach_notes
    for delete using (auth.uid() = author_id);
exception when duplicate_object then null; end $$;

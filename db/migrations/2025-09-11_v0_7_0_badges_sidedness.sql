-- v0.7.0 migration: sidedness on exercises, side on sets, badges table + RLS

-- exercises: sidedness (text) default 'either'
do $$ begin
  alter table if exists public.exercises add column if not exists sidedness text;
  -- optional: set to 'either' for nulls
  update public.exercises set sidedness = coalesce(sidedness, 'either');
exception when undefined_table then
  raise notice 'Table public.exercises missing; create base schema first';
end $$;

-- sets: side (text) default 'both' not null
do $$ begin
  alter table if exists public.sets add column if not exists side text;
  update public.sets set side = 'both' where side is null;
  alter table if exists public.sets alter column side set not null;
  alter table if exists public.sets alter column side set default 'both';
exception when undefined_table then
  raise notice 'Table public.sets missing; create base schema first';
end $$;

-- badges table
create table if not exists public.badges (
  id uuid primary key,
  space_id uuid not null,
  user_id uuid not null,
  code text not null,
  awarded_at timestamptz not null default now(),
  period_from timestamptz,
  period_to timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes
create index if not exists badges_user_code_awarded_idx on public.badges (user_id, code, awarded_at);
create index if not exists badges_space_updated_idx on public.badges (space_id, updated_at);

-- trigger to keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_badges_upd on public.badges;
create trigger trg_badges_upd before update on public.badges
  for each row execute procedure public.touch_updated_at();

-- RLS aktivieren (falls noch nicht geschehen)
alter table public.badges enable row level security;

-- Bestehende Policies entfernen (idempotent)
drop policy if exists badges_select     on public.badges;
drop policy if exists badges_insert_own on public.badges;
drop policy if exists badges_update_own on public.badges;
drop policy if exists badges_delete_own on public.badges;

-- READ: Space-Mitglieder dürfen lesen
create policy badges_select on public.badges
  for select
  using (
    exists (
      select 1
      from public.memberships m
      where m.space_id = badges.space_id
        and m.user_id = auth.uid()
    )
  );

-- WRITE: Nur eigene Zeilen (user_id = auth.uid())
create policy badges_insert_own on public.badges
  for insert
  with check (user_id = auth.uid());

create policy badges_update_own on public.badges
  for update
  using (user_id = auth.uid());

create policy badges_delete_own on public.badges
  for delete
  using (user_id = auth.uid());

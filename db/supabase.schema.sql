-- Delta for v0.7.0: L/R + Badges

-- exercises: add sidedness
do $$ begin
  alter table public.exercises add column if not exists sidedness text;
exception when duplicate_column then null; end $$;

-- sets: add side
do $$ begin
  alter table public.sets add column if not exists side text not null default 'both';
exception when duplicate_column then null; end $$;

-- backfill existing rows to 'both' done by default value

-- badges table
create table if not exists public.badges (
  id uuid primary key default uuid_generate_v4(),
  space_id uuid not null,
  user_id uuid not null,
  code text not null, -- 'pr_hunter' | 'volume_streak' | 'heatmap_master'
  awarded_at timestamptz not null default now(),
  period_from date,
  period_to date,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_badges_space_updated on public.badges (space_id, updated_at);
create index if not exists idx_badges_user_code_awarded on public.badges (user_id, code, awarded_at);

-- trigger updated_at
create or replace function public.touch_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger trg_badges_upd before update on public.badges for each row execute procedure public.touch_updated_at();

-- enable RLS
alter table public.badges enable row level security;

-- policies
create policy if not exists "badges read" on public.badges
  for select using (exists (select 1 from public.memberships m where m.space_id = badges.space_id and m.user_id = auth.uid()));
create policy if not exists "badges write own" on public.badges
  for all using (user_id = auth.uid());

-- no changes needed for existing exercises/sets policies; new fields are covered.

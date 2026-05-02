-- ============================================================
-- Sprint 2: Account Data Persistence
-- File: supabase/sql/002_account_data_persistence.sql
--
-- ⚠️  RUN MANUALLY in Supabase SQL Editor before testing.
--     Do NOT execute automatically.
--
-- Tables:
--   1. public.children
--   2. public.screening_results
--
-- RLS: Enabled on both tables (users see only their own data).
-- ============================================================

-- ─── 1. public.children ──────────────────────────────────────────────────────

create table if not exists public.children (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  local_child_id  text,
  name            text        not null,
  date_of_birth   date,
  gender          text        check (gender in ('male', 'female')),
  grade_level     text,
  school_name     text,
  notes           text,
  avatar_emoji    text,
  age_years       int,
  age_group       text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, local_child_id)
);

alter table public.children enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "Users can view their own children"   on public.children;
drop policy if exists "Users can insert their own children" on public.children;
drop policy if exists "Users can update their own children" on public.children;
drop policy if exists "Users can delete their own children" on public.children;

create policy "Users can view their own children"
  on public.children for select
  using (auth.uid() = user_id);

create policy "Users can insert their own children"
  on public.children for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own children"
  on public.children for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own children"
  on public.children for delete
  using (auth.uid() = user_id);


-- ─── 2. public.screening_results ─────────────────────────────────────────────

create table if not exists public.screening_results (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  child_id        uuid        references public.children(id) on delete cascade,
  local_child_id  text,
  session_id      text        not null,
  path_type       text        check (path_type in ('learning', 'adhd')),
  screening_type  text,
  mode            text        default 'child' check (mode in ('child', 'self')),
  child_name      text,
  result_json     jsonb       not null,
  result_summary  jsonb,
  completed_at    timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, session_id)
);

alter table public.screening_results enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "Users can view their own screening results"   on public.screening_results;
drop policy if exists "Users can insert their own screening results" on public.screening_results;
drop policy if exists "Users can update their own screening results" on public.screening_results;
drop policy if exists "Users can delete their own screening results" on public.screening_results;

create policy "Users can view their own screening results"
  on public.screening_results for select
  using (auth.uid() = user_id);

create policy "Users can insert their own screening results"
  on public.screening_results for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own screening results"
  on public.screening_results for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own screening results"
  on public.screening_results for delete
  using (auth.uid() = user_id);


-- ─── Helper: auto-update updated_at ──────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists children_set_updated_at        on public.children;
drop trigger if exists screening_results_set_updated_at on public.screening_results;

create trigger children_set_updated_at
  before update on public.children
  for each row execute function public.set_updated_at();

create trigger screening_results_set_updated_at
  before update on public.screening_results
  for each row execute function public.set_updated_at();

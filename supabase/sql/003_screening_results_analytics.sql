-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Screening Results Analytics
-- Purpose: Lightweight analytics table for every completed screening.
--          Separate from screening_results (which stores full result JSON).
--          No raw JSON, no AI explanation, no recommendations array.
-- ─────────────────────────────────────────────────────────────────────────────

-- Note: public.screening_results already exists (002_account_data_persistence.sql)
-- and stores full result JSON linked to children profiles.
-- This migration creates a SEPARATE lightweight analytics table:
--   public.screening_analytics
-- Goal: count/analyze completed screenings even if user never books.

-- ─── 1. public.screening_analytics ──────────────────────────────────────────

create table if not exists public.screening_analytics (
  id              uuid        primary key default gen_random_uuid(),

  -- User reference (nullable: future-proofing, but current flow requires login)
  user_id         uuid        null references auth.users(id) on delete set null,

  -- Session identity (unique per screening attempt)
  session_id      text        not null,

  -- Child linkage (optional — only for child assessments)
  local_child_id  text        null,

  -- Subject classification
  subject_type    text        not null default 'unknown',
  -- conceptual values: 'self' | 'child' | 'unknown'

  subject_name    text        null,
  subject_age     text        null,

  -- Assessment metadata
  mode            text        null,
  -- conceptual values: 'self' | 'child'

  path_type       text        not null,
  -- values: 'learning' | 'adhd' | 'unknown'

  screening_type  text        null,

  -- Scores (extracted from nested result object — no raw JSON stored)
  score           numeric     null,
  percentage      numeric     null,
  risk_level      text        null,
  risk_label      text        null,
  result_level    text        null,

  -- Timestamps
  completed_at    timestamptz null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Post-screening actions
  booked_after_result boolean not null default false,

  -- Source tracking
  source          text        not null default 'screening_result_page',

  -- Prevent duplicate rows for same session
  unique(session_id)
);

-- ─── 2. Row Level Security ───────────────────────────────────────────────────

alter table public.screening_analytics enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "Users can view their own analytics"   on public.screening_analytics;
drop policy if exists "Users can insert their own analytics" on public.screening_analytics;
drop policy if exists "Users can update their own analytics" on public.screening_analytics;

-- SELECT: authenticated users can only see their own rows
create policy "Users can view their own analytics"
  on public.screening_analytics for select
  using (auth.uid() = user_id);

-- INSERT: authenticated users can only insert rows with their own user_id
create policy "Users can insert their own analytics"
  on public.screening_analytics for insert
  with check (auth.uid() = user_id);

-- UPDATE: authenticated users can only update their own rows
create policy "Users can update their own analytics"
  on public.screening_analytics for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE policy — analytics rows should not be deleted by users
-- No public anonymous select
-- No anonymous write

-- ─── 3. Indexes ──────────────────────────────────────────────────────────────

create index if not exists idx_screening_analytics_user_id
  on public.screening_analytics (user_id);

create index if not exists idx_screening_analytics_session_id
  on public.screening_analytics (session_id);

create index if not exists idx_screening_analytics_path_type
  on public.screening_analytics (path_type);

create index if not exists idx_screening_analytics_completed_at
  on public.screening_analytics (completed_at);

create index if not exists idx_screening_analytics_created_at
  on public.screening_analytics (created_at);

-- ─── 4. updated_at trigger ───────────────────────────────────────────────────

-- Create trigger function if not already exists (shared across tables)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_screening_analytics_updated_at on public.screening_analytics;

create trigger trg_screening_analytics_updated_at
  before update on public.screening_analytics
  for each row execute function public.set_updated_at();

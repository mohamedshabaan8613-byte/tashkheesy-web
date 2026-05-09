-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Self-Assessment Results Persistence
-- Purpose: Extend public.screening_results to support self-assessment results
--          alongside existing child screening results.
--
-- Strategy:
--   Reuse existing public.screening_results table (additive only).
--   Add nullable columns for self-assessment subject metadata.
--   Add a separate unique index on session_id alone (for upsert by session_id).
--   Do NOT drop or modify existing columns or child result rows.
--   Do NOT break existing RLS policies.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Add nullable columns for self-assessment metadata ────────────────────
-- subject_type: 'self' | 'child' (mirrors screening_analytics.subject_type)
alter table public.screening_results
  add column if not exists subject_type text null;

-- subject_name: name entered by user during self-assessment
alter table public.screening_results
  add column if not exists subject_name text null;

-- subject_age: age entered by user during self-assessment
alter table public.screening_results
  add column if not exists subject_age text null;

-- ─── 2. Add unique index on session_id alone ─────────────────────────────────
-- The existing unique constraint is (user_id, session_id).
-- We need a unique index on session_id alone to support upsert by session_id.
-- This is safe: session_id values are already globally unique (timestamp-based).
create unique index if not exists idx_screening_results_session_id_unique
  on public.screening_results (session_id);

-- ─── 3. Add indexes for common query patterns ────────────────────────────────
create index if not exists idx_screening_results_user_id
  on public.screening_results (user_id);

create index if not exists idx_screening_results_subject_type
  on public.screening_results (subject_type);

create index if not exists idx_screening_results_path_type
  on public.screening_results (path_type);

create index if not exists idx_screening_results_completed_at
  on public.screening_results (completed_at);

-- ─── 4. RLS: Ensure existing policies cover new columns ──────────────────────
-- Existing policies already cover SELECT/INSERT/UPDATE/DELETE by auth.uid() = user_id.
-- No new policies needed — new columns are covered by existing row-level policies.
-- Verify RLS is still enabled (idempotent):
alter table public.screening_results enable row level security;

-- ─── 5. Notes ────────────────────────────────────────────────────────────────
-- For self-assessment rows:
--   child_id      = NULL
--   local_child_id = NULL (or self_id if available)
--   child_name    = subject_name (kept for backward compat display)
--   subject_type  = 'self'
--   subject_name  = name entered by user
--   subject_age   = age entered by user
--   mode          = 'self'
--   result_json   = full result payload from localStorage
--   result_summary = { score, percentage, riskLevel, riskLabel }
--
-- For child screening rows (existing behavior — unchanged):
--   child_id      = uuid from children table
--   local_child_id = local id
--   child_name    = child name
--   subject_type  = 'child' (new column, nullable — old rows will be NULL)
--   mode          = 'child'
--   result_json   = full result payload

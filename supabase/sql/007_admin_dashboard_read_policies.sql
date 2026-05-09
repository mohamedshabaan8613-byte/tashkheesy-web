-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007: Admin Dashboard Read Policies
-- Purpose: Allow active admins to SELECT all rows from screening_analytics
--          so the admin dashboard can display aggregate screening metrics.
--
-- Strategy:
--   Additive only — no DROP, no ALTER on existing tables.
--   Adds one SELECT policy on screening_analytics for active admins.
--   Uses cross-table EXISTS check against admin_users (not same-table).
--   Does NOT add INSERT/UPDATE/DELETE admin policies on screening_analytics.
--   Does NOT add anonymous SELECT.
--   Does NOT add public SELECT.
--   Does NOT change existing user-owned policies.
--   Does NOT expose result_json (screening_analytics has no result_json column).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── RLS: screening_analytics — admin read ───────────────────────────────────

-- Active admins can SELECT all screening_analytics rows.
-- This is a cross-table EXISTS check from screening_analytics to admin_users.
-- No same-table recursion risk.
-- Existing user-owned policies ("Users can view their own analytics") remain
-- unchanged and continue to work for non-admin authenticated users.

create policy "screening_analytics: admin select all"
  on public.screening_analytics
  for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
        and au.is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Summary of all active policies on screening_analytics after this migration:
--
--   "Users can view their own analytics"    — SELECT — auth.uid() = user_id
--   "Users can insert their own analytics"  — INSERT — auth.uid() = user_id
--   "Users can update their own analytics"  — UPDATE — auth.uid() = user_id
--   "screening_analytics: admin select all" — SELECT — active admin (cross-table)
--
-- No DELETE policy. No anonymous SELECT. No public SELECT.
-- ─────────────────────────────────────────────────────────────────────────────

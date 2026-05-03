-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Remove DELETE Policy from screening_analytics RLS
-- Purpose: Corrective migration to ensure no DELETE policy exists on
--          public.screening_analytics in the live database.
--
-- Context:
--   Migration 003 was designed without a DELETE policy (see comment on line 91
--   of 003_screening_results_analytics.sql). However, this corrective migration
--   is added as a safety measure to explicitly drop any DELETE policy that may
--   have been created manually or via a previous version of the migration.
--
-- Safe to run:
--   - Uses DROP POLICY IF EXISTS — no error if policy does not exist.
--   - Does NOT drop SELECT / INSERT / UPDATE policies.
--   - Does NOT drop the table.
--   - Does NOT change any columns.
--   - Does NOT disable RLS.
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop any DELETE policy variants that may exist on screening_analytics.
-- All known and possible naming variants are listed below.

-- Variant 1: most likely name if DELETE policy was ever added
DROP POLICY IF EXISTS "Users can delete own screening analytics"
  ON public.screening_analytics;

-- Variant 2: alternative naming convention
DROP POLICY IF EXISTS "Users can delete their own analytics"
  ON public.screening_analytics;

-- Variant 3: short form
DROP POLICY IF EXISTS "delete_own_analytics"
  ON public.screening_analytics;

-- Variant 4: generic delete
DROP POLICY IF EXISTS "delete screening_analytics"
  ON public.screening_analytics;

-- ─── Confirm RLS remains enabled ─────────────────────────────────────────────
-- RLS must remain active — do not disable it.
-- The following line is a no-op if RLS is already enabled, but ensures
-- the table is protected after this migration runs.
ALTER TABLE public.screening_analytics ENABLE ROW LEVEL SECURITY;

-- ─── Verify remaining policies (informational comment) ───────────────────────
-- After this migration, the only active policies on screening_analytics should be:
--   1. "Users can view their own analytics"   (SELECT — auth.uid() = user_id)
--   2. "Users can insert their own analytics" (INSERT — auth.uid() = user_id)
--   3. "Users can update their own analytics" (UPDATE — auth.uid() = user_id)
-- No DELETE policy should exist.
-- No public/anonymous policy should exist.

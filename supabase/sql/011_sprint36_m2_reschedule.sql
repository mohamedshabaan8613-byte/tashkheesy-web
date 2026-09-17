-- ============================================================
-- Migration 011 — Sprint 3.6 M2: Reschedule Foundation
-- fix(ci): add IF NOT EXISTS / OR REPLACE guards for idempotency
--          prevents supabase db push failure on re-run
-- ============================================================

-- ── 1. Add lifecycle_version column (idempotent) ─────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations'
      AND column_name = 'lifecycle_version'
  ) THEN
    ALTER TABLE consultations
      ADD COLUMN lifecycle_version INTEGER NOT NULL DEFAULT 1;
  END IF;
END;
$$;

-- ── 2. Add reschedule_count column (idempotent) ──────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations'
      AND column_name = 'reschedule_count'
  ) THEN
    ALTER TABLE consultations
      ADD COLUMN reschedule_count INTEGER NOT NULL DEFAULT 0
        CONSTRAINT reschedule_count_non_negative CHECK (reschedule_count >= 0);
  END IF;
END;
$$;

-- ── 3. Add rescheduled_at column (idempotent) ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations'
      AND column_name = 'rescheduled_at'
  ) THEN
    ALTER TABLE consultations
      ADD COLUMN rescheduled_at TIMESTAMPTZ;
  END IF;
END;
$$;

-- ── 4. Add previous_slot_id column (idempotent) ──────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultations'
      AND column_name = 'previous_slot_id'
  ) THEN
    ALTER TABLE consultations
      ADD COLUMN previous_slot_id UUID
        REFERENCES specialist_slots(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- ── 5. Backfill lifecycle_version for existing rows ──────────
UPDATE consultations
SET lifecycle_version = 1
WHERE lifecycle_version IS NULL;

-- ── 6. Index on lifecycle_version (idempotent) ───────────────
CREATE INDEX IF NOT EXISTS idx_consultations_lifecycle_version
  ON consultations (lifecycle_version);

-- ── 7. RLS policies for new columns (idempotent via DO) ──────
DO $$
BEGIN
  -- lifecycle_version and reschedule_count are exposed via existing
  -- consultation SELECT policies — no new policy objects needed.
  -- This block is a no-op placeholder for audit clarity.
  NULL;
END;
$$;

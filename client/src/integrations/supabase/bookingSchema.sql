-- ============================================================================
-- Sprint 3.4 — Transactional Booking Schema Migration
-- Supabase PostgreSQL Migration
-- ============================================================================
-- Run this migration in your Supabase SQL editor or via supabase db push
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: consultations
-- Primary transactional entity — created at booking start, confirmed later.
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN (
                          'DRAFT', 'SLOT_SELECTED', 'CONFIRMING', 'CONFIRMED',
                          'CONFIRMATION_FAILED', 'CANCELLING', 'CANCELLED',
                          'CANCELLATION_FAILED', 'RESCHEDULE_REQUESTED',
                          'RESCHEDULE_IN_PROGRESS', 'RESCHEDULED', 'EXPIRED', 'COMPLETED'
                        )),
  booking_phase       TEXT NOT NULL DEFAULT 'IDLE',
  reservation_status  TEXT CHECK (reservation_status IN (
                        'PENDING', 'RESERVED', 'CONFIRMED', 'RELEASED', 'EXPIRED'
                      )),
  specialist_id       UUID REFERENCES specialists(id),
  slot_id             UUID REFERENCES available_slots(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  rescheduled_from    UUID,               -- previous slot_id for audit trail
  is_free_consultation BOOLEAN NOT NULL DEFAULT TRUE,
  cancellation_reason  TEXT,
  reschedule_count    INTEGER NOT NULL DEFAULT 0,
  ownership_token     TEXT                -- multi-tab safety token
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_user_status ON consultations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_consultations_specialist_id ON consultations(specialist_id);
CREATE INDEX IF NOT EXISTS idx_consultations_slot_id ON consultations(slot_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: slot_reservations
-- Separate from booking — prevents double-booking at DB level via UNIQUE.
-- ============================================================================

CREATE TABLE IF NOT EXISTS slot_reservations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id         UUID NOT NULL REFERENCES available_slots(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'RESERVED', 'CONFIRMED', 'RELEASED', 'EXPIRED')),
  reserved_until  TIMESTAMPTZ NOT NULL,
  released_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRITICAL: Prevents double-booking at DB level
-- Only one RESERVED or CONFIRMED reservation per slot at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_reservations_active
  ON slot_reservations(slot_id)
  WHERE status IN ('RESERVED', 'CONFIRMED');

CREATE INDEX IF NOT EXISTS idx_slot_reservations_user_id ON slot_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_slot_reservations_consultation_id ON slot_reservations(consultation_id);
CREATE INDEX IF NOT EXISTS idx_slot_reservations_status ON slot_reservations(status);

-- ============================================================================
-- TABLE: consultation_events
-- Append-only audit log. NEVER update rows, only INSERT.
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultation_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_events_consultation_id
  ON consultation_events(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_events_event_type
  ON consultation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_consultation_events_created_at
  ON consultation_events(created_at DESC);

-- ============================================================================
-- TABLE: notification_queue
-- Queue-ready — no real sends in Sprint 3.4, processed by background worker.
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id   UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  payload           JSONB NOT NULL DEFAULT '{}',
  queued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at           TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  retry_count       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_consultation_id
  ON notification_queue(consultation_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id
  ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_unsent
  ON notification_queue(queued_at)
  WHERE sent_at IS NULL AND failed_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- consultations: users can only see their own
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultations"
  ON consultations FOR UPDATE
  USING (auth.uid() = user_id);

-- slot_reservations: users can only see their own
ALTER TABLE slot_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON slot_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reservations"
  ON slot_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON slot_reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- consultation_events: read-only for users, service role writes
ALTER TABLE consultation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation events"
  ON consultation_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = consultation_events.consultation_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTION: cleanup_expired_reservations
-- Run via pg_cron or Supabase Edge Function on schedule.
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE slot_reservations
  SET status = 'EXPIRED'
  WHERE status = 'RESERVED'
    AND reserved_until < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: check_free_consultation_eligibility
-- Returns TRUE if user has not used their free consultation yet.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_free_consultation_eligibility(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM consultations
    WHERE user_id = p_user_id
      AND status = 'CONFIRMED'
      AND is_free_consultation = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

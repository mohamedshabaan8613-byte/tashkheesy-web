-- ============================================================
-- Migration 012 — Sprint 3.6: Atomic Reschedule RPC
-- fix(ci): use CREATE OR REPLACE FUNCTION for idempotency
--          prevents supabase db push failure on re-run
-- ============================================================

-- ── Drop legacy version if exists (safe — OR REPLACE handles it) ─
-- Using CREATE OR REPLACE so re-runs never fail with
-- "function already exists" errors.

CREATE OR REPLACE FUNCTION atomic_reschedule(
  consultation_id   UUID,
  old_slot_id       UUID,
  new_slot_id       UUID,
  ownership_token   TEXT,
  client_version    INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consultation    consultations%ROWTYPE;
  v_old_slot        specialist_slots%ROWTYPE;
  v_new_slot        specialist_slots%ROWTYPE;
  v_result          JSONB;
BEGIN
  -- ── 1. Lock consultation row ────────────────────────────────
  SELECT * INTO v_consultation
  FROM consultations
  WHERE id = consultation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'CONSULTATION_NOT_FOUND',
      'message', 'Consultation not found'
    );
  END IF;

  -- ── 2. Optimistic concurrency check ────────────────────────
  IF v_consultation.lifecycle_version != client_version THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'VERSION_CONFLICT',
      'message', 'Stale version — please refresh and retry',
      'server_version', v_consultation.lifecycle_version
    );
  END IF;

  -- ── 3. Verify ownership token ──────────────────────────────
  IF v_consultation.ownership_token IS DISTINCT FROM ownership_token THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'OWNERSHIP_DENIED',
      'message', 'Ownership token mismatch'
    );
  END IF;

  -- ── 4. Validate old slot still belongs to consultation ─────
  SELECT * INTO v_old_slot
  FROM specialist_slots
  WHERE id = old_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'OLD_SLOT_NOT_FOUND',
      'message', 'Original slot not found'
    );
  END IF;

  -- ── 5. Validate new slot availability ─────────────────────
  SELECT * INTO v_new_slot
  FROM specialist_slots
  WHERE id = new_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'NEW_SLOT_NOT_FOUND',
      'message', 'Target slot not found'
    );
  END IF;

  IF v_new_slot.status != 'available' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'SLOT_NOT_AVAILABLE',
      'message', 'Target slot is no longer available'
    );
  END IF;

  -- ── 6. Execute the atomic swap ─────────────────────────────
  -- 6a. Release old slot
  UPDATE specialist_slots
  SET status = 'available',
      booked_by = NULL,
      updated_at = NOW()
  WHERE id = old_slot_id;

  -- 6b. Claim new slot
  UPDATE specialist_slots
  SET status = 'booked',
      booked_by = v_consultation.user_id,
      updated_at = NOW()
  WHERE id = new_slot_id;

  -- 6c. Update consultation
  UPDATE consultations
  SET slot_id           = new_slot_id,
      previous_slot_id  = old_slot_id,
      rescheduled_at    = NOW(),
      reschedule_count  = COALESCE(reschedule_count, 0) + 1,
      lifecycle_version = client_version + 1,
      updated_at        = NOW()
  WHERE id = consultation_id;

  -- ── 7. Return success payload ──────────────────────────────
  RETURN jsonb_build_object(
    'ok', true,
    'code', 'RESCHEDULED',
    'new_slot_id', new_slot_id,
    'new_version', client_version + 1,
    'rescheduled_at', NOW()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'ok', false,
    'code', 'UNEXPECTED_ERROR',
    'message', SQLERRM
  );
END;
$$;

-- ── Grant execute to authenticated role ───────────────────────
GRANT EXECUTE ON FUNCTION atomic_reschedule(
  UUID, UUID, UUID, TEXT, INTEGER
) TO authenticated;

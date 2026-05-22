-- ============================================================
-- Migration: 012_atomic_reschedule_transaction.sql
-- Sprint:    3.7 — Transactional Integrity Finalization
-- Purpose:   Replace distributed compensation with a single
--            atomic server-side RPC that wraps ALL reschedule
--            mutations in one BEGIN/COMMIT transaction.
--
-- Guarantees:
--   • ALL-OR-NOTHING: any failure rolls back every step.
--   • Stale version rejection before mutation.
--   • Slot availability enforced inside the transaction.
--   • Reschedule limit enforced inside the transaction.
--   • Ownership token validated before mutation.
--   • Returns authoritative updated state to caller.
--
-- Replaces:  distributed compensation in TransactionalReservationRepository
-- Called by: TransactionalReservationRepository.executeReschedule()
-- ============================================================

CREATE OR REPLACE FUNCTION public.atomic_reschedule(
  p_consultation_id  UUID,
  p_old_slot_id      UUID,
  p_new_slot_id      UUID,
  p_ownership_token  TEXT,
  p_client_version   INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consultation         RECORD;
  v_new_slot             RECORD;
  v_old_slot             RECORD;
  v_new_lifecycle_version INTEGER;
  v_max_reschedules      INTEGER := 3;  -- business constant; extract to config table if needed
  v_cooldown_hours       INTEGER := 24;
  v_last_reschedule_at   TIMESTAMPTZ;
BEGIN
  -- ----------------------------------------------------------------
  -- 1. Lock and read consultation row FOR UPDATE to prevent races.
  -- ----------------------------------------------------------------
  SELECT id,
         status,
         slot_id,
         lifecycle_version,
         reschedule_count,
         ownership_token,
         rescheduled_at
  INTO   v_consultation
  FROM   consultations
  WHERE  id = p_consultation_id
  FOR UPDATE;  -- row-level lock held for transaction duration

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'CONSULTATION_NOT_FOUND',
      'error_message', 'Consultation does not exist'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 2. Reject cancelled / inactive consultations.
  -- ----------------------------------------------------------------
  IF v_consultation.status IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'CONSULTATION_NOT_RESCHEDULABLE',
      'error_message', 'Consultation status disallows reschedule: ' || v_consultation.status
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 3. Validate ownership token.
  -- ----------------------------------------------------------------
  IF v_consultation.ownership_token IS DISTINCT FROM p_ownership_token THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'INVALID_OWNERSHIP',
      'error_message', 'Ownership token mismatch — concurrent session detected'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 4. Stale version rejection (DB-authoritative).
  -- ----------------------------------------------------------------
  IF v_consultation.lifecycle_version != p_client_version THEN
    RETURN jsonb_build_object(
      'success',           false,
      'error_code',        'STALE_VERSION',
      'error_message',     'Client version is stale',
      'server_version',    v_consultation.lifecycle_version
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 5. Reschedule limit enforcement.
  -- ----------------------------------------------------------------
  IF v_consultation.reschedule_count >= v_max_reschedules THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'MAX_RESCHEDULES_REACHED',
      'error_message', 'Maximum reschedule count reached'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 6. Cooldown window enforcement.
  -- ----------------------------------------------------------------
  v_last_reschedule_at := v_consultation.rescheduled_at;
  IF v_last_reschedule_at IS NOT NULL
    AND v_last_reschedule_at > (NOW() - (v_cooldown_hours || ' hours')::INTERVAL)
  THEN
    RETURN jsonb_build_object(
      'success',           false,
      'error_code',        'COOLDOWN_ACTIVE',
      'error_message',     'Reschedule cooldown window active',
      'cooldown_expires_at', (v_last_reschedule_at + (v_cooldown_hours || ' hours')::INTERVAL)::TEXT
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 7. Lock and validate new slot availability FOR UPDATE.
  -- ----------------------------------------------------------------
  SELECT id, status, consultation_id
  INTO   v_new_slot
  FROM   slots
  WHERE  id = p_new_slot_id
  FOR UPDATE;  -- prevents concurrent races on same slot

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'SLOT_NOT_FOUND',
      'error_message', 'New slot does not exist'
    );
  END IF;

  IF v_new_slot.status != 'AVAILABLE' THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'SLOT_UNAVAILABLE',
      'error_message', 'New slot is not available: ' || v_new_slot.status
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 8. Lock old slot FOR UPDATE.
  -- ----------------------------------------------------------------
  SELECT id, status
  INTO   v_old_slot
  FROM   slots
  WHERE  id = p_old_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'OLD_SLOT_NOT_FOUND',
      'error_message', 'Old slot does not exist'
    );
  END IF;

  -- ----------------------------------------------------------------
  -- 9. ATOMIC MUTATIONS — all-or-nothing from here.
  --    PostgreSQL rolls back all changes automatically on exception.
  -- ----------------------------------------------------------------

  -- 9a. Reserve new slot.
  UPDATE slots
  SET    status          = 'RESERVED',
         consultation_id = p_consultation_id,
         updated_at      = NOW()
  WHERE  id = p_new_slot_id;

  -- 9b. Release old slot.
  UPDATE slots
  SET    status          = 'AVAILABLE',
         consultation_id = NULL,
         updated_at      = NOW()
  WHERE  id = p_old_slot_id;

  -- 9c. Compute new lifecycle version.
  v_new_lifecycle_version := v_consultation.lifecycle_version + 1;

  -- 9d. Update consultation atomically (slot, version, count, timestamp).
  UPDATE consultations
  SET    slot_id           = p_new_slot_id,
         lifecycle_version = v_new_lifecycle_version,
         reschedule_count  = v_consultation.reschedule_count + 1,
         rescheduled_at    = NOW(),
         updated_at        = NOW()
  WHERE  id = p_consultation_id;

  -- ----------------------------------------------------------------
  -- 10. Return authoritative updated state.
  -- ----------------------------------------------------------------
  RETURN jsonb_build_object(
    'success',               true,
    'consultation_id',       p_consultation_id,
    'new_slot_id',           p_new_slot_id,
    'old_slot_id',           p_old_slot_id,
    'new_lifecycle_version', v_new_lifecycle_version,
    'new_reschedule_count',  v_consultation.reschedule_count + 1,
    'rescheduled_at',        NOW()::TEXT
  );

EXCEPTION
  WHEN OTHERS THEN
    -- PostgreSQL automatically rolls back the transaction on exception.
    -- We surface the error code + message for observability.
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'INTERNAL_ERROR',
      'error_message', SQLERRM,
      'sql_state',     SQLSTATE
    );
END;
$$;

-- Grant execution rights to authenticated role only.
REVOKE ALL ON FUNCTION public.atomic_reschedule(UUID, UUID, UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.atomic_reschedule(UUID, UUID, UUID, TEXT, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.atomic_reschedule IS
  'Sprint 3.7: Atomic all-or-nothing reschedule RPC. '
  'Validates ownership, version, limits, availability inside one transaction. '
  'Replaces distributed compensation in TransactionalReservationRepository.';

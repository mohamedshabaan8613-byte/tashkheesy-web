-- Sprint 3.6 M2 — Reschedule Infrastructure
-- Priority 1: lifecycle_version (Authoritative Version Check)
-- Priority 3: reschedule_count, last_rescheduled_at, max_reschedules (Limits)

-- ========================================
-- Step 1: Add new columns to consultations table
-- ========================================

-- Add lifecycle_version column (Priority 1)
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS lifecycle_version INTEGER DEFAULT 1 NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_consultations_lifecycle_version 
ON consultations(lifecycle_version);

-- Add reschedule tracking columns (Priority 3)
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_rescheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_reschedules INTEGER DEFAULT 3 NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultations_reschedule_count 
ON consultations(reschedule_count);

CREATE INDEX IF NOT EXISTS idx_consultations_last_rescheduled_at 
ON consultations(last_rescheduled_at);

COMMENT ON COLUMN consultations.lifecycle_version IS 'Server authoritative version for optimistic locking and stale write rejection';
COMMENT ON COLUMN consultations.reschedule_count IS 'Number of times this consultation has been rescheduled';
COMMENT ON COLUMN consultations.last_rescheduled_at IS 'Timestamp of last reschedule for cooldown window enforcement';
COMMENT ON COLUMN consultations.max_reschedules IS 'Maximum allowed reschedules for this consultation';

-- ========================================
-- Step 2: RPC Functions
-- ========================================

-- Function 1: Increment lifecycle_version (Priority 1)
-- Used after every mutation to invalidate stale clients
CREATE OR REPLACE FUNCTION increment_lifecycle_version(consultation_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_version INTEGER;
BEGIN
  UPDATE consultations
  SET lifecycle_version = lifecycle_version + 1
  WHERE id = consultation_id
  RETURNING lifecycle_version INTO new_version;
  
  IF new_version IS NULL THEN
    RAISE EXCEPTION 'Consultation not found: %', consultation_id;
  END IF;
  
  RETURN new_version;
END;
$$;

COMMENT ON FUNCTION increment_lifecycle_version IS 'Increment lifecycle_version after mutation for stale write rejection (Priority 1)';

-- Function 2: Increment reschedule_count (Priority 3)
-- Used after successful reschedule to track limits
CREATE OR REPLACE FUNCTION increment_reschedule_count(consultation_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE consultations
  SET 
    reschedule_count = reschedule_count + 1,
    last_rescheduled_at = NOW()
  WHERE id = consultation_id
  RETURNING reschedule_count INTO new_count;
  
  IF new_count IS NULL THEN
    RAISE EXCEPTION 'Consultation not found: %', consultation_id;
  END IF;
  
  RETURN new_count;
END;
$$;

COMMENT ON FUNCTION increment_reschedule_count IS 'Increment reschedule_count and update last_rescheduled_at (Priority 3)';

-- Function 3: Check reschedule limits (Priority 3)
-- Returns TRUE if reschedule is allowed, FALSE otherwise
CREATE OR REPLACE FUNCTION can_reschedule(
  consultation_id UUID,
  cooldown_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
  allowed BOOLEAN,
  reason TEXT,
  remaining_reschedules INTEGER,
  cooldown_ends_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consultation consultations%ROWTYPE;
  v_cooldown_end TIMESTAMPTZ;
BEGIN
  -- Fetch consultation
  SELECT * INTO v_consultation
  FROM consultations
  WHERE id = consultation_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'CONSULTATION_NOT_FOUND'::TEXT, 0, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check 1: Max reschedules reached?
  IF v_consultation.reschedule_count >= v_consultation.max_reschedules THEN
    RETURN QUERY SELECT 
      FALSE, 
      'MAX_RESCHEDULES_REACHED'::TEXT, 
      0, 
      NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Check 2: Cooldown window active?
  IF v_consultation.last_rescheduled_at IS NOT NULL THEN
    v_cooldown_end := v_consultation.last_rescheduled_at + (cooldown_hours || ' hours')::INTERVAL;
    
    IF NOW() < v_cooldown_end THEN
      RETURN QUERY SELECT 
        FALSE, 
        'COOLDOWN_ACTIVE'::TEXT, 
        v_consultation.max_reschedules - v_consultation.reschedule_count,
        v_cooldown_end;
      RETURN;
    END IF;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    TRUE, 
    'ALLOWED'::TEXT, 
    v_consultation.max_reschedules - v_consultation.reschedule_count - 1,
    NULL::TIMESTAMPTZ;
END;
$$;

COMMENT ON FUNCTION can_reschedule IS 'Check if reschedule is allowed based on limits and cooldown (Priority 3)';

-- ========================================
-- Step 3: Realtime publication (Priority 4)
-- ========================================

-- Enable realtime for consultations table
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;

COMMENT ON PUBLICATION supabase_realtime IS 'Realtime publication for multi-tab sync and authoritative invalidation (Priority 4)';

-- ========================================
-- Step 4: Row Level Security (RLS) Updates
-- ========================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION increment_lifecycle_version(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_reschedule_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_reschedule(UUID, INTEGER) TO authenticated;

-- ========================================
-- Step 5: Backfill existing consultations
-- ========================================

-- Set default lifecycle_version for existing consultations
UPDATE consultations
SET lifecycle_version = 1
WHERE lifecycle_version IS NULL;

-- Set default reschedule_count for existing consultations
UPDATE consultations
SET reschedule_count = 0
WHERE reschedule_count IS NULL;

-- Set default max_reschedules for existing consultations
UPDATE consultations
SET max_reschedules = 3
WHERE max_reschedules IS NULL;

-- ========================================
-- Verification Queries
-- ========================================

-- Verify columns exist
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'consultations'
  AND column_name IN (
    'lifecycle_version', 
    'reschedule_count', 
    'last_rescheduled_at', 
    'max_reschedules'
  )
ORDER BY column_name;

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'increment_lifecycle_version',
  'increment_reschedule_count',
  'can_reschedule'
)
ORDER BY routine_name;

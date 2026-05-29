-- 009_child_funnel_booking_columns.sql
-- Sprint 2.2 — Step 7b
-- Child funnel + booking analytics support

ALTER TABLE public.screening_analytics
  ADD COLUMN IF NOT EXISTS booked_service_id TEXT,
  ADD COLUMN IF NOT EXISTS booked_specialist_id UUID,
  ADD COLUMN IF NOT EXISTS booked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS child_id UUID;

CREATE INDEX IF NOT EXISTS screening_analytics_booked_service_id_idx
  ON public.screening_analytics (booked_service_id);

CREATE INDEX IF NOT EXISTS screening_analytics_booked_specialist_id_idx
  ON public.screening_analytics (booked_specialist_id);

CREATE INDEX IF NOT EXISTS screening_analytics_booked_at_idx
  ON public.screening_analytics (booked_at);

CREATE INDEX IF NOT EXISTS screening_analytics_child_id_idx
  ON public.screening_analytics (child_id);

ALTER TABLE public.screening_analytics
  DROP CONSTRAINT IF EXISTS screening_analytics_abandoned_at_step_check;

ALTER TABLE public.screening_analytics
  ADD CONSTRAINT screening_analytics_abandoned_at_step_check
  CHECK (
    abandoned_at_step IS NULL OR
    abandoned_at_step IN (
      'self_assessment_form',
      'screening_intro',
      'screening_questions',
      'choose_child_path',
      'child_assessment_form'
    )
  );

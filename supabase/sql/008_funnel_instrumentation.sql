-- =============================================================================
-- Migration: 008_funnel_instrumentation.sql
-- Sprint 2.2 — Step 7a: Funnel Instrumentation Columns
-- =============================================================================
-- متى تُشغّل: قبل أي اختبار فعلي لـ funnel tracking.
-- تصميم: idempotent — آمن للتشغيل أكثر من مرة.
-- الجدول: public.screening_analytics (موجود مسبقاً)
-- =============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. أعمدة Funnel State (form tracking)
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.screening_analytics
  ADD COLUMN IF NOT EXISTS form_started_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS form_submitted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_to_submit_secs INT,
  ADD COLUMN IF NOT EXISTS hesitation_count   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS device_type        TEXT,      -- 'mobile' | 'tablet' | 'desktop'
  ADD COLUMN IF NOT EXISTS abandoned          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS abandoned_at_step  TEXT,      -- 'self_assessment_form' | ...
  ADD COLUMN IF NOT EXISTS history_viewed     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. ضمان صحة البيانات: CHECK constraints
-- ────────────────────────────────────────────────────────────────────────────

-- منع قيم device_type غير صالحة (إذا لم يكن الـ constraint موجوداً)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'screening_analytics'
      AND constraint_name = 'screening_analytics_device_type_check'
  ) THEN
    ALTER TABLE public.screening_analytics
      ADD CONSTRAINT screening_analytics_device_type_check
      CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop'));
  END IF;
END;
$$;

-- منع abandoned_at_step غير صالحة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'screening_analytics'
      AND constraint_name = 'screening_analytics_abandoned_at_step_check'
  ) THEN
    ALTER TABLE public.screening_analytics
      ADD CONSTRAINT screening_analytics_abandoned_at_step_check
      CHECK (
        abandoned_at_step IS NULL OR
        abandoned_at_step IN (
          'self_assessment_form',
          'screening_intro',
          'screening_questions'
        )
      );
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Indexes (performance)
-- ────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_screening_analytics_abandoned
  ON public.screening_analytics (user_id, abandoned)
  WHERE abandoned = TRUE;

CREATE INDEX IF NOT EXISTS idx_screening_analytics_form_started_at
  ON public.screening_analytics (form_started_at)
  WHERE form_started_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_screening_analytics_device_type
  ON public.screening_analytics (device_type)
  WHERE device_type IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. RLS — التحقق من سماحات UPDATE على الأعمدة الجديدة
-- ────────────────────────────────────────────────────────────────────────────
-- ملاحظة: إذا كانت policy الحالية هي:
--   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
-- فهي تغطي الأعمدة الجديدة تلقائياً — لا تغيير مطلوب.
--
-- إذا كانت policy محددة بأسماء أعمدة محددة، شغّل الاستعلام التالي:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'screening_analytics' ORDER BY ordinal_position;
--
-- تحقّق: هل هناك policies على الجدول؟
SELECT schemaname, tablename, policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'screening_analytics';

-- نتيجة الميجريشن: جميع الأعمدة موجودة والايندكس جاهزة.
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'screening_analytics'
ORDER BY ordinal_position;

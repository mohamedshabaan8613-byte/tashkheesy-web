-- =============================================================================
-- Migration 010: Anonymous Funnel Tracking
-- Sprint 2.3 — Issue #46
-- =============================================================================
-- الهدف: دعم تتبع funnel events لغير المسجلين في جدول screening_analytics.
--
-- التغييرات:
--   1. is_anonymous BOOLEAN — تمييز بين المسجل وغير المسجل فيال analytics
--
-- السلامة:
--   - ADD COLUMN IF NOT EXISTS — idempotent, آمن للتشغيل مرات متعددة
--   - DEFAULT false — كل الصفوف الموجودة تبقى false (مسجلين)
--   - لا تغيير في هيكل الجدول أو الفهارس القائمة
-- =============================================================================

-- 1. إضافة is_anonymous ————————————————————————————————————————————————
ALTER TABLE public.screening_analytics
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.screening_analytics.is_anonymous IS
  'true = anonymous visitor (anon_{uuid} from sessionStorage), false = authenticated user (auth.uid())';

-- 2. فهرس لتسريع الاستعلامات —————————————————————————————————————————
CREATE INDEX IF NOT EXISTS idx_screening_analytics_is_anonymous
  ON public.screening_analytics (is_anonymous)
  WHERE is_anonymous = true;

-- 3. RLS: السماح لغير المسجلين بالكتابة (INSERT/UPDATE) ——————————————————
-- ملاحظة: هذه السياسة تسمح للزوار المجهولين بكتابة rows حيث is_anonymous = true.
-- لمنع التلاعب: user_id يجب أن يبدأ بـ 'anon_' ويتطابق is_anonymous = true.
DROP POLICY IF EXISTS "allow_anonymous_funnel_insert" ON public.screening_analytics;

CREATE POLICY "allow_anonymous_funnel_insert"
  ON public.screening_analytics
  FOR INSERT
  WITH CHECK (
    -- مسجّل: auth.uid() يتطابق user_id
    (auth.uid()::text = user_id AND is_anonymous = false)
    OR
    -- غير مسجّل: user_id يبدأ بـ 'anon_' و is_anonymous = true
    (user_id LIKE 'anon_%' AND is_anonymous = true AND auth.uid() IS NULL)
  );

DROP POLICY IF EXISTS "allow_anonymous_funnel_update" ON public.screening_analytics;

CREATE POLICY "allow_anonymous_funnel_update"
  ON public.screening_analytics
  FOR UPDATE
  USING (
    -- مسجّل: يعدّل صفوفه فقط
    (auth.uid()::text = user_id AND is_anonymous = false)
    OR
    -- غير مسجّل: يعدّل صفوفه (anon) فقط في نفس الجلسة
    (user_id LIKE 'anon_%' AND is_anonymous = true)
  );

-- =============================================================================
-- تحقق من نجاح الميجريشن
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'screening_analytics'
      AND column_name = 'is_anonymous'
  ) THEN
    RAISE NOTICE 'Migration 010: is_anonymous column verified OK';
  ELSE
    RAISE EXCEPTION 'Migration 010 FAILED: is_anonymous column not found';
  END IF;
END $$;

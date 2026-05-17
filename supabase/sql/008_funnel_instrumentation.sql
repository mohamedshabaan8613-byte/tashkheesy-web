-- ─────────────────────────────────────────────────────────────────────────────────
-- Migration 008: Funnel Instrumentation
-- Sprint 2.2 — Step 7a
--
-- الهدف:
--   إضافة columns لقياس سلوك المستخدم كامل الفنل (ليس فقط عند الإتمام)
--
-- الفنل الكامل بعد هذه الميجراشن:
--   form_started_at
--     ↓ form_submitted_at  [الفرق = time_to_submit_secs]
--     ↓ completed_at      [الفحص انتهى وظهرت النتيجة]
--     ↓ booked_after_result [حجز بعد النتيجة]
--   OR:
--   form_started_at → abandoned = true [غادر مبكراً]
--
-- الأمان:
--   • كل الـ columns جديدة nullable — لا تأثير على الـ rows الحالية
--   • كل تعديل idempotent (يمكن تشغيله أكثر من مرة)
--   • لا تغيير على الـ RLS policies أو الـ unique constraints
-- ─────────────────────────────────────────────────────────────────────────────────

-- ─── 1. إضافة Funnel Timing Columns ─────────────────────────────────────────

-- وقت أول interaction بالفورم (name focus أو age focus)
alter table public.screening_analytics
  add column if not exists form_started_at timestamptz null;

comment on column public.screening_analytics.form_started_at
  is 'Timestamp of first user interaction with the form (name or age field focus). NULL = form never interacted with.';

-- وقت submit الفورم (قبل بدء الفحص)
alter table public.screening_analytics
  add column if not exists form_submitted_at timestamptz null;

comment on column public.screening_analytics.form_submitted_at
  is 'Timestamp of form submission (after validation, before screening questions). NULL = form never submitted.';

-- المدة بالثواني من أول interaction حتى submit (مؤشر التردد)
alter table public.screening_analytics
  add column if not exists time_to_submit_secs integer null;

comment on column public.screening_analytics.time_to_submit_secs
  is 'Seconds between form_started_at and form_submitted_at. High values indicate hesitation or confusion.';

-- ─── 2. إضافة Behavioral Signal Columns ──────────────────────────────────────

-- عدد مرات تعديل الحقل بعد أول blur (مؤشر عدم الثقة)
alter table public.screening_analytics
  add column if not exists hesitation_count integer null;

comment on column public.screening_analytics.hesitation_count
  is 'Number of field re-edits after first blur. Repeated edits of same field = anxiety or confusion.';

-- هل غادر بعد بدء التفاعل بدون إتمام
alter table public.screening_analytics
  add column if not exists abandoned boolean null;

comment on column public.screening_analytics.abandoned
  is 'True if user interacted with form but left without submitting. NULL = no interaction at all.';

-- من أي خطوة غادر (self_assessment_form | screening_intro | screening_questions)
alter table public.screening_analytics
  add column if not exists abandoned_at_step text null;

comment on column public.screening_analytics.abandoned_at_step
  is 'Step name where user abandoned. Values: self_assessment_form | screening_intro | screening_questions.';

-- ─── 3. إضافة UX Engagement Columns ───────────────────────────────────────────

-- هل فتح سجل التقييمات السابقة (AssessmentHistory)
alter table public.screening_analytics
  add column if not exists history_viewed boolean null;

comment on column public.screening_analytics.history_viewed
  is 'True if user expanded the history panel before starting a new assessment.';

-- نوع الجهاز (mobile / tablet / desktop)
alter table public.screening_analytics
  add column if not exists device_type text null;

comment on column public.screening_analytics.device_type
  is 'Device category at form start. Values: mobile | tablet | desktop. Based on window.innerWidth.';

-- ─── 4. Indexes للـ columns الأكثر استخداماً في التحليل ─────────────────────────

-- مهم للفلترة على الجلسات التي غادرت فقط
create index if not exists idx_screening_analytics_abandoned
  on public.screening_analytics (abandoned)
  where abandoned = true;

-- مهم لتحليل الموبايل drop-off
create index if not exists idx_screening_analytics_device_type
  on public.screening_analytics (device_type);

-- مهم لفلترة تسلسل الفنل زمنياً
create index if not exists idx_screening_analytics_form_started_at
  on public.screening_analytics (form_started_at);

-- ─── 5. Admin RLS policies للـ columns الجديدة ─────────────────────────────────
-- ملاحظة: الـ RLS policies الحالية تغطي جميع الـ columns تلقائياً.
-- لا حاجة لتعديلها — القاعدة: auth.uid() = user_id تطبق على كل الـ columns.
-- Admin select متاح عبر migration 007 ولا يحتاج تحديثاً.

-- ─── 6. ملخص الفنل بعد هذه الميجراشن ─────────────────────────────────────

-- السؤال الذي يجيب عليه كل column:
--
--   form_started_at ──────── كم شخص بدأ التفاعل مع الفورم?
--   form_submitted_at ────── كم أكمل الفورم ونتقل للفحص?
--   completed_at ────────── كم أكمل الفحص كاملاً?
--   booked_after_result ──── كم حجز بعد النتيجة?
--   abandoned = true ────── كم غادر بعد البداية?
--   time_to_submit_secs ──── كم الوقت المتوسط للتقرير (hesitation indicator)?
--   hesitation_count ────── ما متوسط عدد التعديلات قبل الإرسال?
--   device_type = 'mobile' ─ معدل الإتمام على الموبايل مقابل الديسكتوب?
--   history_viewed ──────── هل الذين يفتحون التاريخ يكملون أكثر?

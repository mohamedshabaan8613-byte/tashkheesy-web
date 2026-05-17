# Analytics Architecture — تشخيصي

**آخر تحديث:** Sprint 2.2 — Step 7a  
**القرار المعماري:** Option C (Single Table — Enriched Row)

---

## الوضع الحالي: Option C

نستخدم جدول `public.screening_analytics` الموجود مسبقاً (Sprint 4)  
ونُضيف إليه أعمدة funnel tracking عبر migration `008_funnel_instrumentation.sql`.

### لماذا Option C وليس Option B؟

| المعيار | Option B (Funnel Events Table) | Option C (Enriched Row) |
|---|---|---|  
| تعقيد الـ schema | يحتاج جدول جديد + FK | لا تغيير في الـ schema الأساسي |
| سرعة التنفيذ | أبطأ (migration + joins) | أسرع (ALTER TABLE فقط) |
| Supabase calls | 1 per event × N events | 1 upsert per session |
| مناسبة للـ MVP | ❌ over-engineered | ✅ مثالي |
| قابلية الـ migration لاحقاً | — | ✅ سهل |

**القرار:** Option C مناسب حتى 10k مستخدم/شهر. بعدها نُهاجر.

---

## بنية الجدول بعد Migration 008

```sql
public.screening_analytics
├── [Sprint 4 columns]          -- النتائج + الحجز
│   ├── session_id (UNIQUE)     -- المفتاح الموحد
│   ├── user_id
│   ├── path_type
│   ├── score / risk_level
│   └── booked_after_result
│
└── [Step 7a columns]           -- Funnel tracking
    ├── form_started_at          -- أول interaction
    ├── form_submitted_at        -- نجاح submit
    ├── time_to_submit_secs      -- وقت إتمام الفورم
    ├── hesitation_count         -- عدد مرات التردد
    ├── device_type              -- mobile | tablet | desktop
    ├── abandoned                -- غادر بدون إتمام؟
    ├── abandoned_at_step        -- أين غادر؟
    ├── history_viewed           -- فتح سجل التقييمات؟
    └── updated_at               -- آخر تحديث
```

---

## FIX 1: sessionId Lifecycle

```
[Mount]  FunnelSession("pending-xxx", pathType)
           ↓ trackFunnelStart()   → row: session_id = "pending-xxx"

[Submit] attachRealSessionId(selfId)
           ↓ trackFunnelSubmit()  → upsert: session_id = selfId
           ↓ navigate(introUrl)

[Result] upsertScreeningResultAnalytics(selfId) → merge into same row
```

**المشكلة السابقة:** كان `session_id = pending-xxx` يُكتب في Supabase ويظل مختلفاً عن `selfId`.  
**الحل:** `attachRealSessionId()` تُحدّث `_sessionId` قبل أي tracking call بعد validation.

---

## FIX 2: Abandonment Reliability

نستخدم استراتيجية مزدوجة:

| Event | المتصفح المستهدف |
|---|---|
| `beforeunload` | Chrome/Firefox Desktop |
| `visibilitychange (hidden)` | Safari iOS + Android Chrome |

كلاهما يستدعيان `fireAbandonment()` المحمية بـ `abandonedRef.sent` guard  
لمنع إرسال طلبين لـ Supabase.

---

## FIX 3: upsert vs update في trackFunnelSubmit

**المشكلة:** إذا فشل `trackFunnelStart` (مستخدم سريع، auth تأخر، focus لم يُطلق)  
كان `update().eq(session_id)` يُنفَّذ على row غير موجود → silent miss.

**الحل:** استخدام `upsert` بدل `update` في `trackFunnelSubmit`.  
بهذا حتى لو لم يُسجَّل start، يُنشأ الـ row عند submit.

---

## القيود الحالية (المعروفة والمقبولة)

### 1. Authenticated-only tracking

كل tracking يعتمد على `auth.uid()`.  
المستخدم غير المسجل = لا funnel data.  
هذا يعني أن drop-offs قبل التسجيل غير مرئية.

**الحل المستقبلي:** `anonymous_session_id` (cookie/localStorage)  
**الأولوية:** بعد الـ MVP.

### 2. hesitation_count بناء على blur

`blur` طبيعي جداً — المستخدم قد ينتقل بين الحقول طبيعياً.  
الـ hesitation الحقيقي = `blur + re-edit` أو `focus duration > X secs`.

**الحل المستقبلي:** قياس focus duration  
**الأولوية:** تحسين مستقبلي.

### 3. screening_analytics overloaded

الجدول يحمل الآن: result analytics + booking + funnel state + behavioral signals.  
هذا مقبول في الـ MVP. عند التوسع:

**Target migration:**
```sql
public.funnel_events (
  id, session_id, event_type, event_data JSONB,
  user_id, created_at
)
```

---

## متى نُهاجر إلى Option B؟

- عند الحاجة لتحليل events متعددة per session
- عند وصول المستخدمين لـ 10k+/شهر
- عند إضافة anonymous tracking
- عند الحاجة لـ real-time funnel dashboard

---

*هذا الملف يُحدَّث مع كل migration تمس analytics architecture.*

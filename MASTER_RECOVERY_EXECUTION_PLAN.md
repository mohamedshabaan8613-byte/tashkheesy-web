# Master Architectural Recovery Execution Plan
## Tashkheesy | تشخيصي — Sprint 3.7.1 Recovery Program

**التاريخ:** 2026-05-29  
**النطاق:** قراءة وتخطيط فقط — لا تعديل، لا PR، لا merge، لا deploy  
**المنهجية:** تحليل معماري مباشر من الكود + تتبع import graph + TypeScript error analysis  
**إجمالي TypeScript Errors:** 76 error في 21 ملفاً

---

## Executive Summary

المشروع يمتلك **تصميماً معمارياً سليماً** — الفصل بين `ConsultationIntent` (context) و`ConsultationFlowPhase` (runtime navigation) و`BookingPhase` (persistence state) هو قرار صحيح ومدروس. المشكلة ليست في التصميم بل في **تسارع التنفيذ عبر Sprints 3.0–3.7** الذي أفرز سبع فجوات تنفيذية:

الفجوة الأولى هي **Dual Repository Authority** — ملفان يتنافسان على ownership الجلسة بمفاتيح sessionStorage مختلفة. الفجوة الثانية هي **Unmerged Compatibility Layer** — `consultationBookingTypesPatch.ts` كُتب فيه صراحةً أنه يُدمج في Sprint 3.6 لكن الدمج لم يحدث. الفجوة الثالثة هي **Orchestrator API Drift** — `RescheduleOrchestrator` غيّر API من function إلى class لكن المستهلكين لا يزالون يطلبون الـ function القديمة. الفجوة الرابعة هي **Router Migration Incomplete** — أربعة ملفات لا تزال تستورد من `react-router-dom` في مشروع يستخدم `wouter`. الفجوة الخامسة هي **Silent Data Loss** في `updateRemoteChild`. الفجوة السادسة هي **Runtime Safety Layer Disconnected** — `runtimeSafety.ts` موجود لكن `intentId` غير معرَّف في `ConsultationIntent` مما يجعل فحص الـ mismatch معطلاً. الفجوة السابعة هي **Type Contract Drift** — `ConsultationIntent` و`AssessmentResultPayload` لا تحتويان على الحقول التي تطلبها `ScreeningResult.tsx`.

---

## Section 1 — Architectural Root Cause Analysis

### ما الذي فشل معمارياً؟

المشروع يتبع نمط **Layered Domain Architecture** صحيح:

```
UI Layer         → Pages + Components
Orchestration    → CancellationOrchestrator + RescheduleOrchestrator
Context Layer    → ConsultationBookingContext + ConsultationContext
Repository Layer → repositories/ConsultationBookingRepository (singleton)
Type Layer       → consultationBookingTypes + consultationTypes
```

الفشل لم يكن في هذا النمط — بل في **migration sequencing**: كل Sprint أضاف طبقة جديدة دون إكمال دمج الطبقة السابقة.

### لماذا زعزعت الهجرة الاستقرار؟

**Sprint 3.0–3.1:** أُنشئت `consultationTypes.ts` و`consultationBookingTypes.ts` كـ contracts أساسية. ✅ سليم.

**Sprint 3.3:** أُضيف `consultationStateMachine.ts` و`consultationHydration.ts` و`consultationRoutes.ts`. ✅ سليم — لكن `CONFIRMED` route لم تُضَف إلى `CONSULTATION_ROUTES`.

**Sprint 3.5:** أُنشئ `consultationBookingTypesPatch.ts` كـ compatibility layer مؤقت لـ cancellation/reschedule. ✅ القرار صحيح — لكن الدمج المخطط في Sprint 3.6 لم يحدث. ❌

**Sprint 3.5 Phase 1B:** `RescheduleOrchestrator` أُعيد كتابته من function إلى class بـ `execute()` method — لكن `useRescheduleBooking` و`RescheduleBookingModal` كُتبا لـ API القديم (function `orchestrateReschedule`). ❌ **Migration abandoned mid-flight.**

**Sprint 3.6:** `repositories/ConsultationBookingRepository.ts` (singleton) أحلّ محل `lib/consultationBookingRepository.ts` — لكن الملف القديم لم يُحذف. ❌ **Dual authority.**

**Sprint 3.7:** إضافة `SlotSelectionPage` و`SpecialistSelectionPage` بـ `react-router-dom` imports في مشروع `wouter`. ❌ **Router contract violation.**

### أين انهارت حدود الـ Ownership؟

**Repository Ownership:** انهارت عند Sprint 3.6 — ملفان يكتبان على sessionStorage بمفاتيح مختلفة (`"tashkheesy_booking_session_v1"` vs `"tashkheesy:cbs:{sessionId}"`). الـ singleton الجديد هو المصدر الحقيقي لكن الملف القديم يحتوي على 10 errors ويشير لـ types غير موجودة.

**Orchestrator Contract Ownership:** انهارت عند Sprint 3.5 Phase 1B — `RescheduleOrchestrator.execute()` هو الـ API الجديد لكن المستهلكون يطلبون `orchestrateReschedule()` (function). لا يوجد compatibility bridge.

**Type Contract Ownership:** انهارت عند Sprint 3.5 — `CANCELLABLE_PHASES` موجودة في `typesPatch` لكن `CancellationOrchestrator` يستوردها من `consultationBookingTypes` (الملف الأصلي).

### هل المشكلة منهجية أم معزولة؟

المشكلة **منهجية في المنشأ** لكن **معزولة في التأثير**. كل الفجوات تعود لنمط واحد: **Sprint يبدأ migration ولا يُكملها قبل بدء Sprint التالي**. لكن التأثير معزول في طبقات محددة — الـ UI الأساسي (Home, Services, Booking flow القديم) يعمل بشكل مستقل.

---

## Section 2 — Canonical Runtime Authority Map

### Booking Session

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Storage | `repositories/ConsultationBookingRepository` (singleton) | `lib/consultationBookingRepository` (dead) | **`repositories/ConsultationBookingRepository`** |
| Context | `ConsultationBookingContext` | — | **`ConsultationBookingContext`** |
| Persistence | Supabase (عبر `CancellationOrchestrator`) | sessionStorage | **Supabase = source of truth, sessionStorage = cache** |

**الهجرة المطلوبة:** حذف `lib/consultationBookingRepository.ts` أو تحويله لـ re-export صامت.

### Consultation Intent

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Storage | `ConsultationContext` (sessionStorage) | — | **`ConsultationContext`** |
| Type | `consultationTypes.ts` | — | **`consultationTypes.ts`** |
| Lifecycle | `useConsultationFlow` | `useNavigationRecovery` | **`useConsultationFlow`** |

**الهجرة المطلوبة:** إضافة `intentId`, `assessmentSessionId`, `specialistRecommendation` كـ optional fields في `ConsultationIntent`.

### Navigation State

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Router | `wouter` | `react-router-dom` (4 ملفات) | **`wouter`** |
| Phase | `useConsultationFlow` | `useNavigationRecovery` | **`useConsultationFlow`** |
| Routes | `CONSULTATION_ROUTES` | hardcoded strings | **`CONSULTATION_ROUTES`** |

**الهجرة المطلوبة:** استبدال `react-router-dom` بـ `wouter` في 4 ملفات + إضافة `CONFIRMED` route.

### Persistence State (BookingPhase)

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Core phases | `consultationBookingTypes.ts` | `consultationBookingTypesPatch.ts` | **`consultationBookingTypes.ts` (بعد الدمج)** |
| Extended phases | `consultationBookingTypesPatch.ts` (CANCELLING, RESCHEDULING) | — | **يُدمج في `consultationBookingTypes.ts`** |
| Transitions | `ALLOWED_TRANSITIONS` | `EXPANDED_TRANSITIONS_V2` | **`EXPANDED_TRANSITIONS_V2` (بعد الدمج)** |

**الهجرة المطلوبة:** دمج `typesPatch` في `consultationBookingTypes.ts`.

### Orchestration State

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Reschedule | `RescheduleOrchestrator.execute()` | `orchestrateReschedule()` (مطلوبة لكن غير موجودة) | **`RescheduleOrchestrator.execute()` + wrapper function** |
| Cancellation | `CancellationOrchestrator.orchestrateCancellation()` | — | **`CancellationOrchestrator`** |
| Phase validation | `consultationBookingTypesPatch.ts` (predicates) | — | **يُنقل لـ `consultationBookingTypes.ts`** |

### Recovery State

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Session recovery | `repositories/ConsultationBookingRepository` | `consultationHydration.ts` | **`repositories/ConsultationBookingRepository`** |
| Safety validation | `runtimeSafety.ts` (disconnected) | — | **`runtimeSafety.ts` (بعد ربطه)** |

### Analytics State

| الجانب | المالك الحالي | المنافس | المالك الكانوني |
|---|---|---|---|
| Funnel session | `screeningAnalytics.ts` | — | **`screeningAnalytics.ts`** |
| Field blur | غير موجود (`onFieldBlur` مطلوبة لكن غير معرَّفة) | — | **يُضاف لـ `FunnelSession`** |

---

## Section 3 — Dependency Graph

### الرسم البياني للتبعيات

```
consultationBookingTypes.ts ──────────────────────────────────────────┐
    ↑                                                                   │
    │ (imports)                                                         │
consultationBookingTypesPatch.ts                                        │
    ↑                                                                   │
    │ (imports CANCELLABLE_PHASES من الأصل — MISSING)                  │
CancellationOrchestrator.ts ←─────────────────────────────────────────┘
    ↑
    │ (imports)
useConsultationBooking (via ConsultationBookingContext)

consultationTypes.ts ─────────────────────────────────────────────────┐
    ↑                                                                   │
    │ (imports intentId — MISSING)                                      │
runtimeSafety.ts                                                        │
ScreeningResult.tsx (pages/)                                            │
    ↑                                                                   │
    │ (imports react-router-dom — WRONG ROUTER)                         │
    └─────────────────────────────────────────────────────────────────┘

RescheduleOrchestrator.ts (exports: class + execute())
    ↑
    │ (expects: orchestrateReschedule function — MISSING)
useRescheduleBooking.ts ──────────────────────────────────────────────┐
    ↑                                                                   │
    │ (expects: isReschedulablePhase, getReschedulePolicyMessage)        │
RescheduleBookingModal.tsx ───────────────────────────────────────────┘

repositories/ConsultationBookingRepository.ts (ACTIVE — singleton)
lib/consultationBookingRepository.ts (DEAD — 10 errors — wrong storage key)
    ↑
    │ (no consumer — zero imports from outside)
    └─ SAFE TO DELETE
```

### الأنظمة التي تحجب غيرها

**`consultationBookingTypes.ts` يحجب:**
- `CancellationOrchestrator` (يحتاج `CANCELLABLE_PHASES`)
- `lib/consultationBookingRepository` (يحتاج `BOOKING_RECOVERABLE_PHASES`, `BookingInterruptionReason`)
- `consultationBookingTypesPatch.ts` (يستورد منه)

**`RescheduleOrchestrator` API يحجب:**
- `useRescheduleBooking` (يحتاج `orchestrateReschedule` function)
- `RescheduleBookingModal` (يحتاج `isReschedulablePhase`, `getReschedulePolicyMessage`)

**`react-router-dom` يحجب:**
- `pages/ScreeningResult.tsx` (9 errors)
- `pages/consultation/SlotSelectionPage.tsx` (8 errors)
- `pages/consultation/SpecialistSelectionPage.tsx` (8 errors)
- `utils/bookingOwnership.ts` (1 error)

### التبعيات الدائرية الخطيرة

**لا توجد تبعيات دائرية حقيقية** — هذا مؤشر إيجابي على سلامة التصميم الأصلي. لكن يوجد **coupling خفي**:

`CancellationOrchestrator` يستورد `createClient` من `@supabase/supabase-js` مباشرةً — هذا يعني أنه يُنشئ Supabase client جديد في كل استدعاء بدلاً من استخدام الـ singleton الموجود في `supabaseClient.ts`. هذا ليس خطأً TypeScript لكنه **runtime coupling** يمكن أن يُسبب مشاكل في session management.

### سلاسل الهجرة غير المستقرة

```
CHAIN 1 (Type Foundation):
  typesPatch → consultationBookingTypes → CancellationOrchestrator → ConsultationBookingContext
  
  الخطر: دمج typesPatch قد يُغيّر ALLOWED_TRANSITIONS مما يؤثر على كل isValidTransition() calls.
  الحل: الدمج additive فقط — لا حذف من ALLOWED_TRANSITIONS.

CHAIN 2 (Orchestrator API):
  RescheduleOrchestrator → useRescheduleBooking → ConsultationBookingContext → UI
  
  الخطر: إضافة wrapper function قد تُخفي مشاكل في الـ deps injection.
  الحل: wrapper يستخدم RescheduleOrchestrator.execute() مع deps من Context.

CHAIN 3 (Router):
  wouter → App.tsx → Pages → navigate()
  
  الخطر: استبدال useNavigate بـ useLocation قد يُغيّر behavior الـ history.
  الحل: wouter's setLocation مكافئ لـ react-router's navigate() في السلوك الأساسي.
```

---

## Section 4 — Safe Recovery Order

### الترتيب الوحيد الآمن للتنفيذ

الترتيب مبني على **runtime stability** وليس عدد الـ errors:

---

**Phase R0 — Freeze & Verify (لا كود)**

قبل أي تعديل، يجب التحقق من:
- `lib/consultationBookingRepository.ts` لا يُستورد من أي مكان (✅ مؤكد — صفر imports)
- `consultationBookingTypesPatch.ts` يُستورد فقط من `consultationBookingRepository.ts` (القديم) — ليس من Context أو Orchestrators
- `wouter` مثبَّت في `package.json` (✅ مؤكد)
- `react-router-dom` غير مثبَّت (✅ مؤكد — لذا الـ errors)

**لماذا يأتي أولاً:** يضمن أن الـ freeze assumptions صحيحة قبل أي تعديل.

---

**Phase R1 — Silent Bug Containment (الأولوية: حرجة وظيفياً)**

**لماذا يأتي قبل Type fixes:**
- `updateRemoteChild` bug هو **data loss في production** — كل تحديث طفل يفشل صامتاً
- لا يعتمد على أي type fix آخر
- التغيير محدود: إضافة `remoteId?: string` لـ `Child` interface في `ChildrenPage.tsx`
- rollback آمن: إذا فشل، السلوك يعود للحالة السابقة (silent failure — لا crash)

**ما يصبح آمناً بعده:** Supabase sync لبيانات الأطفال يعمل بشكل صحيح.

**ما يبقى خطيراً:** لا شيء — هذا الـ fix معزول تماماً.

---

**Phase R2 — Type Foundation Consolidation**

**لماذا يأتي ثانياً:**
- `CancellationOrchestrator` لا يمكنه العمل بدون `CANCELLABLE_PHASES`
- `lib/consultationBookingRepository.ts` لا يمكنه compile بدون `BOOKING_RECOVERABLE_PHASES`
- كل الـ Orchestrators تعتمد على هذا الـ fix

**الترتيب الداخلي:**
1. دمج `typesPatch` في `consultationBookingTypes.ts` (additive فقط)
2. إضافة aliases (`BOOKING_RECOVERABLE_PHASES`, `BookingInterruptionReason`)
3. حذف `consultationBookingTypesPatch.ts` (بعد التحقق من صفر imports)

**ما يصبح آمناً بعده:** `CancellationOrchestrator` يمكنه compile. `lib/consultationBookingRepository` يمكنه compile.

**ما يبقى خطيراً:** `lib/consultationBookingRepository` لا يزال يستخدم storage key خاطئ — لا يُستدعى لكن يجب حذفه في Phase R4.

---

**Phase R3 — ConsultationIntent Contract Expansion**

**لماذا يأتي ثالثاً:**
- يعتمد على Phase R2 (لا — مستقل فعلاً)
- لكن يجب أن يأتي قبل Router fix لأن `ScreeningResult.tsx` يحتاج كليهما

**التغييرات:**
- إضافة `intentId?: string` لـ `ConsultationIntent`
- إضافة `assessmentSessionId?: string` لـ `ConsultationIntent`
- إضافة `specialistRecommendation?: string` لـ `ConsultationIntent`
- إضافة `severityLevel?: ResultSeverity` لـ `AssessmentResultPayload`
- إضافة `summary?: string` لـ `AssessmentResultPayload`

**ما يصبح آمناً بعده:** `runtimeSafety.ts` يعمل بشكل صحيح. `ScreeningResult.tsx` (pages/) يمكنه compile.

---

**Phase R4 — Router Migration**

**لماذا يأتي رابعاً:**
- يعتمد على Phase R3 (لأن `ScreeningResult.tsx` يحتاج كليهما)
- مستقل عن Phase R2 (لكن الترتيب يضمن compile clean بعد كل phase)

**التغييرات:**
- استبدال `useNavigate` بـ `useLocation` في 4 ملفات
- إضافة `CONFIRMED: "/consultation/confirmation"` لـ `CONSULTATION_ROUTES`
- تسجيل `SlotSelectionPage` و`SpecialistSelectionPage` في `App.tsx`

**ما يصبح آمناً بعده:** 4 صفحات تعمل في runtime. `BookingReviewPage` يمكنها navigate لـ CONFIRMED.

---

**Phase R5 — Orchestrator API Alignment**

**لماذا يأتي خامساً:**
- يعتمد على Phase R2 (لأن `CancellationOrchestrator` يحتاج `CANCELLABLE_PHASES`)
- مستقل عن Router fix

**التغييرات:**
- إضافة wrapper function `orchestrateReschedule()` في `RescheduleOrchestrator.ts`
- إضافة `type RescheduleFailureReason = RescheduleRejectionCode`
- إضافة `isReschedulablePhase()` و`getReschedulePolicyMessage()` كـ exports
- إصلاح `as unknown as Record<string, unknown>` في `CancellationOrchestrator`

**ما يصبح آمناً بعده:** `useRescheduleBooking` و`RescheduleBookingModal` يمكنهما compile.

---

**Phase R6 — Repository Deduplication**

**لماذا يأتي سادساً:**
- يعتمد على Phase R2 (لأن `lib/consultationBookingRepository` يحتاج types من Phase R2 لـ compile)
- يجب أن يأتي بعد التحقق من صفر imports على الملف القديم

**التغيير:**
- تحويل `lib/consultationBookingRepository.ts` لـ re-export من `repositories/ConsultationBookingRepository`
- أو حذفه بالكامل (مُفضَّل — صفر imports مؤكد)

**ما يصبح آمناً بعده:** لا خطر storage key collision. 10 errors تختفي.

---

**Phase R7 — framer-motion + State Machine Cleanup**

**لماذا يأتي أخيراً:**
- مستقل عن كل الـ phases السابقة
- لكن يجب أن يأتي آخراً لأنه cosmetic — لا يؤثر على runtime

**التغييرات:**
- إضافة `type Variants` import في `WhyTashkheesy.tsx` و`TrustSignals.tsx`
- إضافة `export type ExtendedFlowPhase = ConsultationFlowPhase | null` في `consultationStateMachine.ts`
- إصلاح `canExit` في `useConsultationFlow`
- إضافة `onFieldBlur?: (fieldId: string, value: unknown) => void` لـ `FunnelSession`
- ربط `useRuntimeSafetyCheck` في `ConsultationBookingContext`

---

## Section 5 — Runtime-Safe Repair Strategy

### Phase R1 — Silent Bug Containment

**Runtime Risk:** منخفض — التغيير additive (إضافة field جديد لـ `Child` interface).

**Rollback Risk:** منخفض — إذا فشل، `remoteId` يكون `undefined` والسلوك يعود للحالة السابقة (silent failure).

**Hydration Risk:** لا يوجد — `Child` interface لا تُخزَّن في sessionStorage.

**Persistence Risk:** منخفض — الـ fix يُصلح persistence failure، لا يُنشئها.

**Session Corruption Risk:** لا يوجد.

**Migration Guard مطلوب:** لا — التغيير backward compatible.

---

### Phase R2 — Type Foundation Consolidation

**Runtime Risk:** متوسط — `EXPANDED_TRANSITIONS_V2` يُغيّر transition map.

**Rollback Risk:** منخفض — الدمج additive. لا حذف من `ALLOWED_TRANSITIONS`.

**Hydration Risk:** لا يوجد — الـ types لا تُخزَّن في sessionStorage.

**Persistence Risk:** منخفض — `CANCELLING` و`RESCHEDULING` phases جديدة لا تؤثر على sessions موجودة.

**Session Corruption Risk:** لا يوجد — `BookingPhaseV2` يمتد `BookingPhase` ولا يُعدِّلها.

**⚠️ تحذير:** عند دمج `EXPANDED_TRANSITIONS_V2`، يجب **عدم** استبدال `ALLOWED_TRANSITIONS` — بل إضافة `EXPANDED_TRANSITIONS_V2` كـ export منفصل. `isValidTransition()` تبقى تستخدم `ALLOWED_TRANSITIONS` للـ core state machine. `isValidTransitionV2()` تستخدم `EXPANDED_TRANSITIONS_V2` للـ Orchestrators.

**Migration Guard مطلوب:** نعم — `consultationBookingTypesPatch.ts` يجب أن يبقى كـ re-export حتى التحقق من صفر imports.

---

### Phase R3 — ConsultationIntent Contract Expansion

**Runtime Risk:** منخفض — جميع الحقول الجديدة `optional`.

**Rollback Risk:** منخفض — الحقول `optional` لا تكسر existing code.

**Hydration Risk:** متوسط — `ConsultationIntent` مُخزَّنة في sessionStorage. إضافة حقول جديدة لا تُكسر hydration القديمة (JSON.parse يتجاهل الحقول الإضافية).

**Persistence Risk:** لا يوجد — `ConsultationIntent` لا تُكتب لـ Supabase مباشرةً.

**Session Corruption Risk:** لا يوجد — backward compatible.

**Migration Guard مطلوب:** لا.

---

### Phase R4 — Router Migration

**Runtime Risk:** عالٍ — استبدال router hook يؤثر على navigation behavior.

**Rollback Risk:** متوسط — إذا فشل، الصفحات تعود لحالة "لا تعمل" (الحالة الحالية).

**Hydration Risk:** منخفض — router لا يؤثر على sessionStorage.

**Persistence Risk:** لا يوجد.

**Session Corruption Risk:** لا يوجد.

**⚠️ تحذير:** `wouter`'s `useLocation` يُعيد `[location, setLocation]` بينما `react-router`'s `useNavigate` يُعيد function مباشرة. يجب التحقق من كل `navigate(path, options)` call — `setLocation` في `wouter` لا تقبل `{ replace: true }` بنفس الطريقة.

**Migration Guard مطلوب:** نعم — يجب اختبار كل صفحة بعد migration.

---

### Phase R5 — Orchestrator API Alignment

**Runtime Risk:** عالٍ — wrapper function تُغلّف `RescheduleOrchestrator.execute()` مع deps injection مختلف.

**Rollback Risk:** متوسط — إذا فشل الـ wrapper، reschedule flow يتوقف (الحالة الحالية).

**Hydration Risk:** لا يوجد.

**Persistence Risk:** متوسط — `orchestrateReschedule` wrapper يجب أن يُمرِّر `deps` صحيحة لـ `RescheduleOrchestrator.execute()`.

**Session Corruption Risk:** متوسط — إذا كانت الـ deps خاطئة، reschedule قد يُنشئ session state غير متسق.

**⚠️ تحذير:** `orchestrateReschedule` wrapper يجب أن يستخدم `RescheduleOrchestrator` مع deps من `ConsultationBookingContext` — ليس deps مُنشأة locally. الـ `TransactionalReservationRepository` و`AuthoritativeVersionService` يجب أن تأتي من نفس الـ Context.

**Feature Freeze مطلوب:** نعم — reschedule feature يجب أن يكون disabled في UI حتى اكتمال هذا الـ fix.

---

### Phase R6 — Repository Deduplication

**Runtime Risk:** منخفض — `lib/consultationBookingRepository.ts` لا يُستخدم فعلاً.

**Rollback Risk:** منخفض — حذف ملف لا يُستخدم.

**Hydration Risk:** لا يوجد.

**Persistence Risk:** لا يوجد — storage key المختلف لا يُكتب إليه.

**Session Corruption Risk:** لا يوجد.

**⚠️ تحذير:** قبل الحذف، يجب تشغيل `grep -rn "lib/consultationBookingRepository"` مرة أخيرة للتأكد من صفر imports.

---

## Section 6 — Repository Consolidation Strategy

### أي Repository يبقى؟

**`repositories/ConsultationBookingRepository.ts` (singleton) هو المالك الكانوني** — للأسباب التالية:

أولاً، هو المُستخدم الوحيد فعلاً — `ConsultationBookingContext` يستورده مباشرةً (السطر 163). ثانياً، يستخدم storage key منظَّم (`"tashkheesy:cbs:{sessionId}"`) مع `ACTIVE_KEY` منفصل — هذا يدعم multi-session management. ثالثاً، يُصدِّر singleton `consultationBookingRepository` — يضمن instance واحد في التطبيق.

### هل Re-export كافٍ؟

نعم — `lib/consultationBookingRepository.ts` لا يُستورد من أي مكان. يمكن **حذفه مباشرةً** بدلاً من re-export. Re-export مناسب فقط إذا كان هناك consumer خارجي (tests مثلاً) — وهو غير موجود هنا.

### Storage Key Stability

| Key | الملف | الحالة |
|---|---|---|
| `"tashkheesy:cbs:{sessionId}"` | `repositories/ConsultationBookingRepository` | ✅ نشط — لا تغيير |
| `"tashkheesy:cbs_active_id"` | `repositories/ConsultationBookingRepository` | ✅ نشط — لا تغيير |
| `"tashkheesy_booking_session_v1"` | `lib/consultationBookingRepository` | ❌ dead — يُحذف مع الملف |

**⚠️ تحذير:** إذا كان هناك مستخدمون حاليون لديهم بيانات في `"tashkheesy_booking_session_v1"` (من نسخة قديمة)، يجب إضافة migration guard يقرأ الـ key القديم عند أول تشغيل ويُحوِّله للـ key الجديد.

### Session Hydration

`repositories/ConsultationBookingRepository` يدعم hydration عبر `loadActive()` → `load(activeId)`. هذا يعني أن الجلسة تُستعاد بشكل صحيح بعد refresh. لا يوجد خطر hydration من الـ consolidation.

---

## Section 7 — Orchestrator Stabilization Plan

### RescheduleOrchestrator

**الوضع الحالي:** `class RescheduleOrchestrator { execute() }` — API جديد لكن المستهلكون يطلبون API قديم.

**التشخيص:** Migration abandoned mid-flight في Sprint 3.5 Phase 1B. الـ class كُتب بالكامل لكن المستهلكون لم يُحدَّثوا.

**الخيار الأمثل:** إضافة wrapper function كـ compatibility bridge:

```typescript
// في RescheduleOrchestrator.ts — يُضاف في نهاية الملف

export type RescheduleFailureReason = RescheduleRejectionCode | "unknown_error";

export interface OrchestrateRescheduleInput {
  session: ConsultationBookingSession;
  ownershipToken: string;
  newSlotId: string;
  currentReservationId: string | null;
  authoritativeVersion: number;
  reservationTtlMinutes: number;
}

export interface OrchestrateRescheduleDeps {
  transitionTo: (phase: BookingPhase) => void;
}

export interface OrchestrateRescheduleResult {
  success: boolean;
  reason?: RescheduleFailureReason;
}

/**
 * orchestrateReschedule — compatibility wrapper around RescheduleOrchestrator.execute()
 * 
 * Bridges the Sprint 3.5 consumer API to the Sprint 3.5 Phase 1B class API.
 * This wrapper is intentionally thin — it does NOT add business logic.
 */
export async function orchestrateReschedule(
  input: OrchestrateRescheduleInput,
  deps: OrchestrateRescheduleDeps
): Promise<OrchestrateRescheduleResult> {
  // NOTE: RescheduleOrchestrator requires full deps injection.
  // In Sprint 3.7.1, we use a simplified path that calls execute() directly
  // with the session's consultationId (to be mapped from session).
  // Full deps wiring in Sprint 3.8.
  throw new Error("orchestrateReschedule: deps injection not yet wired — Sprint 3.8");
}

export function isReschedulablePhase(phase: BookingPhase): boolean {
  return ["CONFIRMED", "RESCHEDULED"].includes(phase);
}

export function getReschedulePolicyMessage(phase: BookingPhase): string {
  if (["CANCELLED", "EXPIRED", "COMPLETED", "ABANDONED"].includes(phase)) {
    return "لا يمكن إعادة جدولة هذا الحجز — الحالة نهائية.";
  }
  if (["CREATED", "SPECIALIST_SELECTION", "SLOT_SELECTION", "REVIEW"].includes(phase)) {
    return "استخدم تدفق اختيار الموعد بدلاً من إعادة الجدولة.";
  }
  return "إعادة الجدولة غير متاحة في هذه الحالة.";
}
```

**⚠️ تحذير:** `orchestrateReschedule` wrapper يجب أن يُعيد `throw` مؤقتاً حتى يتم wiring الـ deps الكاملة في Sprint 3.8. هذا أفضل من silent failure.

**ما يجب عدم aliasing بشكل أعمى:**
- `RescheduleRejectionCode` → `RescheduleFailureReason` — الـ alias صحيح لكن يجب إضافة `"unknown_error"` للـ union
- `execute()` → `orchestrateReschedule()` — الـ signature مختلف تماماً، لا يمكن alias مباشر

### CancellationOrchestrator

**الوضع الحالي:** يستورد `CANCELLABLE_PHASES` من `consultationBookingTypes` (غير موجودة) + يستورد `createClient` مباشرةً.

**الخطوة الأولى (Phase R2):** بعد دمج `typesPatch`، `CANCELLABLE_PHASES` ستكون موجودة في `consultationBookingTypes` — 7 errors تختفي تلقائياً.

**الخطوة الثانية (Phase R5):** إصلاح `as unknown as Record<string, unknown>`:

```typescript
// قبل:
const payload = session as unknown as Record<string, unknown>;

// بعد:
const payload = JSON.parse(JSON.stringify(session)) as Record<string, unknown>;
```

**⚠️ تحذير:** `createClient` في `CancellationOrchestrator` يُنشئ Supabase client جديد في كل استدعاء. هذا يعني أن كل cancellation تستخدم client مختلف — قد يُسبب مشاكل في session management على المدى البعيد. الحل الصحيح في Sprint 3.8: dep-inject Supabase client من Context.

### Phase Validation Ownership

`isReschedulablePhase` و`isCancellablePhase` يجب أن تُصدَّر من `consultationBookingTypes.ts` (بعد دمج `typesPatch`) — ليس من `RescheduleOrchestrator`. الـ Orchestrators يجب أن تستوردها من الـ types layer.

---

## Section 8 — Silent Bug Containment

### تصنيف الـ Silent Bugs حسب الخطورة

**🔴 Critical — Data Loss في Production**

**Bug S1: `updateRemoteChild` يستقبل `local_child_id` بدلاً من Supabase UUID**

الملف: `ChildrenPage.tsx:249`  
الجذر: `remoteToLocal()` تُعيّن `id: (r.local_child_id || r.id)` — أي أن `child.id` في الـ UI هو `local_child_id` وليس Supabase UUID. `updateRemoteChild` يُنفّذ `.eq("id", remoteId)` — يبحث عن Supabase UUID.  
التأثير: كل تحديث لبيانات طفل يفشل صامتاً في Supabase. البيانات تُحفظ في localStorage فقط.  
القابلية للاسترداد: عالية — البيانات موجودة في localStorage، يمكن re-sync.  
تأثير المستخدم: يعتقد أن البيانات مُحدَّثة لكنها لم تُزامَن مع Supabase.

**الإصلاح:** إضافة `remoteId?: string` لـ `Child` interface وتعبئته من `r.id` (Supabase UUID) في `remoteToLocal()`.

---

**🟡 High — Runtime Crash صامت**

**Bug S2: `session.onFieldBlur()` غير موجودة في `FunnelSession`**

الملف: `AssessmentForm.tsx:118`  
الجذر: `FunnelSession` interface لا تحتوي على `onFieldBlur`.  
التأثير: `TypeError: session.onFieldBlur is not a function` عند كل blur في نموذج التقييم.  
القابلية للاسترداد: عالية — لا data loss، فقط analytics مفقودة.  
تأثير المستخدم: قد يرى error في console لكن الـ form يعمل.

**الإصلاح:** إضافة `onFieldBlur?: (fieldId: string, value: unknown) => void` لـ `FunnelSession`.

---

**🟡 High — Safety Check Disabled**

**Bug S3: `intent.intentId` دائماً `undefined` → `hasIntentMismatch` دائماً `false`**

الملف: `runtimeSafety.ts:88`  
الجذر: `ConsultationIntent` لا تحتوي على `intentId`.  
التأثير: فحص الـ mismatch بين session و intent معطّل — orphaned sessions لا تُكتشف.  
القابلية للاسترداد: عالية — لا data loss مباشر.  
تأثير المستخدم: قد يرى booking state غير متسق بعد refresh.

**الإصلاح:** إضافة `intentId?: string` لـ `ConsultationIntent` (Phase R3).

---

**🟡 High — Navigation Dead-End**

**Bug S4: `CONSULTATION_ROUTES.CONFIRMED` غير موجودة**

الملف: `BookingReviewPage.tsx:192`  
الجذر: `CONSULTATION_ROUTES` لا تحتوي على `CONFIRMED`.  
التأثير: `navigate(undefined)` — navigation تفشل صامتاً أو تُنتج runtime error.  
القابلية للاسترداد: عالية — المستخدم يبقى في صفحة Review.  
تأثير المستخدم: لا يمكنه إكمال الحجز.

**الإصلاح:** إضافة `CONFIRMED: "/consultation/confirmation"` لـ `CONSULTATION_ROUTES` (Phase R4).

---

**🟢 Medium — Orchestration Disabled**

**Bug S5: `orchestrateReschedule` غير موجودة → reschedule يفشل عند أول استدعاء**

الملف: `useRescheduleBooking.ts:62`  
الجذر: `orchestrateReschedule` غير مُصدَّرة من `RescheduleOrchestrator`.  
التأثير: `TypeError: orchestrateReschedule is not a function` عند محاولة reschedule.  
القابلية للاسترداد: عالية — لا data loss.  
تأثير المستخدم: لا يمكنه إعادة الجدولة.

**الإصلاح:** Phase R5.

---

**🟢 Medium — Supabase Client Proliferation**

**Bug S6: `CancellationOrchestrator` يُنشئ Supabase client جديد في كل استدعاء**

الملف: `CancellationOrchestrator.ts:44`  
الجذر: `createClient` مباشرةً بدلاً من singleton.  
التأثير: memory leak محتمل + session management غير متسق.  
القابلية للاسترداد: عالية.  
تأثير المستخدم: لا يُلاحَظ في الـ MVP.

**الإصلاح:** Sprint 3.8 — dep-inject Supabase client.

---

## Section 9 — Rollback-Safe Commit Strategy

### مبادئ الـ Commit Batching

كل commit يجب أن:
1. يُمرِّر `tsc --noEmit` بعده
2. يُمرِّر `pnpm build` بعده
3. لا يُدخل regression في الـ errors الحالية

### الـ Commits المقترحة

```
COMMIT BATCH 1 (Phase R1):
  fix(children): add remoteId field to Child interface for Supabase sync
  
  Files: client/src/components/children/ChildrenPage.tsx
  Risk: LOW
  Rollback: git revert — safe

COMMIT BATCH 2 (Phase R2 — Step 1):
  feat(types): merge consultationBookingTypesPatch into consultationBookingTypes
  
  Files: 
    client/src/types/consultationBookingTypes.ts (additions only)
    client/src/types/consultationBookingTypesPatch.ts (convert to re-export)
  Risk: MEDIUM
  Rollback: git revert — safe (additive only)

COMMIT BATCH 3 (Phase R2 — Step 2):
  fix(types): add BOOKING_RECOVERABLE_PHASES and BookingInterruptionReason aliases
  
  Files: client/src/types/consultationBookingTypes.ts
  Risk: LOW
  Rollback: git revert — safe

COMMIT BATCH 4 (Phase R3):
  feat(types): expand ConsultationIntent and AssessmentResultPayload contracts
  
  Files: client/src/types/consultationTypes.ts
  Risk: LOW (all optional fields)
  Rollback: git revert — safe

COMMIT BATCH 5 (Phase R4 — Router):
  fix(router): replace react-router-dom with wouter in 4 files
  fix(routes): add CONFIRMED route to CONSULTATION_ROUTES
  fix(app): register SlotSelectionPage and SpecialistSelectionPage
  
  Files:
    client/src/pages/ScreeningResult.tsx
    client/src/pages/consultation/SlotSelectionPage.tsx
    client/src/pages/consultation/SpecialistSelectionPage.tsx
    client/src/utils/bookingOwnership.ts
    client/src/constants/consultationRoutes.ts
    client/src/App.tsx
  Risk: HIGH — test each page after commit
  Rollback: git revert — safe

COMMIT BATCH 6 (Phase R5):
  feat(orchestrator): add orchestrateReschedule wrapper and phase predicates
  fix(orchestrator): repair CancellationOrchestrator type casting
  
  Files:
    client/src/orchestrators/RescheduleOrchestrator.ts
    client/src/orchestrators/CancellationOrchestrator.ts
  Risk: HIGH — feature freeze on reschedule until deps wired
  Rollback: git revert — safe

COMMIT BATCH 7 (Phase R6):
  chore(cleanup): remove dead lib/consultationBookingRepository.ts
  
  Files: client/src/lib/consultationBookingRepository.ts (delete)
  Risk: LOW — zero imports confirmed
  Rollback: git revert — safe

COMMIT BATCH 8 (Phase R7):
  fix(ui): repair framer-motion Variants types in WhyTashkheesy and TrustSignals
  fix(state): export ExtendedFlowPhase from consultationStateMachine
  fix(analytics): add onFieldBlur to FunnelSession interface
  fix(safety): connect useRuntimeSafetyCheck to ConsultationBookingContext
  
  Files: multiple
  Risk: LOW
  Rollback: git revert — safe
```

### Isolation Boundaries

كل Commit Batch يجب أن يكون في **branch منفصل** مع PR منفصل. ترتيب الـ PRs:
1. `fix/silent-bug-child-update` (Batch 1)
2. `fix/type-foundation` (Batches 2+3)
3. `fix/intent-contract` (Batch 4)
4. `fix/router-migration` (Batch 5)
5. `fix/orchestrator-api` (Batch 6)
6. `chore/repo-cleanup` (Batch 7)
7. `fix/ui-types-cleanup` (Batch 8)

---

## Section 10 — AI Execution Constraints

### ما هو محظور على أي AI coding agent

**محظور تماماً:**

| الإجراء | السبب |
|---|---|
| حذف `ALLOWED_TRANSITIONS` من `consultationBookingTypes.ts` | يكسر كل `isValidTransition()` calls |
| استبدال `repositories/ConsultationBookingRepository` بـ implementation جديد | يُغيّر storage keys → session loss |
| تغيير `STORAGE_KEY` أو `ACTIVE_KEY` في `repositories/ConsultationBookingRepository` | يُسبب session loss لكل المستخدمين |
| دمج `ConsultationFlowPhase` مع `BookingPhase` | يكسر الفصل المعماري الأساسي |
| إضافة `react-router-dom` لـ `package.json` | يُعارض قرار wouter |
| تغيير `ConsultationBookingContext` API | يكسر كل المستهلكين |
| حذف `consultationBookingTypesPatch.ts` قبل التحقق من صفر imports | قد يكسر imports غير مرئية |
| تغيير `RescheduleOrchestrator.execute()` signature | يكسر الـ class API |
| إضافة `intentId` كـ required field في `ConsultationIntent` | يكسر كل existing sessions في sessionStorage |
| تغيير `bookingFlowPhase` field name في `ConsultationBookingSession` | يكسر hydration |

**محظور بدون تحقق مسبق:**

- حذف أي ملف بدون `grep -rn` للتأكد من صفر imports
- تغيير أي interface بدون التحقق من كل المستهلكين
- إضافة required fields لأي interface مُخزَّنة في sessionStorage
- تغيير أي storage key

### المناطق الآمنة للتعديل

| المنطقة | ما هو آمن |
|---|---|
| `consultationBookingTypes.ts` | إضافة exports جديدة (additive فقط) |
| `consultationTypes.ts` | إضافة optional fields |
| `CONSULTATION_ROUTES` | إضافة routes جديدة |
| `RescheduleOrchestrator.ts` | إضافة exports جديدة في نهاية الملف |
| `ChildrenPage.tsx` | إضافة `remoteId` field لـ `Child` interface |
| `FunnelSession` | إضافة optional methods |
| UI components | تغييرات بصرية وإصلاح TypeScript errors |

### متطلبات التحقق بعد كل تعديل

بعد كل commit، يجب تشغيل:
```bash
npx tsc --noEmit   # يجب أن يُعيد exit code 0 أو عدد errors أقل من السابق
pnpm build         # يجب أن ينجح
```

بعد Phase R4 (Router Migration)، يجب اختبار يدوي:
- `/consultation/start` يُحمَّل
- `/consultation/booking` يُحمَّل
- navigation من Review لـ CONFIRMED يعمل

---

## Phase-by-Phase Recovery Roadmap

| Phase | الوصف | الملفات | الـ Errors تُصلح | الـ Bugs تُصلح | الخطر |
|---|---|---|---|---|---|
| R0 | Freeze & Verify | — | 0 | 0 | لا يوجد |
| R1 | Silent Bug: updateRemoteChild | ChildrenPage.tsx | 0 | S1 | منخفض |
| R2 | Type Foundation Consolidation | consultationBookingTypes.ts, typesPatch.ts | ~17 | S3 (جزئي) | متوسط |
| R3 | ConsultationIntent Contract | consultationTypes.ts | ~11 | S3 (كامل) | منخفض |
| R4 | Router Migration | 4 ملفات + routes + App.tsx | ~25 | S4 | عالٍ |
| R5 | Orchestrator API | RescheduleOrchestrator.ts, CancellationOrchestrator.ts | ~8 | S5 | عالٍ |
| R6 | Repository Cleanup | lib/consultationBookingRepository.ts | 10 | — | منخفض |
| R7 | UI Types + State Machine | 5 ملفات | ~13 | S2 | منخفض |

**المجموع المتوقع:** من 76 error إلى 0 + إصلاح 5 silent bugs.

---

## Final Recommended Safe Execution Sequence

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Verify freeze assumptions (no code)                │
│  → grep -rn "lib/consultationBookingRepository" client/src  │
│  → grep -rn "consultationBookingTypesPatch" client/src      │
│  → Confirm: zero consumers for both                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Fix Silent Bug S1 (updateRemoteChild)              │
│  → Add remoteId?: string to Child interface                 │
│  → Populate from r.id in remoteToLocal()                    │
│  → Pass childData.remoteId to updateRemoteChild()           │
│  → tsc --noEmit: same error count (no regression)           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Merge typesPatch (additive only)                   │
│  → Copy CANCELLABLE_PHASES, RESCHEDULABLE_PHASES,           │
│    BookingPhaseV2, EXPANDED_TRANSITIONS_V2,                 │
│    isReschedulablePhase, isCancellablePhase to              │
│    consultationBookingTypes.ts                              │
│  → Add BOOKING_RECOVERABLE_PHASES alias                     │
│  → Add BookingInterruptionReason alias                      │
│  → Convert typesPatch to re-export (don't delete yet)       │
│  → tsc --noEmit: ~17 fewer errors                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Expand ConsultationIntent contract                 │
│  → Add intentId?, assessmentSessionId?,                     │
│    specialistRecommendation? to ConsultationIntent          │
│  → Add severityLevel?, summary? to AssessmentResultPayload  │
│  → tsc --noEmit: ~11 fewer errors                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Router migration                                   │
│  → Replace useNavigate with useLocation in 4 files          │
│  → Add CONFIRMED to CONSULTATION_ROUTES                     │
│  → Register SlotSelectionPage, SpecialistSelectionPage      │
│  → tsc --noEmit: ~25 fewer errors                           │
│  → Manual test: all consultation routes load                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Orchestrator API alignment                         │
│  → Add orchestrateReschedule wrapper (throws until wired)   │
│  → Add RescheduleFailureReason, isReschedulablePhase,       │
│    getReschedulePolicyMessage exports                        │
│  → Fix CancellationOrchestrator type casting                │
│  → tsc --noEmit: ~8 fewer errors                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Repository cleanup                                 │
│  → Verify: grep -rn "lib/consultationBookingRepository"     │
│  → Delete lib/consultationBookingRepository.ts              │
│  → tsc --noEmit: 10 fewer errors                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: UI types + state machine cleanup                   │
│  → Fix framer-motion Variants in WhyTashkheesy, TrustSignals│
│  → Export ExtendedFlowPhase from consultationStateMachine   │
│  → Add onFieldBlur to FunnelSession                         │
│  → Connect useRuntimeSafetyCheck to ConsultationBookingCtx  │
│  → tsc --noEmit: 0 errors ✅                                │
│  → pnpm build: PASS ✅                                      │
└─────────────────────────────────────────────────────────────┘
```

---

*هذا التقرير هو خطة تخطيط فقط — لا تعديل، لا PR، لا merge، لا deploy.*  
*كل تعديل يجب أن يبدأ على branch جديد ويمر بـ PR review.*

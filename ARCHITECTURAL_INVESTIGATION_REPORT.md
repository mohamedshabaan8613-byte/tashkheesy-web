# Architectural Investigation Report
## Sprint 3.7.1 — `main` branch · تشخيصي

**تاريخ التقرير:** 2026-05-29  
**نطاق الفحص:** قراءة فقط — لا تعديل، لا PR، لا merge، لا deploy  
**المنهجية:** قراءة مباشرة للملفات من `main` + `tsc --noEmit` + تتبع import graph  
**إجمالي TypeScript Errors:** 76 error في 21 ملفاً

---

## ملخص تنفيذي

المشروع يمر بمرحلة إعادة هيكلة معمارية متسارعة (Sprint 3.0 → 3.7) أفرزت ثلاث مشاكل جذرية:

1. **تعدد مصادر الحقيقة (Dual Repository Authority):** ملفان مستقلان يكتبان على sessionStorage بمفاتيح مختلفة — `lib/consultationBookingRepository.ts` و`repositories/ConsultationBookingRepository.ts` — أحدهما يُستخدم فعلياً والآخر يحتوي على 10 TypeScript errors.

2. **Compatibility Layers لم تُدمج (Unmerged Patch Files):** `consultationBookingTypesPatch.ts` يحتوي على `CANCELLABLE_PHASES` و`BookingPhaseV2` وكل منطق الإلغاء/إعادة الجدولة، لكنه لم يُدمج في `consultationBookingTypes.ts` رغم أن `MERGE PLAN: Sprint 3.6` مكتوب صراحةً في الملف.

3. **Contract Drift بين الـ Orchestrators والـ Types:** `CancellationOrchestrator` يستورد `CANCELLABLE_PHASES` من `consultationBookingTypes` (غير موجودة هناك)، و`RescheduleOrchestrator` لا يُصدِّر `orchestrateReschedule` ولا `RescheduleFailureReason` ولا `isReschedulablePhase` رغم أن ثلاثة ملفات تطلبها.

---

## Q1 — من يملك Runtime Authority على الـ Booking Session؟

### الوضع الحالي

يوجد في المشروع **ملفان مختلفان** يدّعيان ownership على الـ booking session:

| الملف | Storage Key | Interface | يُستخدم من |
|---|---|---|---|
| `lib/consultationBookingRepository.ts` | `"tashkheesy_booking_session_v1"` | `ConsultationBookingRepository` (factory function) | **لا أحد** |
| `repositories/ConsultationBookingRepository.ts` | `"tashkheesy:cbs:{sessionId}"` + `"tashkheesy:cbs_active_id"` | `ConsultationBookingRepository` (singleton class) | `ConsultationBookingContext.tsx` |

### التحليل

`ConsultationBookingContext.tsx` (السطر 163) يستورد صراحةً من `repositories/ConsultationBookingRepository` — هذا هو **مصدر الحقيقة الفعلي**. أما `lib/consultationBookingRepository.ts` فهو الملف القديم الذي لا يستورده أحد، لكنه يحتوي على 10 TypeScript errors لأنه يطلب types غير موجودة في `consultationBookingTypes.ts`.

### الخطر

**Storage Key Collision:** إذا استُدعي `lib/consultationBookingRepository.ts` بأي طريقة (مثلاً عبر dynamic import أو test)، سيكتب على مفتاح مختلف تماماً (`"tashkheesy_booking_session_v1"`) بينما `ConsultationBookingContext` يقرأ من `"tashkheesy:cbs:{sessionId}"`. المستخدم سيفقد جلسته صامتاً.

**الحل المطلوب:** حذف `lib/consultationBookingRepository.ts` بالكامل أو تحويله لـ re-export من `repositories/ConsultationBookingRepository.ts`.

---

## Q2 — هل `ConsultationFlowPhase` و`BookingPhase` منفصلتان بشكل صحيح؟

### الوضع الحالي

**نعم، الفصل صحيح معمارياً** — لكن التطبيق يكسره في ثلاثة أماكن:

```
ConsultationFlowPhase = "IDLE" | "INTRO" | "BOOKING" | "SUCCESS" | "EXITED" | "ERROR"
BookingPhase          = "CREATED" | "SPECIALIST_SELECTION" | "SLOT_SELECTION" | 
                        "REVIEW" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | 
                        "CANCELLED" | "EXPIRED" | "ABANDONED"
```

التصميم صحيح: `ConsultationFlowPhase` تصف **أين المستخدم في الرحلة**، بينما `BookingPhase` تصف **حالة الحجز في قاعدة البيانات**.

### الكسر الأول: `useConsultationFlow.ts` السطر 150-151

```typescript
// flowPhase نوعها: "BOOKING" | "INTRO"
// لكن الكود يقارنها بـ "SUCCESS" و"EXITED" — مستحيل تكون صحيحة
const canExit = useMemo(
  () => flowPhase !== "IDLE" && flowPhase !== "SUCCESS" && flowPhase !== "EXITED",
  [flowPhase]
);
```

`flowPhase` في هذا السياق مستنتجة من `intent` فقط وتُعيد `"BOOKING" | "INTRO" | "IDLE"` — لا تصل أبداً لـ `"SUCCESS"` أو `"EXITED"`. المقارنة دائماً `true` مما يجعل `canExit` دائماً `true` حين `intent !== null`.

### الكسر الثاني: `useNavigationRecovery.ts` السطر 39

```typescript
currentPhase: ExtendedFlowPhase; // ← غير مُصدَّر من consultationStateMachine
```

`ExtendedFlowPhase` غير موجودة كـ export في `consultationStateMachine.ts`. الملف يُصدِّر `ConsultationFlowPhase` فقط.

### الكسر الثالث: `BookingReviewPage.tsx` السطر 192

```typescript
navigate(CONSULTATION_ROUTES.CONFIRMED); // ← "CONFIRMED" غير موجودة في CONSULTATION_ROUTES
```

`CONSULTATION_ROUTES` يحتوي على `START`, `BOOKING`, `REVIEW` فقط — لا يوجد `CONFIRMED`.

---

## Q3 — هل `consultationBookingTypesPatch.ts` Compatibility Layer أم Dead Code؟

### الوضع الحالي

الملف **ليس dead code** — بل هو **compatibility layer مؤجل الدمج**. الدليل:

```typescript
// من الملف نفسه:
// MERGE PLAN:
//   Sprint 3.6: merge this entire file into consultationBookingTypes.ts.
//   Until then, import from this patch file for anything reschedule / cancellation.
```

لكن **Sprint 3.6 انتهى** ولم يحدث الدمج. النتيجة:

| ما هو موجود في `typesPatch` | ما يطلبه `CancellationOrchestrator` | النتيجة |
|---|---|---|
| `CANCELLABLE_PHASES` | من `consultationBookingTypes` | ❌ TS2305 |
| `BookingPhaseV2` | — | موجود لكن غير مستخدم |
| `RESCHEDULABLE_PHASES` | — | موجود لكن غير مستخدم |
| `EXPANDED_TRANSITIONS_V2` | — | موجود لكن غير مستخدم |

`CancellationOrchestrator` يستورد `CANCELLABLE_PHASES` من `consultationBookingTypes` (الملف الأصلي)، لكن `CANCELLABLE_PHASES` موجودة فقط في `consultationBookingTypesPatch`. هذا هو الجذر الحقيقي لـ 7 errors في `CancellationOrchestrator`.

---

## Q4 — هل `runtimeSafety.ts` يُفعَّل فعلاً؟

### الوضع الحالي

`runtimeSafety.ts` يُصدِّر `validateRuntimeSafety()` و`useRuntimeSafetyCheck()`. لكن:

```typescript
// runtimeSafety.ts السطر 88-92:
const hasIntentMismatch =
  session !== null &&
  intent !== null &&
  session.sourceIntentId !== intent.intentId; // ← intentId غير موجود في ConsultationIntent
```

`ConsultationIntent` لا تحتوي على `intentId` — الحقل غير موجود في الـ interface. هذا يعني أن `hasIntentMismatch` **دائماً `false`** في runtime (لأن `undefined !== undefined` = `false`). فحص الـ mismatch معطّل صامتاً.

### هل يُستخدم `useRuntimeSafetyCheck`؟

```bash
$ grep -rn "useRuntimeSafetyCheck\|validateRuntimeSafety" client/src/ | grep -v "runtimeSafety.ts"
```

النتيجة: **لا يوجد استخدام** — الملف كاملاً غير مُستدعى من أي مكان في التطبيق. هو تصميم دفاعي جيد لكنه لم يُربط بعد.

---

## Q5 — ما هي الـ Types المفقودة من `consultationBookingTypes.ts`؟

### جدول الـ Types المفقودة

| Type/Constant المطلوبة | يطلبها | موجودة في | الحل |
|---|---|---|---|
| `CANCELLABLE_PHASES` | `CancellationOrchestrator` | `typesPatch` | دمج `typesPatch` |
| `BOOKING_RECOVERABLE_PHASES` | `lib/consultationBookingRepository` | غير موجودة | إضافة alias لـ `RECOVERABLE_PHASES` |
| `BOOKING_TERMINAL_PHASES` | `lib/consultationBookingRepository` | غير موجودة | إضافة alias لـ `TERMINAL_PHASES` |
| `BookingInterruptionReason` | `lib/consultationBookingRepository` | غير موجودة | إضافة type alias |
| `ConsultationEntryPoint` | `lib/consultationBookingRepository` | `consultationTypes.ts` | تغيير مسار الـ import |

### جدول الـ Fields المفقودة من `ConsultationIntent`

| Field المطلوب | يطلبه | الحل |
|---|---|---|
| `intentId` | `runtimeSafety.ts`, `ScreeningResult.tsx` | إضافة optional field |
| `assessmentSessionId` | `ScreeningResult.tsx` | إضافة optional field |
| `specialistRecommendation` | `ScreeningResult.tsx` | إضافة optional field |

### جدول الـ Fields المفقودة من `AssessmentResultPayload`

| Field المطلوب | يطلبه | الحل |
|---|---|---|
| `severityLevel` | `ScreeningResult.tsx` | إضافة optional field (alias لـ `severity`) |
| `summary` | `ScreeningResult.tsx` | إضافة optional field |

---

## Q6 — ما هو الـ State Machine الصحيح؟

### الـ State Machine الحالي في `consultationStateMachine.ts`

```
IDLE → INTRO → BOOKING → SUCCESS
         ↓        ↓
       EXITED   EXITED
         ↓
       ERROR
```

### المشكلة: `getPhaseFromPath` يُعيد `null`

```typescript
export function getPhaseFromPath(pathname: string): ConsultationFlowPhase | null {
  if (pathname.startsWith("/consultation/start")) return "INTRO";
  if (pathname.startsWith("/consultation/booking")) return "BOOKING";
  if (pathname.startsWith("/consultation/success")) return "SUCCESS";
  return null; // ← يُعيد null لأي path آخر
}
```

`useNavigationRecovery.ts` يُعيّن `currentPhase: ExtendedFlowPhase` (غير موجودة) ويستخدم `getPhaseFromPath` الذي يُعيد `ConsultationFlowPhase | null` — لكن `NavigationRecoveryState.currentPhase` يتوقع `ExtendedFlowPhase`. هذا يُنتج 3 errors متتالية.

### الـ State Machine في `BookingPhase`

```
CREATED → SPECIALIST_SELECTION → SLOT_SELECTION → REVIEW → CONFIRMED → COMPLETED
                                                              ↓
                                                          RESCHEDULED
                                                              ↓
                                                          CANCELLED / EXPIRED / ABANDONED
```

`CANCELLING` و`RESCHEDULING` موجودتان فقط في `BookingPhaseV2` (في `typesPatch`) — لكن `CancellationOrchestrator` يحاول إضافة `CANCELLING` لـ `ALLOWED_TRANSITIONS` من النوع `Partial<Record<BookingPhase, string>>` مما يُنتج TS2353.

---

## Q7 — ما هو الـ Repository Contract الصحيح؟

### `ConsultationBookingRepository` Interface (في `consultationBookingTypes.ts`)

```typescript
interface ConsultationBookingRepository {
  save(session: ConsultationBookingSession): void;
  load(sessionId: string): ConsultationBookingSession | null;
  loadLatest(): ConsultationBookingSession | null;
  invalidate(sessionId: string, reason: BookingRecoveryReason): void;
  clear(): void;
}
```

### ما يُطبّقه `repositories/ConsultationBookingRepository.ts` (الـ Singleton)

```typescript
// يُضيف:
setActive(sessionId: string): void;
getActiveId(): string | null;
loadActive(): ConsultationBookingSession | null;
clearActive(): void;
```

هذه الـ methods الإضافية **غير موجودة في الـ interface** — لكنها مُستخدمة في `ConsultationBookingContext`. TypeScript لا يشتكي لأن الـ class تُطبّق الـ interface وتُضيف عليها.

### المشكلة في `lib/consultationBookingRepository.ts`

الملف القديم يستورد `BookingInterruptionReason`, `BOOKING_RECOVERABLE_PHASES`, `BOOKING_TERMINAL_PHASES` من `consultationBookingTypes` — لكنها غير موجودة هناك. الملف أيضاً يُعيّن `wasRecovered` و`recoveryAttempts` في `BookingRecoveryState` — لكنهما غير موجودين في الـ interface.

---

## Q8 — ما هو الـ Navigation Contract الصحيح؟

### المشكلة: `react-router-dom` في مشروع `wouter`

أربعة ملفات تستورد من `react-router-dom` الذي **غير مثبَّت** في `package.json`:

| الملف | السطر | الـ Import |
|---|---|---|
| `pages/ScreeningResult.tsx` | 33 | `useNavigate` |
| `pages/consultation/SlotSelectionPage.tsx` | 25 | `useNavigate` |
| `pages/consultation/SpecialistSelectionPage.tsx` | 26 | `useNavigate` |
| `utils/bookingOwnership.ts` | 31 | `useNavigate` |

هذه الملفات **لن تعمل في runtime** — ستنهار فور mount.

### المشكلة: `CONSULTATION_ROUTES.CONFIRMED` غير موجودة

`BookingReviewPage.tsx` السطر 192 يستدعي `navigate(CONSULTATION_ROUTES.CONFIRMED)` — لكن `CONSULTATION_ROUTES` يحتوي على `START`, `BOOKING`, `REVIEW` فقط. المسار المقصود على الأرجح هو `/consultation/confirmation` أو `/consultation/success`.

### المشكلة: صفحتان غير مسجّلتان في Router

`SlotSelectionPage` و`SpecialistSelectionPage` موجودتان كملفات لكن غير مسجّلتين في `App.tsx` — لا يمكن الوصول إليهما.

---

## Q9 — ما هو الـ Silent Data Loss الفعلي؟

### Bug 1: `updateRemoteChild` يُمرَّر `local_child_id` بدلاً من Supabase UUID

```typescript
// ChildrenPage.tsx السطر 249:
updateRemoteChild(childData.id, { ... });

// childData.id = local_child_id (UUID محلي من localStorage)
// لكن updateRemoteChild يُنفّذ: .eq("id", remoteId) — يبحث عن Supabase UUID
```

`remoteToLocal()` (السطر 109) تُعيّن `id: (r.local_child_id || r.id)` — أي أن `child.id` في الـ UI هو `local_child_id` وليس Supabase `id`. عندما يُمرَّر لـ `updateRemoteChild`، الـ query `.eq("id", remoteId)` لن تجد أي صف لأنها تبحث عن `local_child_id` في عمود `id` (Supabase UUID).

**النتيجة:** كل تحديث لبيانات طفل يفشل صامتاً في Supabase — البيانات تُحفظ في localStorage فقط.

### Bug 2: `onFieldBlur` غير موجودة في `FunnelSession`

```typescript
// AssessmentForm.tsx السطر 118:
session.onFieldBlur(fieldId, value);

// FunnelSession interface لا تحتوي على onFieldBlur
```

كل مرة يغادر المستخدم حقل إدخال في نموذج التقييم، يحدث runtime error صامت.

### Bug 3: `intentId` في `runtimeSafety.ts` دائماً `undefined`

```typescript
session.sourceIntentId !== intent.intentId
// intent.intentId = undefined دائماً
// session.sourceIntentId = undefined إذا لم يُعيَّن
// undefined !== undefined = false → hasIntentMismatch دائماً false
```

فحص الـ mismatch معطّل — يمكن لجلسة orphaned أن تمر دون اكتشاف.

---

## Q10 — ما هو الـ Orchestrator Contract الصحيح؟

### `RescheduleOrchestrator` — Exports مقابل Imports

| ما يُصدِّره الملف | ما يطلبه `useRescheduleBooking` | ما يطلبه `RescheduleBookingModal` |
|---|---|---|
| `RescheduleRejectionCode` | `RescheduleFailureReason` ❌ | — |
| `RescheduleResult` | — | — |
| `RescheduleDeps` | — | — |
| `class RescheduleOrchestrator` | `orchestrateReschedule` (function) ❌ | `isReschedulablePhase` ❌ |
| — | `RescheduleFailureReason` ❌ | `getReschedulePolicyMessage` ❌ |

**الخلاصة:** `useRescheduleBooking` و`RescheduleBookingModal` يتوقعان API مختلفاً تماماً عما يُصدِّره `RescheduleOrchestrator`. إما أن الـ Orchestrator تغيّر API بدون تحديث المستهلكين، أو أن المستهلكين كُتبوا لـ API مخطط لم يُنفَّذ بعد.

### `CancellationOrchestrator` — مشكلة الـ Type Casting

```typescript
// السطر 94, 136:
const payload = session as unknown as Record<string, unknown>;
```

`ConsultationBookingSession` لا يمكن cast مباشرة لـ `Record<string, unknown>` — TypeScript يرفض ذلك لأن الـ types لا تتداخل كفاية. الحل الصحيح هو `JSON.parse(JSON.stringify(session))` أو `structuredClone(session)`.

---

## Q11 — خطة الاسترداد المعمارية (8 مراحل)

### المرحلة 1 — Type Foundation Consolidation (الأولوية: حرجة)

**الهدف:** دمج `consultationBookingTypesPatch.ts` في `consultationBookingTypes.ts`

**التغييرات:**
- نقل `CANCELLABLE_PHASES`, `RESCHEDULABLE_PHASES`, `BookingPhaseV2`, `EXPANDED_TRANSITIONS_V2` من `typesPatch` إلى الملف الأصلي
- إضافة `BOOKING_RECOVERABLE_PHASES` كـ alias لـ `RECOVERABLE_PHASES`
- إضافة `BOOKING_TERMINAL_PHASES` كـ alias لـ `TERMINAL_PHASES`
- إضافة `BookingInterruptionReason` كـ type alias لـ `BookingRecoveryReason`
- حذف `consultationBookingTypesPatch.ts`

**الأثر:** يُصلح ~15 error في `CancellationOrchestrator` + `lib/consultationBookingRepository`

---

### المرحلة 2 — ConsultationIntent Contract Expansion (الأولوية: عالية)

**الهدف:** إضافة الـ fields المفقودة من `ConsultationIntent` و`AssessmentResultPayload`

**التغييرات:**
```typescript
// consultationTypes.ts
export interface ConsultationIntent {
  // ... الحقول الموجودة
  intentId?: string;                              // ← جديد
  assessmentSessionId?: string;                   // ← جديد
  specialistRecommendation?: string;              // ← جديد
}

export interface AssessmentResultPayload {
  // ... الحقول الموجودة
  severityLevel?: ResultSeverity;                 // ← alias لـ severity
  summary?: string;                               // ← جديد
}
```

**الأثر:** يُصلح ~11 error في `ScreeningResult.tsx` + `runtimeSafety.ts`

---

### المرحلة 3 — Router Migration (الأولوية: عالية)

**الهدف:** استبدال `react-router-dom` بـ `wouter` في 4 ملفات

**التغييرات:**
```typescript
// قبل:
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/path");

// بعد:
import { useLocation } from "wouter";
const [, setLocation] = useLocation();
setLocation("/path");
```

**الملفات:** `ScreeningResult.tsx`, `SlotSelectionPage.tsx`, `SpecialistSelectionPage.tsx`, `bookingOwnership.ts`

**الأثر:** يُصلح 4 errors + يجعل الصفحات قابلة للعمل في runtime

---

### المرحلة 4 — Orchestrator API Alignment (الأولوية: عالية)

**الهدف:** مزامنة `RescheduleOrchestrator` exports مع ما يطلبه المستهلكون

**الخيار أ (مُوصى به):** إضافة الـ exports المفقودة:
```typescript
// RescheduleOrchestrator.ts
export type RescheduleFailureReason = RescheduleRejectionCode; // alias
export function orchestrateReschedule(deps: RescheduleDeps, input: RescheduleInput) { ... }
export function isReschedulablePhase(phase: BookingPhase): boolean { ... }
export function getReschedulePolicyMessage(phase: BookingPhase): string { ... }
```

**الخيار ب:** تحديث `useRescheduleBooking` و`RescheduleBookingModal` ليستخدما `RescheduleOrchestrator.execute()` مباشرة.

**الأثر:** يُصلح 5 errors في `useRescheduleBooking` + `RescheduleBookingModal`

---

### المرحلة 5 — framer-motion Variants Fix (الأولوية: متوسطة)

**الهدف:** إصلاح `ease: string` في `WhyTashkheesy.tsx` و`TrustSignals.tsx`

**التغيير:**
```typescript
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};
```

**الأثر:** يُصلح 10 errors في `WhyTashkheesy.tsx` + 3 errors في `TrustSignals.tsx`

---

### المرحلة 6 — Repository Deduplication (الأولوية: متوسطة)

**الهدف:** إزالة `lib/consultationBookingRepository.ts` أو تحويله لـ re-export

**التغيير:**
```typescript
// lib/consultationBookingRepository.ts (بعد التعديل)
// Re-export من الـ singleton الحقيقي
export { consultationBookingRepository } from "../repositories/ConsultationBookingRepository";
export type { ConsultationBookingRepository } from "../types/consultationBookingTypes";
```

**الأثر:** يُصلح 10 errors + يُزيل خطر Storage Key Collision

---

### المرحلة 7 — Silent Bug Fixes (الأولوية: حرجة وظيفياً)

**Bug 1: `updateRemoteChild` — تمرير Supabase UUID الصحيح**

```typescript
// ChildrenPage.tsx — يحتاج تخزين remoteId منفصلاً
interface Child {
  id: string;           // local_child_id (localStorage)
  remoteId?: string;    // Supabase UUID ← جديد
}

// في remoteToLocal():
remoteId: r.id as string, // Supabase UUID

// في handleEditChild():
updateRemoteChild(childData.remoteId ?? childData.id, { ... });
```

**Bug 2: `onFieldBlur` — إضافة الـ method لـ `FunnelSession`**

```typescript
// screeningAnalytics.ts
export interface FunnelSession {
  // ... الحقول الموجودة
  onFieldBlur?: (fieldId: string, value: unknown) => void; // ← جديد
}
```

**Bug 3: `intentId` — إضافة الـ field لـ `ConsultationIntent`** (مُغطى في المرحلة 2)

**الأثر:** يُصلح 3 silent bugs وظيفية

---

### المرحلة 8 — State Machine & Navigation Cleanup (الأولوية: منخفضة)

**التغييرات:**
- إضافة `export type ExtendedFlowPhase = ConsultationFlowPhase | null` في `consultationStateMachine.ts`
- إضافة `CONFIRMED: "/consultation/confirmation"` في `CONSULTATION_ROUTES`
- تسجيل `SlotSelectionPage` و`SpecialistSelectionPage` في `App.tsx`
- إصلاح `canExit` في `useConsultationFlow` ليستخدم `ConsultationFlowPhase` الكاملة
- إصلاح `as unknown as Record<string, unknown>` في `CancellationOrchestrator`

**الأثر:** يُصلح ~10 errors متبقية + يُكمل الـ routing

---

## ملخص الأولويات

| المرحلة | الأولوية | الأثر على TypeScript | الأثر الوظيفي |
|---|---|---|---|
| 7 (Silent Bugs) | 🔴 حرجة | 2 errors | data loss + runtime crashes |
| 1 (Type Foundation) | 🔴 حرجة | ~15 errors | Orchestrators لا تعمل |
| 3 (Router Migration) | 🔴 عالية | 4 errors | 4 صفحات لا تعمل |
| 4 (Orchestrator API) | 🟡 عالية | 5 errors | Reschedule/Cancel لا تعمل |
| 2 (Intent Contract) | 🟡 عالية | ~11 errors | ScreeningResult لا تعمل |
| 6 (Repository Dedup) | 🟡 متوسطة | 10 errors | خطر storage collision |
| 5 (framer-motion) | 🟢 متوسطة | 13 errors | UI فقط |
| 8 (State Machine) | 🟢 منخفضة | ~10 errors | navigation edge cases |

**إجمالي الـ errors المتوقع إصلاحها:** 70+ من أصل 76

---

## الخلاصة

المشروع يمتلك **تصميماً معمارياً سليماً** — الفصل بين `ConsultationIntent` (context) و`ConsultationFlowPhase` (runtime state) و`BookingPhase` (persistence state) هو قرار صحيح. المشكلة ليست في التصميم بل في **تسارع التنفيذ** الذي أفرز:

1. ملفات patch لم تُدمج في موعدها (Sprint 3.6)
2. Orchestrators كُتبت لـ API مخطط لم يُنفَّذ بعد
3. ملف repository قديم لم يُحذف بعد استبداله
4. Router مختلف (wouter) لكن 4 ملفات لا تزال تستورد من `react-router-dom`

الإصلاح ليس إعادة هيكلة — بل **إكمال ما بدأ**: دمج الـ patch files، مزامنة الـ Orchestrator APIs، وإصلاح الـ silent bugs الثلاثة.

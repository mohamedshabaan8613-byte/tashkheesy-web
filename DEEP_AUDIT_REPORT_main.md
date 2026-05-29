# Deep Code Audit Report — `main` branch
## tashkheesy-web | mohamedshabaan8613-byte/tashkheesy-web

**تاريخ الـ Audit:** 2026-05-29  
**الـ Branch المفحوص:** `main` (آخر commit على الجهاز المحلي)  
**إجمالي TypeScript Errors:** **76 error**  
**الملفات المفحوصة:** 119 ملف  
**المنهجية:** قراءة مباشرة للكود + `tsc --noEmit` + تتبع dependency chains  
**القيود:** قراءة فقط — لا تعديل، لا PR، لا merge، لا deploy.

---

## ملخص تنفيذي

المشروع يمر بمرحلة إعادة هيكلة طموحة تمتد من Sprint 3.0 إلى Sprint 3.7. الكود يحتوي على **طبقات معمارية متعددة** (Types → Repository → Orchestrator → Hook → Page) بُنيت بشكل متسارع، مما أفرز **76 TypeScript error** تتركز في 15 ملفاً. المشاكل ليست عشوائية — لها أنماط متكررة يمكن حلها بشكل منهجي.

**أخطر مشكلة وظيفية (silent data loss):** `updateRemoteChild()` في `accountData.ts` تُمرَّر `child.id` (وهو `local_child_id` من localStorage) بينما تبحث الدالة عن `id` (UUID من Supabase) — كل تحديث طفل يفشل صامتاً في Supabase منذ بداية المشروع.

---

## القسم الأول: خريطة الـ 76 Error حسب الملف

| الملف | عدد الـ Errors | النمط الرئيسي |
|---|---|---|
| `lib/consultationBookingRepository.ts` | **10** | Types مفقودة + interface mismatch |
| `pages/ScreeningResult.tsx` | **9** | `react-router-dom` + حقول مفقودة في `ConsultationIntent` |
| `pages/consultation/SpecialistSelectionPage.tsx` | **8** | `react-router-dom` + `.status` + type mismatch |
| `pages/consultation/SlotSelectionPage.tsx` | **8** | نفس أعلاه |
| `orchestrators/CancellationOrchestrator.ts` | **7** | `CANCELLABLE_PHASES` مفقود من import source |
| `components/WhyTashkheesy.tsx` | **7** | `ease: string` بدلاً من `Easing` literal |
| `components/screening/ScreeningResult.tsx` | **4** | Type narrowing + `"unknown"` غير موجود في union |
| `hooks/useRescheduleBooking.ts` | **3** | exports مفقودة من `RescheduleOrchestrator` |
| `hooks/useNavigationRecovery.ts` | **3** | `ExtendedFlowPhase` + `HydrationResult` mismatch |
| `components/TrustSignals.tsx` | **3** | نفس مشكلة `ease: string` |
| `utils/runtimeSafety.ts` | **2** | `intentId` مفقود من `ConsultationIntent` |
| `pages/BookingReviewPage.tsx` | **2** | غير محدد بعد |
| `hooks/useConsultationFlow.ts` | **2** | مقارنة `"SUCCESS"/"EXITED"` مع union لا يحتويها |
| `components/booking/RescheduleBookingModal.tsx` | **2** | exports مفقودة من `RescheduleOrchestrator` |
| `utils/bookingOwnership.ts` | **1** | `react-router-dom` |
| `types/consultationTypes.ts` | **1** | `../lib/assessmentTypes` غير موجود |

---

## القسم الثاني: تحليل الأنماط المتكررة

### النمط A — `react-router-dom` في مشروع يستخدم `wouter`
**الملفات المتأثرة:** `ScreeningResult.tsx`, `SlotSelectionPage.tsx`, `SpecialistSelectionPage.tsx`, `bookingOwnership.ts`  
**الجذر:** المشروع يستخدم `wouter@3.3.5` حصراً. أربعة ملفات كُتبت أو نُقلت من كودبيس آخر يستخدم `react-router-dom` ولم تُحدَّث imports.  
**الأثر:** هذه الملفات **لا تُبنى** — أي صفحة تستخدمها تنهار في runtime.

| الملف | الـ Hook المطلوب | البديل في `wouter` |
|---|---|---|
| `ScreeningResult.tsx` | `useNavigate` | `useLocation` + `setLocation` |
| `SlotSelectionPage.tsx` | `useNavigate`, `useSearchParams` | `useLocation`, `useSearch` |
| `SpecialistSelectionPage.tsx` | `useNavigate` | `useLocation` + `setLocation` |
| `bookingOwnership.ts` | `useNavigate` | `useLocation` + `setLocation` |

---

### النمط B — Types مفقودة في `consultationBookingTypes.ts`
**الملفات المتأثرة:** `consultationBookingRepository.ts`, `CancellationOrchestrator.ts`

`consultationBookingRepository.ts` يستورد من `consultationBookingTypes`:
```ts
import type { BookingInterruptionReason } from "../types/consultationBookingTypes";
import type { ConsultationEntryPoint }    from "../types/consultationBookingTypes";
import { BOOKING_RECOVERABLE_PHASES }     from "../types/consultationBookingTypes";
import { BOOKING_TERMINAL_PHASES }        from "../types/consultationBookingTypes";
```

**الواقع:**
- `BookingInterruptionReason` → غير موجود في `consultationBookingTypes.ts` (موجود في `consultationEntitlements.ts` باسم `BookingDenialReason`)
- `ConsultationEntryPoint` → موجود في `consultationTypes.ts` وليس في `consultationBookingTypes.ts`
- `BOOKING_RECOVERABLE_PHASES` → الاسم الصحيح هو `RECOVERABLE_PHASES`
- `BOOKING_TERMINAL_PHASES` → الاسم الصحيح هو `TERMINAL_PHASES`

`CancellationOrchestrator.ts` يستورد `CANCELLABLE_PHASES` من `consultationBookingTypes` لكنه موجود فقط في `consultationBookingTypesPatch.ts`.

---

### النمط C — Interface Mismatch في `consultationBookingRepository.ts`
ثلاثة mismatches داخل الملف نفسه:

1. **`wasRecovered` غير موجود في `BookingRecoveryState`:** الكود يكتب `{ wasRecovered: true }` لكن `BookingRecoveryState` لا تحتوي على هذا الحقل — الحقل الصحيح هو `status: "recovered"`.

2. **`recoveryAttempts` غير موجود في `BookingRecoveryState`:** الكود يقرأ `recoveryState.recoveryAttempts` لكن الـ interface لا يعرّفه.

3. **`ConsultationEntitlement` غير قابل للتعيين إلى `BookingEntitlementType`:** `ConsultationEntitlement` = `"FREE_CONSULTATION" | "PAID_CONSULTATION" | ...` بينما `BookingEntitlementType` = `"free_first_consultation" | "paid_consultation" | ...` — نفس المعنى لكن بـ naming convention مختلف.

---

### النمط D — Exports مفقودة من `RescheduleOrchestrator`
`useRescheduleBooking.ts` يطلب:
```ts
import { orchestrateReschedule, RescheduleFailureReason } from "../orchestrators/RescheduleOrchestrator";
```

`RescheduleBookingModal.tsx` يطلب:
```ts
import { isReschedulablePhase, getReschedulePolicyMessage } from "../../orchestrators/RescheduleOrchestrator";
```

**الواقع:** `RescheduleOrchestrator` يُصدِّر فقط:
- `RescheduleRejectionCode` (وليس `RescheduleFailureReason`)
- `RescheduleResult`
- `RescheduleDeps`
- `class RescheduleOrchestrator`

الدوال `orchestrateReschedule`, `isReschedulablePhase`, `getReschedulePolicyMessage` **غير موجودة** كـ named exports — الـ orchestrator يعمل عبر `new RescheduleOrchestrator(deps).execute(input)`.

---

### النمط E — `ease: string` في framer-motion Variants
**الملفات المتأثرة:** `WhyTashkheesy.tsx` (7 errors), `TrustSignals.tsx` (3 errors)

كلا الملفين يعرّفان variants بهذا الشكل:
```ts
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
  })
};
```

TypeScript يستنتج `ease` كـ `string` بدلاً من `"easeOut"` literal. الحل: `as const` أو `import type { Variants } from "framer-motion"` مع annotation صريح.

**ملاحظة:** هذا النمط موجود على `main` في كلا الملفين، وتم إصلاحه في `WhyTashkheesy.tsx` على branch `patch/hero-rebalancing-brand-clarity` لكن الإصلاح لم يُدمج بعد.

---

### النمط F — `ConsultationIntent` يفتقد حقولاً مطلوبة
**الملفات المتأثرة:** `ScreeningResult.tsx`, `runtimeSafety.ts`

الكود يصل إلى:
- `intent.intentId` — غير موجود في `ConsultationIntent`
- `intent.assessmentSessionId` — غير موجود في `ConsultationIntent`
- `intent.specialistRecommendation` — غير موجود في `ConsultationIntent`

**الواقع:** `ConsultationIntent` يحتوي فقط على: `entryPoint`, `assessmentResult`, `previousConsultationId`, `initiatedAt`, `confirmed`.

الحقول المطلوبة موجودة في `ConsultationBookingSession` وليس في `ConsultationIntent` — خلط معماري بين طبقتين.

---

### النمط G — `AssessmentResultPayload` يفتقد حقولاً
**الملف:** `components/screening/ScreeningResult.tsx`

الكود يصل إلى:
- `assessmentResult.severityLevel` — غير موجود (الحقل الصحيح هو `severity?: ResultSeverity`)
- `assessmentResult.summary` — غير موجود في `AssessmentResultPayload`

---

### النمط H — `ConsultationFlowPhase` لا تحتوي `"SUCCESS"` و`"EXITED"`
**الملف:** `hooks/useConsultationFlow.ts`

```ts
const canExit = useMemo(
  () => flowPhase !== "IDLE" && flowPhase !== "SUCCESS" && flowPhase !== "EXITED",
  [flowPhase]
);
```

`ConsultationFlowPhase` = `"IDLE" | "INTRO" | "BOOKING" | "SUCCESS" | "EXITED" | "ERROR"` — في الواقع `"SUCCESS"` و`"EXITED"` **موجودتان** في الـ type. الـ error هو TS2367 (unintentional comparison) لأن `flowPhase` في هذا السياق مُستنتج كـ `"BOOKING" | "INTRO"` فقط (بسبب `useMemo` الذي يُعيد فقط هاتين القيمتين). TypeScript يُحذّر أن المقارنة مع `"SUCCESS"` لن تكون صحيحة أبداً.

---

### النمط I — `ExtendedFlowPhase` غير مُصدَّر من `consultationStateMachine`
**الملف:** `hooks/useNavigationRecovery.ts`

```ts
import { type ExtendedFlowPhase } from "../lib/consultationStateMachine";
```

`consultationStateMachine.ts` لا يُصدِّر `ExtendedFlowPhase` — يُصدِّر فقط: `canTransition`, `TransitionResult`, `transition`, `getPhaseFromPath`, `getRecoveryPhase`, `resolveInitialPhase`.

---

### النمط J — `HydrationResult` غير قابل للتعيين إلى `ConsultationNavigationState`
**الملف:** `hooks/useNavigationRecovery.ts`

`HydrationResult` يحتوي على: `intent`, `source`, `wasRecovered`, `needsRecovery`, `failureReason`.  
`ConsultationNavigationState` يتطلب: `phase: ConsultationFlowPhase`, `intentSource`, `wasRecovered`, `previousPath?`.

الحقل `phase` غير موجود في `HydrationResult` — الـ hook يحاول تعيين نتيجة hydration مباشرة كـ navigation state.

---

### النمط K — `../lib/assessmentTypes` غير موجود
**الملف:** `types/consultationTypes.ts`

```ts
import type { PathType, AssessmentMode } from "../lib/assessmentTypes";
```

الملف الفعلي يقع في `client/src/components/screening/assessmentTypes.ts` — المسار خاطئ.

---

## القسم الثالث: المشاكل الوظيفية (Silent Bugs)

### 🔴 CRITICAL — Silent Data Loss في `updateRemoteChild`

**الملف:** `client/src/lib/accountData.ts:143`  
**الملف المستدعي:** `client/src/components/children/ChildrenPage.tsx:249`

```ts
// ChildrenPage.tsx:249
updateRemoteChild(childData.id, { ... });
//               ^^^^^^^^^^^
// childData.id = "child_1748123456_abc123" (local_child_id من localStorage)
```

```ts
// accountData.ts:153
.eq("id", remoteId)
//   ^^
// يبحث عن UUID من Supabase مثل "550e8400-e29b-41d4-a716-446655440000"
```

**الأثر:** كل تعديل على بيانات طفل يفشل صامتاً في Supabase لأن `child_1748123456_abc123` لا يطابق أي UUID في عمود `id`. التعديل يحدث محلياً فقط ويُفقد عند تسجيل الخروج أو تغيير الجهاز.

**الإصلاح:** تغيير `.eq("id", remoteId)` إلى `.eq("local_child_id", remoteId)` أو تمرير الـ UUID الحقيقي من `loadChildren()`.

---

### 🔴 HIGH — صفحتا Consultation غير مسجلتين في Router

**الملفات:** `pages/consultation/SlotSelectionPage.tsx`, `pages/consultation/SpecialistSelectionPage.tsx`

هذان الملفان موجودان في المشروع لكنهما **غير مسجلين في `App.tsx`**. لا يوجد `<Route>` يُوجّه إليهما. المستخدم لا يمكنه الوصول إليهما أبداً.

**الـ Routes الموجودة في `App.tsx`:**
- `CONSULTATION_ROUTES.START` → `ConsultationIntroPage`
- `CONSULTATION_ROUTES.BOOKING` → `ConsultationBookingPage`
- `CONSULTATION_ROUTES.REVIEW` → `BookingReviewPage`

`SlotSelectionPage` و`SpecialistSelectionPage` يبدو أنهما بديلان مخططان لـ `ConsultationBookingPage` لكن لم يُكتمل دمجهما.

---

### 🟡 MEDIUM — `sprint36M2CompleteIntegration.ts` — Dead Code

**الملف:** `client/src/lib/sprint36M2CompleteIntegration.ts`

ملف من 30 سطراً لا يُستورد من أي مكان في المشروع. يبدو أنه scaffold لـ Sprint 3.6 M2 لم يُكتمل.

---

### 🟡 MEDIUM — ملفان لـ Supabase Client

**الملفات:** `lib/supabase.ts` و`lib/supabaseClient.ts`

`supabase.ts` هو مجرد re-export من `supabaseClient.ts`. يُسبب ارتباكاً في الـ imports — بعض الملفات تستورد من `supabase` وبعضها من `supabaseClient`. يجب توحيدهما في ملف واحد.

---

### 🟡 MEDIUM — `onFieldBlur` غير موجود في `FunnelSession`

**الملف:** `components/screening/AssessmentForm.tsx:118`

```ts
funnelSession.onFieldBlur(fieldName);
```

`FunnelSession` في `screeningAnalytics.ts` لا تحتوي على method `onFieldBlur`. هذا يُسبب runtime error عند blur على أي حقل في نموذج التقييم.

---

### 🟡 MEDIUM — `consultationBookingTypesPatch.ts` لم يُدمج

**الملف:** `types/consultationBookingTypesPatch.ts`

الـ comment في الملف يقول:
> Sprint 3.6: merge this entire file into consultationBookingTypes.ts.

Sprint 3.6 مضى ووصلنا Sprint 3.7 لكن الدمج لم يحدث. `CANCELLABLE_PHASES` و`RESCHEDULABLE_PHASES` وغيرها موجودة في ملف patch منفصل مما يُسبب import confusion في `CancellationOrchestrator`.

---

## القسم الرابع: خطة الحل المرحلية

### المرحلة 1 — Type Foundation Repair (الأولوية القصوى)
**الهدف:** إزالة جميع الـ "missing export" و"wrong import path" errors.  
**الوقت المقدر:** 2-3 ساعات  
**الملفات:**

| المهمة | الملف | الإجراء |
|---|---|---|
| إصلاح `../lib/assessmentTypes` | `types/consultationTypes.ts:22` | تغيير المسار إلى `../components/screening/assessmentTypes` |
| دمج `consultationBookingTypesPatch.ts` | `types/consultationBookingTypes.ts` | نقل `CANCELLABLE_PHASES`, `RESCHEDULABLE_PHASES`, `BookingPhaseV2` إلى الملف الرئيسي |
| إضافة `BookingInterruptionReason` | `types/consultationBookingTypes.ts` | تعريف أو alias من `BookingDenialReason` |
| إضافة `BOOKING_RECOVERABLE_PHASES` alias | `types/consultationBookingTypes.ts` | `export const BOOKING_RECOVERABLE_PHASES = RECOVERABLE_PHASES` |
| إضافة `BOOKING_TERMINAL_PHASES` alias | `types/consultationBookingTypes.ts` | `export const BOOKING_TERMINAL_PHASES = TERMINAL_PHASES` |

---

### المرحلة 2 — Router Migration (react-router → wouter)
**الهدف:** إزالة `react-router-dom` imports من 4 ملفات.  
**الوقت المقدر:** 1-2 ساعات  
**الملفات:**

| الملف | التغيير |
|---|---|
| `pages/ScreeningResult.tsx` | `useNavigate` → `const [, setLocation] = useLocation()` |
| `pages/consultation/SlotSelectionPage.tsx` | `useNavigate` + `useSearchParams` → `useLocation` + `useSearch` |
| `pages/consultation/SpecialistSelectionPage.tsx` | `useNavigate` → `useLocation` |
| `utils/bookingOwnership.ts` | `useNavigate` → `useLocation` |

---

### المرحلة 3 — Interface Alignment
**الهدف:** إصلاح الـ interface mismatches في `consultationBookingRepository.ts`.  
**الوقت المقدر:** 1 ساعة  

| المشكلة | الإصلاح |
|---|---|
| `wasRecovered` في `BookingRecoveryState` | تغيير إلى `status: "recovered"` |
| `recoveryAttempts` في `BookingRecoveryState` | إضافة `recoveryAttempts?: number` للـ interface أو حذف الاستخدام |
| `ConsultationEntitlement` → `BookingEntitlementType` | إضافة mapping function أو توحيد الـ naming |

---

### المرحلة 4 — Orchestrator Exports Fix
**الهدف:** إصلاح الـ missing exports من `RescheduleOrchestrator`.  
**الوقت المقدر:** 1 ساعة  

| المطلوب | الإصلاح |
|---|---|
| `orchestrateReschedule` | إضافة wrapper function أو تحديث `useRescheduleBooking` لاستخدام `new RescheduleOrchestrator(deps).execute()` |
| `RescheduleFailureReason` | تغيير الـ import إلى `RescheduleRejectionCode` |
| `isReschedulablePhase` | نقل من `consultationBookingTypesPatch.ts` أو re-export من `RescheduleOrchestrator` |
| `getReschedulePolicyMessage` | إضافة helper function |

---

### المرحلة 5 — framer-motion Variants Fix
**الهدف:** إصلاح `ease: string` في `WhyTashkheesy.tsx` و`TrustSignals.tsx`.  
**الوقت المقدر:** 30 دقيقة  
**الإصلاح:** إضافة `import type { Variants } from "framer-motion"` وتعريف `const fadeUp: Variants = ...` مع `ease: "easeOut" as const`.

---

### المرحلة 6 — ConsultationIntent Contract Expansion
**الهدف:** إصلاح الحقول المفقودة في `ConsultationIntent`.  
**الوقت المقدر:** 1-2 ساعة  

**قرار معماري مطلوب:** هل `intentId`, `assessmentSessionId`, `specialistRecommendation` تنتمي لـ `ConsultationIntent` أم لـ `ConsultationBookingSession`؟

- إذا كانت تنتمي لـ `ConsultationIntent`: إضافتها للـ interface.
- إذا كانت تنتمي لـ `ConsultationBookingSession`: تحديث `ScreeningResult.tsx` لقراءتها من المصدر الصحيح.

---

### المرحلة 7 — Silent Bug Fixes (الأعلى أثراً على المستخدم)
**الهدف:** إصلاح المشاكل الوظيفية التي لا تُظهر errors لكن تُسبب data loss.  
**الوقت المقدر:** 2-3 ساعات  

| المشكلة | الإصلاح |
|---|---|
| `updateRemoteChild(childData.id)` | تمرير `remoteId` الحقيقي من `loadChildren()` أو تغيير `.eq("id")` إلى `.eq("local_child_id")` |
| `funnelSession.onFieldBlur` | إضافة method `onFieldBlur(fieldName: string): void` لـ `FunnelSession` |
| تسجيل `SlotSelectionPage` و`SpecialistSelectionPage` في Router | إضافة `<Route>` في `App.tsx` أو حذف الملفين إذا كانا مهجورين |

---

### المرحلة 8 — Cleanup
**الوقت المقدر:** 30 دقيقة  

| المهمة | الإجراء |
|---|---|
| حذف `sprint36M2CompleteIntegration.ts` | dead code لا يُستخدم |
| توحيد `supabase.ts` و`supabaseClient.ts` | الإبقاء على `supabaseClient.ts` وحذف `supabase.ts` أو العكس |
| `useConsultationFlow.ts` — `canExit` | إضافة `flowPhase` كـ `ConsultationFlowPhase` explicit أو تحديث المقارنة |

---

## القسم الخامس: الجدول الزمني المقترح

| المرحلة | الأولوية | الوقت | الأثر |
|---|---|---|---|
| 1 — Type Foundation | 🔴 فورية | 2-3 ساعات | يُزيل ~20 error |
| 2 — Router Migration | 🔴 فورية | 1-2 ساعات | يُزيل ~5 errors + يُصلح 3 صفحات |
| 3 — Interface Alignment | 🔴 فورية | 1 ساعة | يُزيل ~10 errors |
| 4 — Orchestrator Exports | 🟡 عالية | 1 ساعة | يُزيل ~5 errors |
| 5 — framer-motion Fix | 🟡 عالية | 30 دقيقة | يُزيل 10 errors |
| 6 — ConsultationIntent | 🟡 عالية | 1-2 ساعة | يُزيل ~11 errors |
| 7 — Silent Bugs | 🔴 فورية | 2-3 ساعات | يُصلح data loss |
| 8 — Cleanup | 🔵 منخفضة | 30 دقيقة | تنظيف |

**الإجمالي المتوقع:** 9-13 ساعة عمل لإيصال `tsc --noEmit` إلى 0 errors وإصلاح جميع المشاكل الوظيفية.

---

## القسم السادس: ملاحظات معمارية للمستقبل

**1. قاعدة الـ Patch Files:** `consultationBookingTypesPatch.ts` يجب أن يُدمج فوراً في نهاية كل sprint — الـ patch files تُسبب import confusion وتُصعّب الـ refactoring.

**2. قاعدة الـ Router:** أي ملف جديد يستخدم navigation يجب أن يستورد من `wouter` فقط. يُنصح بإضافة ESLint rule لمنع `import from "react-router-dom"`.

**3. قاعدة الـ Exports:** الـ Orchestrators يجب أن تُصدِّر إما class مع instance methods أو standalone functions — لا خلط بين النمطين.

**4. قاعدة الـ Type Naming:** `ConsultationEntitlement` و`BookingEntitlementType` يصفان نفس المفهوم بـ naming conventions مختلفة. يجب توحيدهما في Sprint 3.8.

**5. قاعدة الـ Dead Code:** أي ملف يحمل اسم sprint في اسمه (`sprint36M2CompleteIntegration.ts`) يجب حذفه أو دمجه فور انتهاء الـ sprint.

---

*هذا التقرير للقراءة والتخطيط فقط — لا تعديلات، لا PR، لا merge، لا deploy.*

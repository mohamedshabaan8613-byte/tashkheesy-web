# PHASE 0 — SYSTEM FREEZE + BASELINE RECOVERY
## Runtime Truth Map — Sprint 3.7.1

**Status:** READ-ONLY ANALYSIS — No code was modified, no PR created, no merge performed  
**Branch analyzed:** `main`  
**TypeScript errors at time of analysis:** 78 errors across 21 files  
**Generated:** 2026-05-29

---

## A. Runtime Ownership Map

This map identifies every layer that owns, reads, or mutates booking/consultation state at runtime.

### Layer 1 — Intent Authority
**Owner:** `client/src/contexts/ConsultationContext.tsx`  
**Storage key:** `"tashkheesy__consultation_intent"` (sessionStorage)  
**Reads:** `ConsultationProvider` on mount via `readIntentFromSession()` → `reconcileIntentWithUrl()`  
**Writes:** `setIntent()` callback → `useEffect` syncs to sessionStorage on every `intent` change  
**Clears:** `clearIntent()` callback → `clearIntentFromSession()` → `sessionStorage.removeItem(SESSION_STORAGE_KEY)`  
**Consumers:** `useConsultationContext()` hook → `ConsultationIntroPage`, `useNavigationRecovery`, `useConsultationFlow`, `runtimeSafety`  
**Collision risk:** `consultationHydration.ts` reads the **same key** `"tashkheesy__consultation_intent"` independently (line 65) — two readers on the same key, but only `ConsultationContext` writes. Read-only collision, not write collision.

### Layer 2 — Booking Session Authority
**Owner:** `client/src/repositories/ConsultationBookingRepository.ts` (singleton: `consultationBookingRepository`)  
**Storage keys:**
- `"tashkheesy:cbs:{sessionId}"` (sessionStorage) — per-session data
- `"tashkheesy:cbs_active_id"` (sessionStorage) — pointer to active session ID

**Reads:** `loadActive()` → reads `ACTIVE_KEY` first, then loads session by ID  
**Writes:** `save(session)` → writes to `"tashkheesy:cbs:{sessionId}"` + updates `ACTIVE_KEY`  
**Invalidates:** `invalidate(sessionId, reason)` → marks session as `INVALIDATED`, removes `ACTIVE_KEY`  
**Clears:** `clearAll()` → removes all `"tashkheesy:cbs:*"` keys + `ACTIVE_KEY`  
**Consumers:** `ConsultationBookingContext.tsx` (line 163) — **this is the only active consumer**

### Layer 3 — Dead Repository (Orphaned)
**File:** `client/src/lib/consultationBookingRepository.ts`  
**Storage key:** `"tashkheesy_booking_session_v1"` (sessionStorage)  
**Status:** **ORPHANED** — no file imports from this path (confirmed by grep: 0 results)  
**Risk:** If any future code accidentally imports from `../lib/consultationBookingRepository`, it will write to a **different key** than the active repository, creating a silent split-brain state.

### Layer 4 — Consultation Flow Phase Authority
**Owner:** `client/src/hooks/useConsultationFlow.ts`  
**Storage:** None — pure in-memory computation from `intent` state  
**Derives:** `flowPhase: ConsultationFlowPhase` from `intent.entryPoint` and `intent.confirmed`  
**Collision risk:** `intent.confirmed` is `@deprecated` per `consultationTypes.ts` line 140, but `useConsultationFlow` still reads it to compute `flowPhase`. The field has no setter in `ConsultationContext` — it can only be set if the intent object itself is replaced via `setIntent()`. This means `flowPhase` can never reach `"SUCCESS"` or `"EXITED"` through the current API.

### Layer 5 — Multi-Tab Sync Authority
**Owner:** `client/src/reliability/storageEventSync.ts`  
**Storage key:** `"tashkheesy:booking_sync"` (localStorage — cross-tab)  
**Writes:** `broadcastBookingUpdate(payload)` → `localStorage.setItem(BOOKING_SYNC_KEY, ...)`  
**Reads:** `onBookingUpdate(callback)` → `window.addEventListener("storage", ...)` — fires only in **other tabs**  
**Consumers:** Not yet wired to `ConsultationBookingContext` — declared but not integrated into the Provider mount lifecycle.

### Layer 6 — Anonymous Session Authority
**Owner:** `client/src/lib/anonymousSession.ts`  
**Storage key:** `"tashkheesy_anon_session_id"` (localStorage)  
**Purpose:** Tracks pre-auth funnel analytics  
**Collision risk:** None — isolated key, no overlap with booking session.

---

## B. Persistence Map

| Key | Storage Type | Owner File | Value Type | Written By | Read By | Status |
|---|---|---|---|---|---|---|
| `"tashkheesy__consultation_intent"` | sessionStorage | `ConsultationContext.tsx` | `ConsultationIntent` JSON | `ConsultationContext` only | `ConsultationContext`, `consultationHydration.ts` | ✅ Active |
| `"tashkheesy:cbs:{sessionId}"` | sessionStorage | `repositories/ConsultationBookingRepository.ts` | `ConsultationBookingSession` JSON | `ConsultationBookingRepository` only | `ConsultationBookingRepository` only | ✅ Active |
| `"tashkheesy:cbs_active_id"` | sessionStorage | `repositories/ConsultationBookingRepository.ts` | `string` (sessionId) | `ConsultationBookingRepository` only | `ConsultationBookingRepository` only | ✅ Active |
| `"tashkheesy_booking_session_v1"` | sessionStorage | `lib/consultationBookingRepository.ts` | `ConsultationBookingSession` JSON | `lib/consultationBookingRepository` | `lib/consultationBookingRepository` | 🔴 ORPHANED — no active consumers |
| `"tashkheesy:booking_sync"` | localStorage | `reliability/storageEventSync.ts` | `BookingSyncPayload` JSON | `broadcastBookingUpdate()` | `onBookingUpdate()` listener | 🟡 Declared, not wired to Provider |
| `"tashkheesy_anon_session_id"` | localStorage | `lib/anonymousSession.ts` | `string` (UUID) | `anonymousSession.ts` | `anonymousSession.ts` | ✅ Active, isolated |
| `"tashkheesy_children"` | localStorage | `components/children/ChildrenPage.tsx` | `Child[]` JSON | `ChildrenPage` | `ChildrenPage` | ✅ Active |
| `"tashkheesy_self_assessments"` | localStorage | `components/SelfAssessment.tsx`, `screening/assessmentContent.ts` | `SelfAssessment[]` JSON | Multiple writers | Multiple readers | 🟡 Duplicate constant definition |
| `"theme"` | localStorage | `contexts/ThemeContext.tsx` | `"light" \| "dark"` | `ThemeContext` | `ThemeContext` | ✅ Active |
| `result_{sessionId}` | localStorage | `lib/screeningResults.ts` | Assessment result JSON | `screeningResults.ts` | `screeningResults.ts`, `ScreeningResult.tsx` | ✅ Active |
| `child_profile_{childId}` | localStorage | `screeningResults.ts` | Child profile JSON | `screeningResults.ts` | `screeningResults.ts` | ✅ Active |

**Supabase Persistence (remote):**

| Table | Schema File | Repository | Status |
|---|---|---|---|
| `children` | `lib/accountData.ts` (RemoteChild) | `accountData.ts` directly | ✅ Active — but `updateRemoteChild` has silent bug (see Risk F) |
| `screening_analytics` | `lib/screeningAnalytics.ts` | `screeningAnalytics.ts` directly | ✅ Active |
| `consultation_bookings` | `types/bookingPersistenceTypes.ts` (AuthoritativeBookingRecord) | `IBookingPersistenceRepository` interface only | 🔴 NOT IMPLEMENTED — interface exists, no concrete class |
| `slot_reservations` | `types/bookingPersistenceTypes.ts` (SlotReservationRecord) | `IBookingPersistenceRepository` interface only | 🔴 NOT IMPLEMENTED |
| `booking_audit_log` | `types/bookingPersistenceTypes.ts` (BookingAuditEntry) | `IBookingPersistenceRepository` interface only | 🔴 NOT IMPLEMENTED |

---

## C. Hydration Flow Map

There are **three independent hydration entry points** operating on different data domains:

### Hydration Entry Point 1 — Intent Hydration
**File:** `client/src/contexts/ConsultationContext.tsx`  
**Trigger:** Provider mount — `useState(() => { ... })` initializer (synchronous, before first render)  
**Flow:**
```
ConsultationProvider mounts
  → readIntentFromSession()
      → sessionStorage.getItem("tashkheesy__consultation_intent")
  → reconcileIntentWithUrl(sessionIntent)
      → Priority 1: session intent if isIntentValid()
      → Priority 2: URL params (?from=assessment|follow_up)
      → Priority 3: direct_booking intent if on /consultation path
      → Priority 4: null
  → setIntentState(result.intent)
```
**Race condition risk:** None — synchronous initializer, runs once before render.

### Hydration Entry Point 2 — Booking Session Hydration (Provider)
**File:** `client/src/contexts/ConsultationBookingContext.tsx`  
**Trigger:** `useEffect` on mount (asynchronous, after first render) — guarded by `hydratedRef`  
**Flow:**
```
ConsultationBookingProvider mounts
  → useEffect fires (after render)
  → hydratedRef.current check (StrictMode double-fire guard)
  → dispatch({ type: "RECOVERY_STARTED" })
  → consultationBookingRepository.loadActive()
      → sessionStorage.getItem("tashkheesy:cbs_active_id")
      → sessionStorage.getItem("tashkheesy:cbs:{activeId}")
  → if session valid + not expired + phase in RECOVERABLE_PHASES:
      → save updated session with recoveryState
      → dispatch({ type: "SESSION_RECOVERED", session })
      → bookingEventBus.publish(BOOKING_RECOVERED event)
  → else:
      → if expired: consultationBookingRepository.invalidate()
      → dispatch({ type: "RECOVERY_FAILED" })
```
**Race condition risk:** `useEffect` fires after render — there is a window between first render and recovery completion where `state.session === null` and `state.isRecovering === true`. Pages using `useBookingSessionHydration` handle this via `status: "checking"` state.

### Hydration Entry Point 3 — Page-Level Session Hydration
**File:** `client/src/hooks/useBookingSessionHydration.ts`  
**Trigger:** Called by `SlotSelectionPage` and `SpecialistSelectionPage` on mount  
**Flow:**
```
Page mounts
  → useBookingSessionHydration(expectedPhases) called
  → reads session from ConsultationBookingContext (already hydrated by Provider)
  → useEffect: checks isRecovering → session → isSessionExpired → phase match
  → returns: { status: "checking"|"ready"|"stale"|"expired"|"missing", session, currentPhase, isPhaseValid }
```
**Note:** This is NOT an independent hydration — it reads from the Provider's already-hydrated state. It is a phase-validation layer, not a recovery layer.

### Hydration Entry Point 4 — Navigation Recovery Hydration
**File:** `client/src/hooks/useNavigationRecovery.ts`  
**Trigger:** `useEffect` on mount — reads sessionStorage directly via `hydrateConsultationIntent()`  
**Flow:**
```
useNavigationRecovery mounts
  → useEffect fires (once, guarded by didMountRef)
  → hydrateConsultationIntent(pathname, search)
      → sessionStorage.getItem("tashkheesy__consultation_intent")
  → getRecoveryPhase(hydration, pathname)
  → if wasRecovered || source === "url":
      → setRecoveryState({ wasRecovered: true, recoverySource: "refresh", currentPhase })
```
**Collision risk:** This reads `"tashkheesy__consultation_intent"` independently from `ConsultationContext`. Both read the same key but neither writes during this hook's lifecycle. However, if `ConsultationContext` clears the intent between mount and this `useEffect` firing, `useNavigationRecovery` will see stale data.

---

## D. Booking Authority Map

### Who can create a booking session?
**Authority:** `ConsultationBookingContext.startBookingSession()` (line ~450)  
**Flow:** UI → `startBookingSession(sourceIntentId)` → `consultationBookingRepository.save(newSession)` → `dispatch({ type: "SESSION_STARTED" })`  
**Constraint:** Only one active session at a time — `ACTIVE_KEY` is overwritten.

### Who can transition booking phase?
**Authority:** `ConsultationBookingContext.transitionTo(phase)` (line ~480)  
**Flow:** UI/Orchestrator → `transitionTo(phase)` → `isValidTransition(current, target)` check → `consultationBookingRepository.save(updatedSession)` → `dispatch({ type: "PHASE_TRANSITIONED" })` → `bookingEventBus.publish(BOOKING_PHASE_TRANSITIONED)`  
**Rule (from App.tsx comment):** "Phase mutations: `transitionTo()` عبر orchestrator فقط. UI → orchestrator → transitionTo() → domain event. لا تستدعي transitionTo() مباشرة من الـ UI."  
**Violation:** `BookingReviewPage.tsx` calls `transitionTo()` directly (line 192 area) — bypasses orchestrator rule.

### Who can cancel a booking?
**Authority:** `CancellationOrchestrator.orchestrateCancel(input, deps)` in `client/src/orchestrators/CancellationOrchestrator.ts`  
**Dependency injection:** Requires `{ transitionTo, supabase? }` — `supabase` is optional  
**Supabase client:** Creates its own via `createClient()` directly (line 46) — **does NOT use the singleton** from `lib/supabase.ts`  
**Consumer:** Not yet wired to any UI component (no grep results for `orchestrateCancel` in pages/hooks)

### Who can reschedule a booking?
**Authority:** `RescheduleOrchestrator.execute(input)` — class method  
**Consumer:** `useRescheduleBooking.ts` imports `orchestrateReschedule` (named function export) — **this export does not exist** in `RescheduleOrchestrator.ts`  
**Actual export:** Only `class RescheduleOrchestrator { async execute() }` is exported  
**Result:** `useRescheduleBooking` will fail to compile — confirmed by TypeScript errors

### Who can expire a booking?
**Authority:** `ConsultationBookingContext` — expiration polling `useEffect` (Provider-level)  
**Trigger:** Interval check every N seconds — calls `expireBooking()` if `isSessionExpired(session)`  
**Also:** `consultationBookingRepository.invalidate(sessionId, reason)` can be called directly

---

## E. Repository Dependency Map

```
ConsultationBookingContext.tsx
  └── imports: repositories/ConsultationBookingRepository.ts (singleton)
      └── storage: sessionStorage["tashkheesy:cbs:{id}"] + sessionStorage["tashkheesy:cbs_active_id"]

useNavigationRecovery.ts
  └── imports: lib/consultationHydration.ts
      └── reads: sessionStorage["tashkheesy__consultation_intent"]

ConsultationContext.tsx
  └── reads/writes: sessionStorage["tashkheesy__consultation_intent"] directly

CancellationOrchestrator.ts
  └── imports: @supabase/supabase-js createClient() DIRECTLY ← violation of supabase.ts authority rule
  └── imports: types/consultationBookingTypes.ts → CANCELLABLE_PHASES ← does NOT exist there
  └── imports: reliability/storageEventSync.ts → broadcastBookingUpdate
  └── imports: types/bookingDomainEvents.ts → bookingEventBus

RescheduleOrchestrator.ts
  └── exports: class RescheduleOrchestrator { execute() }
  └── NO named export: orchestrateReschedule ← useRescheduleBooking expects this

useRescheduleBooking.ts
  └── imports: orchestrateReschedule from orchestrators/RescheduleOrchestrator ← DOES NOT EXIST

lib/consultationBookingRepository.ts
  └── storage: sessionStorage["tashkheesy_booking_session_v1"]
  └── consumers: NONE (orphaned)

IBookingPersistenceRepository (interface in bookingPersistenceTypes.ts)
  └── implementation: NOT FOUND — no class implements this interface
  └── tables: consultation_bookings, slot_reservations, booking_audit_log ← NOT CREATED in Supabase
```

---

## F. Risk Collision Report

### COLLISION-1: Dual sessionStorage Namespace for Booking Sessions
**Files:** `repositories/ConsultationBookingRepository.ts` vs `lib/consultationBookingRepository.ts`  
**Key A:** `"tashkheesy:cbs:{sessionId}"` + `"tashkheesy:cbs_active_id"` (active)  
**Key B:** `"tashkheesy_booking_session_v1"` (orphaned)  
**Current state:** Key B has no active writers or readers — orphaned. No collision today.  
**Future risk:** If any developer imports from `lib/consultationBookingRepository` (wrong path), they will write to Key B while the Provider reads Key A → silent split-brain, session appears missing.

### COLLISION-2: Intent Hydration Race Between ConsultationContext and useNavigationRecovery
**Files:** `ConsultationContext.tsx` (synchronous mount) vs `useNavigationRecovery.ts` (useEffect)  
**Scenario:** User refreshes on `/consultation/booking`. ConsultationContext reads intent synchronously. `useNavigationRecovery` fires its `useEffect` later and reads the same key. If `ConsultationContext` has already cleared the intent (e.g., TTL expired), `useNavigationRecovery` reads stale/empty data and incorrectly sets `wasRecovered: false`.  
**Severity:** Medium — causes navigation recovery to silently fail on refresh.

### COLLISION-3: transitionTo() Called Directly from UI (Bypasses Orchestrator Rule)
**File:** `client/src/pages/BookingReviewPage.tsx` (line 192)  
**Rule violated:** App.tsx comment: "لا تستدعي transitionTo() مباشرة من الـ UI"  
**Impact:** Phase transition happens without domain event being published → `bookingEventBus` subscribers (MultiTabRealtimeSync, NotificationQueueService) do not receive the event → multi-tab sync breaks silently.

### COLLISION-4: CancellationOrchestrator Creates Own Supabase Client
**File:** `client/src/orchestrators/CancellationOrchestrator.ts` (line 46)  
**Violation:** `import { createClient } from "@supabase/supabase-js"` — bypasses `lib/supabase.ts` singleton  
**Impact:** A second Supabase client instance is created with raw env vars. If env vars are missing (which they are in dev without `.env`), this client uses placeholder credentials → all Supabase calls from `CancellationOrchestrator` fail silently.

### COLLISION-5: CANCELLABLE_PHASES Missing from consultationBookingTypes.ts
**File:** `client/src/orchestrators/CancellationOrchestrator.ts` (line 41)  
**Imports:** `CANCELLABLE_PHASES` from `../types/consultationBookingTypes`  
**Reality:** `CANCELLABLE_PHASES` exists only in `consultationBookingTypesPatch.ts` — NOT in `consultationBookingTypes.ts`  
**Impact:** TypeScript error TS2305 — `CancellationOrchestrator` cannot compile.

### COLLISION-6: orchestrateReschedule Named Export Missing
**File:** `client/src/orchestrators/RescheduleOrchestrator.ts`  
**Expected by:** `useRescheduleBooking.ts` (line 28): `import { orchestrateReschedule, ... }`  
**Reality:** Only `class RescheduleOrchestrator { execute() }` is exported  
**Impact:** TypeScript error TS2305 — `useRescheduleBooking` cannot compile → reschedule feature is entirely non-functional.

### COLLISION-7: CONSULTATION_ROUTES.CONFIRMED Missing
**File:** `client/src/constants/consultationRoutes.ts`  
**Expected by:** `BookingReviewPage.tsx` (line 192): `navigate(CONSULTATION_ROUTES.CONFIRMED, ...)`  
**Reality:** `CONSULTATION_ROUTES` only has `START`, `BOOKING`, `REVIEW` — no `CONFIRMED`  
**Impact:** TypeScript error TS2339 at compile time + runtime navigation dead-end: after booking confirmation, user cannot proceed to confirmation page.

### COLLISION-8: updateRemoteChild Receives local_child_id Instead of Supabase UUID
**File:** `client/src/components/children/ChildrenPage.tsx` (line 249)  
**Call:** `updateRemoteChild(childData.id, { ... })`  
**`childData.id` value:** Set by `remoteToLocal()` (line 107): `id: (r.local_child_id || r.id)` — prefers `local_child_id`  
**`updateRemoteChild` expects:** Supabase UUID (`.eq("id", remoteId)` — matches `id` column, not `local_child_id`)  
**Impact:** Every child update call hits `.eq("id", "local-uuid-format")` which never matches the Supabase `id` column → 0 rows updated → silent data loss. `deleteRemoteChild` correctly uses `local_child_id` (`.eq("local_child_id", ...)`), but `updateRemoteChild` does not.

### COLLISION-9: FunnelSession.onFieldBlur() Does Not Exist
**File:** `client/src/components/screening/AssessmentForm.tsx` (line 118)  
**Call:** `funnelSession.onFieldBlur(fieldName)`  
**Reality:** `FunnelSession` class in `screeningAnalytics.ts` has: `onHesitation()`, `onHistoryView()`, `attachRealSessionId()`, `getTimeOnForm()` — NO `onFieldBlur()` method  
**Impact:** `TypeError: funnelSession.onFieldBlur is not a function` on every form field blur event in the assessment flow.

### COLLISION-10: ExtendedFlowPhase Not Exported from consultationStateMachine
**File:** `client/src/lib/consultationStateMachine.ts`  
**Expected by:** `useNavigationRecovery.ts` (line 28): `import { ..., type ExtendedFlowPhase } from "../lib/consultationStateMachine"`  
**Reality:** `consultationStateMachine.ts` exports `ConsultationFlowPhase` (imported from `consultationTypes.ts`) but never defines or exports `ExtendedFlowPhase`  
**Impact:** TypeScript error TS2305 — `useNavigationRecovery` cannot compile.

### COLLISION-11: SlotSelectionPage and SpecialistSelectionPage Use react-router-dom
**Files:** `client/src/pages/consultation/SlotSelectionPage.tsx` (line 25), `client/src/pages/consultation/SpecialistSelectionPage.tsx` (line 26)  
**Import:** `import { useNavigate, useSearchParams } from "react-router-dom"`  
**Reality:** Project uses `wouter` — `react-router-dom` is not installed  
**Impact:** TypeScript error TS2307 + runtime crash on page load. These pages are also **not registered in App.tsx router** (only `START`, `BOOKING`, `REVIEW` routes exist).

### COLLISION-12: bookingOwnership.ts Uses react-router-dom
**File:** `client/src/utils/bookingOwnership.ts` (line 31)  
**Import:** `import { useNavigate } from "react-router-dom"`  
**Impact:** TypeScript error TS2307 — this utility is imported by both `SlotSelectionPage` and `SpecialistSelectionPage`, compounding the crash.

---

## G. Critical Runtime Risk List

Ranked by severity (data loss > crash > silent failure > degraded UX):

| Rank | Risk | Severity | Type | File |
|---|---|---|---|---|
| 1 | `updateRemoteChild` silent data loss — all child updates fail in Supabase | 🔴 CRITICAL | Silent Data Loss | `ChildrenPage.tsx:249` |
| 2 | `consultation_bookings` table not implemented — no authoritative persistence | 🔴 CRITICAL | Missing Implementation | `bookingPersistenceTypes.ts` |
| 3 | `FunnelSession.onFieldBlur()` does not exist — TypeError on every assessment blur | 🔴 CRITICAL | Runtime Crash | `AssessmentForm.tsx:118` |
| 4 | `CONSULTATION_ROUTES.CONFIRMED` missing — booking funnel dead-end after confirmation | 🔴 CRITICAL | Navigation Dead-End | `BookingReviewPage.tsx:192` |
| 5 | `orchestrateReschedule` export missing — reschedule feature entirely non-functional | 🔴 CRITICAL | Compile Error + Feature Dead | `RescheduleOrchestrator.ts` |
| 6 | `CANCELLABLE_PHASES` import missing — CancellationOrchestrator cannot compile | 🔴 CRITICAL | Compile Error | `CancellationOrchestrator.ts:41` |
| 7 | `SlotSelectionPage` + `SpecialistSelectionPage` use react-router-dom + not in router | 🔴 CRITICAL | Runtime Crash + Unreachable | `SlotSelectionPage.tsx`, `SpecialistSelectionPage.tsx` |
| 8 | `transitionTo()` called directly from `BookingReviewPage` — bypasses orchestrator rule | 🟡 HIGH | Architecture Violation | `BookingReviewPage.tsx` |
| 9 | `CancellationOrchestrator` creates own Supabase client — ignores singleton | 🟡 HIGH | Silent Failure | `CancellationOrchestrator.ts:46` |
| 10 | `ExtendedFlowPhase` not exported — `useNavigationRecovery` cannot compile | 🟡 HIGH | Compile Error | `consultationStateMachine.ts` |
| 11 | `intent.intentId` always undefined — `runtimeSafetyCheck` `hasIntentMismatch` always false | 🟡 HIGH | Safety Check Disabled | `runtimeSafety.ts:88` |
| 12 | `lib/consultationBookingRepository.ts` orphaned — future import risk | 🟢 MEDIUM | Latent Risk | `lib/consultationBookingRepository.ts` |
| 13 | `storageEventSync` not wired to Provider — multi-tab sync declared but inactive | 🟢 MEDIUM | Feature Not Active | `storageEventSync.ts` |
| 14 | `SELF_ASSESSMENTS_KEY` defined in two files with same value | 🟢 LOW | Duplication | `SelfAssessment.tsx`, `assessmentContent.ts` |

---

## H. Safe Recovery Order

The following order minimizes regression risk. Each phase is independent of the next unless noted.

### Phase R0 — Freeze Verification (NOW — no code changes)
- Confirm branch is `main`, no uncommitted changes
- Record exact error count: **78 TypeScript errors**
- Record exact storage keys in use (documented above in Map B)
- **Dependency:** None — this is the baseline

### Phase R1 — Silent Bug: updateRemoteChild (HIGHEST PRIORITY — data loss)
**File:** `client/src/components/children/ChildrenPage.tsx:249`  
**Fix:** Change `updateRemoteChild(childData.id, ...)` to pass the Supabase UUID, not `local_child_id`  
**Safe approach:** Add a `supabaseId` field to the `Child` interface populated from `r.id` (Supabase UUID), keep `id` as `local_child_id` for localStorage. Pass `childData.supabaseId` to `updateRemoteChild`.  
**Dependency:** None — isolated change  
**Expected errors fixed:** 0 TypeScript errors (this is a runtime bug, not a type error)

### Phase R2 — Type Foundation: Merge consultationBookingTypesPatch into consultationBookingTypes
**File:** `client/src/types/consultationBookingTypesPatch.ts` → merge into `client/src/types/consultationBookingTypes.ts`  
**Exports to add:** `CANCELLABLE_PHASES`, `RESCHEDULABLE_PHASES`, `BookingPhaseV2`, `EXPANDED_TRANSITIONS_V2`, `isValidTransitionV2`, `isCancellingPhase`, `isReschedulingPhase`, `isCancelledOrCancelling`, `isReschedulablePhase`, `isCancellablePhase`, `getExpandedCancellablePhases`, `getExpandedReschedulablePhases`  
**Dependency:** Must complete before R3 (CancellationOrchestrator fix)  
**Expected errors fixed:** ~17

### Phase R3 — Orchestrator API Alignment
**Sub-task A:** Add `orchestrateReschedule` named export to `RescheduleOrchestrator.ts` as a wrapper around `new RescheduleOrchestrator().execute()`  
**Sub-task B:** Fix `CancellationOrchestrator.ts` to import from `lib/supabase.ts` singleton instead of `createClient()` directly  
**Dependency:** R2 must complete first (CANCELLABLE_PHASES needed)  
**Expected errors fixed:** ~8

### Phase R4 — Router Migration: react-router-dom → wouter
**Files:** `SlotSelectionPage.tsx`, `SpecialistSelectionPage.tsx`, `bookingOwnership.ts`  
**Fix:** Replace `useNavigate` with `useLocation` from `wouter`, replace `useSearchParams` with manual `URLSearchParams(window.location.search)`  
**Also:** Register `SlotSelectionPage` and `SpecialistSelectionPage` routes in `App.tsx`  
**Dependency:** None — isolated  
**Expected errors fixed:** ~25

### Phase R5 — CONSULTATION_ROUTES.CONFIRMED
**File:** `client/src/constants/consultationRoutes.ts`  
**Fix:** Add `CONFIRMED: "/consultation/confirmed"` to the routes object  
**Also:** Create `ConsultationConfirmedPage` component and register route in `App.tsx`  
**Dependency:** None — isolated  
**Expected errors fixed:** ~3

### Phase R6 — ConsultationIntent Contract: Add intentId
**File:** `client/src/types/consultationTypes.ts` — `ConsultationIntent` interface  
**Fix:** Add `intentId?: string` field (optional, UUID generated on intent creation)  
**Also:** Update `ConsultationContext.setIntent()` to auto-generate `intentId` via `crypto.randomUUID()` if not provided  
**Dependency:** None — additive change  
**Expected errors fixed:** ~11

### Phase R7 — ExtendedFlowPhase Export
**File:** `client/src/lib/consultationStateMachine.ts`  
**Fix:** Export `type ExtendedFlowPhase = ConsultationFlowPhase | "BOOKING" | "INTRO"` or alias to `ConsultationFlowPhase`  
**Dependency:** None — isolated  
**Expected errors fixed:** ~3

### Phase R8 — FunnelSession.onFieldBlur() Method
**File:** `client/src/lib/screeningAnalytics.ts` — `FunnelSession` class  
**Fix:** Add `onFieldBlur(fieldName: string): void { /* no-op or analytics */ }` method  
**Dependency:** None — isolated  
**Expected errors fixed:** 0 TypeScript errors (runtime bug — method call on existing class)

### Phase R9 — Supabase Persistence Implementation (Sprint 3.3 Phase 2 — deferred)
**Files to create:** `repositories/ConsultationBookingSupabaseRepository.ts` implementing `IBookingPersistenceRepository`  
**Tables to create in Supabase:** `consultation_bookings`, `slot_reservations`, `booking_audit_log`  
**Dependency:** R2, R3 must complete first  
**Note:** This is the largest phase — deferred to a dedicated sprint after R1-R8 stabilize the runtime.

### Phase R10 — Dead Code Removal
**File:** `client/src/lib/consultationBookingRepository.ts`  
**Action:** Delete or mark as `@deprecated` with explicit comment  
**Dependency:** Must be last — confirm no imports exist before deletion  
**Expected errors fixed:** ~10 (the TypeScript errors in this file disappear when it's removed from compilation)

---

## Summary Table

| Map | Key Finding |
|---|---|
| A — Runtime Ownership | 6 layers; 2 repositories for booking sessions (1 active, 1 orphaned) |
| B — Persistence | 11 storage keys; 3 Supabase tables defined but not implemented |
| C — Hydration | 4 entry points; potential race between ConsultationContext and useNavigationRecovery |
| D — Booking Authority | transitionTo() called directly from UI — bypasses orchestrator rule |
| E — Repository Dependency | CancellationOrchestrator creates own Supabase client; RescheduleOrchestrator API mismatch |
| F — Risk Collisions | 12 collision points identified; 4 are silent (no TypeScript error, runtime failure only) |
| G — Critical Risks | 14 risks ranked; top 3 are data loss + missing implementation + runtime crash |
| H — Recovery Order | 10 phases; R1 (data loss) first, R9 (Supabase persistence) last |

**Total TypeScript errors at baseline:** 78  
**Expected after R1-R10:** 0  
**Silent runtime bugs fixed by R1-R10:** 4 (updateRemoteChild, onFieldBlur, CONFIRMED route, runtimeSafety intentId)

# TRACK 2.2 — TRANSITION API AUDIT REPORT

**Tashkheesy Platform — Sprint 3.7.1**
**Mode:** Transition Governance Audit Mode (AUDIT ONLY — no code changes)
**Date:** 2026-05-29

---

## 1. API Ownership Map

### Canonical Owner

Both `advancePhase` and `transitionTo` are **exclusively owned** by `ConsultationBookingContext.tsx`. They are defined, implemented, and exported from a single file:

```
client/src/contexts/ConsultationBookingContext.tsx
```

### Authority Boundaries

`transitionTo` is the **canonical mutation authority** for `bookingFlowPhase`. It is the single source of truth for all lifecycle phase changes, as declared in the file's module-level documentation:

> `transitionTo() = مصدر وحيد لتغيير lifecycle phase`

`advancePhase` is a **deprecated compatibility alias** that delegates entirely to `transitionTo`. It was preserved for backward compatibility with existing callers and was scheduled for removal in Sprint 3.4 (now overdue).

### Dependency Chain

```
ConsultationBookingContext
  └── transitionTo()         ← canonical mutation authority
        ├── isValidTransition()    ← validation
        ├── consultationBookingRepository.save()  ← persistence
        ├── dispatch({ type: "PHASE_TRANSITIONED" })  ← React state
        └── bookingEventBus.publish(BOOKING_PHASE_TRANSITIONED)  ← domain event
  └── advancePhase()         ← deprecated alias
        └── transitionTo(to, "orchestrator")  ← full delegation
```

### Runtime Callers

| Caller | API Used | File | Line |
|---|---|---|---|
| `SpecialistSelectionPage` | `advancePhase` | `pages/consultation/SpecialistSelectionPage.tsx` | 278 |
| `SlotSelectionPage` | `advancePhase` | `pages/consultation/SlotSelectionPage.tsx` | 255 |
| `BookingConfirmationOrchestrator` | `transitionTo` (dep-injected) | `orchestrators/BookingConfirmationOrchestrator.ts` | 59, 77, 90, 106, 162, 178 |
| `CancellationOrchestrator` | `transitionTo` (dep-injected) | `orchestrators/CancellationOrchestrator.ts` | 232 |
| `useCancelBooking` | `transitionTo` (dep-injected to orchestrator) | `hooks/useCancelBooking.ts` | 72 |
| `useRescheduleBooking` | `transitionTo` (dep-injected to orchestrator) | `hooks/useRescheduleBooking.ts` | 75 |
| `BookingReviewPage` | `transitionTo` (dep-injected to orchestrator) | `pages/BookingReviewPage.tsx` | 188 |

---

## 2. Implementation Comparison

### Exact Implementation

```typescript
// transitionTo — CANONICAL (ConsultationBookingContext.tsx:460)
const transitionTo = useCallback(
  (
    to: BookingPhase,
    triggeredBy: "orchestrator" | "recovery" | "expiration" = "orchestrator",
  ): boolean => {
    const current = sessionRef.current;
    if (!current) return false;
    const from = current.bookingFlowPhase;
    if (!isValidTransition(from, to)) {
      console.warn(`[BookingCtx] Invalid transition: ${from} → ${to}`);
      return false;
    }
    const updated: ConsultationBookingSession = {
      ...current,
      bookingFlowPhase: to,
      bookingStatus: to,
      lastActivityAt: new Date().toISOString(),
    };
    consultationBookingRepository.save(updated);
    dispatch({ type: "PHASE_TRANSITIONED", phase: to, session: updated });
    bookingEventBus.publish(transitionEvent);  // BOOKING_PHASE_TRANSITIONED
    return true;
  },
  [],
);

// advancePhase — DEPRECATED ALIAS (ConsultationBookingContext.tsx:500)
const advancePhase = useCallback(
  (to: BookingPhase): boolean => transitionTo(to, "orchestrator"),
  [transitionTo],
);
```

### Behavioral Comparison

| Behavior | `transitionTo` | `advancePhase` |
|---|---|---|
| **Sync/Async** | Synchronous | Synchronous (delegates to transitionTo) |
| **Validation** | `isValidTransition(from, to)` — enforced | Identical — same validation via delegation |
| **Transition guards** | `ALLOWED_TRANSITIONS` map | Identical — same guards via delegation |
| **Persistence** | `consultationBookingRepository.save()` | Identical — same persistence via delegation |
| **React state dispatch** | `dispatch({ type: "PHASE_TRANSITIONED" })` | Identical — same dispatch via delegation |
| **Domain event** | `bookingEventBus.publish(BOOKING_PHASE_TRANSITIONED)` | Identical — same event via delegation |
| **`triggeredBy` parameter** | Accepts `"orchestrator" \| "recovery" \| "expiration"` | Hardcoded to `"orchestrator"` |
| **Hydration interaction** | None — no hydration state mutation | Identical — none |
| **Telemetry** | `triggeredBy` field in domain event | Always `"orchestrator"` — no caller identity |
| **Error handling** | Returns `false` on invalid transition + `console.warn` | Identical — same error handling via delegation |
| **Deprecation status** | **Canonical — active** | **`@deprecated` — scheduled for Sprint 3.4 removal** |

### Critical Finding

`advancePhase === transitionTo` **semantically and behaviorally**, with one exception: `advancePhase` always passes `triggeredBy: "orchestrator"` regardless of the actual caller identity. This means that when a UI component calls `advancePhase`, the domain event records `triggeredBy: "orchestrator"` — which is **semantically incorrect** (the actual caller is the UI, not an orchestrator).

---

## 3. Transition Authority Matrix

| Domain | `advancePhase` | `transitionTo` |
|---|---|---|
| **Canonical owner** | `ConsultationBookingContext` (deprecated alias) | `ConsultationBookingContext` (canonical) |
| **Mutation authority** | Delegated — not authoritative | **Authoritative** — single source of truth |
| **Validation source** | `isValidTransition()` via delegation | `isValidTransition()` — direct |
| **Hydration interaction** | None | None |
| **Persistence interaction** | `sessionStorage` via `consultationBookingRepository.save()` — via delegation | `sessionStorage` via `consultationBookingRepository.save()` — direct |
| **Orchestration dependency** | None — UI calls directly (governance violation) | Intended: dep-injected from orchestrators |
| **Routing interaction** | None — caller handles navigation | None — caller handles navigation |
| **Async behavior** | Synchronous | Synchronous |
| **Telemetry** | `triggeredBy: "orchestrator"` (hardcoded — inaccurate) | `triggeredBy` reflects actual caller |
| **Deprecation status** | `@deprecated` — Sprint 3.4 removal target | **Active canonical API** |

---

## 4. Mutation Governance Findings

### Finding MG-1: Direct UI Mutations (P3 — Governance Debt)

Both `SpecialistSelectionPage` and `SlotSelectionPage` call `advancePhase()` directly from UI event handlers, bypassing the declared mutation rule:

```
Declared rule:  UI → orchestrator → transitionTo
Actual runtime: UI → advancePhase → transitionTo  (orchestrator skipped)
```

This is a **governance violation** documented in the codebase itself. The comment in `ConsultationBookingContext.tsx` line 70 states: `transitionTo() لا تُستدعى من الـ UI مباشرة`. Using `advancePhase` instead of `transitionTo` does not resolve this violation — both bypass the orchestrator layer.

**Severity:** P3 — Transitional governance debt. No runtime corruption risk because `isValidTransition()` guards against invalid transitions. The domain event records `triggeredBy: "orchestrator"` which is semantically incorrect but does not affect runtime behavior.

### Finding MG-2: Deprecated API Overdue Removal (P4 — Informational)

`advancePhase` was scheduled for removal in Sprint 3.4 per the codebase comment. It is now Sprint 3.7.1 — **3 sprints overdue**. The 2 remaining callsites (`SpecialistSelectionPage` and `SlotSelectionPage`) prevent removal.

**Severity:** P4 — Informational. No runtime impact.

### Finding MG-3: `triggeredBy` Telemetry Inaccuracy (P4 — Informational)

When UI calls `advancePhase`, the domain event `BOOKING_PHASE_TRANSITIONED` records `triggeredBy: "orchestrator"`. This is semantically incorrect — the actual caller is the UI layer. Future telemetry analysis may misattribute these transitions to orchestrator-initiated flows.

**Severity:** P4 — Informational. No runtime impact.

### Finding MG-4: Orchestrator Callsites Use Correct API (COMPLIANT)

`BookingConfirmationOrchestrator`, `CancellationOrchestrator`, `useCancelBooking`, `useRescheduleBooking`, and `BookingReviewPage` all use `transitionTo` via dep-injection — **fully compliant** with the declared mutation rule.

---

## 5. Hydration + Persistence Findings

### Hydration Interaction

Neither `transitionTo` nor `advancePhase` directly mutates hydration state. The hydration lifecycle is managed exclusively by `useBookingSessionHydration()`, which reads from `session.bookingFlowPhase` via the React state managed by `ConsultationBookingContext`. When `transitionTo` calls `dispatch({ type: "PHASE_TRANSITIONED" })`, the React state update propagates to `useBookingSessionHydration` on the next render — this is the only hydration interaction, and it is **safe and synchronous**.

**No async race conditions** exist between `transitionTo` and hydration because:
1. `transitionTo` is synchronous
2. `consultationBookingRepository.save()` writes to `sessionStorage` synchronously
3. React state dispatch is batched — hydration re-evaluates on next render

**No stale closure risks** because `transitionTo` reads `sessionRef.current` (a ref, not state) — immune to stale closure issues.

### Persistence Interaction

`consultationBookingRepository.save()` writes to `sessionStorage` synchronously. The storage key is `${STORAGE_KEY}:${session.sessionId}`. No async operations, no race conditions, no timing differences between `advancePhase` and `transitionTo` (identical persistence path via delegation).

**No persistence synchronization risk** between the two APIs.

### `BOOKING_PHASE_TRANSITIONED` Event Subscribers

No runtime hooks subscribe to `BOOKING_PHASE_TRANSITIONED` from `bookingEventBus`. The event is published but only consumed by test files (`bookingConfirmation.test.ts`). This means there are no hidden hydration or persistence side-effects triggered by the domain event.

---

## 6. Migration Readiness Verdict

```
PARTIAL MIGRATION ONLY
```

**Reasoning:**

The migration from `advancePhase` to `transitionTo` is **technically safe** — the two APIs are behaviorally identical (full delegation). However, a simple API swap (`advancePhase` → `transitionTo`) does not resolve the underlying **governance violation**: both `SpecialistSelectionPage` and `SlotSelectionPage` call the mutation API directly from the UI, bypassing the orchestrator layer.

A **complete governance-compliant migration** requires:
1. Creating `SpecialistSelectionOrchestrator` and `SlotSelectionOrchestrator` (or equivalent orchestrator functions)
2. Moving `advancePhase`/`transitionTo` calls into these orchestrators
3. Dep-injecting `transitionTo` into the orchestrators
4. UI pages call orchestrators, not `transitionTo` directly

This is **TRACK 2.3 — Mutation Governance Recovery** work, not a simple API rename.

A **partial migration** (API swap only, without orchestrator introduction) is safe from a runtime perspective but leaves the governance violation in place and changes `triggeredBy` telemetry from `"orchestrator"` (inaccurate but harmless) to the correct value.

---

## 7. Recommended Next Track

```
TRACK 2.3 — Mutation Governance Recovery
```

**Reasoning:** The audit reveals that the primary unresolved issue is not the API itself (both are behaviorally equivalent) but the **governance violation**: UI components calling phase mutation APIs directly without going through orchestrators. TRACK 2.3 should focus on introducing lightweight orchestrator functions for `SPECIALIST_SELECTION → SLOT_SELECTION` and `SLOT_SELECTION → REVIEW` transitions, then migrating the UI callsites to use these orchestrators. This resolves the governance violation, enables accurate `triggeredBy` telemetry, and allows `advancePhase` removal.

---

## 8. Runtime Severity Classification

| Finding | ID | Severity | Classification |
|---|---|---|---|
| Direct UI mutations bypassing orchestrator | MG-1 | **P3** | Transitional governance debt |
| `advancePhase` overdue removal | MG-2 | P4 | Informational only |
| `triggeredBy` telemetry inaccuracy | MG-3 | P4 | Informational only |
| Orchestrator callsites compliant | MG-4 | — | COMPLIANT |
| Hydration interaction | — | — | SAFE |
| Persistence interaction | — | — | SAFE |
| Async race risk | — | — | NONE |
| Stale closure risk | — | — | NONE |

---

## 9. Final Audit Gate

```
TRACK 2.2 PASSED
```

**Conditions met:**
- ✅ Canonical mutation authority identified: `transitionTo` in `ConsultationBookingContext`
- ✅ `advancePhase === transitionTo` confirmed: full delegation, identical behavior
- ✅ Migration safety classified: PARTIAL MIGRATION ONLY (API swap safe; governance fix requires TRACK 2.3)
- ✅ Semantic governance preserved: no hidden authority drift, no ambiguous ownership
- ✅ No code changes introduced: AUDIT ONLY — no runtime modifications
- ✅ No behavioral changes: AUDIT ONLY
- ✅ No authority changes: AUDIT ONLY
- ✅ No persistence changes: AUDIT ONLY
- ✅ No hydration changes: AUDIT ONLY

---

*Report generated: TRACK 2.2 — Sprint 3.7.1 — Tashkheesy Platform*

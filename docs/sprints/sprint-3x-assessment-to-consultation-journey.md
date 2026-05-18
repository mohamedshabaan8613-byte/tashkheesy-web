# Sprint 3.x — Assessment-to-Consultation Journey

## Overview

This document is the official architecture specification for Sprint 3.x. It defines the multi-epic program that transforms the product from a feature-based experience into an assessment-driven care journey, where users who complete an assessment are guided into the correct consultation path without losing intent continuity.

The work is split into three sequenced Epics so that architecture, state, persistence, entitlement logic, and intelligent matching do not become entangled too early. This improves engineering safety, rollout clarity, and the ability to measure outcomes incrementally in production.

**Governing Principle:** Assessment should enrich booking, not own booking.

---

## Program Structure

| Sprint / Epic | Name | Scope |
|---|---|---|
| Sprint 3.0 / Epic 1 | Contextual Journey Foundation | Context transport, routing, continuity, CTA, orchestration |
| Sprint 3.1 / Epic 2 | Entitlement System | Eligibility, free consultation redemption, abuse prevention |
| Sprint 3.2 / Epic 3 | Intelligent Consultation Layer | Specialist matching, recommendation logic, retention, upsell |

---

## Epic 1 — Contextual Journey Foundation

The only implementation target for Sprint 3.0. Establishes journey continuity and context-aware routing without introducing business-rule complexity.

### In Scope

| Component | Included |
|---|---|
| `ConsultationContext` model | ✅ |
| `useConsultationFlow()` hook | ✅ |
| Contextual routes | ✅ |
| Result → consultation → booking continuity | ✅ |
| Back navigation continuity | ✅ |
| Contextual CTA | ✅ |
| State persistence strategy | ✅ |
| Recovery behavior | ✅ |
| Consultation transition analytics events | ✅ |
| Entitlement logic | ❌ Epic 2 |
| Specialist matching | ❌ Epic 3 |
| Upsell / retention | ❌ Epic 3 |

### Target Outcome

A user who completes an assessment moves into consultation booking through a dedicated contextual path that preserves intent, return path, and emotional continuity — without being dropped into the generic booking landing experience.

### Child Issues (Epic 1)

1. Define `ConsultationContext` contract
2. Implement `useConsultationFlow()`
3. Add contextual consultation routes
4. Add result → consultation → booking continuity
5. Add back navigation continuity
6. Add state persistence strategy
7. Add recovery behavior for refresh / redirect
8. Add consultation transition analytics events

---

## Epic 2 — Entitlement System

Begins only after Epic 1 is stable in production. Adds controlled business policy around free introductory consultation eligibility and redemption.

### In Scope

- `consultation_entitlements` table
- Eligibility resolution
- Free consultation logic
- Redemption tracking
- Abuse prevention rules

### Out of Scope

- Specialist intelligence
- Recommendation engines
- Retention programs
- Upsell systems

---

## Epic 3 — Intelligent Consultation Layer

Extends a proven journey and entitlement base. Makes the consultation journey smarter and more commercially effective.

### In Scope

- Specialist matching
- Recommendation logic
- Follow-up suggestions
- Upsell surfaces
- Retention loops

---

## Architecture Boundaries

| Layer | Responsibility |
|---|---|
| Assessment | Produces clinical context and result metadata |
| ConsultationContext | Transports user intent and journey state |
| Booking Engine | Schedules appointments and manages booking lifecycle |
| Entitlement System | Resolves eligibility and redemption truth |
| Analytics Layer | Tracks journey behavior and conversion events |

---

## Context Model

```ts
type ConsultationContext = {
  source:
    | "direct_booking"
    | "assessment_result"
    | "followup"
    | "dashboard"
    | "referral"
    | "campaign";

  assessmentId?: string;
  resultId?: string;
  assessmentType?: "learning" | "adhd";

  recommendedSpecialistType?: string;
  returnPath?: string;

  entitlementPreview?: {
    type: "free_intro";
    eligible?: boolean;
    used?: boolean;
  };
};
```

In Epic 1, this object carries journey context only. It is not the source of truth for entitlement or booking persistence.

---

## Routing Strategy

| Route | Role |
|---|---|
| `/booking` | Generic booking entry |
| `/consultation/start` | Context-aware consultation entry |
| `/consultation/free-intro` | Entitlement-driven free intro path (Epic 2) |
| `/consultation/followup` | Returning or follow-up journey |

Epic 1 implements only the routes needed for contextual journey continuity.

---

## `useConsultationFlow()` Contract

### Responsibilities (Epic 1)

- Resolve source context from route and state
- Build or hydrate `ConsultationContext`
- Decide the correct consultation entry route
- Provide safe back navigation targets
- Expose CTA state for result pages
- Emit analytics metadata for journey actions

### Non-Responsibilities in Epic 1

- Final entitlement decisions
- Specialist recommendation scoring
- Paid upsell logic
- Retention campaigns

---

## State Persistence Strategy

| Data Type | Storage Layer | Reason |
|---|---|---|
| Routing state | URL | Shareable, inspectable, route-safe navigation context |
| Transient flow state | Zustand or React Context | Fast client orchestration during active flow |
| Entitlement truth | Database | Authoritative source of eligibility and redemption |
| Analytics metadata | Database | Durable measurement and attribution |
| Navigation continuity | `sessionStorage` | Survives in-session navigation and back behavior |
| Recovery snapshot | `localStorage` optional | Helps resume interrupted journeys |

---

## Recovery Strategy

**Rule:** short-lived continuity lives in `sessionStorage`, durable business truth lives in the database, optional recovery assistance lives in `localStorage`.

| Event | Expected Behavior |
|---|---|
| Refresh during active flow | Rebuild `ConsultationContext` from URL + `sessionStorage` |
| Tab close / reopen in same session | Resume from `sessionStorage` if valid |
| Login redirect | Restore intent from URL and persisted recovery snapshot |
| External redirect return | Reconcile route context with booking state from DB |
| Mobile browser kill | Attempt recovery from optional `localStorage` snapshot |

---

## Product Flows

### Flow A — Direct Booking
```
Home → Booking Landing → Service Selection → Specialist Selection → Booking Form → Success
```

### Flow B — Assessment Contextual Journey
```
Assessment → Result Page → Consultation Intro → Contextual Booking → Specialist Selection → Booking Form → Success
```

### Flow C — Returning User
```
Dashboard → Previous Results → Continue Consultation → Booking / Follow-up
```

### Flow D — Follow-up / Other Sources
```
Referral / Campaign Entry → Booking Entry → Booking Lifecycle
```

All flows converge on the same booking engine but enter through different orchestration and context layers.

---

## Analytics Events (Epic 1)

| Event | Trigger |
|---|---|
| `consultation_journey_started` | User enters `/consultation/start` |
| `consultation_cta_clicked` | User clicks CTA on result page |
| `consultation_context_resolved` | `useConsultationFlow()` resolves source |
| `consultation_route_selected` | Contextual route is determined |
| `consultation_booking_entered` | User enters contextual booking form |
| `consultation_abandoned` | User exits without completing booking |
| `consultation_booked` | Booking confirmed from contextual journey |

---

## UX Principles

- The consultation CTA must feel like a natural next step, not an interruption.
- Every journey entry point must have a defined and reliable return path.
- Context loss (dropping to generic booking) is a product failure, not a fallback.
- Recovery from interruption should be invisible to the user.
- Consultation framing must reflect the specific assessment type and result.

---

## Implementation Order

```
Epic 1 (Sprint 3.0)
  1. ConsultationContext type definition
  2. useConsultationFlow() hook skeleton
  3. /consultation/start route
  4. Result page CTA integration
  5. Back navigation continuity
  6. State persistence (sessionStorage layer)
  7. Recovery behavior
  8. Analytics events

Epic 2 (Sprint 3.1) — begins after Epic 1 is stable in production
Epic 3 (Sprint 3.2) — begins after Epic 2 is stable in production
```

---

## What Not to Build Yet

- Free consultation flow (Epic 2)
- Entitlement redemption (Epic 2)
- Specialist auto-matching (Epic 3)
- Upsell flows (Epic 3)
- Retention campaigns (Epic 3)

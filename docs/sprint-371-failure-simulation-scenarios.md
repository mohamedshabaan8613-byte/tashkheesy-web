# Sprint 3.7.1 — Failure Simulation Scenarios

> Phase 5: Production-failure validation coverage documentation.
> These scenarios are validated by the integration test suite and this audit.

---

## 1. WebSocket Disconnect During Realtime Sync

**Trigger:** Supabase Realtime channel loses WebSocket connection mid-subscription.

**Expected behavior:**
- `MultiTabRealtimeSync` channel status transitions to `CLOSED`.
- `useRealtimeBookingSync` detects channel status change and calls `forceRefresh()`.
- Authoritative state fetched from DB on reconnect.
- `StaleSessionBanner` displays until version confirmed current.

**Validated by:** `realtimeSynchronization.integration.test.ts` Scenario 6 (Reconnect after cleanup).

---

## 2. DB Connection Interruption During RPC

**Trigger:** Network interruption between client and Supabase during `atomic_reschedule` RPC execution.

**Expected behavior:**
- Supabase client returns network error to `TransactionalReservationRepository`.
- RPC transaction either fully committed or fully rolled back by Postgres (never partial).
- Repository returns `{ success: false, failureReason: 'NETWORK_ERROR' }`.
- `RescheduleOrchestrator` transitions to `RESCHEDULE_FAILED` state.
- No slot mutation persists if RPC did not commit.

**Guaranteed by:** Postgres `BEGIN/COMMIT` semantics — interrupted connection = automatic `ROLLBACK`.

---

## 3. Stale lifecycle_version During RPC

**Trigger:** Client fires `atomic_reschedule` with `client_version = N` but DB has `lifecycle_version = N+1`.

**Expected behavior:**
- RPC detects mismatch inside transaction and raises `STALE_VERSION` exception.
- Transaction rolls back automatically.
- RPC returns `{ success: false, failureReason: 'STALE_VERSION', serverVersion: N+1 }`.
- Client receives server version and triggers authoritative refresh.

**Validated by:** `atomicReschedule.integration.test.ts` Scenario 3.

---

## 4. Rapid Duplicate Submissions

**Trigger:** User double-clicks the reschedule confirm button, firing two concurrent RPC calls with the same `client_version`.

**Expected behavior:**
- Both calls reach the RPC concurrently.
- `FOR UPDATE` row lock on `consultations` ensures only one proceeds.
- First to acquire lock commits; second detects `lifecycle_version` mismatch inside lock and returns `STALE_VERSION`.
- Exactly one reschedule persists. No duplicate slot mutations.

**Validated by:** `atomicReschedule.integration.test.ts` Scenario 8 (Concurrent mutation rejection).

**UI prevention:** `RescheduleOrchestrator` also sets a `RESCHEDULING` state before calling the repository, preventing the second click from reaching the orchestrator at all.

---

## 5. Simultaneous Reservation Conflicts (Two Users, Same Slot)

**Trigger:** Two different users attempt to reschedule to the same `new_slot_id` simultaneously.

**Expected behavior:**
- `SELECT ... FOR UPDATE SKIP LOCKED` on `consultation_slots` inside the RPC.
- First transaction acquires lock and proceeds.
- Second transaction gets `SLOT_UNAVAILABLE` because the slot is locked/reserved.
- No double-booking possible.

**Guaranteed by:** RPC's `SKIP LOCKED` pattern + `status = 'AVAILABLE'` check inside the atomic block.

---

## 6. Retry Behavior After Reconnect

**Trigger:** Realtime channel disconnects and reconnects.

**Expected behavior:**
- `MultiTabRealtimeSync.subscribe()` called again after `cleanup()`.
- Fresh channel subscription established.
- No memory leak from previous channel.
- `useRealtimeBookingSync` calls `forceRefresh()` on reconnect to re-sync state.

**Validated by:** `realtimeSynchronization.integration.test.ts` Scenario 6.

---

## 7. Forced Rollback After Partial Mutation Attempt

**Trigger:** RPC executes step 1 (reserve new slot) but fails at step 2 (release old slot) due to constraint violation.

**Expected behavior:**
- Postgres `EXCEPTION` block in RPC catches the error.
- Full transaction `ROLLBACK` — step 1 mutation is undone.
- New slot returns to `AVAILABLE`. Old slot remains `RESERVED`.
- RPC returns failure code.
- No orphan reservations.

**Guaranteed by:** `EXCEPTION WHEN OTHERS THEN RAISE` pattern in `012_atomic_reschedule_transaction.sql`.

---

## 8. Expired Session During Transaction

**Trigger:** Auth token expires between UI action and RPC call.

**Expected behavior:**
- Supabase returns 401 before the RPC is executed.
- `TransactionalReservationRepository` propagates auth error.
- Orchestrator transitions to `AUTH_ERROR` state.
- No DB mutation occurs.

**Mitigation:** Auth token refresh should be attempted before any booking mutation — this is a pre-condition enforced at the hook level, not inside the transaction.

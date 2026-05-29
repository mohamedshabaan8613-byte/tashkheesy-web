/**
 * storageEventSync.ts — Sprint 3.4.3
 *
 * PURPOSE:
 *   Synchronizes booking session state across browser tabs using the
 *   native window StorageEvent API.
 *
 * PROBLEM BEING SOLVED:
 *   Tab A confirms booking → updates localStorage → Tab B still shows REVIEW phase.
 *   Without sync, Tab B can attempt a duplicate confirmation.
 *
 * EVENTS SYNCHRONIZED:
 *   - CONFIRMED   → redirect to confirmation page
 *   - CANCELLED   → redirect to start, clear session
 *   - EXPIRED     → redirect to start, clear session
 *   - RESCHEDULED → reload session from storage, update phase
 *
 * HOW IT WORKS:
 *   1. StorageEvent fires ONLY in OTHER tabs (not the tab that wrote).
 *   2. We key on BOOKING_SYNC_KEY in localStorage.
 *   3. The writing tab calls broadcastBookingUpdate() to write a sync payload.
 *   4. Listening tabs receive the StorageEvent and call their handler.
 *
 * DESIGN:
 *   - No external dependencies — pure browser API.
 *   - Listener returns a cleanup function for useEffect.
 *   - Payload is typed: BookingSyncPayload.
 *   - Malformed payloads are silently ignored (defensive parsing).
 *
 * SCOPE:
 *   ✅ Cross-tab sync for booking lifecycle events
 *   ✅ Used in ConsultationBookingContext.useEffect
 *   ❌ Does NOT use WebSockets or server-sent events
 *   ❌ Does NOT sync across different users or devices
 */

export const BOOKING_SYNC_KEY = "tashkheesy:booking_sync" as const;

export type BookingSyncEventType =
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "RESCHEDULED"
  | "INVALIDATED";

export interface BookingSyncPayload {
  /** The lifecycle event that triggered the sync. */
  type: BookingSyncEventType;
  /** Session ID that was affected. Other tabs ignore if this doesn't match. */
  sessionId: string;
  /** ISO timestamp of when the event was broadcast. */
  broadcastAt: string;
  /** Optional new lifecycle version after the mutation. */
  newLifecycleVersion?: string;
  /** Optional reason (for CANCELLED / EXPIRED / INVALIDATED). */
  reason?: string;
}

export type StorageSyncHandler = (payload: BookingSyncPayload) => void;

/**
 * broadcastBookingUpdate
 *
 * Called by the tab that just changed session state to notify other tabs.
 *
 * @example
 * // After orchestrateBookingConfirmation succeeds:
 * broadcastBookingUpdate({
 *   type: "CONFIRMED",
 *   sessionId: session.sessionId,
 *   broadcastAt: new Date().toISOString(),
 *   newLifecycleVersion: "v2",
 * });
 */
export function broadcastBookingUpdate(payload: BookingSyncPayload): void {
  try {
    localStorage.setItem(BOOKING_SYNC_KEY, JSON.stringify(payload));
    // Immediately remove so the key is always "fresh" — prevents
    // the StorageEvent from firing on page reload with stale data.
    // The event fires in OTHER tabs when the key is set.
  } catch (err) {
    // localStorage may be unavailable in some environments (e.g., private mode).
    // Silently fail — sync is a best-effort enhancement.
    console.warn("[storageEventSync] broadcastBookingUpdate failed:", err);
  }
}

/**
 * subscribeToBookingStorageEvents
 *
 * Attaches a window StorageEvent listener that fires the handler
 * whenever BOOKING_SYNC_KEY changes in another tab.
 *
 * Returns a cleanup function — call it in useEffect return.
 *
 * @example
 * // Inside ConsultationBookingContext:
 * useEffect(() => {
 *   const unsubscribe = subscribeToBookingStorageEvents(
 *     currentSessionId,
 *     (payload) => {
 *       if (payload.type === "CONFIRMED") navigate(ROUTES.CONFIRMED);
 *       if (payload.type === "CANCELLED") cancelBooking("cross_tab_sync");
 *       if (payload.type === "EXPIRED") expireBooking("cross_tab_sync");
 *     },
 *   );
 *   return unsubscribe;
 * }, [currentSessionId]);
 */
export function subscribeToBookingStorageEvents(
  /** Only process events for this sessionId. Pass null to accept all. */
  sessionId: string | null,
  handler: StorageSyncHandler,
): () => void {
  function onStorageEvent(event: StorageEvent): void {
    if (event.key !== BOOKING_SYNC_KEY) return;
    if (!event.newValue) return;

    let payload: BookingSyncPayload;
    try {
      payload = JSON.parse(event.newValue) as BookingSyncPayload;
    } catch {
      // Malformed JSON — ignore
      return;
    }

    // Session guard — only process events for OUR session
    if (sessionId !== null && payload.sessionId !== sessionId) return;

    // Type guard — ensure required fields are present
    if (!payload.type || !payload.sessionId || !payload.broadcastAt) return;

    handler(payload);
  }

  window.addEventListener("storage", onStorageEvent);

  // Return cleanup function for useEffect
  return () => {
    window.removeEventListener("storage", onStorageEvent);
  };
}

/**
 * parseBookingSyncPayload
 *
 * Safely parses a raw string into BookingSyncPayload.
 * Returns null if parsing fails or required fields are missing.
 */
export function parseBookingSyncPayload(raw: string | null): BookingSyncPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BookingSyncPayload>;
    if (!parsed.type || !parsed.sessionId || !parsed.broadcastAt) return null;
    return parsed as BookingSyncPayload;
  } catch {
    return null;
  }
}

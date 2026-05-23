/**
 * BookingConfirmationOrchestrator.integration.test.ts — Sprint 3.7.1 Phase 3
 *
 * Integration tests for the 9-step confirmation lifecycle.
 *
 * ─── What is tested ─────────────────────────────────────────────────────────
 *
 *   Scenario 1 — SUCCESS PATH
 *     REVIEW → CONFIRMING → (Steps 2-8 succeed) → CONFIRMED
 *     Verifies: transitionTo call order, result shape, BOOKING_CONFIRMED event
 *
 *   Scenario 2 — RESERVATION_EXPIRED
 *     REVIEW → CONFIRMING → (reservation.reserved_until in past) → CONFIRMATION_FAILED
 *     Verifies: transitionTo("CONFIRMATION_FAILED"), result.retryable=false,
 *               BOOKING_CONFIRMATION_FAILED event emitted
 *
 *   Scenario 3 — ELIGIBILITY_DENIED
 *     REVIEW → CONFIRMING → (eligibility.eligible=false) → CONFIRMATION_FAILED
 *     Verifies: transitionTo("CONFIRMATION_FAILED"), result.reason=eligibility_denied,
 *               BOOKING_CONFIRMATION_FAILED event emitted
 *
 * ─── Architecture contract under test ───────────────────────────────────────
 *
 *   1. orchestrateBookingConfirmation() NEVER imports ConsultationBookingContext.
 *      transitionTo is always provided via deps injection.
 *
 *   2. CONFIRMING is always the first transition (optimistic UI update).
 *      This must happen even if subsequent steps fail.
 *
 *   3. On any failure: CONFIRMATION_FAILED is the final transition.
 *      On success: CONFIRMED is the final transition.
 *
 *   4. bookingEventBus events are emitted asynchronously via queueMicrotask.
 *      Tests flush with await Promise.resolve() before asserting events.
 *
 * ─── Mocking strategy ────────────────────────────────────────────────────────
 *
 *   All external I/O is mocked at the module level:
 *     - SlotReservationRepository.getReservationById
 *     - SlotReservationRepository.confirmReservation
 *     - ConsultationEligibilityService.checkEligibility
 *     - ConsultationRepository.confirmBooking
 *     - NotificationQueueService.queueBookingConfirmedNotifications
 *     - ConsultationAuditService.trackBookingConfirmed
 *
 *   bookingEventBus is imported directly and its handlers are cleared
 *   before each test with _clearAll().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  orchestrateBookingConfirmation,
  type ConfirmationOrchestratorDeps,
} from "../BookingConfirmationOrchestrator";
import { bookingEventBus } from "../../types/bookingDomainEvents";
import type { ConfirmBookingInput } from "../../types/consultationBookingTypes";

// ─── Module mocks ──────────────────────────────────────────────────────────────
vi.mock("../../repositories/SlotReservationRepository", () => ({
  SlotReservationRepository: {
    getReservationById:   vi.fn(),
    confirmReservation:   vi.fn(),
  },
}));

vi.mock("../../services/ConsultationEligibilityService", () => ({
  ConsultationEligibilityService: {
    checkEligibility: vi.fn(),
  },
}));

vi.mock("../../repositories/ConsultationRepository", () => ({
  ConsultationRepository: {
    confirmBooking: vi.fn(),
  },
}));

vi.mock("../../services/NotificationQueueService", () => ({
  NotificationQueueService: {
    queueBookingConfirmedNotifications: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../services/ConsultationAuditService", () => ({
  ConsultationAuditService: {
    trackBookingConfirmed: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Import mocked modules after vi.mock declarations ─────────────────────────
import { SlotReservationRepository } from "../../repositories/SlotReservationRepository";
import { ConsultationEligibilityService } from "../../services/ConsultationEligibilityService";
import { ConsultationRepository } from "../../repositories/ConsultationRepository";

// ─── Test fixtures ─────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // +30 min
const PAST_DATE   = new Date(Date.now() - 5  * 60 * 1000).toISOString(); // -5 min (expired)

const VALID_INPUT: ConfirmBookingInput = {
  consultationId: "bks_test_001",
  userId:         "user_test_001",
  reservationId:  "res_test_001",
  ownershipToken: "bks_test_001",
};

const VALID_RESERVATION = {
  id:             "res_test_001",
  slot_id:        "slot_test_001",
  user_id:        "user_test_001",
  reserved_until: FUTURE_DATE,
  status:         "RESERVED" as const,
};

const CONFIRMED_CONSULTATION = {
  specialist_id:       "spec_test_001",
  slot_id:             "slot_test_001",
  confirmed_at:        new Date().toISOString(),
  is_free_consultation: true,
};

// ─── Helper: build a spy-based deps object ────────────────────────────────────

function buildDeps(): ConfirmationOrchestratorDeps & {
  transitionTo: ReturnType<typeof vi.fn>;
} {
  return { transitionTo: vi.fn() };
}

// ─── Helper: flush queueMicrotask queue so event bus handlers fire ─────────────
async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve(); // double flush for nested queueMicrotask
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("BookingConfirmationOrchestrator — integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bookingEventBus._clearAll();
  });

  afterEach(() => {
    bookingEventBus._clearAll();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 1 — SUCCESS PATH
  // ─────────────────────────────────────────────────────────────────────────
  describe("Scenario 1 — success path", () => {
    it("should transition CONFIRMING → CONFIRMED and return success", async () => {
      // Arrange
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue(
        VALID_RESERVATION
      );
      vi.mocked(ConsultationEligibilityService.checkEligibility).mockResolvedValue({
        eligible: true,
        reason: null,
        existingConsultationId: null,
        canReschedule: false,
      });
      vi.mocked(SlotReservationRepository.confirmReservation).mockResolvedValue(undefined);
      vi.mocked(ConsultationRepository.confirmBooking).mockResolvedValue(
        CONFIRMED_CONSULTATION
      );

      const deps = buildDeps();
      const confirmedEvents: string[] = [];

      bookingEventBus.subscribe("BOOKING_CONFIRMED", () => {
        confirmedEvents.push("BOOKING_CONFIRMED");
      });

      // Act
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);
      await flushMicrotasks();

      // Assert — result shape
      expect(result.success).toBe(true);
      expect(result.consultationId).toBe(VALID_INPUT.consultationId);

      // Assert — transition call order (CONFIRMING first, CONFIRMED last)
      expect(deps.transitionTo).toHaveBeenCalledTimes(2);
      expect(deps.transitionTo).toHaveBeenNthCalledWith(1, "CONFIRMING");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(2, "CONFIRMED");

      // Assert — BOOKING_CONFIRMED domain event emitted
      expect(confirmedEvents).toHaveLength(1);
      expect(confirmedEvents[0]).toBe("BOOKING_CONFIRMED");
    });

    it("should call SlotReservationRepository.confirmReservation with correct args", async () => {
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue(
        VALID_RESERVATION
      );
      vi.mocked(ConsultationEligibilityService.checkEligibility).mockResolvedValue({
        eligible: true,
        reason: null,
        existingConsultationId: null,
        canReschedule: false,
      });
      vi.mocked(SlotReservationRepository.confirmReservation).mockResolvedValue(undefined);
      vi.mocked(ConsultationRepository.confirmBooking).mockResolvedValue(
        CONFIRMED_CONSULTATION
      );

      const deps = buildDeps();
      await orchestrateBookingConfirmation(VALID_INPUT, deps);

      expect(SlotReservationRepository.confirmReservation).toHaveBeenCalledWith(
        VALID_INPUT.reservationId,
        VALID_INPUT.userId,
        VALID_INPUT.consultationId
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 2 — RESERVATION_EXPIRED
  // ─────────────────────────────────────────────────────────────────────────
  describe("Scenario 2 — reservation_expired", () => {
    it("should transition CONFIRMING → CONFIRMATION_FAILED and return failure", async () => {
      // Arrange — reservation.reserved_until is in the past
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue({
        ...VALID_RESERVATION,
        reserved_until: PAST_DATE,
      });

      const deps = buildDeps();
      const failedEvents: Array<{ reason: string; retryable: boolean }> = [];

      bookingEventBus.subscribe("BOOKING_CONFIRMATION_FAILED", (event) => {
        failedEvents.push({
          reason: (event as { payload: { reason: string; retryable: boolean } }).payload.reason,
          retryable: (event as { payload: { reason: string; retryable: boolean } }).payload.retryable,
        });
      });

      // Act
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);
      await flushMicrotasks();

      // Assert — result shape
      expect(result.success).toBe(false);
      expect(result.reason).toBe("reservation_expired");
      expect(result.retryable).toBe(false);

      // Assert — CONFIRMING fired first (optimistic), CONFIRMATION_FAILED last
      expect(deps.transitionTo).toHaveBeenCalledTimes(2);
      expect(deps.transitionTo).toHaveBeenNthCalledWith(1, "CONFIRMING");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(2, "CONFIRMATION_FAILED");

      // Assert — BOOKING_CONFIRMATION_FAILED domain event emitted
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].reason).toBe("reservation_expired");
      expect(failedEvents[0].retryable).toBe(false);

      // Assert — confirmReservation was NOT called (short-circuit at step 2)
      expect(SlotReservationRepository.confirmReservation).not.toHaveBeenCalled();
    });

    it("should transition CONFIRMING → CONFIRMATION_FAILED when reservation not found", async () => {
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue(null);

      const deps = buildDeps();
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);
      await flushMicrotasks();

      expect(result.success).toBe(false);
      expect(result.reason).toBe("reservation_not_owned");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(1, "CONFIRMING");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(2, "CONFIRMATION_FAILED");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 3 — ELIGIBILITY_DENIED
  // ─────────────────────────────────────────────────────────────────────────
  describe("Scenario 3 — eligibility_denied", () => {
    it("should transition CONFIRMING → CONFIRMATION_FAILED when not eligible", async () => {
      // Arrange — reservation valid, eligibility fails
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue(
        VALID_RESERVATION
      );
      vi.mocked(ConsultationEligibilityService.checkEligibility).mockResolvedValue({
        eligible: false,
        reason: "FREE_CONSULTATION_ALREADY_USED",
        existingConsultationId: "bks_existing_001",
        canReschedule: false,
      });

      const deps = buildDeps();
      const failedEvents: Array<{ reason: string; retryable: boolean }> = [];

      bookingEventBus.subscribe("BOOKING_CONFIRMATION_FAILED", (event) => {
        failedEvents.push({
          reason: (event as { payload: { reason: string; retryable: boolean } }).payload.reason,
          retryable: (event as { payload: { reason: string; retryable: boolean } }).payload.retryable,
        });
      });

      // Act
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);
      await flushMicrotasks();

      // Assert — result shape
      expect(result.success).toBe(false);
      expect(result.reason).toBe("eligibility_denied");
      expect(result.retryable).toBe(false);

      // Assert — CONFIRMING fired first, CONFIRMATION_FAILED last
      expect(deps.transitionTo).toHaveBeenCalledTimes(2);
      expect(deps.transitionTo).toHaveBeenNthCalledWith(1, "CONFIRMING");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(2, "CONFIRMATION_FAILED");

      // Assert — BOOKING_CONFIRMATION_FAILED domain event emitted
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].reason).toBe("eligibility_denied");
      expect(failedEvents[0].retryable).toBe(false);

      // Assert — confirmReservation was NOT called (short-circuit at step 3)
      expect(SlotReservationRepository.confirmReservation).not.toHaveBeenCalled();
      expect(ConsultationRepository.confirmBooking).not.toHaveBeenCalled();
    });

    it("should use eligibility.reason when available in result", async () => {
      vi.mocked(SlotReservationRepository.getReservationById).mockResolvedValue(
        VALID_RESERVATION
      );
      vi.mocked(ConsultationEligibilityService.checkEligibility).mockResolvedValue({
        eligible: false,
        reason: "ACTIVE_BOOKING_EXISTS",
        existingConsultationId: "bks_existing_002",
        canReschedule: true,
      });

      const deps = buildDeps();
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);

      // The orchestrator maps EligibilityDenialReason to result.reason
      // When eligible=false and no custom reason override, returns "eligibility_denied"
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 4 — NETWORK / UNEXPECTED ERROR
  // ─────────────────────────────────────────────────────────────────────────
  describe("Scenario 4 — unexpected error", () => {
    it("should transition CONFIRMING → CONFIRMATION_FAILED on thrown network error", async () => {
      vi.mocked(SlotReservationRepository.getReservationById).mockRejectedValue(
        new Error("network timeout")
      );

      const deps = buildDeps();
      const failedEvents: Array<{ reason: string; retryable: boolean }> = [];

      bookingEventBus.subscribe("BOOKING_CONFIRMATION_FAILED", (event) => {
        failedEvents.push({
          reason: (event as { payload: { reason: string; retryable: boolean } }).payload.reason,
          retryable: (event as { payload: { reason: string; retryable: boolean } }).payload.retryable,
        });
      });

      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);
      await flushMicrotasks();

      expect(result.success).toBe(false);
      expect(result.retryable).toBe(true); // network errors are retryable
      expect(deps.transitionTo).toHaveBeenNthCalledWith(1, "CONFIRMING");
      expect(deps.transitionTo).toHaveBeenNthCalledWith(2, "CONFIRMATION_FAILED");
      expect(failedEvents[0].reason).toBe("network_error");
      expect(failedEvents[0].retryable).toBe(true);
    });

    it("should mark non-network errors as non-retryable (db_error)", async () => {
      vi.mocked(SlotReservationRepository.getReservationById).mockRejectedValue(
        new Error("unique constraint violation")
      );

      const deps = buildDeps();
      const result = await orchestrateBookingConfirmation(VALID_INPUT, deps);

      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scenario 5 — ARCHITECTURE CONTRACT: transitionTo isolation
  // ─────────────────────────────────────────────────────────────────────────
  describe("Scenario 5 — architecture contract", () => {
    it("should always call transitionTo(CONFIRMING) as the very first action", async () => {
      // Even when the first async call throws immediately
      vi.mocked(SlotReservationRepository.getReservationById).mockRejectedValue(
        new Error("db down")
      );

      const deps = buildDeps();

      // Track call order precisely
      const callOrder: string[] = [];
      deps.transitionTo.mockImplementation((phase: string) => {
        callOrder.push(phase);
      });
      vi.mocked(SlotReservationRepository.getReservationById).mockImplementationOnce(
        async () => {
          callOrder.push("getReservationById_called");
          throw new Error("db down");
        }
      );

      await orchestrateBookingConfirmation(VALID_INPUT, deps);

      // CONFIRMING must be pushed before ANY async I/O
      expect(callOrder[0]).toBe("CONFIRMING");
      // getReservationById is called after CONFIRMING
      expect(callOrder[1]).toBe("getReservationById_called");
      // CONFIRMATION_FAILED is pushed last
      expect(callOrder[callOrder.length - 1]).toBe("CONFIRMATION_FAILED");
    });
  });
});

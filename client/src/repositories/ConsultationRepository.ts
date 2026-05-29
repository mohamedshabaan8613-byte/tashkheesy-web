/**
 * ConsultationRepository.ts — Sprint 3.4 Phase 1 + Phase 3 + Phase 5 + Phase 6
 *
 * Primary repository for consultation transactional lifecycle.
 *
 * RESPONSIBILITIES:
 *   - createConsultation(): create DRAFT record at booking start
 *   - updateConsultation(): generic field update
 *   - confirmBooking(): full confirmation transaction (Phase 3)
 *   - cancelBooking(): cancellation with audit trail (Phase 6)
 *   - rescheduleBooking(): slot change without new booking (Phase 5)
 *   - getConsultationById(): fetch by ID
 *   - getActiveConsultationForUser(): recovery query
 *
 * ARCHITECTURE RULE:
 *   This repository does NOT call transitionTo().
 *   Does NOT emit domain events directly.
 *   Orchestrator owns event emission and phase transitions.
 */

import { supabase } from "../lib/supabase";
import type {
  ConsultationRecord,
  ConfirmBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
} from "../types/consultationBookingTypes";
import type { Database } from "../integrations/supabase/bookingSchemaTypes";
import type { InsertConsultation } from "../integrations/supabase/bookingSchemaTypes";

type ConsultationRow = Database.Booking.ConsultationRow;

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function rowToRecord(row: ConsultationRow): ConsultationRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    booking_phase: row.booking_phase,
    reservation_status: row.reservation_status,
    specialist_id: row.specialist_id,
    slot_id: row.slot_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
    confirmed_at: row.confirmed_at,
    cancelled_at: row.cancelled_at,
    rescheduled_from: row.rescheduled_from,
    is_free_consultation: row.is_free_consultation,
    cancellation_reason: row.cancellation_reason,
    reschedule_count: row.reschedule_count,
    ownership_token: row.ownership_token,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export const ConsultationRepository = {
  /**
   * createConsultation — create DRAFT record at booking session start.
   * Called by orchestrator when user starts the booking flow.
   */
  async createConsultation(
    input: Omit<InsertConsultation, "status" | "booking_phase"> & {
      ownership_token: string;
    }
  ): Promise<ConsultationRecord> {
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        ...input,
        status: "DRAFT" as const,
        booking_phase: "IDLE" as const,
        is_free_consultation: true,
        reschedule_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`ConsultationRepository.createConsultation failed: ${error.message}`);
    }

    return rowToRecord(data as ConsultationRow);
  },

  /**
   * updateConsultation — generic partial update.
   * Used for specialist_id, slot_id, booking_phase updates during flow.
   */
  async updateConsultation(
    consultationId: string,
    userId: string,
    updates: Partial<ConsultationRow>
  ): Promise<ConsultationRecord> {
    const { data, error } = await supabase
      .from("consultations")
      .update(updates)
      .eq("id", consultationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`ConsultationRepository.updateConsultation failed: ${error.message}`);
    }

    return rowToRecord(data as ConsultationRow);
  },

  /**
   * confirmBooking — Phase 3: full confirmation transaction.
   *
   * Validates:
   *   1. reservation ownership
   *   2. reservation not expired
   *   3. consultation exists and belongs to user
   *
   * Then:
   *   - sets status = CONFIRMED
   *   - sets confirmed_at
   *   - sets reservation_status = CONFIRMED
   *
   * NOTE: eligibility check happens in ConsultationEligibilityService BEFORE calling here.
   */
  async confirmBooking(input: ConfirmBookingInput): Promise<ConsultationRecord> {
    const { consultationId, userId } = input;

    const { data, error } = await supabase
      .from("consultations")
      .update({
        status: "CONFIRMED" as const,
        booking_phase: "CONFIRMED" as const,
        reservation_status: "CONFIRMED" as const,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", consultationId)
      .eq("user_id", userId)
      .eq("status", "SLOT_SELECTED")  // guard: only confirm from SLOT_SELECTED
      .select()
      .single();

    if (error) {
      throw new Error(`ConsultationRepository.confirmBooking failed: ${error.message}`);
    }

    return rowToRecord(data as ConsultationRow);
  },

  /**
   * cancelBooking — Phase 6: cancellation with audit trail.
   * Preserves full record — never deletes.
   */
  async cancelBooking(input: CancelBookingInput): Promise<ConsultationRecord> {
    const { consultationId, userId, reason } = input;

    const { data, error } = await supabase
      .from("consultations")
      .update({
        status: "CANCELLED" as const,
        booking_phase: "CANCELLED" as const,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason ?? null,
      })
      .eq("id", consultationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`ConsultationRepository.cancelBooking failed: ${error.message}`);
    }

    return rowToRecord(data as ConsultationRow);
  },

  /**
   * rescheduleBooking — Phase 5: update slot without creating new booking.
   * Increments reschedule_count for audit.
   */
  async rescheduleBooking(input: RescheduleBookingInput): Promise<ConsultationRecord> {
    const { consultationId, userId, newSlotId } = input;

    // Fetch current slot_id for audit trail
    const current = await ConsultationRepository.getConsultationById(
      consultationId,
      userId
    );
    if (!current) {
      throw new Error("ConsultationRepository.rescheduleBooking: consultation not found");
    }

    const { data, error } = await supabase
      .from("consultations")
      .update({
        slot_id: newSlotId,
        status: "RESCHEDULED" as const,
        booking_phase: "RESCHEDULED" as const,
        reservation_status: "CONFIRMED" as const,
        rescheduled_from: current.slot_id,
        reschedule_count: current.reschedule_count + 1,
      })
      .eq("id", consultationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`ConsultationRepository.rescheduleBooking failed: ${error.message}`);
    }

    return rowToRecord(data as ConsultationRow);
  },

  /**
   * getConsultationById — fetch by ID with ownership check.
   */
  async getConsultationById(
    consultationId: string,
    userId: string
  ): Promise<ConsultationRecord | null> {
    const { data, error } = await supabase
      .from("consultations")
      .select()
      .eq("id", consultationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`ConsultationRepository.getConsultationById failed: ${error.message}`);
    }

    return data ? rowToRecord(data as ConsultationRow) : null;
  },

  /**
   * getActiveConsultationForUser — recovery query.
   * Returns the most recent non-terminal consultation for a user.
   * Used by ConsultationBookingContext recovery on mount.
   */
  async getActiveConsultationForUser(
    userId: string
  ): Promise<ConsultationRecord | null> {
    const { data, error } = await supabase
      .from("consultations")
      .select()
      .eq("user_id", userId)
      .not("status", "in", "('CANCELLED','EXPIRED','COMPLETED')")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`ConsultationRepository.getActiveConsultationForUser failed: ${error.message}`);
    }

    return data ? rowToRecord(data as ConsultationRow) : null;
  },
};

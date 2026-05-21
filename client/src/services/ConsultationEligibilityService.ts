/**
 * ConsultationEligibilityService.ts — Sprint 3.4 Phase 4
 *
 * One Free Consultation Policy enforcement.
 *
 * RULES:
 *   - Each user gets exactly ONE free consultation.
 *   - Reschedule does NOT consume a new free consultation.
 *   - Cancel does NOT restore eligibility (eligibility is per-user, not per-booking).
 *   - Recovery does NOT affect eligibility.
 *
 * ARCHITECTURE RULE:
 *   This service is pure read — no mutations.
 *   Orchestrator calls this BEFORE attempting confirmation.
 *   If not eligible, orchestrator emits BOOKING_CONFIRMATION_FAILED and calls transitionTo(CONFIRMATION_FAILED).
 */

import { supabase } from "../lib/supabase";
import type { EligibilityResult, EligibilityDenialReason } from "../types/consultationBookingTypes";

export const ConsultationEligibilityService = {
  /**
   * checkEligibility — main eligibility gate before confirmation.
   *
   * Checks:
   *   1. Has user already used their free consultation?
   *   2. Does user have an active (non-terminal) booking already?
   *
   * Returns EligibilityResult with eligible flag and reason if denied.
   */
  async checkEligibility(userId: string): Promise<EligibilityResult> {
    try {
      // Check for existing CONFIRMED free consultation
      const { data: existingConfirmed, error: confirmedError } = await supabase
        .from("consultations")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "CONFIRMED")
        .eq("is_free_consultation", true)
        .limit(1)
        .maybeSingle();

      if (confirmedError) {
        throw new Error(confirmedError.message);
      }

      if (existingConfirmed) {
        return {
          eligible: false,
          reason: "FREE_CONSULTATION_ALREADY_USED" as EligibilityDenialReason,
          existingConsultationId: existingConfirmed.id,
          canReschedule: true,  // can reschedule existing, not create new
        };
      }

      // Check for active booking (CONFIRMING state — prevent race)
      const { data: activeBooking, error: activeError } = await supabase
        .from("consultations")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["CONFIRMING", "SLOT_SELECTED"])
        .limit(1)
        .maybeSingle();

      if (activeError) {
        throw new Error(activeError.message);
      }

      if (activeBooking) {
        return {
          eligible: false,
          reason: "ACTIVE_BOOKING_EXISTS" as EligibilityDenialReason,
          existingConsultationId: activeBooking.id,
          canReschedule: false,
        };
      }

      return {
        eligible: true,
        reason: null,
        existingConsultationId: null,
        canReschedule: false,
      };
    } catch (err) {
      console.error("ConsultationEligibilityService.checkEligibility error:", err);
      return {
        eligible: false,
        reason: "UNKNOWN" as EligibilityDenialReason,
        existingConsultationId: null,
        canReschedule: false,
      };
    }
  },

  /**
   * canReschedule — check if user can reschedule an existing confirmed booking.
   * Reschedule is always allowed for the OWNER of the booking.
   * It does NOT consume a new free consultation.
   */
  async canReschedule(consultationId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("consultations")
      .select("id, status")
      .eq("id", consultationId)
      .eq("user_id", userId)
      .in("status", ["CONFIRMED", "RESCHEDULED"])
      .maybeSingle();

    if (error || !data) return false;
    return true;
  },

  /**
   * canCancel — check if user can cancel a booking.
   * Returns false for already-cancelled or completed bookings.
   */
  async canCancel(consultationId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("consultations")
      .select("id, status")
      .eq("id", consultationId)
      .eq("user_id", userId)
      .not("status", "in", "('CANCELLED','COMPLETED','EXPIRED')")
      .maybeSingle();

    if (error || !data) return false;
    return true;
  },
};

/**
 * SlotReservationRepository.ts — Sprint 3.4 Phase 2
 *
 * Slot Reservation Lifecycle:
 *   PENDING → RESERVED → CONFIRMED | RELEASED | EXPIRED
 *
 * RESPONSIBILITIES:
 *   - reserveSlot(): create reservation with TTL, prevent double-booking
 *   - releaseSlot(): mark as RELEASED, free the slot
 *   - confirmReservation(): transition RESERVED → CONFIRMED after booking
 *   - getActiveReservation(): find current RESERVED/CONFIRMED reservation for user+slot
 *   - cleanupExpired(): mark expired reservations (called by scheduler)
 *
 * ARCHITECTURE RULE:
 *   This repository does NOT call transitionTo().
 *   It returns results — the orchestrator calls transitionTo() based on results.
 *   No direct bookingFlowPhase mutations here.
 */

import { supabase } from "../lib/supabase";
import type { SlotReservationRecord, ReserveSlotInput } from "../types/consultationBookingTypes";
import type { Database } from "../integrations/supabase/bookingSchemaTypes";
import { generateEventId } from "../types/bookingDomainEvents";

type SlotReservationRow = Database.Booking.SlotReservationRow;

// Default TTL for slot reservations
const DEFAULT_RESERVATION_TTL_MINUTES = 15;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function rowToRecord(row: SlotReservationRow): SlotReservationRecord {
  return {
    id: row.id,
    slot_id: row.slot_id,
    user_id: row.user_id,
    consultation_id: row.consultation_id,
    status: row.status,
    reserved_until: row.reserved_until,
    released_at: row.released_at,
    created_at: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export const SlotReservationRepository = {
  /**
   * reserveSlot — atomically reserve a slot for a user.
   *
   * The DB UNIQUE index on (slot_id) WHERE status IN ('RESERVED','CONFIRMED')
   * prevents double-booking at the database level.
   *
   * Returns: the created reservation, or null if slot already taken.
   */
  async reserveSlot(input: ReserveSlotInput): Promise<SlotReservationRecord | null> {
    const ttl = input.ttlMinutes ?? DEFAULT_RESERVATION_TTL_MINUTES;
    const reservedUntil = new Date(
      Date.now() + ttl * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from("slot_reservations")
      .insert({
        id: generateEventId(),
        slot_id: input.slotId,
        user_id: input.userId,
        consultation_id: input.consultationId ?? null,
        status: "RESERVED" as const,
        reserved_until: reservedUntil,
        released_at: null,
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation = slot already reserved
      if (error.code === "23505") {
        return null;
      }
      throw new Error(`SlotReservationRepository.reserveSlot failed: ${error.message}`);
    }

    return rowToRecord(data as SlotReservationRow);
  },

  /**
   * releaseSlot — mark reservation as RELEASED.
   * Call on: user cancel, reschedule (old slot), recovery override.
   */
  async releaseSlot(
    reservationId: string,
    userId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("slot_reservations")
      .update({
        status: "RELEASED" as const,
        released_at: new Date().toISOString(),
      })
      .eq("id", reservationId)
      .eq("user_id", userId)  // ownership check
      .in("status", ["RESERVED", "PENDING"]);

    if (error) {
      throw new Error(`SlotReservationRepository.releaseSlot failed: ${error.message}`);
    }

    return true;
  },

  /**
   * confirmReservation — transition RESERVED → CONFIRMED.
   * Called only after successful booking confirmation.
   */
  async confirmReservation(
    reservationId: string,
    userId: string,
    consultationId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from("slot_reservations")
      .update({
        status: "CONFIRMED" as const,
        consultation_id: consultationId,
      })
      .eq("id", reservationId)
      .eq("user_id", userId)
      .eq("status", "RESERVED");

    if (error) {
      throw new Error(`SlotReservationRepository.confirmReservation failed: ${error.message}`);
    }

    return true;
  },

  /**
   * getActiveReservation — get current RESERVED/CONFIRMED reservation for user+slot.
   * Returns null if none found or all expired.
   */
  async getActiveReservation(
    slotId: string,
    userId: string
  ): Promise<SlotReservationRecord | null> {
    const { data, error } = await supabase
      .from("slot_reservations")
      .select()
      .eq("slot_id", slotId)
      .eq("user_id", userId)
      .in("status", ["RESERVED", "CONFIRMED"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`SlotReservationRepository.getActiveReservation failed: ${error.message}`);
    }

    if (!data) return null;

    // Client-side expiry check
    const row = data as SlotReservationRow;
    if (new Date(row.reserved_until) < new Date()) {
      return null;
    }

    return rowToRecord(row);
  },

  /**
   * getReservationById — fetch a specific reservation.
   * Used by confirmation flow to validate ownership before confirming.
   */
  async getReservationById(
    reservationId: string,
    userId: string
  ): Promise<SlotReservationRecord | null> {
    const { data, error } = await supabase
      .from("slot_reservations")
      .select()
      .eq("id", reservationId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found
      throw new Error(`SlotReservationRepository.getReservationById failed: ${error.message}`);
    }

    return rowToRecord(data as SlotReservationRow);
  },

  /**
   * cleanupExpired — mark expired reservations.
   * Called by polling timer in ConsultationBookingContext (every 60s).
   * Returns count of updated records.
   */
  async cleanupExpired(): Promise<number> {
    const { data, error } = await supabase
      .from("slot_reservations")
      .update({ status: "EXPIRED" as const })
      .eq("status", "RESERVED")
      .lt("reserved_until", new Date().toISOString())
      .select("id");

    if (error) {
      // Non-fatal — log and continue
      console.warn("SlotReservationRepository.cleanupExpired error:", error.message);
      return 0;
    }

    return data?.length ?? 0;
  },
};

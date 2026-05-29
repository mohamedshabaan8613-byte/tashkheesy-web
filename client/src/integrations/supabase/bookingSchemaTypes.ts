/**
 * bookingSchemaTypes.ts — Sprint 3.4 Supabase Schema Types
 *
 * TypeScript mirror of the Supabase DB schema for booking tables.
 * These match the SQL migration in bookingSchema.sql exactly.
 *
 * Usage:
 *   These types are used by repositories for type-safe Supabase queries.
 *   Import from here instead of using raw Supabase response types.
 */

import type {
  ConsultationStatus,
  ReservationStatus,
  BookingFlowPhase,
  ConsultationAuditEventType,
  NotificationType,
} from "../../types/consultationBookingTypes";

// ---------------------------------------------------------------------------
// Database namespace — mirrors Supabase generated types structure
// ---------------------------------------------------------------------------

export namespace Database {
  export namespace Booking {
    /** consultations table row */
    export interface ConsultationRow {
      id: string;
      user_id: string;
      status: ConsultationStatus;
      booking_phase: BookingFlowPhase;
      reservation_status: ReservationStatus | null;
      specialist_id: string | null;
      slot_id: string | null;
      created_at: string;
      updated_at: string;
      expires_at: string | null;
      confirmed_at: string | null;
      cancelled_at: string | null;
      rescheduled_from: string | null;
      is_free_consultation: boolean;
      cancellation_reason: string | null;
      reschedule_count: number;
      ownership_token: string | null;
    }

    /** slot_reservations table row */
    export interface SlotReservationRow {
      id: string;
      slot_id: string;
      user_id: string;
      consultation_id: string | null;
      status: ReservationStatus;
      reserved_until: string;
      released_at: string | null;
      created_at: string;
    }

    /** consultation_events table row */
    export interface ConsultationEventRow {
      id: string;
      consultation_id: string;
      event_type: ConsultationAuditEventType;
      payload: Record<string, unknown>;
      created_at: string;
    }

    /** notification_queue table row */
    export interface NotificationQueueRow {
      id: string;
      consultation_id: string;
      user_id: string;
      notification_type: NotificationType;
      payload: Record<string, unknown>;
      queued_at: string;
      sent_at: string | null;
      failed_at: string | null;
      retry_count: number;
    }

    /** available_slots view row (read model) */
    export interface AvailableSlotRow {
      id: string;
      specialist_id: string;
      datetime: string;
      duration_minutes: number;
      is_online: boolean;
      location_label: string | null;
      is_available: boolean;
    }

    /** specialists view row (read model) */
    export interface SpecialistRow {
      id: string;
      name: string;
      title: string;
      avatar_url: string | null;
      specialty: string | null;
      is_active: boolean;
    }
  }
}

// ---------------------------------------------------------------------------
// Insert types — subset of row types without auto-generated fields
// ---------------------------------------------------------------------------

export type InsertConsultation = Omit<
  Database.Booking.ConsultationRow,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;         // optional: can be client-generated UUID
  created_at?: string;
  updated_at?: string;
};

export type InsertSlotReservation = Omit<
  Database.Booking.SlotReservationRow,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type InsertConsultationEvent = Omit<
  Database.Booking.ConsultationEventRow,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

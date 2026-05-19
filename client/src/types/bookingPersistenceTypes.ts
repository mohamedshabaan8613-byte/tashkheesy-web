/**
 * bookingPersistenceTypes.ts — Sprint 3.3 PHASE 2 Foundation
 *
 * Authoritative entity shapes for Supabase persistence layer.
 *
 * RULE 1 — SOURCE OF TRUTH:
 *   هذه الـ Types تمثل الحقيقة المستمرة في قاعدة البيانات.
 *   Runtime context يتزامن معها — لا يحل محلها.
 *
 * RULE 5 — STATE SEPARATION:
 *   workflowPhase ≠ bookingStatus ≠ reservationStatus ≠ paymentStatus
 *
 * Sprint 3.3 Phase 2 سيبني الـ repository layer على هذه الـ types.
 */

import type { BookingLifecyclePhase, BookingEntryPoint, BookingEntitlementType } from "./consultationBookingTypes";

// ─── Booking Status (مستقل عن WorkflowPhase) ─────────────────────────────────
/**
 * BookingStatusCode — حالة الحجز في قاعدة البيانات.
 *
 * مستقل تمامًا عن BookingLifecyclePhase (workflow).
 * Rule 5: لا تخلط بين workflow phase وبين booking status.
 */
export type BookingStatusCode =
  | "draft"           // تحت الإنشاء — لم يُكتمل بعد
  | "pending_review"  // وصل إلى REVIEW — ينتظر تأكيد المستخدم
  | "confirmed"       // مؤكد — slot محجوز + persistence committed
  | "cancelled"       // ملغى
  | "expired"         // انتهت المهلة
  | "completed"       // اكتملت الجلسة فعلاً
  | "rescheduled";    // تم إعادة الجدولة

// ─── Reservation Status (مستقل) ──────────────────────────────────────────────
export type ReservationStatusCode =
  | "none"      // لا يوجد reservation بعد
  | "held"      // slot محجوز مؤقتًا (يتطلب تأكيد)
  | "confirmed" // slot محجوز نهائيًا
  | "released"  // تم الإفراج عن الـ slot
  | "expired";  // انتهت مهلة الـ hold

// ─── Payment Status (مستقل) ──────────────────────────────────────────────────
export type PaymentStatusCode =
  | "not_required"  // استشارة مجانية
  | "pending"       // ينتظر الدفع
  | "processing"    // قيد المعالجة
  | "completed"     // دُفع بنجاح
  | "failed"        // فشل الدفع
  | "refunded"      // استُرد المبلغ
  | "partial_refund"; // استُرد جزء منه

// ─── Notification Status (مستقل) ─────────────────────────────────────────────
export type NotificationStatusCode =
  | "pending"   // في قائمة الانتظار
  | "sent"      // أُرسل
  | "delivered" // وصل
  | "failed"    // فشل الإرسال
  | "skipped";  // تُجُوِّز (لا يحتاج إشعار)

// ─── Authoritative Booking Record (Supabase persistence shape) ───────────────
/**
 * AuthoritativeBookingRecord — الحقيقة الدائمة.
 *
 * يُخزَّن في Supabase جدول `consultation_bookings`.
 * Runtime session يتزامن مع هذا الـ record — لا يحل محله.
 *
 * Sprint 3.3 Phase 2: ConsultationBookingSupabaseRepository يقرأ/يكتب هذا.
 */
export interface AuthoritativeBookingRecord {
  /** UUID من Supabase */
  readonly id: string;

  /** رابط لا يتغير مع ConsultationIntent */
  readonly sourceIntentId: string;

  /** رابط لـ Supabase auth.users */
  readonly userId: string;

  /** Runtime session ID للمزامنة */
  readonly runtimeSessionId: string;

  // ─── State Separation (Rule 5) ─────────────────────────────────────────────
  workflowPhase: BookingLifecyclePhase;
  bookingStatus: BookingStatusCode;
  reservationStatus: ReservationStatusCode;
  paymentStatus: PaymentStatusCode;
  notificationStatus: NotificationStatusCode;

  // ─── Booking Data ──────────────────────────────────────────────────────────
  specialistId?: string;
  slotId?: string;
  reservationId?: string;
  entryPoint: BookingEntryPoint;
  entitlementType: BookingEntitlementType;
  assessmentSessionId?: string;

  // ─── Lifecycle Timestamps ──────────────────────────────────────────────────
  readonly createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  expiredAt?: string;
  completedAt?: string;
  rescheduledAt?: string;
  expiresAt: string;

  // ─── Audit ────────────────────────────────────────────────────────────────
  /** نسخة optimistic concurrency — تزيد مع كل update */
  version: number;

  /** سبب الإلغاء — إن وُجد */
  cancellationReason?: string;

  /** معرف الحجز الأصلي عند reschedule */
  originalBookingId?: string;

  /** Sprint lifecycle version للـ migration compatibility */
  lifecycleVersion: "v1" | "v2";
}

// ─── Slot Reservation Record ──────────────────────────────────────────────────
/**
 * SlotReservationRecord — حجز مؤقت للـ slot.
 *
 * يُخزَّن في Supabase جدول `slot_reservations`.
 *
 * الهدف:
 *   - منع double-booking
 *   - slot locking مؤقت حتى تأكيد الحجز
 *   - cleanup تلقائي عند انتهاء المهلة
 */
export interface SlotReservationRecord {
  readonly id: string;
  readonly bookingId: string;
  readonly slotId: string;
  readonly specialistId: string;
  readonly userId: string;

  status: ReservationStatusCode;

  /** مهلة الـ hold — بعدها يُفرَّج عن الـ slot */
  holdsUntil: string;

  readonly createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  releasedAt?: string;

  /** عدد محاولات التأكيد — للـ retry safety */
  confirmAttempts: number;

  /** reservation ownership token — يمنع الـ race conditions */
  ownershipToken: string;
}

// ─── Booking Audit Entry ──────────────────────────────────────────────────────
/**
 * BookingAuditEntry — سجل audit لكل تغيير في الحجز.
 *
 * يُخزَّن في Supabase جدول `booking_audit_log`.
 * immutable — لا يُحذف أبدًا.
 */
export interface BookingAuditEntry {
  readonly id: string;
  readonly bookingId: string;
  readonly eventType: string;
  readonly fromState?: string;
  readonly toState?: string;
  readonly actor: "user" | "system" | "admin";
  readonly metadata?: Record<string, unknown>;
  readonly occurredAt: string;
}

// ─── Repository Interface (Phase 2 target) ───────────────────────────────────
/**
 * IBookingPersistenceRepository — contract للـ Supabase implementation.
 *
 * Sprint 3.3 Phase 2: ConsultationBookingSupabaseRepository implements this.
 * الـ UI لا يستخدم هذا مباشرة — يمر عبر orchestrator.
 */
export interface IBookingPersistenceRepository {
  /** إنشاء booking record جديد */
  create(record: Omit<AuthoritativeBookingRecord, "id" | "createdAt" | "updatedAt" | "version">): Promise<AuthoritativeBookingRecord>;

  /** تحميل booking بـ id */
  findById(id: string): Promise<AuthoritativeBookingRecord | null>;

  /** تحميل booking بـ runtime session id */
  findByRuntimeSessionId(runtimeSessionId: string): Promise<AuthoritativeBookingRecord | null>;

  /** تحميل الـ booking النشط للمستخدم */
  findActiveByUserId(userId: string): Promise<AuthoritativeBookingRecord | null>;

  /**
   * تحديث booking مع optimistic concurrency.
   * يرفع خطأ إذا كانت الـ version لا تتطابق.
   */
  update(
    id: string,
    changes: Partial<Omit<AuthoritativeBookingRecord, "id" | "sourceIntentId" | "userId" | "createdAt">>,
    expectedVersion: number,
  ): Promise<AuthoritativeBookingRecord>;

  /** تسجيل audit entry */
  audit(entry: Omit<BookingAuditEntry, "id" | "occurredAt">): Promise<void>;
}

// ─── Persistence Result ───────────────────────────────────────────────────────
export type PersistenceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: "not_found" | "conflict" | "forbidden" | "network" | "unknown" };

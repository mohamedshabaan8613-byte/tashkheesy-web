/**
 * consultationBookingTypes.ts — Consultation Booking Domain Types
 *
 * Sprint 3.1 — Business Layer Foundation
 * Priority 2: Booking Domain Isolation
 *
 * هذا الملف يعرّف نطاق الحجز بشكل مستقل تماماً.
 *
 * الفرق المعماري الحاسم:
 *   ConsultationContext   → intent + flow phase (WHY + WHERE)
 *   ConsultationBookingContext → booking session + lifecycle (HOW)
 *
 * الترتيب المعماري:
 *   types (هنا) → lib/consultationBookingRepository.ts → context → hooks → UI
 *
 * لا تضع booking logic داخل ConsultationContext.
 * لا تضع consultation intent logic داخل BookingContext.
 */

import type { ConsultationEntryPoint } from "./consultationTypes";
import type {
  ConsultationEntitlement,
  BookingDenialReason,
} from "./consultationEntitlements";

// ---------------------------------------------------------------------------
// Booking Lifecycle Phase
// ---------------------------------------------------------------------------

/**
 * حالات دورة حياة الحجز.
 *
 * State Machine:
 *
 *   CREATED
 *     ↓
 *   SPECIALIST_SELECTION
 *     ↓
 *   SLOT_SELECTION
 *     ↓
 *   REVIEW
 *     ↓
 *   CONFIRMED
 *     ↓
 *   COMPLETED
 *
 * من أي حالة:
 *   CANCELLED — ألغى المستخدم بشكل صريح
 *   EXPIRED   — انتهت صلاحية الجلسة تلقائياً
 *   ABANDONED — غادر المستخدم بدون إلغاء
 */
export type BookingLifecyclePhase =
  | "CREATED"               // جلسة حجز منشأة، لم يبدأ بعد
  | "SPECIALIST_SELECTION"  // يختار المتخصص
  | "SLOT_SELECTION"        // اختار الموعد
  | "REVIEW"                // مراجعة قبل التأكيد
  | "CONFIRMED"             // تم التأكيد
  | "COMPLETED"             // تمت الاستشارة فعلياً
  | "CANCELLED"             // ألغى
  | "EXPIRED"               // انتهت الصلاحية
  | "ABANDONED";            // غادر بدون إلغاء

/**
 * Transitions صالحة بين حالات دورة حياة الحجز.
 * مستخدمة كـ guards في consultationBookingRepository.
 */
export type BookingLifecycleTransition =
  | { from: "CREATED";              to: "SPECIALIST_SELECTION" }
  | { from: "SPECIALIST_SELECTION"; to: "SLOT_SELECTION" }
  | { from: "SPECIALIST_SELECTION"; to: "CANCELLED" }
  | { from: "SPECIALIST_SELECTION"; to: "EXPIRED" }
  | { from: "SLOT_SELECTION";       to: "REVIEW" }
  | { from: "SLOT_SELECTION";       to: "SPECIALIST_SELECTION" }  // back
  | { from: "SLOT_SELECTION";       to: "CANCELLED" }
  | { from: "SLOT_SELECTION";       to: "EXPIRED" }
  | { from: "REVIEW";               to: "CONFIRMED" }
  | { from: "REVIEW";               to: "SLOT_SELECTION" }        // back
  | { from: "REVIEW";               to: "CANCELLED" }
  | { from: "CONFIRMED";            to: "COMPLETED" }
  | { from: "CONFIRMED";            to: "CANCELLED" };

/**
 * الحالات النهائية — لا يمكن الانتقال منها.
 */
export const BOOKING_TERMINAL_PHASES: ReadonlySet<BookingLifecyclePhase> =
  new Set(["COMPLETED", "CANCELLED", "EXPIRED", "ABANDONED"]);

/**
 * الحالات القابلة للاستعادة — Recovery ممكن.
 */
export const BOOKING_RECOVERABLE_PHASES: ReadonlySet<BookingLifecyclePhase> =
  new Set(["SPECIALIST_SELECTION", "SLOT_SELECTION", "REVIEW"]);

// ---------------------------------------------------------------------------
// Booking Recovery State
// ---------------------------------------------------------------------------

/**
 * حالة Recovery لجلسة الحجز.
 * تُخزّن داخل ConsultationBookingSession.
 */
export interface BookingRecoveryState {
  /** هل تم استعادة هذه الجلسة من انقطاع */
  wasRecovered: boolean;

  /** سبب الانقطاع الأخير */
  lastInterruptionReason?: BookingInterruptionReason;

  /** عدد محاولات الاستعادة */
  recoveryAttempts: number;

  /** آخر وقت نشاط قبل الانقطاع */
  lastActiveAt?: string;

  /** الحالة التي كان فيها الحجز عند الانقطاع */
  interruptedAtPhase?: BookingLifecyclePhase;
}

/**
 * أسباب انقطاع الحجز.
 */
export type BookingInterruptionReason =
  | "page_refresh"          // تحديث الصفحة
  | "browser_back"          // ضغط Back
  | "navigation_away"       // تنقل لصفحة أخرى
  | "entitlement_expired"   // انتهى الاستحقاق أثناء الحجز
  | "specialist_unavailable" // المتخصص أصبح غير متاح
  | "session_timeout";      // انتهت مدة الجلسة

// ---------------------------------------------------------------------------
// Consultation Booking Session
// ---------------------------------------------------------------------------

/**
 * ConsultationBookingSession — الكيان المركزي لنطاق الحجز.
 *
 * هذا هو domain object المستقل الوحيد.
 * كل booking state يجب أن يعيش هنا — ليس scattered.
 *
 * فرق حاسم:
 *   ConsultationIntent   = context (لا يتغيّر)
 *   ConsultationBookingSession = booking runtime state (يتغيّر)
 */
export interface ConsultationBookingSession {
  // -------------------------------------------------------------------------
  // Identity
  // -------------------------------------------------------------------------

  /** UUID فريد لهذه الجلسة */
  sessionId: string;

  /** معرّف النية المرتبطة */
  consultationIntentId: string;

  // -------------------------------------------------------------------------
  // Context (read from ConsultationIntent at creation time)
  // -------------------------------------------------------------------------

  /** من أين جاء المستخدم */
  entryPoint: ConsultationEntryPoint;

  /** معرّف جلسة التقييم المرتبطة */
  assessmentSessionId?: string;

  /** نوع الاستحقاق عند بدء الجلسة */
  entitlementType: ConsultationEntitlement;

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /** الحالة الحالية في دورة حياة الحجز */
  bookingStatus: BookingLifecyclePhase;

  /** وقت إنشاء الجلسة */
  createdAt: string;

  /** آخر نشاط */
  lastActivityAt: string;

  /** وقت التأكيد النهائي */
  confirmedAt?: string;

  // -------------------------------------------------------------------------
  // Selection State
  // -------------------------------------------------------------------------

  /** معرّف المتخصص المختار */
  selectedSpecialistId?: string;

  /** معرّف الموعد المختار */
  selectedSlotId?: string;

  /**
   * معرّف المتخصص المقترح (ليس المختار).
   * سيُملأ في Sprint 3.1 Priority 4 (Specialist Recommendation Engine).
   */
  recommendedSpecialistId?: string;

  // -------------------------------------------------------------------------
  // Recovery
  // -------------------------------------------------------------------------

  /** حالة recovery الحجز */
  recoveryState: BookingRecoveryState;

  // -------------------------------------------------------------------------
  // Denial
  // -------------------------------------------------------------------------

  /**
   * سبب الرفض إن وجد.
   * يُستخدم في حالة CANCELLED أو EXPIRED.
   */
  denialReason?: BookingDenialReason;
}

// ---------------------------------------------------------------------------
// Booking Metadata
// ---------------------------------------------------------------------------

/**
 * Metadata لـ analytics وتتبع دورة حياة الحجز.
 */
export interface BookingMetadata {
  /** معرّف الجلسة */
  sessionId: string;

  /** من أين جاء المستخدم */
  entryPoint: ConsultationEntryPoint;

  /** نوع الاستحقاق */
  entitlementType: ConsultationEntitlement;

  /** معرّف جلسة التقييم المرتبطة */
  assessmentSessionId?: string;

  /** هل تم استعادة الجلسة من انقطاع */
  wasRecovered: boolean;

  /** عدد محاولات الاستعادة */
  recoveryAttempts: number;

  /** وقت الإنشاء */
  createdAt: string;

  /** وقت التأكيد (إن تم) */
  confirmedAt?: string;
}

// ---------------------------------------------------------------------------
// Booking Context Value
// ---------------------------------------------------------------------------

/**
 * الواجهة الرسمية لـ ConsultationBookingContext.
 *
 * مفصول تماماً عن ConsultationContextValue.
 * لا يجب أن يتقاطعا.
 */
export interface ConsultationBookingContextValue {
  /** الجلسة النشطة حالياً (null إذا لم تبدأ) */
  bookingSession: ConsultationBookingSession | null;

  /** الحالة الحالية — اختصار لـ bookingSession.bookingStatus */
  bookingPhase: BookingLifecyclePhase | null;

  /** هل توجد جلسة نشطة؟ */
  hasActiveBooking: boolean;

  /** هل تم استعادة هذه الجلسة من انقطاع؟ */
  wasSessionRecovered: boolean;

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /** إنشاء جلسة حجز جديدة */
  startBookingSession: (
    intentId: string,
    entryPoint: ConsultationEntryPoint,
    entitlementType: ConsultationEntitlement,
    assessmentSessionId?: string
  ) => ConsultationBookingSession;

  /** الانتقال إلى الحالة التالية */
  advanceBookingPhase: (
    to: BookingLifecyclePhase
  ) => boolean; // returns false if transition invalid

  /** تحديث اختيار المتخصص */
  selectSpecialist: (specialistId: string) => void;

  /** تحديث اختيار الموعد */
  selectSlot: (slotId: string) => void;

  /** إلغاء جلسة الحجز مع سبب */
  cancelBookingSession: (reason?: BookingDenialReason) => void;

  /** مسح جلسة الحجز بالكامل */
  clearBookingSession: () => void;

  /** استعادة الجلسة بعد انقطاع */
  recoverBookingSession: (
    reason: BookingInterruptionReason
  ) => ConsultationBookingSession | null;

  /** الـ metadata الحالية لـ analytics */
  getBookingMetadata: () => BookingMetadata | null;
}

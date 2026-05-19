/**
 * consultationBookingTypes.ts — Sprint 3.1 Priority 2 (updated pre-P3)
 *
 * Domain types لـ Consultation Booking.
 * مستقلة تمامًا عن generic booking system.
 *
 * المبدأ: ConsultationBookingSession هو domain object كامل،
 * وليس مجرد state مبعثرة في React.
 */

// ─── Lifecycle Future Marker ──────────────────────────────────────────────
/**
 * NOTE — Lifecycle intentionally simplified for Sprint 3.1.
 *
 * المراحل التي ستُضاف في Sprint 3.2+ عند ربط نظام الدفع والجدولة:
 *
 *   CONFIRMED
 *     ↓
 *   PENDING_PAYMENT    ←── مرحلة Sprint 3.2
 *     ↓
 *   PAID               ←── مرحلة Sprint 3.2
 *     ↓
 *   SCHEDULED          ←── مرحلة Sprint 3.3 (calendar sync)
 *     ↓
 *   COMPLETED
 *
 * لا تغيّر هذا الملف لإضافة تلك المراحل — أنشئ ملف جديد:
 *   types/consultationBookingPaymentTypes.ts
 */
export const LIFECYCLE_NOTE = "simplified_sprint_3.1" as const;

// ─── Booking Lifecycle Phases ──────────────────────────────────────────────
export type BookingLifecyclePhase =
  | "CREATED"
  | "SPECIALIST_SELECTION"
  | "SLOT_SELECTION"
  | "REVIEW"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "ABANDONED";

export const RECOVERABLE_PHASES: BookingLifecyclePhase[] = [
  "SPECIALIST_SELECTION",
  "SLOT_SELECTION",
  "REVIEW",
];

export const TERMINAL_PHASES: BookingLifecyclePhase[] = [
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "ABANDONED",
];

// ─── Entry Points ──────────────────────────────────────────────────────────
export type BookingEntryPoint =
  | "post_assessment"
  | "post_screening"
  | "specialist_match"
  | "direct_navigation"
  | "consultation_intro";

// ─── Entitlement Types ─────────────────────────────────────────────────────
export type BookingEntitlementType =
  | "free_first_consultation"
  | "paid_consultation"
  | "package_session"
  | "follow_up";

// ─── Recovery Reason Taxonomy ──────────────────────────────────────────────
/**
 * BookingRecoveryReason — taxonomy موحد للسبب.
 *
 * يُستخدم في:
 *   - analytics: أي سبب الأكثر تكرارًا؟
 *   - debugging: مسار المستخدم بالضبط
 *   - support: دعم العميل عند الفشل
 *   - medical auditing: تتبع سبب إلغاء جلسة HealthTech
 */
export type BookingRecoveryReason =
  | "page_refresh"              // F5 / إعادة تحميل
  | "browser_back"              // زر back في أثناء الحجز
  | "tab_restore"               // استعادة تبويب مغلق
  | "ttl_expired"               // انتهت صلاحية الجلسة (ساعتان)
  | "specialist_removed"        // الأخصائي أُزيل أثناء الحجز
  | "specialist_unavailable"    // الأخصائي لا يوجد في الوقت المحدد
  | "entitlement_invalidated"   // انتهت الاستحقاق أثناء التدفق
  | "entitlement_expired"       // انتهى وقت الاستحقاق
  | "session_corrupted"         // بيانات تالفة في sessionStorage
  | "user_cancelled"            // ألغى المستخدم بنفسه
  | "inactivity_timeout"        // تجاوز وقت الخمول
  | "orchestrator_validation"   // فشل تحقق orchestrator
  | "mount_ttl_check";          // اكتشف عند mount أن الجلسة منتهية

// ─── Booking Recovery State ───────────────────────────────────────────────
export type BookingRecoveryStatus =
  | "fresh"
  | "recovered"
  | "invalidated"
  | "rerouted"
  | "partial"
  | "failed";

export interface BookingRecoveryState {
  status: BookingRecoveryStatus;
  reason?: BookingRecoveryReason;     // ← taxonomy موحد بدل failureReason string حر
  recoveredAt?: string;
  recoveredPhase?: BookingLifecyclePhase;
  /** تفاصيل إضافية للـ support / medical audit */
  auditNote?: string;
}

// ─── Specialist Recommendation ────────────────────────────────────────────
export interface SpecialistRecommendation {
  specialistId: string;
  matchScore: number;
  matchReasons: string[];
  assessmentSessionId: string;
}

// ─── ConsultationBookingSession (Domain Object) ───────────────────────────
export interface ConsultationBookingSession {
  // ── Identity ──────────────────────────────────────────
  sessionId: string;
  consultationIntentId: string;

  // ── Lifecycle ─────────────────────────────────────────
  bookingFlowPhase: BookingLifecyclePhase;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;

  /**
   * lifecycleVersion — يتتبع نسخة الـ machine.
   * عند إضافة PENDING_PAYMENT في Sprint 3.2،
   * يُرفع إلى "v2" حتى نتجنب migration breakage.
   */
  lifecycleVersion: "v1";

  // ── Entry Context ─────────────────────────────────────
  entryPoint: BookingEntryPoint;
  assessmentSessionId?: string;
  entitlementType: BookingEntitlementType;

  // ── Recovery ──────────────────────────────────────────
  recoveryState: BookingRecoveryState;

  // ── Selections ────────────────────────────────────────
  selectedSpecialistId?: string;
  selectedSlotId?: string;
  specialistRecommendation?: SpecialistRecommendation;

  // ── Status ────────────────────────────────────────────
  bookingStatus: BookingLifecyclePhase;
}

// ─── Repository Interface (with activeBookingSessionId) ──────────────────────
/**
 * ConsultationBookingRepository — تحديث pre-Priority-3
 *
 * أضفنا activeBookingSessionId بدل implicit latest.
 *
 * لماذا;
 *   - مستقبلًا: follow-up booking + school bookings + multiple children
 *   - loadLatest() ستكسر إذا كان implicit by timestamp
 *   - activeBookingSessionId صريح ومتحكّم فيه
 */
export interface ConsultationBookingRepository {
  save(session: ConsultationBookingSession): void;
  load(sessionId: string): ConsultationBookingSession | null;

  /** يحدد الجلسة النشطة صراحةً */
  setActive(sessionId: string): void;
  /** يُعيد معرف الجلسة النشطة */
  getActiveId(): string | null;
  /** يحمِّل الجلسة النشطة مباشرة */
  loadActive(): ConsultationBookingSession | null;

  /** ‹legacy› يُعيد الجلسة النشطة (loadActive alias) */
  loadLatest(): ConsultationBookingSession | null;

  invalidate(sessionId: string, reason: BookingRecoveryReason): void;
  clearActive(): void;
  clear(): void;
}

// ─── Lifecycle Transition Validation ─────────────────────────────────────
const ALLOWED_TRANSITIONS: Partial<Record<BookingLifecyclePhase, BookingLifecyclePhase[]>> = {
  CREATED: ["SPECIALIST_SELECTION", "CANCELLED", "ABANDONED"],
  SPECIALIST_SELECTION: ["SLOT_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  SLOT_SELECTION: ["REVIEW", "SPECIALIST_SELECTION", "CANCELLED", "EXPIRED", "ABANDONED"],
  REVIEW: ["CONFIRMED", "SLOT_SELECTION", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
  ABANDONED: [],
};

export function isValidTransition(
  from: BookingLifecyclePhase,
  to: BookingLifecyclePhase
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function generateBookingSessionId(): string {
  return `bks_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateBookingExpiry(fromDate = new Date()): string {
  const expiry = new Date(fromDate.getTime() + 2 * 60 * 60 * 1000);
  return expiry.toISOString();
}

export function isSessionExpired(session: ConsultationBookingSession): boolean {
  return new Date(session.expiresAt) < new Date();
}

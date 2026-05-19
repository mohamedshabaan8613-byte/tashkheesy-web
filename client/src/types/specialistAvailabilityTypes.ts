/**
 * specialistAvailabilityTypes.ts — Sprint 3.2
 *
 * ─── AVAILABILITY_BOUNDARY ─────────────────────────────────────────────────
 *
 * هذا الملف يعرّف:
 *   ✅ domain types للأخصائيين والمواعيد المتاحة
 *   ✅ SpecialistProfile — بيانات العرض فقط
 *   ✅ AvailableSlot — موعد زمني مع metadata
 *   ✅ AvailabilityResult — نتيجة الاستعلام
 *
 * ─── حدود صارمة ────────────────────────────────────────────────────────────
 *   ❌ لا entitlement logic — من يحق له الحجز ≠ مسؤولية هذا الملف
 *   ❌ لا pricing logic — سعر الجلسة ≠ مسؤولية هذا الملف
 *   ❌ لا clinical severity — درجة الخطورة ≠ مسؤولية هذا الملف
 *   ❌ لا recommendation ranking — ترتيب الأخصائيين ≠ مسؤولية هذا الملف
 *   ✅ فقط: من متاح؟ متى؟ وكيف يُعرض؟
 *
 * Sprint 3.3+: استبدل mock بـ Supabase query في
 *   utils/specialistAvailability.ts دون تغيير هذه الأنواع.
 */

// ─── Specialist Domain Types ─────────────────────────────────────────────────

export type SpecialistGender = "male" | "female";

export type SpecialistSessionFormat =
  | "video"         // مكالمة مرئية
  | "audio"         // مكالمة صوتية
  | "chat";         // نص فقط

export type SpecialistSpecialization =
  | "adhd"          // اضطراب نقص الانتباه
  | "dyslexia"      // عسر القراءة
  | "learning_disabilities" // صعوبات التعلم العامة
  | "child_psychology"      // علم نفس الطفل
  | "educational_psychology" // علم النفس التربوي
  | "speech_therapy";        // علاج النطق (Sprint 3.3+)

/**
 * SpecialistProfile — بيانات العرض فقط.
 *
 * AVAILABILITY_BOUNDARY:
 *   هذا الكائن لا يملك:
 *   ❌ سعر الجلسة
 *   ❌ match score من assessment
 *   ❌ entitlement type
 *   ✅ يملك فقط: بيانات العرض + metadata التنسيق
 */
export interface SpecialistProfile {
  specialistId: string;
  displayName: string;
  titleAr: string;           // "أخصائية نفسية تربوية"
  titleEn: string;
  gender: SpecialistGender;
  specializations: SpecialistSpecialization[];
  sessionFormats: SpecialistSessionFormat[];
  sessionDurationMinutes: number;  // 30 | 45 | 60
  languagesSpoken: string[];       // ["ar", "en"]
  yearsExperience: number;
  avatarInitials: string;          // "س ع" — للعرض إذا لا صورة
  isAvailableToday: boolean;
  nextAvailableLabel: string;      // "اليوم", "غدًا", "الأسبوع القادم"
  acceptsNewCases: boolean;
}

// ─── Slot Domain Types ───────────────────────────────────────────────────────

export type SlotStatus =
  | "available"
  | "tentative"   // محجوز مؤقتًا
  | "unavailable";

/**
 * AvailableSlot — موعد زمني متاح.
 *
 * SLOT_BOUNDARY:
 *   ❌ لا payment info
 *   ❌ لا entitlement check
 *   ✅ فقط: وقت + مدة + format + status
 */
export interface AvailableSlot {
  slotId: string;
  specialistId: string;
  startTime: string;         // ISO 8601
  endTime: string;
  dayLabel: string;          // "الأحد"
  dateLabel: string;         // "١ يونيو"
  timeLabel: string;         // "٣:٠٠ م"
  durationMinutes: number;
  format: SpecialistSessionFormat;
  status: SlotStatus;
  isRecommended: boolean;    // highlighted slot — من specialist recommendation
}

// ─── Availability Query ──────────────────────────────────────────────────────

export interface SpecialistAvailabilityQuery {
  entryPoint: string;
  /** من assessment — اختياري. لا يؤثر على الفلترة هنا. */
  recommendedSpecialistId?: string;
  specializations?: SpecialistSpecialization[];
}

export type AvailabilityResultStatus =
  | "available"       // يوجد أخصائيون متاحون
  | "empty"           // لا أحد متاح الآن
  | "error";          // خطأ في الجلب

export interface AvailabilityResult {
  status: AvailabilityResultStatus;
  specialists: SpecialistProfile[];
  /** الأخصائي الموصى به من assessment — يظهر أولاً في القائمة */
  recommendedSpecialistId?: string;
  resolvedAt: string;  // timestamp للـ debugging
}

export interface SlotAvailabilityResult {
  status: AvailabilityResultStatus;
  slots: AvailableSlot[];
  specialist: SpecialistProfile | null;
  resolvedAt: string;
}

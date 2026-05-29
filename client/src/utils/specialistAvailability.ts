/**
 * specialistAvailability.ts — Sprint 3.2
 *
 * Availability Abstraction Layer.
 *
 * ─── ABSTRACTION_BOUNDARY ──────────────────────────────────────────────────
 *   هذا الملف يوفر data للعرض فقط.
 *   ❌ لا entitlement checks
 *   ❌ لا pricing
 *   ❌ لا recommendation ranking
 *   ✅ resolveAvailableSpecialists() — قائمة الأخصائيين المتاحين
 *   ✅ resolveAvailableSlots()       — مواعيد أخصائي محدد
 *   ✅ resolveSpecialistById()       — بيانات أخصائي واحد
 *
 * Sprint 3.3+:
 *   استبدل MOCK_SPECIALISTS و MOCK_SLOTS بـ Supabase query.
 *   الواجهة (signatures) لا تتغير.
 */

import type {
  AvailabilityResult,
  AvailableSlot,
  SlotAvailabilityResult,
  SpecialistAvailabilityQuery,
  SpecialistProfile,
} from "../types/specialistAvailabilityTypes";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Sprint 3.3+: يُستبدل هذا بـ Supabase RPC أو REST query

const MOCK_SPECIALISTS: SpecialistProfile[] = [
  {
    specialistId: "sp_001",
    displayName: "د. سارة العمري",
    titleAr: "أخصائية نفسية تربوية",
    titleEn: "Educational Psychologist",
    gender: "female",
    specializations: ["adhd", "learning_disabilities", "child_psychology"],
    sessionFormats: ["video", "audio"],
    sessionDurationMinutes: 45,
    languagesSpoken: ["ar", "en"],
    yearsExperience: 8,
    avatarInitials: "س ع",
    isAvailableToday: true,
    nextAvailableLabel: "اليوم",
    acceptsNewCases: true,
  },
  {
    specialistId: "sp_002",
    displayName: "د. منى الشهري",
    titleAr: "أخصائية صعوبات التعلم",
    titleEn: "Learning Disabilities Specialist",
    gender: "female",
    specializations: ["dyslexia", "learning_disabilities"],
    sessionFormats: ["video", "chat"],
    sessionDurationMinutes: 60,
    languagesSpoken: ["ar"],
    yearsExperience: 12,
    avatarInitials: "م ش",
    isAvailableToday: false,
    nextAvailableLabel: "غدًا",
    acceptsNewCases: true,
  },
  {
    specialistId: "sp_003",
    displayName: "د. أحمد القحطاني",
    titleAr: "أخصائي نفسي للأطفال",
    titleEn: "Child Psychologist",
    gender: "male",
    specializations: ["adhd", "child_psychology", "educational_psychology"],
    sessionFormats: ["video", "audio", "chat"],
    sessionDurationMinutes: 45,
    languagesSpoken: ["ar", "en"],
    yearsExperience: 6,
    avatarInitials: "أ ق",
    isAvailableToday: true,
    nextAvailableLabel: "اليوم",
    acceptsNewCases: true,
  },
];

function generateMockSlots(specialistId: string, durationMinutes: number): AvailableSlot[] {
  const base = Date.now();
  const days = ["الأحد", "الاثنين", "الثلاثاء"];
  const dates = ["١ يونيو", "٢ يونيو", "٣ يونيو"];
  const times = ["٩:٠٠ ص", "١١:٠٠ ص", "٢:٠٠ م", "٤:٠٠ م", "٦:٠٠ م"];

  const slots: AvailableSlot[] = [];
  let index = 0;

  for (let d = 0; d < days.length; d++) {
    const daySlots = d === 0 ? 2 : 3;
    for (let t = 0; t < daySlots; t++) {
      const start = new Date(base + d * 86400000 + t * 7200000);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      slots.push({
        slotId: `slot_${specialistId}_${index++}`,
        specialistId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        dayLabel: days[d],
        dateLabel: dates[d],
        timeLabel: times[t],
        durationMinutes,
        format: t % 2 === 0 ? "video" : "audio",
        status: t === 1 && d === 0 ? "tentative" : "available",
        isRecommended: t === 0 && d === 0,
      });
    }
  }
  return slots;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * resolveAvailableSpecialists()
 *
 * يُعيد قائمة الأخصائيين المتاحين.
 * إذا وُجد recommendedSpecialistId — يظهر أولاً في القائمة.
 *
 * Sprint 3.3+: استبدل MOCK_SPECIALISTS بـ Supabase query.
 */
export function resolveAvailableSpecialists(
  query: SpecialistAvailabilityQuery
): AvailabilityResult {
  try {
    let specialists = MOCK_SPECIALISTS.filter((s) => s.acceptsNewCases);

    // فلترة بالتخصص إذا طُلب
    if (query.specializations && query.specializations.length > 0) {
      specialists = specialists.filter((s) =>
        s.specializations.some((sp) => query.specializations!.includes(sp))
      );
    }

    // الموصى به يظهر أولاً
    if (query.recommendedSpecialistId) {
      specialists = [
        ...specialists.filter((s) => s.specialistId === query.recommendedSpecialistId),
        ...specialists.filter((s) => s.specialistId !== query.recommendedSpecialistId),
      ];
    }

    return {
      status: specialists.length > 0 ? "available" : "empty",
      specialists,
      recommendedSpecialistId: query.recommendedSpecialistId,
      resolvedAt: new Date().toISOString(),
    };
  } catch {
    return {
      status: "error",
      specialists: [],
      resolvedAt: new Date().toISOString(),
    };
  }
}

/**
 * resolveAvailableSlots()
 *
 * يُعيد مواعيد أخصائي محدد.
 * Sprint 3.3+: استبدل بـ Supabase query.
 */
export function resolveAvailableSlots(specialistId: string): SlotAvailabilityResult {
  try {
    const specialist = MOCK_SPECIALISTS.find((s) => s.specialistId === specialistId);
    if (!specialist) {
      return { status: "empty", slots: [], specialist: null, resolvedAt: new Date().toISOString() };
    }

    const slots = generateMockSlots(specialistId, specialist.sessionDurationMinutes);
    return {
      status: slots.length > 0 ? "available" : "empty",
      slots,
      specialist,
      resolvedAt: new Date().toISOString(),
    };
  } catch {
    return { status: "error", slots: [], specialist: null, resolvedAt: new Date().toISOString() };
  }
}

/**
 * resolveSpecialistById()
 *
 * يُعيد بيانات أخصائي بـ ID محدد.
 * يُستخدم في SlotSelectionPage لعرض اسم الأخصائي في الـ header.
 */
export function resolveSpecialistById(specialistId: string): SpecialistProfile | null {
  return MOCK_SPECIALISTS.find((s) => s.specialistId === specialistId) ?? null;
}

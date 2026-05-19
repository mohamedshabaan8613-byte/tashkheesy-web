/**
 * consultationCopy.ts — Contextual Copy Layer
 *
 * Sprint 3.0d | Phase 2 — Experience Layer
 *
 * يحتوي على جميع النصوص السياقية لـ consultation journey.
 * لا يحتوي على business logic — نصوص فقط.
 *
 * الفصل بين النص واللوجيك يجعل الصفحة قابلة لـ:
 *   - تغيير النصوص بدون لمس ال component
 *   - الترجمة المستقبلية
 *   - A/B testing للنصوص
 */

import type {
  ConsultationEntryPoint,
  ConsultationIntent,
  AssessmentResultPayload,
} from "../types/consultationTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntryPointCopy {
  /** العنوان الرئيسي للصفحة */
  title: string;
  /** وصف تفصيلي */
  description: string;
  /** شارة badge تدل على نوع الرحلة */
  badge: string;
  /** رسالة تعاطفية تظهر أسفل العنوان */
  emotionalCue: string;
}

export interface StepCopy {
  title: string;
  description: string;
}

export interface ResultSummaryCopy {
  /** إكسسوري emoji لنوع التقييم */
  icon: string;
  /** نص موجز: "تقييم أحمد" أو "تقييم ذاتي" */
  label: string;
  /** تفسير result key بلغة طبيعية */
  resultDescription: string;
}

// ---------------------------------------------------------------------------
// resolveIntroCopy — النص الرئيسي
// ---------------------------------------------------------------------------

/**
 * يعيد النص الصحيح بناءً على intent.
 * يجب استدعاؤه في الـ component فقط — لا يحتوي على logic.
 */
export function resolveIntroCopy(
  intent: ConsultationIntent | null
): EntryPointCopy {
  if (!intent) return COPY_DIRECT_BOOKING;

  switch (intent.entryPoint) {
    case "assessment_result": {
      const name = intent.assessmentResult?.subjectName;
      const isChild =
        intent.assessmentResult?.pathType === "child_assessment";
      return {
        title: isChild
          ? `الخطوة التالية: استشارة متخصصة لـ${name ? ` ${name}` : " طفلك"}`
          : `الخطوة التالية: استشارة تتناسب مع نتيجتك`,
        description: isChild
          ? `بناءً على ما ظهر في التقييم، سنوجّهك إلى المتخصص الأنسب لحالة ${name ?? "طفلك"}، دون الحاجة لإعادة شرح كل شيء من البداية.`
          : `تقييمك تم — والآن سنختار معك المتخصص الأنسب بناءً على ما أظهرته إجاباتك. لا تحتاج لإعادة البداية.`,
        badge: "مسار سياقي — بعد التقييم",
        emotionalCue: isChild
          ? `نحن هنا معك — كل خطوة تفعلها لطفلك تستحق كل الدعم.`
          : `طلب المساعدة قرار شجاع — والخطوة التالية أقرب مما تتوقع.`,
      };
    }

    case "follow_up":
      return COPY_FOLLOW_UP;

    case "returning_user":
      return COPY_RETURNING_USER;

    case "direct_booking":
    default:
      return COPY_DIRECT_BOOKING;
  }
}

// ---------------------------------------------------------------------------
// resolveCtaLabel — نص زر CTA
// ---------------------------------------------------------------------------

/**
 * يعيد نص الزر الرئيسي بناءً على entryPoint.
 */
export function resolveCtaLabel(
  entryPoint: ConsultationEntryPoint | undefined
): string {
  switch (entryPoint) {
    case "assessment_result":
      return "متابعة — حجز استشارة";
    case "follow_up":
      return "حجز جلسة متابعة";
    case "returning_user":
      return "حجز استشارة جديدة";
    case "direct_booking":
    default:
      return "ابدأ حجز استشارتك";
  }
}

// ---------------------------------------------------------------------------
// resolveSteps — خطوات الرحلة
// ---------------------------------------------------------------------------

export function resolveSteps(entryPoint: ConsultationEntryPoint | undefined): StepCopy[] {
  switch (entryPoint) {
    case "assessment_result":
      return [
        { title: "مراجعة النتيجة", description: "سيرى المتخصص تقييمك قبل الجلسة." },
        { title: "اختيار المتخصص", description: "تختار موعداً مناسباً لك." },
        { title: "تأكيد الجلسة", description: "تصلك تفاصيل الجلسة فور التأكيد." },
      ];
    case "follow_up":
      return [
        { title: "مراجعة سجلك", description: "سيطلع المتخصص على ملاحظات الجلسات السابقة." },
        { title: "اختيار الموعد", description: "تحديد وقت مناسب لجلسة المتابعة." },
        { title: "تأكيد الحجز", description: "تصلك تفاصيل الجلسة فوراً." },
      ];
    default:
      return [
        { title: "فهم احتياجاتك", description: "سنساعدك في تحديد أنسب تخصص لحالتك." },
        { title: "اختيار المتخصص", description: "تختار المتخصص والوقت المناسب لك." },
        { title: "تأكيد الجلسة", description: "تصلك تفاصيل الجلسة فور التأكيد." },
      ];
  }
}

// ---------------------------------------------------------------------------
// resolveResultSummary — ملخص نتيجة التقييم
// ---------------------------------------------------------------------------

/**
 * يعيد تلخيصاً مقروءاً من AssessmentResultPayload.
 * يُعرض داخل ResultSummaryCard في صفحة intro.
 */
export function resolveResultSummary(
  result: AssessmentResultPayload
): ResultSummaryCopy {
  const isChild = result.pathType === "child_assessment";

  const icon = isChild ? "👦" : "🧑";

  const label = isChild
    ? `تقييم ${result.subjectName ?? "الطفل"}`
    : `تقييمك الذاتي`;

  // تفسير لغوي مبسط للـ result key
  const resultDescription = resolveResultKeyDescription(result.resultKey);

  return { icon, label, resultDescription };
}

/**
 * يحوّل result key إلى نص بشري.
 * يجب توسيع هذه القائمة بناءً على result keys الفعلية في Sprint 3.1.
 */
function resolveResultKeyDescription(resultKey: string): string {
  const map: Record<string, string> = {
    high_risk: "أظهرت النتيجة مؤشرات تستحق متابعة منطقية مع متخصص",
    moderate: "أظهرت النتيجة بعض المؤشرات التي تستحق التقييم التخصصي",
    low_risk: "أظهرت النتيجة مؤشرات محدودة — الاستشارة تجيب على تساؤلاتك",
    needs_evaluation: "نتائجك تشير إلى ضرورة تقييم أكثر دقة من متخصص",
  };
  return map[resultKey] ?? `نتيجة التقييم: ${resultKey}`;
}

// ---------------------------------------------------------------------------
// Static copy blocks (used when dynamic resolution is not needed)
// ---------------------------------------------------------------------------

const COPY_DIRECT_BOOKING: EntryPointCopy = {
  title: "ابدأ استشارتك مع المتخصص المناسب",
  description:
    "يمكنك البدء بجلسة أولية لفهم احتياجاتك، واختيار التخصص الأنسب قبل إكمال الحجز.",
  badge: "دخول مباشر للاستشارة",
  emotionalCue:
    "أنت في المكان الصحيح — الخطوة الأولى في طريق الحصول على الدعم المناسب.",
};

const COPY_FOLLOW_UP: EntryPointCopy = {
  title: "جلسة متابعة — نكمل من حيث توقفنا",
  description:
    "لديك جلسة سابقة مع أحد متخصصينا، ويمكنك الآن تحديد موعد لمتابعة الرحلة.",
  badge: "جلسة متابعة",
  emotionalCue:
    "استمرارية الدعم تصنع فارقًا — نحن هنا معك.",
};

const COPY_RETURNING_USER: EntryPointCopy = {
  title: "أهلاً بعودتك — هل أنت مستعد لجلسة جديدة؟",
  description:
    "يمكنك حجز استشارة جديدة أو متابعة رحلتك مع نفس المتخصص.",
  badge: "مستخدم عائد",
  emotionalCue:
    "نتذكر رحلتك — ونحن سعداء باستمرار دعمك.",
};

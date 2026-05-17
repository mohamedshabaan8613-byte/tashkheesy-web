/**
 * assessmentCopy.ts
 * Sprint 2.2 — Step 2: UX copy layer
 *
 * كل النصوص الظاهرة للمستخدم في صفحة SelfAssessment.
 * فصل النصوص عن المنطق يُمكّن:
 * - tone experiments سريعة
 * - localization مستقبلية
 * - A/B testing على copy دون لمس المنطق
 *
 * القاعدة: لا import من React هنا. نصوص خالصة فقط.
 */

export const COPY = {
  // ─── الصفحة العامة
  pageTitle:  "التقييم الذاتي — تشخيصي | Tashkheesy",
  backButton: "تغيير المسار",
  brandName:  "تشخيصي",

  // ─── Auth Gate
  authGate: {
    headline:    "احفظ نتيجتك بأمان",
    body:        "قبل بدء الفحص، سجّل دخولك بالبريد الإلكتروني حتى تتمكن من الرجوع إلى نتيجتك لاحقًا ومتابعة خطواتك بسهولة.",
    reassurance: "لن نطلب كلمة مرور. سنرسل لك رابط دخول آمن إلى بريدك الإلكتروني.",
    loginCta:    "تسجيل الدخول ومتابعة الفحص",
    backLink:    "العودة لاختيار نوع الفحص",
  },

  // ─── History Panel
  history: {
    sectionTitle:    "نتائجك السابقة على هذا الجهاز",
    sectionSubtitle: "يمكنك عرض آخر نتيجة أو بدء تقييم جديد.",
    viewLatest:      "عرض آخر نتيجة",
    startNew:        "بدء تقييم جديد",
    showOlder:       (count: number) => `عرض كل النتائج السابقة (${count})`,
    hideOlder:       "إخفاء النتائج السابقة",
    viewResult:      "عرض النتيجة",
    privacyNote:     "يتم حفظ هذه النتائج على هذا الجهاز فقط. لتخزينها بشكل دائم لاحقًا، سنوفر ربطها بحسابك.",
    otherPaths:      "نتائج أخرى محفوظة على هذا الجهاز",
    view:            "عرض",
  },

  // ─── Hero
  hero: {
    badgeSuffix: "— تقييم ذاتي مجاني",
    titleNew:    "أقيّم نفسي",
    titleRepeat: "بدء تقييم جديد",
    subtitle:    "فحص أولي لفهم أنماط تعلمك وانتباهك — الخطوة الأولى نحو فهم أعمق لنفسك",
  },

  // ─── Form
  form: {
    sectionTitle:    "بعض المعلومات الأساسية",
    nameLabel:       "اسمك (أو اسم مستعار)",
    namePlaceholder: "مثال: أحمد أو مستخدم",
    nameError:       "يرجى إدخال اسمك",
    ageLabel:        "عمرك (بالسنوات)",
    agePlaceholder:  "مثال: 22",
    ageErrorEmpty:   "يرجى إدخال عمرك",
    ageErrorMin:     "هذا المسار مخصص للأعمار ١٦ سنة فأكثر — لتقييم الأطفال استخدم مسار 'أقيّم طفلي'",
    ageErrorMax:     "يرجى إدخال عمر صحيح",
    ageHint:         "هذا المسار مخصص للأعمار ١٦ سنة فأكثر",
    privacyNote:     "بياناتك محمية وسرية تماماً — لا تُشارك مع أي جهة. هذا الفحص لا يُعدّ تشخيصاً رسمياً.",
    submitNew:       "ابدأ التقييم الذاتي",
    submitRepeat:    "ابدأ تقييماً جديداً",
  },

  // ─── Coverage Panel
  coverage: {
    title: "ما يشمله هذا الفحص",
  },
} as const;

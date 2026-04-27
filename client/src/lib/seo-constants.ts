/**
 * seo-constants.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * مصدر مركزي لجميع ثوابت SEO في المشروع.
 * عند تغيير الدومين أو اسم الموقع، يكفي التعديل هنا فقط.
 */

export const SEO = {
  /** الدومين الرسمي للموقع (بدون trailing slash) */
  BASE_URL: "https://www.tashkheesy.com",

  /** اسم الموقع كما يظهر في العنوان والـ og:site_name */
  SITE_NAME: "تشخيصي | Tashkheesy",

  /** الوصف الافتراضي للموقع */
  DEFAULT_DESCRIPTION:
    "تشخيصي (Tashkheesy) — منصة عربية تقدم فحصاً أولياً مجانياً مدعوماً بالذكاء الاصطناعي لمساعدة الأسر على فهم مؤشرات صعوبات التعلم وتشتت الانتباه لدى الأطفال.",

  /** الكلمات المفتاحية الافتراضية */
  DEFAULT_KEYWORDS:
    "تشخيص صعوبات تعلم, ديسلكسيا السعودية, صعوبات القراءة, تشخيص تربوي, تشخيصي, Tashkheesy",

  /** صورة الـ Open Graph الافتراضية */
  DEFAULT_OG_IMAGE: "https://www.tashkheesy.com/og-image.jpg",

  /** اللغة والمنطقة */
  LOCALE: "ar_SA",

  /** بيانات التواصل — تهجئة Tashkheesy الموحَّدة */
  CONTACT: {
    EMAIL: "support@tashkheesy.com",
    PRIVACY_EMAIL: "privacy@tashkheesy.com",
    WHATSAPP: "+966500000000",
  },

  /** بيانات الموقع الجغرافي */
  ADDRESS: {
    COUNTRY: "SA",
    COUNTRY_NAME: "Saudi Arabia",
    CITY: "الرياض",
    REGION: "منطقة الرياض",
  },

  /** الأسعار */
  PRICES: {
    CHILDREN: "299",
    UNIVERSITY: "349",
    CURRENCY: "SAR",
  },
} as const;

/**
 * دالة مساعدة لبناء عنوان الصفحة بالصيغة الموحَّدة
 * مثال: buildTitle("الخدمات") → "الخدمات | تشخيصي"
 */
export const buildTitle = (pageTitle: string): string =>
  `${pageTitle} | ${SEO.SITE_NAME}`;

/**
 * دالة مساعدة لبناء الـ canonical URL
 * مثال: buildCanonical("/services") → "https://www.tashkheesy.com/services"
 */
export const buildCanonical = (path: string): string =>
  `${SEO.BASE_URL}${path}`;

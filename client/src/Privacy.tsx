/*
 * تشخيصي — صفحة سياسة الخصوصية (نسخة محسّنة)
 * Editorial Healthcare · Arabic-first · Human-readable · Reassuring
 * Simple, transparent, respectful — not a heavy legal document
 * Palette: #F8FAFC bg · #0F172A text · #2563EB accent · #14B8A6 secondary
 */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  Lock,
  Eye,
  Trash2,
  Heart,
  CheckCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";

// ─── بيانات الأقسام ──────────────────────────────────────────────────────────
const sections = [
  {
    id: "collect",
    icon: Eye,
    title: "ما الذي نجمعه؟",
    subtitle: "فقط ما هو ضروري لتقديم الخدمة",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    items: [
      {
        label: "بيانات التواصل",
        text: "الاسم، البريد الإلكتروني، ورقم الجوال — فقط عند إنشاء حجز أو التواصل معنا.",
      },
      {
        label: "بيانات الطفل أو المستخدم",
        text: "الاسم، العمر، المرحلة الدراسية، وأي ملاحظات تقدّمها طوعاً لمساعدة الأخصائي على تقديم استشارة أفضل.",
      },
      {
        label: "إجابات الفحص",
        text: "الإجابات التي تُدخلها خلال الفحص تُستخدم حصراً لتوليد النتيجة وشرحها. لا تُشارك مع أي جهة خارجية.",
      },
      {
        label: "بيانات الاستخدام التقنية",
        text: "معلومات مجهولة الهوية مثل نوع المتصفح والجهاز وصفحات الزيارة — لتحسين تجربة الموقع فقط.",
      },
    ],
  },
  {
    id: "use",
    icon: Heart,
    title: "كيف نستخدم بياناتك؟",
    subtitle: "لخدمتك فقط، لا لأغراض أخرى",
    color: "#14B8A6",
    bg: "#F0FDFA",
    border: "#99F6E4",
    items: [
      {
        label: "تقديم الخدمة",
        text: "نستخدم بياناتك لتنسيق جلسات التشخيص مع الأخصائيين، وإرسال تأكيدات الحجز والتذكيرات.",
      },
      {
        label: "تحسين المنصة",
        text: "نستخدم البيانات المجمَّعة ومجهولة الهوية لتحسين جودة الخدمة وتطوير المنصة. لا نستخدم بياناتك الشخصية لهذا الغرض.",
      },
      {
        label: "التواصل معك",
        text: "قد نرسل تذكيرات بالمواعيد أو تحديثات تخص حجزك. لن نرسل إعلانات تجارية دون موافقتك الصريحة.",
      },
    ],
  },
  {
    id: "protect",
    icon: Lock,
    title: "كيف نحمي بياناتك؟",
    subtitle: "أمان تقني من أعلى المستويات",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    items: [
      {
        label: "تشفير كامل",
        text: "جميع البيانات المنقولة بين متصفحك وخوادمنا مشفَّرة باستخدام بروتوكول TLS 1.3 — المعيار الأعلى في الصناعة.",
      },
      {
        label: "وصول محدود",
        text: "فقط الفريق التقني المخوَّل يمكنه الوصول إلى البيانات، وذلك بأدنى الصلاحيات اللازمة لتشغيل الخدمة.",
      },
      {
        label: "لا مشاركة مع أطراف ثالثة",
        text: "لا نبيع بياناتك ولا نشاركها مع أي جهة تجارية أو إعلانية. نتائج فحصك لا يراها إلا أنت والأخصائي الذي تختاره.",
      },
    ],
  },
  {
    id: "rights",
    icon: Shield,
    title: "حقوقك كاملة",
    subtitle: "أنت تتحكم في بياناتك دائماً",
    color: "#F59E0B",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "الحق في الاطلاع",
        text: "يمكنك طلب نسخة من جميع بياناتك المحفوظة لدينا في أي وقت.",
      },
      {
        label: "الحق في التصحيح",
        text: "إذا كانت بياناتك غير دقيقة، يمكنك طلب تصحيحها فوراً.",
      },
      {
        label: "الحق في الحذف",
        text: "يمكنك طلب حذف جميع بياناتك من منصتنا في أي وقت. سننفّذ طلبك خلال ٧٢ ساعة عمل.",
      },
      {
        label: "الحق في الرفض",
        text: "يمكنك إلغاء الاشتراك في أي رسائل تسويقية في أي وقت عبر رابط إلغاء الاشتراك في أي بريد إلكتروني نرسله.",
      },
    ],
  },
  {
    id: "retention",
    icon: Trash2,
    title: "متى نحذف بياناتك؟",
    subtitle: "لا نحتفظ بما لا نحتاجه",
    color: "#14B8A6",
    bg: "#F0FDFA",
    border: "#99F6E4",
    items: [
      {
        label: "بيانات الحجز",
        text: "نحتفظ ببيانات الحجز لمدة ٣ سنوات لأغراض المتابعة الطبية، ثم تُحذف تلقائياً.",
      },
      {
        label: "نتائج الفحص",
        text: "نتائج الفحص تُحفظ في حسابك لمدة ١٢ شهراً، ويمكنك حذفها في أي وقت.",
      },
      {
        label: "بيانات الاستخدام",
        text: "البيانات التقنية المجهولة تُحذف بعد ٩٠ يوماً.",
      },
    ],
  },
];

// ─── مكوّن قسم واحد ──────────────────────────────────────────────────────────
function PrivacySection({ section }: { section: (typeof sections)[0] }) {
  const Icon = section.icon;
  return (
    <div
      id={`section-${section.id}`}
      className="rounded-3xl p-8 lg:p-10"
      style={{
        background: "white",
        border: `1px solid ${section.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: section.bg, border: `1px solid ${section.border}` }}
        >
          <Icon size={24} style={{ color: section.color }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
          >
            {section.title}
          </h2>
          <p
            className="text-sm text-slate-500"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {section.subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-5">
        {section.items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle size={18} style={{ color: section.color }} />
            </div>
            <div>
              <p
                className="font-semibold text-slate-900 text-sm mb-1"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {item.label}
              </p>
              <p
                className="text-slate-600 text-sm leading-relaxed"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function Privacy() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#F8FAFC", direction: "rtl" }}
    >
      <Navbar />

      {/* Hero */}
      <section
        className="pt-28 pb-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #F0FDFA 0%, #EFF6FF 50%, #F8FAFC 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #14B8A640, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/">
              <span
                className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الرئيسية
              </span>
            </Link>
            <ArrowLeft size={14} className="text-slate-400" />
            <span
              className="text-sm text-teal-600 font-medium"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              سياسة الخصوصية
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #14B8A6, #2563EB)" }}
            >
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1
                className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                خصوصيتك
                <span
                  className="mr-3"
                  style={{
                    background: "linear-gradient(135deg, #14B8A6, #2563EB)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  أولويتنا
                </span>
              </h1>
              <p
                className="text-lg text-slate-600 leading-relaxed max-w-2xl"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                نؤمن أن الثقة تُبنى بالشفافية. هذه الصفحة تشرح بلغة بسيطة وواضحة
                كيف نتعامل مع بياناتك — دون تعقيد قانوني غير ضروري.
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: "🔒", text: "تشفير TLS 1.3" },
              { icon: "🚫", text: "لا بيع للبيانات" },
              { icon: "👁️", text: "شفافية كاملة" },
              { icon: "✋", text: "حق الحذف في أي وقت" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "white",
                  border: "1px solid #E2E8F0",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  color: "#475569",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>

          <p
            className="text-xs text-slate-400 mt-6"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            آخر تحديث: مارس ٢٠٢٥
          </p>
        </div>
      </section>

      {/* Quick Nav */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#section-${s.id}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-50"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    color: "#64748B",
                    textDecoration: "none",
                  }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section) => (
            <PrivacySection key={section.id} section={section} />
          ))}

          {/* Cookies note */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
          >
            <div className="flex gap-4">
              <span className="text-2xl flex-shrink-0">🍪</span>
              <div>
                <h3
                  className="font-bold text-slate-900 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  ملفات الارتباط (Cookies)
                </h3>
                <p
                  className="text-sm text-slate-600 leading-relaxed"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    lineHeight: 1.9,
                  }}
                >
                  نستخدم ملفات ارتباط أساسية لتشغيل الموقع (مثل تذكّر جلستك)،
                  وملفات تحليلية مجهولة الهوية لفهم كيفية استخدام الموقع وتحسينه.
                  يمكنك إيقاف ملفات الارتباط من إعدادات متصفحك، لكن ذلك قد يؤثر
                  على بعض وظائف الموقع.
                </p>
              </div>
            </div>
          </div>

          {/* Children note */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
          >
            <div className="flex gap-4">
              <span className="text-2xl flex-shrink-0">👶</span>
              <div>
                <h3
                  className="font-bold text-slate-900 mb-2"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  خصوصية الأطفال
                </h3>
                <p
                  className="text-sm text-slate-600 leading-relaxed"
                  style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    lineHeight: 1.9,
                  }}
                >
                  بيانات الأطفال دون ١٨ عاماً تُجمع فقط بموافقة وليّ الأمر. نحن
                  نأخذ خصوصية الأطفال بجدية بالغة ونلتزم بأعلى معايير الحماية. لا
                  نستخدم بيانات الأطفال لأي أغراض تجارية أو إعلانية.
                </p>
              </div>
            </div>
          </div>

          {/* Updates note */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "white", border: "1px solid #E2E8F0" }}
          >
            <p
              className="text-sm text-slate-500 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              <strong className="text-slate-700">تحديثات السياسة:</strong> قد نُحدِّث
              هذه السياسة من وقت لآخر. سيتم إشعارك بأي تغييرات جوهرية عبر البريد
              الإلكتروني أو إشعار بارز على الموقع قبل ٣٠ يوماً من دخول التغييرات
              حيز التنفيذ.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, #0F172A, #1E3A8A)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <Mail size={24} className="text-teal-400" />
            </div>
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              لديك سؤال حول خصوصيتك؟
            </h3>
            <p
              className="text-slate-300 mb-8 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              فريقنا جاهز للإجابة على أي استفسار يتعلق ببياناتك أو حقوقك.
              <br />
              نردّ على جميع الاستفسارات خلال ٢٤ ساعة عمل.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@tashkheesy.com"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                  color: "white",
                  fontFamily: "'Cairo', sans-serif",
                  textDecoration: "none",
                }}
              >
                <Mail size={16} />
                privacy@tashkheesy.com
              </a>
              <Link href="/faq">
                <span
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  الأسئلة الشائعة
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

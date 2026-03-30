import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Shield, Lock, Eye, Trash2, Mail, ChevronLeft } from "lucide-react";

const sections = [
  {
    id: "collect",
    icon: Eye,
    title: "البيانات التي نجمعها",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    content: [
      {
        subtitle: "بيانات الهوية والتواصل",
        text: "نجمع الاسم الكامل، البريد الإلكتروني، رقم الجوال، والدولة عند إنشاء حجز أو التواصل معنا.",
      },
      {
        subtitle: "بيانات الطفل أو الطالب",
        text: "نجمع الاسم، العمر، المرحلة الدراسية، وأي ملاحظات طبية أو تعليمية تقدّمها طوعاً لمساعدة الأخصائي.",
      },
      {
        subtitle: "بيانات الاستخدام",
        text: "نجمع معلومات تقنية مجهولة الهوية مثل نوع المتصفح والجهاز وصفحات الزيارة عبر Google Analytics لتحسين تجربة الموقع.",
      },
    ],
  },
  {
    id: "use",
    icon: Shield,
    title: "كيف نستخدم بياناتك",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    content: [
      {
        subtitle: "تقديم الخدمة",
        text: "نستخدم بياناتك حصراً لتنسيق جلسات التشخيص مع الأخصائيين، وإرسال تأكيدات الحجز والتقارير.",
      },
      {
        subtitle: "التواصل",
        text: "قد نرسل لك تذكيرات بالمواعيد أو تحديثات تخص حجزك. لن نرسل إعلانات تجارية دون موافقتك الصريحة.",
      },
      {
        subtitle: "التحسين المستمر",
        text: "نستخدم البيانات المجمَّعة ومجهولة الهوية لتحسين جودة الخدمة وتطوير المنصة.",
      },
    ],
  },
  {
    id: "protect",
    icon: Lock,
    title: "كيف نحمي بياناتك",
    color: "text-amber-600",
    bg: "bg-amber-50",
    content: [
      {
        subtitle: "التشفير",
        text: "جميع البيانات المنقولة بين متصفحك وخوادمنا مشفَّرة باستخدام بروتوكول TLS 1.3.",
      },
      {
        subtitle: "تقييد الوصول",
        text: "لا يصل إلى بياناتك الشخصية إلا الأخصائي المعيَّن لجلستك وفريق الدعم المخوَّل.",
      },
      {
        subtitle: "عدم البيع",
        text: "لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تجارية تحت أي ظرف.",
      },
    ],
  },
  {
    id: "rights",
    icon: Trash2,
    title: "حقوقك",
    color: "text-rose-600",
    bg: "bg-rose-50",
    content: [
      {
        subtitle: "حق الاطلاع",
        text: "يحق لك طلب نسخة من جميع البيانات التي نحتفظ بها عنك في أي وقت.",
      },
      {
        subtitle: "حق التصحيح",
        text: "يمكنك تصحيح أي بيانات غير دقيقة بالتواصل معنا مباشرةً.",
      },
      {
        subtitle: "حق الحذف",
        text: "يحق لك طلب حذف بياناتك بالكامل. سنُنجز طلبك خلال 30 يوماً وفق اشتراطات الأنظمة السارية.",
      },
    ],
  },
];

export default function Privacy() {
  useSEO({
    title: "سياسة الخصوصية",
    description: "سياسة الخصوصية لمنصة تشخيصي: كيف نجمع بياناتك ونحميها ونستخدمها.",
    canonical: "/privacy",
    noIndex: true,
  });
  const lastUpdated = "4 مارس 2026";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-14 bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link href="/">
                  <a className="hover:text-indigo-600 transition-colors">الرئيسية</a>
                </Link>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-slate-800 font-medium">سياسة الخصوصية</span>
              </nav>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    سياسة الخصوصية
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    آخر تحديث: {lastUpdated}
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed">
                نحن في <strong>تشخيصي</strong> نُولي خصوصية بياناتك أهمية قصوى. تُوضّح
                هذه السياسة بشفافية كيفية جمع بياناتك واستخدامها وحمايتها عند
                استخدامك لمنصتنا.
              </p>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto space-y-12">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} id={section.id}>
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-10 h-10 rounded-xl ${section.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {section.title}
                      </h2>
                    </div>

                    {/* Sub-sections */}
                    <div className="space-y-5 pr-4 border-r-2 border-slate-100">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          <h3 className="font-semibold text-slate-800 mb-1">
                            {item.subtitle}
                          </h3>
                          <p className="text-slate-600 leading-relaxed text-sm">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Cookies */}
              <div id="cookies">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-violet-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">ملفات الكوكيز</h2>
                </div>
                <div className="space-y-5 pr-4 border-r-2 border-slate-100">
                  <p className="text-slate-600 leading-relaxed text-sm">
                    نستخدم ملفات كوكيز ضرورية لتشغيل الموقع (مثل حفظ تفضيلاتك)
                    وكوكيز تحليلية مجهولة الهوية عبر Google Analytics لفهم كيفية
                    استخدام الموقع. يمكنك تعطيل الكوكيز من إعدادات متصفحك في أي وقت،
                    مع العلم أن ذلك قد يؤثر على بعض وظائف الموقع.
                  </p>
                </div>
              </div>

              {/* Retention */}
              <div id="retention">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    مدة الاحتفاظ بالبيانات
                  </h2>
                </div>
                <div className="pr-4 border-r-2 border-slate-100">
                  <p className="text-slate-600 leading-relaxed text-sm">
                    نحتفظ ببيانات الحجز والتقارير لمدة <strong>3 سنوات</strong> من
                    تاريخ آخر جلسة، وذلك لأغراض قانونية ومتابعة الحالة. بعد انتهاء
                    هذه المدة، يتم حذف البيانات تلقائياً أو إخفاء هويتها. يمكنك طلب
                    الحذف المبكر في أي وقت.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div
                id="contact"
                className="rounded-2xl bg-indigo-50 border border-indigo-100 p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                      تواصل مع مسؤول حماية البيانات
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      لأي استفسار يتعلق بهذه السياسة أو لممارسة حقوقك، تواصل معنا
                      مباشرةً:
                    </p>
                    <a
                      href="mailto:privacy@tashkhisi.com"
                      className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      privacy@tashkhisi.com
                    </a>
                    <p className="text-slate-500 text-xs mt-3">
                      نلتزم بالرد على جميع الطلبات خلال <strong>72 ساعة</strong> من
                      استلامها.
                    </p>
                  </div>
                </div>
              </div>

              {/* Updates note */}
              <div className="text-sm text-slate-500 border-t pt-6">
                <p>
                  قد نُحدِّث هذه السياسة من وقت لآخر. سيتم إشعارك بأي تغييرات
                  جوهرية عبر البريد الإلكتروني أو إشعار بارز على الموقع قبل 30 يوماً
                  من دخول التغييرات حيز التنفيذ.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

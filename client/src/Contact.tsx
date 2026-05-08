/**
 * تشخيصي — صفحة التواصل
 * Editorial Healthcare Design System
 * Background: #F4EFE8 | Surface: #FFFFFF | Primary: #1E4E8C | Secondary: #2BBDB6 | Warm: #F4C46A
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Mail, MapPin, Clock, ArrowLeft, Building2 } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    desc: "وسيلة التواصل الرسمية — ردّ خلال 24 ساعة في أيام العمل",
    value: "support@tashkheesy.sa",
    action: "mailto:support@tashkheesy.sa",
    color: "blue",
    badge: null,
  },
];

const officeInfo = [
  { icon: MapPin, label: "الموقع", value: "جدة، المملكة العربية السعودية" },
  { icon: Clock, label: "ساعات العمل", value: "من الساعة ١٠ صباحاً حتى ١٠ مساءً" },
  { icon: Building2, label: "الخدمات عن بُعد", value: "متاح لجميع مناطق المملكة" },
];

export default function Contact() {
  useSEO({
    title: "تواصل معنا",
    description: "تواصل مع فريق تشخيصي للاستفسار عن خدمات تشخيص صعوبات التعلم والديسلكسيا. نحن هنا للمساعدة.",
    keywords: "تواصل تشخيصي, استفسار تشخيص صعوبات تعلم, دعم تشخيصي",
    canonical: "/contact",
  });

  return (
    <div className="ts-page">
      <Navbar />

      <main className="flex-1">
        {/* ── Page Header ─────────────────────────────────────── */}
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="section-label block mb-4">نحن هنا لمساعدتك</span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#243B53] mb-5 leading-tight">
                تواصل مع{" "}
                <span className="tashkhisi-gradient-text">فريق تشخيصي</span>
              </h1>
              <p className="text-lg text-[#4A6278] leading-relaxed max-w-2xl mx-auto">
                لديك سؤال أو تحتاج مساعدة في اختيار الباقة المناسبة؟ فريقنا جاهز للإجابة على جميع استفساراتك.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact Methods ─────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                {contactMethods.map((method, i) => (
                  <a
                    key={i}
                    href={method.action}
                    className="ts-card rounded-2xl p-6 flex flex-col items-center text-center group no-underline"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors bg-[#DFF3F1] text-[#1E4E8C] group-hover:bg-[#DBEAFE]">
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#243B53]">{method.title}</h3>
                      {method.badge && (
                        <span className="ts-trust-badge text-xs py-0.5 px-2">{method.badge}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#4A6278] mb-2">{method.desc}</p>
                    <p className="text-sm font-semibold text-[#1E4E8C]">{method.value}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact Form + Info ─────────────────────────────── */}
        <section className="py-16 bg-[#F4EFE8]">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Form → mailto fallback */}
              <div>
                <h2 className="text-2xl font-bold text-[#243B53] mb-2">أرسل لنا رسالة</h2>
                <p className="text-[#4A6278] mb-8">سنردّ عليك خلال 24 ساعة في أيام العمل.</p>

                {/* Notice: direct email is the current official method */}
                <div className="ts-card rounded-2xl p-6 mb-6 flex items-start gap-4 border border-[#BFDBFE]">
                  <div className="w-10 h-10 rounded-xl bg-[#DFF3F1] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-[#1E4E8C]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#243B53] mb-1">
                      وسيلة التواصل الرسمية الحالية
                    </p>
                    <p className="text-sm text-[#4A6278] mb-3 leading-relaxed">
                      يمكنك التواصل معنا مباشرةً عبر البريد الإلكتروني الرسمي. سنردّ على استفسارك خلال 24 ساعة في أيام العمل.
                    </p>
                    <a
                      href="mailto:support@tashkheesy.sa"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #1E4E8C, #2BBDB6)" }}
                    >
                      <Mail className="w-4 h-4" />
                      support@tashkheesy.sa
                    </a>
                  </div>
                </div>

                {/* Mailto-based form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                    const subject = (form.elements.namedItem("subject") as HTMLSelectElement).value;
                    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
                    const body = encodeURIComponent(
                      `الاسم: ${name}\nالبريد: ${email}\n\n${message}`
                    );
                    window.location.href = `mailto:support@tashkheesy.sa?subject=${encodeURIComponent(subject)}&body=${body}`;
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#243B53] mb-1.5">الاسم الكامل *</label>
                      <input
                        name="name"
                        type="text"
                        className="ts-input"
                        placeholder="محمد أحمد"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#243B53] mb-1.5">رقم الجوال</label>
                      <input
                        name="phone"
                        type="tel"
                        className="ts-input"
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#243B53] mb-1.5">البريد الإلكتروني *</label>
                    <input
                      name="email"
                      type="email"
                      className="ts-input"
                      placeholder="example@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#243B53] mb-1.5">موضوع الرسالة</label>
                    <select name="subject" className="ts-input">
                      <option value="استفسار عام">استفسار عام</option>
                      <option value="حجز موعد">حجز موعد</option>
                      <option value="استفسار عن الأسعار">استفسار عن الأسعار</option>
                      <option value="باقة مؤسسية">باقة مؤسسية</option>
                      <option value="دعم فني">دعم فني</option>
                      <option value="شكوى أو اقتراح">شكوى أو اقتراح</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#243B53] mb-1.5">رسالتك *</label>
                    <textarea
                      name="message"
                      className="ts-input resize-none"
                      rows={5}
                      placeholder="اكتب رسالتك هنا..."
                      required
                    />
                  </div>

                  <button type="submit" className="ts-btn-primary w-full justify-center">
                    <Mail className="w-4 h-4" />
                    إرسال عبر البريد الإلكتروني
                  </button>
                  <p className="text-xs text-[#4A6278] text-center">
                    سيتم فتح تطبيق البريد الإلكتروني لإرسال رسالتك مباشرةً.
                  </p>
                </form>
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold text-[#243B53] mb-2">معلومات التواصل</h2>
                <p className="text-[#4A6278] mb-8">نحن متاحون لمساعدتك في أيام العمل.</p>

                <div className="space-y-4 mb-8">
                  {officeInfo.map((info, i) => (
                    <div key={i} className="ts-card rounded-xl p-4 flex items-center gap-4">
                      <div className="ts-icon-blue">
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-[#4A6278] font-medium">{info.label}</p>
                        <p className="text-sm font-semibold text-[#243B53]">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Commercial Registration Trust Note */}
                <div className="ts-card rounded-xl p-4 mb-8 border border-[#FDE68A] bg-[#FFFBEB]">
                  <p className="text-xs text-[#92400E] leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                    تشخيصي كير — سجل تجاري رقم 7052506925، موثق لدى منصة الأعمال.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-[#DFF3F1] to-[#DFF3F1] rounded-2xl p-6">
                  <h3 className="font-bold text-[#243B53] mb-4">روابط مفيدة</h3>
                  <div className="space-y-3">
                    {[
                      { label: "الأسئلة الشائعة", href: "/faq" },
                      { label: "سياسة الخصوصية", href: "/privacy" },
                      { label: "أسعار الباقات", href: "/pricing" },
                      { label: "احجز موعداً الآن", href: "/booking" },
                    ].map((link, i) => (
                      <Link key={i} href={link.href}>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-[#F4EFE8] transition-colors cursor-pointer group">
                          <span className="text-sm font-medium text-[#243B53]">{link.label}</span>
                          <ArrowLeft className="w-4 h-4 text-[#1E4E8C] group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="ts-cta-section max-w-4xl mx-auto">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  هل تريد البدء مباشرة؟
                </h2>
                <p className="text-blue-100 mb-6">
                  ابدأ بالفحص المجاني الآن — لا تحتاج للتواصل معنا أولاً.
                </p>
                <Link href="/children">
                  <button className="bg-white text-[#1E4E8C] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
                    ابدأ الفحص المجاني
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

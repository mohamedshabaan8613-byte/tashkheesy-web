/**
 * تشخيصي — صفحة التواصل
 * Editorial Healthcare Design System
 * Background: #F8FAFC | Surface: #FFFFFF | Primary: #2563EB | Secondary: #14B8A6 | Warm: #F59E0B
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2, ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "واتساب",
    desc: "ردّ فوري خلال دقائق",
    value: "+966 50 000 0000",
    action: "https://wa.me/966500000000",
    color: "teal",
    badge: "الأسرع"
  },
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    desc: "ردّ خلال 24 ساعة",
    value: "hello@tashkheesy.com",
    action: "mailto:hello@tashkheesy.com",
    color: "blue",
    badge: null
  },
  {
    icon: Phone,
    title: "الهاتف",
    desc: "من الأحد إلى الخميس",
    value: "+966 11 000 0000",
    action: "tel:+966110000000",
    color: "blue",
    badge: null
  },
];

const officeInfo = [
  { icon: MapPin, label: "الموقع", value: "الرياض، المملكة العربية السعودية" },
  { icon: Clock, label: "ساعات العمل", value: "الأحد – الخميس: 9 ص – 6 م" },
  { icon: Building2, label: "الخدمات عن بُعد", value: "متاح لجميع مناطق المملكة" },
];

export default function Contact() {
  useSEO({
    title: "تواصل معنا | تشخيصي",
    description: "تواصل مع فريق تشخيصي للاستفسار عن خدمات تشخيص صعوبات التعلم والديسلكسيا. نحن هنا للمساعدة.",
    keywords: "تواصل تشخيصي, استفسار تشخيص صعوبات تعلم, دعم تشخيصي",
    canonical: "/contact",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "استفسار عام",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSubmitted(true);
    toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
  };

  return (
    <div className="ts-page">
      <Navbar />

      <main className="flex-1">
        {/* ── Page Header ─────────────────────────────────────── */}
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <span className="section-label block mb-4">نحن هنا لمساعدتك</span>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5 leading-tight">
                تواصل مع{" "}
                <span className="tashkhisi-gradient-text">فريق تشخيصي</span>
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
                لديك سؤال أو تحتاج مساعدة في اختيار الباقة المناسبة؟ فريقنا جاهز للإجابة على جميع استفساراتك.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact Methods ─────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactMethods.map((method, i) => (
                <a
                  key={i}
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ts-card rounded-2xl p-6 flex flex-col items-center text-center group no-underline"
                  style={{ textDecoration: "none" }}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                    method.color === "teal"
                      ? "bg-[#F0FDFA] text-[#14B8A6] group-hover:bg-[#CCFBF1]"
                      : "bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#DBEAFE]"
                  }`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#0F172A]">{method.title}</h3>
                    {method.badge && (
                      <span className="ts-trust-badge text-xs py-0.5 px-2">{method.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#475569] mb-2">{method.desc}</p>
                  <p className="text-sm font-semibold text-[#2563EB]">{method.value}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Form + Info ─────────────────────────────── */}
        <section className="py-16 bg-[#F8FAFC]">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Form */}
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">أرسل لنا رسالة</h2>
                <p className="text-[#475569] mb-8">سنردّ عليك خلال 24 ساعة في أيام العمل.</p>

                {submitted ? (
                  <div className="ts-card rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-[#F0FDFA] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#14B8A6]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">تم إرسال رسالتك!</h3>
                    <p className="text-[#475569] mb-6">سنتواصل معك على البريد الإلكتروني خلال 24 ساعة.</p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "استفسار عام", message: "" }); }}
                      className="ts-btn-secondary"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">الاسم الكامل *</label>
                        <input
                          type="text"
                          className="ts-input"
                          placeholder="محمد أحمد"
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">رقم الجوال</label>
                        <input
                          type="tel"
                          className="ts-input"
                          placeholder="05xxxxxxxx"
                          value={formData.phone}
                          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        className="ts-input"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">موضوع الرسالة</label>
                      <select
                        className="ts-input"
                        value={formData.subject}
                        onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      >
                        <option value="استفسار عام">استفسار عام</option>
                        <option value="حجز موعد">حجز موعد</option>
                        <option value="استفسار عن الأسعار">استفسار عن الأسعار</option>
                        <option value="باقة مؤسسية">باقة مؤسسية</option>
                        <option value="دعم فني">دعم فني</option>
                        <option value="شكوى أو اقتراح">شكوى أو اقتراح</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">رسالتك *</label>
                      <textarea
                        className="ts-input resize-none"
                        rows={5}
                        placeholder="اكتب رسالتك هنا..."
                        value={formData.message}
                        onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                        required
                      />
                    </div>

                    <button type="submit" className="ts-btn-primary w-full justify-center">
                      <Send className="w-4 h-4" />
                      إرسال الرسالة
                    </button>
                  </form>
                )}
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">معلومات التواصل</h2>
                <p className="text-[#475569] mb-8">نحن متاحون لمساعدتك في أيام العمل.</p>

                <div className="space-y-4 mb-10">
                  {officeInfo.map((info, i) => (
                    <div key={i} className="ts-card rounded-xl p-4 flex items-center gap-4">
                      <div className="ts-icon-blue">
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-[#475569] font-medium">{info.label}</p>
                        <p className="text-sm font-semibold text-[#0F172A]">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F0FDFA] rounded-2xl p-6">
                  <h3 className="font-bold text-[#0F172A] mb-4">روابط مفيدة</h3>
                  <div className="space-y-3">
                    {[
                      { label: "الأسئلة الشائعة", href: "/faq" },
                      { label: "سياسة الخصوصية", href: "/privacy" },
                      { label: "أسعار الباقات", href: "/pricing" },
                      { label: "احجز موعداً الآن", href: "/booking" },
                    ].map((link, i) => (
                      <Link key={i} href={link.href}>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                          <span className="text-sm font-medium text-[#0F172A]">{link.label}</span>
                          <ArrowLeft className="w-4 h-4 text-[#2563EB] group-hover:-translate-x-1 transition-transform" />
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
                  <button className="bg-white text-[#2563EB] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md">
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

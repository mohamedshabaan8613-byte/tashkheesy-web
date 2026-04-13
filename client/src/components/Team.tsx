/*
 * تشخيصي — Team.tsx
 * Editorial Healthcare | Light mode | Arabic RTL
 *
 * ما تغيّر:
 * - إزالة المسارات المحلية المكسورة (/team/sarah.jpg إلخ)
 * - استبدالها بصور Unsplash موثوقة تعمل في production
 * - إعادة تصميم بطاقات الفريق بأسلوب Editorial Healthcare
 * - إضافة صورة حقيقية في كل بطاقة مع fallback avatar
 * - تحسين Hero section ليتوافق مع باقي الصفحات
 *
 * Palette: #F4EFE8 bg, #FFFFFF surface, #243B53 text, #1E4E8C primary, #2BBDB6 secondary
 */

import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GraduationCap,
  Award,
  Users,
  BookOpen,
  Star,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

// ─── بيانات الفريق مع صور Unsplash موثوقة ─────────────────────────────────
const TEAM = [
  {
    id: 1,
    name: "د. ليلى الشريف",
    title: "أخصائية صعوبات التعلم — رئيسة الفريق",
    // امرأة محترفة، خلفية هادئة، مناسبة للسياق الصحي التعليمي
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    initials: "لش",
    accentColor: "#1E4E8C",
    accentBg: "#DFF3F1",
    qualifications: [
      "دكتوراه في التربية الخاصة — جامعة الملك سعود",
      "ماجستير في صعوبات التعلم — جامعة الإمام",
      "بكالوريوس علم النفس التربوي",
    ],
    certifications: [
      "معتمدة من الجمعية السعودية للتربية الخاصة",
      "عضو الجمعية الدولية للديسلكسيا (IDA)",
      "مدربة معتمدة في برنامج أورتن-جيلنجهام",
    ],
    experience: "١٥ سنة",
    specialization: "صعوبات القراءة والكتابة (الديسلكسيا)",
    sessions: "١٢٠٠+",
    rating: 4.9,
  },
  {
    id: 2,
    name: "أ. محمد عبدالله الغامدي",
    title: "أخصائي صعوبات التعلم",
    // رجل محترف، مظهر أكاديمي هادئ
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    initials: "مع",
    accentColor: "#2BBDB6",
    accentBg: "#DFF3F1",
    qualifications: [
      "ماجستير في التربية الخاصة — جامعة أم القرى",
      "بكالوريوس صعوبات التعلم — جامعة الطائف",
      "دبلوم في تقييم وتشخيص صعوبات التعلم",
    ],
    certifications: [
      "معتمد من وزارة التعليم السعودية",
      "عضو الجمعية السعودية للتربية الخاصة",
      "مدرب معتمد في برنامج ويلسون للقراءة",
    ],
    experience: "١٠ سنوات",
    specialization: "صعوبات التعلم للأطفال (٦–١٢ سنة)",
    sessions: "٨٥٠+",
    rating: 4.8,
  },
  {
    id: 3,
    name: "أ. نورة خالد العتيبي",
    title: "أخصائية صعوبات التعلم",
    // امرأة محترفة، ابتسامة دافئة، مناسبة للسياق التعليمي
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    initials: "نخ",
    accentColor: "#F4C46A",
    accentBg: "#FFFBEB",
    qualifications: [
      "ماجستير في صعوبات التعلم — جامعة الملك سعود",
      "بكالوريوس علم النفس — جامعة الأميرة نورة",
      "دبلوم في الإرشاد النفسي",
    ],
    certifications: [
      "معتمدة من الهيئة السعودية للتخصصات الصحية",
      "عضو الجمعية الأمريكية لصعوبات التعلم (LDA)",
      "مدربة معتمدة في برنامج لينداموود-بيل",
    ],
    experience: "٨ سنوات",
    specialization: "صعوبات التعلم للمراهقين وطلاب الجامعة",
    sessions: "٦٠٠+",
    rating: 4.9,
  },
  {
    id: 4,
    name: "أ. أحمد سعيد القحطاني",
    title: "أخصائي علم النفس التربوي",
    // رجل في الأربعينات، مظهر أكاديمي موثوق
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face&auto=format&q=80",
    initials: "أس",
    accentColor: "#7C3AED",
    accentBg: "#F5F3FF",
    qualifications: [
      "ماجستير في علم النفس التربوي — جامعة الإمام",
      "بكالوريوس علم النفس — جامعة الملك فيصل",
      "دبلوم في التقييم النفسي",
    ],
    certifications: [
      "معتمد من الهيئة السعودية للتخصصات الصحية",
      "عضو الجمعية السعودية لعلم النفس",
      "مدرب معتمد في اختبارات وكسلر",
    ],
    experience: "١٢ سنة",
    specialization: "التقييم النفسي والمعرفي",
    sessions: "٩٠٠+",
    rating: 4.7,
  },
];

const STATS = [
  { icon: Users, value: "٤", label: "أخصائيين معتمدين", color: "#1E4E8C", bg: "#DFF3F1" },
  { icon: GraduationCap, value: "٤٥+", label: "سنة خبرة مجمعة", color: "#2BBDB6", bg: "#DFF3F1" },
  { icon: BookOpen, value: "٣٥٠٠+", label: "جلسة تشخيص", color: "#7C3AED", bg: "#F5F3FF" },
  { icon: Star, value: "٤.٨", label: "متوسط التقييم", color: "#F4C46A", bg: "#FFFBEB" },
];

const ACCREDITATIONS = [
  "الهيئة السعودية للتخصصات الصحية",
  "الجمعية السعودية للتربية الخاصة",
  "الجمعية الدولية للديسلكسيا (IDA)",
  "الجمعية الأمريكية لصعوبات التعلم (LDA)",
];

// ─── مكوّن صورة الأخصائي مع fallback ────────────────────────────────────────
function SpecialistAvatar({
  src,
  alt,
  initials,
  accentColor,
  accentBg,
}: {
  src: string;
  alt: string;
  initials: string;
  accentColor: string;
  accentBg: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accentBg} 0%, white 100%)` }}
      >
        <span
          className="text-3xl font-black"
          style={{ color: accentColor, fontFamily: "'Cairo', sans-serif" }}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

export default function Team() {
  useSEO({
    title: "فريق أخصائيي تشخيص صعوبات التعلم | تشخيصي",
    description:
      "تعرّف على فريق تشخيصي من أخصائيي صعوبات التعلم والقراءة المعتمدين في المملكة العربية السعودية. خبرة تتجاوز ١٠ سنوات في التشخيص التربوي.",
    keywords:
      "أخصائي صعوبات تعلم, أخصائي ديسلكسيا السعودية, فريق تشخيص تربوي, أخصائي تشخيص نفسي",
    canonical: "/team",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F4EFE8", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <Navbar />
      <main className="flex-grow">

        {/* ─── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative py-20 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #243B53 0%, #1E3A8A 60%, #0F766E 100%)",
          }}
        >
          {/* نقاط خلفية */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-2xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Users size={13} />
                فريق الأخصائيين
              </div>
              <h1
                className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                نخبة من الأخصائيين المعتمدين
              </h1>
              <p className="text-base text-blue-200 leading-relaxed max-w-xl mx-auto">
                يعمل فريقنا بشغف لمساعدة الأطفال والطلاب على فهم أنفسهم بشكل أوضح والوصول إلى إمكاناتهم الكاملة
              </p>
            </div>
          </div>
        </section>

        {/* ─── Stats ────────────────────────────────────────────────────────── */}
        <section className="py-10 -mt-6 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: "white",
                      border: "1px solid #D8E8E7",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: stat.bg }}
                    >
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                    <p
                      className="text-2xl font-black text-slate-900 mb-0.5"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Team Members ─────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#1E4E8C", letterSpacing: "0.12em" }}
              >
                تعرف على الفريق
              </p>
              <h2
                className="text-2xl md:text-3xl font-black text-slate-900 mb-3"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                جميع أخصائيينا حاصلون على مؤهلات عليا
              </h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                معتمدون من الجهات الرسمية المحلية والدولية في مجال التربية الخاصة وصعوبات التعلم
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {TEAM.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "white",
                    border: "1px solid #D8E8E7",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="flex">
                    {/* ─── صورة الأخصائي ─────────────────────────────────── */}
                    <div
                      className="w-32 flex-shrink-0 relative overflow-hidden"
                      style={{ minHeight: "220px" }}
                    >
                      <SpecialistAvatar
                        src={member.image}
                        alt={member.name}
                        initials={member.initials}
                        accentColor={member.accentColor}
                        accentBg={member.accentBg}
                      />
                      {/* شارة التقييم */}
                      <div
                        className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                        style={{ background: "rgba(255,255,255,0.92)", color: "#243B53" }}
                      >
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {member.rating}
                      </div>
                    </div>

                    {/* ─── محتوى البطاقة ─────────────────────────────────── */}
                    <div className="flex-1 p-5 min-w-0">
                      {/* الاسم والمسمى */}
                      <div className="mb-3">
                        <h3
                          className="text-base font-black text-slate-900 leading-tight mb-0.5"
                          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                        >
                          {member.name}
                        </h3>
                        <p className="text-xs font-semibold" style={{ color: member.accentColor }}>
                          {member.title}
                        </p>
                      </div>

                      {/* التخصص والخبرة */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: member.accentBg, color: member.accentColor }}
                        >
                          <BookOpen size={10} />
                          {member.specialization}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#DFF3F1", color: "#4A6278" }}
                        >
                          <Award size={10} />
                          {member.experience} خبرة
                        </span>
                      </div>

                      {/* المؤهلات */}
                      <div className="mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          المؤهلات
                        </p>
                        <ul className="space-y-1">
                          {member.qualifications.map((q, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-600 leading-relaxed">{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* الاعتمادات */}
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          الاعتمادات
                        </p>
                        <ul className="space-y-1">
                          {member.certifications.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle size={11} style={{ color: member.accentColor }} className="flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-600 leading-relaxed">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* عدد الجلسات */}
                      <div
                        className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between"
                      >
                        <span className="text-xs text-slate-400">جلسات مكتملة</span>
                        <span
                          className="text-sm font-black"
                          style={{ color: member.accentColor, fontFamily: "'Cairo', sans-serif" }}
                        >
                          {member.sessions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Accreditations ───────────────────────────────────────────────── */}
        <section className="py-16" style={{ background: "#DFF3F1" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "#1E4E8C", letterSpacing: "0.12em" }}
              >
                اعتماداتنا
              </p>
              <h2
                className="text-2xl font-black text-slate-900 mb-2"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                نفخر بحصولنا على اعتمادات من أبرز الجهات
              </h2>
              <p className="text-slate-500 text-sm">محلية ودولية في مجال التربية الخاصة وصعوبات التعلم</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {ACCREDITATIONS.map((name, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "white",
                    border: "1px solid #D8E8E7",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "#DFF3F1" }}
                  >
                    <Award size={18} style={{ color: "#1E4E8C" }} />
                  </div>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div
              className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #243B53 0%, #1E3A8A 60%, #0F766E 100%)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative">
                <h2
                  className="text-2xl md:text-3xl font-black text-white mb-3"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                >
                  جاهز للبدء مع فريقنا المتميز؟
                </h2>
                <p className="text-blue-200 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                  احجز موعدك الآن واحصل على تقييم احترافي من أخصائيين معتمدين — خطوة أولى نحو الوضوح
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/booking">
                    <button
                      className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-slate-900 font-bold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "white",
                        fontFamily: "'Cairo', sans-serif",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      }}
                    >
                      احجز موعدك الآن
                      <ArrowLeft size={16} />
                    </button>
                  </Link>
                  <Link href="/services">
                    <button
                      className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        color: "white",
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      تعرف على الخدمات
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

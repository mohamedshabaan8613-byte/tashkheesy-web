/*
 * تشخيصي — Booking MVP Page
 * Editorial Healthcare style — Arabic-first
 * Full 4-step booking flow: Service → Specialist → Date/Time → Confirmation
 * Colors: #F4EFE8 bg, #1E4E8C primary, #2BBDB6 secondary, #F4C46A warm
 * Fonts: Cairo (headings), IBM Plex Sans Arabic (body)
 * Static MVP — no backend required, realistic mock data
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Star,
  Shield,
  MessageCircle,
  Award,
  Languages,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Heart,
  BookOpen,
  Brain,
  Users,
  Phone,
  Mail,
  MapPin,
  Check,
  Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceType = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  price: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  badge?: string;
};

type Specialist = {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  experience: string;
  languages: string[];
  qualifications: string[];
  focus: string[];
  rating: number;
  sessions: number;
  avatar: string;
  avatarBg: string;
  initials: string;
  available: string;
};

type BookingState = {
  step: 1 | 2 | 3 | 4;
  service: ServiceType | null;
  specialist: Specialist | null;
  date: string | null;
  time: string | null;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const SERVICES: ServiceType[] = [
  {
    id: "initial",
    title: "استشارة أولية",
    subtitle: "الخطوة الأولى نحو الفهم",
    description:
      "جلسة تعريفية مع متخصص لمراجعة نتائج الفحص، الإجابة على أسئلتك، وتحديد الخطوات التالية المناسبة.",
    duration: "٤٥ دقيقة",
    price: "مجانية للمرة الأولى",
    icon: MessageCircle,
    color: "#1E4E8C",
    bg: "#DFF3F1",
    badge: "مجانية",
  },
  {
    id: "parent",
    title: "إرشاد الوالدين",
    subtitle: "دعم الأسرة في رحلة الفهم",
    description:
      "جلسة موجهة للوالدين لفهم نتائج الفحص، كيفية دعم الطفل في المنزل والمدرسة، وبناء بيئة داعمة.",
    duration: "٦٠ دقيقة",
    price: "٢٥٠ ريال",
    icon: Heart,
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    id: "specialist",
    title: "جلسة متخصص صعوبات التعلم",
    subtitle: "تقييم معمّق ومتخصص",
    description:
      "تقييم شامل مع متخصص في صعوبات التعلم لفهم نمط التعلم، تحديد نقاط القوة والتحديات، ووضع خطة دعم.",
    duration: "٩٠ دقيقة",
    price: "٤٥٠ ريال",
    icon: Brain,
    color: "#F4C46A",
    bg: "#FFFBEB",
    badge: "الأكثر طلباً",
  },
  {
    id: "adhd",
    title: "جلسة فرط الحركة وتشتت الانتباه",
    subtitle: "فهم أعمق للانتباه والسلوك",
    description:
      "جلسة مخصصة لمراجعة مؤشرات فرط الحركة وتشتت الانتباه، وفهم صعوبات التركيز والتنظيم والاندفاعية، مع توجيه الأسرة أو المستخدم للخطوة المناسبة.",
    duration: "٦٠ دقيقة",
    price: "٣٥٠ ريال",
    icon: Sparkles,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    badge: "ADHD",
  },
  {
    id: "followup",
    title: "جلسة متابعة",
    subtitle: "استمرارية الدعم والتقدم",
    description:
      "مراجعة التقدم المحرز، تحديث خطة الدعم، والإجابة على أي أسئلة جديدة ظهرت خلال فترة التطبيق.",
    duration: "٤٥ دقيقة",
    price: "٢٠٠ ريال",
    icon: BookOpen,
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

const SPECIALISTS: Specialist[] = [
  {
    id: "sp1",
    name: "أ. سارة المنصور",
    title: "أخصائية صعوبات التعلم",
    specialty: "ديسلكسيا وصعوبات القراءة",
    bio: "ماجستير تربية خاصة. متخصصة في تشخيص وعلاج صعوبات القراءة والكتابة والدسلكسيا لدى الأطفال والمراهقين.",
    experience: "+١٢ سنة خبرة",
    languages: ["العربية", "الإنجليزية"],
    qualifications: ["ماجستير تربية خاصة", "شهادة CALT"],
    focus: ["صعوبات القراءة والكتابة", "الدسلكسيا", "التدخل المبكر"],
    rating: 4.9,
    sessions: 1240,
    avatar: "",
    avatarBg: "from-blue-400 to-blue-600",
    initials: "سم",
    available: "متاحة هذا الأسبوع",
  },
  {
    id: "sp2",
    name: "د. خالد العمري",
    title: "معالج نفسي تربوي",
    specialty: "صعوبات التعلم والقلق المدرسي",
    bio: "دكتوراه علم نفس تربوي. خبرة واسعة في تقييم صعوبات التعلم، القلق المدرسي، والدعم الأسري.",
    experience: "+٩ سنوات خبرة",
    languages: ["العربية"],
    qualifications: ["دكتوراه علم نفس تربوي"],
    focus: ["صعوبات التعلم", "القلق المدرسي", "الدعم الأسري"],
    rating: 4.8,
    sessions: 890,
    avatar: "",
    avatarBg: "from-teal-400 to-teal-600",
    initials: "خع",
    available: "متاح الأسبوع القادم",
  },
  {
    id: "sp3",
    name: "أ. نورة الزهراني",
    title: "معلمة تربية خاصة معتمدة",
    specialty: "التدريب على القراءة والدعم الأكاديمي",
    bio: "بكالوريوس تربية خاصة + شهادة CALT. متخصصة في التدريب على القراءة والدعم الأكاديمي ومهارات الدراسة.",
    experience: "+٧ سنوات خبرة",
    languages: ["العربية"],
    qualifications: ["بكالوريوس تربية خاصة", "شهادة CALT"],
    focus: ["التدريب على القراءة", "الدعم الأكاديمي", "مهارات الدراسة"],
    rating: 4.7,
    sessions: 760,
    avatar: "",
    avatarBg: "from-purple-400 to-purple-600",
    initials: "نز",
    available: "متاحة اليوم",
  },
  {
    id: "sp4",
    name: "د. فيصل الحربي",
    title: "طبيب نفسي أطفال",
    specialty: "ADHD وفرط الحركة — التقييم الرسمي",
    bio: "بورد طب نفسي أطفال. متخصص في التقييم التشخيصي الرسمي لـ ADHD وفرط الحركة والدعم الدوائي.",
    experience: "+١٥ سنة خبرة",
    languages: ["العربية", "الإنجليزية"],
    qualifications: ["بورد طب نفسي أطفال"],
    focus: ["ADHD وفرط الحركة", "التقييم التشخيصي الرسمي", "الدعم الدوائي"],
    rating: 4.9,
    sessions: 2100,
    avatar: "",
    avatarBg: "from-violet-400 to-violet-600",
    initials: "فح",
    available: "متاح هذا الأسبوع",
  },
  {
    id: "sp5",
    name: "أ. ريم القحطاني",
    title: "أخصائية تدريب سلوكي",
    specialty: "إدارة السلوك والانتباه",
    bio: "ماجستير تحليل سلوك تطبيقي (ABA). متخصصة في إدارة السلوك، مهارات الانتباه، والتنظيم الذاتي.",
    experience: "+١٠ سنوات خبرة",
    languages: ["العربية"],
    qualifications: ["ماجستير تحليل سلوك تطبيقي ABA"],
    focus: ["إدارة السلوك", "مهارات الانتباه", "التنظيم الذاتي"],
    rating: 4.8,
    sessions: 1100,
    avatar: "",
    avatarBg: "from-blue-400 to-indigo-600",
    initials: "رق",
    available: "متاحة هذا الأسبوع",
  },
  {
    id: "sp6",
    name: "د. منى السلمي",
    title: "معالجة نفسية أطفال",
    specialty: "ADHD والقلق والدعم الأسري",
    bio: "دكتوراه علم نفس إكلينيكي. متخصصة في ADHD والقلق والدعم الأسري والمهارات الاجتماعية.",
    experience: "+٨ سنوات خبرة",
    languages: ["العربية", "الإنجليزية"],
    qualifications: ["دكتوراه علم نفس إكلينيكي"],
    focus: ["ADHD والقلق", "الدعم الأسري", "مهارات اجتماعية"],
    rating: 4.7,
    sessions: 830,
    avatar: "",
    avatarBg: "from-teal-400 to-cyan-600",
    initials: "مس",
    available: "متاحة الأسبوع القادم",
  },
];

// Generate available dates (next 14 days, skip Fridays)
function generateDates() {
  const dates: { date: string; label: string; day: string }[] = [];
  const today = new Date();
  let count = 0;
  let i = 1;
  while (count < 10) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 5) {
      // skip Friday
      const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      dates.push({
        date: d.toISOString().split("T")[0],
        label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        day: dayNames[d.getDay()],
      });
      count++;
    }
    i++;
  }
  return dates;
}

const DATES = generateDates();

const TIME_SLOTS = [
  { id: "t1", time: "٩:٠٠ صباحاً", available: true },
  { id: "t2", time: "١٠:٠٠ صباحاً", available: false },
  { id: "t3", time: "١١:٠٠ صباحاً", available: true },
  { id: "t4", time: "١:٠٠ مساءً", available: true },
  { id: "t5", time: "٢:٠٠ مساءً", available: false },
  { id: "t6", time: "٣:٠٠ مساءً", available: true },
  { id: "t7", time: "٤:٠٠ مساءً", available: true },
  { id: "t8", time: "٥:٠٠ مساءً", available: true },
  { id: "t9", time: "٦:٠٠ مساءً", available: false },
  { id: "t10", time: "٧:٠٠ مساءً", available: true },
];

const FAQS = [
  {
    q: "هل حجزي خاص وسري؟",
    a: "نعم تماماً. جميع جلساتك وبياناتك محمية بسرية تامة ولا تُشارك مع أي جهة خارجية. نلتزم بأعلى معايير الخصوصية.",
  },
  {
    q: "هل يمكنني إعادة الجدولة أو الإلغاء؟",
    a: "بالطبع. يمكنك إعادة الجدولة أو الإلغاء مجاناً قبل ٢٤ ساعة من موعد الجلسة عبر رسالة بريد إلكتروني أو واتساب.",
  },
  {
    q: "ماذا يحدث بعد إرسال طلب الحجز؟",
    a: "سيتواصل معك المتخصص خلال 24 ساعة لتأكيد الموعد وإرسال تفاصيل الجلسة. ستتلقى تذكيراً قبل موعدك بيوم.",
  },
  {
    q: "هل هذه جلسة تشخيص طبي أم استشارة؟",
    a: "تشخيصي يقدم استشارات تربوية ونفسية متخصصة. نتائجنا توجيهية وداعمة، وليست بديلاً عن التشخيص الطبي الرسمي عند الحاجة.",
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}
      className={visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
    >
      {children}
    </div>
  );
}

// Step Indicator
function StepBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "الخدمة" },
    { n: 2, label: "المتخصص" },
    { n: 3, label: "الموعد" },
    { n: 4, label: "التأكيد" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8 sm:mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              style={{
                background: step > s.n ? "#2BBDB6" : step === s.n ? "#1E4E8C" : "#D8E8E7",
                color: step >= s.n ? "white" : "#94A3B8",
                boxShadow: step === s.n ? "0 0 0 4px rgba(37,99,235,0.15)" : "none",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span
              className="text-xs mt-1.5 font-medium"
              style={{
                color: step >= s.n ? "#243B53" : "#94A3B8",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-8 sm:w-16 lg:w-24 h-0.5 mx-0.5 sm:mx-1 -mt-5 transition-all duration-500"
              style={{ background: step > s.n ? "#2BBDB6" : "#D8E8E7" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Service Selection ────────────────────────────────────────────────
function Step1({ booking, setBooking }: { booking: BookingState; setBooking: React.Dispatch<React.SetStateAction<BookingState>> }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
        >
          ما الذي تحتاجه اليوم؟
        </h2>
        <p className="text-slate-500 text-base" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          اختر نوع الجلسة الأنسب لوضعك — يمكنك دائماً تغيير رأيك لاحقاً
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const selected = booking.service?.id === service.id;
          return (
            <button
              key={service.id}
              onClick={() => setBooking((b) => ({ ...b, service }))}
              className="relative text-right rounded-2xl p-5 border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: selected ? service.bg : "white",
                borderColor: selected ? service.color : "#D8E8E7",
                boxShadow: selected ? `0 0 0 3px ${service.color}20` : undefined,
              }}
            >
              {service.badge && (
                <span
                  className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: service.color,
                    color: "white",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {service.badge}
                </span>
              )}
              {selected && (
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: service.color }}
                >
                  <Check size={13} className="text-white" />
                </div>
              )}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: service.bg }}
              >
                <Icon size={24} style={{ color: service.color }} />
              </div>
              <h3
                className="text-base font-bold text-slate-900 mb-1"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
              >
                {service.title}
              </h3>
              <p
                className="text-xs font-medium mb-2"
                style={{ color: service.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {service.subtitle}
              </p>
              <p
                className="text-sm text-slate-500 leading-relaxed mb-4"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
              >
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs px-3 py-1 rounded-lg font-medium"
                  style={{ background: service.bg, color: service.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  <Clock size={11} className="inline ml-1" />
                  {service.duration}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: service.color, fontFamily: "'Cairo', sans-serif" }}
                >
                  {service.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-start">
        <button
          onClick={() => {
            if (!booking.service) return;
            setBooking((b) => ({ ...b, step: 2 }));
          }}
          disabled={!booking.service}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{
            background: booking.service ? "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)" : "#CBD5E1",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            boxShadow: booking.service ? "0 6px 20px rgba(37,99,235,0.3)" : "none",
          }}
        >
          التالي: اختر متخصصك
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Specialist Selection ─────────────────────────────────────────────
function Step2({
  booking,
  setBooking,
  preselectedSpecialist,
  isAutoService,
}: {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  preselectedSpecialist: Specialist | null;
  isAutoService: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasPreselected = preselectedSpecialist !== null && !showAll;
  const specialistsToShow = hasPreselected ? [preselectedSpecialist!] : SPECIALISTS;
  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
        >
          {hasPreselected ? "متخصصك المقترح" : "اختر متخصصك"}
        </h2>
        <p className="text-slate-500 text-base" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          {hasPreselected
            ? "بناءً على نتائج فحصك، هذا المتخصص هو الأنسب لحالتك"
            : "جميع متخصصينا معتمدون ولديهم خبرة واسعة في مجالاتهم"}
        </p>
      </div>

      {/* ── رسالة الشفافية: تظهر فقط عند الاختيار التلقائي من سياق نتائج الفحص ── */}
      {isAutoService && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-6 text-right"
          style={{
            background: "rgba(43,189,182,0.07)",
            border: "1px solid rgba(43,189,182,0.25)",
          }}
        >
          <span className="text-base mt-0.5 flex-shrink-0">ℹ️</span>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#1E4E8C",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              lineHeight: 1.85,
            }}
          >
            تم اختيار &ldquo;استشارة أولية&rdquo; تلقائيًا كبداية مناسبة لفهم نتيجة الفحص، ويمكنك تغيير نوع الجلسة من خطوة الخدمة.
          </p>
        </div>
      )}

      <div className="space-y-4 mb-4">
        {specialistsToShow.map((sp) => {
          const selected = booking.specialist?.id === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => setBooking((b) => ({ ...b, specialist: sp }))}
              className="w-full text-right rounded-2xl p-5 border-2 transition-all duration-200 hover:shadow-md"
              style={{
                background: selected ? "#DFF3F1" : "white",
                borderColor: selected ? "#1E4E8C" : "#D8E8E7",
                boxShadow: selected ? "0 0 0 3px rgba(37,99,235,0.1)" : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${sp.avatarBg}`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {sp.initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3
                        className="text-base font-bold text-slate-900"
                        style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                      >
                        {sp.name}
                      </h3>
                      <p
                        className="text-sm text-blue-600 font-medium"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {sp.title}
                      </p>
                    </div>
                    {selected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={13} className="text-white" />
                      </div>
                    )}
                  </div>

                  <p
                    className="text-sm text-slate-500 leading-relaxed mb-3"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
                  >
                    {sp.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span
                        className="text-xs font-bold text-slate-700"
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {sp.rating}
                      </span>
                      <span className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                        ({sp.sessions.toLocaleString("ar-SA")} جلسة)
                      </span>
                    </div>

                    {/* Experience */}
                    <span
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {sp.experience}
                    </span>

                    {/* Languages */}
                    <div className="flex items-center gap-1">
                      <Languages size={12} className="text-teal-500" />
                      <span className="text-xs text-slate-500" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                        {sp.languages.join("، ")}
                      </span>
                    </div>
                  </div>

                  {/* Focus tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {sp.focus.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: "#DFF3F1",
                          color: "#1E4E8C",
                          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span
                      className="text-xs text-teal-700 font-medium"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {sp.available}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* زر اختيار متخصص آخر */}
      {hasPreselected && (
        <div className="mb-6 text-center">
          <button
            onClick={() => {
              setShowAll(true);
              setBooking((b) => ({ ...b, specialist: null }));
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all hover:shadow-sm"
            style={{
              background: "#F4EFE8",
              color: "#1E4E8C",
              border: "1px solid #D8E8E7",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}
          >
            <Users size={15} />
            اختيار متخصص آخر
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setBooking((b) => ({ ...b, step: 1 }))}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <ArrowRight size={16} />
          رجوع
        </button>
        <button
          onClick={() => {
            if (!booking.specialist) return;
            setBooking((b) => ({ ...b, step: 3 }));
          }}
          disabled={!booking.specialist}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{
            background: booking.specialist ? "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)" : "#CBD5E1",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            boxShadow: booking.specialist ? "0 6px 20px rgba(37,99,235,0.3)" : "none",
          }}
        >
          التالي: اختر الموعد
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Date & Time Selection ────────────────────────────────────────────
function Step3({ booking, setBooking }: { booking: BookingState; setBooking: React.Dispatch<React.SetStateAction<BookingState>> }) {
  const [showForm, setShowForm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const normalizeDigits = (value: string) =>
    value
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

  const nameValue = booking.name.trim();
  const emailValue = booking.email.trim();
  const phoneValue = normalizeDigits(booking.phone.trim());
  const normalizedPhone = phoneValue.replace(/[\s-]/g, "");

  const isValidName = nameValue.length >= 2;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue);
  const isValidSaudiPhone =
    /^05\d{8}$/.test(normalizedPhone) ||
    /^9665\d{8}$/.test(normalizedPhone) ||
    /^\+9665\d{8}$/.test(normalizedPhone);

  const isUserInfoComplete = isValidName && isValidEmail && isValidSaudiPhone;

  const canProceed = !!booking.date && !!booking.time && isUserInfoComplete;

  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
        >
          اختر موعدك
        </h2>
        <p className="text-slate-500 text-base" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          جميع المواعيد بتوقيت المملكة العربية السعودية (AST)
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Date Selection */}
        <div>
          <h3
            className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <Calendar size={16} className="text-blue-600" />
            اختر التاريخ
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {DATES.map((d) => {
              const selected = booking.date === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => setBooking((b) => ({ ...b, date: d.date, time: null }))}
                  className="p-3 rounded-xl border-2 text-center transition-all duration-150 hover:border-blue-300"
                  style={{
                    background: selected ? "#DFF3F1" : "white",
                    borderColor: selected ? "#1E4E8C" : "#D8E8E7",
                  }}
                >
                  <div
                    className="text-xs text-slate-400 mb-0.5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {d.day}
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: selected ? "#1E4E8C" : "#243B53",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {d.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <h3
            className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <Clock size={16} className="text-teal-600" />
            اختر الوقت
            {!booking.date && (
              <span
                className="text-xs text-slate-400 font-normal"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                (اختر التاريخ أولاً)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => {
              const selected = booking.time === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (!booking.date || !slot.available) return;
                    setBooking((b) => ({ ...b, time: slot.id }));
                  }}
                  disabled={!booking.date || !slot.available}
                  className="p-3 rounded-xl border-2 text-center transition-all duration-150"
                  style={{
                    background: !slot.available ? "#F4EFE8" : selected ? "#DFF3F1" : "white",
                    borderColor: !slot.available ? "#D8E8E7" : selected ? "#1E4E8C" : "#D8E8E7",
                    opacity: !slot.available ? 0.5 : 1,
                    cursor: !slot.available ? "not-allowed" : "pointer",
                  }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{
                      color: !slot.available ? "#94A3B8" : selected ? "#1E4E8C" : "#243B53",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {slot.time}
                  </div>
                  {!slot.available && (
                    <div className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                      محجوز
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Info Form */}
      <div
        className="rounded-2xl border border-slate-200 overflow-hidden mb-6"
        style={{ background: "#F4EFE8" }}
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-4 text-right"
        >
          <div className="flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            <span
              className="text-sm font-bold text-slate-800"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              بياناتك الشخصية
            </span>
            {isUserInfoComplete && (
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                تم الإدخال ✓
              </span>
            )}
          </div>
          {showForm ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </button>

        {showForm && (
          <div className="px-4 pb-4 grid sm:grid-cols-2 gap-4">
            {[
              {
                key: "name",
                label: "الاسم الكامل",
                placeholder: "مثال: محمد أحمد",
                icon: User,
                required: true,
              },
              {
                key: "email",
                label: "البريد الإلكتروني",
                placeholder: "example@email.com",
                icon: Mail,
                required: true,
              },
              {
                key: "phone",
                label: "رقم الجوال",
                placeholder: "مثال: 05XXXXXXXX",
                icon: Phone,
                required: true,
              },
            ].map((field) => {
              const Icon = field.icon;
              const hasError =
                showValidation &&
                (
                  (field.key === "name" && !isValidName) ||
                  (field.key === "email" && !isValidEmail) ||
                  (field.key === "phone" && !isValidSaudiPhone)
                );
              const errorMessage =
                field.key === "name"
                  ? "يرجى إدخال الاسم الكامل بشكل صحيح."
                  : field.key === "email"
                  ? "يرجى إدخال بريد إلكتروني صحيح مثل example@email.com."
                  : "يرجى إدخال رقم جوال سعودي صحيح مثل 05XXXXXXXX أو 9665XXXXXXXX.";
              return (
                <div
                  key={field.key}
                  className={field.key === "name" ? "sm:col-span-2" : ""}
                >
                  <label
                    className="block text-xs font-medium text-slate-600 mb-1.5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {field.label}
                    {field.required && <span className="text-red-400 mr-0.5">*</span>}
                  </label>
                  <div className="relative">
                    <Icon
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text"}
                      inputMode={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text"}
                      placeholder={field.placeholder}
                      value={(booking as any)[field.key] || ""}
                      onChange={(e) => {
                        setShowValidation(false);
                        setBooking((b) => ({ ...b, [field.key]: e.target.value }));
                      }}
                      className={`w-full pr-9 pl-3 py-2.5 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                        hasError
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      }`}
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        direction: "rtl",
                      }}
                    />
                  </div>
                  {hasError && (
                    <p
                      className="text-xs text-red-500 mt-1.5 leading-relaxed"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>
              );
            })}
            <div className="sm:col-span-2">
              <label
                className="block text-xs font-medium text-slate-600 mb-1.5"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                placeholder="أي معلومات تريد مشاركتها مع المتخصص قبل الجلسة..."
                value={booking.notes}
                onChange={(e) => setBooking((b) => ({ ...b, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  direction: "rtl",
                }}
              />
            </div>
          </div>
        )}

        {!showForm && !isUserInfoComplete && (
          <div className="px-4 pb-4">
            <p
              className="text-xs text-slate-400"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              انقر لإدخال بياناتك الشخصية المطلوبة لإتمام الحجز
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setBooking((b) => ({ ...b, step: 2 }))}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <ArrowRight size={16} />
          رجوع
        </button>

        <button
          onClick={() => {
            if (!canProceed) {
              setShowForm(true);
              setShowValidation(true);
              return;
            }
            setBooking((b) => ({ ...b, step: 4 }));
          }}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: canProceed
              ? "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)"
              : "#CBD5E1",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            boxShadow: canProceed ? "0 6px 20px rgba(37,99,235,0.3)" : "none",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          مراجعة الحجز
          <ArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Summary & Confirmation ──────────────────────────────────────────
function Step4({
  booking,
  setBooking,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [agreed, setAgreed] = useState(false);
  const timeLabel = TIME_SLOTS.find((t) => t.id === booking.time)?.time || "";
  const dateObj = DATES.find((d) => d.date === booking.date);

  return (
    <div>
      <div className="text-center mb-8">
        <h2
          className="text-2xl sm:text-3xl font-black text-slate-900 mb-3"
          style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
        >
          راجع تفاصيل حجزك
        </h2>
        <p className="text-slate-500 text-base" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          تأكد من صحة المعلومات قبل التأكيد النهائي
        </p>
      </div>

      {/* Summary Card */}
      <div
        className="rounded-2xl border border-slate-200 overflow-hidden mb-6"
        style={{ background: "white" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 100%)", borderBottom: "1px solid #D8E8E7" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#1E4E8C" }}
          >
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h3
              className="text-base font-bold text-slate-900"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              ملخص الحجز
            </h3>
            <p className="text-xs text-slate-500" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              رقم الحجز المؤقت: #TK-{Math.floor(Math.random() * 9000) + 1000}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-slate-100">
          {[
            { label: "نوع الجلسة", value: booking.service?.title || "", icon: Sparkles, color: "#1E4E8C" },
            { label: "المتخصص", value: booking.specialist?.name || "", sub: booking.specialist?.title, icon: User, color: "#2BBDB6" },
            { label: "التاريخ", value: dateObj ? `${dateObj.day}، ${dateObj.label}` : "", icon: Calendar, color: "#F4C46A" },
            { label: "الوقت", value: timeLabel, icon: Clock, color: "#8B5CF6" },
            { label: "المدة", value: booking.service?.duration || "", icon: Clock, color: "#64748B" },
            { label: "الاسم", value: booking.name, icon: User, color: "#64748B" },
            { label: "البريد الإلكتروني", value: booking.email, icon: Mail, color: "#64748B" },
            { label: "رقم الجوال", value: booking.phone, icon: Phone, color: "#64748B" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 px-5 py-3.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}15` }}
                >
                  <Icon size={15} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 mb-0.5" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                    {item.label}
                  </div>
                  <div
                    className="text-sm font-semibold text-slate-800 truncate"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {item.value}
                  </div>
                  {item.sub && (
                    <div className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preparation tips */}
        <div
          className="px-5 py-4"
          style={{ background: "#FFFBEB", borderTop: "1px solid #FEF3C7" }}
        >
          <div className="flex items-start gap-2">
            <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p
                className="text-xs font-bold text-amber-800 mb-1"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                للاستعداد للجلسة
              </p>
              <p
                className="text-xs text-amber-700 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
              >
                احتفظ بنتائج الفحص في متناول يدك. إذا كان لديك تقارير سابقة أو ملاحظات من المدرسة، يُفضَّل مشاركتها مع المتخصص.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl mb-6 cursor-pointer"
        style={{ background: "#F4EFE8", border: "1px solid #D8E8E7" }}
        onClick={() => setAgreed(!agreed)}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
          style={{
            background: agreed ? "#1E4E8C" : "white",
            border: `2px solid ${agreed ? "#1E4E8C" : "#CBD5E1"}`,
          }}
        >
          {agreed && <Check size={12} className="text-white" />}
        </div>
        <p
          className="text-sm text-slate-600 leading-relaxed"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
        >
          أوافق على{" "}
          <a href="/terms" className="text-blue-600 hover:underline">الشروط والأحكام</a>
          {" "}و{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">سياسة الخصوصية</a>
          {" "}و{" "}
          <a href="/disclaimer" className="text-blue-600 hover:underline">إخلاء المسؤولية</a>
          {" "}و{" "}
          <a href="/refund-policy" className="text-blue-600 hover:underline">سياسة الإلغاء والاسترداد</a>
          {" "}وأفهم أن هذه الخدمة استشارة تربوية وليست تشخيصًا طبيًا أو نفسيًا نهائيًا.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setBooking((b) => ({ ...b, step: 3 }))}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-slate-600 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          <ArrowRight size={16} />
          تعديل
        </button>
        <button
          onClick={() => {
            if (!agreed || isSubmitting) return;
            onConfirm();
          }}
          disabled={!agreed || isSubmitting}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{
            background: agreed && !isSubmitting
              ? "linear-gradient(135deg, #2BBDB6 0%, #0f766e 100%)"
              : "#CBD5E1",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            boxShadow: agreed && !isSubmitting ? "0 8px 24px rgba(20,184,166,0.35)" : "none",
          }}
        >
          <CheckCircle size={20} />
          {isSubmitting ? "جارِ إرسال طلب الحجز..." : "تأكيد الحجز"}
        </button>
      </div>

      {/* Submit error message */}
      {submitError && (
        <div
          className="mt-4 p-4 rounded-2xl text-sm text-center"
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#DC2626",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          {submitError}
        </div>
      )}

      {/* Trust strip */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {[
          { icon: Shield, text: "سرية تامة" },
          { icon: Award, text: "متخصصون معتمدون" },
          { icon: MessageCircle, text: "تواصل خلال 24 ساعة" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-1.5 text-slate-400">
              <Icon size={14} className="text-teal-500" />
              <span className="text-xs" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confirmation Screen ──────────────────────────────────────────────────────
function ConfirmationScreen({ booking }: { booking: BookingState }) {
  const timeLabel = TIME_SLOTS.find((t) => t.id === booking.time)?.time || "";
  const dateObj = DATES.find((d) => d.date === booking.date);
  // رقم مرجعي ثابت يُولَّد مرة واحدة عند mount — لا يتغيّر عند إعادة الرسم
  const [bookingRef] = useState(() => {
    const ts = Date.now().toString(36).toUpperCase().slice(-4);
    const rand = Math.floor(Math.random() * 900 + 100);
    return `TK-${ts}${rand}`;
  });

  return (
    <div className="text-center py-8">

      {/* Status badge — واضح وصادق */}
      <div className="flex justify-center mb-5">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: "#DFF3F1",
            color: "#1E4E8C",
            border: "1px solid #BFDBFE",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#1E4E8C", animation: "pulse 2s infinite" }}
          />
          تم استلام طلب الحجز
        </span>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #1E4E8C 0%, #1A3F73 100%)",
            boxShadow: "0 12px 40px rgba(37,99,235,0.25)",
          }}
        >
          <CheckCircle size={40} className="text-white" />
        </div>
      </div>

      <h2
        className="text-3xl font-black text-slate-900 mb-2"
        style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
      >
        طلبك في طريقه إلى المتخصص
      </h2>

      {/* Reference number */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-3"
        style={{ background: "#F4EFE8", border: "1px solid #D8E8E7" }}
      >
        <span className="text-xs text-slate-400" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
          رقم المرجع
        </span>
        <span
          className="text-sm font-black text-blue-600"
          style={{ fontFamily: "'Cairo', sans-serif", letterSpacing: "0.05em" }}
        >
          {bookingRef}
        </span>
      </div>

      <p
        className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
      >
        سيتواصل معك المتخصص خلال ٢٤ ساعة لتأكيد الموعد
        وإرسال تفاصيل الجلسة.
      </p>

      {/* Booking summary card */}
      <div
        className="max-w-md mx-auto rounded-2xl mb-8 overflow-hidden text-right"
        style={{ border: "1px solid #BFDBFE" }}
      >
        {/* Card header */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 100%)", borderBottom: "1px solid #BFDBFE" }}
        >
          <span
            className="text-xs font-bold text-blue-700"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            ملخص طلب الحجز
          </span>
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {bookingRef}
          </span>
        </div>
        {/* Card body */}
        <div className="px-5 py-4 space-y-3" style={{ background: "white" }}>
          {[
            { label: "نوع الجلسة", value: booking.service?.title || "—" },
            { label: "المتخصص", value: booking.specialist?.name || "—" },
            { label: "التاريخ", value: dateObj ? `${dateObj.day}، ${dateObj.label}` : "—" },
            { label: "الوقت", value: timeLabel || "—" },
            ...(booking.name ? [{ label: "الاسم", value: booking.name }] : []),
            ...(booking.email ? [{ label: "البريد الإلكتروني", value: booking.email }] : []),
            ...(booking.phone ? [{ label: "رقم الجوال", value: booking.phone }] : []),
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <span
                className="text-xs text-slate-400 flex-shrink-0"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {item.label}
              </span>
              <span
                className="text-sm font-semibold text-slate-800 text-left"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
        {/* Preparation note */}
        <div
          className="px-5 py-3.5 flex items-start gap-2"
          style={{ background: "#FFFBEB", borderTop: "1px solid #FEF3C7" }}
        >
          <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p
            className="text-xs text-amber-700 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
          >
            احتفظ بنتائج فحصك في متناول يدك. إذا كان لديك تقارير سابقة أو ملاحظات من المدرسة، يُفضَّل مشاركتها مع المتخصص.
          </p>
        </div>
      </div>

      {/* What happens next */}
      <div className="max-w-md mx-auto mb-8 text-right">
        <h3
          className="text-base font-bold text-slate-800 mb-4"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          ماذا يحدث بعد ذلك؟
        </h3>
        <div className="space-y-3">
          {[
            {
              step: "١",
              color: "#1E4E8C",
              text: "سيتواصل معك المتخصص خلال 24 ساعة لتأكيد الموعد وإرسال تفاصيل الجلسة",
            },
            {
              step: "٢",
              color: "#2BBDB6",
              text: "ستتلقى تذكيراً بالموعد قبل يوم من الجلسة لتكون مستعداً",
            },
            {
              step: "٣",
              color: "#8B5CF6",
              text: "في يوم الجلسة، احضر بنتائج فحصك وأي ملاحظات تريد مشاركتها",
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: item.color, fontFamily: "'Cairo', sans-serif" }}
              >
                {item.step}
              </div>
              <p
                className="text-sm text-slate-600 leading-relaxed pt-0.5"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.65 }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div
        className="max-w-md mx-auto flex flex-wrap justify-center gap-5 mb-8 px-4 py-3 rounded-xl"
        style={{ background: "#F4EFE8", border: "1px solid #D8E8E7" }}
      >
        {[
          { icon: Shield, text: "سرية تامة", color: "#2BBDB6" },
          { icon: Award, text: "متخصصون معتمدون", color: "#1E4E8C" },
          { icon: MessageCircle, text: "تواصل خلال 24 ساعة", color: "#8B5CF6" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <Icon size={13} style={{ color: item.color }} />
              <span
                className="text-xs text-slate-500"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-stretch sm:flex-row sm:items-center justify-center gap-3 px-4 sm:px-0">
        <a
          href="/"
          className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto"
          style={{
            background: "linear-gradient(135deg, #1E4E8C 0%, #1d4ed8 100%)",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
          }}
        >
          العودة إلى الصفحة الرئيسية
        </a>
        <a
          href="/start"
          className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all w-full sm:w-auto"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          بدء فحص جديد
        </a>
      </div>

      {/* Disclaimer */}
      <p
        className="mt-6 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.7 }}
      >
        هذا طلب حجز لاستشارة تربوية وليس تشخيصاً طبياً رسمياً.
        سيساعدك المتخصص على فهم المؤشرات وتحديد الخطوات التالية.
      </p>
    </div>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 lg:py-20" style={{ background: "#F4EFE8" }}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2
            className="text-2xl font-black text-slate-900 mb-3"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            أسئلة شائعة
          </h2>
          <p className="text-slate-500 text-sm" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            إجابات سريعة على أكثر ما يُسأل عنه
          </p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border transition-all duration-200"
              style={{
                background: "white",
                borderColor: open === i ? "#BFDBFE" : "#D8E8E7",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-right"
              >
                <span
                  className="text-sm font-bold text-slate-800"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {faq.q}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 transition-all"
                  style={{ background: open === i ? "#DFF3F1" : "#F4EFE8" }}
                >
                  {open === i ? (
                    <ChevronUp size={15} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={15} className="text-slate-400" />
                  )}
                </div>
              </button>
              {open === i && (
                <div className="px-4 pb-4">
                  <p
                    className="text-sm text-slate-500 leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Booking Page ────────────────────────────────────────────────────────
export default function Booking() {
  const [confirmed, setConfirmed] = useState(false);
  const [preselectedSpecialist, setPreselectedSpecialist] = useState<Specialist | null>(null);
  // Tracks whether service was auto-selected from URL/result context (not manual Step 1)
  const [isAutoService, setIsAutoService] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    step: 1,
    service: null,
    specialist: null,
    date: null,
    time: null,
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Read specialistId from URL query params and preselect specialist
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const specialistId = params.get("specialistId");
    if (specialistId) {
      const found = SPECIALISTS.find((s) => s.id === specialistId) ?? null;
      if (found) {
        setPreselectedSpecialist(found);
        // Resolve service: prefer serviceId from URL, fall back to "initial"
        const serviceIdParam = params.get("serviceId");
        const defaultService =
          (serviceIdParam ? SERVICES.find((s) => s.id === serviceIdParam) : null) ??
          SERVICES.find((s) => s.id === "initial") ??
          null;
        setIsAutoService(true);
        setBooking((b) => ({
          ...b,
          specialist: found,
          service: b.service ?? defaultService,
          step: 2,
        }));
      }
    }
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [booking.step, confirmed]);

  // ─── Formspree submission state ───────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    // 1. Validate required fields
    if (
      !booking.name.trim() ||
      !booking.email.trim() ||
      !booking.service ||
      !booking.specialist ||
      !booking.date ||
      !booking.time
    ) {
      setSubmitError("يرجى التأكد من اكتمال بيانات الحجز قبل الإرسال.");
      return;
    }

    // 2. Check endpoint
    const endpoint = import.meta.env.VITE_FORMSPREE_BOOKING_ENDPOINT as string | undefined;
    if (!endpoint) {
      console.error("Missing VITE_FORMSPREE_BOOKING_ENDPOINT");
      setSubmitError("تعذّر إرسال طلب الحجز حالياً. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.");
      return;
    }

    // 3. Build payload
    const params = new URLSearchParams(window.location.search);
    const timeLabel = TIME_SLOTS.find((t) => t.id === booking.time)?.time || "";
    const payload = {
      // Contact
      full_name: booking.name,
      email: booking.email,
      phone: booking.phone || "",
      notes: booking.notes || "",
      // Service
      service_id: booking.service.id,
      service_title: booking.service.title,
      service_price: booking.service.price,
      service_duration: booking.service.duration,
      // Specialist
      specialist_id: booking.specialist.id,
      specialist_name: booking.specialist.name,
      specialist_title: booking.specialist.title,
      specialist_specialty: booking.specialist.specialty,
      // Schedule
      selected_date: booking.date,
      selected_time_id: booking.time,
      selected_time_label: timeLabel,
      // URL context
      url_specialist_id: params.get("specialistId") || "",
      url_service_id: params.get("serviceId") || "",
      url_from: params.get("from") || "",
      url_session_id: params.get("sessionId") || "",
      url_path_type: params.get("pathType") || "",
      url_child: params.get("child") || "",
      // Meta
      source_url: window.location.href,
      created_at: new Date().toISOString(),
    };

    // 4. Submit
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "تعذّر إرسال طلب الحجز حالياً. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.";
        try {
          const data = await res.json();
          if (data?.errors?.length) msg = data.errors.map((e: { message: string }) => e.message).join(" ");
        } catch { /* ignore parse error */ }
        setSubmitError(msg);
        return;
      }
      // Success
      setConfirmed(true);
    } catch {
      setSubmitError("تعذّر إرسال طلب الحجز حالياً. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F4EFE8", direction: "rtl" }}>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-28 pb-10 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 50%, #DFF3F1 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
            transform: "translate(-40%, -40%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)",
            transform: "translate(40%, 40%)",
          }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm mb-6" style={{ color: "#64748B" }}>
            <Link href="/" className="hover:text-blue-600 transition-colors" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              الرئيسية
            </Link>
            <ChevronRight size={14} className="opacity-50" />
            <span style={{ color: "#1E4E8C", fontWeight: 600, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>احجز موعداً</span>
          </nav>
          <AnimatedSection>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="text-xs font-semibold text-blue-700"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الخطوة التالية بعد نتائجك
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-5"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900, lineHeight: 1.2 }}
            >
              احجز جلستك مع{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                متخصص معتمد
              </span>
            </h1>

            <p
              className="text-lg text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
            >
              نتائج الفحص هي البداية. المتخصص هو من يساعدك على فهمها وتحويلها إلى خطوات واضحة — بسرية تامة وبدون تعقيد.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Shield, text: "سرية تامة" },
                { icon: Award, text: "متخصصون معتمدون" },
                { icon: Clock, text: "مواعيد مرنة" },
                { icon: MessageCircle, text: "تأكيد فوري" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #D8E8E7" }}
                  >
                    <Icon size={13} className="text-teal-500" />
                    <span
                      className="text-xs text-slate-600 font-medium"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Booking Area */}
      <main className="flex-1 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {!confirmed ? (
            <>
              <AnimatedSection>
                <StepBar step={booking.step} />
              </AnimatedSection>

              <AnimatedSection delay={100}>
                <div
                  className="rounded-3xl p-6 sm:p-8"
                  style={{ background: "white", boxShadow: "0 4px 24px rgba(15,23,42,0.06)", border: "1px solid #D8E8E7" }}
                >
                  {booking.step === 1 && <Step1 booking={booking} setBooking={setBooking} />}
                  {booking.step === 2 && <Step2 booking={booking} setBooking={setBooking} preselectedSpecialist={preselectedSpecialist} isAutoService={isAutoService} />}
                  {booking.step === 3 && <Step3 booking={booking} setBooking={setBooking} />}
                  {booking.step === 4 && (
                    <Step4
                      booking={booking}
                      setBooking={setBooking}
                      onConfirm={handleConfirm}
                      isSubmitting={isSubmitting}
                      submitError={submitError}
                    />
                  )}
                </div>
              </AnimatedSection>
            </>
          ) : (
            <AnimatedSection>
              <div
                className="rounded-3xl p-6 sm:p-10"
                style={{ background: "white", boxShadow: "0 4px 24px rgba(15,23,42,0.06)", border: "1px solid #D8E8E7" }}
              >
                <ConfirmationScreen booking={booking} />
              </div>
            </AnimatedSection>
          )}
        </div>
      </main>

      {/* FAQ */}
      {!confirmed && <FAQSection />}

      <Footer />
    </div>
  );
}

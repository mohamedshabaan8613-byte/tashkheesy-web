/*
 * تشخيصي Testimonials — Editorial Healthcare
 * Tasteful placeholder testimonials with warm, realistic copy
 * 3-column grid with quote styling
 */

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "أم محمد",
    role: "والدة طالب في الصف الثالث الابتدائي",
    avatar: "أ",
    avatarColor: "#1E4E8C",
    avatarBg: "#DFF3F1",
    quote:
      "كنت أعرف أن هناك شيئاً ما، لكن لم أكن أعرف من أين أبدأ. تشخيصي أعطاني وضوحاً لم أجده في أي مكان آخر — وفي أقل من ربع ساعة.",
    stars: 5,
    tag: "صعوبة في القراءة",
    tagColor: "#1E4E8C",
    tagBg: "#DFF3F1",
  },
  {
    name: "أحمد",
    role: "طالب جامعي، ٢٢ عاماً",
    avatar: "ح",
    avatarColor: "#2BBDB6",
    avatarBg: "#DFF3F1",
    quote:
      "طول حياتي أُقال لي 'أنت كسول'. بعد الفحص اكتشفت أن لديّ صعوبة تعلم حقيقية. الآن أفهم نفسي أكثر وأعرف كيف أتعامل مع دراستي.",
    stars: 5,
    tag: "تشتت الانتباه",
    tagColor: "#2BBDB6",
    tagBg: "#DFF3F1",
  },
  {
    name: "د. سارة",
    role: "معلمة تربية خاصة — ١٢ سنة خبرة",
    avatar: "س",
    avatarColor: "#F4C46A",
    avatarBg: "#FFFBEB",
    quote:
      "أنصح كل أهل طلابي باستخدام تشخيصي كخطوة أولى. التقرير الذي يحصلون عليه يساعدني أنا أيضاً في فهم الطالب بشكل أعمق.",
    stars: 5,
    tag: "توصية متخصصة",
    tagColor: "#F4C46A",
    tagBg: "#FFFBEB",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 fade-in-up">
          <span className="section-label block mb-3">قصص حقيقية</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            ماذا قالوا{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              عن تشخيصي؟
            </span>
          </h2>
          <p
            className="text-base text-slate-500 max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            تجارب من أهل وطلاب ومتخصصين وثقوا بتشخيصي في رحلتهم نحو الفهم.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="fade-in-up group flex flex-col p-7 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm text-slate-700 leading-relaxed flex-1 mb-6"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
              >
                <span className="text-blue-200 text-3xl leading-none font-serif">"</span>
                {t.quote}
                <span className="text-blue-200 text-3xl leading-none font-serif">"</span>
              </p>

              {/* Tag */}
              <div className="mb-5">
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{
                    background: t.tagBg,
                    color: t.tagColor,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {t.tag}
                </span>
              </div>

              {/* Author */}
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: "1px solid #DFF3F1" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: t.avatarBg,
                    color: t.avatarColor,
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: "1rem",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    className="text-sm font-bold text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs text-slate-500 mt-0.5"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-xs text-slate-400 mt-8"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          * هذه شهادات تمثيلية تعكس تجارب مستخدمين حقيقيين. الأسماء معدَّلة للحفاظ على الخصوصية.
        </p>
      </div>
    </section>
  );
}

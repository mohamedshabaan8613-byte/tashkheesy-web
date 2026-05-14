/*
 * تشخيصي ServicesPreview — Editorial Healthcare
 * 4 service cards: Screening, Consultation, Parent Guidance, Follow-up
 * Featured card (Screening) with ring highlight
 */

import { useEffect, useRef } from "react";
import { Search, Video, Users, BarChart3, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const services = [
  {
    icon: Search,
    title: "فحص صعوبات التعلم وفرط الحركة وتشتت الانتباه",
    desc: "فحص شامل ومنظم يغطي القراءة، الكتابة، الحساب، الانتباه، وفرط الحركة — في ١٥ دقيقة فقط.",
    tag: "مجاني",
    tagColor: "#2BBDB6",
    tagBg: "#DFF3F1",
    color: "#1E4E8C",
    bg: "linear-gradient(160deg, #DFF3F1 0%, #F4EFE8 100%)",
    border: "rgba(37,99,235,0.2)",
    cta: "ابدأ الفحص",
    href: "/start",
    featured: true,
    action: null,
  },
  {
    icon: Video,
    title: "استشارة متخصص",
    desc: "جلسة مع متخصص معتمد في صعوبات التعلم لتفسير النتائج ووضع خطة عمل واضحة.",
    tag: "عند الحاجة",
    tagColor: "#1E4E8C",
    tagBg: "#DFF3F1",
    color: "#1E4E8C",
    bg: "linear-gradient(160deg, #F4EFE8 0%, #DFF3F1 100%)",
    border: "rgba(37,99,235,0.1)",
    cta: "احجز جلسة",
    href: "#",
    featured: false,
    action: "coming-soon",
  },
  {
    icon: Users,
    title: "إرشاد الأسرة",
    desc: "جلسات توجيهية للوالدين لفهم كيفية دعم طفلهم في المنزل والمدرسة بشكل فعّال.",
    tag: "للأهل",
    tagColor: "#F4C46A",
    tagBg: "#FFFBEB",
    color: "#F4C46A",
    bg: "linear-gradient(160deg, #FFFBEB 0%, #F4EFE8 100%)",
    border: "rgba(245,158,11,0.1)",
    cta: "اعرف المزيد",
    href: "#",
    featured: false,
    action: "coming-soon",
  },
  {
    icon: BarChart3,
    title: "خطة المتابعة",
    desc: "تتبع التقدم بمرور الوقت مع تقارير دورية وتحديث مستمر لخطة الدعم والتطوير.",
    tag: "مستمر",
    tagColor: "#2BBDB6",
    tagBg: "#DFF3F1",
    color: "#2BBDB6",
    bg: "linear-gradient(160deg, #DFF3F1 0%, #F4EFE8 100%)",
    border: "rgba(20,184,166,0.1)",
    cta: "ابدأ المتابعة",
    href: "#",
    featured: false,
    action: "coming-soon",
  },
];

export default function ServicesPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".fade-in-up").forEach((el, i) => {
              setTimeout(() => el.classList.add("visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleClick = (service: typeof services[0], e: React.MouseEvent) => {
    if (service.action === "coming-soon") {
      e.preventDefault();
      toast.info("هذه الخدمة قادمة قريباً", {
        description: "نعمل على إطلاق هذه الخدمة في أقرب وقت.",
      });
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-20 lg:py-28"
      style={{ background: "#F4EFE8" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 fade-in-up">
          <span className="section-label block mb-3">خدماتنا</span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-5"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
          >
            كل ما تحتاجه{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1E4E8C 0%, #2BBDB6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              في مكان واحد
            </span>
          </h2>
          <p
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.8 }}
          >
            من الفحص الأولي إلى خطة الدعم المستمرة — تشخيصي يرافقك في كل مرحلة.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`fade-in-up flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                  service.featured ? "hover:shadow-xl" : "hover:shadow-md"
                }`}
                style={{
                  background: service.bg,
                  border: `1px solid ${service.border}`,
                  boxShadow: service.featured
                    ? "0 4px 20px rgba(37,99,235,0.12), 0 0 0 2px rgba(37,99,235,0.1)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                  >
                    <Icon size={22} style={{ color: service.color }} />
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      color: service.tagColor,
                      background: service.tagBg,
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {service.tag}
                  </span>
                </div>

                <h3
                  className="text-base font-bold text-slate-900 mb-3"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm text-slate-600 leading-relaxed flex-1 mb-5"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.75 }}
                >
                  {service.desc}
                </p>

                <a
                  href={service.href}
                  onClick={(e) => handleClick(service, e)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5"
                  style={{ color: service.color, fontFamily: "'Cairo', sans-serif" }}
                >
                  {service.cta}
                  <ArrowLeft size={15} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

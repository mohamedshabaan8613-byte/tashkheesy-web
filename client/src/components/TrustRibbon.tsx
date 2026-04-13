/*
 * تشخيصي TrustRibbon — Editorial Healthcare
 * Horizontal trust badges strip — clean white, subtle border
 * 5 trust signals: Privacy, Arabic-first, Specialist, Follow-up, AI
 */

import { Shield, Globe, UserCheck, RefreshCw, Cpu } from "lucide-react";

const trustBadges = [
  {
    icon: Shield,
    title: "خصوصية تامة",
    desc: "بياناتك لن تُشارك مع أي جهة",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: Globe,
    title: "عربي أولاً",
    desc: "محتوى مصمم للمجتمع العربي",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: UserCheck,
    title: "مسار متخصص",
    desc: "موجَّه من قِبل متخصصين معتمدين",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: RefreshCw,
    title: "متابعة منظمة",
    desc: "خطة دعم واضحة بعد الفحص",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
  {
    icon: Cpu,
    title: "رؤى بالذكاء الاصطناعي",
    desc: "تحليل مدعوم بتقنية متقدمة",
    color: "#F4C46A",
    bg: "#FFFBEB",
  },
];

export default function TrustRibbon() {
  return (
    <section
      className="bg-white py-8 lg:py-10 relative"
      style={{ borderTop: "1px solid #DFF3F1", borderBottom: "1px solid #DFF3F1" }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663154655019/XUztTXmhcQeCV4Ng5pyz4t/trust-pattern-UZMk4BMbNxTH5SSZhsQJKm.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 lg:gap-5">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "white",
                  border: "1px solid #DFF3F1",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  minWidth: "185px",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: badge.bg }}
                >
                  <Icon size={17} style={{ color: badge.color }} />
                </div>
                <div>
                  <div
                    className="text-sm font-bold text-slate-900"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                  >
                    {badge.title}
                  </div>
                  <div
                    className="text-xs text-slate-500 leading-tight"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {badge.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

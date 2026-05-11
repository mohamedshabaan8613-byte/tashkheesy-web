/*
 * تشخيصي TrustRibbon — Sprint 2 Refinement
 *
 * Changes from previous version:
 * - Removed background image overlay (was 0.30 opacity — visual noise)
 * - Reduced from 5 to 4 trust points (max per Sprint 2 density rules)
 * - Removed "مسار متخصص — موجَّه من قِبل متخصصين معتمدين" (unsupported claim)
 * - Replaced with "للأطفال والبالغين" to reflect dual audience
 * - Simplified desc copy — shorter, calmer
 * - Removed minWidth constraint (better mobile wrapping)
 * - Kept: clean white background, subtle border, hover lift
 */

import { Shield, Globe, Users, Compass } from "lucide-react";

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
    icon: Users,
    title: "للأطفال والبالغين",
    desc: "مسار مخصص لكل حالة — طفل أو بالغ",
    color: "#1E4E8C",
    bg: "#DFF3F1",
  },
  {
    icon: Compass,
    title: "خطوة أولى منظمة",
    desc: "نتيجة أولية واضحة وتوجيه للخطوة التالية",
    color: "#2BBDB6",
    bg: "#DFF3F1",
  },
];

export default function TrustRibbon() {
  return (
    <section
      className="bg-white py-8 lg:py-10"
      style={{ borderTop: "1px solid #DFF3F1", borderBottom: "1px solid #DFF3F1" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

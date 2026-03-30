/*
 * تشخيصي Footer — Editorial Healthcare
 * Clean, minimal footer with brand, links, and legal
 * Dark background, subtle dividers
 */

export default function Footer() {
  const navLinks = [
    { section: "المنصة", links: ["ابدأ الفحص", "كيف يعمل", "خدماتنا", "لماذا تشخيصي"] },
    { section: "الدعم", links: ["الأسئلة الشائعة", "سياسة الخصوصية", "شروط الاستخدام", "تواصل معنا"] },
  ];

  return (
    <footer style={{ background: "#0A0F1E" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563EB, #14B8A6)" }}
              >
                <span
                  className="text-white font-bold text-base"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  ت
                </span>
              </div>
              <span
                className="text-2xl font-black text-white"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
              >
                تشخيصي
              </span>
            </div>
            <p
              className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.85 }}
            >
              منصة عربية متخصصة تساعدك على فهم صعوبات التعلم والانتباه، والوصول إلى الدعم المناسب بخطوات واضحة وبلغتك.
            </p>
            {/* Social / Contact placeholder */}
            <div className="flex gap-3">
              {["𝕏", "in", "f"].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {navLinks.map((group) => (
            <div key={group.section}>
              <h4
                className="text-sm font-bold text-white mb-5"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {group.section}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs text-slate-600"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            © ٢٠٢٥ تشخيصي. جميع الحقوق محفوظة.
          </p>
          <p
            className="text-xs text-slate-700"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            تشخيصي ليس بديلاً عن التشخيص الطبي المتخصص.
          </p>
        </div>
      </div>
    </footer>
  );
}

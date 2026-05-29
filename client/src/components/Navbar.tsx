/*
 * تشخيصي | Tashkheesy — Navbar
 * Sprint 5: Trust Calibration
 *
 * Changes from main:
 * ───────────────────────────────────────────────────────────────────
 * [2] Whisper badge "تجريبي" next to logo
 *     → 10px pill, slate tones only, no glow, no animation
 *     → signals honest beta status without shouting
 *
 * [3] Bottom sheet mobile menu (replaces dropdown)
 *     → slides up from screen bottom — correct thumb zone
 *     → backdrop + handle bar + aria-modal
 *     → links py-4 (44px+ touch targets)
 *     → single CTA at sheet bottom
 *
 * [4] will-change on header
 *     → GPU compositing for smooth scroll on mid-range Android
 *
 * Unchanged: navLinks, desktop nav/CTA, auth context, scroll logic
 * ───────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useContext } from "react";
import { Menu, X } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { AuthContext } from "@/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const authCtx = useContext(AuthContext);
  const isLoggedIn = Boolean(authCtx?.user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "كيف يعمل", href: "#how-it-works" },
    { label: "خدماتنا", href: "#services" },
    { label: "لماذا تشخيصي", href: "#why-tashkheesy" },
    { label: "الأسئلة الشائعة", href: "/faq" },
  ];

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 will-change-[background-color,box-shadow] ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo + Whisper badge */}
            <a
              href="/"
              className="flex items-center gap-2 group"
              aria-label="تشخيصي | Tashkheesy — الصفحة الرئيسية"
            >
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="w-9 h-9 rounded-xl shadow-md group-hover:shadow-lg transition-shadow object-cover"
              />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, color: "#243B53" }}
              >
                تشخيصي
              </span>
              {/* [2] Whisper badge — honest beta signal, no colour, no animation */}
              <span
                className="text-[10px] font-medium tracking-wide
                           text-slate-400 border border-slate-200
                           rounded-full px-2 py-0.5 bg-slate-50
                           leading-none select-none"
                aria-label="نسخة تجريبية"
              >
                تجريبي
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="القائمة الرئيسية">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:text-[#1E4E8C] hover:bg-[#DFF3F1]"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={isLoggedIn ? "/account" : "/login"}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-slate-600 hover:text-[#1E4E8C] hover:bg-[#DFF3F1] border border-slate-200 bg-white/70"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {isLoggedIn ? "حسابي" : "تسجيل الدخول"}
              </a>
              <a
                href="/start"
                className="inline-flex items-center justify-center text-sm font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4E8C] focus-visible:ring-offset-2"
                style={{
                  padding: "0.6rem 1.5rem",
                  background: "transparent",
                  border: "1px solid #1E4E8C",
                  color: "#1E4E8C",
                  fontFamily: "'Cairo', sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "#1E4E8C";
                  (e.currentTarget as HTMLAnchorElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#1E4E8C";
                }}
              >
                ابدأ الفحص
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
              aria-controls="mobile-sheet"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </div>
      </header>

      {/* [3] Bottom Sheet — mobile only ────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            id="mobile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة التنقل"
            dir="rtl"
            className="fixed bottom-0 inset-x-0 z-50 lg:hidden
                       bg-white rounded-t-[28px]
                       shadow-[0_-8px_32px_rgba(0,0,0,0.08)]
                       px-6 pt-3 pb-10
                       animate-slide-up"
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Nav links — py-4 = 44px+ touch target */}
            <nav aria-label="قائمة التنقل المحمول">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-4 text-base font-medium text-slate-700
                             border-b border-slate-100 last:border-0
                             hover:text-[#1E4E8C] transition-colors duration-150"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Auth + CTA */}
            <div className="mt-6 space-y-3">
              <a
                href={isLoggedIn ? "/account" : "/login"}
                className="block text-center py-3 text-sm font-medium rounded-xl
                           border border-slate-200 text-slate-700
                           hover:text-[#1E4E8C] hover:border-[#1E4E8C]
                           transition-colors duration-150"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                {isLoggedIn ? "حسابي" : "تسجيل الدخول"}
              </a>
              <a
                href="/start"
                className="block text-center py-3.5 text-sm font-bold rounded-2xl
                           bg-[#1E4E8C] text-white
                           hover:bg-[#0c4e54] transition-colors duration-150"
                style={{ fontFamily: "'Cairo', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                ابدأ الفحص الآن
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}

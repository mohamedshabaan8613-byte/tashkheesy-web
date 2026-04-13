/*
 * تشخيصي | Tashkheesy — Navbar
 * Sticky, transparent-to-white on scroll, Arabic RTL
 * Primary CTA: ابدأ الفحص → /start (unified entry for child & self-assessment)
 * Nav hierarchy: 4 essential links only — no competing CTAs, no marketing highlights
 * Accessibility: aria-labels, aria-expanded, role="navigation"
 *
 * Nav links rationale:
 *   كيف يعمل → #how-it-works  (homepage section anchor)
 *   خدماتنا  → #services       (homepage section anchor)
 *   لماذا تشخيصي → #why-tashkheesy (homepage section anchor)
 *   الأسئلة الشائعة → /faq    (standalone page)
 *
 * Removed from nav:
 *   "الأثر" → /impact  (accessible via Footer and Impact page — not a primary nav item)
 *   "نموذج النتائج" → /result-demo  (available via FounderStory CTA — not a nav item)
 */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "كيف يعمل", href: "#how-it-works" },
    { label: "خدماتنا", href: "#services" },
    { label: "لماذا تشخيصي", href: "#why-tashkheesy" },
    { label: "الأسئلة الشائعة", href: "/faq" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
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
          </a>

          {/* Desktop Nav — 4 essential links */}
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

          {/* Desktop CTA — single primary action */}
          <div className="hidden lg:flex items-center">
            <a
              href="/start"
              className="tashkhisi-btn-primary text-sm"
              style={{ padding: "0.6rem 1.5rem" }}
            >
              ابدأ الفحص
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-white border-t border-slate-100 shadow-lg"
          role="navigation"
          aria-label="قائمة التنقل المحمول"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors text-slate-700 hover:text-[#1E4E8C] hover:bg-[#DFF3F1]"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100">
              <a
                href="/start"
                className="tashkhisi-btn-primary block text-center text-sm w-full"
                style={{ padding: "0.75rem 1.5rem" }}
                onClick={() => setMenuOpen(false)}
              >
                ابدأ الفحص الآن
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

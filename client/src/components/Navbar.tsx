/*
 * تشخيصي Navbar — Editorial Healthcare
 * Sticky, transparent-to-white on scroll, Arabic RTL
 * Primary CTA: ابدأ الفحص (blue)
 */

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

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
    { label: "لماذا تشخيصي", href: "#why-tashkhisi" },
    { label: "الأثر", href: "#impact" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>ت</span>
            </div>
            <span
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800 }}
            >
              تشخيصي
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#screening"
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
            aria-label="فتح القائمة"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100">
              <a
                href="#screening"
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

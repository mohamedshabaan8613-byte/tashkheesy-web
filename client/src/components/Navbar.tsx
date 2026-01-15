import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white text-xl font-bold">
                ت
              </div>
              <div>
                <div className="text-lg font-semibold">تشخيصي</div>
                <div className="text-xs text-slate-500">
                  منصة تشخيص صعوبات التعلّم والقراءة
                </div>
              </div>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/">
              <a className="hover:text-indigo-600 transition-colors">الرئيسية</a>
            </Link>
            <Link href="/services">
              <a className="hover:text-indigo-600 transition-colors">خدمات التشخيص</a>
            </Link>
            <Link href="/pricing">
              <a className="hover:text-indigo-600 transition-colors">الأسعار</a>
            </Link>
            <Link href="/specialists">
              <a className="hover:text-indigo-600 transition-colors">أطباؤنا</a>
            </Link>
            <Link href="/schools">
              <a className="hover:text-indigo-600 transition-colors">للمدارس والجامعات</a>
            </Link>
            <Link href="/knowledge">
              <a className="hover:text-indigo-600 transition-colors">مركز المعرفة</a>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/booking">
              <Button size="sm">
                احجز موعدك
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-3">
            <Link href="/">
              <a className="block py-2 hover:text-indigo-600">الرئيسية</a>
            </Link>
            <Link href="/services">
              <a className="block py-2 hover:text-indigo-600">خدمات التشخيص</a>
            </Link>
            <Link href="/pricing">
              <a className="block py-2 hover:text-indigo-600">الأسعار</a>
            </Link>
            <Link href="/specialists">
              <a className="block py-2 hover:text-indigo-600">أطباؤنا</a>
            </Link>
            <Link href="/schools">
              <a className="block py-2 hover:text-indigo-600">للمدارس والجامعات</a>
            </Link>
            <Link href="/knowledge">
              <a className="block py-2 hover:text-indigo-600">مركز المعرفة</a>
            </Link>
            <div className="flex flex-col gap-2 pt-3">
              <Button variant="outline" size="sm" className="w-full">
                تسجيل الدخول
              </Button>
              <Button size="sm" className="w-full">
                إنشاء حساب
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

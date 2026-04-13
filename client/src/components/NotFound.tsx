import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFF3F1] via-white to-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="text-8xl font-black text-indigo-100 select-none mb-2">
          404
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#DBEAFE] flex items-center justify-center">
            <Search className="w-10 h-10 text-indigo-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          عذراً، الصفحة غير موجودة
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          الصفحة التي تبحث عنها قد تكون نُقلت أو حُذفت أو لم تكن موجودة أصلاً.
          تحقق من الرابط أو عد إلى الصفحة الرئيسية.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-[#1E4E8C] hover:bg-[#1A3F73] gap-2">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="gap-2">
              تواصل معنا
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-400 mb-4">أو تصفح هذه الصفحات:</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { href: "/services", label: "الخدمات" },
              { href: "/pricing", label: "الأسعار" },
              { href: "/booking", label: "احجز موعد" },
              { href: "/knowledge", label: "مركز المعرفة" },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="text-[#1E4E8C] hover:text-indigo-800 hover:underline transition-colors">
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

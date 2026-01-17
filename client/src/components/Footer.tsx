import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-8">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            © {new Date().getFullYear()} تشخيصي. جميع الحقوق محفوظة.
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/">
              <a className="hover:text-indigo-600 transition-colors">الرئيسية</a>
            </Link>
            <Link href="/services">
              <a className="hover:text-indigo-600 transition-colors">الخدمات</a>
            </Link>
            <Link href="/pricing">
              <a className="hover:text-indigo-600 transition-colors">الأسعار</a>
            </Link>
            <Link href="/team">
              <a className="hover:text-indigo-600 transition-colors">فريقنا</a>
            </Link>
            <Link href="/privacy">
              <a className="hover:text-indigo-600 transition-colors">سياسة الخصوصية</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

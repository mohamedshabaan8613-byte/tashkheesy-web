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
            <Link href="/privacy">
              <a className="hover:text-indigo-600 transition-colors">
                سياسة الخصوصية
              </a>
            </Link>
            <Link href="/disclaimer">
              <a className="hover:text-indigo-600 transition-colors">
                إخلاء المسؤولية الطبية
              </a>
            </Link>
            <Link href="/contact">
              <a className="hover:text-indigo-600 transition-colors">
                تواصل معنا
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

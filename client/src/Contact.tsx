import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                تواصل معنا
              </h1>
              <p className="text-lg text-slate-600">
                نحن هنا للإجابة على جميع استفساراتك ومساعدتك
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    البريد الإلكتروني
                  </h3>
                  <a
                    href="mailto:info@tashkhisi.com"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    info@tashkhisi.com
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">الهاتف</h3>
                  <a
                    href="tel:+966500000000"
                    className="text-sm text-emerald-600 hover:underline"
                    dir="ltr"
                  >
                    +966 50 000 0000
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">الموقع</h3>
                  <p className="text-sm text-slate-600">
                    الرياض، المملكة العربية السعودية
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    ساعات العمل
                  </h3>
                  <p className="text-sm text-slate-600">
                    الأحد - الخميس
                    <br />
                    9:00 ص - 6:00 م
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                طرق التواصل السريع
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      للاستفسارات العامة
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      لأي أسئلة حول خدماتنا، الأسعار، أو طريقة الحجز
                    </p>
                    <a
                      href="mailto:info@tashkhisi.com"
                      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      أرسل استفسارك
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      للمؤسسات التعليمية
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      للحصول على عروض خاصة للمدارس والجامعات
                    </p>
                    <a
                      href="mailto:schools@tashkhisi.com"
                      className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      تواصل معنا
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      الدعم الفني
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      لمساعدتك في مشاكل الحساب أو الدفع أو الجلسات
                    </p>
                    <a
                      href="mailto:support@tashkhisi.com"
                      className="inline-block bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
                    >
                      احصل على الدعم
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      انضم كأخصائي
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      إذا كنت أخصائي صعوبات تعلم وتريد الانضمام لفريقنا
                    </p>
                    <a
                      href="mailto:careers@tashkhisi.com"
                      className="inline-block bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
                    >
                      قدّم الآن
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="py-16 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600">خريطة الموقع</p>
                      <p className="text-sm text-slate-500">
                        الرياض، المملكة العربية السعودية
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

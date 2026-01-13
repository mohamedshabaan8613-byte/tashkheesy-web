import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-amber-50 to-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-amber-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                إخلاء المسؤولية الطبية
              </h1>
              <p className="text-lg text-slate-600">
                معلومات مهمة حول طبيعة خدماتنا ونطاقها
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">
                        ⚠️ ملاحظة مهمة جداً
                      </h3>
                      <p className="text-slate-700 leading-relaxed">
                        هذه الوثيقة تحتوي على معلومات قانونية مهمة. يرجى قراءتها
                        بعناية قبل استخدام خدماتنا. استخدامك للمنصة يعني موافقتك على
                        هذه الشروط.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    1. طبيعة الخدمة
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    منصة "تشخيصي" تقدّم خدمات <strong>تقييم وتشخيص نفسي وتربوي</strong>{" "}
                    عن طريق أخصائيين معتمدين في مجال صعوبات التعلم وصعوبات القراءة
                    (الديسلكسيا).
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    خدماتنا <strong>لا تشمل</strong>:
                  </p>
                  <ul className="space-y-2 text-slate-700 mt-3">
                    <li>• التشخيص الطبي أو العلاج الطبي</li>
                    <li>• وصف الأدوية أو العلاجات الدوائية</li>
                    <li>• خدمات الطوارئ النفسية أو الطبية</li>
                    <li>• العلاج النفسي أو الاستشارات النفسية العميقة</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    2. نطاق المسؤولية
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    التوصيات والتقارير المقدَّمة من الأخصائيين تعتمد على:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• المعلومات التي يشاركها المستخدم (ولي الأمر/الطالب)</li>
                    <li>• نتائج الجلسات والاختبارات المستخدمة خلال التقييم</li>
                    <li>• الملاحظات السلوكية والتربوية المتاحة</li>
                  </ul>
                  <p className="text-slate-700 leading-relaxed mt-4">
                    <strong>لا تتحمّل المنصة مسؤولية:</strong>
                  </p>
                  <ul className="space-y-2 text-slate-700 mt-3">
                    <li>• أي استخدام غير مناسب للتقرير خارج الإطار المتفق عليه</li>
                    <li>• قرارات المدارس أو الجامعات بناءً على التقارير</li>
                    <li>• عدم دقة المعلومات المقدمة من المستخدم</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    3. الحالات الطارئة
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    منصة "تشخيصي" <strong>لا تقدّم خدمات طوارئ</strong>. إذا كنت أنت أو
                    طفلك في حالة طوارئ نفسية أو طبية:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• اتصل بخدمات الطوارئ المحلية فوراً (997 في السعودية)</li>
                    <li>• توجه إلى أقرب مستشفى أو مركز صحي</li>
                    <li>• لا تعتمد على المنصة في الحالات العاجلة</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    4. التوصية بالمراجعة الطبية
                  </h2>
                  <p className="text-slate-700 leading-relaxed">
                    في حال أشار التقييم إلى احتمالية وجود حالات طبية أو نفسية تتطلب
                    تدخلاً طبياً، سيوصي الأخصائي بمراجعة طبيب مختص أو مستشفى. يجب
                    على المستخدم الالتزام بهذه التوصيات واستشارة الجهات الطبية
                    المناسبة.
                  </p>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    5. مسؤولية المستخدم
                  </h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    باستخدامك للمنصة، فإنك توافق على:
                  </p>
                  <ul className="space-y-2 text-slate-700">
                    <li>• تقديم معلومات دقيقة وصادقة عن الحالة</li>
                    <li>• عدم استخدام المنصة كبديل عن الرعاية الطبية المتخصصة</li>
                    <li>• الالتزام بتوصيات الأخصائي بمراجعة جهات طبية عند الحاجة</li>
                    <li>• فهم أن التقرير هو أداة مساعدة وليس تشخيصاً طبياً نهائياً</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    6. التواصل معنا
                  </h2>
                  <p className="text-slate-700 leading-relaxed">
                    إذا كان لديك أي أسئلة حول إخلاء المسؤولية، يرجى التواصل معنا عبر:
                  </p>
                  <p className="text-slate-700 mt-4">
                    <strong>البريد الإلكتروني:</strong>{" "}
                    <a
                      href="mailto:legal@tashkhisi.com"
                      className="text-indigo-600 hover:underline"
                    >
                      legal@tashkhisi.com
                    </a>
                  </p>
                  <p className="text-sm text-slate-500 mt-6">
                    آخر تحديث: {new Date().toLocaleDateString("ar-SA")}
                  </p>
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

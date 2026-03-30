import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Award, CheckCircle } from "lucide-react";

export default function TeamPreview() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 mb-6">
              <Users className="w-4 h-4" />
              <span>فريقنا من الخبراء</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              نخبة من الأخصائيين المعتمدين <br />
              <span className="text-indigo-600">في خدمتك وخدمة طفلك</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              يضم فريقنا نخبة من الأخصائيين الحاصلين على درجات الدكتوراه والماجستير في التربية الخاصة وصعوبات التعلم، مع خبرات عملية تتجاوز 15 عاماً في التشخيص والتقييم.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                "أخصائيون معتمدون دولياً ومحلياً",
                "خبرة في أحدث أدوات التشخيص",
                "تقارير مهنية معتمدة",
                "متابعة مستمرة بعد التشخيص"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/team">
                <Button size="lg" className="px-8">
                  تعرف على الفريق
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" variant="outline" className="px-8">
                  احجز جلسة استشارية
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats/Visual */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-xl shadow-indigo-100/50 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">4</div>
                  <div className="text-sm text-slate-500 font-medium">أخصائيين معتمدين</div>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-xl shadow-green-100/50 bg-white mt-8">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">+15</div>
                  <div className="text-sm text-slate-500 font-medium">سنة خبرة</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-purple-100/50 bg-white -mt-4">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">4.9</div>
                  <div className="text-sm text-slate-500 font-medium">تقييم العملاء</div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-blue-100/50 bg-white mt-4">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">+3500</div>
                  <div className="text-sm text-slate-500 font-medium">جلسة تشخيص</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

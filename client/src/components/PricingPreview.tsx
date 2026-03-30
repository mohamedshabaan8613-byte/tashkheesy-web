import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { Link } from "wouter";

const packages = [
  {
    name: "باقة تشخيص طفل واحد",
    price: "299",
    description: "مثالية للأهالي الراغبين في فهم حالة طفلهم الدراسية",
    features: [
      "جلسة تشخيص 60–90 دقيقة",
      "تقرير رسمي PDF معتمد",
      "اتصال متابعة 15 دقيقة",
      "خطة توصيات أولية"
    ],
    cta: "ابدأ تشخيص طفلك",
    highlighted: false
  },
  {
    name: "باقة طالب جامعي",
    price: "349",
    description: "مصممة خصيصاً للحصول على التسهيلات الأكاديمية",
    features: [
      "جلسة تقييم 75 دقيقة",
      "تقرير قابل للتقديم للجامعة",
      "توصيات للتسهيلات الأكاديمية",
      "جلسة استشارية للنتائج"
    ],
    cta: "احجز باقة الجامعة",
    highlighted: true
  },
  {
    name: "باقة عائلة (طفلين)",
    price: "499",
    description: "توفير أكبر للعائلات التي تحتاج لأكثر من تشخيص",
    features: [
      "تشخيص لطفلين من نفس الأسرة",
      "تقرير منفصل لكل طفل",
      "توصيات وخطة متابعة",
      "خصم 20% على الجلسات الإضاف"
    ],
    cta: "احصل على خصم العائلة",
    highlighted: false
  }
];

export default function PricingPreview() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
            باقاتنا وأسعارنا
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            استثمار في مستقبل طفلك
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            نقدم أسعاراً تنافسية وشفافة لضمان حصول الجميع على الدعم المتخصص
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative flex flex-col h-full hover:shadow-2xl transition-all duration-300 border-none ${
                pkg.highlighted ? "ring-4 ring-indigo-600 shadow-indigo-100 scale-105 z-10" : "shadow-xl shadow-slate-200"
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm font-bold px-6 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-4 h-4 fill-white" />
                  الأكثر طلباً
                </div>
              )}
              <CardContent className="pt-10 pb-10 px-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">
                      {pkg.price}
                    </span>
                    <span className="text-lg font-bold text-slate-500">ر.س</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">شامل التقرير والجلسة</div>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/booking">
                  <Button
                    className={`w-full h-12 text-lg font-bold ${
                      pkg.highlighted 
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
                        : "bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    {pkg.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            هل تحتاج لباقة مخصصة لمدرسة أو مؤسسة؟ 
            <Link href="/services" className="text-indigo-600 font-bold mr-1 hover:underline">تواصل معنا هنا</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

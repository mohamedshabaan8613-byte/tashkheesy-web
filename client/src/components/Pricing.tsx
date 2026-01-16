import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, Sparkles } from "lucide-react";

const pricingPlans = [
  {
    id: "child",
    name: "باقة تشخيص طفل واحد",
    price: "299",
    currency: "ر.س",
    description: "مثالية للأهل الذين يرغبون في تشخيص طفل واحد",
    features: [
      "جلسة تشخيص 60–90 دقيقة",
      "تقرير رسمي PDF",
      "اتصال متابعة 15 دقيقة",
      "توصيات للأهل والمدرسة",
      "دعم عبر البريد الإلكتروني"
    ],
    popular: false
  },
  {
    id: "university",
    name: "باقة طالب جامعي",
    price: "349",
    currency: "ر.س",
    description: "للطلاب الجامعيين الذين يحتاجون تقرير رسمي",
    features: [
      "جلسة تقييم 75 دقيقة",
      "تقرير قابل للتقديم للجامعة",
      "توصيات للتسهيلات الأكاديمية",
      "استشارة متابعة 20 دقيقة",
      "دعم مباشر عبر الواتساب"
    ],
    popular: true
  },
  {
    id: "family",
    name: "باقة عائلة",
    price: "499",
    currency: "ر.س",
    description: "وفّر 100 ر.س عند تشخيص طفلين من نفس الأسرة",
    features: [
      "تشخيص لطفلين من نفس الأسرة",
      "تقرير لكل طفل",
      "توصيات وخطة متابعة",
      "جلسة استشارية عائلية 30 دقيقة",
      "أولوية في الحجز"
    ],
    popular: false
  }
];

const institutionalFeatures = [
  "تشخيص جماعي لعدد من الطلاب",
  "تقارير فردية مفصلة",
  "تقرير تجميعي للمؤسسة",
  "ورش عمل توعوية للمعلمين",
  "استشارات تربوية متخصصة",
  "خصومات على الأعداد الكبيرة",
  "متابعة دورية وتقييم التقدم",
  "مدير حساب مخصص"
];

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-50 to-white py-16">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                باقات وأسعار واضحة
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                أسعار شفافة وقيمة حقيقية لكل باقة. اختر الباقة المناسبة لاحتياجاتك
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-indigo-600 border-2 shadow-xl' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        الأكثر طلباً
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          {plan.price}
                        </span>
                        <span className="text-slate-600">
                          {plan.currency}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/booking">
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                      >
                        احجز الآن
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Institutional Section */}
        <section className="py-16 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  باقات المؤسسات التعليمية
                </h2>
                <p className="text-slate-600">
                  حلول مخصصة للمدارس والجامعات والمراكز التعليمية
                </p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        ما نقدمه للمؤسسات:
                      </h3>
                      <ul className="space-y-3">
                        {institutionalFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-indigo-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">
                        احصل على عرض سعر مخصص
                      </h3>
                      <p className="text-slate-600 mb-6">
                        نقدم أسعاراً تنافسية للمؤسسات التعليمية حسب عدد الطلاب واحتياجاتكم الخاصة
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-slate-600 mb-1">10-50 طالب</p>
                          <p className="text-2xl font-bold text-slate-900">خصم 15%</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-slate-600 mb-1">50-100 طالب</p>
                          <p className="text-2xl font-bold text-slate-900">خصم 25%</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-slate-600 mb-1">أكثر من 100 طالب</p>
                          <p className="text-2xl font-bold text-slate-900">خصم 35%</p>
                        </div>
                      </div>

                      <Link href="/contact">
                        <Button className="w-full mt-6">
                          تواصل معنا
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                أسئلة شائعة عن الأسعار
              </h2>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      هل السعر يشمل التقرير الرسمي؟
                    </h3>
                    <p className="text-slate-600">
                      نعم، جميع الباقات تشمل تقريراً رسمياً مفصلاً بصيغة PDF مع توصيات عملية.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      هل يمكن استرداد المبلغ؟
                    </h3>
                    <p className="text-slate-600">
                      يمكن استرداد المبلغ كاملاً في حال الإلغاء قبل 24 ساعة من موعد الجلسة.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      هل هناك رسوم إضافية؟
                    </h3>
                    <p className="text-slate-600">
                      لا، السعر المعلن يشمل كل شيء: الجلسة، التقرير، والمتابعة. لا توجد رسوم خفية.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      كيف يمكنني الدفع؟
                    </h3>
                    <p className="text-slate-600">
                      نقبل الدفع عبر البطاقات الائتمانية (Visa, Mastercard, Mada) وApple Pay.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-indigo-600 to-indigo-700">
          <div className="container">
            <div className="text-center text-white max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                جاهز للبدء؟
              </h2>
              <p className="text-indigo-100 mb-8">
                احجز موعدك الآن واحصل على تشخيص احترافي يساعدك على فهم الحالة واتخاذ الخطوات الصحيحة
              </p>
              <Link href="/booking">
                <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                  احجز موعدك الآن
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

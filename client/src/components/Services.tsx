import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuickBookingForm from "@/components/QuickBookingForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Baby, 
  GraduationCap, 
  School, 
  CheckCircle2, 
  Clock, 
  FileText,
  Video,
  Award
} from "lucide-react";

const services = [
  {
    id: "children",
    icon: Baby,
    title: "تشخيص صعوبات التعلم للأطفال",
    subtitle: "للأطفال من عمر 6 إلى 12 سنة",
    description: "تقييم شامل لمهارات القراءة والوعي الصوتي والسلوكيات المصاحبة، مع تقرير رسمي وخطة أولية للأهل والمدرسة.",
    price: "299 ر.س",
    duration: "60-90 دقيقة",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    features: [
      "جلسة تشخيص شاملة عبر الإنترنت",
      "اختبارات مقننة للقراءة والوعي الصوتي",
      "تقييم المهارات الإدراكية والانتباه",
      "تقرير رسمي مفصل بصيغة PDF",
      "توصيات عملية للأهل والمدرسة",
      "اتصال متابعة مجاني (15 دقيقة)"
    ]
  },
  {
    id: "university",
    icon: GraduationCap,
    title: "تشخيص صعوبات التعلم لطلاب الجامعة",
    subtitle: "للطلاب الجامعيين والثانوية",
    description: "تقييم تأثير صعوبات القراءة على أداء الطالب الجامعي، مع تقرير قابل للتقديم للجامعة للحصول على التسهيلات الأكاديمية.",
    price: "349 ر.س",
    duration: "75 دقيقة",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    features: [
      "جلسة تقييم متخصصة للبالغين",
      "اختبارات سرعة القراءة والاستيعاب",
      "تقييم تأثير الصعوبات على الأداء الأكاديمي",
      "تقرير رسمي قابل للتقديم للجامعة",
      "توصيات للتسهيلات الأكاديمية",
      "استشارة متابعة (20 دقيقة)"
    ]
  },
  {
    id: "schools",
    icon: School,
    title: "حلول تشخيصية للمدارس والجامعات",
    subtitle: "باقات مؤسسية مخصصة",
    description: "باقات مخصصة للمؤسسات التعليمية لتشخيص عدد من الطلاب مع تقارير تجميعية وتوصيات تربوية.",
    price: "حسب الطلب",
    duration: "مرن",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    features: [
      "تشخيص جماعي لعدد من الطلاب",
      "تقارير فردية لكل طالب",
      "تقرير تجميعي للمؤسسة",
      "ورش عمل توعوية للمعلمين",
      "استشارات تربوية متخصصة",
      "متابعة دورية وتقييم التقدم"
    ]
  }
];

const processSteps = [
  {
    icon: Clock,
    title: "احجز موعدك",
    description: "اختر الخدمة المناسبة وحدد الوقت الذي يناسبك"
  },
  {
    icon: Video,
    title: "جلسة التشخيص",
    description: "لقاء أونلاين مع أخصائي معتمد عبر منصة آمنة"
  },
  {
    icon: FileText,
    title: "استلم التقرير",
    description: "تقرير رسمي مفصل مع توصيات عملية خلال 3-5 أيام"
  },
  {
    icon: Award,
    title: "خطة العمل",
    description: "توصيات واضحة وخطة متابعة حسب الحاجة"
  }
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-50 to-white py-16">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                خدمات التشخيص المتوفرة
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                نقدم خدمات تشخيص متخصصة لصعوبات التعلم والقراءة، مع أخصائيين معتمدين وتقارير رسمية تساعدك على اتخاذ القرارات الصحيحة
              </p>
            </div>
          </div>
        </section>

        {/* Services Cards */}
        <section className="py-16">
          <div className="container">
            <div className="space-y-12">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-8">
                      <div>
                        <div className={`w-16 h-16 rounded-xl ${service.bgColor} flex items-center justify-center mb-6`}>
                          <Icon className={`w-8 h-8 ${service.color}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                          {service.title}
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                          {service.subtitle}
                        </p>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center gap-6 mb-6">
                          <div>
                            <p className="text-sm text-slate-500">السعر</p>
                            <p className="text-2xl font-bold text-slate-900">{service.price}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">المدة</p>
                            <p className="text-lg font-semibold text-slate-700">{service.duration}</p>
                          </div>
                        </div>

                        <Link href="/booking">
                          <Button size="lg" className="w-full md:w-auto">
                            احجز الآن
                          </Button>
                        </Link>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          ما يشمله التشخيص:
                        </h3>
                        <ul className="space-y-3">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className={`w-5 h-5 ${service.color} flex-shrink-0 mt-0.5`} />
                              <span className="text-slate-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-slate-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                كيف تتم عملية التشخيص؟
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                عملية بسيطة وواضحة للحصول على تشخيص احترافي
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="text-sm font-semibold text-indigo-600 mb-2">
                      الخطوة {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Booking Form Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  جاهز للبدء؟
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  احجز موعدك الآن واحصل على تشخيص احترافي يساعدك على فهم الحالة واتخاذ الخطوات الصحيحة
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">سريع وسهل</h3>
                      <p className="text-slate-600 text-sm">املأ النموذج في أقل من دقيقة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">رد سريع</h3>
                      <p className="text-slate-600 text-sm">سنتواصل معك خلال 24 ساعة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">مرونة في المواعيد</h3>
                      <p className="text-slate-600 text-sm">اختر الوقت الذي يناسبك</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <QuickBookingForm />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-slate-50">
          <div className="container">
            <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  هل أنت مستعد للبدء؟
                </h2>
                <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                  احجز موعدك الآن واحصل على تشخيص احترافي يساعدك على فهم الحالة واتخاذ الخطوات الصحيحة
                </p>
                <Link href="/booking">
                  <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                    احجز موعدك الآن
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

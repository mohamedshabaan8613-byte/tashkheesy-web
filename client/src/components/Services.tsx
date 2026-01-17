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
  Award,
  HelpCircle,
  Check,
  X,
  PlayCircle,
  ArrowLeft
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const comparisonFeatures = [
  { name: "جلسة تشخيص أونلاين", children: true, university: true, schools: true },
  { name: "تقرير رسمي معتمد", children: true, university: true, schools: true },
  { name: "خطة توصيات تربوية", children: true, university: true, schools: true },
  { name: "توصيات تسهيلات أكاديمية", children: false, university: true, schools: true },
  { name: "اتصال متابعة مجاني", children: true, university: true, schools: "حسب الاتفاق" },
  { name: "تقارير تجميعية للمؤسسة", children: false, university: false, schools: true },
  { name: "ورش عمل للمعلمين", children: false, university: false, schools: true },
];

const faqs = [
  {
    question: "كيف يتم التشخيص عبر الإنترنت؟",
    answer: "يتم التشخيص عبر منصة فيديو آمنة (مثل Zoom أو Google Meet). يقوم الأخصائي بإجراء اختبارات تفاعلية مع الطفل أو الطالب، ومقابلة الأهل لجمع المعلومات اللازمة."
  },
  {
    question: "هل التقرير معتمد في المدارس والجامعات؟",
    answer: "نعم، تقاريرنا تصدر من أخصائيين معتمدين من هيئة التخصصات الصحية، وهي مصممة لتلبي متطلبات المدارس والجامعات في المملكة العربية السعودية للحصول على التسهيلات الأكاديمية."
  },
  {
    question: "كم يستغرق استلام التقرير النهائي؟",
    answer: "يستغرق إعداد التقرير وتحليله من 3 إلى 5 أيام عمل بعد انتهاء جلسة التشخيص، ويتم إرساله بصيغة PDF عبر البريد الإلكتروني أو الواتساب."
  },
  {
    question: "هل أحتاج لتحضير أي شيء قبل الجلسة؟",
    answer: "يفضل توفير مكان هادئ، اتصال إنترنت جيد، وجهاز كمبيوتر أو تابلت بشاشة واضحة. بالنسبة للأطفال، يفضل وجود الأهل في البداية لتسهيل التواصل."
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
        <section className="bg-gradient-to-b from-indigo-50 to-white py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
                خدماتنا المتخصصة
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                حلول تشخيصية <span className="text-indigo-600">ذكية</span> وموثوقة
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                نقدم خدمات تشخيص متخصصة لصعوبات التعلم والقراءة، مع أخصائيين معتمدين وتقارير رسمية تساعدك على اتخاذ القرارات الصحيحة لمستقبل طفلك أو مسارك الأكاديمي.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/booking">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 text-lg font-bold shadow-lg shadow-indigo-200">
                    ابدأ التشخيص الآن
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-2 border-slate-200 h-14 px-8 text-lg font-bold flex items-center gap-2">
                  <PlayCircle className="w-6 h-6 text-indigo-600" />
                  شاهد كيف نعمل
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Cards */}
        <section className="py-20">
          <div className="container">
            <div className="space-y-16">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isEven = index % 2 === 0;
                return (
                  <div key={service.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                    <div className="flex-1 w-full">
                      <div className={`w-20 h-20 rounded-2xl ${service.bgColor} flex items-center justify-center mb-8 shadow-sm`}>
                        <Icon className={`w-10 h-10 ${service.color}`} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        {service.title}
                      </h2>
                      <p className="text-indigo-600 font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-indigo-600"></span>
                        {service.subtitle}
                      </p>
                      <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                        {service.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">السعر يبدأ من</p>
                          <p className="text-3xl font-bold text-slate-900">{service.price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">مدة الجلسة</p>
                          <p className="text-xl font-semibold text-slate-700">{service.duration}</p>
                        </div>
                      </div>

                      <Link href="/booking">
                        <Button size="lg" className={`w-full md:w-auto px-10 h-14 text-lg font-bold ${service.bgColor.replace('bg-', 'bg-').replace('50', '600')} hover:opacity-90 text-white`}>
                          احجز هذه الباقة
                        </Button>
                      </Link>
                    </div>

                    <div className="flex-1 w-full">
                      <Card className="border-none shadow-2xl shadow-slate-200 overflow-hidden">
                        <CardContent className="p-8 lg:p-10">
                          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <CheckCircle2 className={`w-6 h-6 ${service.color}`} />
                            ما يشمله التشخيص بالتفصيل:
                          </h3>
                          <ul className="space-y-4">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-4 group">
                                <div className={`w-6 h-6 rounded-full ${service.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                                  <Check className={`w-3.5 h-3.5 ${service.color}`} />
                                </div>
                                <span className="text-slate-600 text-lg">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                قارن بين خدماتنا
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                اختر الباقة التي تناسب احتياجاتك التعليمية والأكاديمية
              </p>
            </div>

            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-6 px-6 text-right font-bold text-lg">الميزة</th>
                    <th className="py-6 px-6 text-center font-bold text-lg">الأطفال</th>
                    <th className="py-6 px-6 text-center font-bold text-lg">الجامعة</th>
                    <th className="py-6 px-6 text-center font-bold text-lg">المؤسسات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-6 text-slate-700 font-medium">{feature.name}</td>
                      <td className="py-5 px-6 text-center">
                        {typeof feature.children === 'boolean' ? (
                          feature.children ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-slate-300 mx-auto" />
                        ) : <span className="text-sm font-bold text-indigo-600">{feature.children}</span>}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof feature.university === 'boolean' ? (
                          feature.university ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-slate-300 mx-auto" />
                        ) : <span className="text-sm font-bold text-indigo-600">{feature.university}</span>}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {typeof feature.schools === 'boolean' ? (
                          feature.schools ? <Check className="w-6 h-6 text-emerald-500 mx-auto" /> : <X className="w-6 h-6 text-slate-300 mx-auto" />
                        ) : <span className="text-sm font-bold text-indigo-600">{feature.schools}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                كيف تتم عملية التشخيص؟
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                عملية بسيطة وواضحة للحصول على تشخيص احترافي من منزلك
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-indigo-100 -z-10"></div>
              
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-20 h-20 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:border-indigo-600 transition-all duration-300">
                      <Icon className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-3">
                      الخطوة {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-block p-3 bg-indigo-100 rounded-2xl mb-4">
                  <HelpCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  الأسئلة الشائعة حول الخدمات
                </h2>
                <p className="text-slate-600 text-lg">
                  كل ما تحتاج معرفته عن عملية التشخيص والتقارير
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-slate-200 rounded-2xl px-6 overflow-hidden shadow-sm">
                    <AccordionTrigger className="text-right font-bold text-lg py-6 hover:no-underline text-slate-900">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-lg pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Quick Booking Form Section */}
        <section className="py-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  ابدأ رحلة التغيير <br />
                  <span className="text-indigo-600">اليوم</span>
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                  لا تتردد في طلب المساعدة، التشخيص المبكر هو المفتاح لتجاوز التحديات الدراسية وتحقيق النجاح الأكاديمي.
                </p>
                
                <div className="space-y-6">
                  {[
                    { title: "سريع وسهل", desc: "املأ النموذج في أقل من دقيقة" },
                    { title: "رد سريع", desc: "سنتواصل معك خلال 24 ساعة عمل" },
                    { title: "مرونة كاملة", desc: "اختر الوقت الذي يناسب جدولك" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-indigo-50 transition-colors">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-600/5 rounded-[2rem] -z-10 blur-2xl"></div>
                <QuickBookingForm />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-white">
          <div className="container">
            <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <CardContent className="py-16 px-8 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  هل لديك استفسار خاص؟
                </h2>
                <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
                  فريقنا جاهز للإجابة على كافة تساؤلاتك وتقديم المشورة المناسبة لحالتك.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/booking">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-14 text-lg font-bold">
                      احجز موعدك الآن
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-2 border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg font-bold flex items-center gap-2">
                    تواصل معنا عبر واتساب
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

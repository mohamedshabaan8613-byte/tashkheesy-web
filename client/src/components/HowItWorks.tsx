import { Card, CardContent } from "@/components/ui/card";
import { Search, Calendar, Video, FileText } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "اختيار الخدمة",
    description: "اختر نوع التشخيص المناسب (طفل – طالب جامعي – خدمة مؤسسية).",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: Calendar,
    title: "حجز موعد أونلاين",
    description: "حدد الوقت المناسب وتعرّف على الأخصائي الذي سيقابلك.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    icon: Video,
    title: "جلسة مع الأخصائي",
    description: "مقابلة أونلاين مع الأهل/الطالب، تشمل أسئلة متخصصة واختبارات مناسبة للعمر.",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    icon: FileText,
    title: "استلام التقرير وخطة العمل",
    description: "تقرير رسمي + توصيات عملية + إمكانية حجز جلسات متابعة.",
    color: "text-rose-600",
    bgColor: "bg-rose-50"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            كيف يعمل تشخيصي؟
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            عملية بسيطة وواضحة للحصول على تشخيص احترافي وخطة عمل متكاملة
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Step Number */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${step.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

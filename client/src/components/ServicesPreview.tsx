import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Baby, GraduationCap, School, ArrowLeft } from "lucide-react";

const services = [
  {
    icon: Baby,
    title: "تشخيص صعوبات التعلم للأطفال",
    description: "تقييم شامل لمهارات القراءة والوعي الصوتي والسلوكيات المصاحبة، مع تقرير رسمي وخطة أولية للأهل والمدرسة.",
    link: "/services",
    cta: "ابدأ تشخيص طفلك",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: GraduationCap,
    title: "تشخيص صعوبات التعلم لطلاب الجامعة",
    description: "تقييم تأثير صعوبات القراءة على أداء الطالب الجامعي، مع تقرير قابل للتقديم للجامعة للحصول على التسهيلات الأكاديمية.",
    link: "/services",
    cta: "احصل على تسهيلات أكاديمية",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    icon: School,
    title: "حلول تشخيصية للمدارس والجامعات",
    description: "باقات مخصصة للمؤسسات التعليمية لتشخيص عدد من الطلاب مع تقارير تجميعية وتوصيات تربوية.",
    link: "/services",
    cta: "اطلب عرضاً لمؤسستك",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  }
];

export default function ServicesPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
            خدماتنا المتخصصة
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            كيف يمكننا مساعدتك اليوم؟
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            نقدم حلولاً تشخيصية متكاملة تناسب جميع الفئات العمرية والمؤسسات التعليمية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-slate-100">
                <CardContent className="pt-8 pb-8 px-8">
                  <div className={`w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <Link href={service.link}>
                    <Button variant="ghost" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-2 group/btn">
                      {service.cta}
                      <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

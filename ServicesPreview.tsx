import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Baby, GraduationCap, School } from "lucide-react";

const services = [
  {
    icon: Baby,
    title: "تشخيص صعوبات التعلم للأطفال",
    description: "تقييم شامل لمهارات القراءة والوعي الصوتي والسلوكيات المصاحبة، مع تقرير رسمي وخطة أولية للأهل والمدرسة.",
    link: "/services/children",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: GraduationCap,
    title: "تشخيص صعوبات التعلم لطلاب الجامعة",
    description: "تقييم تأثير صعوبات القراءة على أداء الطالب الجامعي، مع تقرير قابل للتقديم للجامعة للحصول على التسهيلات الأكاديمية.",
    link: "/services/university",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    icon: School,
    title: "حلول تشخيصية للمدارس والجامعات",
    description: "باقات مخصصة للمؤسسات التعليمية لتشخيص عدد من الطلاب مع تقارير تجميعية وتوصيات تربوية.",
    link: "/schools",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  }
];

export default function ServicesPreview() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            خدمات التشخيص المتوفرة
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            جميع خدماتنا تتم عبر أخصائيين معتمدين، من خلال جلسات أونلاين وتقارير رسمية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-xl ${service.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 ${service.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <Link href={service.link}>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700">
                      تفاصيل الخدمة ←
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

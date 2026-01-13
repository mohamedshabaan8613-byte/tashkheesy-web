import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Database, BarChart3, CheckCircle, FileEdit } from "lucide-react";
import { toast } from "sonner";

const services = [
  {
    icon: BookOpen,
    title: "اختيار موضوع البحث",
    description: "نساعدك في اختيار موضوع بحثي أصيل ومناسب لاهتماماتك وأهدافك الأكاديمية والمهنية.",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: FileText,
    title: "كتابة خطة البحث",
    description: "دليل شامل لكتابة مقترح بحثي احترافي يتوافق مع معايير الجامعات العربية والعالمية.",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: Database,
    title: "توفير المراجع",
    description: "أدوات ونصائح لإدارة وتوثيق المراجع العلمية بأساليب APA وMLA وغيرها.",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: BarChart3,
    title: "التحليل الإحصائي",
    description: "شرح مفصل لخطوات التحليل الإحصائي وأهم البرامج المستخدمة مثل SPSS وR.",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    icon: CheckCircle,
    title: "التدقيق اللغوي",
    description: "معايير التدقيق اللغوي الأكاديمي وأفضل الأدوات للتدقيق باللغتين العربية والإنجليزية.",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    icon: FileEdit,
    title: "تنسيق الرسائل العلمية",
    description: "دليل كامل لتنسيق رسائل الماجستير والدكتوراه وفق المعايير الأكاديمية.",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50"
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            خدماتنا الشاملة
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نقدم ستة خدمات أساسية تغطي جميع احتياجات طلاب الماجستير في رحلتهم البحثية
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg ${service.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4 leading-relaxed">
                    {service.description}
                  </CardDescription>
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => toast.info("هذه الميزة قيد التطوير")}
                  >
                    اقرأ المزيد ←
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Database, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const guideItems = [
  {
    icon: BookOpen,
    title: "اختيار موضوع البحث",
    description: "استراتيجيات توليد الأفكار ومعايير اختيار الموضوع الجيد",
    color: "text-blue-600"
  },
  {
    icon: FileText,
    title: "كتابة خطة البحث",
    description: "المكونات الأساسية ونصائح عملية لكتابة مقترح بحثي احترافي",
    color: "text-green-600"
  },
  {
    icon: Database,
    title: "إدارة المراجع والتحليل الإحصائي",
    description: "أدوات إدارة المراجع وبرامج التحليل الإحصائي الشائعة",
    color: "text-purple-600"
  },
  {
    icon: CheckCircle,
    title: "التدقيق اللغوي والتنسيق",
    description: "معايير التدقيق الأكاديمي وأهم معايير التنسيق",
    color: "text-orange-600"
  }
];

export default function GuideSection() {
  return (
    <section id="guide" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            الدليل الإرشادي الشامل
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            دليل متكامل يحتوي على كل ما تحتاجه لإتمام رسالة الماجستير بنجاح
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl">محتوى الدليل</CardTitle>
            <p className="text-sm opacity-90 mt-2">
              أدلة تفصيلية لكل مرحلة من مراحل البحث العلمي
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {guideItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0">
                      <Icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={() => toast.info("هذه الميزة قيد التطوير")}
              >
                تحميل الدليل الكامل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

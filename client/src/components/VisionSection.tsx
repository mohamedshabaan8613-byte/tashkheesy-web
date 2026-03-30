import { Card } from "@/components/ui/card";
import { Target, Sparkles, Globe, Users } from "lucide-react";

export default function VisionSection() {
  return (
    <section id="vision" className="py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              رؤيتنا
            </h2>
          </div>

          {/* Main Vision Card */}
          <Card className="p-8 md:p-12 shadow-2xl bg-card/95 backdrop-blur">
            <p className="text-xl md:text-2xl leading-relaxed text-center text-foreground font-semibold mb-8">
              أن نكون المنصة الرائدة عربياً في دعم الباحثين وطلاب الدراسات العليا، ونساهم في بناء جيل من الباحثين المتميزين القادرين على إنتاج بحوث علمية عالية الجودة تخدم المجتمع وتساهم في التقدم المعرفي والحضاري.
            </p>

            {/* Vision Pillars */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">التميز الأكاديمي</h3>
                  <p className="text-muted-foreground">
                    تقديم محتوى إرشادي عالي الجودة يواكب أحدث المعايير العالمية
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex-shrink-0">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">الشمولية والابتكار</h3>
                  <p className="text-muted-foreground">
                    تغطية شاملة لجميع مراحل البحث باستخدام أحدث الأدوات
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">خدمة المجتمع</h3>
                  <p className="text-muted-foreground">
                    دعم الباحثين لإنتاج بحوث تخدم المجتمع والتقدم الحضاري
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex-shrink-0">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">الوصول المجاني</h3>
                  <p className="text-muted-foreground">
                    جعل المعرفة متاحة للجميع دون قيود مادية
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

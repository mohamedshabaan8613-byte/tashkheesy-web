import { Card, CardContent } from "@/components/ui/card";
import { Infinity } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              من نحن
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              نحن منصة متخصصة في تقديم الدعم الأكاديمي لطلاب الدراسات العليا. نؤمن بأن البحث العلمي هو أساس التقدم والتطور، ونسعى لتسهيل رحلة الباحثين من خلال تقديم محتوى إرشادي عالي الجودة يغطي جميع جوانب إعداد رسائل الماجستير والدكتوراه.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="text-5xl font-bold text-primary mb-2">6</div>
                <div className="text-muted-foreground">خدمات شاملة</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="text-5xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">محتوى مجاني</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex justify-center mb-2">
                  <Infinity className="w-12 h-12 text-primary" />
                </div>
                <div className="text-muted-foreground">دعم مستمر</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

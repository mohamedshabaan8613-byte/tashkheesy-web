import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "بعد الجلسة عرفنا أن ابننا عنده صعوبات تعلم، مو كسل أو إهمال… طريقة تعامُلنا معه تغيّرت تمامًا.",
    author: "ولي أمر",
    role: "والد طفل 9 سنوات"
  },
  {
    text: "التشخيص ساعدني أقدّم للجامعة وأحصل على وقت إضافي في الامتحانات، وهذا غيّر مستواي الدراسي.",
    author: "طالب جامعي",
    role: "طالب سنة ثالثة"
  },
  {
    text: "الأخصائية كانت محترفة جداً وصبورة مع ابنتي، والتقرير كان واضح ومفصّل بطريقة ساعدتنا نفهم الحالة.",
    author: "ولية أمر",
    role: "أم طفلة 11 سنة"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            آراء عملائنا
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            تجارب حقيقية من عائلات وطلاب استفادوا من خدماتنا
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Quote className="w-8 h-8 text-indigo-200 mb-4" />
                <p className="text-slate-700 mb-4 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-slate-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

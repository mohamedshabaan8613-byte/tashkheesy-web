import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    text: "بعد الجلسة عرفنا أن ابننا عنده صعوبات تعلم، مو كسل أو إهمال… طريقة تعامُلنا معه تغيّرت تمامًا بفضل توجيهات الأخصائية.",
    author: "أبو فيصل",
    role: "والد طفل (9 سنوات)",
    image: "https://i.pravatar.cc/150?u=faisal",
    rating: 5
  },
  {
    text: "التشخيص ساعدني أقدّم للجامعة وأحصل على وقت إضافي في الامتحانات، وهذا غيّر مستواي الدراسي بشكل جذري. شكراً لكم.",
    author: "سارة العتيبي",
    role: "طالبة جامعية",
    image: "https://i.pravatar.cc/150?u=sara",
    rating: 5
  },
  {
    text: "الأخصائية كانت محترفة جداً وصبورة مع ابنتي، والتقرير كان واضح ومفصّل بطريقة ساعدتنا نفهم الحالة ونبدأ خطة العلاج.",
    author: "أم ريما",
    role: "ولية أمر طفلة (11 سنة)",
    image: "https://i.pravatar.cc/150?u=reema",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full">
            تجارب حقيقية
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            ماذا يقول الأهالي والطلاب عنا؟
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            نفتخر بكوننا جزءاً من رحلة نجاح أكثر من 2,400 عائلة في المملكة العربية السعودية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative border-none shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 group">
              <CardContent className="pt-12 pb-8 px-8">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                  <Quote className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-700 mb-8 leading-relaxed text-lg italic relative z-10">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-50">
                    <img src={testimonial.image} alt={testimonial.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 font-medium">
            <span>متوسط تقييمنا</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-900 font-bold mr-1">4.9/5</span>
            <span className="text-sm">(بناءً على 500+ مراجعة)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

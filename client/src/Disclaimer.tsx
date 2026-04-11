/**
 * تشخيصي — صفحة إخلاء المسؤولية
 * Editorial Healthcare Design System
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { ShieldCheck, AlertCircle, CheckCircle2, HeartHandshake, Scale, ArrowLeft } from "lucide-react";

const points = [
  {
    icon: AlertCircle,
    color: "warm",
    title: "ليس تشخيصاً طبياً",
    desc: "نتائج الفحص في تشخيصي هي تقييمات أولية توجيهية فقط. لا تُعدّ تشخيصاً طبياً رسمياً ولا تحلّ محل تقييم المتخصص المرخّص."
  },
  {
    icon: HeartHandshake,
    color: "teal",
    title: "أداة دعم لا بديل",
    desc: "المنصة مصمّمة لمساعدة الأهل والأفراد على فهم احتياجاتهم بشكل أفضل، وتوجيههم نحو الخطوة الصحيحة — وليس الاستغناء عن المتخصص."
  },
  {
    icon: ShieldCheck,
    color: "blue",
    title: "خصوصية البيانات",
    desc: "جميع البيانات المُدخَلة في المنصة تُعامَل بسرية تامة ولا تُشارَك مع أي طرف ثالث دون موافقة صريحة من المستخدم."
  },
  {
    icon: Scale,
    color: "blue",
    title: "حدود المسؤولية",
    desc: "تشخيصي غير مسؤولة عن أي قرارات تُتخذ بناءً على نتائج الفحص دون استشارة متخصص مؤهّل. النتائج مؤشرات وليست أحكاماً قاطعة."
  }
];

const importantNotes = [
  "الفحص لا يُشخّص حالات مثل ADHD أو الديسلكسيا — بل يُشير إلى وجود أنماط تستحق المتابعة",
  "النتائج تعتمد على دقة الإجابات المُدخَلة — كلما كانت الإجابات أدق، كان التقييم أكثر فائدة",
  "الأطفال في مراحل النمو قد تتغير احتياجاتهم — يُنصح بإعادة الفحص كل ٦ أشهر",
  "في حالات القلق الشديد، يُرجى التواصل مع متخصص فور الانتهاء من الفحص",
  "المنصة لا تُقدّم خدمات علاجية أو تدخّلية — دورها التوجيه والتوعية"
];

export default function Disclaimer() {
  useSEO({
    title: "إخلاء المسؤولية | تشخيصي",
    description: "معلومات مهمة حول طبيعة خدمات تشخيصي ونطاقها وحدود المسؤولية.",
    canonical: "/disclaimer",
    noIndex: true,
  });

  return (
    <div className="ts-page">
      <Navbar />
      <main className="flex-1">
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#FFFBEB] text-[#F59E0B] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#FDE68A]">
                <AlertCircle className="w-4 h-4" />
                <span>معلومات قانونية مهمة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5 leading-tight">
                إخلاء <span className="tashkhisi-gradient-text">المسؤولية</span>
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
                نؤمن بالشفافية الكاملة. هذه الصفحة توضّح بدقة ما تُقدّمه المنصة وما لا تُقدّمه.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">ما يجب أن تعرفه</span>
              <h2 className="text-3xl font-bold text-[#0F172A]">حدود الخدمة بوضوح</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {points.map((p, i) => (
                <div key={i} className="ts-card rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    p.color === "blue" ? "bg-[#EFF6FF] text-[#2563EB]" :
                    p.color === "teal" ? "bg-[#F0FDFA] text-[#14B8A6]" :
                    "bg-[#FFFBEB] text-[#F59E0B]"
                  }`}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#F8FAFC]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="section-label block mb-3">تفاصيل إضافية</span>
                <h2 className="text-3xl font-bold text-[#0F172A]">ملاحظات مهمة للمستخدمين</h2>
              </div>
              <div className="ts-card rounded-2xl p-8">
                <div className="space-y-4">
                  {importantNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-[#F1F5F9] last:border-0 last:pb-0">
                      <div className="w-6 h-6 bg-[#EFF6FF] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                      </div>
                      <p className="text-sm text-[#475569] leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A]">النص القانوني الكامل</h3>
                </div>
                <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
                  <p>تُقدّم منصة تشخيصي خدمات الفحص والتقييم الأولي لأغراض توعوية وتوجيهية فقط. لا تُعدّ هذه الخدمات بديلاً عن الاستشارة الطبية أو النفسية أو التربوية المتخصصة.</p>
                  <p>باستخدام المنصة، يُقرّ المستخدم بأنه يفهم طبيعة الخدمة وحدودها، وأنه لن يعتمد على نتائج الفحص وحدها في اتخاذ قرارات طبية أو تعليمية مصيرية دون الرجوع إلى متخصص مؤهّل.</p>
                  <p>تشخيصي غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة قد تنجم عن سوء تفسير النتائج أو الاعتماد عليها بشكل منفرد.</p>
                  <p className="text-xs text-[#94A3B8]">آخر تحديث: مارس 2026 — جميع الحقوق محفوظة لمنصة تشخيصي</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F8FAFC]">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">هل لديك أسئلة؟</h2>
              <p className="text-[#475569] mb-8">فريقنا متاح للإجابة على أي استفسار حول طبيعة الخدمة أو كيفية الاستخدام الصحيح.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact">
                  <button className="tashkhisi-btn-primary flex items-center gap-2">
                    <span>تواصل معنا</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/faq">
                  <button className="tashkhisi-btn-outline">
                    الأسئلة الشائعة
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

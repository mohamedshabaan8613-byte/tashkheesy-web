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
    title: "المنصة تقدم تقييمًا أوليًا غير رسمي",
    desc: "نتائج الفحص في تشخيصي هي مؤشرات أولية توجيهية فقط، ولا تُعد تشخيصًا طبيًا أو نفسيًا أو تربويًا رسميًا. كما لا تُغني عن مراجعة مختص مؤهل أو جهة مختصة عند الحاجة.",
  },
  {
    icon: HeartHandshake,
    color: "teal",
    title: "أداة دعم وتوجيه",
    desc: "صُممت المنصة لمساعدة الأسر والأفراد على فهم بعض الأنماط والمؤشرات المرتبطة بصعوبات التعلم أو القراءة أو فرط الحركة وتشتت الانتباه، وتوجيههم إلى الخطوة التالية المناسبة. ولا تُعد المنصة بديلًا عن التقييم المتخصص أو المتابعة المهنية.",
  },
  {
    icon: ShieldCheck,
    color: "blue",
    title: "خصوصية البيانات",
    desc: "نتعامل مع البيانات المدخلة بعناية وسرية، ولا نبيع البيانات الشخصية. وقد تتم مشاركة الحد الأدنى اللازم من البيانات مع مزودي الخدمة أو المختص المرتبط بالحجز، وذلك فقط لغرض تقديم الخدمة ووفق سياسة الخصوصية.",
  },
  {
    icon: Scale,
    color: "blue",
    title: "حدود المسؤولية",
    desc: "تعتمد نتائج الفحص على المعلومات والإجابات التي يقدمها المستخدم. لذلك، لا تتحمل تشخيصي المسؤولية عن القرارات التي تُتخذ بالاعتماد على نتائج الفحص وحدها دون مراجعة مختص مؤهل، وذلك في حدود ما تسمح به الأنظمة المعمول بها.",
  }
];

const importantNotes = [
  "الفحص لا يقدّم تشخيصًا رسميًا لحالات مثل فرط الحركة وتشتت الانتباه أو عسر القراءة، بل يوضح تقييمًا مسحيًا أوليًا ومؤشرات وأنماطًا قد تستحق المتابعة مع مختص.",
  "دقة النتيجة تعتمد على دقة وصحة الإجابات المدخلة من المستخدم.",
  "احتياجات الأطفال قد تتغير مع مراحل النمو، ويمكن إعادة الفحص عند ملاحظة تغيرات واضحة أو بناءً على توجيه المختص.",
  "في حال وجود قلق شديد أو تأثير واضح على التعلم أو السلوك اليومي، يُنصح بالتواصل مع مختص مؤهل أو جهة مختصة.",
  "المنصة لا تقدم خدمات علاجية أو دوائية أو تدخلات سريرية، ويقتصر دورها على الفحص الأولي والتوجيه والتوعية"
];

const legalTextParagraphs = [
  "تقدم منصة تشخيصي خدمات الفحص الأولي والمؤشرات التوجيهية لأغراض توعوية وتعليمية وإرشادية فقط. ولا تُعد هذه الخدمات بديلًا عن الاستشارة الطبية أو النفسية أو التربوية المتخصصة.",
  "باستخدام المنصة، يقر المستخدم بأنه يفهم طبيعة الخدمة وحدودها، وأن نتائج الفحص تعتمد على البيانات والإجابات التي يقدمها، وأنه لن يعتمد على نتائج الفحص وحدها لاتخاذ قرارات طبية أو نفسية أو تعليمية جوهرية دون الرجوع إلى مختص مؤهل أو جهة مختصة.",
  "كما يقر المستخدم، عند إدخال بيانات طفل أو قاصر، بأنه ولي الأمر أو لديه الصلاحية النظامية لإدخال تلك البيانات، وأنه يوافق على استخدامها لغرض تقديم الفحص الأولي أو الخدمة المطلوبة وفق سياسة الخصوصية.",
  "لا تتحمل تشخيصي المسؤولية عن سوء تفسير النتائج أو الاعتماد عليها بشكل منفرد، وذلك في حدود ما تسمح به الأنظمة المعمول بها في المملكة العربية السعودية."
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
              <div className="inline-flex items-center gap-2 bg-[#FFFBEB] text-[#F4C46A] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#FDE68A]">
                <AlertCircle className="w-4 h-4" />
                <span>معلومات قانونية مهمة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#243B53] mb-5 leading-tight">
                إخلاء <span className="tashkhisi-gradient-text">المسؤولية</span>
              </h1>
              <p className="text-lg text-[#4A6278] leading-relaxed max-w-2xl mx-auto">
                نؤمن في تشخيصي بالشفافية الكاملة. توضّح هذه الصفحة طبيعة ما تقدمه المنصة، وحدود استخدامها، وما يجب على المستخدم معرفته قبل الاعتماد على نتائج الفحص أو طلب الحجز.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">ما يجب أن تعرفه</span>
              <h2 className="text-3xl font-bold text-[#243B53]">ما يجب أن تعرفه</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {points.map((p, i) => (
                <div key={i} className="ts-card rounded-2xl p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    p.color === "blue" ? "bg-[#DFF3F1] text-[#1E4E8C]" :
                    p.color === "teal" ? "bg-[#DFF3F1] text-[#2BBDB6]" :
                    "bg-[#FFFBEB] text-[#F4C46A]"
                  }`}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#243B53] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#4A6278] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#F4EFE8]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="section-label block mb-3">تفاصيل إضافية</span>
                <h2 className="text-3xl font-bold text-[#243B53]">ملاحظات مهمة للمستخدمين</h2>
              </div>
              <div className="ts-card rounded-2xl p-8">
                <div className="space-y-4">
                  {importantNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-[#DFF3F1] last:border-0 last:pb-0">
                      <div className="w-6 h-6 bg-[#DFF3F1] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1E4E8C]" />
                      </div>
                      <p className="text-sm text-[#4A6278] leading-relaxed">{note}</p>
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
                  <div className="w-10 h-10 bg-[#F4C46A]/10 rounded-xl flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#F4C46A]" />
                  </div>
                  <h3 className="font-bold text-[#243B53]">النص القانوني الكامل</h3>
                </div>
                <div className="space-y-4 text-sm text-[#4A6278] leading-relaxed">
                  {legalTextParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <p className="text-xs text-[#94A3B8]">آخر تحديث: 4/4/2026 — جميع الحقوق محفوظة لمنصة تشخيصي.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#F4EFE8]">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[#243B53] mb-4">هل لديك أسئلة؟</h2>
              <p className="text-[#4A6278] mb-8">فريقنا متاح للإجابة على أي استفسار حول طبيعة الخدمة أو كيفية الاستخدام الصحيح.</p>
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

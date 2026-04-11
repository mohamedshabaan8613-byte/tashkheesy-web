/**
 * تشخيصي — مركز المعرفة
 * Editorial Healthcare Design System
 */
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Video, HelpCircle } from "lucide-react";

const articles = [
  {
    icon: BookOpen,
    category: "مقالات توعوية",
    title: "ما هي الديسلكسيا (صعوبات القراءة)؟",
    description: "دليل شامل لفهم صعوبات القراءة وأعراضها وكيفية التعامل معها",
    readTime: "5 دقائق قراءة"
  },
  {
    icon: FileText,
    category: "أدلة إرشادية",
    title: "كيف تساعد طفلك في المنزل؟",
    description: "نصائح عملية للأهل لدعم الأطفال الذين يعانون من صعوبات التعلم",
    readTime: "7 دقائق قراءة"
  },
  {
    icon: Video,
    category: "فيديوهات تعليمية",
    title: "علامات صعوبات القراءة المبكرة",
    description: "تعرّف على العلامات التحذيرية التي يجب الانتباه لها",
    readTime: "10 دقائق مشاهدة"
  },
  {
    icon: HelpCircle,
    category: "أسئلة شائعة",
    title: "هل صعوبات التعلم تعني ضعف الذكاء؟",
    description: "إجابات على أكثر الأسئلة شيوعاً حول صعوبات التعلم",
    readTime: "4 دقائق قراءة"
  },
  {
    icon: BookOpen,
    category: "مقالات توعوية",
    title: "صعوبات التعلم لدى طلاب الجامعة",
    description: "كيف تؤثر صعوبات القراءة على الأداء الأكاديمي الجامعي",
    readTime: "6 دقائق قراءة"
  },
  {
    icon: FileText,
    category: "أدلة إرشادية",
    title: "التسهيلات الأكاديمية المتاحة",
    description: "دليل شامل للتسهيلات التي يمكن طلبها في المدارس والجامعات",
    readTime: "8 دقائق قراءة"
  }
];

const faqs = [
  {
    question: "في أي عمر يمكن تشخيص صعوبات القراءة؟",
    answer: "يمكن البدء بالتقييم من عمر 5-6 سنوات، لكن التشخيص الدقيق عادة يكون بعد عمر 7 سنوات عندما يكون الطفل قد بدأ تعلم القراءة بشكل رسمي."
  },
  {
    question: "هل صعوبات القراءة قابلة للعلاج؟",
    answer: "نعم، مع التدخل المبكر والمناسب، يمكن للأطفال والطلاب تحسين مهاراتهم بشكل كبير. التشخيص المبكر والدعم المستمر هما المفتاح."
  },
  {
    question: "كم تستغرق جلسة التشخيص؟",
    answer: "عادة تستغرق الجلسة من 60 إلى 90 دقيقة للأطفال، و75 دقيقة لطلاب الجامعة، حسب نوع التقييم والحالة."
  },
  {
    question: "هل التقرير معتمد رسمياً؟",
    answer: "نعم، جميع تقاريرنا صادرة من أخصائيين معتمدين ويمكن تقديمها للمدارس والجامعات والجهات الرسمية."
  }
];

export default function Knowledge() {
  useSEO({
    title: "مركز المعرفة - صعوبات التعلم والديسلكسيا",
    description: "مقالات وأدلة إرشادية وفيديوهات تعليمية عن صعوبات التعلم والقراءة (الديسلكسيا). دليل شامل للأهل والمعلمين.",
    keywords: "مقالات صعوبات تعلم, ديسلكسيا ما هي, علامات صعوبات القراءة, كيف أساعد طفلي, مركز معرفة تشخيصي",
    canonical: "/knowledge",
  });
  return (
    <div className="ts-page">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="ts-page-header">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-[#EFF6FF] text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#BFDBFE]">
                <BookOpen className="w-4 h-4" />
                <span>مصادر توعوية معتمدة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-5 leading-tight">
                مركز <span className="tashkhisi-gradient-text">المعرفة</span>
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
                مصادر توعوية وإرشادية لفهم صعوبات التعلم والقراءة — للأهل والمعلمين والمهتمين
              </p>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="text-center mb-14">
              <span className="section-label block mb-3">مقالات وموارد</span>
              <h2 className="text-3xl font-bold text-[#0F172A]">مواد تعليمية مختارة</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => {
                const Icon = article.icon;
                return (
                  <div key={index} className="ts-card rounded-2xl p-6 cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center group-hover:bg-[#2563EB] transition-colors">
                        <Icon className="w-5 h-5 text-[#2563EB] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs text-[#2563EB] font-semibold bg-[#EFF6FF] px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#475569] mb-4 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                      <span>⏱</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="section-label block mb-3">أسئلة متكررة</span>
                <h2 className="text-3xl font-bold text-[#0F172A]">أسئلة شائعة عن صعوبات التعلم</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="ts-card rounded-2xl p-6">
                    <h3 className="font-bold text-[#0F172A] mb-3 flex items-start gap-2">
                      <span className="w-6 h-6 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">{index + 1}</span>
                      {faq.question}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">هل لديك أسئلة أخرى؟</h2>
              <p className="text-[#475569] mb-8">فريقنا جاهز للإجابة على جميع استفساراتك حول صعوبات التعلم والتشخيص</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/contact" className="tashkhisi-btn-primary">تواصل معنا</a>
                <a href="/faq" className="tashkhisi-btn-outline">الأسئلة الشائعة</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

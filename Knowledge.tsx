import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-indigo-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                مركز المعرفة
              </h1>
              <p className="text-lg text-slate-600">
                مصادر توعوية وإرشادية لفهم صعوبات التعلم والقراءة
              </p>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              مقالات وموارد تعليمية
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => {
                const Icon = article.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-xs text-indigo-600 font-medium">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {article.description}
                      </p>
                      <div className="text-xs text-slate-500">
                        {article.readTime}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-slate-50">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                أسئلة شائعة
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 max-w-3xl mx-auto">
              <CardContent className="pt-8 text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  هل لديك أسئلة أخرى؟
                </h3>
                <p className="text-slate-700 mb-6">
                  فريقنا جاهز للإجابة على جميع استفساراتك حول صعوبات التعلم والتشخيص
                </p>
                <a
                  href="mailto:info@tashkhisi.com"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
                >
                  تواصل معنا
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AIInsights: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          مركز التميز والذكاء الاصطناعي في تشخيصي
        </h1>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-blue-700">مقدمة: أهمية الذكاء الاصطناعي في تشخيصي</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              في منصة تشخيصي، نؤمن بأن دمج أحدث تقنيات الذكاء الاصطناعي هو مفتاح الارتقاء بجودة خدماتنا وتقديم رعاية أفضل لأطفالنا. يمثل هذا المركز نقطة الانطلاق نحو مستقبل يتم فيه تسخير قوة الذكاء الاصطناعي لتقديم تحليلات دقيقة، شروحات مخصصة، وتوصيات فعالة لدعم الأهل والأخصائيين في رحلة النمو والتطور.
            </p>
            <p>
              لقد قمنا بتطوير استراتيجية شاملة لدمج الذكاء الاصطناعي، بدءًا من تحليل البيانات المعقدة وصولاً إلى توليد تقارير سهلة الفهم، مع التركيز على الخصوصية والأمان.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-blue-700">الميزة التنافسية: شروحات الذكاء الاصطناعي المخصصة</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              تتمثل ميزتنا التنافسية الأساسية في قدرتنا على تقديم شروحات مفصلة ومخصصة لنتائج الفحوصات باستخدام الذكاء الاصطناعي. بدلاً من مجرد عرض الأرقام والنسب المئوية، يقوم نظامنا بتحليل استجابات الطفل في الفحص، ومقارنتها بالمعايير التنموية، ثم توليد شرح شامل يوضح دلالات النتائج، ويقدم رؤى عميقة حول المجالات التي قد تحتاج إلى اهتمام.
            </p>
            <p className="mb-4">
              هذه الشروحات مصممة لتكون سهلة الفهم للأهل، وتوفر لهم خارطة طريق واضحة للخطوات التالية، سواء كانت متابعة بسيطة أو استشارة أخصائي. كما أنها تدعم الأخصائيين بملخصات سريعة ونقاط رئيسية تساعدهم في تقييم الحالة بشكل أسرع وأكثر فعالية.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">كيف تعمل؟</h3>
            <ul className="list-disc pr-5 space-y-2 mb-4">
              <li><b>تحليل البيانات:</b> يقوم الذكاء الاصطناعي بتحليل إجابات الفحص والنتائج الكمية لكل مجال.</li>
              <li><b>توليد الشرح:</b> بناءً على هذا التحليل، يتم توليد نص شرحي مفصل يربط بين الإجابات والنتائج، ويقدم تفسيرًا واضحًا لمستوى الخطر.</li>
              <li><b>التخصيص:</b> يأخذ الشرح في الاعتبار عمر الطفل وجنسه ونوع الفحص لتقديم معلومات أكثر دقة وملاءمة.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-blue-700">الخطة المستقبلية والتطوير المستمر</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 leading-relaxed">
            <p className="mb-4">
              نحن ملتزمون بالتطوير المستمر لميزات الذكاء الاصطناعي في تشخيصي. تشمل خططنا المستقبلية:
            </p>
            <ul className="list-disc pr-5 space-y-2 mb-4">
              <li><b>توسيع نطاق الشروحات:</b> لتشمل توصيات سلوكية محددة وأنشطة منزلية لدعم نمو الطفل.</li>
              <li><b>التنبؤ المبكر:</b> استخدام نماذج الذكاء الاصطناعي للتنبؤ بالمخاطر المحتملة بناءً على أنماط البيانات.</li>
              <li><b>التكامل مع الأخصائيين:</b> توفير أدوات ذكاء اصطناعي لمساعدة الأخصائيين في إعداد خطط علاجية مخصصة.</li>
              <li><b>التعلم المستمر:</b> تحسين نماذج الذكاء الاصطناعي باستمرار من خلال التغذية الراجعة والبيانات الجديدة (مع الحفاظ على الخصوصية).</li>
            </ul>
            <p>
              ندعوكم لاستكشاف هذه الميزات الجديدة ومشاركتنا آراءكم للمساهمة في بناء مستقبل أفضل لأطفالنا.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AIInsights;

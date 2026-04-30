/*
 * تشخيصي — صفحة الشروط والأحكام
 * Editorial Healthcare · Arabic-first · Human-readable · Clear Terms
 * Comprehensive yet accessible terms for platform usage
 * Palette: #F4EFE8 bg · #243B53 text · #1E4E8C accent · #2BBDB6 secondary
 */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";

// ─── بيانات الأقسام ───────────────────────────────────────────────────
const sections = [
  {
    id: "definitions",
    icon: FileText,
    title: "التعريفات",
    subtitle: "معاني الكلمات والعبارات الأساسية",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "تشخيصي أو المنصة",
        text: "الموقع الإلكتروني والخدمات الرقمية المرتبطة به.",
      },
      {
        label: "المستخدم",
        text: "كل شخص يستخدم الموقع أو يتصفح محتواه أو يدخل بيانات أو يطلب خدمة من خلاله.",
      },
      {
        label: "ولي الأمر",
        text: "الشخص الذي يملك الصلاحية النظامية لإدخال بيانات طفل أو قاصر أو طلب خدمة تتعلق به.",
      },
      {
        label: "الفحص الأولي",
        text: "مجموعة أسئلة أو نماذج مسحية تهدف إلى إظهار مؤشرات أولية توجيهية مرتبطة بصعوبات التعلم أو القراءة أو الانتباه والتركيز.",
      },
      {
        label: "النتيجة التوجيهية",
        text: "مخرجات أولية مبنية على إجابات المستخدم، ولا تعد تشخيصًا رسميًا.",
      },
      {
        label: "الخدمة",
        text: "أي خدمة تقدمها المنصة، بما في ذلك الفحص الأولي، عرض النتائج، الحجز، التواصل، المحتوى التوعوي، أو أي خدمات مستقبلية ذات صلة.",
      },
      {
        label: "المختص",
        text: "الشخص أو الجهة التي قد يتم ربط المستخدم بها عند طلب جلسة مراجعة نتيجة الفحص أو خدمة إرشادية، وفق ما يتوفر في المنصة.",
      },
    ],
  },
  {
    id: "acceptance",
    icon: CheckCircle,
    title: "قبول الشروط",
    subtitle: "الموافقة على الشروط والسياسات",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "الموافقة الصريحة",
        text: "باستخدامك للمنصة، فإنك توافق على هذه الشروط والأحكام، وسياسة الخصوصية، وإخلاء المسؤولية، وأي سياسات أخرى منشورة على الموقع.",
      },
      {
        label: "عدم الموافقة",
        text: "إذا كنت لا توافق على هذه الشروط، فيجب عليك عدم استخدام المنصة أو إدخال أي بيانات من خلالها.",
      },
      {
        label: "استخدام نيابة عن طفل",
        text: "وفي حال استخدام المنصة نيابة عن طفل أو قاصر، فإنك تقر بأنك ولي الأمر أو لديك الصلاحية النظامية اللازمة لإدخال بياناته وطلب الخدمة المتعلقة به.",
      },
    ],
  },
  {
    id: "nature-services",
    icon: AlertCircle,
    title: "طبيعة الخدمات",
    subtitle: "ما تقدمه المنصة وخدماتها",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "تعريف المنصة",
        text: "تشخيصي منصة إلكترونية سعودية تقدم خدمات الفحص الأولي والمؤشرات التوجيهية المرتبطة بصعوبات التعلم، صعوبات القراءة، والانتباه والتركيز، وتساعد الأسر والأفراد على فهم النتائج الأولية وتنظيم خطوة التحدث مع مختص عند الحاجة.",
      },
      {
        label: "الخدمات المشمولة",
        text: "تشمل خدمات المنصة، على سبيل المثال لا الحصر: إتاحة أدوات فحص أولي أو نماذج مسحية، عرض مؤشرات أو نتائج توجيهية بناءً على إجابات المستخدم، تقديم محتوى توعوي أو إرشادي، تمكين المستخدم من طلب حجز أو التواصل بشأن جلسة مراجعة نتيجة الفحص أو خدمة إرشادية، وإرسال تأكيدات أو تذكيرات متعلقة بالخدمة عند توفرها.",
      },
    ],
  },
  {
    id: "service-limits",
    icon: AlertCircle,
    title: "حدود الخدمة",
    subtitle: "ما لا تقدمه المنصة",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "طبيعة تعليمية وإرشادية",
        text: "يقر المستخدم ويفهم أن خدمات تشخيصي ذات طبيعة توعوية وتعليمية وإرشادية، وأنها لا تقدم تشخيصًا طبيًا أو نفسيًا أو تربويًا رسميًا.",
      },
      {
        label: "عدم الاستغناء عن المختصين",
        text: "لا تُعد نتائج الفحص الصادرة من المنصة حكمًا نهائيًا على حالة المستخدم أو الطفل، ولا تُغني عن مراجعة مختص مؤهل أو جهة مختصة عند الحاجة.",
      },
      {
        label: "عدم تقديم خدمات طبية",
        text: "كما لا تقدم المنصة خدمات علاجية أو دوائية أو تدخلات سريرية، ولا ينبغي الاعتماد على نتائج الفحص وحدها لاتخاذ قرارات طبية أو نفسية أو تعليمية جوهرية.",
      },
    ],
  },
  {
    id: "eligibility",
    icon: Shield,
    title: "الأهلية وبيانات الأطفال",
    subtitle: "متطلبات الاستخدام وحماية القصّر",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "أهلية المستخدم",
        text: "يجب أن يكون المستخدم مؤهلًا نظاميًا لاستخدام المنصة، أو لديه موافقة أو صفة نظامية تخوله إدخال البيانات أو طلب الخدمة.",
      },
      {
        label: "إقرار ولي الأمر",
        text: "عند إدخال بيانات طفل أو قاصر، يقر المستخدم بأنه ولي الأمر أو لديه الصلاحية النظامية لإدخال تلك البيانات، وأنه يوافق على استخدامها لغرض تقديم الفحص الأولي أو الخدمة المطلوبة وفق سياسة الخصوصية.",
      },
      {
        label: "حظر إدخال بيانات الغير",
        text: "لا يجوز إدخال بيانات طفل أو شخص آخر دون موافقة صحيحة أو صفة نظامية تخول ذلك.",
      },
    ],
  },
  {
    id: "user-obligations",
    icon: CheckCircle,
    title: "التزامات المستخدم",
    subtitle: "ما يجب على المستخدم الالتزام به",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "دقة البيانات",
        text: "تقديم بيانات صحيحة ودقيقة وحديثة عند استخدام المنصة.",
      },
      {
        label: "عدم إدخال بيانات الغير",
        text: "عدم إدخال بيانات تخص شخصًا آخر دون موافقة أو صفة نظامية.",
      },
      {
        label: "الاستخدام المشروع",
        text: "عدم استخدام المنصة لأي غرض غير مشروع أو مخالف للأنظمة المعمول بها في المملكة العربية السعودية.",
      },
      {
        label: "حماية الموقع",
        text: "عدم محاولة تعطيل الموقع أو إساءة استخدامه أو الوصول غير المصرح به إلى أي جزء منه.",
      },
      {
        label: "احترام الملكية الفكرية",
        text: "عدم نسخ أو إعادة استخدام محتوى المنصة أو أسئلتها أو نتائجها لأغراض تجارية دون موافقة مكتوبة.",
      },
      {
        label: "فهم الطبيعة الأولية",
        text: "فهم أن نتائج الفحص أولية وتوجيهية ولا تغني عن مراجعة مختص مؤهل أو جهة مختصة عند الحاجة.",
      },
      {
        label: "مراجعة السياسات",
        text: "مراجعة السياسات المنشورة على الموقع قبل إتمام أي حجز أو طلب خدمة.",
      },
    ],
  },
  {
    id: "booking-paid-services",
    icon: AlertCircle,
    title: "الحجز والخدمات المدفوعة",
    subtitle: "شروط الحجز والدفع",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "مراجعة التفاصيل",
        text: "عند توفر خدمة الحجز أو الدفع الإلكتروني، يجب على المستخدم مراجعة تفاصيل الخدمة قبل تأكيد الطلب، بما في ذلك: نوع الخدمة المطلوبة، مدة الخدمة أو الجلسة إن وجدت، السعر وأي رسوم أو ضرائب ظاهرة، طريقة الدفع، الموعد المختار أو آلية تحديد الموعد، وسياسة الإلغاء والاسترداد.",
      },
      {
        label: "وضوح الأسعار",
        text: "تعرض المنصة، عند توفر الخدمات المدفوعة، الأسعار بوضوح قبل إتمام الطلب. وقد تختلف الأسعار بحسب نوع الخدمة أو مدتها أو طريقة تقديمها.",
      },
      {
        label: "معالجة الدفع",
        text: "يقر المستخدم بأن أي عملية دفع تتم عبر مزود دفع خارجي أو وسيلة دفع معتمدة، وأن المنصة لا تخزن بيانات البطاقات البنكية الكاملة داخل أنظمتها.",
      },
      {
        label: "حق الرفض أو الإعادة",
        text: "يحق للمنصة قبول أو رفض أو إعادة جدولة أي طلب حجز في حال عدم توفر المواعيد، أو وجود خطأ واضح في البيانات، أو تعذر تقديم الخدمة، أو عدم اكتمال عملية الدفع، أو لأي سبب مشروع آخر.",
      },
    ],
  },
  {
    id: "cancellation-refund",
    icon: AlertCircle,
    title: "الإلغاء والاسترداد",
    subtitle: "سياسة الإلغاء وإعادة الأموال",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "الخضوع لسياسة منفصلة",
        text: "تخضع طلبات الإلغاء، إعادة الجدولة، والاسترداد لسياسة الإلغاء والاسترداد المنشورة على الموقع.",
      },
      {
        label: "قراءة السياسة قبل الحجز",
        text: "يجب على المستخدم مراجعة سياسة الإلغاء والاسترداد قبل تأكيد أي حجز أو دفع، حيث توضح تلك السياسة المدد الزمنية، الحالات المقبولة للاسترداد، حالات عدم الحضور، وطريقة تقديم الطلب.",
      },
      {
        label: "عدم الإنقاص من الحقوق",
        text: "ولا تنتقص هذه الشروط من أي حقوق مقررة للمستهلك بموجب الأنظمة المعمول بها في المملكة العربية السعودية.",
      },
    ],
  },
  {
    id: "content-results",
    icon: FileText,
    title: "المحتوى والنتائج",
    subtitle: "طبيعة المحتوى والنتائج المقدمة",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "المحتوى التوعوي",
        text: "قد تحتوي المنصة على محتوى توعوي أو إرشادي يتعلق بصعوبات التعلم أو القراءة أو الانتباه والتركيز. هذا المحتوى مقدم لأغراض عامة، ولا يعد نصيحة طبية أو نفسية أو تربوية فردية.",
      },
      {
        label: "دقة النتائج",
        text: "كما أن نتائج الفحص تعتمد على الإجابات التي يقدمها المستخدم، وقد تتأثر بدقة المعلومات المدخلة أو ظروف المستخدم وقت الإجابة.",
      },
      {
        label: "الأدوات الرقمية",
        text: "وقد تستخدم المنصة أدوات رقمية أو تقنيات مساعدة لتحليل الإجابات أو تنظيم عرض النتائج أو تحسين تجربة المستخدم. وتظل أي مخرجات يتم عرضها من خلال هذه الأدوات مؤشرات أولية وتوجيهية، ولا تعد تشخيصًا رسميًا أو قرارًا مهنيًا نهائيًا.",
      },
    ],
  },
  {
    id: "privacy-data",
    icon: Shield,
    title: "الخصوصية وحماية البيانات",
    subtitle: "معالجة بيانات المستخدم",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "التعامل وفق السياسة",
        text: "تتعامل المنصة مع البيانات الشخصية وفق سياسة الخصوصية المنشورة على الموقع.",
      },
      {
        label: "الموافقة على المعالجة",
        text: "باستخدامك للمنصة، فإنك توافق على جمع واستخدام ومعالجة بياناتك وفق سياسة الخصوصية، وبما يتوافق مع الأنظمة المعمول بها في المملكة العربية السعودية.",
      },
      {
        label: "مزيد من التفاصيل",
        text: "لمزيد من التفاصيل، يرجى مراجعة صفحة سياسة الخصوصية.",
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: FileText,
    title: "الملكية الفكرية",
    subtitle: "حقوق المنصة والمحتوى",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "ملكية المحتوى",
        text: "جميع الحقوق المتعلقة بالموقع ومحتواه، بما في ذلك النصوص، التصاميم، الشعارات، الواجهات، الأسئلة، نماذج الفحص، طريقة عرض النتائج، الرسوم، والأكواد، مملوكة لتشخيصي أو مرخصة لها، ما لم يذكر خلاف ذلك.",
      },
      {
        label: "حظر إعادة الاستخدام التجاري",
        text: "لا يجوز نسخ أو إعادة نشر أو تعديل أو توزيع أو استخدام أي جزء من محتوى المنصة لأغراض تجارية أو عامة دون موافقة مكتوبة مسبقة من تشخيصي.",
      },
    ],
  },
  {
    id: "external-links",
    icon: AlertCircle,
    title: "الروابط والخدمات الخارجية",
    subtitle: "المسؤولية عن الأطراف الثالثة",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "وجود روابط خارجية",
        text: "قد تحتوي المنصة على روابط أو تكاملات مع خدمات خارجية مثل مزودي الدفع، البريد الإلكتروني، الرسائل، أدوات التحليل، أو مواقع أخرى.",
      },
      {
        label: "عدم تحمل المسؤولية",
        text: "لا تتحمل تشخيصي مسؤولية محتوى أو سياسات أو ممارسات تلك الأطراف الخارجية، وينصح المستخدم بمراجعة شروطها وسياسات الخصوصية الخاصة بها قبل استخدامها.",
      },
    ],
  },
  {
    id: "liability-suspension",
    icon: AlertCircle,
    title: "حدود المسؤولية",
    subtitle: "التزامات وحدود المنصة",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "الجهد المعقول",
        text: "تبذل تشخيصي عناية معقولة لتقديم معلومات واضحة وتجربة استخدام مناسبة، إلا أنها لا تضمن أن تكون نتائج الفحص مناسبة لكل حالة فردية أو كافية لاتخاذ قرارات جوهرية دون مراجعة مختص مؤهل.",
      },
      {
        label: "عدم تحمل المسؤولية عن القرارات",
        text: "لا تتحمل تشخيصي المسؤولية عن القرارات التي يتخذها المستخدم اعتمادًا على نتائج الفحص أو المحتوى التوعوي وحده دون الرجوع إلى مختص مؤهل أو جهة مختصة، وذلك في حدود ما تسمح به الأنظمة المعمول بها.",
      },
      {
        label: "حق تعليق الخدمة",
        text: "ويحق للمنصة تعليق أو تقييد أو إنهاء وصول أي مستخدم إلى الخدمات إذا تبين وجود استخدام مخالف لهذه الشروط، أو إساءة استخدام للمنصة، أو إدخال بيانات مضللة، أو محاولة الوصول غير المصرح به، أو أي سلوك قد يضر بالمنصة أو المستخدمين أو يخالف الأنظمة.",
      },
    ],
  },
  {
    id: "complaints-updates",
    icon: CheckCircle,
    title: "الشكاوى والتحديثات",
    subtitle: "معالجة الشكاوى وتحديث الشروط",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "تقديم الشكاوى",
        text: "يمكن للمستخدم تقديم شكوى أو ملاحظة أو طلب دعم من خلال قنوات التواصل المنشورة على الموقع أو من خلال صفحة الشكاوى والمقترحات عند توفرها.",
      },
      {
        label: "معالجة الشكاوى",
        text: "تسعى المنصة إلى التعامل مع الشكاوى بجدية ومهنية خلال المدد الموضحة في سياسة الشكاوى والمقترحات.",
      },
      {
        label: "تحديث الشروط",
        text: "يحق لتشخيصي تحديث هذه الشروط والأحكام من وقت لآخر بما يتوافق مع تطور الخدمة أو المتطلبات النظامية. سيتم نشر النسخة المحدثة على هذه الصفحة مع تاريخ آخر تحديث. ويعد استمرار استخدام المنصة بعد نشر التحديثات موافقة على الشروط المحدثة.",
      },
      {
        label: "القانون الواجب التطبيق",
        text: "تخضع هذه الشروط والأحكام للأنظمة المعمول بها في المملكة العربية السعودية. وفي حال نشوء أي نزاع يتعلق باستخدام المنصة أو الخدمات، يتم التعامل معه وفق القنوات النظامية المختصة في المملكة العربية السعودية.",
      },
    ],
  },
];

// ─── مكوّن قسم واحد ───────────────────────────────────────────────────
function TermsSection({ section }: { section: (typeof sections)[0] }) {
  const Icon = section.icon;
  return (
    <div
      id={`section-${section.id}`}
      className="rounded-3xl p-8 lg:p-10"
      style={{
        background: "white",
        border: `1px solid ${section.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: section.bg, border: `1px solid ${section.border}` }}
        >
          <Icon size={24} style={{ color: section.color }} />
        </div>
        <div>
          <h2
            className="text-xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
          >
            {section.title}
          </h2>
          <p
            className="text-sm text-slate-500"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {section.subtitle}
          </p>
        </div>
      </div>
      <div className="space-y-5">
        {section.items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle size={18} style={{ color: section.color }} />
            </div>
            <div>
              <p
                className="font-semibold text-slate-900 text-sm mb-1"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {item.label}
              </p>
              <p
                className="text-slate-600 text-sm leading-relaxed"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────
export default function Terms() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#F4EFE8", direction: "rtl" }}
    >
      <Navbar />

      {/* Hero */}
      <section
        className="pt-28 pb-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #DFF3F1 0%, #DFF3F1 50%, #F4EFE8 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #2BBDB640, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/">
              <span
                className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                الرئيسية
              </span>
            </Link>
            <ArrowLeft size={14} className="text-slate-400" />
            <span
              className="text-sm text-teal-600 font-medium"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              الشروط والأحكام
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2BBDB6, #1E4E8C)" }}
            >
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1
                className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                الشروط والأحكام
              </h1>
              <p
                className="text-lg text-slate-600 leading-relaxed max-w-2xl"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                مرحبًا بك في منصة تشخيصي. باستخدامك لهذا الموقع أو أي من خدماته، فإنك تقر بأنك قرأت هذه الشروط والأحكام وفهمت مضمونها، وتوافق على الالتزام بها. تهدف هذه الشروط إلى تنظيم استخدام الموقع والخدمات الإلكترونية المقدمة من خلاله، بما في ذلك الفحص الأولي، عرض المؤشرات التوجيهية، طلب الحجز، والتواصل مع المنصة.
              </p>
            </div>
          </div>

          <p
            className="text-xs text-slate-400 mt-8"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            آخر تحديث: 4/4/2026
          </p>
        </div>
      </section>

      {/* Quick Nav */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#section-${s.id}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-50"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    color: "#64748B",
                    textDecoration: "none",
                  }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section) => (
            <TermsSection key={section.id} section={section} />
          ))}

          {/* Provider Info Section */}
          <div
            className="rounded-3xl p-8 lg:p-10"
            style={{
              background: "white",
              border: "1px solid #D8E8E7",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-start gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                }}
              >
                <Mail size={24} style={{ color: "#F4C46A" }} />
              </div>
              <div>
                <h2
                  className="text-xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
                >
                  بيانات مقدم الخدمة
                </h2>
                <p
                  className="text-sm text-slate-500"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  معلومات الاتصال والبيانات الرسمية
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    اسم المنصة
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    تشخيصي
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    اسم المنشأة
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    تشخيصي كير
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    رقم السجل التجاري
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    7052506925
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    الرقم الضريبي
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    [إن وجد]
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    البريد الإلكتروني
                  </p>
                  <a
                    href="mailto:info@tashkheesy.com"
                    className="text-slate-600 text-sm hover:text-blue-600"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    info@tashkheesy.com
                  </a>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    واتساب/الهاتف
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    [يضاف لاحقًا]
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    العنوان
                  </p>
                  <p
                    className="text-slate-600 text-sm"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    [يضاف لاحقًا]
                  </p>
                </div>
                <div>
                  <p
                    className="font-semibold text-slate-900 text-sm mb-1"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    رابط الموقع
                  </p>
                  <a
                    href="https://www.tashkheesy.com"
                    className="text-slate-600 text-sm hover:text-blue-600 break-all"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.tashkheesy.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl p-10 text-center"
            style={{ background: "linear-gradient(135deg, #243B53, #1E3A8A)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <Mail size={24} className="text-teal-400" />
            </div>
            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              لديك سؤال أو استفسار؟
            </h3>
            <p
              className="text-slate-300 mb-8 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              فريقنا جاهز للإجابة على أي استفسار يتعلق بهذه الشروط أو خدماتنا.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@tashkheesy.com"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #1E4E8C, #2BBDB6)",
                  color: "white",
                  fontFamily: "'Cairo', sans-serif",
                  textDecoration: "none",
                }}
              >
                <Mail size={16} />
                info@tashkheesy.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

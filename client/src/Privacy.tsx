/*
 * تشخيصي — صفحة سياسة الخصوصية (نسخة محسّنة)
 * Editorial Healthcare · Arabic-first · Human-readable · Reassuring
 * Simple, transparent, respectful — not a heavy legal document
 * Palette: #F4EFE8 bg · #243B53 text · #1E4E8C accent · #2BBDB6 secondary
 */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  Lock,
  Eye,
  Trash2,
  Heart,
  CheckCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";

// ─── بيانات الأقسام ───────────────────────────────────────────────────
const sections = [
  {
    id: "who-are-we",
    icon: Heart,
    title: "من نحن",
    subtitle: "تعريف بالمنصة وخدماتها",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "ما هي تشخيصي",
        text: "منصة إلكترونية سعودية تقدم خدمات الفحص الأولي والمؤشرات التوجيهية المرتبطة بصعوبات التعلم، صعوبات القراءة، والانتباه والتركيز، وتساعد الأسر والأفراد على فهم النتائج الأولية وتنظيم خطوة التحدث مع مختص عند الحاجة.",
      },
      {
        label: "ما لا تقدمه المنصة",
        text: "لا تقدم المنصة تشخيصًا طبيًا أو نفسيًا أو تربويًا رسميًا، ولا تُغني عن مراجعة مختص مؤهل أو جهة مختصة عند الحاجة.",
      },
    ],
  },
  {
    id: "scope",
    icon: Eye,
    title: "نطاق السياسة",
    subtitle: "ما تغطيه سياسة الخصوصية هذه",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "تطبيقها",
        text: "تنطبق هذه السياسة على البيانات التي يتم جمعها أو معالجتها عند استخدام موقع تشخيصي، بما في ذلك تصفح الموقع، استخدام أدوات الفحص الأولي، إدخال بيانات طفل أو مستخدم، طلب الحجز أو التواصل مع المنصة، أو استخدام أي نماذج أو خدمات إلكترونية مرتبطة بالموقع.",
      },
      {
        label: "عدم تطبيقها",
        text: "ولا تنطبق هذه السياسة على أي مواقع أو خدمات خارجية قد يتم الوصول إليها من خلال روابط خارجية، حيث تخضع تلك المواقع لسياساتها الخاصة.",
      },
    ],
  },
  {
    id: "collect",
    icon: Eye,
    title: "البيانات التي نجمعها",
    subtitle: "أنواع البيانات المُجمّعة حسب الاستخدام",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "بيانات التواصل",
        text: "الاسم، البريد الإلكتروني، رقم الجوال، وبيانات التواصل التي تقدمها عند طلب الحجز أو التواصل معنا.",
      },
      {
        label: "بيانات الطفل أو المستخدم",
        text: "الاسم الأول أو الاسم التعريفي، العمر أو تاريخ الميلاد، المرحلة الدراسية، الجنس، وأي ملاحظات يضيفها ولي الأمر أو المستخدم طوعًا.",
      },
      {
        label: "بيانات الفحص الأولي",
        text: "إجابات المستخدم على أسئلة الفحص، نوع الفحص، النتيجة التوجيهية، تاريخ إكمال الفحص، وأي مؤشرات عامة تظهر بناءً على الإجابات.",
      },
      {
        label: "بيانات الحجز",
        text: "نوع الخدمة المطلوبة، الموعد المختار، اسم المختص إن وجد، حالة الحجز، والملاحظات المرتبطة بطلب الحجز.",
      },
      {
        label: "بيانات تقنية واستخدامية",
        text: "نوع الجهاز، نوع المتصفح، عنوان بروتوكول الإنترنت IP، ملفات الارتباط، الصفحات التي تمت زيارتها، وسجلات الاستخدام الضرورية لتحسين الخدمة وحماية الموقع.",
      },
      {
        label: "بيانات الدفع",
        text: "عند تفعيل الدفع الإلكتروني، قد تتم معالجة بيانات الدفع من خلال مزود دفع مرخص أو معتمد. لا نقوم بتخزين بيانات البطاقات البنكية الكاملة داخل أنظمة تشخيصي.",
      },
    ],
  },
  {
    id: "use",
    icon: Heart,
    title: "أغراض الاستخدام",
    subtitle: "كيفية استخدام بياناتك",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "تقديم الفحص",
        text: "تقديم الفحص الأولي وعرض النتيجة التوجيهية.",
      },
      {
        label: "إدارة الحجز",
        text: "إنشاء أو إدارة طلبات الحجز.",
      },
      {
        label: "التواصل",
        text: "التواصل مع المستخدم بشأن الخدمة أو الموعد.",
      },
      {
        label: "التأكيدات والتذكيرات",
        text: "إرسال تأكيدات أو تذكيرات متعلقة بالحجز.",
      },
      {
        label: "تحسين الخدمة",
        text: "تحسين تجربة المستخدم وتطوير جودة المنصة.",
      },
      {
        label: "الفهم المجمّع",
        text: "فهم الاستخدام العام للموقع بطريقة مجمعة أو مجهولة الهوية متى أمكن.",
      },
      {
        label: "الحماية",
        text: "حماية الموقع والخدمات من سوء الاستخدام أو الأخطاء التقنية.",
      },
      {
        label: "الالتزام النظامي",
        text: "الالتزام بالمتطلبات النظامية أو المحاسبية أو التشغيلية عند الحاجة.",
      },
    ],
  },
  {
    id: "basis",
    icon: Shield,
    title: "المسوغ النظامي",
    subtitle: "أسس معالجة البيانات",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "الموافقة",
        text: "موافقة المستخدم أو ولي الأمر عند إدخال بيانات طفل.",
      },
      {
        label: "تنفيذ الخدمة",
        text: "تنفيذ الخدمة التي طلبها المستخدم، مثل الفحص أو الحجز أو التواصل.",
      },
      {
        label: "المصلحة المشروعة",
        text: "المصلحة المشروعة في تحسين الخدمة وحماية الموقع.",
      },
      {
        label: "الالتزام النظامي",
        text: "الالتزام بأي متطلبات نظامية أو محاسبية أو تشغيلية ذات علاقة.",
      },
      {
        label: "معالجة الطلبات",
        text: "معالجة الطلبات أو الاستفسارات أو الشكاوى المقدمة من المستخدم.",
      },
    ],
  },
  {
    id: "children",
    icon: Heart,
    title: "بيانات الأطفال",
    subtitle: "حماية خصوصية القُصّر",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "الحاجة إلى الموافقة",
        text: "نظرًا لأن بعض خدمات تشخيصي قد تتعلق بالأطفال أو القُصّر، فإن إدخال بيانات طفل يجب أن يتم فقط من قبل ولي الأمر أو من لديه الصلاحية النظامية لذلك.",
      },
      {
        label: "إقرار ولي الأمر",
        text: "عند إدخال بيانات طفل، يقر المستخدم بأنه ولي الأمر أو لديه الصلاحية النظامية لإدخال تلك البيانات، وأنه يوافق على استخدامها لغرض تقديم الفحص الأولي أو الخدمة المطلوبة وفق هذه السياسة.",
      },
      {
        label: "عدم التسويق للأطفال",
        text: "لا نطلب من الأطفال إدخال بياناتهم بأنفسهم، ولا نستهدفهم بإعلانات تجارية.",
      },
    ],
  },
  {
    id: "sharing",
    icon: Eye,
    title: "مشاركة البيانات",
    subtitle: "متى وكيف نشارك البيانات",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "لا بيع البيانات",
        text: "لا نبيع البيانات الشخصية للمستخدمين.",
      },
      {
        label: "المشاركة الضرورية",
        text: "وقد نشارك الحد الأدنى اللازم من البيانات مع أطراف تساعدنا في تشغيل أو تقديم الخدمة، مثل مزودي الاستضافة والخدمات التقنية، مزودي البريد الإلكتروني أو الرسائل، مزودي الدفع الإلكتروني عند توفر الخدمة المدفوعة، أدوات الدعم الفني أو إدارة الحجز، المختص المرتبط بالحجز بالقدر اللازم لتقديم الجلسة أو مراجعة نتيجة الفحص، أو الجهات الرسمية أو النظامية متى تطلب النظام ذلك.",
      },
      {
        label: "معايير المشاركة",
        text: "تتم مشاركة البيانات، عند الحاجة، بالقدر اللازم للغرض المحدد، ووفق سياسة الخصوصية والأنظمة ذات العلاقة.",
      },
    ],
  },
  {
    id: "protect",
    icon: Lock,
    title: "حماية البيانات",
    subtitle: "كيفية حماية معلوماتك",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "إجراءات الحماية",
        text: "نستخدم إجراءات تقنية وتنظيمية مناسبة لحماية البيانات من الوصول غير المصرح به أو الفقد أو سوء الاستخدام، بما في ذلك تقييد الوصول للبيانات بحسب الحاجة التشغيلية، واستخدام وسائل حماية مناسبة أثناء نقل البيانات وتخزينها متى أمكن.",
      },
      {
        label: "حدود الضمان",
        text: "ورغم أننا نبذل عناية معقولة لحماية البيانات، إلا أن استخدام الإنترنت لا يمكن ضمان أمانه بشكل مطلق.",
      },
    ],
  },
  {
    id: "retention",
    icon: Trash2,
    title: "مدة الاحتفاظ",
    subtitle: "متى نحذف البيانات",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "فترة الاحتفاظ",
        text: "نحتفظ بالبيانات للمدة اللازمة لتحقيق الأغراض التي جُمعت من أجلها، مثل تقديم الخدمة، إدارة الحجوزات، المتابعة التشغيلية، معالجة الشكاوى، أو الالتزام بالمتطلبات النظامية والمحاسبية.",
      },
      {
        label: "الحذف والإخفاء",
        text: "وعند انتهاء الحاجة إلى البيانات، نقوم بحذفها أو إخفاء هويتها متى كان ذلك مناسبًا وممكنًا من الناحية الفنية والنظامية، ما لم توجد متطلبات نظامية تستلزم الاحتفاظ بها لمدة أطول.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Eye,
    title: "ملفات الارتباط",
    subtitle: "كيفية استخدام الـ Cookies",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "الملفات الضرورية",
        text: "قد يستخدم الموقع ملفات ارتباط ضرورية لتشغيل بعض الوظائف الأساسية.",
      },
      {
        label: "ملفات التحليل",
        text: "وقد تُستخدم ملفات أو أدوات تحليل لفهم طريقة استخدام الموقع وتحسين الأداء وتجربة المستخدم.",
      },
      {
        label: "التحكم",
        text: "يمكن للمستخدم التحكم في ملفات الارتباط من خلال إعدادات المتصفح، مع العلم أن تعطيل بعض الملفات قد يؤثر على بعض وظائف الموقع.",
      },
    ],
  },
  {
    id: "rights",
    icon: Shield,
    title: "حقوق المستخدم",
    subtitle: "ما لك من حقوق تتعلق ببياناتك",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "الحق في الإعلام",
        text: "الحق في العلم بالغرض من جمع البيانات وكيفية استخدامها.",
      },
      {
        label: "الحق في الوصول",
        text: "الحق في طلب الوصول إلى البيانات الشخصية المتوفرة لدى المنصة.",
      },
      {
        label: "الحق في النسخة",
        text: "الحق في طلب الحصول على نسخة من البيانات بصيغة واضحة متى كان ذلك ممكنًا.",
      },
      {
        label: "الحق في التصحيح",
        text: "الحق في طلب تصحيح البيانات غير الدقيقة أو تحديثها.",
      },
      {
        label: "الحق في الحذف",
        text: "الحق في طلب حذف البيانات التي انتهت الحاجة إليها، مع مراعاة أي التزامات نظامية أو تشغيلية.",
      },
      {
        label: "الحق في سحب الموافقة",
        text: "الحق في سحب الموافقة عندما تكون الموافقة هي أساس المعالجة.",
      },
      {
        label: "الحق في الشكوى",
        text: "الحق في تقديم استفسار أو شكوى تتعلق بالخصوصية.",
      },
    ],
  },
  {
    id: "exercise-rights",
    icon: Heart,
    title: "ممارسة الحقوق",
    subtitle: "كيفية طلب حقوقك",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "طرق التواصل",
        text: "يمكن للمستخدم ممارسة حقوقه أو إرسال استفسار متعلق بالخصوصية عبر: البريد الإلكتروني: info@tashkheesy.com أو واتساب/الهاتف: [يضاف لاحقًا]",
      },
      {
        label: "التحقق",
        text: "قد نطلب معلومات إضافية للتحقق من هوية مقدم الطلب قبل تنفيذ الطلب، وذلك لحماية بيانات المستخدم ومنع الوصول غير المصرح به.",
      },
    ],
  },
  {
    id: "marketing",
    icon: Heart,
    title: "التسويق والتواصل",
    subtitle: "كيفية التواصل معك",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "رسائل الخدمة",
        text: "قد نتواصل مع المستخدم لإرسال رسائل مرتبطة بالخدمة، مثل تأكيد الحجز أو التذكير بالموعد أو الرد على الاستفسارات.",
      },
      {
        label: "الرسائل التسويقية",
        text: "أما الرسائل التسويقية أو العروض الترويجية، فلن يتم إرسالها إلا وفق موافقة المستخدم أو وفق ما تسمح به الأنظمة ذات العلاقة، مع توفير وسيلة مناسبة لإلغاء الاشتراك متى أمكن.",
      },
    ],
  },
  {
    id: "external-links",
    icon: Eye,
    title: "الروابط الخارجية",
    subtitle: "المسؤولية عن المواقع الخارجية",
    color: "#1E4E8C",
    bg: "#DFF3F1",
    border: "#BFDBFE",
    items: [
      {
        label: "عدم المسؤولية",
        text: "قد يحتوي الموقع على روابط لمواقع أو خدمات خارجية. لا تتحمل تشخيصي مسؤولية ممارسات الخصوصية أو محتوى تلك المواقع، ونوصي المستخدم بمراجعة سياسات الخصوصية الخاصة بها قبل استخدامها.",
      },
    ],
  },
  {
    id: "updates",
    icon: Heart,
    title: "تحديثات السياسة",
    subtitle: "كيف نتعامل مع التغييرات",
    color: "#2BBDB6",
    bg: "#DFF3F1",
    border: "#99F6E4",
    items: [
      {
        label: "التحديثات المستقبلية",
        text: "قد نقوم بتحديث هذه السياسة من وقت لآخر بما يتوافق مع تطور الخدمة أو المتطلبات النظامية. سيتم نشر النسخة المحدثة على هذه الصفحة مع تاريخ آخر تحديث.",
      },
      {
        label: "الإشعار",
        text: "وفي حال وجود تغييرات جوهرية، قد نقوم بإشعار المستخدمين بوسيلة مناسبة داخل الموقع أو عبر بيانات التواصل المتاحة.",
      },
    ],
  },
  {
    id: "contact-privacy",
    icon: Mail,
    title: "بيانات التواصل",
    subtitle: "كيفية التواصل بشأن الخصوصية",
    color: "#F4C46A",
    bg: "#FFFBEB",
    border: "#FDE68A",
    items: [
      {
        label: "معلومات التواصل",
        text: "اسم المنصة: تشخيصي | البريد الإلكتروني: info@tashkheesy.com | واتساب/الهاتف: [يضاف لاحقًا] | العنوان: [يضاف لاحقًا]",
      },
    ],
  },
];

// ─── مكوّن قسم واحد ───────────────────────────────────────────────────
function PrivacySection({ section }: { section: (typeof sections)[0] }) {
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
export default function Privacy() {
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
              سياسة الخصوصية
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2BBDB6, #1E4E8C)" }}
            >
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1
                className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight"
                style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
              >
                خصوصيتك
                <span
                  className="mr-3"
                  style={{
                    background: "linear-gradient(135deg, #2BBDB6, #1E4E8C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  أولويتنا
                </span>
              </h1>
              <p
                className="text-lg text-slate-600 leading-relaxed max-w-2xl"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  lineHeight: 1.9,
                }}
              >
                نلتزم في منصة تشخيصي بحماية خصوصية المستخدمين والتعامل مع البيانات الشخصية بمسؤولية وشفافية. توضّح هذه السياسة أنواع البيانات التي قد نجمعها، وأغراض استخدامها، وكيفية حمايتها، وحقوق المستخدمين المتعلقة ببياناتهم.
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: "🔒", text: "اتصال آمن" },
              { icon: "🚫", text: "لا بيع للبيانات" },
              { icon: "👁️", text: "شفافية في الاستخدام" },
              { icon: "✋", text: "حقوقك محفوظة" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "white",
                  border: "1px solid #D8E8E7",
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  color: "#4A6278",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>

          <p
            className="text-xs text-slate-400 mt-6"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            آخر تحديث: 4/4/2026
          </p>
        </div>
      </section>

      {/* Consent note */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-sm text-slate-600 leading-relaxed"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              lineHeight: 1.9,
            }}
          >
            باستخدامك للموقع أو إدخالك لأي بيانات من خلاله، فإنك تقر بأنك قرأت هذه السياسة وفهمت مضمونها، وتوافق على معالجة بياناتك وفق ما هو موضح فيها، وبما يتوافق مع الأنظمة المعمول بها في المملكة العربية السعودية.
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
            <PrivacySection key={section.id} section={section} />
          ))}
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
              لديك استفسار حول خصوصيتك؟
            </h3>
            <p
              className="text-slate-300 mb-8 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
            >
              فريقنا جاهز للإجابة على أي استفسار يتعلق ببياناتك أو حقوقك.
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

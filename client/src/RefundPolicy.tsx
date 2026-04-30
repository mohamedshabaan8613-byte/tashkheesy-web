/*
 * تشخيصي — سياسة الإلغاء والاسترداد
 * Arabic RTL · Launch policy page
 */

import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  CalendarClock,
  RefreshCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

const sections = [
  {
    title: "نطاق السياسة",
    icon: ShieldCheck,
    content: [
      "تنطبق هذه السياسة على الخدمات التي يتم حجزها أو طلبها عبر منصة تشخيصي، بما في ذلك جلسات مراجعة نتيجة الفحص، الجلسات الإرشادية، أو أي خدمة مدفوعة يتم تقديمها إلكترونيًا أو عن بُعد من خلال المنصة.",
      "لا تنطبق هذه السياسة على أي خدمات أو تعاملات تتم خارج المنصة أو خارج القنوات الرسمية المعلنة من تشخيصي.",
    ],
  },
  {
    title: "طبيعة الخدمة",
    icon: CheckCircle2,
    content: [
      "تقدم تشخيصي خدمات فحص أولي ومؤشرات توجيهية مرتبطة بصعوبات التعلم، صعوبات القراءة، والانتباه والتركيز، مع إمكانية حجز جلسة مراجعة أو إرشاد عند توفرها.",
      "ولا تُعد خدمات تشخيصي تشخيصًا طبيًا أو نفسيًا أو تربويًا رسميًا، ولا تُغني عن مراجعة مختص مؤهل أو جهة مختصة عند الحاجة.",
    ],
  },
  {
    title: "الإلغاء وإعادة الجدولة",
    icon: RefreshCcw,
    content: [
      "يحق للمستخدم طلب إلغاء الموعد أو إعادة جدولته قبل موعد الجلسة بما لا يقل عن 24 ساعة، ويكون له في هذه الحالة طلب إعادة الجدولة أو الاسترداد وفق هذه السياسة.",
      "إذا تم طلب الإلغاء أو إعادة الجدولة قبل الموعد بأقل من 24 ساعة، فقد لا يكون المبلغ قابلًا للاسترداد إذا ترتب على ذلك حجز وقت المختص أو تعذر إتاحة الموعد لمستخدم آخر.",
      "تتم إعادة الجدولة حسب توفر المواعيد، ولا تضمن المنصة توفر موعد بديل في نفس اليوم أو نفس الفترة.",
    ],
  },
  {
    title: "عدم الحضور أو التأخر",
    icon: Clock,
    content: [
      "إذا لم يحضر المستخدم في الموعد المحدد دون إشعار مسبق، أو تأخر لمدة تزيد عن 15 دقيقة من وقت بداية الجلسة، فقد تُعد الجلسة مستخدمة، ولا يحق للمستخدم المطالبة بالاسترداد، ما لم تقرر المنصة خلاف ذلك وفق ظروف استثنائية.",
      "يلتزم المستخدم بالتأكد من جاهزية وسيلة التواصل، اتصال الإنترنت، وبيانات الحضور أو الرابط المرسل قبل موعد الجلسة.",
    ],
  },
  {
    title: "حالات الاسترداد",
    icon: CheckCircle2,
    content: [
      "يمكن للمستخدم طلب الاسترداد إذا لم تبدأ الخدمة أو لم يتم الانتفاع بها، وذلك وفق الأنظمة المعمول بها وسياسة المنصة.",
      "ويشمل ذلك الحالات التالية:",
    ],
    bullets: [
      "إلغاء الموعد من قبل المستخدم قبل الموعد بما لا يقل عن 24 ساعة.",
      "تعذر تقديم الخدمة من قبل المنصة أو إلغاء الموعد من جانبها دون توفير بديل مناسب.",
      "حدوث دفع مكرر أو دفع بالخطأ.",
      "وجود خطأ واضح من المنصة أدى إلى عدم تمكن المستخدم من الاستفادة من الخدمة.",
    ],
    footer:
      "ولا تنتقص هذه السياسة من أي حقوق مقررة للمستهلك بموجب الأنظمة المعمول بها في المملكة العربية السعودية.",
  },
  {
    title: "حالات عدم الاسترداد",
    icon: XCircle,
    content: [
      "قد لا يكون المبلغ قابلًا للاسترداد إذا بدأت الخدمة أو تم الانتفاع بها فعليًا، أو إذا تعذر تقديمها بسبب سبب يعود للمستخدم.",
      "ويشمل ذلك الحالات التالية:",
    ],
    bullets: [
      "عدم حضور المستخدم في الموعد المحدد أو التأخر لأكثر من 15 دقيقة دون إشعار مسبق.",
      "طلب الإلغاء بعد بدء الجلسة أو بعد تقديم الخدمة.",
      "إدخال بيانات تواصل غير صحيحة أو عدم جاهزية المستخدم تقنيًا للجلسة، ما لم يكن الخلل من جانب المنصة.",
      "طلب الإلغاء قبل الموعد بأقل من 24 ساعة، حسب طبيعة الحجز وتقدير المنصة.",
    ],
  },
  {
    title: "طريقة طلب الاسترداد ومدة المعالجة",
    icon: Mail,
    content: [
      "يمكن تقديم طلب الإلغاء أو الاسترداد عبر القنوات الرسمية التالية:",
      "البريد الإلكتروني: info@tashkheesy.com",
      "ويجب أن يتضمن الطلب، قدر الإمكان، بيانات تساعد على مراجعته مثل الاسم، بيانات التواصل المستخدمة في الحجز، رقم الطلب أو الحجز إن وجد، وتاريخ الموعد وسبب الطلب.",
      "تتم مراجعة طلب الاسترداد خلال مدة تقديرية لا تتجاوز 7إلي 14 يوم عمل من تاريخ قبول الطلب. وفي حال قبول الطلب، تتم معالجة الاسترداد عبر نفس وسيلة الدفع المستخدمة متى أمكن، أو وفق الآلية المناسبة التي تحددها المنصة. وقد تختلف مدة ظهور المبلغ في حساب المستخدم حسب البنك أو مزود خدمة الدفع.",
    ],
  },
];

function PolicySection({ section }: { section: (typeof sections)[0] }) {
  const Icon = section.icon;

  return (
    <div className="ts-card rounded-2xl p-6 lg:p-8">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-[#DFF3F1] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#1E4E8C]" />
        </div>
        <h2 className="text-xl font-bold text-[#243B53]" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {section.title}
        </h2>
      </div>

      <div className="space-y-4">
        {section.content.map((paragraph, index) => (
          <p
            key={index}
            className="text-sm sm:text-base text-[#4A6278] leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
          >
            {paragraph}
          </p>
        ))}

        {section.bullets && (
          <ul className="space-y-3 pr-5 list-disc">
            {section.bullets.map((item, index) => (
              <li
                key={index}
                className="text-sm sm:text-base text-[#4A6278] leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        {section.footer && (
          <p
            className="text-sm sm:text-base text-[#4A6278] leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
          >
            {section.footer}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#F4EFE8]" style={{ direction: "rtl" }}>
      <Navbar />

      <main>
        <section className="pt-28 pb-16 bg-[#DFF3F1]">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <Link href="/">
                  <span
                    className="text-sm text-[#4A6278] hover:text-[#1E4E8C] cursor-pointer transition-colors"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    الرئيسية
                  </span>
                </Link>
                <ArrowLeft className="w-4 h-4 text-[#94A3B8]" />
                <span
                  className="text-sm text-[#1E4E8C] font-medium"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  سياسة الإلغاء والاسترداد
                </span>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#1E4E8C] to-[#2BBDB6]">
                  <CalendarClock className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h1
                    className="text-4xl lg:text-5xl font-black text-[#243B53] mb-5 leading-tight"
                    style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 900 }}
                  >
                    سياسة الإلغاء والاسترداد
                  </h1>

                  <p
                    className="text-lg text-[#4A6278] leading-relaxed max-w-3xl"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", lineHeight: 1.9 }}
                  >
                    توضح هذه السياسة آلية إلغاء المواعيد، إعادة الجدولة، واسترداد المبالغ للخدمات المقدمة عبر منصة تشخيصي. وتهدف إلى تنظيم العلاقة بين المستخدم والمنصة بطريقة واضحة وعادلة، وبما يتوافق مع طبيعة الخدمات الإلكترونية المقدمة.
                  </p>

                  <p
                    className="text-xs text-[#64748B] mt-6"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    آخر تحديث: 4/4/2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-20 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-6">
              {sections.map((section) => (
                <PolicySection key={section.title} section={section} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

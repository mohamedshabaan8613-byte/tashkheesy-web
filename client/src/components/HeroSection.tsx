import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div>
            <h1 className="mb-4 text-3xl md:text-4xl font-extrabold leading-relaxed text-slate-900">
              التشخيص الصحيح…
              <span className="text-indigo-600"> بداية الحل ✨</span>
            </h1>
            <p className="mb-6 text-sm md:text-base leading-relaxed text-slate-700">
              تشخيصي هي منصة عربية تربطك بأخصائيين معتمدين في صعوبات التعلّم
              والقراءة (الديسلكسيا)، من خلال جلسات أونلاين وتقارير رسمية تساعد
              طفلك أو ابنك الجامعي على الحصول على الدعم الذي يستحقه.
            </p>

            <div className="mb-4 flex flex-wrap gap-3">
              <Link href="/booking">
                <Button size="lg">
                  احجز موعدك الآن
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline">
                  تعرف على الخدمات
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-8">
              <span className="flex items-center gap-1">🔒 سرية تامة</span>
              <span className="flex items-center gap-1">🧑‍⚕️ أخصائيون معتمدون</span>
              <span className="flex items-center gap-1">💳 دفع إلكتروني آمن</span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-6">
              <div>
                <div className="text-xl font-bold text-indigo-600">3500+</div>
                <div className="text-xs text-slate-500">جلسة تشخيص</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600">98%</div>
                <div className="text-xs text-slate-500">رضا العملاء</div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-600">15+</div>
                <div className="text-xs text-slate-500">أخصائي خبير</div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="md:justify-self-end">
            <div className="rounded-3xl bg-white p-5 shadow-md max-w-md">
              <div className="mb-3 text-sm font-semibold text-slate-800">
                لمن هذه المنصّة؟
              </div>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <div className="font-semibold mb-1">للأهل 👨‍👩‍👧‍👦</div>
                  <p className="text-xs text-slate-600">
                    إذا كان طفلك يتهرّب من القراءة أو يخلط بين الحروف، نوفّر لك
                    تشخيصًا احترافيًا وخطة واضحة للتعامل مع حالته.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <div className="font-semibold mb-1">لطلاب الثانوي والجامعة 🎓</div>
                  <p className="text-xs text-slate-600">
                    سرعة قراءة أقل من زملائك؟ تعب سريع من قراءة المراجع؟ قد
                    تكون هناك صعوبة تعلّم لم تُشخَّص بعد.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <div className="font-semibold mb-1">المختصيين في المدارس والجامعات 🏫</div>
                  <p className="text-xs text-slate-600">
                    حلول تشخيصية جماعية للطلاب، مع تقارير رسمية تساعدكم في
                    اتخاذ قرارات تربوية عادلة وداعمة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

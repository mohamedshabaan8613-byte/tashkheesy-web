import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="py-10 md:py-20 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              المنصة الأولى المتخصصة في السعودية
            </div>
            
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] text-slate-900">
              التشخيص الصحيح…
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"> بداية الحل لطفلك ✨</span>
            </h1>
            
            <p className="mb-8 text-lg md:text-xl leading-relaxed text-slate-600 max-w-xl">
              نربطك بنخبة من الأخصائيين المعتمدين لتشخيص صعوبات التعلّم والقراءة (الديسلكسيا) عبر جلسات أونلاين آمنة وتقارير رسمية معتمدة.
            </p>

            <div className="mb-10 flex flex-wrap gap-4">
              <Link href="/booking">
                <Button size="lg" className="h-14 px-8 text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                  ابدأ رحلة التشخيص الآن
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg hover:bg-slate-50">
                  اكتشف خدماتنا
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                <span>سرية تامة وموثوقية</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                <span>أخصائيون معتمدون</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                <span>تقارير رسمية</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 border-t border-slate-100 pt-8">
              <div>
                <div className="text-3xl font-bold text-slate-900">3,500+</div>
                <div className="text-sm text-slate-500 mt-1">جلسة تشخيص ناجحة</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">98%</div>
                <div className="text-sm text-slate-500 mt-1">نسبة رضا الأهالي</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">15+</div>
                <div className="text-sm text-slate-500 mt-1">خبير معتمد</div>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative lg:ml-auto">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=800" 
                alt="طفل يتعلم بسعادة" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 right-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-medium text-slate-800">
                    انضم لـ <span className="font-bold text-indigo-600">2,400+</span> عائلة وثقت بنا
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            
            {/* Floating Card */}
            <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 hidden xl:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">⭐</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">تقييم ممتاز</div>
                  <div className="text-xs text-slate-500">بناءً على 500+ مراجعة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

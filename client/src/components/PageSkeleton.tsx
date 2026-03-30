/**
 * PageSkeleton — شاشة تحميل تُعرض أثناء Lazy Loading للصفحات
 * تُحاكي هيكل الصفحة لتقليل الـ Cumulative Layout Shift (CLS)
 */
export default function PageSkeleton() {
  return (
    <div
      className="min-h-screen bg-white animate-pulse"
      role="status"
      aria-label="جارٍ تحميل الصفحة..."
    >
      {/* Navbar skeleton */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-slate-200" />
            <div className="space-y-1">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {[80, 96, 64, 72, 88, 80].map((w, i) => (
              <div key={i} className={`h-4 w-${w / 4} rounded bg-slate-100`} style={{ width: w }} />
            ))}
          </div>
          <div className="h-9 w-24 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="container py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="h-6 w-40 rounded-full bg-slate-100" />
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg bg-slate-200" />
              <div className="h-10 w-4/5 rounded-lg bg-slate-200" />
              <div className="h-10 w-3/5 rounded-lg bg-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-full rounded bg-slate-100" />
              <div className="h-5 w-5/6 rounded bg-slate-100" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-36 rounded-lg bg-slate-200" />
              <div className="h-11 w-28 rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="h-80 rounded-3xl bg-slate-100" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="bg-slate-50 py-20">
        <div className="container">
          <div className="text-center mb-12 space-y-3">
            <div className="h-6 w-32 rounded-full bg-slate-200 mx-auto" />
            <div className="h-8 w-64 rounded-lg bg-slate-200 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-8 space-y-4 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-5/6 rounded bg-slate-100" />
                  <div className="h-4 w-4/6 rounded bg-slate-100" />
                </div>
                <div className="h-10 w-full rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">جارٍ تحميل الصفحة...</span>
    </div>
  );
}

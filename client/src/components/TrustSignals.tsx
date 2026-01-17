export default function TrustSignals() {
  const partners = [
    { name: "هيئة التخصصات الصحية", logo: "🇸🇦", desc: "أخصائيون معتمدون" },
    { name: "الجمعية الدولية للديسلكسيا", logo: "🌐", desc: "معايير عالمية" },
    { name: "وزارة التعليم", logo: "🎓", desc: "تقارير معترف بها" },
    { name: "الجمعية السعودية للتربية الخاصة", logo: "🤝", desc: "شراكة استراتيجية" }
  ];

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">اعتماداتنا وشراكاتنا</h2>
          <p className="text-slate-600">نعمل وفق أعلى المعايير المهنية المعتمدة محلياً ودولياً</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{partner.logo}</div>
              <div className="font-bold text-slate-800 text-sm">{partner.name}</div>
              <div className="text-xs text-slate-500">{partner.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

const packages = [
  {
    name: "باقة تشخيص طفل واحد",
    price: "299",
    features: [
      "جلسة تشخيص 60–90 دقيقة",
      "تقرير رسمي PDF",
      "اتصال متابعة 15 دقيقة"
    ],
    highlighted: false
  },
  {
    name: "باقة طالب جامعي",
    price: "349",
    features: [
      "جلسة تقييم 75 دقيقة",
      "تقرير قابل للتقديم للجامعة",
      "توصيات للتسهيلات الأكاديمية"
    ],
    highlighted: true
  },
  {
    name: "باقة عائلة",
    price: "499",
    features: [
      "تشخيص لطفلين من نفس الأسرة",
      "تقرير لكل طفل",
      "توصيات وخطة متابعة"
    ],
    highlighted: false
  }
];

export default function PricingPreview() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            باقات وأسعار واضحة
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            أسعار شفافة وقيمة حقيقية لكل باقة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-shadow ${
                pkg.highlighted ? "ring-2 ring-indigo-600" : ""
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                  الأكثر طلباً
                </div>
              )}
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-indigo-600">
                    {pkg.price}
                  </span>
                  <span className="text-slate-600 mr-1">ر.س</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pkg.highlighted ? "default" : "outline"}
                  onClick={() => toast.info("سيتم توجيهك لصفحة الحجز قريباً")}
                >
                  احجز الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

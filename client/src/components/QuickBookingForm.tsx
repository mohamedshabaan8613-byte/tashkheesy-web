import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function QuickBookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // استخدام Formspree لإرسال البيانات
      const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // تتبع التحويل في Google Analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "form_submission", {
            event_category: "engagement",
            event_label: "quick_booking_form",
            value: formData.service,
          });
        }

        // إعادة توجيه بعد 3 ثوان
        setTimeout(() => {
          window.location.href = "/booking";
        }, 3000);
      } else {
        setError("حدث خطأ في إرسال النموذج. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            تم إرسال طلبك بنجاح!
          </h3>
          <p className="text-green-700 mb-4">
            شكراً لك! سنتواصل معك خلال 24 ساعة لتأكيد موعدك.
          </p>
          <p className="text-sm text-green-600">
            جاري التوجيه إلى صفحة الحجز الكاملة...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">احجز موعدك الآن</CardTitle>
        <p className="text-slate-600 text-sm">
          املأ النموذج وسنتواصل معك لتأكيد الموعد
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="أدخل اسمك الكامل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الجوال *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="05xxxxxxxx"
              pattern="[0-9]{10}"
              title="يرجى إدخال رقم جوال صحيح (10 أرقام)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="example@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">نوع الخدمة *</Label>
            <Select
              required
              value={formData.service}
              onValueChange={(value) =>
                setFormData({ ...formData, service: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الخدمة المناسبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="children">
                  تشخيص صعوبات التعلم للأطفال (299 ر.س)
                </SelectItem>
                <SelectItem value="university">
                  تشخيص صعوبات التعلم لطلاب الجامعة (349 ر.س)
                </SelectItem>
                <SelectItem value="institutions">
                  حلول تشخيصية للمدارس والجامعات
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال الطلب"
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            بإرسال هذا النموذج، أنت توافق على{" "}
            <a href="/privacy" className="text-indigo-600 hover:underline">
              سياسة الخصوصية
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

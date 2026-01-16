import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useLocation } from "wouter";
import { CheckCircle2, ArrowLeft } from "lucide-react";

interface QuickBookingFormProps {
  preSelectedService?: string;
}

export default function QuickBookingForm({ preSelectedService }: QuickBookingFormProps) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: preSelectedService || "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // في الإنتاج الفعلي، يمكن إرسال البيانات إلى API
    console.log("Form submitted:", formData);
    
    // عرض رسالة نجاح
    setIsSubmitted(true);
    
    // التوجيه إلى صفحة الحجز الكاملة بعد 2 ثانية
    setTimeout(() => {
      setLocation("/booking");
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            تم استلام طلبك!
          </h3>
          <p className="text-slate-600 mb-4">
            سيتم توجيهك لإكمال عملية الحجز...
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            احجز موعدك الآن
          </h3>
          <p className="text-slate-600">
            املأ البيانات التالية وسنتواصل معك لتحديد موعد الجلسة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-700 mb-2 block">
              الاسم الكامل <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-slate-700 mb-2 block">
              رقم الجوال <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="05xxxxxxxx"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              className="text-right"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-700 mb-2 block">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="text-right"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="service" className="text-slate-700 mb-2 block">
              نوع الخدمة <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.service}
              onValueChange={(value) => handleChange("service", value)}
              required
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر نوع الخدمة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="children">
                  تشخيص صعوبات التعلم للأطفال (299 ر.س)
                </SelectItem>
                <SelectItem value="university">
                  تشخيص صعوبات التعلم لطلاب الجامعة (349 ر.س)
                </SelectItem>
                <SelectItem value="schools">
                  حلول تشخيصية للمدارس والجامعات
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full">
              إرسال الطلب والمتابعة للحجز
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>

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

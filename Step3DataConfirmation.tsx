import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { User, Baby, GraduationCap, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Step3DataConfirmation() {
  const { bookingData, updateBookingData, prevStep, nextStep } = useBooking();
  
  const [formData, setFormData] = useState({
    parentName: bookingData.parentName || "",
    parentEmail: bookingData.parentEmail || "",
    parentPhone: bookingData.parentPhone || "",
    parentCountry: bookingData.parentCountry || "السعودية",
    userRole: bookingData.userRole || "PARENT",
    patientName: bookingData.patientName || "",
    patientAge: bookingData.patientAge || "",
    patientGrade: bookingData.patientGrade || "",
    patientUniversity: bookingData.patientUniversity || "",
    patientYear: bookingData.patientYear || "",
    previousAssessment: bookingData.previousAssessment || false,
    notes: bookingData.notes || "",
    privacyAgreed: bookingData.privacyAgreed || false,
    disclaimerAgreed: bookingData.disclaimerAgreed || false,
    guardianAgreed: bookingData.guardianAgreed || false,
  });

  const isChildService = bookingData.serviceType === "CHILD";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.parentName || !formData.parentEmail || !formData.parentPhone) {
      alert("يرجى ملء جميع البيانات الشخصية");
      return;
    }

    if (!formData.patientName || !formData.patientAge) {
      alert("يرجى ملء بيانات الطفل/الطالب");
      return;
    }

    if (!formData.privacyAgreed || !formData.disclaimerAgreed) {
      alert("يرجى الموافقة على سياسة الخصوصية وإخلاء المسؤولية");
      return;
    }

    if (isChildService && !formData.guardianAgreed) {
      alert("يرجى تأكيد أنك ولي أمر الطفل");
      return;
    }

    updateBookingData({
      ...formData,
      patientAge: typeof formData.patientAge === 'string' ? parseInt(formData.patientAge) : formData.patientAge,
    });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* بيانات صاحب الحجز */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              بياناتك الشخصية
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مثال: محمد أحمد"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                رقم الجوال <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="05XXXXXXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                بلد الإقامة
              </label>
              <input
                type="text"
                name="parentCountry"
                value={formData.parentCountry}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="السعودية"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بيانات الحالة */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            {isChildService ? (
              <Baby className="w-5 h-5 text-indigo-600" />
            ) : (
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            )}
            <h3 className="text-lg font-bold text-slate-900">
              {isChildService ? "بيانات الطفل" : "بيانات الطالب"}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                {isChildService ? "اسم الطفل" : "اسم الطالب"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={isChildService ? "مثال: أحمد" : "الاسم الكامل"}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                العمر <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={isChildService ? "5-18" : "17+"}
                min={isChildService ? 5 : 17}
                max={isChildService ? 18 : 40}
                required
              />
            </div>
          </div>

          {isChildService ? (
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-800">
                الصف الدراسي
              </label>
              <input
                type="text"
                name="patientGrade"
                value={formData.patientGrade}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="مثال: الصف الثالث الابتدائي"
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-800">
                  الجامعة / الكلية
                </label>
                <input
                  type="text"
                  name="patientUniversity"
                  value={formData.patientUniversity}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: جامعة الملك سعود"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-800">
                  السنة الدراسية
                </label>
                <input
                  type="text"
                  name="patientYear"
                  value={formData.patientYear}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: المستوى الرابع"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="previousAssessment"
                checked={formData.previousAssessment}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-slate-700">
                تم عمل تقييم سابق لصعوبات التعلم
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ملاحظات إضافية */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              ملاحظات إضافية (اختياري)
            </h3>
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="اذكر أي تفاصيل تعتقد أنها مهمة للأخصائي..."
          />
        </CardContent>
      </Card>

      {/* الموافقات */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-bold text-slate-900">
              الموافقات المطلوبة
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="privacyAgreed"
                checked={formData.privacyAgreed}
                onChange={handleChange}
                className="w-4 h-4 mt-1 flex-shrink-0"
                required
              />
              <span className="text-slate-700">
                أوافق على{" "}
                <Link href="/privacy" className="text-indigo-600 underline">
                  سياسة الخصوصية
                </Link>{" "}
                واستخدام بياناتي لأغراض تقديم خدمة التشخيص.{" "}
                <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="disclaimerAgreed"
                checked={formData.disclaimerAgreed}
                onChange={handleChange}
                className="w-4 h-4 mt-1 flex-shrink-0"
                required
              />
              <span className="text-slate-700">
                أفهم أن المنصة لا تقدم خدمات طوارئ، وأن التوصيات لا تُغني عن
                مراجعة طبيب عند الضرورة. (
                <Link href="/disclaimer" className="text-indigo-600 underline">
                  إخلاء المسؤولية
                </Link>
                ) <span className="text-red-500">*</span>
              </span>
            </label>

            {isChildService && (
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="guardianAgreed"
                  checked={formData.guardianAgreed}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 flex-shrink-0"
                  required
                />
                <span className="text-slate-700">
                  أقرّ أنني ولي أمر الطفل أو مخوّل قانونياً لطلب هذا التشخيص.{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* أزرار التنقل */}
      <div className="flex justify-between gap-3 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={prevStep}>
          السابق
        </Button>
        <Button size="lg" onClick={handleSubmit}>
          متابعة إلى التأكيد
        </Button>
      </div>
    </div>
  );
}

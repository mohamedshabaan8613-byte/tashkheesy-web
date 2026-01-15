import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { CheckCircle, Calendar, Clock, User, Baby, GraduationCap, Mail, Phone, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Step4Confirmation() {
  const { bookingData, prevStep, resetBooking } = useBooking();

  const handlePayment = () => {
    // في التطبيق الحقيقي، هنا سيتم توجيه المستخدم لبوابة الدفع
    toast.success("سيتم توجيهك لبوابة الدفع...");
    
    // محاكاة عملية الدفع
    setTimeout(() => {
      toast.success("تم تأكيد الحجز بنجاح!");
      // يمكن هنا إعادة التوجيه لصفحة النجاح
    }, 2000);
  };

  const servicePrice = bookingData.serviceType === "CHILD" ? 299 : 349;
  const isChildService = bookingData.serviceType === "CHILD";

  return (
    <div className="max-w-4xl mx-auto">
      {/* رسالة التأكيد */}
      <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            مراجعة وتأكيد الحجز
          </h2>
          <p className="text-slate-700">
            يرجى مراجعة البيانات التالية قبل إتمام عملية الدفع
          </p>
        </CardContent>
      </Card>

      {/* ملخص الحجز */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* تفاصيل الخدمة والموعد */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              تفاصيل الموعد
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-600">نوع الخدمة:</span>
                <p className="font-semibold text-slate-900">
                  {isChildService
                    ? "تشخيص صعوبات القراءة - للأطفال"
                    : "تشخيص صعوبات القراءة - طلاب الجامعة"}
                </p>
              </div>

              <div>
                <span className="text-slate-600">التاريخ:</span>
                <p className="font-semibold text-slate-900">
                  {bookingData.selectedDate || "غير محدد"}
                </p>
              </div>

              <div>
                <span className="text-slate-600">الوقت:</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {bookingData.selectedTimeSlot ? "الوقت المحدد" : "غير محدد"}
                </p>
              </div>

              {!bookingData.autoAssign && (
                <div>
                  <span className="text-slate-600">الأخصائي:</span>
                  <p className="font-semibold text-slate-900">
                    {bookingData.specialistId ? "أخصائي محدد" : "اختيار تلقائي"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* بيانات المستخدم */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              بياناتك
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-600">الاسم:</span>
                <p className="font-semibold text-slate-900">
                  {bookingData.parentName}
                </p>
              </div>

              <div>
                <span className="text-slate-600">البريد الإلكتروني:</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {bookingData.parentEmail}
                </p>
              </div>

              <div>
                <span className="text-slate-600">الجوال:</span>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {bookingData.parentPhone}
                </p>
              </div>

              <div>
                <span className="text-slate-600">بلد الإقامة:</span>
                <p className="font-semibold text-slate-900">
                  {bookingData.parentCountry}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* بيانات الطفل/الطالب */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            {isChildService ? (
              <Baby className="w-5 h-5 text-indigo-600" />
            ) : (
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            )}
            {isChildService ? "بيانات الطفل" : "بيانات الطالب"}
          </h3>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-600">الاسم:</span>
              <p className="font-semibold text-slate-900">
                {bookingData.patientName}
              </p>
            </div>

            <div>
              <span className="text-slate-600">العمر:</span>
              <p className="font-semibold text-slate-900">
                {bookingData.patientAge} سنة
              </p>
            </div>

            {isChildService ? (
              <div>
                <span className="text-slate-600">الصف الدراسي:</span>
                <p className="font-semibold text-slate-900">
                  {bookingData.patientGrade || "غير محدد"}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-slate-600">الجامعة:</span>
                  <p className="font-semibold text-slate-900">
                    {bookingData.patientUniversity || "غير محدد"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">السنة الدراسية:</span>
                  <p className="font-semibold text-slate-900">
                    {bookingData.patientYear || "غير محدد"}
                  </p>
                </div>
              </>
            )}
          </div>

          {bookingData.notes && (
            <div className="mt-4 pt-4 border-t">
              <span className="text-slate-600 text-sm">ملاحظات إضافية:</span>
              <p className="text-slate-900 mt-1">{bookingData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ملخص السعر */}
      <Card className="mb-6 bg-slate-50">
        <CardContent className="pt-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            ملخص السعر
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">سعر الخدمة:</span>
              <span className="font-semibold text-slate-900">
                {servicePrice} ر.س
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">ضريبة القيمة المضافة (15%):</span>
              <span className="font-semibold text-slate-900">
                {(servicePrice * 0.15).toFixed(2)} ر.س
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between">
              <span className="font-bold text-slate-900">الإجمالي:</span>
              <span className="font-bold text-indigo-600 text-xl">
                {(servicePrice * 1.15).toFixed(2)} ر.س
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تنبيه */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-slate-700">
            💳 بالضغط على "إتمام الحجز والدفع"، سيتم توجيهك لبوابة الدفع الآمنة
            لإكمال عملية الدفع. بعد نجاح الدفع، سيتم إرسال تأكيد الحجز ورابط
            الجلسة إلى بريدك الإلكتروني.
          </p>
        </CardContent>
      </Card>

      {/* أزرار التنقل */}
      <div className="flex justify-between gap-3 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={prevStep}>
          السابق
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={resetBooking}>
            إلغاء
          </Button>
          <Button size="lg" onClick={handlePayment} className="min-w-[200px]">
            إتمام الحجز والدفع
          </Button>
        </div>
      </div>
    </div>
  );
}

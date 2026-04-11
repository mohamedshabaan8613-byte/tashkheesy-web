import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { Calendar, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Step2DateSelection() {
  const { bookingData, updateBookingData, nextStep, prevStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    bookingData.selectedDate
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(
    bookingData.selectedTimeSlot
  );

  const specialistId = bookingData.specialistId ?? "auto";

  // جلب الأيام المتاحة من الـ API
  const { data: availableDates, isLoading: datesLoading } =
    trpc.slots.getDates.useQuery({ specialistId });

  // جلب الأوقات عند اختيار يوم
  const { data: timeSlots, isLoading: slotsLoading } =
    trpc.slots.getTimeSlots.useQuery(
      { specialistId, dateId: selectedDate! },
      { enabled: !!selectedDate }
    );

  const handleNext = () => {
    if (!selectedDate) {
      toast.error("يرجى اختيار التاريخ", {
        description: "اختر يوماً من الأيام المتاحة للمتابعة.",
      });
      return;
    }
    if (!selectedTimeSlot) {
      toast.error("يرجى اختيار وقت الجلسة", {
        description: "اختر وقتاً متاحاً من القائمة أدناه للمتابعة.",
      });
      return;
    }

    updateBookingData({
      selectedDate,
      selectedTimeSlot,
    });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* اختيار التاريخ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-lg font-bold text-slate-900">
            اختر التاريخ المناسب
          </h3>
        </div>

        {datesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            <span className="mr-3 text-slate-600">جاري تحميل المواعيد...</span>
          </div>
        ) : (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {availableDates?.map((date: any) => (
            <Card
              key={date.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDate === date.id
                  ? "ring-2 ring-indigo-600 bg-[#EFF6FF]"
                  : ""
              }`}
              onClick={() => {
                setSelectedDate(date.id);
                setSelectedTimeSlot(undefined); // Reset time when date changes
              }}
            >
              <CardContent className="pt-4 pb-4 px-2 text-center">
                <div className="text-xs text-slate-600 mb-1">
                  {date.dayName}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {date.dayNumber}
                </div>
                <div className="text-xs text-slate-500">
                  {date.month}
                </div>
                {selectedDate === date.id && (
                  <CheckCircle className="w-4 h-4 text-[#2563EB] mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>

      {/* اختيار الوقت */}
      {selectedDate && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#2563EB]" />
            <h3 className="text-lg font-bold text-slate-900">
              اختر وقت الجلسة
            </h3>
          </div>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
              <span className="mr-2 text-slate-600">جاري تحميل الأوقات...</span>
            </div>
          ) : timeSlots && timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {timeSlots.map((slot: any) => (
                <Button
                  key={slot.id}
                  variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                  className={`h-14 text-base ${
                    !slot.available ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {slot.time}
                  {!slot.available && (
                    <span className="block text-xs mt-1">محجوز</span>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600">
                  لا توجد أوقات متاحة في هذا اليوم
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ملخص الاختيار */}
      {selectedDate && selectedTimeSlot && (
        <Card className="mb-8 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border-[#BFDBFE]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  موعدك المختار
                </h4>
                <p className="text-sm text-slate-700">
                  {availableDates?.find((d: any) => d.id === selectedDate)?.fullDate} -{" "}
                  {timeSlots?.find((t: any) => t.id === selectedTimeSlot)?.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار التنقل */}
      <div className="flex justify-between gap-3 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={prevStep}>
          السابق
        </Button>
        <Button size="lg" onClick={handleNext}>
          التالي: إدخال البيانات
        </Button>
      </div>
    </div>
  );
}

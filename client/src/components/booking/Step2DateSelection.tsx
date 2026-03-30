import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// بيانات تجريبية للمواعيد
const MOCK_DATES = [
  { id: "2026-04-01", dayName: "الثلاثاء", dayNumber: "١", month: "أبريل", fullDate: "١ أبريل ٢٠٢٦" },
  { id: "2026-04-02", dayName: "الأربعاء", dayNumber: "٢", month: "أبريل", fullDate: "٢ أبريل ٢٠٢٦" },
  { id: "2026-04-03", dayName: "الخميس", dayNumber: "٣", month: "أبريل", fullDate: "٣ أبريل ٢٠٢٦" },
  { id: "2026-04-06", dayName: "الأحد", dayNumber: "٦", month: "أبريل", fullDate: "٦ أبريل ٢٠٢٦" },
  { id: "2026-04-07", dayName: "الاثنين", dayNumber: "٧", month: "أبريل", fullDate: "٧ أبريل ٢٠٢٦" },
  { id: "2026-04-08", dayName: "الثلاثاء", dayNumber: "٨", month: "أبريل", fullDate: "٨ أبريل ٢٠٢٦" },
  { id: "2026-04-09", dayName: "الأربعاء", dayNumber: "٩", month: "أبريل", fullDate: "٩ أبريل ٢٠٢٦" },
];

const MOCK_SLOTS = [
  { id: "09:00", time: "٩:٠٠ ص", available: true },
  { id: "10:00", time: "١٠:٠٠ ص", available: true },
  { id: "11:00", time: "١١:٠٠ ص", available: false },
  { id: "12:00", time: "١٢:٠٠ م", available: true },
  { id: "14:00", time: "٢:٠٠ م", available: true },
  { id: "15:00", time: "٣:٠٠ م", available: false },
  { id: "16:00", time: "٤:٠٠ م", available: true },
  { id: "17:00", time: "٥:٠٠ م", available: true },
];

export default function Step2DateSelection() {
  const { bookingData, updateBookingData, nextStep, prevStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(bookingData.selectedDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(bookingData.selectedTimeSlot);

  const handleNext = () => {
    if (!selectedDate) {
      toast.error("يرجى اختيار التاريخ", { description: "اختر يوماً من الأيام المتاحة للمتابعة." });
      return;
    }
    if (!selectedTimeSlot) {
      toast.error("يرجى اختيار وقت الجلسة", { description: "اختر وقتاً متاحاً من القائمة أدناه للمتابعة." });
      return;
    }
    updateBookingData({ selectedDate, selectedTimeSlot });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* اختيار التاريخ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">اختر التاريخ المناسب</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {MOCK_DATES.map((date) => (
            <Card
              key={date.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDate === date.id ? "ring-2 ring-indigo-600 bg-indigo-50" : ""
              }`}
              onClick={() => {
                setSelectedDate(date.id);
                setSelectedTimeSlot(undefined);
              }}
            >
              <CardContent className="pt-4 pb-4 px-2 text-center">
                <div className="text-xs text-slate-600 mb-1">{date.dayName}</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{date.dayNumber}</div>
                <div className="text-xs text-slate-500">{date.month}</div>
                {selectedDate === date.id && (
                  <CheckCircle className="w-4 h-4 text-indigo-600 mx-auto mt-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* اختيار الوقت */}
      {selectedDate && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">اختر وقت الجلسة</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {MOCK_SLOTS.map((slot) => (
              <Button
                key={slot.id}
                variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => setSelectedTimeSlot(slot.id)}
                className={`h-14 text-base ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {slot.time}
                {!slot.available && <span className="block text-xs mt-1">محجوز</span>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ملخص الاختيار */}
      {selectedDate && selectedTimeSlot && (
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">موعدك المختار</h4>
                <p className="text-sm text-slate-700">
                  {MOCK_DATES.find((d) => d.id === selectedDate)?.fullDate} -{" "}
                  {MOCK_SLOTS.find((t) => t.id === selectedTimeSlot)?.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار التنقل */}
      <div className="flex justify-between gap-3 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={prevStep}>السابق</Button>
        <Button size="lg" onClick={handleNext} disabled={!selectedDate || !selectedTimeSlot}>
          التالي
        </Button>
      </div>
    </div>
  );
}

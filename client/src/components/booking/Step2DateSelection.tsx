import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { Calendar, Clock, CheckCircle } from "lucide-react";

// Mock data للأيام المتاحة
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      id: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('ar-SA', { weekday: 'long' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('ar-SA', { month: 'long' }),
      fullDate: date.toLocaleDateString('ar-SA'),
    });
  }
  return dates;
};

// Mock data للأوقات المتاحة
const getAvailableTimeSlots = (dateId: string) => {
  // في التطبيق الحقيقي، هذه ستأتي من API
  return [
    { id: "1", time: "4:00 م", available: true },
    { id: "2", time: "5:00 م", available: true },
    { id: "3", time: "6:00 م", available: false },
    { id: "4", time: "7:00 م", available: true },
    { id: "5", time: "8:00 م", available: true },
  ];
};

export default function Step2DateSelection() {
  const { bookingData, updateBookingData, nextStep, prevStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    bookingData.selectedDate
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(
    bookingData.selectedTimeSlot
  );

  const availableDates = getAvailableDates();
  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate) : [];

  const handleNext = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("يرجى اختيار التاريخ والوقت");
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
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-900">
            اختر التاريخ المناسب
          </h3>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {availableDates.map((date) => (
            <Card
              key={date.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDate === date.id
                  ? "ring-2 ring-indigo-600 bg-indigo-50"
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
            <h3 className="text-lg font-bold text-slate-900">
              اختر الوقت المناسب
            </h3>
          </div>

          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {timeSlots.map((slot) => (
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
        <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  موعدك المختار
                </h4>
                <p className="text-sm text-slate-700">
                  {availableDates.find((d) => d.id === selectedDate)?.fullDate} -{" "}
                  {timeSlots.find((t) => t.id === selectedTimeSlot)?.time}
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

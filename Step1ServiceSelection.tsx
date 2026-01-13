import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBooking, Specialist, ServiceType } from "@/contexts/BookingContext";
import { Baby, GraduationCap, CheckCircle, Clock, MapPin, Languages } from "lucide-react";

// Mock data للأخصائيين
const mockSpecialists: Specialist[] = [
  {
    id: "1",
    name: "د. سارة أحمد",
    specialty: "أخصائية صعوبات تعلم - أطفال",
    experience: 8,
    country: "السعودية",
    language: "العربية، الإنجليزية",
    nextAvailable: "الأحد 4:00 م"
  },
  {
    id: "2",
    name: "د. محمد الشريف",
    specialty: "أخصائي صعوبات قراءة - جامعة",
    experience: 12,
    country: "مصر",
    language: "العربية، الإنجليزية",
    nextAvailable: "الاثنين 6:00 م"
  },
  {
    id: "3",
    name: "د. نورة العتيبي",
    specialty: "أخصائية تربية خاصة",
    experience: 10,
    country: "السعودية",
    language: "العربية",
    nextAvailable: "الثلاثاء 5:30 م"
  }
];

export default function Step1ServiceSelection() {
  const { bookingData, updateBookingData, nextStep } = useBooking();
  const [selectedService, setSelectedService] = useState<ServiceType | undefined>(
    bookingData.serviceType
  );
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | undefined>(
    bookingData.specialistId
  );
  const [autoAssign, setAutoAssign] = useState(bookingData.autoAssign || false);

  const handleNext = () => {
    if (!selectedService) {
      alert("يرجى اختيار نوع الخدمة");
      return;
    }
    if (!autoAssign && !selectedSpecialist) {
      alert("يرجى اختيار أخصائي أو تفعيل الاختيار التلقائي");
      return;
    }

    updateBookingData({
      serviceType: selectedService,
      specialistId: autoAssign ? undefined : selectedSpecialist,
      autoAssign: autoAssign,
    });
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* اختيار نوع الخدمة */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          اختر نوع الخدمة
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedService === "CHILD"
                ? "ring-2 ring-indigo-600 bg-indigo-50"
                : ""
            }`}
            onClick={() => setSelectedService("CHILD")}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    تشخيص صعوبات القراءة - للأطفال
                  </h4>
                  <p className="text-sm text-slate-600">
                    للأطفال من عمر 5 إلى 18 سنة
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 mt-2">
                    299 ر.س
                  </p>
                </div>
                {selectedService === "CHILD" && (
                  <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedService === "UNIVERSITY"
                ? "ring-2 ring-indigo-600 bg-indigo-50"
                : ""
            }`}
            onClick={() => setSelectedService("UNIVERSITY")}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    تشخيص صعوبات القراءة - طلاب الجامعة
                  </h4>
                  <p className="text-sm text-slate-600">
                    لطلاب الجامعة والدراسات العليا
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 mt-2">
                    349 ر.س
                  </p>
                </div>
                {selectedService === "UNIVERSITY" && (
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* اختيار الأخصائي */}
      {selectedService && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            اختر الأخصائي
          </h3>

          {/* خيار الاختيار التلقائي */}
          <Card
            className={`mb-4 cursor-pointer transition-all hover:shadow-lg ${
              autoAssign ? "ring-2 ring-indigo-600 bg-indigo-50" : ""
            }`}
            onClick={() => {
              setAutoAssign(!autoAssign);
              if (!autoAssign) {
                setSelectedSpecialist(undefined);
              }
            }}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={autoAssign}
                  onChange={() => {}}
                  className="w-5 h-5 text-indigo-600"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">
                    اختيار تلقائي (أقرب موعد متاح)
                  </h4>
                  <p className="text-sm text-slate-600">
                    سنختار لك أفضل أخصائي متاح في أقرب وقت ممكن
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* قائمة الأخصائيين */}
          {!autoAssign && (
            <div className="grid md:grid-cols-2 gap-4">
              {mockSpecialists.map((specialist) => (
                <Card
                  key={specialist.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedSpecialist === specialist.id
                      ? "ring-2 ring-indigo-600 bg-indigo-50"
                      : ""
                  }`}
                  onClick={() => setSelectedSpecialist(specialist.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {specialist.name.split(" ")[1]?.[0] || "د"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">
                          {specialist.name}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {specialist.specialty}
                        </p>
                      </div>
                      {selectedSpecialist === specialist.id && (
                        <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{specialist.experience} سنوات خبرة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{specialist.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        <span>{specialist.language}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-emerald-600 font-medium">
                        ⏰ أقرب موعد: {specialist.nextAvailable}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* أزرار التنقل */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button size="lg" onClick={handleNext}>
          التالي: اختيار الموعد
        </Button>
      </div>
    </div>
  );
}

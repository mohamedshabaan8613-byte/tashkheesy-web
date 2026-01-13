import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookingProvider, useBooking } from "@/contexts/BookingContext";
import StepIndicator from "@/components/booking/StepIndicator";
import Step1ServiceSelection from "@/components/booking/Step1ServiceSelection";
import Step2DateSelection from "@/components/booking/Step2DateSelection";
import Step3DataConfirmation from "@/components/booking/Step3DataConfirmation";
import Step4Confirmation from "@/components/booking/Step4Confirmation";

function BookingContent() {
  const { currentStep } = useBooking();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              احجز موعد تشخيص
            </h1>
            <p className="text-slate-600">
              اتبع الخطوات التالية لإكمال حجز موعدك
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={4} />

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {currentStep === 1 && <Step1ServiceSelection />}
            {currentStep === 2 && <Step2DateSelection />}
            {currentStep === 3 && <Step3DataConfirmation />}
            {currentStep === 4 && <Step4Confirmation />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Booking() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
}

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: "اختيار الخدمة" },
  { number: 2, title: "اختيار الموعد" },
  { number: 3, title: "البيانات والتأكيد" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep > step.number
                    ? "bg-emerald-600 text-white"
                    : currentStep === step.number
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number
                    ? "text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 -mt-8">
                <div
                  className={`h-full rounded transition-all ${
                    currentStep > step.number
                      ? "bg-emerald-600"
                      : "bg-slate-200"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

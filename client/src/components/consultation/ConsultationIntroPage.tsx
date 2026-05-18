import { useContext } from "react";
import { useLocation } from "wouter";
import { ConsultationContext } from "../../contexts/ConsultationContext";

/**
 * ConsultationIntroPage - Entry point for contextual consultation flow
 * 
 * Sprint 3.0 - Contextual Journey Foundation (Epic 1)
 * Displays intent-aware messaging and CTAs based on user's journey context.
 */
export default function ConsultationIntroPage() {
  const context = useContext(ConsultationContext);
  const [, setLocation] = useLocation();

  if (!context) {
    throw new Error(
      "ConsultationIntroPage must be used within ConsultationProvider"
    );
  }

  const { intent } = context;

  // Determine content based on intent (self vs child)
  const isChildIntent = intent === "child";
  const title = isChildIntent
    ? "ابدأ رحلة الفحص لطفلك" // "Begin your child's screening journey"
    : "ابدأ رحلة الفحص الذاتي"; // "Begin your self-screening journey"

  const description = isChildIntent
    ? "دعنا نساعدك في فهم احتياجات طفلك من خلال فحص مخصص وشامل"
    : "استكشف احتياجاتك من خلال فحص مصمم خصيصًا لك";

  const ctaText = "ابدأ الآن"; // "Start Now"

  const handleCTAClick = () => {
    // Navigate to appropriate screening flow based on intent
    // This will be expanded in future sprints with more sophisticated routing
    if (isChildIntent) {
      setLocation("/children");
    } else {
      setLocation("/self-assessment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Journey Steps Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              ما يمكنك توقعه
            </h2>
            <div className="space-y-4">
              <StepItem
                number={1}
                title="فحص مخصص"
                description="إجابات على أسئلة مصممة خصيصًا لحالتك"
              />
              <StepItem
                number={2}
                title="تقييم شامل"
                description="تحليل دقيق لاحتياجاتك الصحية"
              />
              <StepItem
                number={3}
                title="توصيات مبنية على النتائج"
                description="نصائح وخطوات تالية مناسبة لحالتك"
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={handleCTAClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 px-12 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {ctaText}
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="text-center text-sm text-gray-500 mt-8">
            جميع بياناتك محمية وسرية بالكامل
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for journey steps
function StepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-lg mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

/*
 * تشخيصي Home Page — Sprint 1.1
 * تغيير: تفعيل مكوّن TrustSignals بعد HowItWorks مباشرة
 * الترتيب المنطقي: Hero → Awareness → HowItWorks → TrustSignals → FounderStory → WhyTashkheesy → ...
 * المبرر: ولي الأمر يسأل عن الموثوقية قبل أن يرى قصة المؤسس أو لماذا تشخيصي
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AwarenessSection from "@/components/AwarenessSection";
import HowItWorks from "@/components/HowItWorks";
import TrustSignals from "@/components/TrustSignals";
import WhyTashkheesy from "@/components/WhyTashkheesy";
import FounderStory from "@/components/FounderStory";
import ServicesPreview from "@/components/ServicesPreview";
import ImpactSection from "@/components/ImpactSection";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "تشخيصي",
  "alternateName": "Tashkheesy",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "description": "منصة عربية تُقدّم فحصاً أولياً مجانياً لمؤشرات صعوبات التعلم والانتباه — خطوة فهم أولية مدعومة بالذكاء الاصطناعي، ليست تشخيصاً طبياً رسمياً، توجهك نحو الدعم المتخصص المناسب بخطوات واضحة.",
  "url": "https://www.tashkheesy.com",
  "inLanguage": "ar",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "SAR",
    "description": "الفحص الأولي مجاني"
  },
  "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
  "availableLanguage": { "@type": "Language", "name": "Arabic" },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@tashkheesy.sa",
    "availableLanguage": "Arabic"
  },
  "publisher": {
    "@type": "Organization",
    "name": "تشخيصي | Tashkheesy",
    "url": "https://www.tashkheesy.com"
  }
};

export default function Home() {
  useSEO({
    title: "فحص أولي لصعوبات التعلم وفرط الحركة",
    description:
      "تشخيصي (Tashkheesy) منصة عربية سعودية تقدّم فحصاً أولياً مجانياً لمؤشرات صعوبات التعلم وفرط الحركة وتشتت الانتباه، مع تفسير أولي مدعوم بالذكاء الاصطناعي وخطوات أوضح نحو الدعم المتخصص. هذا الفحص لا يُعد تشخيصاً طبياً رسمياً.",
    keywords:
      "تشخيصي, Tashkheesy, صعوبات التعلم, عسر القراءة, فرط الحركة وتشتت الانتباه, فحص أولي, دعم تربوي, السعودية",
    canonical: "/",
    schema: homeSchema,
  });

  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
    >
      <Navbar />
      <HeroSection />
      <AwarenessSection />
      <HowItWorks />
      {/* Sprint 1.1 — مكوّن الثقة والشفافية: يُفعَّل هنا بعد شرح الخطوات مباشرة
           المبرر النفسي: المستخدم فهم «كيف يعمل» → يسأل «هل يمكنني الوثوق به؟» */}
      <TrustSignals />
      <FounderStory />
      <WhyTashkheesy />
      <ServicesPreview />
      <ImpactSection />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

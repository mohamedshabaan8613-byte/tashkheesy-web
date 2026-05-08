/*
 * تشخيصي Home Page — Editorial Healthcare Redesign v2
 * Complete homepage redesign preserving existing routing and product engine
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustRibbon from "@/components/TrustRibbon";
import AwarenessSection from "@/components/AwarenessSection";
import HowItWorks from "@/components/HowItWorks";
import WhyTashkheesy from "@/components/WhyTashkheesy";
import FounderStory from "@/components/FounderStory";
import ServicesPreview from "@/components/ServicesPreview";
import ImpactSection from "@/components/ImpactSection";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

/**
 * homeSchema — بيانات منظمة دقيقة وآمنة
 * النوع: SoftwareApplication (أكثر دقة من MedicalOrganization)
 * تم حذف: priceRange, paymentAccepted, currenciesAccepted (لا يوجد دفع مباشر)
 * تم إصلاح: البريد الإلكتروني → tashkheesy.com
 * تم حذف: logo.png (الملف غير موجود في production)
 */
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
    <div className="min-h-screen" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <Navbar />
      <HeroSection />
      <TrustRibbon />
      <AwarenessSection />
      <HowItWorks />
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

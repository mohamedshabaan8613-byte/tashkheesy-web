/*
 * تشخيصي Home Page — Editorial Healthcare Redesign v2
 * Complete homepage redesign preserving existing routing and product engine
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustRibbon from "@/components/TrustRibbon";
import AwarenessSection from "@/components/AwarenessSection";
import HowItWorks from "@/components/HowItWorks";
import WhyTashkhisi from "@/components/WhyTashkhisi";
import ServicesPreview from "@/components/ServicesPreview";
import ImpactSection from "@/components/ImpactSection";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "تشخيصي",
  "alternateName": "Tashkheesy",
  "description": "منصة رقمية متخصصة في تشخيص صعوبات التعلم والقراءة (الديسلكسيا) للأطفال وطلاب الجامعة في المملكة العربية السعودية",
  "url": "https://tashkheesy-web.vercel.app",
  "logo": "https://tashkheesy-web.vercel.app/logo.png",
  "image": "https://tashkheesy-web.vercel.app/og-image.jpg",
  "priceRange": "299-349 SAR",
  "currenciesAccepted": "SAR",
  "paymentAccepted": "تحويل بنكي, بطاقة ائتمان",
  "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
  "availableLanguage": { "@type": "Language", "name": "Arabic" },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@tashkhisi.com",
    "availableLanguage": "Arabic"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SA",
    "addressLocality": "الرياض",
    "addressRegion": "منطقة الرياض"
  }
};

export default function Home() {
  useSEO({
    title: "تشخيصي — افهم طفلك، ابدأ الفحص مجاناً",
    description:
      "تشخيصي منصة عربية متخصصة تساعدك على فهم صعوبات التعلم والانتباه لدى طفلك أو لنفسك، والوصول إلى الدعم المناسب بخطوات واضحة وبسرية تامة.",
    keywords:
      "تشخيص صعوبات تعلم, ديسلكسيا السعودية, صعوبات القراءة للأطفال, تشخيص أخصائي نفسي, تشخيص تربوي, صعوبات تعلم الرياض",
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
      <WhyTashkhisi />
      <ServicesPreview />
      <ImpactSection />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

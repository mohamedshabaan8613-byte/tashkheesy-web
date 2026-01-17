import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustSignals from "@/components/TrustSignals";
import HowItWorks from "@/components/HowItWorks";
import ServicesPreview from "@/components/ServicesPreview";
import PricingPreview from "@/components/PricingPreview";
import Testimonials from "@/components/Testimonials";
import TeamPreview from "@/components/TeamPreview";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSignals />
        <HowItWorks />
        <ServicesPreview />
        <PricingPreview />
        <TeamPreview />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

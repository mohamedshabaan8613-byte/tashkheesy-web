import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            تواصل معنا
          </h2>
          <p className="text-lg mb-8 opacity-90">
            هل لديك استفسار أو تحتاج إلى مساعدة؟ نحن هنا لدعمك في رحلتك البحثية
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => window.open("https://wa.me/00201006925935", "_blank")}
            >
              <MessageCircle className="w-5 h-5" />
              تواصل عبر واتساب
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.open("tel:00201006925935", "_blank")}
            >
              <Phone className="w-5 h-5" />
              اتصل بنا: 00201006925935
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

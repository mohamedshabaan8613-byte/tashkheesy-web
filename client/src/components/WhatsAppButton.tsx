import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// المسارات التي يُخفى فيها الزر لأن المستخدم في منتصف تدفق تقييم نشط
const HIDDEN_ROUTES = [
  "/screening",
  "/screening-intro",
  "/self-assessment",
  "/choose-self-path",
  "/choose-child-path",
  "/screening-result",
];

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [location] = useLocation();

  // إخفاء الزر إذا كان المسار الحالي ضمن مسارات الفحص النشطة
  const isHidden = HIDDEN_ROUTES.some((route) => location.startsWith(route));
  if (isHidden) return null;

  // رقم WhatsApp من متغير البيئة أو القيمة الافتراضية
  // صيغة دولية بدون + أو 00 (مثال: 966501234567)
  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER || "966534823022";

  // الرسالة الافتراضية
  const defaultMessage = "مرحباً، أرغب في الاستفسار عن خدمات تشخيص صعوبات التعلم";

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    // تتبع النقرة في Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: "floating_whatsapp_button",
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-40">
      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30 pointer-events-none" />
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full shadow-lg shadow-green-200 transition-all duration-300 ease-in-out"
        style={{
          padding: isHovered ? "12px 20px 12px 16px" : "16px",
        }}
        aria-label="تواصل معنا عبر واتساب"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-6 h-6 flex-shrink-0" />
        <span
          className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap font-semibold text-sm"
          style={{
            maxWidth: isHovered ? "200px" : "0px",
            opacity: isHovered ? 1 : 0,
          }}
        >
          تواصل معنا
        </span>
      </button>
    </div>
  );
}

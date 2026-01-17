import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  
  // رقم WhatsApp الخاص بك (استبدله برقمك)
  // يجب أن يكون بصيغة دولية بدون + أو 00
  // مثال: 966501234567 (السعودية)
  const whatsappNumber = "966534823022";
  
  // الرسالة الافتراضية
  const defaultMessage = "مرحباً، أرغب في الاستفسار عن خدمات تشخيص صعوبات التعلم";
  
  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, "_blank");
    
    // تتبع النقرة في Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: "floating_whatsapp_button",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out group"
      style={{
        padding: isHovered ? "12px 20px 12px 16px" : "16px",
      }}
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="w-6 h-6" />
      <span
        className="overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap font-semibold"
        style={{
          maxWidth: isHovered ? "200px" : "0px",
          opacity: isHovered ? 1 : 0,
        }}
      >
        تواصل معنا
      </span>
    </button>
  );
}

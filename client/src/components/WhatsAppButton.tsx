import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

/*
 * تشخيصي WhatsAppButton — Sprint 5: Trust Calibration
 *
 * BEFORE (problems):
 *   - animate-ping pulse ring  → visually links brand to spam/ads
 *   - bg-green-500 full button  → too loud for HealthTech calm tone
 *   - shadow-lg shadow-green-200 → coloured shadow amplifies aggression
 *   - isHovered expand animation → layout shift, unpredictable on touch
 *
 * AFTER (quiet utility link):
 *   - White pill, border-slate-200, shadow-sm
 *   - Green retained ONLY on the icon (recognition without noise)
 *   - No pulse. No expand. No coloured shadow.
 *   - <a> tag instead of <button> (correct semantics for external navigation)
 *
 * Unchanged:
 *   - HIDDEN_ROUTES flow protection
 *   - gtag analytics event
 *   - aria-label accessibility
 *   - VITE_WHATSAPP_NUMBER env var
 */

const HIDDEN_ROUTES = [
  "/screening",
  "/screening-intro",
  "/self-assessment",
  "/choose-self-path",
  "/choose-child-path",
  "/screening-result",
];

export default function WhatsAppButton() {
  const [location] = useLocation();

  const isHidden = HIDDEN_ROUTES.some((route) => location.startsWith(route));
  if (isHidden) return null;

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER || "966534823022";

  const defaultMessage =
    "مرحباً، أرغب في الاستفسار عن خدمات تشخيص صعوبات التعلم";

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "whatsapp_click", {
        event_category: "engagement",
        event_label: "floating_whatsapp_button",
      });
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 left-4 sm:left-6 z-40
                 flex items-center gap-2 px-4 py-2.5
                 bg-white border border-slate-200
                 rounded-full shadow-sm
                 text-sm font-medium text-slate-600
                 hover:text-slate-900 hover:border-slate-300 hover:shadow-md
                 transition-all duration-200"
      aria-label="تواصل معنا عبر واتساب"
      title="تواصل معنا عبر واتساب"
    >
      <MessageCircle size={16} className="text-[#25D366] flex-shrink-0" />
      <span>تحدث معنا</span>
    </a>
  );
}

import { useEffect } from "react";

const BASE_URL = "https://tashkheesy-web.vercel.app";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = "تشخيصي | Tashkheesy";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  schema?: Record<string, unknown>;
}

/**
 * useSEO — hook مخصص لتحديث Meta Tags ديناميكياً لكل صفحة
 * يُحدِّث: title, description, canonical, og:*, twitter:*, schema.org
 */
export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noIndex = false,
  schema,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical
      ? `${BASE_URL}${canonical}`
      : `${BASE_URL}${window.location.pathname}`;

    // ─── Document Title ────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ─── Helper: upsert <meta> tag ─────────────────────────────────────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        // استخراج اسم الـ attribute من الـ selector
        if (selector.includes("name=")) {
          el.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] ?? "");
        } else if (selector.includes("property=")) {
          el.setAttribute(
            "property",
            selector.match(/property="([^"]+)"/)?.[1] ?? ""
          );
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // ─── Helper: upsert <link> tag ─────────────────────────────────────────────
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ─── Standard Meta ─────────────────────────────────────────────────────────
    setMeta('meta[name="description"]', description);
    if (keywords) setMeta('meta[name="keywords"]', keywords);
    setMeta(
      'meta[name="robots"]',
      noIndex ? "noindex, nofollow" : "index, follow"
    );

    // ─── Canonical ─────────────────────────────────────────────────────────────
    setLink("canonical", canonicalUrl);

    // ─── Open Graph ────────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:type"]', ogType);
    setMeta('meta[property="og:site_name"]', SITE_NAME);
    setMeta('meta[property="og:locale"]', "ar_SA");

    // ─── Twitter Card ──────────────────────────────────────────────────────────
    setMeta('meta[property="twitter:card"]', "summary_large_image");
    setMeta('meta[property="twitter:title"]', fullTitle);
    setMeta('meta[property="twitter:description"]', description);
    setMeta('meta[property="twitter:image"]', ogImage);
    setMeta('meta[property="twitter:url"]', canonicalUrl);

    // ─── Schema.org (JSON-LD) ──────────────────────────────────────────────────
    if (schema) {
      const existingScript = document.querySelector(
        'script[type="application/ld+json"][data-page-schema]'
      );
      if (existingScript) existingScript.remove();

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-schema", "true");
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    }

    // ─── Cleanup عند مغادرة الصفحة ────────────────────────────────────────────
    return () => {
      // إعادة العنوان الافتراضي عند الانتقال (اختياري)
      // document.title = SITE_NAME;
    };
  }, [title, description, keywords, canonical, ogImage, ogType, noIndex, schema]);
}

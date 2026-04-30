import { useEffect } from "react";

const BASE_URL = "https://www.tashkheesy.com";
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
 * Normalize internal paths into clean production URLs.
 *
 * Rules:
 * - Always use https://www.tashkheesy.com
 * - Never include query parameters or hash fragments
 * - Homepage keeps trailing slash: /
 * - Other pages remove trailing slash: /faq not /faq/
 */
function buildCleanUrl(pathOrUrl?: string): string {
  let path = pathOrUrl || window.location.pathname || "/";

  // If a full URL is accidentally passed, extract only pathname.
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname;
    }
  } catch {
    path = "/";
  }

  // Remove query strings and hash fragments if accidentally passed.
  path = path.split("?")[0].split("#")[0];

  // Ensure leading slash.
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // Normalize trailing slash.
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return `${BASE_URL}${path}`;
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
    const canonicalUrl = buildCleanUrl(canonical);

    // ─── Document Title ────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ─── Helper: upsert <meta> tag ─────────────────────────────────────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);

      if (!el) {
        el = document.createElement("meta");

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
    setMeta("meta[name=\"description\"]", description);

    if (keywords) {
      setMeta("meta[name=\"keywords\"]", keywords);
    }

    setMeta(
      "meta[name=\"robots\"]",
      noIndex ? "noindex, nofollow" : "index, follow"
    );

    // ─── Canonical ─────────────────────────────────────────────────────────────
    if (!noIndex) {
      setLink("canonical", canonicalUrl);
    }

    // ─── Open Graph ────────────────────────────────────────────────────────────
    setMeta("meta[property=\"og:title\"]", fullTitle);
    setMeta("meta[property=\"og:description\"]", description);
    setMeta("meta[property=\"og:image\"]", ogImage);
    setMeta("meta[property=\"og:url\"]", canonicalUrl);
    setMeta("meta[property=\"og:type\"]", ogType);
    setMeta("meta[property=\"og:site_name\"]", SITE_NAME);
    setMeta("meta[property=\"og:locale\"]", "ar_SA");

    // ─── Twitter Card ──────────────────────────────────────────────────────────
    setMeta("meta[name=\"twitter:card\"]", "summary_large_image");
    setMeta("meta[name=\"twitter:title\"]", fullTitle);
    setMeta("meta[name=\"twitter:description\"]", description);
    setMeta("meta[name=\"twitter:image\"]", ogImage);
    setMeta("meta[name=\"twitter:url\"]", canonicalUrl);

    // ─── Schema.org JSON-LD ────────────────────────────────────────────────────
    if (schema) {
      const existingScript = document.querySelector(
        "script[type=\"application/ld+json\"][data-page-schema]"
      );

      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-schema", "true");
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    }

    return () => {
      // No cleanup required.
    };
  }, [title, description, keywords, canonical, ogImage, ogType, noIndex, schema]);
}

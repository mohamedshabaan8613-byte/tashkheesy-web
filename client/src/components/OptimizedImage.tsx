import { useState } from "react";

interface OptimizedImageProps {
  /** اسم الملف بدون امتداد (مثال: "hero-image") */
  name: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** هل الصورة في الـ viewport الأول؟ إذا نعم اضبطها على "eager" */
  loading?: "lazy" | "eager";
  /** هل هي أهم صورة في الصفحة؟ لتفعيل fetchpriority=high */
  priority?: boolean;
}

/**
 * OptimizedImage — مكوّن صور محسَّن يدعم:
 * - WebP تلقائياً مع JPG كـ fallback للمتصفحات القديمة
 * - Lazy loading للصور خارج الـ viewport
 * - تحديد الأبعاد لتجنب Cumulative Layout Shift (CLS)
 * - حالة خطأ مع fallback نصي
 */
export default function OptimizedImage({
  name,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  priority = false,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const webpSrc = `/images/${name}.webp`;
  const jpgSrc  = `/images/${name}.jpg`;

  if (hasError) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-slate-400 text-sm ${className}`}
        style={{ width, height }}
        aria-label={alt}
        role="img"
      >
        {alt}
      </div>
    );
  }

  return (
    <picture>
      {/* WebP للمتصفحات الحديثة */}
      <source srcSet={webpSrc} type="image/webp" />
      {/* JPG كـ fallback */}
      <img
        src={jpgSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? "eager" : loading}
        decoding={priority ? "sync" : "async"}
        // @ts-ignore — fetchpriority is a valid HTML attribute
        fetchpriority={priority ? "high" : "auto"}
        onError={() => setHasError(true)}
      />
    </picture>
  );
}

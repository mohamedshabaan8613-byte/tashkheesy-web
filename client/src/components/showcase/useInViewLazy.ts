import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, hasEntered].
 * hasEntered becomes true once the element intersects the viewport
 * (with a 200px root-margin lookahead) and stays true permanently.
 */
export function useInViewLazy<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "200px"
) {
  const ref = useRef<T>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasEntered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEntered, rootMargin]);

  return [ref, hasEntered] as const;
}

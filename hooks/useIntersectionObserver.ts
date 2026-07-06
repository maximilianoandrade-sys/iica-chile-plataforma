'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Hook para detectar cuando un elemento entra/sale del viewport
 * usando IntersectionObserver.
 */
export function useIntersectionObserver(
  options?: UseIntersectionObserverOptions
): { ref: React.RefObject<HTMLElement | null>; isVisible: boolean } {
  const { threshold = 0.1, rootMargin = '0px', once = false } = options ?? {};
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsVisible(intersecting);

        if (intersecting && once) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}

"use client";

import { useEffect, useState, useRef } from "react";

interface UseParallaxOptions {
  speed?: number;
  disabled?: boolean;
}

/**
 * Parallax effect hook with performance optimizations
 */
export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, disabled = false } = options;
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;

    let ticking = false;

    const updateParallax = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      
      setOffset(parallax);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId.current = window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [speed, disabled]);

  return { ref, offset };
}


"use client";

import { useEffect, useState } from "react";

/**
 * Hook to track scroll progress (0-100)
 */
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      const totalScrollable = documentHeight - windowHeight;
      const progress = totalScrollable > 0 
        ? Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100))
        : 0;
      
      setScrollProgress(progress);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollProgress(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return scrollProgress;
}


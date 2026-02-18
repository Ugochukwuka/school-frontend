"use client";

import { useState, useEffect } from "react";

export function useResponsive() {
  // Initialize with false to match SSR (server always renders desktop view)
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobile(width < 768);
        setIsTablet(width >= 768 && width < 1024);
      }
    };

    setMounted(true);
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  // Return false during SSR and initial render to prevent hydration mismatch
  return { 
    isMobile: mounted ? isMobile : false, 
    isTablet: mounted ? isTablet : false, 
    isDesktop: mounted ? (!isMobile && !isTablet) : true 
  };
}



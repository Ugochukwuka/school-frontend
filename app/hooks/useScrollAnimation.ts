"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
}

/**
 * Optimized scroll animation hook with Intersection Observer
 * Includes throttling and performance optimizations
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { 
    threshold = 0.1, 
    rootMargin = "0px", 
    triggerOnce = true,
    disabled = false
  } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting) {
        setIsVisible(true);
        hasTriggeredRef.current = true;
        
        if (triggerOnce && ref.current && observerRef.current) {
          observerRef.current.unobserve(ref.current);
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    if (disabled || hasTriggeredRef.current) return;

    // Use requestIdleCallback for better performance
    const initObserver = () => {
      if (typeof window === "undefined" || !ref.current) return;

      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      });

      if (ref.current) {
        observerRef.current.observe(ref.current);
      }
    };

    if ("requestIdleCallback" in window) {
      const idleCallback = window.requestIdleCallback(initObserver, {
        timeout: 2000,
      });
      return () => {
        window.cancelIdleCallback(idleCallback);
        if (observerRef.current && ref.current) {
          observerRef.current.unobserve(ref.current);
        }
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(initObserver, 100);
      return () => {
        clearTimeout(timeoutId);
        if (observerRef.current && ref.current) {
          observerRef.current.unobserve(ref.current);
        }
      };
    }
  }, [threshold, rootMargin, triggerOnce, disabled, handleIntersection]);

  return { ref, isVisible };
}

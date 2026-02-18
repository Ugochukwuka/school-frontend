"use client";

import { useEffect, useState, useRef } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  color?: string;
  delay?: number;
}

/**
 * Animated counter component that counts up from 0 to target value
 */
export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  className = "",
  color = "text-gray-900",
  delay = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3, triggerOnce: true });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible && !hasStarted) {
      // Add delay before starting animation
      const delayTimeout = setTimeout(() => {
        setHasStarted(true);
        startTimeRef.current = Date.now();
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isVisible, hasStarted, delay]);

  useEffect(() => {
    if (!hasStarted || !startTimeRef.current) return;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current!;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (ease-out)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end exactly at the target
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className={`${className} transition-all duration-300`}>
      <span className={`text-4xl sm:text-5xl md:text-6xl font-bold ${color} block`}>
        {prefix}
        {count}
        {suffix}
      </span>
    </div>
  );
}

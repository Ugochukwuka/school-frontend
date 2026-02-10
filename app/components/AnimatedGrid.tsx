"use client";

import { ReactNode, Children, useMemo } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

// Animation types for random selection
type AnimationType = 
  | "fadeInUp" 
  | "fadeInDown" 
  | "slideInLeft" 
  | "slideInRight" 
  | "zoomIn" 
  | "scaleIn"
  | "fadeInScale";

const animationClasses: Record<AnimationType, string> = {
  fadeInUp: "opacity-0 translate-y-8",
  fadeInDown: "opacity-0 -translate-y-8",
  slideInLeft: "opacity-0 translate-x-8",
  slideInRight: "opacity-0 -translate-x-8",
  zoomIn: "opacity-0 scale-95",
  scaleIn: "opacity-0 scale-90",
  fadeInScale: "opacity-0 scale-95",
};

const animationVisibleClasses: Record<AnimationType, string> = {
  fadeInUp: "opacity-100 translate-y-0",
  fadeInDown: "opacity-100 translate-y-0",
  slideInLeft: "opacity-100 translate-x-0",
  slideInRight: "opacity-100 translate-x-0",
  zoomIn: "opacity-100 scale-100",
  scaleIn: "opacity-100 scale-100",
  fadeInScale: "opacity-100 scale-100",
};

export default function AnimatedGrid({
  children,
  className = "",
  staggerDelay = 100,
}: AnimatedGridProps) {
  const { ref, isVisible } = useScrollAnimation({ 
    threshold: 0.05, // Trigger earlier
    rootMargin: "50px" // Start animation before element is fully visible
  });

  // Generate random animations for each child
  const animations = useMemo(() => {
    const childrenArray = Children.toArray(children);
    const animationTypes: AnimationType[] = [
      "fadeInUp",
      "fadeInDown", 
      "slideInLeft",
      "slideInRight",
      "zoomIn",
      "scaleIn",
      "fadeInScale"
    ];
    
    return childrenArray.map((_, index) => {
      // Use index to create pseudo-random but consistent selection
      return animationTypes[index % animationTypes.length];
    });
  }, [children]);

  return (
    <div
      ref={ref}
      className={className}
    >
      {Children.map(children, (child, index) => {
        const animationType = animations[index];
        const hiddenClass = animationClasses[animationType] || animationClasses.fadeInUp;
        const visibleClass = animationVisibleClasses[animationType] || animationVisibleClasses.fadeInUp;
        
        return (
          <div
            key={index}
            className={`transition-all duration-500 ease-out ${
              isVisible ? visibleClass : hiddenClass
            }`}
            style={{
              transitionDelay: isVisible ? `${Math.min(index * staggerDelay, 300)}ms` : "0ms",
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}


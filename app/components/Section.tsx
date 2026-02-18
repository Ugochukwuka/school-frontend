"use client";

import { memo } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  bgColor?: "white" | "gray" | "blue" | "dark";
  id?: string;
}

/**
 * Professional Section component with optimized scroll animations
 */
function Section({
  children,
  className = "",
  title,
  subtitle,
  bgColor = "white",
  id,
}: SectionProps) {
  const { ref, isVisible } = useScrollAnimation({ 
    threshold: 0.1,
    triggerOnce: true 
  });
  
  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    blue: "bg-blue-50",
    dark: "bg-white",
  };

  const sectionId = id || (title ? title.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <section 
      id={sectionId}
      ref={ref}
      className={`py-12 sm:py-16 md:py-20 lg:py-24 ${bgClasses[bgColor]} ${className} transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      aria-labelledby={title ? `section-${sectionId}` : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <header className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex flex-col items-center">
              {title && (
                <h2 
                  id={`section-${sectionId}`}
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${subtitle ? 'mb-4 sm:mb-6 md:mb-8 lg:mb-10' : ''} transition-all duration-500 delay-200 ease-out text-gray-900 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p 
                  className={`text-base sm:text-lg md:text-xl lg:text-2xl font-medium max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl text-center leading-relaxed transition-all duration-500 delay-300 ease-out px-2 sm:px-4 text-gray-900 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </header>
        )}
        <div 
          className={`transition-all duration-500 delay-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export default memo(Section);
"use client";

import { ReactNode } from "react";

interface ColorfulSectionProps {
  children: ReactNode;
  bgColor?: "purple" | "yellow" | "blue" | "pink" | "green";
  title?: string;
  className?: string;
}

/**
 * Colorful section with irregular shapes and vibrant backgrounds
 */
export default function ColorfulSection({
  children,
  bgColor = "purple",
  title,
  className = "",
}: ColorfulSectionProps) {
  const bgClasses = {
    purple: "bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700",
    yellow: "bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500",
    blue: "bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-500",
    pink: "bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600",
    green: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500",
  };

  return (
    <section className={`relative py-16 sm:py-20 md:py-24 overflow-hidden ${bgClasses[bgColor]} ${className}`}>
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      {/* Decorative balloons and shapes */}
      <div className="absolute top-10 left-10 w-16 h-20 bg-red-400 rounded-full opacity-60 transform rotate-12"></div>
      <div className="absolute bottom-20 right-20 w-12 h-16 bg-orange-400 rounded-full opacity-50 transform -rotate-12"></div>
      <div className="absolute top-1/4 right-1/4 w-20 h-20 border-4 border-white/30 rounded-full"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 sm:mb-12 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

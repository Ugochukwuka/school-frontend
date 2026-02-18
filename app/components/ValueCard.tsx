"use client";

import { ReactNode } from "react";

interface ValueCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  bgColor?: string;
}

/**
 * Colorful value card with icon
 */
export default function ValueCard({
  icon,
  title,
  description,
  bgColor = "bg-white",
}: ValueCardProps) {
  return (
    <div className={`${bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-3 sm:mb-4 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

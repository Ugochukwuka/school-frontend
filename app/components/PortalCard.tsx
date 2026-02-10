"use client";

import Link from "next/link";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useState, useMemo } from "react";

interface PortalCardProps {
  href: string;
  title: string;
  description: string;
  icon: string;
  delay?: number;
}

export default function PortalCard({
  href,
  title,
  description,
  icon,
  delay = 0,
}: PortalCardProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate random animation based on title
  const animationType = useMemo(() => {
    const animations = ["fadeInUp", "fadeInDown", "slideInLeft", "slideInRight", "zoomIn", "scaleIn"];
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return animations[hash % animations.length];
  }, [title]);
  
  const getAnimationClasses = () => {
    if (!isVisible) {
      switch (animationType) {
        case "fadeInUp": return "opacity-0 translate-y-8";
        case "fadeInDown": return "opacity-0 -translate-y-8";
        case "slideInLeft": return "opacity-0 translate-x-8";
        case "slideInRight": return "opacity-0 -translate-x-8";
        case "zoomIn": return "opacity-0 scale-95";
        case "scaleIn": return "opacity-0 scale-90";
        default: return "opacity-0 translate-y-8";
      }
    }
    return "opacity-100 translate-y-0 translate-x-0 scale-100";
  };

  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
      <div
        ref={ref}
        className={`bg-white p-6 sm:p-8 rounded-lg text-center transform transition-all duration-500 hover:-translate-y-2 active:translate-y-0 cursor-pointer touch-manipulation ${getAnimationClasses()}`}
        style={{ transitionDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`text-4xl sm:text-5xl md:text-6xl mb-4 transition-transform duration-300 ${
          isHovered ? 'scale-125 rotate-12' : 'scale-100'
        }`}>
          {icon}
        </div>
        <h3 className={`text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 transition-colors duration-300 ${
          isHovered ? 'text-blue-600' : ''
        }`}>
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4">{description}</p>
        <div className={`inline-flex items-center text-blue-600 font-semibold text-sm sm:text-base transition-all duration-300 ${
          isHovered ? 'translate-x-2' : ''
        }`}>
          Login
          <svg 
            className={`w-5 h-5 ml-2 transition-transform duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}


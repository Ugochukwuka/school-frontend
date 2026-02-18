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

  // Custom icon rendering for better styling
  const renderIcon = () => {
    if (title === "Student Portal") {
      return (
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
          </div>
        </div>
      );
    } else if (title === "Parent Portal") {
      return (
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              {/* Family icon - two adults and two children */}
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Adult 1 (left) */}
                <circle cx="6" cy="6" r="2.5" fill="currentColor"/>
                <rect x="4" y="9" width="4" height="5" rx="1" fill="currentColor"/>
                {/* Adult 2 (right) */}
                <circle cx="18" cy="6" r="2.5" fill="currentColor"/>
                <rect x="16" y="9" width="4" height="5" rx="1" fill="currentColor"/>
                {/* Child 1 (left) */}
                <circle cx="6" cy="17" r="1.8" fill="currentColor"/>
                <rect x="4.5" y="19.5" width="3" height="3.5" rx="0.8" fill="currentColor"/>
                {/* Child 2 (right) */}
                <circle cx="18" cy="17" r="1.8" fill="currentColor"/>
                <rect x="16.5" y="19.5" width="3" height="3.5" rx="0.8" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 transition-transform duration-300 ${
        isHovered ? 'scale-125 rotate-12' : 'scale-100'
      }`}>
        {icon}
      </div>
    );
  };

  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-xl">
      <div
        ref={ref}
        className={`bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:translate-y-0 cursor-pointer touch-manipulation border border-gray-700 ${getAnimationClasses()}`}
        style={{ transitionDelay: `${delay}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderIcon()}
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">{description}</p>
        <div className={`inline-flex items-center text-blue-500 hover:text-blue-400 font-semibold text-base sm:text-lg transition-all duration-300 group ${
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
            suppressHydrationWarning
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}


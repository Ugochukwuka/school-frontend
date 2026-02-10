"use client";

import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useState, useMemo } from "react";

interface TestimonialCardProps {
  stars: number;
  text: string;
  author: string;
  role: string;
  initials: string;
  delay?: number;
}

export default function TestimonialCard({
  stars,
  text,
  author,
  role,
  initials,
  delay = 0,
}: TestimonialCardProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate random animation based on author name
  const animationType = useMemo(() => {
    const animations = ["fadeInUp", "fadeInDown", "slideInLeft", "slideInRight", "zoomIn", "scaleIn"];
    const hash = author.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return animations[hash % animations.length];
  }, [author]);
  
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
    <div
      ref={ref}
      className={`bg-white p-5 sm:p-6 rounded-lg transform transition-all duration-500 hover:-translate-y-1 active:translate-y-0 ${getAnimationClasses()}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400 text-xl mr-2">
          {"★".repeat(stars).split("").map((star, i) => (
            <span
              key={i}
              className={`inline-block transition-all duration-300 ${
                isHovered ? 'scale-125 rotate-12' : ''
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {star}
            </span>
          ))}
        </div>
      </div>
      <p className={`text-base text-gray-600 mb-4 italic transition-all duration-300 leading-relaxed ${
        isHovered ? 'text-gray-800' : ''
      }`}>
        "{text}"
      </p>
      <div className="flex items-center">
        <div className={`w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
          isHovered ? 'bg-blue-200 scale-110' : ''
        }`}>
          <span className="text-blue-600 font-semibold text-base">{initials}</span>
        </div>
        <div>
          <h4 className={`text-base font-semibold text-gray-900 transition-colors duration-300 ${
            isHovered ? 'text-blue-600' : ''
          }`}>
            {author}
          </h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}


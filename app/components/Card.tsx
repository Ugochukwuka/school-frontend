"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, memo, useMemo } from "react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { useHomepageDarkMode } from "../lib/useHomepageDarkMode";

interface CardProps {
  title: string;
  description?: string;
  imagePath?: string;
  imageAlt?: string;
  link?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Professional Card component with lazy loading, optimized animations, and accessibility
 */
function Card({
  title,
  description,
  imagePath,
  imageAlt,
  link,
  className = "",
  priority = false,
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Generate a consistent random animation based on title hash
  const animationType = useMemo(() => {
    const animations = ["fadeInUp", "fadeInDown", "slideInLeft", "slideInRight", "zoomIn", "scaleIn"];
    const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return animations[hash % animations.length];
  }, [title]);
  
  const { ref, isVisible } = useScrollAnimation({ 
    threshold: 0.05,
    rootMargin: "50px",
    triggerOnce: true 
  });
  const { isDarkMode } = useHomepageDarkMode();
  
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

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const content = (
    <article
      ref={ref}
      className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-lg overflow-hidden group cursor-pointer transform transition-all duration-500 ease-out hover:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 shadow-md ${getAnimationClasses()} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={link ? "article" : undefined}
      aria-label={link ? `${title} - ${description || "Learn more"}` : title}
    >
      {imagePath && (
        <div className="relative w-full h-48 sm:h-52 md:h-64 overflow-hidden bg-gray-100">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          </div>
          <Image
            src={imagePath}
            alt={imageAlt || title}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={`object-cover transition-transform duration-500 ease-out ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            onError={(e) => {
              console.error("Image failed to load:", imagePath, e);
              // Try to set a fallback or handle error
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            suppressHydrationWarning
            unoptimized={imagePath?.startsWith("http://") || imagePath?.startsWith("https://")}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
        </div>
      )}
      <div className={`${imagePath ? "p-5 sm:p-6" : "p-6 sm:p-8"}`}>
        <h3
          className={`text-lg sm:text-xl font-bold mb-3 transition-colors duration-300 ${
            isDarkMode ? "text-white" : "text-gray-900"
          } ${
            isHovered ? "text-blue-600" : ""
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className={`text-sm sm:text-base leading-relaxed mb-4 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>{description}</p>
        )}
        {link && (
          <div
            className={`mt-4 inline-flex items-center text-blue-600 font-semibold text-sm sm:text-base transition-all duration-300 ${
              isHovered ? "translate-x-2" : ""
            }`}
            aria-hidden="true"
          >
            Learn more
            <svg
              className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              suppressHydrationWarning
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </article>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label={`${title} - ${description || "Learn more"}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default memo(Card);

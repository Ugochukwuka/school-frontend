"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface PlayfulHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * Colorful, playful hero component with gradient backgrounds and side images
 * Inspired by Rainbow Play School design
 */
export default function PlayfulHero({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  imageUrl = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces",
  gradientFrom = "from-purple-600",
  gradientTo = "to-pink-500",
}: PlayfulHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px] overflow-hidden"
      role="region"
      aria-label="Hero section"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
        {/* Decorative background text */}
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          <div className="absolute top-20 left-10 text-[200px] md:text-[300px] font-black text-white leading-none">
            {title.split(" ")[0] || "PLAY"}
          </div>
        </div>
        
        {/* Decorative stars and shapes */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-40 w-3 h-3 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-60 right-60 w-2 h-2 bg-white rounded-full opacity-50 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-40 left-40 w-5 h-5 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        
      </div>

      {/* Content Container - Split Layout: Text Left, Image Right */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 lg:pt-24 lg:pb-0">
        {/* Left Section - Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-12 lg:mb-0 lg:pr-8">
          <div
            className={`max-w-2xl transition-all duration-1000 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight text-white">
              {title}
            </h1>
            
            {subtitle && (
              <div
                className={`mb-4 sm:mb-6 transition-all duration-1000 delay-200 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium">
                  {subtitle}
                </p>
              </div>
            )}

            {description && (
              <div
                className={`mb-6 sm:mb-8 transition-all duration-1000 delay-300 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {ctaText && ctaLink && (
              <div
                className={`transition-all duration-1000 delay-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <Link
                  href={ctaLink}
                  className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 transform shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label={ctaText}
                >
                  {ctaText}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative h-80 lg:h-[450px] xl:h-[500px]">
          <div
            className={`relative w-full max-w-md h-full transition-all duration-1000 delay-400 ease-out ${
              isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8"
            }`}
          >
            {/* Decorative circular elements */}
            <div className="absolute -top-10 -left-10 w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full"></div>
            
            {/* Main Image */}
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20 transform hover:scale-105 transition-transform duration-500">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover object-center"
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Smooth blended separator at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 overflow-hidden pointer-events-none" style={{ filter: 'none', boxShadow: 'none' }}>
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ filter: 'none' }}
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Main smooth wave with gradient */}
          <path
            d="M0,160 Q180,105 360,125 Q540,145 720,115 Q900,85 1080,125 T1200,135 L1200,200 L0,200 Z"
            fill="url(#waveGradient)"
            stroke="none"
            style={{ filter: 'none' }}
          />
        </svg>
      </div>
    </section>
  );
}

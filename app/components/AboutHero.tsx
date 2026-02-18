"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface AboutHeroProps {
  greeting?: string;
  mainTitle: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

/**
 * Creative split-layout Hero component for About page
 * Text on left, beautiful image on right side
 */
export default function AboutHero({
  greeting = "YOUR CHILD CAN BE A GENIUS",
  mainTitle = "FUN & LEARNING",
  ctaText = "ENROLL YOUR CHILD",
  ctaLink = "/admissions",
  imageUrl = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces",
}: AboutHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative w-full min-h-[600px] sm:min-h-[700px] md:min-h-[800px] lg:min-h-[900px] overflow-hidden bg-gradient-to-br from-[#f5f5f0] via-white to-[#fafafa]"
      role="region"
      aria-label="About Us Hero"
    >
      {/* Split Layout: Text Left, Image Right */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-12 lg:py-0">
        {/* Left Section - Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-12 lg:mb-0 lg:pr-8">
          <div className="relative w-full max-w-2xl">
            {/* Decorative background elements */}
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>

            {/* Main Content Container */}
            <div className="relative z-10">
              {/* Greeting Text - Smaller, Light Gray */}
              {greeting && (
                <div
                  className={`mb-3 sm:mb-4 md:mb-6 transition-all duration-1000 ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  }`}
                >
                  <p
                    className="text-xs sm:text-sm md:text-base lg:text-lg font-medium text-gray-500 uppercase tracking-wider"
                    style={{
                      letterSpacing: "0.15em",
                    }}
                  >
                    {greeting}
                  </p>
                </div>
              )}

              {/* Main Title - Large, Bold, Gray */}
              <div
                className={`mb-6 sm:mb-8 md:mb-10 transition-all duration-1000 delay-200 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight">
                  <span className="text-gray-800 block mb-2">
                    {mainTitle.split(" & ")[0] || mainTitle}
                  </span>
                  {mainTitle.includes(" & ") && (
                    <span className="text-teal-600 block">
                      & {mainTitle.split(" & ")[1]}
                    </span>
                  )}
                </h1>
              </div>

              {/* CTA Button - Teal Background */}
              {ctaText && ctaLink && (
                <div
                  className={`transition-all duration-1000 delay-400 ease-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Link
                    href={ctaLink}
                    className="inline-flex items-center bg-white hover:bg-gray-50 active:bg-gray-100 text-black !text-black font-semibold px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 transform shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white group border-2 border-gray-200"
                    style={{ color: '#000000' }}
                    aria-label={ctaText}
                  >
                    <span style={{ color: '#000000' }}>{ctaText}</span>
                    <svg
                      className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: '#000000' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative h-96 lg:h-[600px] xl:h-[700px] pt-16 lg:pt-20">
          <div
            className={`relative w-full max-w-md h-full transition-all duration-1000 delay-400 ease-out ${
              isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-8"
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-24 h-24 md:w-32 md:h-32 bg-teal-300 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-20 h-20 md:w-28 md:h-28 bg-orange-300 rounded-full opacity-30 blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-teal-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>

            {/* Image Container with creative styling */}
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image
                src={imageUrl}
                alt="Child learning and drawing with colorful pencils"
                fill
                className="object-cover object-center"
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-teal-400 rounded-full opacity-80 shadow-lg animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }}></div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-orange-400 rounded-full opacity-80 shadow-lg animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "1s" }}></div>
          </div>
        </div>
      </div>

    </section>
  );
}

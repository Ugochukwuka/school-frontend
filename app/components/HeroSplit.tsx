"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroSplitProps {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  // Images for circular display on the right side
  circularImages?: string[];
}

/**
 * Modern split-layout Hero component with dark left section and light right section
 * Features circular images and curved divider
 */
export default function HeroSplit({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  circularImages = [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=400&fit=crop&crop=faces",
  ],
}: HeroSplitProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden bg-[#2C2C2C]">
      <div className="relative w-full h-full flex flex-col lg:flex-row">
        {/* Left Section - Dark Background */}
        <div className="relative w-full lg:w-1/2 bg-[#2C2C2C] flex items-center justify-center px-6 md:px-8 lg:px-12 py-12 lg:py-0 z-10">
          <div className="relative w-full max-w-2xl">
            {/* Background decorative text */}
            <div className="absolute -left-8 -bottom-8 opacity-10 select-none pointer-events-none z-0">
              <span className="text-[200px] md:text-[300px] font-black text-orange-500 leading-none">
                {title.split(" ")[0] || "Empowering"}
              </span>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Title Section - 2 lines, centered on mobile, left-aligned on desktop */}
              <div
                className={`mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 w-full lg:max-w-fit transition-all duration-1000 ease-out ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.2] tracking-tight">
                  <div 
                    className="text-white animate-slide-in-from-right" 
                    style={{ 
                      animationDelay: "0.1s", 
                      animationFillMode: "both",
                      opacity: isVisible ? 1 : 0
                    }}
                  >
                    Empowering Minds,
                  </div>
                  <div 
                    className="text-white inline-block animate-slide-in-from-right" 
                    style={{ 
                      animationDelay: "0.2s", 
                      animationFillMode: "both",
                      opacity: isVisible ? 1 : 0
                    }}
                  >
                    Shaping{" "}
                    <span className="text-orange-500 relative inline-block">
                      Futures
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 opacity-60 -translate-y-1"></span>
                    </span>
                  </div>
                </h1>
              </div>

              {/* Description Section */}
              {description && (
                <div
                  className={`mb-8 sm:mb-10 md:mb-12 lg:mb-16 w-full transition-all duration-1000 delay-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 px-4 sm:px-0">
                    {description}
                  </p>
                </div>
              )}

              {/* CTA Section */}
              {ctaText && ctaLink && (
                <div
                  className={`w-full lg:w-auto transition-all duration-1000 delay-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Link
                    href={ctaLink}
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white !text-white font-semibold px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg rounded-lg transition-all duration-300 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#2C2C2C] shadow-lg hover:shadow-xl w-full sm:w-auto text-center"
                    style={{ color: '#ffffff' }}
                    aria-label={ctaText}
                  >
                    {ctaText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Dark Background with Images */}
        <div className="relative w-full lg:w-1/2 bg-[#2C2C2C] flex items-center justify-center px-6 md:px-8 lg:px-12 py-12 lg:py-0 overflow-hidden">
          {/* Curved Divider - Creates smooth curve from top center sweeping down to bottom right */}
          <div className="absolute left-0 top-0 w-full h-full z-0 overflow-hidden pointer-events-none">
            <svg
              className="absolute left-0 top-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ height: "100%", width: "100%" }}
            >
              <path
                d="M 0,0 
                   Q 48,5 48,25
                   Q 48,45 55,65
                   Q 65,85 100,100
                   L 100,0 Z"
                fill="#2C2C2C"
                className="lg:block hidden"
              />
              <path
                d="M 0,0 L 100,0 L 100,100 L 0,100 Z"
                fill="#2C2C2C"
                className="lg:hidden"
              />
            </svg>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-8 right-8 md:top-10 md:right-10 w-24 h-24 md:w-32 md:h-32 bg-orange-500 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-30"></div>
          <div className="absolute bottom-16 left-8 md:bottom-20 md:left-10 w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full opacity-40"></div>
          <div className="absolute bottom-1/4 right-1/3 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full opacity-25"></div>

          {/* Circular Images Container - Organized layout matching reference */}
          <div className="relative z-10 w-full h-full flex items-center justify-center py-8 md:py-12">
            <div className="relative w-full max-w-5xl h-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-center justify-items-center px-4">
              {/* Large top-center image with floating animation */}
              <div
                className={`col-span-1 md:col-span-3 md:row-span-1 flex justify-center items-center transition-all duration-1000 delay-300 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                <div className="relative w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden shadow-2xl animate-float-up-down" style={{ animationDelay: "0s", animationDuration: "3s" }}>
                  <Image
                    src={circularImages[0] || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=faces"}
                    alt="Students learning"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, 320px"
                  />
                </div>
              </div>

              {/* Bottom-left image with floating animation */}
              <div
                className={`col-span-1 md:col-start-1 md:row-start-2 flex justify-center items-center transition-all duration-1000 delay-500 ${
                  isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-8 translate-y-8"
                }`}
              >
                <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-xl animate-float-up-down" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}>
                  <Image
                    src={circularImages[1] || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop&crop=faces"}
                    alt="Teacher and student"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, 160px"
                  />
                </div>
              </div>

              {/* Spacer for center column */}
              <div className="hidden md:block col-span-1"></div>

              {/* Bottom-right image with floating animation */}
              <div
                className={`col-span-1 md:col-start-3 md:row-start-2 flex justify-center items-center transition-all duration-1000 delay-700 ${
                  isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-8 translate-y-8"
                }`}
              >
                <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-xl animate-float-up-down" style={{ animationDelay: "1s", animationDuration: "2.8s" }}>
                  <Image
                    src={circularImages[2] || "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=400&fit=crop&crop=faces"}
                    alt="Happy students"
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, 160px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved divider overlay for better separation */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-30 hidden lg:block transform -translate-x-1/2"></div>
    </section>
  );
}

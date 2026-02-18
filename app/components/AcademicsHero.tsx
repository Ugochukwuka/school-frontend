"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AcademicsHeroProps {
  title?: string;
  subtitle?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  studentImage?: string;
}

/**
 * Custom Hero component for Academics page with colorful design
 * Similar to admission page design but adapted for academics
 */
export default function AcademicsHero({
  title = "Academics",
  subtitle = "OPEN FOR",
  features = ["Rigorous Curriculum", "Innovative Teaching", "Outstanding Results"],
  ctaText = "Explore Programs",
  ctaLink = "/courses",
  studentImage = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=800&fit=crop&crop=faces",
}: AcademicsHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative w-full min-h-[500px] sm:min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 30%, #dc2626 50%, #7c3aed 70%, #3b82f6 100%)",
      }}
    >
      {/* Background decorative text */}
      <div className="absolute inset-0 opacity-5 select-none pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-[150px] md:text-[200px] lg:text-[250px] font-black text-white leading-none">
          ACADEMICS
        </div>
        <div className="absolute bottom-20 right-10 text-[100px] md:text-[150px] lg:text-[200px] font-black text-white leading-none">
          LEARNING
        </div>
      </div>

      {/* Decorative gradient shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Scattered decorative stars and dots */}
      <div className="absolute top-32 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
      <div className="absolute top-48 right-1/3 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute bottom-48 right-1/4 w-3 h-3 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
      <div className="absolute bottom-1/3 left-1/4 w-2.5 h-2.5 bg-yellow-200 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }}></div>

      {/* Main content container - Split Layout: Text Left, Image Right */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 h-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-start pt-16 sm:pt-20 md:pt-0 md:items-center">
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-8 lg:gap-12 pt-4 md:pt-0">
          {/* Left Section - Text content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
              }`}
            >
              {/* Main heading */}
              <h1
                className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 transition-all duration-700 delay-100 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
                style={{
                  textShadow: "3px 3px 12px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2)",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.1",
                }}
              >
                {title}
              </h1>

              {/* Sub-heading */}
              {subtitle && (
                <div
                  className={`mb-2 md:mb-3 transition-all duration-700 delay-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  }`}
                >
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
                    {subtitle}{" "}
                    <span className="text-yellow-300 font-bold">2026-2027</span>
                  </span>
                </div>
              )}

              {/* Features with separators */}
              {features && features.length > 0 && (
                <div
                  className={`flex flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-4 mb-6 md:mb-8 text-white text-sm sm:text-base md:text-lg lg:text-xl transition-all duration-700 delay-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {features.map((feature, index) => (
                    <span key={index} className="flex items-center">
                      {feature}
                      {index < features.length - 1 && (
                        <span className="mx-2 md:mx-3 text-white/60">|</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              {ctaText && ctaLink && (
                <div
                  className={`transition-all duration-700 delay-700 ${
                    isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                  }`}
                >
                  <Link
                    href={ctaLink}
                    className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 md:px-10 py-3 md:py-4 text-base md:text-lg rounded-lg transition-all duration-300 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-xl hover:shadow-2xl"
                    aria-label={ctaText}
                  >
                    {ctaText}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Student image with decorative elements */}
          <div className="w-full lg:w-1/2 flex items-center justify-center relative h-96 lg:h-[600px] xl:h-[700px]">
            <div
              className={`relative flex items-center justify-center transition-all duration-1000 delay-400 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Colorful segmented circle graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Large circle segments */}
                <svg
                  className="absolute w-full h-full"
                  viewBox="0 0 400 400"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  {/* Orange segment */}
                  <path
                    d="M 200,200 L 200,0 A 200,200 0 0,1 382.84,50 L 200,200 Z"
                    fill="#f97316"
                    opacity="0.8"
                  />
                  {/* Green segment */}
                  <path
                    d="M 200,200 L 382.84,50 A 200,200 0 0,1 382.84,350 L 200,200 Z"
                    fill="#10b981"
                    opacity="0.8"
                  />
                  {/* Blue segment */}
                  <path
                    d="M 200,200 L 382.84,350 A 200,200 0 0,1 17.16,350 L 200,200 Z"
                    fill="#3b82f6"
                    opacity="0.8"
                  />
                  {/* Pink segment */}
                  <path
                    d="M 200,200 L 17.16,350 A 200,200 0 0,1 17.16,50 L 200,200 Z"
                    fill="#ec4899"
                    opacity="0.8"
                  />
                </svg>
              </div>

              {/* Student image */}
              <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-white/20">
                <Image
                  src={studentImage}
                  alt="Student learning"
                  fill
                  className="object-cover"
                  priority
                  quality={90}
                  sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                  suppressHydrationWarning
                />
              </div>

              {/* Speech bubbles with educational keywords */}
              <div className="absolute top-8 md:top-12 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg relative">
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    Best Quality Education
                  </span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-orange-500"></div>
                </div>
              </div>

              <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20">
                <div className="bg-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg relative">
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    Credibly Impactful
                  </span>
                  <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-purple-600"></div>
                </div>
              </div>

              <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-orange-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg relative">
                  <span className="text-xs md:text-sm font-semibold whitespace-nowrap">
                    Smart Technology
                  </span>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-orange-500"></div>
                </div>
              </div>
            </div>

            {/* Decorative elements - Globe and Rocket */}
            <div className="absolute bottom-8 left-4 md:left-8 z-10 hidden md:block">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 md:right-8 z-10 hidden md:block">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface TestimonialItem {
  id: number;
  text: string;
  author: string;
  role: string;
  initials: string;
}

interface TestimonialsCarouselProps {
  testimonials: TestimonialItem[];
  viewAllLink?: string;
}

/**
 * Enhanced Testimonials Carousel styled like the Parents Testimonials section
 * Features hot pink background, decorative images, and carousel navigation
 */
export default function TestimonialsCarousel({ testimonials, viewAllLink = "/about" }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex >= testimonials.length - 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, testimonials.length - 1));
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, testimonials.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentIndex <= 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  // Auto-scroll effect
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= testimonials.length - 1) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Update transform on index change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const translateX = -(currentIndex * 100);
      scrollContainerRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [currentIndex]);

  if (testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative w-full">
      {/* White Top Section with Jagged Edge */}
      <div className="relative bg-white pb-8">
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16" style={{ filter: 'none', boxShadow: 'none' }}>
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'none' }}
          >
            {/* Main brushstroke path */}
            <path
              d="M0,40 Q180,10 360,25 T720,20 T1080,30 T1440,15 L1440,200 L0,200 Z"
              fill="#F9FAFB"
              stroke="none"
              style={{ filter: 'none' }}
            />
            {/* Secondary brushstroke for depth */}
            <path
              d="M0,50 Q200,20 400,35 T800,25 T1200,40 T1440,25 L1440,200 L0,200 Z"
              fill="#F3F4F6"
              opacity="0.7"
              stroke="none"
              style={{ filter: 'none' }}
            />
            {/* Tertiary brushstroke for texture */}
            <path
              d="M0,35 Q160,5 320,20 T640,15 T960,25 T1280,20 T1440,10 L1440,200 L0,200 Z"
              fill="#E5E7EB"
              opacity="0.5"
              stroke="none"
              style={{ filter: 'none' }}
            />
          </svg>
        </div>
      </div>

      {/* Hot Pink Main Section */}
      <div className="relative bg-gradient-to-br from-pink-500 via-pink-500 to-pink-600 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side - Student Image */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start relative">
              <div className="relative w-48 h-64 sm:w-56 sm:h-72 lg:w-64 lg:h-80 rounded-[3rem] overflow-hidden">
                <Image
                  src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png"
                  alt="Happy student"
                  fill
                  className="object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300 rounded-[3rem]"
                  sizes="(max-width: 1024px) 224px, 256px"
                  priority
                  suppressHydrationWarning
                />
                {/* Decorative wavy line above - Yellow */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-8 opacity-70">
                  <svg viewBox="0 0 128 32" className="w-full h-full" fill="none">
                    <path
                      d="M0,16 Q32,8 64,16 T128,16"
                      stroke="#FCD34D"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Center - Testimonial Content */}
            <div className="lg:col-span-6 text-center lg:text-left">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Parents Testimonials
              </h2>

              {/* Navigation Arrows */}
              <div className="flex justify-center lg:justify-start gap-3 mb-6">
                <button
                  onClick={goToPrevious}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToPrevious();
                    }
                  }}
                  className="bg-pink-300 hover:bg-pink-200 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous testimonial"
                  disabled={isTransitioning || currentIndex === 0}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    suppressHydrationWarning
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToNext();
                    }
                  }}
                  className="bg-gray-300 hover:bg-gray-200 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next testimonial"
                  disabled={isTransitioning || currentIndex >= testimonials.length - 1}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    suppressHydrationWarning
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Testimonial Carousel */}
              <div className="relative overflow-hidden min-h-[200px]">
                <div
                  ref={scrollContainerRef}
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ willChange: "transform" }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="flex-shrink-0 w-full px-4"
                      style={{ minWidth: "100%" }}
                    >
                      {/* Large Quote Icon */}
                      <div className="flex justify-center lg:justify-start mb-4">
                        <div className="text-pink-200 text-7xl sm:text-8xl font-serif leading-none transform hover:scale-110 transition-transform duration-300">
                          "
                        </div>
                      </div>

                      {/* Testimonial Text */}
                      <p className="text-white text-base sm:text-lg leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0 drop-shadow-lg">
                        {testimonial.text}
                      </p>

                      {/* Author Name with Role */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 justify-center lg:justify-start">
                        <p className="text-white font-bold text-lg sm:text-xl">
                          {testimonial.author}
                        </p>
                        <span className="text-pink-200 text-sm sm:text-base">
                          {testimonial.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Indicator */}
              {testimonials.length > 1 && (
                <div className="flex justify-center lg:justify-start gap-2 mt-6" role="tablist" aria-label="Testimonial carousel indicators">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (isTransitioning || index === currentIndex) return;
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentIndex(index);
                          setIsTransitioning(false);
                        }, 150);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!isTransitioning && index !== currentIndex) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentIndex(index);
                              setIsTransitioning(false);
                            }, 150);
                          }
                        }
                      }}
                      className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-500 ${
                        index === currentIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-pink-300 hover:bg-pink-200"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-selected={index === currentIndex}
                      role="tab"
                      disabled={isTransitioning}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Education/Book Image */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end relative">
              <div className="relative w-40 h-48 sm:w-48 sm:h-56 lg:w-56 lg:h-64 rounded-3xl overflow-hidden">
                <Image
                  src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
                  alt="Education and learning"
                  fill
                  className="object-contain drop-shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300 rounded-3xl"
                  sizes="(max-width: 1024px) 192px, 224px"
                  priority
                  suppressHydrationWarning
                />
                {/* Decorative wavy line above - Green */}
                <div className="absolute -top-6 right-0 w-28 h-7 opacity-70">
                  <svg viewBox="0 0 112 28" className="w-full h-full" fill="none">
                    <path
                      d="M0,14 Q28,7 56,14 T112,14"
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

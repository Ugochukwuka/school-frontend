"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParallax } from "../hooks/useParallax";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  imagePath?: string;
  imagePaths?: string[];
  ctaText?: string;
  ctaLink?: string;
  overlay?: boolean;
  simple?: boolean; // If true, shows single image without carousel
  greeting?: string; // Optional greeting text displayed above title
}

/**
 * Professional Hero component with parallax effects, keyboard navigation, and optimized performance
 */
export default function Hero({
  title,
  subtitle,
  description,
  imagePath,
  imagePaths,
  ctaText,
  ctaLink,
  overlay = false,
  simple = false,
  greeting,
}: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { ref: parallaxRef, offset } = useParallax({ speed: 0.3, disabled: false });
  
  // Use imagePaths if provided, otherwise use single imagePath
  // If simple mode, only use first image or single imagePath
  const images = simple
    ? (imagePath ? [imagePath] : (imagePaths && imagePaths.length > 0 ? [imagePaths[0]] : []))
    : (imagePaths && imagePaths.length > 0 
        ? imagePaths 
        : imagePath 
          ? [imagePath] 
          : []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (simple || images.length <= 1) return;
    
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
          setIsTransitioning(false);
        }, 300);
      }, 5000);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  }, [currentIndex, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 150);
  }, [images.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsTransitioning(false);
    }, 150);
  }, [images.length, isTransitioning]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (images.length <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    }
  }, [goToPrevious, goToNext, images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <section
      ref={parallaxRef}
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Hero section"
      style={{ position: 'relative' }}
    >
      {/* Image Carousel */}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              transform: index === currentIndex ? `translateY(${offset * 0.5}px)` : undefined,
            }}
          >
            <Image
              src={img}
              alt={`${title} - Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" style={{ zIndex: 10, pointerEvents: 'none' }} />

      {/* Optional additional overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10 z-10" />
      )}

      {/* Greeting - Centered with random slide-in animation - Above overlay */}
      {greeting && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 sm:px-6 md:px-8 lg:px-12"
          style={{ 
            position: 'absolute',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            visibility: 'visible',
            pointerEvents: 'none'
          }}
        >
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-center max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto animate-slide-in-from-bottom"
            style={{ 
              textShadow: '5px 5px 15px rgba(0, 0, 0, 1), 0 0 40px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 1), -2px -2px 4px rgba(0, 0, 0, 0.8)',
              opacity: 1,
              color: '#FFFFFF',
              fontWeight: 900,
              margin: 0,
              padding: '8px 16px',
              animation: 'slideInFromBottom 1.2s ease-out forwards',
              lineHeight: '1.4',
              willChange: 'transform',
              WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)',
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8))'
            }}
          >
            {greeting}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8" style={{ zIndex: 50 }}>
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl transition-all duration-500 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`text-lg sm:text-xl md:text-2xl text-white mb-3 sm:mb-4 drop-shadow-md transition-all duration-500 delay-300 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
            >
              {subtitle}
            </p>
          )}
          {description && (
            <p
              className={`text-sm sm:text-base md:text-lg text-white mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md transition-all duration-500 delay-500 px-2 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {description}
            </p>
          )}
          {ctaText && ctaLink && (
            <div
              className={`transition-all duration-500 delay-700 ${
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
              }`}
            >
              <Link
                href={ctaLink}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl"
                aria-label={ctaText}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows - only show if multiple images and not simple mode */}
      {!simple && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToPrevious();
              }
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Previous image"
            disabled={isTransitioning}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Next image"
            disabled={isTransitioning}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator - only show if multiple images and not simple mode */}
      {!simple && images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2"
          role="tablist"
          aria-label="Image carousel indicators"
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToSlide(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </section>
  );
}

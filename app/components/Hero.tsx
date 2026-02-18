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
      className="relative w-full h-[550px] md:h-[650px] lg:h-[750px] xl:h-[800px] overflow-hidden"
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
              suppressHydrationWarning
            />
          </div>
        ))}
      </div>

      {/* Modern gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" style={{ zIndex: 10, pointerEvents: 'none' }} />
      
      {/* Decorative gradient accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10" style={{ zIndex: 11, pointerEvents: 'none' }} />

      {/* Optional additional overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10 z-10" />
      )}

      {/* Greeting - Modern styled with gradient text */}
      {greeting && (
        <div 
          className="absolute top-20 sm:top-24 md:top-28 left-1/2 -translate-x-1/2 w-full px-4 sm:px-6 md:px-8 lg:px-12 z-50"
          style={{ 
            pointerEvents: 'none'
          }}
        >
          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center max-w-4xl mx-auto animate-slide-in-from-bottom"
            style={{ 
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(249, 115, 22, 0.5)',
              animation: 'slideInFromBottom 1s ease-out forwards',
              lineHeight: '1.5',
              letterSpacing: '0.05em',
              padding: '8px 16px',
            }}
            suppressHydrationWarning
          >
            {greeting}
          </p>
        </div>
      )}

      {/* Decorative floating elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl animate-pulse z-20" style={{ animationDuration: '3s' }}></div>
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse z-20" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8" style={{ zIndex: 50 }}>
        <div
          className={`text-center max-w-4xl mx-auto transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
            style={{ 
              textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.6), 0 0 60px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
              lineHeight: '1.1'
            }}
          >
            {title.split(' ').length > 1 ? (
              <>
                <span className="inline-block">{title.split(' ').slice(0, -1).join(' ')} </span>
                <span className="inline-block text-orange-400">{title.split(' ').slice(-1)[0]}</span>
              </>
            ) : (
              <span className="inline-block">{title}</span>
            )}
          </h1>
          {subtitle && (
            <p
              className={`text-lg sm:text-xl md:text-2xl lg:text-3xl text-orange-200 font-semibold mb-3 sm:mb-4 drop-shadow-lg transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              }`}
              style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)' }}
            >
              {subtitle}
            </p>
          )}
          {description && (
            <p
              className={`text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md transition-all duration-700 delay-500 px-2 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}
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
                className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-110 transform focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-xl hover:shadow-2xl relative overflow-hidden group"
                aria-label={ctaText}
              >
                <span className="relative z-10 flex items-center">
                  {ctaText}
                  <svg 
                    className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 backdrop-blur-sm"
            aria-label="Previous image"
            disabled={isTransitioning}
          >
            <svg
              className="w-6 h-6"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 backdrop-blur-sm"
            aria-label="Next image"
            disabled={isTransitioning}
          >
            <svg
              className="w-6 h-6"
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
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                index === currentIndex
                  ? "w-10 bg-orange-500 shadow-lg shadow-orange-500/50"
                  : "w-2.5 bg-white/60 hover:bg-white/80"
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

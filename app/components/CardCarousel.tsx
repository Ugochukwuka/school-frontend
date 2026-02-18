"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CarouselCard from "./CarouselCard";

interface CardItem {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  gradientFrom: string;
  gradientTo: string;
}

interface CardCarouselProps {
  cards: CardItem[];
}

/**
 * Horizontal card carousel with navigation arrows
 */
export default function CardCarousel({ cards }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  const getItemsPerView = () => {
    if (typeof window === "undefined") return itemsPerView.desktop;
    if (window.innerWidth >= 1024) return itemsPerView.desktop;
    if (window.innerWidth >= 640) return itemsPerView.tablet;
    return itemsPerView.mobile;
  };

  const maxIndex = Math.max(0, cards.length - getItemsPerView());

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex >= maxIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      setIsTransitioning(false);
    }, 150);
  }, [currentIndex, maxIndex, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentIndex <= 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setIsTransitioning(false);
    }, 150);
  }, [currentIndex, isTransitioning]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 150);
    },
    [currentIndex, isTransitioning]
  );

  // Auto-scroll effect
  useEffect(() => {
    if (cards.length <= getItemsPerView()) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [cards.length, maxIndex]);

  // Update transform on index change
  useEffect(() => {
    if (scrollContainerRef.current && wrapperRef.current) {
      const wrapper = wrapperRef.current;
      const itemsPerViewCount = getItemsPerView();
      const wrapperWidth = wrapper.offsetWidth;
      const cardWidth = wrapperWidth / itemsPerViewCount;
      const gap = window.innerWidth >= 640 ? 24 : 16; // gap-4 (16px) on mobile, gap-6 (24px) on larger screens
      const translateX = -(currentIndex * (cardWidth + gap));
      
      scrollContainerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentIndex]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current && wrapperRef.current) {
        const itemsPerViewCount = getItemsPerView();
        const maxIdx = Math.max(0, cards.length - itemsPerViewCount);
        if (currentIndex > maxIdx) {
          setCurrentIndex(maxIdx);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cards.length, currentIndex]);

  if (cards.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      {cards.length > getItemsPerView() && (
        <>
          <button
            onClick={goToPrevious}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToPrevious();
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous cards"
            disabled={isTransitioning || currentIndex === 0}
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next cards"
            disabled={isTransitioning || currentIndex >= maxIndex}
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

      {/* Cards Container */}
      <div ref={wrapperRef} className="overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
          style={{
            willChange: "transform",
          }}
        >
          {cards.map((card, index) => (
            <CarouselCard
              key={index}
              title={card.title}
              description={card.description}
              imagePath={card.imagePath}
              imageAlt={card.imageAlt}
              gradientFrom={card.gradientFrom}
              gradientTo={card.gradientTo}
            />
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {cards.length > getItemsPerView() && (
        <div
          className="flex justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Card carousel indicators"
        >
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToSlide(index);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-gray-400 hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </div>
  );
}

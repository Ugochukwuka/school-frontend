"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CourseCard from "./CourseCard";

interface CourseItem {
  title: string;
  schedule: string;
  instructorName: string;
  instructorImage?: string;
  price: string;
  imagePath: string;
  imageAlt: string;
}

interface CoursesCarouselProps {
  courses: CourseItem[];
  onAddToCart?: (course: CourseItem) => void;
  showSideArrows?: boolean;
  onNavigationRef?: (nav: { goToNext: () => void; goToPrevious: () => void }) => void;
}

/**
 * Horizontal courses carousel with navigation arrows
 */
export default function CoursesCarousel({ courses, onAddToCart, showSideArrows = true, onNavigationRef }: CoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  };

  const getItemsPerView = () => {
    if (typeof window === "undefined") return itemsPerView.desktop;
    if (window.innerWidth >= 1024) return itemsPerView.desktop;
    if (window.innerWidth >= 640) return itemsPerView.tablet;
    return itemsPerView.mobile;
  };

  const maxIndex = Math.max(0, courses.length - getItemsPerView());

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

  // Update transform on index change
  useEffect(() => {
    if (scrollContainerRef.current && wrapperRef.current) {
      const wrapper = wrapperRef.current;
      const itemsPerViewCount = getItemsPerView();
      const wrapperWidth = wrapper.offsetWidth;
      const cardWidth = wrapperWidth / itemsPerViewCount;
      const gap = window.innerWidth >= 640 ? 16 : 16; // gap-4 = 16px
      const translateX = -(currentIndex * (cardWidth + gap));
      
      scrollContainerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentIndex]);

  // Expose navigation functions to parent
  useEffect(() => {
    if (onNavigationRef) {
      onNavigationRef({
        goToNext,
        goToPrevious,
      });
    }
  }, [goToNext, goToPrevious, onNavigationRef]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current && wrapperRef.current) {
        const itemsPerViewCount = getItemsPerView();
        const maxIdx = Math.max(0, courses.length - itemsPerViewCount);
        if (currentIndex > maxIdx) {
          setCurrentIndex(maxIdx);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [courses.length, currentIndex]);

  if (courses.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Navigation Arrows - Side */}
      {showSideArrows && courses.length > getItemsPerView() && (
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
            aria-label="Previous courses"
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
            aria-label="Next courses"
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

      {/* Courses Container */}
      <div ref={wrapperRef} className="overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{
            willChange: "transform",
          }}
        >
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              title={course.title}
              schedule={course.schedule}
              instructorName={course.instructorName}
              instructorImage={course.instructorImage}
              price={course.price}
              imagePath={course.imagePath}
              imageAlt={course.imageAlt}
              onAddToCart={() => onAddToCart?.(course)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

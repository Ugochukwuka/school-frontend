"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogItem {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  imageAlt?: string;
  date: string;
  author?: string;
  link?: string;
}

interface BlogCarouselProps {
  blogs: BlogItem[];
}

/**
 * Blog carousel component styled like the Latest News section
 * Shows 2 cards side-by-side with navigation arrows
 */
export default function BlogCarousel({ blogs }: BlogCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 2,
  };

  const getItemsPerView = () => {
    if (typeof window === "undefined") return itemsPerView.desktop;
    if (window.innerWidth >= 1024) return itemsPerView.desktop;
    if (window.innerWidth >= 640) return itemsPerView.tablet;
    return itemsPerView.mobile;
  };

  const maxIndex = Math.max(0, blogs.length - getItemsPerView());

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex >= maxIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, maxIndex, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentIndex <= 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  // Update transform on index change
  useEffect(() => {
    if (scrollContainerRef.current && wrapperRef.current) {
      const container = scrollContainerRef.current;
      const firstCard = container.firstElementChild as HTMLElement;
      if (!firstCard) return;
      
      const cardWidth = firstCard.offsetWidth;
      const gap = window.innerWidth >= 640 ? 24 : 16; // gap-4 (16px) on mobile, gap-6 (24px) on larger screens
      const translateX = -(currentIndex * (cardWidth + gap));
      
      container.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentIndex]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current && wrapperRef.current) {
        const itemsPerViewCount = getItemsPerView();
        const maxIdx = Math.max(0, blogs.length - itemsPerViewCount);
        if (currentIndex > maxIdx) {
          setCurrentIndex(maxIdx);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [blogs.length, currentIndex]);

  if (blogs.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
      {/* Navigation Arrows */}
      {blogs.length > getItemsPerView() && (
        <>
          <button
            onClick={goToPrevious}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToPrevious();
              }
            }}
            className="absolute -left-4 sm:-left-6 md:-left-8 lg:-left-10 top-1/2 -translate-y-1/2 z-30 bg-gray-600 hover:bg-gray-700 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous blog posts"
            disabled={isTransitioning || currentIndex === 0}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
            className="absolute -right-4 sm:-right-6 md:-right-8 lg:-right-10 top-1/2 -translate-y-1/2 z-30 bg-gray-600 hover:bg-gray-700 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next blog posts"
            disabled={isTransitioning || currentIndex >= maxIndex}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

      {/* Blog Cards Container */}
      <div ref={wrapperRef} className="overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out"
          style={{
            willChange: "transform",
          }}
        >
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(50%-12px)] lg:w-[calc(50%-12px)] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Image Section */}
                <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-auto flex-shrink-0">
                  <Image
                    src={blog.imagePath}
                    alt={blog.imageAlt || blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, 224px"
                    suppressHydrationWarning
                    unoptimized={blog.imagePath?.startsWith("http://") || blog.imagePath?.startsWith("https://")}
                  />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col justify-between min-h-[180px] sm:min-h-0">
                  <div>
                    {/* Title */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Date with Calendar Icon */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-blue-500">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate">{blog.date}</span>
                    </div>

                    {/* Author Name */}
                    {blog.author && (
                      <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="truncate">By {blog.author}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3">
                      {blog.description}
                    </p>
                  </div>

                  {/* Read More Link */}
                  {blog.link && (
                    <Link
                      href={blog.link}
                      className="text-gray-800 hover:text-gray-900 font-medium text-xs sm:text-sm transition-colors duration-300 inline-flex items-center group mt-auto"
                    >
                      Read More
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
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
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

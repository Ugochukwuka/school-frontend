"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryCarouselProps {
  images: GalleryImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * Gallery carousel component with circular images and navigation
 */
export default function GalleryCarousel({
  images,
  autoPlay = true,
  autoPlayInterval = 4000,
}: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 300);
  }, [images.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 300);
  }, [images.length, isTransitioning]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    },
    [currentIndex, isTransitioning]
  );

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, images.length]);

  if (images.length === 0) return null;

  // Show 4 images at a time (or less if fewer images available)
  const visibleCount = Math.min(4, images.length);
  const visibleImages = [];

  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % images.length;
    visibleImages.push(images[index]);
  }

  return (
    <div className="relative w-full">
      {/* Navigation Buttons */}
      {images.length > visibleCount && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Previous images"
            disabled={isTransitioning}
          >
            <CaretLeftOutlined className="text-lg" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Next images"
            disabled={isTransitioning}
          >
            <CaretRightOutlined className="text-lg" />
          </button>
        </>
      )}

      {/* Gallery Images */}
      <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-10 px-12 sm:px-16 md:px-20">
        {visibleImages.map((image, index) => (
          <div
            key={`${image.src}-${currentIndex + index}`}
            className={`flex-shrink-0 transition-all duration-500 ${
              isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden shadow-xl border-4 border-white hover:border-orange-400 transition-all duration-300 hover:scale-110 cursor-pointer group">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                suppressHydrationWarning
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {images.length > visibleCount && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(images.length / visibleCount) }).map((_, index) => {
            const startIndex = index * visibleCount;
            const isActive =
              currentIndex >= startIndex && currentIndex < startIndex + visibleCount;
            return (
              <button
                key={index}
                onClick={() => goToSlide(startIndex)}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  isActive
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-gray-400 hover:bg-gray-500"
                }`}
                aria-label={`Go to gallery page ${index + 1}`}
                disabled={isTransitioning}
              />
            );
          })}
        </div>
      )}

      {/* View All Link */}
      <div className="text-center mt-8">
        <Link
          href="/gallery"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-base sm:text-lg transition-all duration-300 hover:translate-x-1 group"
        >
          View Full Gallery
          <svg
            className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
    </div>
  );
}

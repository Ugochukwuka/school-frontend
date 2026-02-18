"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface ImageGridProps {
  images: Array<{
    src: string;
    alt: string;
    category?: string;
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function ImageGrid({
  images,
  columns = 3,
  className = "",
}: ImageGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const gridClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Extract category from alt text or use default
  const getCategory = (alt: string, index: number) => {
    if (alt.toLowerCase().includes("campus")) return "Campus";
    if (alt.toLowerCase().includes("sport") || alt.toLowerCase().includes("field")) return "Sports";
    if (alt.toLowerCase().includes("library") || alt.toLowerCase().includes("class")) return "Academics";
    if (alt.toLowerCase().includes("art") || alt.toLowerCase().includes("activity")) return "Activities";
    if (alt.toLowerCase().includes("event") || alt.toLowerCase().includes("celebration")) return "Events";
    const categories = ["Gallery", "Activities", "Events", "Campus", "Academics", "Sports"];
    return categories[index % categories.length];
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {images.map((image, index) => {
        const isHovered = hoveredIndex === index;
        const category = image.category || getCategory(image.alt, index);

        return (
          <div
            key={index}
            className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Image */}
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className={`object-cover transition-all duration-500 ${
                isHovered ? "scale-110 brightness-75" : "scale-100 brightness-100"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Hover Overlay - Teal/Cyan with icon and text */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-teal-500/90 to-cyan-600/90 transition-all duration-500 flex flex-col items-center justify-center ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Icon */}
              <div
                className={`transform transition-all duration-500 ${
                  isHovered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-90 opacity-0"
                }`}
                style={{ transitionDelay: isHovered ? "0.1s" : "0s" }}
              >
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Text */}
              <div
                className={`mt-4 text-center transform transition-all duration-500 ${
                  isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: isHovered ? "0.2s" : "0s" }}
              >
                <p className="text-white text-sm md:text-base font-semibold uppercase tracking-wide">
                  {category}, Photos
                </p>
                <p className="text-white/90 text-xs md:text-sm mt-1 font-medium">
                  View Image
                </p>
              </div>

              {/* Optional: Category Badge */}
              <div
                className={`absolute top-4 left-4 transform transition-all duration-500 ${
                  isHovered ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: isHovered ? "0.3s" : "0s" }}
              >
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                  {category}
                </span>
              </div>
            </div>

            {/* Subtle border on hover */}
            <div
              className={`absolute inset-0 border-2 border-cyan-400/50 rounded-lg transition-all duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useState, useCallback, memo } from "react";

interface CarouselCardProps {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  gradientFrom: string;
  gradientTo: string;
}

/**
 * Colorful Carousel Card component with gradient backgrounds
 */
function CarouselCard({
  title,
  description,
  imagePath,
  imageAlt,
  gradientFrom,
  gradientTo,
}: CarouselCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <article
      className="relative flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] rounded-xl overflow-hidden group cursor-pointer transform transition-all duration-500 ease-out hover:-translate-y-2 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-gray-900 shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={title}
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-opacity duration-500 ${
          isHovered ? "opacity-90" : "opacity-100"
        }`}
        aria-hidden="true"
      />
      
      {/* Image */}
      {imagePath && (
        <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${gradientFrom} ${gradientTo} animate-pulse`} />
          </div>
          <Image
            src={imagePath}
            alt={imageAlt}
            fill
            priority
            loading="eager"
            className={`object-cover transition-transform duration-700 ease-out ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            suppressHydrationWarning
            unoptimized={imagePath?.startsWith("http://") || imagePath?.startsWith("https://")}
          />
          {/* Overlay gradient for better text readability */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-6 sm:p-8 text-white">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-base sm:text-lg leading-relaxed opacity-95">
          {description}
        </p>
      </div>
    </article>
  );
}

export default memo(CarouselCard);

"use client";

import Image from "next/image";
import { useState, useCallback, memo } from "react";

interface CourseCardProps {
  title: string;
  schedule: string;
  instructorName: string;
  instructorImage?: string;
  price: string;
  imagePath: string;
  imageAlt: string;
  onAddToCart?: () => void;
}

/**
 * Course Card component with image, schedule, instructor, and price
 */
function CourseCard({
  title,
  schedule,
  instructorName,
  instructorImage,
  price,
  imagePath,
  imageAlt,
  onAddToCart,
}: CourseCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    }
  }, [onAddToCart]);

  return (
    <article
      className="relative flex-shrink-0 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] rounded-xl overflow-hidden group cursor-pointer transform transition-all duration-500 ease-out hover:-translate-y-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 shadow-2xl bg-gray-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={title}
    >
      {/* Image */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            imageLoaded ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          suppressHydrationWarning
          unoptimized={imagePath?.startsWith("http://") || imagePath?.startsWith("https://")}
        />
        
        {/* Shopping Cart Icon Overlay */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 bg-amber-700 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 z-10"
          aria-label={`Add ${title} to cart`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="relative p-5 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-bold mb-3 transition-colors duration-300 line-clamp-2">
          {title}
        </h3>
        
        {/* Schedule */}
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{schedule}</span>
        </div>

        {/* Instructor */}
        <div className="flex items-center mb-4">
          {instructorImage ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <Image
                src={instructorImage}
                alt={instructorName}
                fill
                className="object-cover"
                sizes="40px"
                suppressHydrationWarning
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {instructorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
          )}
          <span className="text-gray-300 text-sm font-medium">{instructorName}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <span className="text-2xl sm:text-3xl font-bold text-blue-500">{price}</span>
        </div>
      </div>
    </article>
  );
}

export default memo(CourseCard);

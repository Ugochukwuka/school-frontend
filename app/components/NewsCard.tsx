"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, memo } from "react";
import { useHomepageDarkMode } from "../lib/useHomepageDarkMode";

interface NewsCardProps {
  title: string;
  description: string;
  imagePath?: string;
  imageAlt?: string;
  link?: string;
  category?: string;
  date?: string;
  author?: string;
  tags?: string[];
  className?: string;
}

/**
 * Enhanced News Card component styled like the Recent News section
 * Features category tags, metadata, and modern card design
 */
function NewsCard({
  title,
  description,
  imagePath,
  imageAlt,
  link,
  category = "News",
  date,
  author = "Admin",
  tags = [],
  className = "",
}: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isDarkMode } = useHomepageDarkMode();

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Format date
  const formattedDate = date || new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const content = (
    <article
      className={`${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl overflow-hidden group cursor-pointer transform transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 shadow-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={link ? "article" : undefined}
      aria-label={link ? `${title} - ${description}` : title}
    >
      {/* Image Section */}
      {imagePath && (
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-700">
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
          </div>
          <Image
            src={imagePath}
            alt={imageAlt || title}
            fill
            loading="lazy"
            className={`object-cover transition-transform duration-700 ease-out ${
              isHovered ? "scale-110" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            suppressHydrationWarning
            unoptimized={imagePath?.startsWith("http://") || imagePath?.startsWith("https://")}
          />
          
          {/* Category Tag Overlay */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-block bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              {category}
            </span>
          </div>

          {/* Gradient Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 sm:p-6">
        {/* Metadata */}
        <div className={`flex items-center gap-3 mb-3 text-xs sm:text-sm ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}>
          <span>{formattedDate}</span>
          <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>•</span>
          <span>by {author}</span>
          {tags.length > 0 && (
            <>
              <span className="text-orange-500">🔥</span>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{tags.join(", ")}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className={`text-lg sm:text-xl font-bold mb-3 transition-colors duration-300 line-clamp-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          } ${
            isHovered ? "text-orange-500" : ""
          }`}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={`text-sm sm:text-base leading-relaxed mb-4 line-clamp-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {description}
          </p>
        )}

        {/* Read More Link */}
        {link && (
          <div
            className={`mt-4 inline-flex items-center font-medium text-sm transition-all duration-300 ${
              isDarkMode ? "text-gray-300 hover:text-orange-500" : "text-gray-700 hover:text-orange-600"
            } ${
              isHovered ? "translate-x-2" : ""
            }`}
            aria-hidden="true"
          >
            Read
            <svg
              className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                isHovered ? "translate-x-1" : ""
              }`}
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
          </div>
        )}
      </div>
    </article>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-xl"
        aria-label={`${title} - ${description}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default memo(NewsCard);

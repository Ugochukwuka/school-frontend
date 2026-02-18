"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProgramCardProps {
  title: string;
  description: string;
  ageRange: string;
  ageColor: string;
  imageUrl: string;
  link: string;
}

/**
 * Colorful program card with age range badge, matching the curriculum design
 */
export default function ProgramCard({
  title,
  description,
  ageRange,
  ageColor,
  imageUrl,
  link,
}: ProgramCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-200">
      {/* Decorative cloud-like frame effect */}
      <div className="absolute -inset-1 bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 rounded-3xl opacity-20 blur-sm"></div>
      
      <div className="relative">
        {/* Image Section */}
        <div className="relative w-full h-64 sm:h-72 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={`object-cover transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 1024px) 100vw, 33vw"
            suppressHydrationWarning
            unoptimized={imageUrl?.startsWith("http://") || imageUrl?.startsWith("https://")}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 bg-white">
          {/* Age Range Badge - Colorful and prominent */}
          <div className={`inline-block ${ageColor} text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl mb-3 sm:mb-4 text-xs sm:text-sm shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            {ageRange}
          </div>

          {/* Title in Pink - Bold and prominent */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-600 mb-2 sm:mb-3">{title}</h3>

          {/* Description */}
          <p className="text-gray-700 mb-4 sm:mb-5 leading-relaxed text-sm sm:text-base">{description}</p>

          {/* Learn More Link */}
          <Link
            href={link}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 group"
          >
            Learn more
            <svg
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
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
          </Link>
        </div>
      </div>
    </div>
  );
}

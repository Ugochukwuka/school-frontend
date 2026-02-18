"use client";

import { useState, memo } from "react";
import Link from "next/link";

interface FloatingCartProps {
  itemCount?: number;
}

/**
 * Floating shopping cart icon component
 */
function FloatingCart({ itemCount = 0 }: FloatingCartProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ""}`}
    >
      <div className="relative">
        <svg
          className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
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
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </div>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 transition-opacity duration-300 ${
          isHovered ? "opacity-75" : "opacity-50"
        }`}
        aria-hidden="true"
      />
    </Link>
  );
}

export default memo(FloatingCart);

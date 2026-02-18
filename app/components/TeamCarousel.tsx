"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  color: string;
}

interface TeamCarouselProps {
  members: TeamMember[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

/**
 * Modern Team carousel component with colorful backgrounds and smooth animations
 */
export default function TeamCarousel({
  members,
  autoPlay = true,
  autoPlayInterval = 5000,
}: TeamCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<number>>(new Set());

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(members.length / 3));
      setIsTransitioning(false);
    }, 300);
  }, [members.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + Math.ceil(members.length / 3)) % Math.ceil(members.length / 3));
      setIsTransitioning(false);
    }, 300);
  }, [members.length, isTransitioning]);

  useEffect(() => {
    if (!autoPlay || members.length <= 3) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, members.length]);

  if (members.length === 0) return null;

  // Show 3 members at a time
  const visibleMembers = [];
  const startIndex = currentIndex * 3;
  
  for (let i = 0; i < 3 && startIndex + i < members.length; i++) {
    visibleMembers.push(members[startIndex + i]);
  }

  // Fill remaining slots if needed
  while (visibleMembers.length < 3 && members.length > 0) {
    visibleMembers.push(members[visibleMembers.length % members.length]);
  }

  const colorClasses = {
    orange: "bg-gradient-to-br from-orange-200 to-orange-300",
    pink: "bg-gradient-to-br from-pink-200 to-pink-300",
    blue: "bg-gradient-to-br from-blue-200 to-blue-300",
    purple: "bg-gradient-to-br from-purple-200 to-purple-300",
    yellow: "bg-gradient-to-br from-yellow-200 to-yellow-300",
    green: "bg-gradient-to-br from-green-200 to-green-300",
  };

  return (
    <div className="relative w-full team-carousel-wrapper">
      {/* Decorative Kite Illustration */}
      <div className="absolute -top-8 left-8 hidden lg:block z-10">
        <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-60">
          <path
            d="M 60,20 L 80,50 L 60,60 L 40,50 Z"
            fill="#9333ea"
            className="animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <path
            d="M 60,60 Q 50,70 40,80 Q 30,90 20,100"
            stroke="#9333ea"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <circle cx="20" cy="100" r="3" fill="#9333ea" />
        </svg>
      </div>

      {/* Navigation Buttons */}
      {members.length > 3 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 text-pink-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            aria-label="Previous team members"
            disabled={isTransitioning}
          >
            <LeftOutlined className="text-lg" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 text-gray-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Next team members"
            disabled={isTransitioning}
          >
            <RightOutlined className="text-lg" />
          </button>
        </>
      )}

      {/* Team Members Grid */}
      <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-10 px-12 sm:px-16 md:px-20">
        {visibleMembers.map((member, index) => {
          const colorClass = colorClasses[member.color as keyof typeof colorClasses] || colorClasses.orange;
          
          return (
            <div
              key={member.id}
              className={`flex-shrink-0 transition-all duration-500 ${
                isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-center group">
                {/* Circular Image with Colorful Background */}
                <div className="relative mb-4">
                  {/* Irregular colorful background shape */}
                  <div
                    className={`absolute inset-0 ${colorClass} rounded-full transform rotate-12 group-hover:rotate-6 transition-transform duration-500 blur-sm opacity-60`}
                    style={{
                      width: "180px",
                      height: "180px",
                      margin: "0 auto",
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  />
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white group-hover:border-pink-300 transition-all duration-300 group-hover:scale-110 z-10 bg-gray-100">
                    {member.image && !failedImageIds.has(member.id) ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 176px, 192px"
                        unoptimized={member.image.startsWith("/storage/") || member.image.startsWith("/leader_images/")}
                        onError={() => setFailedImageIds((prev) => new Set(prev).add(member.id))}
                      />
                    ) : null}
                    {(!member.image || failedImageIds.has(member.id)) && (
                      <div className={`absolute inset-0 ${colorClass} flex items-center justify-center text-2xl font-bold text-gray-600`}>
                        {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Name and Role */}
                <h3 className="text-lg sm:text-xl font-bold text-pink-600 mb-1 group-hover:text-pink-700 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  {member.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {members.length > 3 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(members.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentIndex && !isTransitioning) {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 300);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                index === currentIndex
                  ? "w-8 bg-pink-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to team page ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
    </div>
  );
}

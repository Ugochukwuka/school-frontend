"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface BenefitItem {
  number: string;
  title: string;
  description: string;
  bgColor: string;
}

interface BenefitsSectionProps {
  title?: string;
  subtitle?: string;
  benefits: BenefitItem[];
  imageUrl?: string;
}

/**
 * Benefits section with two-column layout: features on left, image on right
 * Inspired by the "We're redefining early child care education" design
 */
export default function BenefitsSection({
  title = "Our Benefits",
  subtitle = "What makes us the right choice for your educational journey",
  benefits,
  imageUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
}: BenefitsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 overflow-hidden bg-white">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-200 rounded-full opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-yellow-300 rounded-full opacity-40 blur-2xl translate-x-1/4"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 rounded-full opacity-30 blur-3xl translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-300 rounded-full opacity-20 blur-2xl -translate-x-1/4"></div>

      {/* Purple squiggly lines decoration */}
      <div className="absolute top-10 left-10 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 10,50 Q 30,20 50,50 T 90,50"
            stroke="#9333ea"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 10,70 Q 30,40 50,70 T 90,70"
            stroke="#9333ea"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            {title}
          </h2>
          {subtitle && (
            <div className="flex justify-center">
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl text-center">
                {subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Benefits List */}
          <div className="space-y-4 sm:space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-4 sm:p-6 shadow-lg transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Numbered badge */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-lg ${
                      benefit.bgColor || "bg-blue-400"
                    }`}
                  >
                    {benefit.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-pink-600 mb-1 sm:mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-700 text-xs sm:text-sm lg:text-base leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Classroom Image */}
          <div className="relative">
            <div
              className={`relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 delay-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {/* Decorative cloud-like shape around image */}
              <div className="absolute -inset-4 bg-white rounded-3xl shadow-xl"></div>
              <div className="relative z-10 w-full h-full">
                <Image
                  src={imageUrl}
                  alt="Students in classroom"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  suppressHydrationWarning
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Decorative yellow circle */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-300 rounded-full opacity-60 blur-xl hidden lg:block"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-300 rounded-full opacity-40 blur-xl hidden lg:block"></div>
          </div>
        </div>

        {/* Decorative pencil at bottom */}
        <div className="absolute bottom-0 right-8 w-16 h-16 opacity-30 hidden lg:block">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 20,80 L 30,70 L 70,30 L 80,20 L 90,30 L 70,50 L 50,70 L 30,90 Z"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

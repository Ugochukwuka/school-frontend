"use client";

import Image from "next/image";

interface ActiveLearningItem {
  id: number;
  number: string;
  title: string;
  description: string;
  iconColor: string;
}

interface RedefiningEducationProps {
  title: string;
  activeLearningItems: ActiveLearningItem[];
  mainImagePath: string;
  mainImageAlt: string;
}

/**
 * Redefining Education section with numbered active learning blocks
 */
export default function RedefiningEducation({
  title,
  activeLearningItems,
  mainImagePath,
  mainImageAlt,
}: RedefiningEducationProps) {
  return (
    <div className="w-full mt-16 sm:mt-20 relative">
      {/* Decorative yellow curved shape */}
      <div className="absolute -left-20 top-0 w-96 h-96 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
        {/* Left Side - Title and Active Learning Blocks */}
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8 sm:mb-12">
            {title}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {activeLearningItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Number Icon */}
                <div className={`w-16 h-16 ${item.iconColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {item.number}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-pink-600 mb-3">
                  {item.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Side - Main Image */}
        <div className="relative">
          <div className="relative w-full h-96 sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={mainImagePath}
              alt={mainImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              suppressHydrationWarning
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300 rounded-full opacity-80 blur-sm"></div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-60 blur-md border-4 border-blue-100"></div>
        </div>
      </div>
    </div>
  );
}

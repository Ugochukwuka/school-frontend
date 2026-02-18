"use client";

import Image from "next/image";

interface ClassItem {
  id: number;
  name: string;
  ageRange: string;
  ageColor: string;
  nameColor: string;
  description: string;
  imagePath: string;
  imageAlt: string;
}

interface PopularClassesProps {
  classes: ClassItem[];
}

/**
 * Popular Classes component - Colorful class cards with age ranges
 */
export default function PopularClasses({ classes }: PopularClassesProps) {
  return (
    <div className="w-full relative">
      {/* Decorative curved shape at top */}
      <div className="absolute -top-8 left-0 w-32 h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
      
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8 sm:mb-12 relative z-10">
        Popular Classes
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            {/* Image */}
            <div className="relative w-full h-48 sm:h-56 overflow-hidden rounded-t-2xl">
              <Image
                src={classItem.imagePath}
                alt={classItem.imageAlt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                suppressHydrationWarning
              />
            </div>
            
            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Age Label */}
              <div className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white mb-3 ${classItem.ageColor}`}>
                {classItem.ageRange}
              </div>
              
              {/* Class Name */}
              <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${classItem.nameColor}`}>
                {classItem.name}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {classItem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

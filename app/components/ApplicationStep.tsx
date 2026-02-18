"use client";

interface ApplicationStepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

/**
 * Application step component with blue circular number badge
 */
export default function ApplicationStep({
  number,
  title,
  description,
  isLast = false,
}: ApplicationStepProps) {
  return (
    <div className="relative pb-8">
      <div className="flex items-start">
        {/* Number Circle */}
        <div className="flex-shrink-0 relative z-10">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white">
            {number}
          </div>
        </div>

        {/* Content */}
        <div className="ml-6 flex-1 pt-1">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Connecting Line (if not last) */}
      {!isLast && (
        <div className="absolute left-8 top-16 w-1 h-full bg-gradient-to-b from-blue-300 to-blue-100"></div>
      )}
    </div>
  );
}

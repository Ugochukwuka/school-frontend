"use client";

import { useScrollProgress } from "../hooks/useScrollProgress";

/**
 * Scroll progress indicator component
 */
export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}


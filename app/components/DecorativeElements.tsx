"use client";

/**
 * Decorative elements like kites, balloons, stars for playful design
 */
export default function DecorativeElements() {
  return (
    <>
      {/* Kite */}
      <div className="absolute top-20 left-10 w-24 h-24 opacity-60 z-0 hidden lg:block">
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          <polygon points="50,10 80,50 50,70 20,50" fill="#ef4444" />
          <polygon points="50,10 65,30 50,40 35,30" fill="#fbbf24" />
          <polygon points="50,40 65,50 50,60 35,50" fill="#3b82f6" />
          <polygon points="50,60 65,60 50,70 35,60" fill="#10b981" />
          <line x1="50" y1="70" x2="30" y2="90" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>
      
      {/* Balloon */}
      <div className="absolute top-40 right-20 w-16 h-20 opacity-50 z-0 hidden lg:block">
        <div className="w-full h-4/5 bg-orange-400 rounded-full"></div>
        <div className="w-1 h-1/5 bg-gray-400 mx-auto"></div>
      </div>
      
      {/* Stars */}
      <div className="absolute top-60 left-1/4 text-2xl opacity-40 z-0 hidden lg:block">⭐</div>
      <div className="absolute bottom-40 right-1/4 text-xl opacity-30 z-0 hidden lg:block">✨</div>
    </>
  );
}

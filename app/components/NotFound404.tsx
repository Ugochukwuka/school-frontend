"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Fancy 404 Not Found page component with enhanced animations and styling
 */
export default function NotFound404() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [starPositions, setStarPositions] = useState<Array<{ top: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Generate star positions only on client side to avoid hydration mismatch
    const stars = Array.from({ length: 20 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
    }));
    setStarPositions(stars);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div 
          className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"
          style={{
            top: `${mousePosition.y}%`,
            left: `${mousePosition.x}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-out',
          }}
        ></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Decorative stars */}
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        {/* Large 404 Text */}
        <div
          className={`text-center mb-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <h1 className="text-9xl sm:text-[12rem] md:text-[15rem] lg:text-[18rem] font-black text-white leading-none relative">
            <span className="inline-block transform hover:scale-110 transition-transform duration-300" style={{ textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)" }}>
              4
            </span>
            <span className="inline-block transform hover:scale-110 transition-transform duration-300 mx-2" style={{ textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)" }}>
              0
            </span>
            <span className="inline-block transform hover:scale-110 transition-transform duration-300" style={{ textShadow: "0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.3)" }}>
              4
            </span>
          </h1>
        </div>

        {/* Error Message Card */}
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full mb-8 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center">
            {/* Icon Circle */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group hover:scale-125 hover:rotate-12 transition-all duration-500 shadow-lg shadow-pink-500/50">
              <span className="text-5xl">🔍</span>
              {/* Pulsing ring effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500 animate-ping"></div>
              {/* Rotating gradient ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 opacity-0 group-hover:opacity-40 transition-opacity duration-500 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative group">
              Page Not Found
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-500"></span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              We're sorry for the inconvenience! The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform group"
              >
                <span>Back to Home</span>
                <svg
                  className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  suppressHydrationWarning
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-xl transform"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl w-full transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {[
            { href: "/", label: "Home", icon: "🏠" },
            { href: "/academics", label: "Academics", icon: "📚" },
            { href: "/facilities", label: "Facilities", icon: "🏛️" },
            { href: "/contact", label: "Contact", icon: "📧" },
          ].map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-2xl group"
            >
              <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {link.icon}
              </div>
              <div className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                {link.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Decorative Character/Illustration */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative w-full h-64 overflow-hidden" style={{ filter: 'none', boxShadow: 'none' }}>
            {/* White cloud wave at bottom */}
            <svg
              viewBox="0 0 1440 320"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'none' }}
            >
              <path
                d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,400L1392,400C1344,400,1248,400,1152,400C1056,400,960,400,864,400C768,400,672,400,576,400C480,400,384,400,288,400C192,400,96,400,48,400L0,400Z"
                fill="white"
                opacity="0.9"
                stroke="none"
                style={{ filter: 'none' }}
              />
            </svg>
            
            {/* Character illustration area - can add an image here */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-2xl animate-bounce" style={{ animationDuration: "2s" }}>
                  😊
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

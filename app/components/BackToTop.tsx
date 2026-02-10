"use client";

import { useState, useEffect } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";

/**
 * Back to Top button component with smooth scroll
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <ArrowUpOutlined className="text-lg md:text-xl" />
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";

export function useHomepageDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("homepage-dark-mode");
      if (savedTheme === "true") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setMounted(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("homepage-dark-mode", newMode.toString());
      if (newMode) {
        document.documentElement.classList.add("dark");
        document.body.classList.remove("bg-white");
        document.body.classList.add("bg-gray-900");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("bg-gray-900");
        document.body.classList.add("bg-white");
      }
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("theme-change"));
    }
  };

  return { isDarkMode, toggleDarkMode, mounted };
}

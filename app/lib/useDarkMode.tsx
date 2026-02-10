"use client";

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("dashboard-dark-mode");
      if (savedTheme === "true") {
        setIsDarkMode(true);
      }
      setMounted(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-dark-mode", newMode.toString());
    }
  };

  return { isDarkMode, toggleDarkMode, mounted };
}

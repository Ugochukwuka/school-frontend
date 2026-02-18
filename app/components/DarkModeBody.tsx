"use client";

import { useEffect } from "react";

export default function DarkModeBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Force white background - remove any dark mode classes
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-gray-900");
      document.body.classList.add("bg-white");
      document.body.style.backgroundColor = "#ffffff";
      document.documentElement.style.backgroundColor = "#ffffff";
      
      // Clear any dark mode preferences from localStorage
      localStorage.removeItem("homepage-dark-mode");
    }
  }, []);

  return <>{children}</>;
}

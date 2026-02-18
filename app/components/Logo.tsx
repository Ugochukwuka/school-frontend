"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { BookOutlined } from "@ant-design/icons";

interface LogoProps {
  width?: number;
  height?: number;
  showFallback?: boolean;
  className?: string;
  logoPath?: string | null;
}

export default function Logo({ width = 40, height = 40, showFallback = true, className = "", logoPath }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [logoPath]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine the image source - use logoPath from DB if available, otherwise fallback to default
  const getImageSrc = () => {
    if (logoPath) {
      // Already a full URL - use as is
      if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
        return logoPath;
      }
      // Local public path
      if (logoPath.startsWith("/") || logoPath.startsWith("public/")) {
        return logoPath.startsWith("public/") ? logoPath.replace(/^public\//, "/") : logoPath;
      }
      // Backend storage path (e.g. school_settings/xyz.png) - use same-origin proxy for reliable loading in dashboard
      const cleanPath = logoPath.replace(/^storage\//, "");
      return `/storage/${cleanPath}`;
    }
    return "/render.png";
  };

  const imageSrc = getImageSrc();

  if (imageError && showFallback) {
    return (
      <div
        className={className}
        suppressHydrationWarning
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: width,
          height: height,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
        }}
      >
        <BookOutlined style={{ fontSize: width * 0.5, color: "#fff" }} />
      </div>
    );
  }

  return (
    <div
      className={`${className} inline-flex items-center justify-center`}
      suppressHydrationWarning
      style={{
        position: "relative",
        width: className ? undefined : width,
        height: className ? undefined : height,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Image
        src={imageSrc}
        alt="School Logo"
        width={width}
        height={height}
        suppressHydrationWarning
        className={className ? "w-full h-full" : ""}
        style={className ? {} : {
          objectFit: "contain",
          background: "transparent",
        }}
        unoptimized
        onError={handleImageError}
        priority={width > 60} // Priority for larger logos (like login page)
      />
    </div>
  );
}


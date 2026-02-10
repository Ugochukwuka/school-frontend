"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOutlined } from "@ant-design/icons";

interface LogoProps {
  width?: number;
  height?: number;
  showFallback?: boolean;
  className?: string;
}

export default function Logo({ width = 40, height = 40, showFallback = true, className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

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
      className={className}
      suppressHydrationWarning
      style={{
        position: "relative",
        width: width,
        height: height,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/render.png"
        alt="School Logo"
        width={width}
        height={height}
        style={{
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


"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <div className="flex justify-end items-end mt-6">
      <div className="text-center">
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center mb-2 bg-white relative overflow-hidden" 
          style={{ 
            minWidth: '128px', 
            minHeight: '128px',
            border: '2px solid #000',
            opacity: 0.7
          }}
        >
          <Image
            src="/stamp.jpg"
            alt="School Stamp"
            width={128}
            height={128}
            className="rounded-full object-contain"
            style={{ opacity: 0.8 }}
            unoptimized
          />
        </div>
        <p className="text-xs font-semibold" style={{ fontSize: '10px', color: '#000' }}>
          SPLENDID SPRING DEMONSTRATION SCHOOLS OSUBI
        </p>
      </div>
    </div>
  );
}

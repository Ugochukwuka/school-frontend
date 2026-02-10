"use client";

import Image from "next/image";
import Logo from "@/app/components/Logo";

interface ReportHeaderProps {
  schoolName?: string;
  schoolAddress?: string;
  motto?: string;
  termName?: string;
}

export default function ReportHeader({
  schoolName = "SPLENDID SPRING DEMONSTRATION SCHOOLS",
  schoolAddress = "CATHOLIC MISSION ROAD, OFFIKAKA STREET, OSUBI",
  motto = "MOTTO: GREAT FUTURE BEGINS HERE",
  termName = "FIRST TERM ASSESSMENT REPORT",
}: ReportHeaderProps) {
  return (
    <div className="mb-4" style={{ color: '#000' }}>
      {/* Header Block: Logo on left, text centered */}
      <div className="flex items-start gap-4 mb-3">
        {/* Logo - Top Left, Small */}
        <div className="flex-shrink-0">
          <Logo width={60} height={60} />
        </div>
        
        {/* Text Block - Centered */}
        <div className="flex-1 text-center">
          {/* School Name - Bold, Uppercase, Larger */}
          <h1 
            className="font-bold uppercase mb-0.5" 
            style={{ 
              fontSize: '18px', 
              letterSpacing: '0.5px', 
              color: '#000', 
              fontWeight: 'bold',
              lineHeight: '1.2'
            }}
          >
            {schoolName}
          </h1>
          
          {/* School Address - Smaller, Uppercase */}
          <p 
            className="mb-0.5" 
            style={{ 
              fontSize: '11px', 
              color: '#000',
              lineHeight: '1.2',
              textTransform: 'uppercase'
            }}
          >
            {schoolAddress}
          </p>
          
          {/* Motto - Smaller, Uppercase */}
          <p 
            className="font-semibold" 
            style={{ 
              fontSize: '11px', 
              color: '#000',
              lineHeight: '1.2',
              textTransform: 'uppercase'
            }}
          >
            {motto}
          </p>
        </div>
      </div>
      
      {/* Dark Horizontal Divider Line */}
      <div className="border-t border-black mb-2" style={{ borderWidth: '1px', borderColor: '#000' }}></div>
      
      {/* Term Title - Centered */}
      <h2 
        className="text-center font-bold uppercase py-1.5 border-b-2 border-black" 
        style={{ 
          fontSize: '16px', 
          letterSpacing: '0.5px', 
          color: '#000', 
          fontWeight: 'bold',
          borderColor: '#000'
        }}
      >
        {termName}
      </h2>
    </div>
  );
}

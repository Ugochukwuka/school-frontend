"use client";

import { useEffect, useState, useRef } from "react";
import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import AboutHero from "@/app/components/AboutHero";
import Section from "./../components/Section";
import TeamCarousel from "./../components/TeamCarousel";
import Image from "next/image";
import api from "@/app/lib/api";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  color: string;
}

function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats: StatItem[] = [
    { value: 28, suffix: "+", label: "Years of Excellence", icon: "🎓", color: "from-blue-500 to-blue-700" },
    { value: 2000, suffix: "+", label: "Active Students", icon: "👥", color: "from-purple-500 to-purple-700" },
    { value: 150, suffix: "+", label: "Qualified Teachers", icon: "👨‍🏫", color: "from-green-500 to-green-700" },
    { value: 95, suffix: "%", label: "University Acceptance", icon: "🏆", color: "from-orange-500 to-orange-700" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} isVisible={isVisible} delay={index * 100} />
      ))}
    </div>
  );
}

interface ResultStatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const ResultsStatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats: ResultStatItem[] = [
    { 
      value: 98, 
      suffix: "%", 
      label: "Pass Rate", 
      description: "Consistent high performance in national examinations" 
    },
    { 
      value: 85, 
      suffix: "%", 
      label: "Distinction Rate", 
      description: "Students achieving top grades annually" 
    },
    { 
      value: 150, 
      suffix: "+", 
      label: "Scholarships", 
      description: "Merit-based scholarships awarded each year" 
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto relative z-10">
        {stats.map((stat, index) => (
          <ResultStatCard key={index} stat={stat} isVisible={isVisible} delay={index * 150} />
        ))}
      </div>
    </div>
  );
};

function ResultStatCard({ stat, isVisible, delay }: { stat: ResultStatItem; isVisible: boolean; delay: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get color scheme based on stat label
  const getColorScheme = () => {
    if (stat.label.toLowerCase().includes("pass")) {
      return {
        gradient: "from-green-500 to-emerald-600",
        bgGradient: "from-green-50 to-emerald-50",
        textColor: "text-green-600",
        icon: "📈",
        borderColor: "border-green-200",
      };
    } else if (stat.label.toLowerCase().includes("distinction")) {
      return {
        gradient: "from-blue-500 to-indigo-600",
        bgGradient: "from-blue-50 to-indigo-50",
        textColor: "text-blue-600",
        icon: "⭐",
        borderColor: "border-blue-200",
      };
    } else {
      return {
        gradient: "from-orange-500 to-amber-600",
        bgGradient: "from-orange-50 to-amber-50",
        textColor: "text-orange-600",
        icon: "🎓",
        borderColor: "border-orange-200",
      };
    }
  };

  const colors = getColorScheme();

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const duration = 2500; // 2.5 seconds
    const steps = 100;
    const increment = stat.value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    const timer = setTimeout(() => {
      intervalId = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          const newCount = Math.min(Math.round(increment * currentStep), stat.value);
          setCount(newCount);
        } else {
          setCount(stat.value);
          setHasAnimated(true);
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      }, stepDuration);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible, stat.value, hasAnimated, delay]);

  return (
    <div
      className={`
        group relative bg-white rounded-2xl p-8 shadow-lg text-center
        transform transition-all duration-700 ease-out
        hover:shadow-2xl hover:-translate-y-3 hover:scale-105
        border-2 ${colors.borderColor} hover:border-transparent
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}
        overflow-hidden
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background on hover */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${colors.bgGradient}
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `}
      />

      {/* Decorative corner accent */}
      <div
        className={`
          absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient}
          opacity-0 group-hover:opacity-10 transition-opacity duration-500
          transform translate-x-8 -translate-y-8 rotate-45
        `}
      />

      {/* Icon */}
      <div
        className={`
          relative text-5xl mb-4 transform transition-all duration-500
          ${isHovered ? "scale-125 rotate-12" : "scale-100"}
        `}
        style={{ transitionDelay: `${delay + 100}ms` }}
      >
        {colors.icon}
      </div>

      {/* Number with animation and gradient */}
      <div
        className={`
          relative text-6xl font-bold mb-4 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent
          transition-all duration-300
          ${isVisible ? "scale-100" : "scale-50"}
          ${isHovered ? "scale-110" : "scale-100"}
        `}
        style={{ transitionDelay: `${delay + 200}ms` }}
      >
        {count}{stat.suffix}
      </div>
      
      {/* Label */}
      <h4
        className={`
          relative text-xl font-bold text-gray-900 mb-3
          transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          ${isHovered ? "text-gray-800" : "text-gray-900"}
        `}
        style={{ transitionDelay: `${delay + 400}ms` }}
      >
        {stat.label}
      </h4>
      
      {/* Description */}
      <p
        className={`
          relative text-sm text-gray-600 leading-relaxed
          transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{ transitionDelay: `${delay + 600}ms` }}
      >
        {stat.description}
      </p>

      {/* Bottom gradient line */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left
        `}
      />

      {/* Decorative dots */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-gray-300 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-4 right-4 w-2 h-2 bg-gray-300 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

interface Leader {
  id: number;
  name: string;
  position: string;
  photo_path: string;
  bio: string;
  created_at?: string;
  updated_at?: string;
}

function LeadershipTeamCarousel() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const response = await api.get<Leader[] | { data: Leader[] }>("/viewAllLeaders");
      let leadersData: Leader[] = [];
      if (Array.isArray(response.data)) {
        leadersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        leadersData = response.data.data;
      }
      setLeaders(leadersData);
    } catch (err: any) {
      // Handle errors gracefully for public pages
      if (err.response?.status === 401) {
        setLeaders([]);
      } else {
        setLeaders([]);
        if (process.env.NODE_ENV === "development") {
          console.warn("Leadership team could not be loaded:", err.message || "Unknown error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (memberId: number) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading leadership team...</div>
      </div>
    );
  }

  // If no leaders, use placeholder data
  const teamMembers = leaders.length > 0
    ? leaders.map((leader, index) => {
        const imagePath = leader.photo_path.startsWith("/")
          ? leader.photo_path
          : `/${leader.photo_path}`;
        
        // Construct full URL if needed
        let fullImageUrl = imagePath;
        if (!imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
          // Remove leading slash if present to avoid double slashes
          const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
          // Ensure no double slashes
          fullImageUrl = `${backendUrl.replace(/\/$/, "")}/${cleanPath.replace(/^\//, "")}`;
        }
        
        const colors = ["orange", "pink", "blue", "purple", "yellow", "green"];
        return {
          id: leader.id,
          name: leader.name,
          role: leader.position,
          image: fullImageUrl,
          color: colors[index % colors.length] as "orange" | "pink" | "blue" | "purple" | "yellow" | "green",
        };
      })
    : [
        {
          id: 1,
          name: "Dr. James Williams",
          role: "Science Department Head",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
          color: "orange" as const,
        },
        {
          id: 2,
          name: "Lisa Anderson",
          role: "Language Arts Specialist",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
          color: "pink" as const,
        },
        {
          id: 3,
          name: "Robert Martinez",
          role: "Physical Education Coordinator",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
          color: "blue" as const,
        },
      ];

  // Take only first 3 members
  const displayMembers = teamMembers.slice(0, 3);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Decorative purple graphic element */}
      <div className="absolute top-0 left-0 w-32 h-32 -z-10">
        <div className="w-16 h-16 bg-purple-500 rounded-lg transform rotate-45"></div>
        <div className="absolute top-20 left-8 w-1 h-16 border-l-2 border-dashed border-purple-500"></div>
        <div className="absolute top-36 left-12 w-2 h-2 bg-purple-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {displayMembers.map((member, index) => {
          const borderColor = index === 0 ? "border-pink-500" : "border-gray-400";
          const nameColor = "text-pink-500";
          
          return (
            <div key={member.id} className="flex flex-col items-center text-center">
               {/* Name above circle - show initials */}
               <div className="mb-4">
                 <p className="text-white text-sm font-medium mb-1">
                   {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                 </p>
                 <p className="text-gray-400 text-xs">
                   {member.name}
                 </p>
               </div>
              
              {/* Circular image with colored border */}
              <div className={`relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full border-4 ${borderColor} mb-4 overflow-hidden bg-gray-700`}>
                {member.image && !imageErrors[member.id] ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(member.id)}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                      {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Name below circle in magenta */}
              <h4 className={`text-xl font-bold ${nameColor} mb-2`}>
                {member.name}
              </h4>
              
              {/* Role */}
              <p className="text-gray-400 text-sm">
                {member.role}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ stat, isVisible, delay }: { stat: StatItem; isVisible: boolean; delay: number }) {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    const timer = setTimeout(() => {
      intervalId = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setCount(Math.min(Math.round(increment * currentStep), stat.value));
        } else {
          setCount(stat.value);
          setHasAnimated(true);
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      }, stepDuration);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible, stat.value, delay, hasAnimated]);

  return (
    <div
      className={`
        group relative bg-white rounded-2xl p-8 shadow-lg
        transform transition-all duration-500 ease-out
        hover:scale-110 hover:shadow-2xl hover:-translate-y-2
        border-2 border-transparent hover:border-blue-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background on hover */}
      <div
        className={`
          absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color}
          opacity-0 group-hover:opacity-10 transition-opacity duration-500
        `}
      />

      {/* Icon */}
      <div
        className={`
          text-5xl mb-4 transform transition-all duration-500
          ${isHovered ? "scale-125 rotate-12" : "scale-100"}
        `}
      >
        {stat.icon}
      </div>

      {/* Number */}
      <div
        className={`
          text-5xl font-bold mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent
          transform transition-all duration-300
          ${isHovered ? "scale-110" : "scale-100"}
        `}
      >
        {count}
        <span className="text-4xl">{stat.suffix}</span>
      </div>

      {/* Label */}
      <div
        className={`
          text-gray-600 font-medium text-sm uppercase tracking-wide
          transform transition-all duration-300
          ${isHovered ? "text-gray-800 translate-x-1" : "text-gray-600"}
        `}
      >
        {stat.label}
      </div>

      {/* Decorative element */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left
        `}
      />
    </div>
  );
}

export default function About() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation />
      
      <AboutHero
        greeting="YOUR CHILD CAN BE A GENIUS"
        mainTitle="FUN & LEARNING"
        ctaText="ENROLL YOUR CHILD"
        ctaLink="/contact"
        imageUrl="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces"
      />

      <Section bgColor="dark" title="Our Story" subtitle="Building futures, one student at a time">
        <div className="relative max-w-7xl mx-auto">
          {/* Decorative background elements - adjusted for dark background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full opacity-30 blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full opacity-25 blur-3xl -z-10"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-500/20 rounded-full opacity-30 blur-2xl -z-10"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Section - Large Circular Image */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="relative">
                {/* Main Circular Image */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden shadow-2xl border-8 border-white">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop&crop=faces"
                    alt="Teacher with students"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 320px, (max-width: 1024px) 384px, 500px"
                  />
                </div>
                
                {/* Subtle circular outline/curve beneath the image */}
                <div className="absolute -bottom-8 -left-8 w-64 h-64 border-4 border-blue-400/40 rounded-full -z-10"></div>
                <div className="absolute -bottom-12 -left-12 w-80 h-80 border-2 border-blue-300/30 rounded-full -z-10"></div>
              </div>
            </div>

            {/* Right Section - 2x2 Grid of Content Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              {/* Block 1 - Self-contained gifted programs */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-700">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Self-contained Gifted Programs</h4>
                <p className="text-sm text-gray-300 leading-relaxed">By creating a safe, consistent and welcoming environment</p>
              </div>

              {/* Block 2 - Honors classes */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-700">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Honors Classes</h4>
                <p className="text-sm text-gray-300 leading-relaxed">By creating a safe, consistent and welcoming environment</p>
              </div>

              {/* Block 3 - Traditional academies */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-700">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Traditional Academies</h4>
                <p className="text-sm text-gray-300 leading-relaxed">By creating a safe, consistent and welcoming environment</p>
              </div>

              {/* Block 4 - Advanced Placement courses */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-700">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Advanced Placement Courses</h4>
                <p className="text-sm text-gray-300 leading-relaxed">By creating a safe, consistent and welcoming environment</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Mission & Vision - Enhanced Design */}
      <Section bgColor="gray" title="Our Mission & Vision">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            {/* Mission Card */}
            <div className="group relative">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity duration-300"></div>
              
              <div className={`relative p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className={`text-3xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  Our Mission
                </h3>
                <p className={`leading-relaxed text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  To provide a transformative educational experience that empowers students to
                  achieve academic excellence, develop strong character, and become responsible
                  global citizens. We are committed to nurturing each child's unique talents while
                  instilling values of integrity, respect, and lifelong learning.
                </p>
                
                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-bl-full opacity-50"></div>
              </div>
            </div>
            
            {/* Vision Card */}
            <div className="group relative">
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity duration-300"></div>
              
              <div className={`relative p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className={`text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  Our Vision
                </h3>
                <p className={`leading-relaxed text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  To be recognized as a leading educational institution that produces well-rounded,
                  confident, and innovative leaders who contribute positively to society. We envision
                  a learning environment where every student thrives, every teacher inspires, and
                  every achievement is celebrated.
                </p>
                
                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-full opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Values - Enhanced Design */}
      <Section title="Our Values">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-40 h-40 bg-red-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {/* Excellence */}
            <div className="group relative">
              <div className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon with gradient background */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-red-500 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 rounded-full opacity-60"></div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-red-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Excellence</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>Striving for the highest standards in everything we do</p>
              </div>
            </div>
            
            {/* Integrity */}
            <div className="group relative">
              <div className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon with gradient background */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-200 rounded-full opacity-60"></div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-yellow-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Integrity</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>Acting with honesty, transparency, and ethical principles</p>
              </div>
            </div>
            
            {/* Innovation */}
            <div className="group relative">
              <div className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon with gradient background */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-200 rounded-full opacity-60"></div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Innovation</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>Embracing new ideas and technologies to enhance learning</p>
              </div>
            </div>
            
            {/* Compassion */}
            <div className="group relative">
              <div className={`p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Icon with gradient background */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 rounded-full opacity-60"></div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-pink-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Compassion</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>Caring for each student's well-being and growth</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Team Section */}
      <Section bgColor="white" title="Our Team" subtitle="Meet our dedicated educators and staff members">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TeamCarousel
            members={[
              {
                id: 1,
                name: "Dr. James Williams",
                role: "Science Department Head",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces",
                color: "pink",
              },
              {
                id: 2,
                name: "Lisa Anderson",
                role: "Language Arts Specialist",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
                color: "orange",
              },
              {
                id: 3,
                name: "Robert Martinez",
                role: "Physical Education Coordinator",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
                color: "blue",
              },
              {
                id: 4,
                name: "Dr. Sarah Johnson",
                role: "Principal & Education Specialist",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
                color: "purple",
              },
              {
                id: 5,
                name: "Michael Chen",
                role: "Mathematics Specialist",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
                color: "yellow",
              },
              {
                id: 6,
                name: "Emily Rodriguez",
                role: "Music & Arts Teacher",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
                color: "green",
              },
            ]}
            autoPlay={true}
            autoPlayInterval={5000}
          />
        </div>
      </Section>

      <Section bgColor="gray" title="Our Achievements">
        <StatsSection />
      </Section>

      <Section title="Outstanding results that speak for themselves">
        <ResultsStatsSection />
      </Section>

      <Footer />
    </div>
  );
}


"use client";

import { useEffect, useState, useRef } from "react";
import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Image from "next/image";

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
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {stats.map((stat, index) => (
        <ResultStatCard key={index} stat={stat} isVisible={isVisible} delay={index * 150} />
      ))}
    </div>
  );
};

function ResultStatCard({ stat, isVisible, delay }: { stat: ResultStatItem; isVisible: boolean; delay: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    const duration = 2500; // 2.5 seconds
    const steps = 100;
    const increment = stat.value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        const newCount = Math.min(Math.round(increment * currentStep), stat.value);
        setCount(newCount);
      } else {
        setCount(stat.value);
        setHasAnimated(true);
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible, stat.value, hasAnimated]);

  return (
    <div
      className={`
        bg-white rounded-lg p-8 shadow-md text-center
        transform transition-all duration-700 ease-out
        hover:shadow-xl hover:-translate-y-1
        ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Number with animation */}
      <div
        className={`
          text-5xl font-bold text-blue-600 mb-3
          transition-all duration-300
          ${isVisible ? "scale-100" : "scale-50"}
        `}
        style={{ transitionDelay: `${delay + 200}ms` }}
      >
        {count}{stat.suffix}
      </div>
      
      {/* Label */}
      <h4
        className={`
          text-xl font-bold text-gray-900 mb-2
          transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{ transitionDelay: `${delay + 400}ms` }}
      >
        {stat.label}
      </h4>
      
      {/* Description */}
      <p
        className={`
          text-sm text-gray-600 leading-relaxed
          transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{ transitionDelay: `${delay + 600}ms` }}
      >
        {stat.description}
      </p>
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
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setCount(Math.min(Math.round(increment * currentStep), stat.value));
        } else {
          setCount(stat.value);
          setHasAnimated(true);
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(timer);
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
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Discover Our Legacy of Excellence - Building Futures Since 1995"
        title="About Elite Academy"
        subtitle="Excellence in Education Since 1995"
        description="Welcome to Elite Academy - a premier institution delivering quality education and exceptional school experience for nearly three decades. Since 1995, we have been transforming lives through world-class education, character development, and innovative teaching methods. Our legacy of academic excellence has shaped thousands of successful graduates who are making meaningful contributions to society worldwide. Experience the difference of a school that truly cares about your child's future."
        imagePath="/FrontEndImages/freepik__cinematic-documentary-photography-style-school-hom__3233.png"
        simple={true}
      />

      <Section title="Our Story" subtitle="Building futures, one student at a time">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">A Legacy of Excellence</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded in 1995, Elite Academy has been at the forefront of educational excellence
              for nearly three decades. What started as a small institution with a vision to
              transform education has grown into a premier learning community that serves over
              2,000 students across nursery, primary, and secondary levels.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our commitment to providing world-class education while maintaining strong values
              and character development has made us a trusted choice for families seeking the
              best for their children's future.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, we continue to innovate and adapt, ensuring our students are prepared not
              just for exams, but for life's challenges and opportunities.
            </p>
          </div>
          <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
              alt="School history"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Our Mission & Vision">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide a transformative educational experience that empowers students to
              achieve academic excellence, develop strong character, and become responsible
              global citizens. We are committed to nurturing each child's unique talents while
              instilling values of integrity, respect, and lifelong learning.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be recognized as a leading educational institution that produces well-rounded,
              confident, and innovative leaders who contribute positively to society. We envision
              a learning environment where every student thrives, every teacher inspires, and
              every achievement is celebrated.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Our Values">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Excellence</h4>
            <p className="text-sm text-gray-600">Striving for the highest standards in everything we do</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Integrity</h4>
            <p className="text-sm text-gray-600">Acting with honesty, transparency, and ethical principles</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
            <p className="text-sm text-gray-600">Embracing new ideas and technologies to enhance learning</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❤️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Compassion</h4>
            <p className="text-sm text-gray-600">Caring for each student's well-being and growth</p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Our Achievements">
        <StatsSection />
      </Section>

      <Section title="Outstanding results that speak for themselves">
        <ResultsStatsSection />
      </Section>

      <Section title="Leadership Team">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/FrontEndImages/freepik__minimal-soft-studio-light-photography-a-profession__5645.png"
                alt="Principal"
                fill
                className="object-cover"
              />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Dr. Sarah Johnson</h4>
            <p className="text-sm text-gray-600 mb-2">Principal</p>
            <p className="text-sm text-gray-500">Ph.D. in Education, 20+ years experience</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/FrontEndImages/freepik__35mm-film-photography-a-natural-photo-of-a-young-w__5646.png"
                alt="Vice Principal"
                fill
                className="object-cover"
              />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Mr. David Williams</h4>
            <p className="text-sm text-gray-600 mb-2">Vice Principal</p>
            <p className="text-sm text-gray-500">M.Ed., Specialist in Curriculum Development</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__5644.png"
                alt="Academic Director"
                fill
                className="object-cover"
              />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Mrs. Emily Chen</h4>
            <p className="text-sm text-gray-600 mb-2">Academic Director</p>
            <p className="text-sm text-gray-500">M.A. in Educational Leadership</p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


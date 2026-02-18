"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import PlayfulHero from "./../components/PlayfulHero";
import Section from "./../components/Section";
import ColorfulSection from "./../components/ColorfulSection";
import ValueCard from "./../components/ValueCard";
import Card from "./../components/Card";
import Image from "next/image";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

export default function Facilities() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation />
      
      <PlayfulHero
        title="Our Facilities"
        subtitle="World-Class Infrastructure for Excellence"
        description={`Welcome to ${schoolName}'s World-Class Facilities - where quality education meets exceptional infrastructure. Experience state-of-the-art facilities designed to inspire learning.`}
        ctaText="Schedule a Tour"
        ctaLink="/contact"
        imageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=800&fit=crop&auto=format"
        gradientFrom="from-teal-600"
        gradientTo="to-cyan-500"
      />

      {/* Photo Category Section */}
      <Section title="Photo Category" subtitle="Explore our world-class facilities">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Circular Image */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 rounded-full overflow-hidden border-8 border-blue-100 shadow-2xl">
              <Image
                src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3247.png"
                alt="Students in classroom"
                fill
                className="object-cover"
                sizes="320px"
                suppressHydrationWarning
              />
            </div>
            {/* Decorative pink circle */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-pink-300 rounded-full opacity-60"></div>
          </div>
          
          {/* Right Side - Category Icons */}
          <div className="grid grid-cols-2 gap-4">
            <ValueCard
              icon="👶"
              title="Baby Play"
              bgColor="bg-pink-50"
            />
            <ValueCard
              icon="⏰"
              title="Activities Classes"
              bgColor="bg-green-50"
            />
            <ValueCard
              icon="🎨"
              title="Painting"
              bgColor="bg-orange-50"
            />
            <ValueCard
              icon="🛏️"
              title="Baby Sitting"
              bgColor="bg-blue-50"
            />
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Academic & Learning Facilities" subtitle="Spaces designed to enhance teaching and learning">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Modern Classrooms"
            description="Spacious, well-lit classrooms equipped with smart boards, projectors, and comfortable seating. Each classroom is designed to facilitate interactive learning and collaboration."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3247.png"
            imageAlt="Modern classrooms"
          />
          <Card
            title="Science Laboratories"
            description="Fully equipped physics, chemistry, and biology laboratories with modern equipment and safety features. Students conduct hands-on experiments and research projects."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3248.png"
            imageAlt="Science laboratories"
          />
          <Card
            title="Library & Learning Resource Center"
            description="Extensive collection of books, digital resources, and quiet study areas. The library serves as a hub for research, reading, and academic support."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
            imageAlt="Library"
          />
          <Card
            title="Computer Labs"
            description="State-of-the-art computer laboratories with high-speed internet, modern software, and technology resources for coding, research, and digital learning."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3249.png"
            imageAlt="Computer labs"
          />
        </div>
      </Section>

      <Section title="Arts & Creative Spaces" subtitle="Where creativity and expression flourish">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            title="Art Studios"
            description="Dedicated art rooms with natural lighting, various art supplies, and display areas for student artwork. Students explore painting, drawing, sculpture, and digital art."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Art studios"
          />
          <Card
            title="Music Rooms"
            description="Soundproof music rooms with instruments, practice spaces, and recording equipment. Students learn various instruments and participate in ensembles."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3250.png"
            imageAlt="Music rooms"
          />
          <Card
            title="Drama & Theater"
            description="Fully equipped theater with stage, lighting, and sound systems. Students perform plays, musicals, and presentations in this professional space."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3251.png"
            imageAlt="Theater"
          />
        </div>
      </Section>

      <Section bgColor="gray" title="Sports & Recreation Facilities" subtitle="Promoting physical fitness and athletic excellence">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            {/* Left Side - Sports Fields Card */}
            <div className="group">
              <Card
                title="Sports Fields"
                description="Expansive sports fields for football, rugby, and athletics. Well-maintained grass fields with proper markings and equipment for various sports activities."
                imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
                imageAlt="Sports fields"
              />
            </div>
            
            {/* Right Side - Enhanced Facility Cards */}
            <div className="grid grid-cols-1 gap-6">
              {/* Basketball Court */}
              <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                
                <div className="relative p-6 lg:p-8">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Basketball Court</h4>
                  <p className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Indoor basketball court with professional flooring and equipment for practice
                    and competitive games.
                  </p>
                </div>
              </div>

              {/* Swimming Pool */}
              <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                
                <div className="relative p-6 lg:p-8">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Swimming Pool</h4>
                  <p className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Olympic-size swimming pool with certified lifeguards and swimming instruction
                    for all levels.
                  </p>
                </div>
              </div>

              {/* Tennis Courts */}
              <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                
                <div className="relative p-6 lg:p-8">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 group-hover:text-green-600 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Tennis Courts</h4>
                  <p className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Multiple tennis courts with professional surfaces for training and competitive play.
                  </p>
                </div>
              </div>

              {/* Gymnasium */}
              <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}>
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                
                <div className="relative p-6 lg:p-8">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h4 className={`text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>Gymnasium</h4>
                  <p className={`leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    Fully equipped gym with modern fitness equipment for physical education and
                    after-school fitness programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Support & Service Facilities" subtitle="Comprehensive support services for student well-being">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {/* Cafeteria */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-red-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Cafeteria</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Spacious cafeteria serving nutritious meals, snacks, and beverages. Menu options
                  accommodate various dietary needs and preferences.
                </p>
              </div>
            </div>

            {/* Health Center */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-green-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Health Center</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  On-campus health center with qualified nurses and first aid facilities. Regular
                  health check-ups and emergency care available.
                </p>
              </div>
            </div>

            {/* Counseling Center */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Counseling Center</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Professional counseling services for academic, career, and personal guidance.
                  Private consultation rooms for student support.
                </p>
              </div>
            </div>

            {/* Administrative Offices */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border text-center ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Administrative Offices</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Well-organized administrative offices for admissions, finance, and general
                  inquiries. Friendly staff ready to assist students and parents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Safe & Reliable Transportation" subtitle="Convenient school bus service for all students">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Side - Enhanced Content */}
            <div className={`group relative p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                
                <h3 className={`text-3xl font-bold mb-6 group-hover:text-orange-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>School Bus Service</h3>
                <p className={`mb-6 leading-relaxed text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Our fleet of modern, safe school buses provides reliable transportation services
                  across the city. All buses are equipped with GPS tracking, safety features, and
                  are driven by certified, experienced drivers.
                </p>
                <ul className={`space-y-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  {[
                    { icon: "📍", text: "GPS tracking for real-time bus location" },
                    { icon: "🛡️", text: "Safety protocols and trained drivers" },
                    { icon: "🗺️", text: "Multiple routes covering all areas" },
                    { icon: "📱", text: "Parent notifications for delays or changes" },
                    { icon: "💰", text: "Affordable transportation fees" },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 group/item">
                      <span className="text-2xl transform group-hover/item:scale-110 transition-transform duration-300">{item.icon}</span>
                      <span className="text-base leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Right Side - Enhanced Image */}
            <div className="relative group">
              <div className="relative w-full h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <Image
                  src="/FrontEndImages/freepik__35mm-film-photography-yellow-school-bus-picking-up__3243.png"
                  alt="School bus"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-300 rounded-full opacity-60 blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-300 rounded-full opacity-40 blur-xl"></div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Safety & Security Measures" subtitle="Ensuring a secure learning environment for all">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative background shapes */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-40 h-40 bg-red-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10">
            {/* 24/7 Security */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-4 group-hover:text-red-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>24/7 Security</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Professional security personnel and surveillance systems ensure campus safety
                  at all times. Controlled access points and visitor management protocols.
                </p>
              </div>
            </div>

            {/* Emergency Preparedness */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-yellow-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Emergency Preparedness</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Comprehensive emergency response plans, fire safety systems, and regular drills
                  ensure student and staff safety in all situations.
                </p>
              </div>
            </div>

            {/* Health & Hygiene */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-4 group-hover:text-green-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Health & Hygiene</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Clean, well-maintained facilities with proper sanitation, handwashing stations,
                  and health protocols throughout the campus.
                </p>
              </div>
            </div>

            {/* Maintenance */}
            <div className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              {/* Gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <div className="relative p-6 lg:p-8">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className={`text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>Maintenance</h4>
                <p className={`leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                  Regular maintenance and upgrades ensure all facilities remain in excellent
                  condition and meet the highest standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import PlayfulHero from "./../components/PlayfulHero";
import Section from "./../components/Section";
import ColorfulSection from "./../components/ColorfulSection";
import Card from "./../components/Card";
import Image from "next/image";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

export default function News() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation />
      
      <PlayfulHero
        title="News & Announcements"
        subtitle="Stay Updated with Latest School News and Events"
        description={`Welcome to ${schoolName}'s News & Announcements - your source for the latest updates on our quality education programs and school events. Stay connected with our vibrant school community.`}
        imageUrl="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=800&fit=crop&crop=faces"
        gradientFrom="from-violet-600"
        gradientTo="to-purple-500"
      />

      {/* Online Education Section */}
      <Section title="Online Education" subtitle="Learn from leading universities and companies">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          {/* Left Side - Text */}
          <div>
            <div className="text-4xl mb-4">🌈</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Learn from leading universities and companies
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our online education platform provides flexible learning options for students who need
              additional support or want to explore advanced topics. Access quality educational content
              from leading institutions and industry experts.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">13+</div>
                <div className="text-sm text-gray-700">Courses</div>
              </div>
              <div className="bg-indigo-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">13+</div>
                <div className="text-sm text-gray-700">Certificates</div>
              </div>
              <div className="bg-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">10+</div>
                <div className="text-sm text-gray-700">Master's</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"
                alt="Video call interface - online learning"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
              {/* Overlay with time display */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                <div className="text-sm font-medium">Video Call Interface</div>
                <div className="text-xs text-gray-300 mt-1">13:20</div>
              </div>
              {/* Gradient overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Latest News & Updates" subtitle={`Stay informed about everything happening at ${schoolName}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            title="Admissions Open for 2024-2025 Academic Year"
            description="We are pleased to announce that admissions are now open for the new academic year. Limited seats available in all programs. Early application is encouraged."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png"
            imageAlt="Admissions announcement"
          />
          <Card
            title="Annual Sports Day 2024 - A Grand Success"
            description="Our annual sports day was celebrated with great enthusiasm. Students showcased their athletic talents in various competitions. Congratulations to all participants!"
            imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
            imageAlt="Sports day"
          />
          <Card
            title="Science Fair Winners Announced"
            description="Congratulations to our students who won top prizes at the regional science fair. Their innovative projects demonstrated exceptional creativity and scientific understanding."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
            imageAlt="Science fair"
          />
          <Card
            title="New Library Resources Available"
            description="Our library has been updated with new books, digital resources, and study materials. Students can now access an expanded collection of educational resources."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
            imageAlt="Library resources"
          />
          <Card
            title="Parent-Teacher Conference Schedule"
            description="Parent-teacher conferences will be held next week. Please check your portal for your scheduled time slot. We look forward to discussing your child's progress."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png"
            imageAlt="Parent teacher conference"
          />
          <Card
            title="Art Exhibition Showcases Student Talent"
            description="Our annual art exhibition featured outstanding work from students across all levels. The exhibition is open to parents and visitors this week."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Art exhibition"
          />
        </div>
      </Section>

      <Section bgColor="gray" title="Upcoming School Events" subtitle="Mark your calendar for these exciting activities">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">15</span>
                  <span className="text-sm text-gray-600">March</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Open House Day</h3>
                <p className="text-gray-600 mb-3">
                  Join us for our annual open house. Tour our facilities, meet teachers, and learn
                  about our programs. All prospective families are welcome.
                </p>
                <span className="text-sm text-blue-600 font-medium">10:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">22</span>
                  <span className="text-sm text-gray-600">March</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Day Celebration</h3>
                <p className="text-gray-600 mb-3">
                  Celebrate diversity and culture with performances, food, and activities from
                  around the world. Students and families are invited to participate.
                </p>
                <span className="text-sm text-blue-600 font-medium">All Day Event</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">05</span>
                  <span className="text-sm text-gray-600">April</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Fair</h3>
                <p className="text-gray-600 mb-3">
                  Secondary students will have the opportunity to meet professionals from various
                  fields and learn about different career paths and opportunities.
                </p>
                <span className="text-sm text-blue-600 font-medium">9:00 AM - 2:00 PM</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">12</span>
                  <span className="text-sm text-gray-600">April</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Science & Technology Expo</h3>
                <p className="text-gray-600 mb-3">
                  Students showcase their science projects, experiments, and technology innovations.
                  Open to all students, parents, and community members.
                </p>
                <span className="text-sm text-blue-600 font-medium">10:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Important Announcements" subtitle="Critical information for students and parents">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">Important: Fee Payment Deadline</h4>
                <p className="text-gray-600 text-sm mt-1">
                  The deadline for second term fee payments is March 31st. Please ensure payments
                  are made on time to avoid late fees.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">Portal Maintenance</h4>
                <p className="text-gray-600 text-sm mt-1">
                  The student and parent portal will be under maintenance on March 20th from
                  10:00 PM to 2:00 AM. We apologize for any inconvenience.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">New After-School Programs</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Registration is now open for new after-school programs including robotics,
                  coding, music, and sports. Check the portal for details and registration.
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


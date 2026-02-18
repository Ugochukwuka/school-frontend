"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import PlayfulHero from "./../components/PlayfulHero";
import Section from "./../components/Section";
import ColorfulSection from "./../components/ColorfulSection";
import ValueCard from "./../components/ValueCard";
import TeamCarousel from "./../components/TeamCarousel";
import Card from "./../components/Card";
import CardCarousel from "./../components/CardCarousel";
import DecorativeElements from "./../components/DecorativeElements";
import Image from "next/image";
import Link from "next/link";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

export default function Nursery() {
  const { schoolName } = useSchoolProfile();
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PlayfulHero
        title="Nursery Program"
        subtitle="Nurturing Young Minds, Ages 2-5"
        description={`Welcome to ${schoolName}'s Nursery Program - where quality early childhood education meets exceptional care. Experience the perfect start to your child's educational journey through our play-based learning approach.`}
        ctaText="Enroll Now"
        ctaLink="/admissions"
        imageUrl="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces"
        gradientFrom="from-purple-600"
        gradientTo="to-pink-500"
      />

      {/* Our Core Value Section - Colorful Purple Background */}
      <ColorfulSection bgColor="purple" title="Our Core Value">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Side - Values */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ValueCard
                icon="☀️"
                title="Self-contained Gifted Programs"
                description="Specialized programs for gifted children"
                bgColor="bg-white"
              />
              <ValueCard
                icon="📦"
                title="Extra Activities"
                description="Wide range of extracurricular activities"
                bgColor="bg-white"
              />
              <ValueCard
                icon="📍"
                title="Complete Tracking"
                description="Comprehensive progress monitoring"
                bgColor="bg-white"
              />
              <ValueCard
                icon="🚌"
                title="Individual Bus"
                description="Safe and reliable transportation"
                bgColor="bg-white"
              />
            </div>
            <Link
              href="/admissions"
              className="inline-block bg-purple-800 hover:bg-purple-900 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 transform"
            >
              View All
            </Link>
          </div>
          
          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces"
                alt="Happy child with colorful paint"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
            </div>
            {/* Decorative red balloon */}
            <div className="absolute -top-6 -left-6 w-16 h-20 bg-red-400 rounded-full opacity-80 transform rotate-12 shadow-lg"></div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 border-4 border-white/50 rounded-full"></div>
          </div>
        </div>
      </ColorfulSection>

      {/* Curriculum Section */}
      <Section title="Curriculum" subtitle="Popular Classes">
        <DecorativeElements />
        <CardCarousel
          cards={[
            {
              title: "Toddlers (Ages 2-3)",
              description: "By creating a safe, consistent and welcoming environment",
              imagePath: "/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png",
              imageAlt: "Toddlers class",
              gradientFrom: "from-blue-500",
              gradientTo: "to-blue-700",
            },
            {
              title: "Pre-K (Ages 3-4)",
              description: "By creating a safe, consistent and welcoming environment",
              imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3248.png",
              imageAlt: "Pre-K class",
              gradientFrom: "from-green-500",
              gradientTo: "to-green-700",
            },
            {
              title: "Kindergarten (Ages 4-5)",
              description: "By creating a safe, consistent and welcoming environment",
              imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3249.png",
              imageAlt: "Kindergarten class",
              gradientFrom: "from-orange-500",
              gradientTo: "to-orange-700",
            },
          ]}
        />
      </Section>

      {/* We're Redefining Section */}
      <ColorfulSection bgColor="yellow" title="We're Redefining Early Child Care Education">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Active Learning Points */}
          <div className="space-y-6">
            {[
              { num: "01", title: "Active Learning", desc: "Children love this classroom as it has many toys and educational games." },
              { num: "02", title: "Active Learning", desc: "Children love this classroom as it has many toys and educational games." },
              { num: "03", title: "Active Learning", desc: "Children love this classroom as it has many toys and educational games." },
              { num: "04", title: "Active Learning", desc: "Children love this classroom as it has many toys and educational games." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                    idx === 0 ? "bg-blue-400" : idx === 1 ? "bg-teal-400" : idx === 2 ? "bg-pink-400" : "bg-blue-500"
                  }`}>
                    {item.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right Side - Classroom Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3247.png"
                alt="Classroom with children"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
            </div>
            {/* Decorative yellow circle */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-300 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-300 rounded-full opacity-40 blur-xl"></div>
          </div>
        </div>
      </ColorfulSection>

      <Section title="Program Highlights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Play-Based Learning"
            description="Children learn best through play. Our curriculum incorporates structured play activities that develop problem-solving, creativity, and social skills while making learning enjoyable."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3248.png"
            imageAlt="Play-based learning"
          />
          <Card
            title="Early Literacy & Numeracy"
            description="Age-appropriate introduction to letters, sounds, numbers, and basic concepts through songs, stories, games, and hands-on activities that make learning natural and fun."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3249.png"
            imageAlt="Early learning"
          />
          <Card
            title="Social & Emotional Development"
            description="We help children develop self-confidence, empathy, and social skills through group activities, sharing, and positive reinforcement in a supportive environment."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3250.png"
            imageAlt="Social development"
          />
          <Card
            title="Creative Expression"
            description="Art, music, movement, and storytelling activities allow children to express themselves creatively while developing fine motor skills and imagination."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Creative activities"
          />
        </div>
      </Section>

      <Section title="Age Groups">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Toddlers (Ages 2-3)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Sensory exploration activities</li>
              <li>• Basic motor skills development</li>
              <li>• Introduction to colors and shapes</li>
              <li>• Social interaction with peers</li>
              <li>• Language development through songs</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Pre-K (Ages 3-4)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Pre-reading and pre-writing skills</li>
              <li>• Number recognition and counting</li>
              <li>• Science exploration activities</li>
              <li>• Creative arts and crafts</li>
              <li>• Structured play and games</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">Kindergarten (Ages 4-5)</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Reading readiness and phonics</li>
              <li>• Basic math concepts</li>
              <li>• Science and nature studies</li>
              <li>• Social studies introduction</li>
              <li>• Preparation for primary school</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Daily Schedule">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">8:00 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Arrival & Free Play</h5>
                <p className="text-gray-600 text-sm">Children arrive and engage in supervised free play</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">9:00 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Circle Time</h5>
                <p className="text-gray-600 text-sm">Morning greetings, songs, and calendar activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">9:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Learning Centers</h5>
                <p className="text-gray-600 text-sm">Rotating activities: literacy, math, science, art</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">10:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Snack & Outdoor Play</h5>
                <p className="text-gray-600 text-sm">Healthy snack followed by playground activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">11:30 AM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Story Time & Music</h5>
                <p className="text-gray-600 text-sm">Interactive storytelling and music activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">12:00 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Lunch & Rest</h5>
                <p className="text-gray-600 text-sm">Lunch followed by quiet rest time</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">1:00 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Afternoon Activities</h5>
                <p className="text-gray-600 text-sm">Creative projects, games, and special programs</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-blue-600 w-24">2:30 PM</span>
              <div>
                <h5 className="font-semibold text-gray-900">Dismissal</h5>
                <p className="text-gray-600 text-sm">Pick-up and end of day</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Team Section */}
      <Section title="Our Team" subtitle="Meet our passionate educators">
        <TeamCarousel
          members={[
            {
              name: "Sarah Johnson",
              role: "Nursery Specialist",
              imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-pink-400",
            },
            {
              name: "Michael Chen",
              role: "Early Childhood Educator",
              imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-yellow-400",
            },
            {
              name: "Emily Rodriguez",
              role: "Creative Arts Teacher",
              imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-blue-400",
            },
          ]}
        />
      </Section>

      <Section title="Facilities & Resources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Child-Safe Classrooms</h4>
            <p className="text-gray-600 text-sm">
              Bright, colorful classrooms designed specifically for young children with age-appropriate
              furniture, learning materials, and safety features.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Outdoor Play Areas</h4>
            <p className="text-gray-600 text-sm">
              Secure playgrounds with age-appropriate equipment, sandboxes, and open spaces for
              physical activity and exploration.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Learning Materials</h4>
            <p className="text-gray-600 text-sm">
              Extensive collection of educational toys, books, puzzles, and hands-on learning
              resources that support all areas of development.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Health & Safety</h4>
            <p className="text-gray-600 text-sm">
              Certified staff, secure facilities, health protocols, and nutritious meal programs
              ensure children's safety and well-being.
            </p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


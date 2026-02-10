"use client";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Section from "./components/Section";
import Card from "./components/Card";
import TestimonialCard from "./components/TestimonialCard";
import PortalCard from "./components/PortalCard";
import AnimatedGrid from "./components/AnimatedGrid";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <ScrollProgress />
        <Navigation />
      
      <Hero
        greeting="Where Excellence Meets Opportunity - Empowering Future Leaders Through World-Class Education"
        title="Welcome to Elite Academy"
        subtitle="Excellence in Education, Character, and Innovation"
        description="Welcome to Elite Academy - where quality education meets exceptional school experience. We provide world-class academic programs, state-of-the-art facilities, and a nurturing environment that shapes future leaders. Experience excellence in education through our comprehensive curriculum, dedicated faculty, and holistic approach to student development. Join a community committed to academic achievement, character building, and lifelong success."
        imagePaths={[
          "/FrontEndImages/freepik__a-warm-welcoming-school-homepage-header-bright-mod__3236.png",
          "/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png",
          "/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png",
          "/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png",
          "/FrontEndImages/freepik__cinematic-documentary-photography-style-school-hom__3233.png"
        ]}
        ctaText="Explore Our Programs"
        ctaLink="/academics"
      />

      <Section title="Why Choose Elite Academy" subtitle="A premier educational institution committed to nurturing future leaders">
        <div className="max-w-6xl mx-auto">
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" staggerDelay={150}>
            <Card
              title="Academic Excellence"
              description="Our rigorous curriculum and dedicated faculty ensure students achieve their highest potential through innovative teaching methods and personalized learning."
              imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
              imageAlt="Modern secondary school"
            />
            <Card
              title="Holistic Development"
              description="We focus on developing well-rounded individuals through sports, arts, leadership programs, and community service opportunities."
              imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
              imageAlt="School sports field"
            />
            <Card
              title="State-of-the-Art Facilities"
              description="Our campus features modern classrooms, science laboratories, libraries, sports facilities, and technology-enabled learning spaces."
              imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
              imageAlt="Modern school library"
            />
          </AnimatedGrid>
        </div>
      </Section>

      <Section bgColor="gray" title="Our Programs" subtitle="Comprehensive education from early years to secondary level">
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-8" staggerDelay={150}>
          <Card
            title="Nursery"
            description="Early childhood education that fosters curiosity, creativity, and social development in a nurturing environment."
            link="/nursery"
          />
          <Card
            title="Primary"
            description="A strong foundation in core subjects with emphasis on critical thinking, problem-solving, and character building."
            link="/primary"
          />
          <Card
            title="Secondary"
            description="Advanced curriculum preparing students for higher education and future careers with specialized tracks and mentorship."
            link="/secondary"
          />
        </AnimatedGrid>
      </Section>

      <Section title="What Parents & Students Say" subtitle="Hear from our community about their Elite Academy experience">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <TestimonialCard
            stars={5}
            text="Elite Academy has been a blessing for our family. The teachers are dedicated, 
              the facilities are excellent, and most importantly, our daughter has grown 
              both academically and personally. The holistic approach to education is exactly 
              what we were looking for."
            author="Sarah Mitchell"
            role="Parent of Grade 5 Student"
            initials="SM"
            delay={0}
          />
          <TestimonialCard
            stars={5}
            text="As a graduate of Elite Academy, I can confidently say that the school prepared 
              me well for university and beyond. The rigorous academics, supportive teachers, 
              and leadership opportunities shaped me into who I am today. I'm now studying 
              Engineering at a top university."
            author="James Davis"
            role="Alumni, Class of 2022"
            initials="JD"
            delay={150}
          />
          <TestimonialCard
            stars={5}
            text="The attention to individual student needs is remarkable. Our son struggled 
              with math initially, but the teachers provided extra support and now he's 
              excelling. The school's commitment to every child's success is evident in 
              everything they do."
            author="Robert Williams"
            role="Parent of Grade 8 Student"
            initials="RW"
            delay={300}
          />
        </div>
        <div className="text-center mt-8">
          <Link
            href="/about"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 active:text-blue-800 font-semibold text-sm sm:text-base transition-all duration-300 hover:translate-x-2 active:translate-x-1 group touch-manipulation min-h-[44px] justify-center"
          >
            Read More Testimonials
            <svg 
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Section>

      <Section bgColor="gray" title="Latest Blog Posts" subtitle="Insights, tips, and stories from our school community">
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-8" staggerDelay={150}>
          <Card
            title="5 Ways to Support Your Child's Learning at Home"
            description="Discover practical strategies parents can use to reinforce classroom learning and help their children succeed academically while maintaining a healthy balance."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
            imageAlt="Parent and child learning"
            link="/news"
          />
          <Card
            title="The Importance of Extracurricular Activities in Education"
            description="Learn how sports, arts, and clubs contribute to holistic development and help students discover their passions beyond the classroom."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Extracurricular activities"
            link="/news"
          />
          <Card
            title="Preparing Your Child for Secondary School Transition"
            description="A comprehensive guide for parents on helping their children navigate the transition from primary to secondary education with confidence and ease."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
            imageAlt="Secondary school transition"
            link="/news"
          />
        </AnimatedGrid>
        <div className="text-center mt-8">
          <Link
            href="/news"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 transform group touch-manipulation min-h-[44px] justify-center"
          >
            Read All Blog Posts
            <svg 
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Section>

      <Section title="Latest News & Announcements">
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8" staggerDelay={200}>
          <Card
            title="Admissions Open for 2024-2025"
            description="We are now accepting applications for the new academic year. Limited seats available. Apply now to secure your child's future."
            link="/admissions"
          />
          <Card
            title="Annual Sports Day Celebration"
            description="Join us for our annual sports day featuring exciting competitions, cultural performances, and community engagement activities."
            link="/news"
          />
        </AnimatedGrid>
        <div className="text-center mt-8">
          <Link
            href="/news"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 transform group touch-manipulation min-h-[44px] justify-center"
          >
            View All News
            <svg 
              className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Section>

      <Section bgColor="blue" title="Quick Access" subtitle="Access our student and parent portals">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <PortalCard
            href="/portal"
            title="Student Portal"
            description="Access assignments, grades, schedules, and resources"
            icon="🎓"
            delay={0}
          />
          <PortalCard
            href="/portal"
            title="Parent Portal"
            description="Monitor your child's progress, attendance, and school communications"
            icon="👨‍👩‍👧‍👦"
            delay={150}
          />
        </div>
      </Section>

      <Footer />
      <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

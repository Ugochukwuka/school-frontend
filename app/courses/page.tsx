"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Section from "../components/Section";
import CoursesCarousel from "../components/CoursesCarousel";
import FloatingCart from "../components/FloatingCart";
import { useState, useRef } from "react";

interface CourseItem {
  title: string;
  schedule: string;
  instructorName: string;
  instructorImage?: string;
  price: string;
  imagePath: string;
  imageAlt: string;
}

export default function CoursesPage() {
  const [cartItems, setCartItems] = useState<CourseItem[]>([]);
  const carouselNavRef = useRef<{ goToNext: () => void; goToPrevious: () => void } | null>(null);

  const courses: CourseItem[] = [
    {
      title: "Hospitality, Leisure & Sports Courses",
      schedule: "Mon-Fri 10 AM - 12 AM",
      instructorName: "Hubert Franck",
      instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      price: "$67",
      imagePath: "/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png",
      imageAlt: "Hospitality, Leisure & Sports Courses",
    },
    {
      title: "Basic English Speaking and Grammar",
      schedule: "Mon-Fri 10 AM - 12 AM",
      instructorName: "Amanda Kern",
      instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      price: "$45",
      imagePath: "/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png",
      imageAlt: "Basic English Speaking and Grammar",
    },
    {
      title: "Natural Sciences & Mathematics Courses",
      schedule: "Mon-Fri 10 AM - 12 AM",
      instructorName: "Gypsy Hardinge",
      instructorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
      price: "$67",
      imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png",
      imageAlt: "Natural Sciences & Mathematics Courses",
    },
    {
      title: "Environmental Studies & Earth Sciences",
      schedule: "Mon-Fri 10 AM - 12 AM",
      instructorName: "Margje Jutten",
      instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
      price: "$89",
      imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3237.png",
      imageAlt: "Environmental Studies & Earth Sciences",
    },
  ];

  const handleAddToCart = (course: CourseItem) => {
    setCartItems((prev) => [...prev, course]);
    // You can add toast notification here
    console.log("Added to cart:", course.title);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <Section bgColor="dark" title="Our Courses" subtitle="Nam mattis felis id sodales rutrum. Nulla ornare tristique mauris, a laoreet erat ornare sit amet. Nulla sagittis faucibus lacus">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation arrows positioned at top right */}
          <div className="flex justify-end mb-6 gap-2">
            <button
              onClick={() => carouselNavRef.current?.goToPrevious()}
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Previous courses"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => carouselNavRef.current?.goToNext()}
              className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Next courses"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <CoursesCarousel 
            courses={courses} 
            onAddToCart={handleAddToCart}
            showSideArrows={false}
            onNavigationRef={(nav) => { carouselNavRef.current = nav; }}
          />
        </div>
      </Section>

      <FloatingCart itemCount={cartItems.length} />
      <Footer />
    </div>
  );
}

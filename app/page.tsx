"use client";

import { useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HeroSplit from "./components/HeroSplit";
import Section from "./components/Section";
import Card from "./components/Card";
import NewsCard from "./components/NewsCard";
import TestimonialCard from "./components/TestimonialCard";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import PortalCard from "./components/PortalCard";
import AnimatedGrid from "./components/AnimatedGrid";
import CardCarousel from "./components/CardCarousel";
import BlogCarousel from "./components/BlogCarousel";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import AnimatedCounter from "./components/AnimatedCounter";
import GalleryCarousel from "./components/GalleryCarousel";
import TeamCarousel from "./components/TeamCarousel";
import BenefitsSection from "./components/BenefitsSection";
import ProgramCard from "./components/ProgramCard";
import Image from "next/image";
import Link from "next/link";
import { useSchoolProfile } from "./lib/useSchoolProfile";
import api from "./lib/api";
import { useHomepageDarkMode } from "./lib/useHomepageDarkMode";

interface Blog {
  id: number;
  title: string;
  content: string;
  image: string;
  author_name: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface Testimonial {
  id: number;
  name: string;
  position: string;
  writeup: string;
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

export default function Home() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode, mounted } = useHomepageDarkMode();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
    fetchTestimonials();
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLeadersLoading(true);
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
      setLeaders([]);
      if (process.env.NODE_ENV === "development") {
        console.warn("Leadership team could not be loaded:", err.message || "Unknown error");
      }
    } finally {
      setLeadersLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setBlogsLoading(true);
    setBlogsError("");
    try {
      const response = await api.get<Blog[] | { data: Blog[] }>("/viewAllBlogs");
      let blogsData: Blog[] = [];
      if (Array.isArray(response.data)) {
        blogsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        blogsData = response.data.data;
      }
      
      // Filter only published blogs and sort by published_at (newest first)
      const publishedBlogs = blogsData
        .filter(blog => blog.status === "published")
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 3); // Show only latest 3 blogs
      
      setBlogs(publishedBlogs);
    } catch (err: any) {
      // Handle errors gracefully for public pages - don't show error messages
      // Just silently set empty blogs array
      if (err.response?.status === 401) {
        // User is not authenticated, which is fine for public pages
        setBlogs([]);
        setBlogsError("");
      } else {
        // For any other error (network, timeout, server error), silently fail
        // This is a public page, so we don't want to show error messages
        setBlogs([]);
        setBlogsError("");
        // Only log in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.warn("Blog posts could not be loaded:", err.message || "Unknown error");
        }
      }
    } finally {
      setBlogsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const response = await api.get<Testimonial[] | { data: Testimonial[] }>("/viewAllTestimonials");
      let testimonialsData: Testimonial[] = [];
      if (Array.isArray(response.data)) {
        testimonialsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        testimonialsData = response.data.data;
      }
      // Show only first 3 testimonials
      setTestimonials(testimonialsData.slice(0, 3));
    } catch (err: any) {
      // Handle errors gracefully for public pages
      setTestimonials([]);
      if (process.env.NODE_ENV === "development") {
        console.warn("Testimonials could not be loaded:", err.message || "Unknown error");
      }
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) {
    return null; // Prevent flash of wrong theme
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff' }}>
        <ScrollProgress />
        <Navigation />
      
      <HeroSplit
        title="Empowering Minds, Shaping Futures"
        description="Discover a transformative educational experience where innovation meets tradition. Our comprehensive curriculum, dedicated educators, and state-of-the-art facilities create an environment where every student can thrive and reach their full potential."
        ctaText="Enroll Your Child"
        ctaLink="/contact"
        circularImages={[
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=faces",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop&crop=faces",
          "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=400&fit=crop&crop=faces",
        ]}
      />

      {/* Statistics Section */}
      <Section bgColor="white" className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center transform transition-all duration-500 hover:scale-110">
              <AnimatedCounter
                end={19}
                suffix="+"
                duration={2000}
                color="text-orange-500"
                delay={0}
                className="text-center"
              />
              <div className="text-gray-900 text-sm sm:text-base font-semibold mt-2">Total Pages</div>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110">
              <AnimatedCounter
                end={6}
                suffix="+"
                duration={2000}
                color="text-purple-500"
                delay={200}
                className="text-center"
              />
              <div className="text-gray-900 text-sm sm:text-base font-semibold mt-2">Home Styles</div>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110">
              <AnimatedCounter
                end={4}
                suffix="+"
                duration={2000}
                color="text-blue-500"
                delay={400}
                className="text-center"
              />
              <div className="text-gray-900 text-sm sm:text-base font-semibold mt-2">Blog Styles</div>
            </div>
            <div className="text-center transform transition-all duration-500 hover:scale-110">
              <AnimatedCounter
                end={100}
                suffix="+"
                duration={2500}
                color="text-green-500"
                delay={600}
                className="text-center"
              />
              <div className="text-gray-900 text-sm sm:text-base font-semibold mt-2">Happy Students</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Benefits Section - Redesigned with two-column layout */}
      <BenefitsSection
        title="Our Benefits"
        subtitle="What makes us the right choice for your educational journey"
        imageUrl="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
        benefits={[
          {
            number: "01",
            title: "Awesome Teachers",
            description: "Our experienced and dedicated teachers are committed to providing quality education and personalized attention to every student.",
            bgColor: "bg-blue-400",
          },
          {
            number: "02",
            title: "Global Certificate",
            description: "Internationally recognized certificates that open doors to universities and career opportunities worldwide.",
            bgColor: "bg-teal-400",
          },
          {
            number: "03",
            title: "Student Support Service",
            description: "Comprehensive support services including counseling, tutoring, and career guidance to help students succeed.",
            bgColor: "bg-pink-400",
          },
          {
            number: "04",
            title: "Best Program",
            description: "Well-structured curriculum designed to develop critical thinking, creativity, and practical skills for real-world success.",
            bgColor: "bg-blue-500",
          },
        ]}
      />

      <Section bgColor="gray" title={`Why Choose ${schoolName}`} subtitle="A premier educational institution committed to nurturing future leaders">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CardCarousel
            cards={[
              {
                title: "Academic Excellence",
                description: "Our rigorous curriculum and dedicated faculty ensure students achieve their highest potential through innovative teaching methods and personalized learning.",
                imagePath: "/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png",
                imageAlt: "Modern secondary school",
                gradientFrom: "from-blue-600",
                gradientTo: "to-purple-600",
              },
              {
                title: "Holistic Development",
                description: "We focus on developing well-rounded individuals through sports, arts, leadership programs, and community service opportunities.",
                imagePath: "/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png",
                imageAlt: "School sports field",
                gradientFrom: "from-green-500",
                gradientTo: "to-teal-600",
              },
              {
                title: "State-of-the-Art Facilities",
                description: "Our campus features modern classrooms, science laboratories, libraries, sports facilities, and technology-enabled learning spaces.",
                imagePath: "/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png",
                imageAlt: "Modern school library",
                gradientFrom: "from-orange-500",
                gradientTo: "to-red-600",
              },
            ]}
          />
        </div>
      </Section>

      {/* Our Programs Section - Colorful Curriculum Style */}
      <Section bgColor="gray" title="Curriculum" subtitle="Comprehensive education from early years to secondary level">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative Orange Balloon with string */}
          <div className="absolute top-0 right-8 hidden lg:block z-10">
            <div className="relative">
              <div className="w-16 h-20 bg-orange-400 rounded-full opacity-90 transform rotate-12 shadow-lg"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gray-400"></div>
            </div>
          </div>

          {/* Colorful background shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-30 blur-2xl hidden lg:block"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-2xl hidden lg:block"></div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-0">
            <ProgramCard
              title="Nursery"
              description="By creating a safe, consistent and welcoming environment"
              ageRange="2-5 YEARS"
              ageColor="bg-blue-500"
              imageUrl="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop"
              link="/nursery"
            />
            <ProgramCard
              title="Primary"
              description="By creating a safe, consistent and welcoming environment"
              ageRange="6-11 YEARS"
              ageColor="bg-orange-500"
              imageUrl="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"
              link="/primary"
            />
            <ProgramCard
              title="Secondary"
              description="By creating a safe, consistent and welcoming environment"
              ageRange="12-18 YEARS"
              ageColor="bg-green-500"
              imageUrl="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop"
              link="/secondary"
            />
          </div>
        </div>
      </Section>

      {/* Our Team Section */}
      <Section bgColor="white" title="Our Team" subtitle="Meet our dedicated educators and staff members">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {leadersLoading ? (
            <div className="flex justify-center items-center py-12 text-gray-600">
              Loading team...
            </div>
          ) : (() => {
            const colors = ["orange", "pink", "blue", "purple", "yellow", "green"] as const;
            const teamMembers = leaders.length > 0
              ? leaders.map((leader, index) => {
                  const rawPath = leader.photo_path?.trim() || "";
                  if (!rawPath) {
                    return {
                      id: leader.id,
                      name: leader.name,
                      role: leader.position,
                      image: "",
                      color: colors[index % colors.length],
                    };
                  }
                  // Use same-origin /storage/ path so Next.js rewrites to backend (images load reliably)
                  const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
                  const fullImageUrl =
                    rawPath.startsWith("http://") || rawPath.startsWith("https://")
                      ? rawPath
                      : cleanPath.startsWith("storage/")
                        ? `/${cleanPath}`
                        : `/storage/${cleanPath}`;
                  return {
                    id: leader.id,
                    name: leader.name,
                    role: leader.position,
                    image: fullImageUrl,
                    color: colors[index % colors.length],
                  };
                })
              : [];
            return teamMembers.length > 0 ? (
              <TeamCarousel members={teamMembers} autoPlay={true} autoPlayInterval={5000} />
            ) : (
              <div className="flex justify-center items-center py-12 text-gray-500">
                No team members to display.
              </div>
            );
          })()}
        </div>
      </Section>

      {/* Testimonials Section with Enhanced Carousel */}
      {testimonialsLoading ? (
        <div className="bg-white py-12 transition-colors duration-300">
          <div className="flex justify-center items-center">
            <div className="text-gray-600">Loading testimonials...</div>
          </div>
        </div>
      ) : testimonials.length > 0 ? (
        <TestimonialsCarousel
          testimonials={testimonials.map((testimonial) => ({
            id: testimonial.id,
            text: testimonial.writeup,
            author: testimonial.name,
            role: testimonial.position,
            initials: getInitials(testimonial.name),
          }))}
          viewAllLink="/about"
        />
      ) : (
        <div className="relative bg-gradient-to-br from-pink-500 via-pink-500 to-pink-600 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Parents Testimonials
            </h2>
            <p className="text-white/90 text-lg">
              No testimonials yet. Check back later.
            </p>
          </div>
        </div>
      )}

      <Section bgColor="gray" title="Latest Blog Posts" subtitle="Insights, tips, and stories from our school community">
        {blogsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading blog posts...</div>
          </div>
        ) : blogsError ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-600">{blogsError}</div>
          </div>
        ) : (() => {
          // Helper function to convert image path to full URL
          const getBlogImageUrl = (imagePath: string | undefined): string => {
            if (!imagePath || imagePath.trim() === "") {
              return "";
            }
            
            // If already a full URL, return as is
            if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
              return imagePath;
            }
            
            // Remove 'public/' prefix if it exists
            let cleanPath = imagePath.trim();
            if (cleanPath.startsWith("public/")) {
              cleanPath = cleanPath.replace(/^public\//, "");
            }
            
            // Convert blog_images/ to storage/blog_images/
            if (cleanPath.startsWith("/blog_images/") || cleanPath.startsWith("blog_images/")) {
              cleanPath = cleanPath.replace(/^\/?blog_images\//, "storage/blog_images/");
            }
            
            // Ensure path starts with / for proper URL construction
            const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
            
            // Construct full URL using backend URL
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
            return `${backendUrl}${normalizedPath}`;
          };

          // Prepare blog items for carousel
          let blogItems = blogs.map((blog) => {
            const imageUrl = getBlogImageUrl(blog.image);
            const publishedDate = blog.published_at 
              ? new Date(blog.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

            return {
              id: blog.id,
              title: blog.title,
              description: blog.content?.substring(0, 150) + (blog.content?.length > 150 ? "..." : "") || "Appropriately engage diverse resources for next-generation systems. Professionally foster extensive paradigms vis-a-vis",
              imagePath: imageUrl || "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png",
              imageAlt: blog.title,
              date: publishedDate,
              author: blog.author_name,
              link: "/news",
            };
          });

          // Use placeholder data if no blogs available
          if (blogItems.length === 0) {
            blogItems = [
              {
                id: 1,
                title: "Make learning fun for your kids",
                description: "Appropriately engage diverse resources for next-generation systems. Professionally foster extensive paradigms vis-a-vis",
                imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png",
                imageAlt: "Child reading a book",
                date: "June 10, 2017",
                author: "Admin",
                link: "/news",
              },
              {
                id: 2,
                title: "Make learning fun for your kids",
                description: "Appropriately engage diverse resources for next-generation systems. Professionally foster extensive paradigms vis-a-vis",
                imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png",
                imageAlt: "Children learning",
                date: "June 10, 2017",
                author: "Admin",
                link: "/news",
              },
              {
                id: 3,
                title: "Make learning fun for your kids",
                description: "Appropriately engage diverse resources for next-generation systems. Professionally foster extensive paradigms vis-a-vis",
                imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png",
                imageAlt: "Students studying",
                date: "June 10, 2017",
                author: "Admin",
                link: "/news",
              },
            ];
          }

          return (
            <>
              <BlogCarousel blogs={blogItems} />
              <div className="text-center mt-8">
                <Link
                  href="/news"
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 transform group touch-manipulation min-h-[44px] justify-center"
                >
                  View All
                </Link>
              </div>
            </>
          );
        })()}
      </Section>

      {/* Gallery Section */}
      <Section bgColor="white" title="Our Gallery" subtitle="Capturing moments of excellence, growth, and joy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryCarousel
            images={[
              {
                src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=faces",
                alt: "Happy student celebrating",
              },
              {
                src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=faces",
                alt: "Student exploring with camera",
              },
              {
                src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=400&fit=crop&crop=faces",
                alt: "Children playing and learning",
              },
              {
                src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop&crop=faces",
                alt: "Creative building activities",
              },
              {
                src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=faces",
                alt: "Students collaborating",
              },
              {
                src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=400&fit=crop&crop=faces",
                alt: "Art and creativity",
              },
              {
                src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop&crop=faces",
                alt: "Hands-on learning",
              },
              {
                src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=400&fit=crop&crop=faces",
                alt: "Active learning moments",
              },
            ]}
            autoPlay={true}
            autoPlayInterval={4000}
          />
        </div>
      </Section>

      {/* Quick Access Section */}
      <Section bgColor="white" title="Quick Access" subtitle="Access our student and parent portals">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <PortalCard
            href="/login?role=student"
            title="Student Portal"
            description="Access assignments, grades, schedules, and resources"
            icon="🎓"
            delay={0}
          />
          <PortalCard
            href="/login?role=parent"
            title="Parent Portal"
            description="Monitor your child's progress, attendance, and school communications"
            icon="👨‍👩‍👧‍👦"
            delay={150}
          />
        </div>
      </Section>

      {/* Call to Action Section */}
      <section className="relative w-full py-16 sm:py-20 md:py-24 overflow-hidden bg-white">
        {/* Decorative gradient overlays */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-600 text-lg sm:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-center">
            Join our community of learners and discover the difference quality education makes. 
            Apply now and take the first step towards a brighter future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-105 transform shadow-xl hover:shadow-2xl"
            >
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-8 py-4 text-base sm:text-lg rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
      </div>
    </ErrorBoundary>
  );
}

"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import PlayfulHero from "./../components/PlayfulHero";
import Section from "./../components/Section";
import ImageGrid from "./../components/ImageGrid";
import Image from "next/image";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

export default function Gallery() {
  const { schoolName } = useSchoolProfile();
  const allImages = [
    { src: "/FrontEndImages/freepik__a-warm-welcoming-school-homepage-header-bright-mod__3236.png", alt: "School welcome" },
    { src: "/FrontEndImages/freepik__cinematic-documentary-photography-style-school-hom__3233.png", alt: "School campus" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png", alt: "Secondary school building" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png", alt: "School library" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png", alt: "Sports field" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png", alt: "Nursery students" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-yellow-school-bus-picking-up__3243.png", alt: "School bus" },
    { src: "/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png", alt: "Art class" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3234.png", alt: "Primary students" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3237.png", alt: "School activities" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png", alt: "Students learning" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png", alt: "School community" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png", alt: "School event" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3246.png", alt: "Students" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3247.png", alt: "Classroom" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3248.png", alt: "Learning" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3249.png", alt: "School life" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3250.png", alt: "Education" },
    { src: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3251.png", alt: "Students studying" },
  ];

  const academicImages = allImages.filter((_, i) => i % 3 === 0 || i % 3 === 1);
  const campusImages = allImages.filter((_, i) => i % 3 === 1 || i % 3 === 2);
  const activitiesImages = allImages.filter((_, i) => i % 3 === 0 || i % 3 === 2);

  const { isDarkMode } = useHomepageDarkMode();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation />
      
      <PlayfulHero
        title="Photo Gallery"
        subtitle="Capturing Moments of Excellence and Growth"
        description={`Welcome to ${schoolName}'s Photo Gallery - a visual journey showcasing our quality education and exceptional school experience. Explore our beautiful campus and vibrant community.`}
        imageUrl="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=800&fit=crop&crop=faces"
        gradientFrom="from-pink-600"
        gradientTo="to-rose-500"
      />

      {/* Photo Category Section */}
      <Section title="Photo Category" subtitle="Explore our beautiful campus and vibrant school community">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12">
          {/* Left Side - Circular Image */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80 rounded-full overflow-hidden border-8 border-blue-100 shadow-2xl">
              <Image
                src={campusImages[0]?.src || allImages[0].src}
                alt="Students"
                fill
                className="object-cover"
                sizes="320px"
                suppressHydrationWarning
              />
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-pink-300 rounded-full opacity-60"></div>
          </div>
          
          {/* Right Side - Category Icons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-pink-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">👶</div>
              <h3 className="font-bold text-gray-900">Baby Play</h3>
            </div>
            <div className="bg-green-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h3 className="font-bold text-gray-900">Activities Classes</h3>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold text-gray-900">Painting</h3>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🛏️</div>
              <h3 className="font-bold text-gray-900">Baby Sitting</h3>
            </div>
          </div>
        </div>
        <ImageGrid images={campusImages.slice(0, 6)} columns={3} />
      </Section>

      <Section bgColor="gray" title="Academic Excellence" subtitle="Learning in action across all levels">
        <ImageGrid images={academicImages.slice(0, 6)} columns={3} />
      </Section>

      <Section title="Sports & Activities" subtitle="Students engaged in sports, arts, and extracurricular activities">
        <ImageGrid images={activitiesImages.slice(0, 6)} columns={3} />
      </Section>

      <Section bgColor="gray" title="Events & Celebrations" subtitle="Special moments and school celebrations">
        <ImageGrid images={allImages.slice(12, 19)} columns={3} />
      </Section>

      <Section title="Complete Gallery">
        <ImageGrid images={allImages} columns={3} />
      </Section>

      <Footer />
    </div>
  );
}


"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import ImageGrid from "./../components/ImageGrid";

export default function Gallery() {
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

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Capturing Excellence - Moments That Define Our Journey"
        title="Photo Gallery"
        subtitle="Capturing Moments of Excellence and Growth"
        description="Welcome to Elite Academy's Photo Gallery - a visual journey showcasing our quality education and exceptional school experience. Explore our beautiful campus, witness our students in action, and see the vibrant community that makes our school a special place. Every photo tells a story of learning, growth, and achievement. Experience the moments that define excellence in education at Elite Academy."
        imagePath="/FrontEndImages/freepik__a-warm-welcoming-school-homepage-header-bright-mod__3236.png"
        simple={true}
      />

      <Section title="Campus Life" subtitle="Explore our beautiful campus and vibrant school community">
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


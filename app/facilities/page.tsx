"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";
import Image from "next/image";

export default function Facilities() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="State-of-the-Art Facilities - Where Learning Comes to Life"
        title="Our Facilities"
        subtitle="World-Class Infrastructure for Excellence"
        description="Welcome to Elite Academy's World-Class Facilities - where quality education meets exceptional infrastructure. Experience state-of-the-art facilities designed to inspire learning and support every aspect of student development. From modern classrooms and fully-equipped science labs to expansive sports fields and creative spaces, our campus provides the perfect environment for academic excellence and personal growth. Discover how our facilities enhance the overall school experience."
        imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
        simple={true}
      />

      <Section title="World-Class Campus Infrastructure" subtitle="Modern facilities designed to inspire learning and support holistic development">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Elite Academy boasts modern, well-equipped facilities that support all aspects of
            student development. From cutting-edge science laboratories to expansive sports
            fields, our campus provides an environment where students can learn, explore, and
            excel.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Every facility is designed with safety, functionality, and student needs in mind,
            ensuring optimal learning experiences across all programs.
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Sports Fields"
            description="Expansive sports fields for football, rugby, and athletics. Well-maintained grass fields with proper markings and equipment for various sports activities."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
            imageAlt="Sports fields"
          />
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Basketball Court</h4>
              <p className="text-gray-600 text-sm">
                Indoor basketball court with professional flooring and equipment for practice
                and competitive games.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Swimming Pool</h4>
              <p className="text-gray-600 text-sm">
                Olympic-size swimming pool with certified lifeguards and swimming instruction
                for all levels.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Tennis Courts</h4>
              <p className="text-gray-600 text-sm">
                Multiple tennis courts with professional surfaces for training and competitive play.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Gymnasium</h4>
              <p className="text-gray-600 text-sm">
                Fully equipped gym with modern fitness equipment for physical education and
                after-school fitness programs.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Support & Service Facilities" subtitle="Comprehensive support services for student well-being">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Cafeteria</h4>
            <p className="text-gray-600 text-sm">
              Spacious cafeteria serving nutritious meals, snacks, and beverages. Menu options
              accommodate various dietary needs and preferences.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Health Center</h4>
            <p className="text-gray-600 text-sm">
              On-campus health center with qualified nurses and first aid facilities. Regular
              health check-ups and emergency care available.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Counseling Center</h4>
            <p className="text-gray-600 text-sm">
              Professional counseling services for academic, career, and personal guidance.
              Private consultation rooms for student support.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Administrative Offices</h4>
            <p className="text-gray-600 text-sm">
              Well-organized administrative offices for admissions, finance, and general
              inquiries. Friendly staff ready to assist students and parents.
            </p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Safe & Reliable Transportation" subtitle="Convenient school bus service for all students">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">School Bus Service</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our fleet of modern, safe school buses provides reliable transportation services
              across the city. All buses are equipped with GPS tracking, safety features, and
              are driven by certified, experienced drivers.
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>• GPS tracking for real-time bus location</li>
              <li>• Safety protocols and trained drivers</li>
              <li>• Multiple routes covering all areas</li>
              <li>• Parent notifications for delays or changes</li>
              <li>• Affordable transportation fees</li>
            </ul>
          </div>
          <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/FrontEndImages/freepik__35mm-film-photography-yellow-school-bus-picking-up__3243.png"
              alt="School bus"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section title="Safety & Security Measures" subtitle="Ensuring a secure learning environment for all">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">24/7 Security</h4>
              <p className="text-gray-600 text-sm">
                Professional security personnel and surveillance systems ensure campus safety
                at all times. Controlled access points and visitor management protocols.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Emergency Preparedness</h4>
              <p className="text-gray-600 text-sm">
                Comprehensive emergency response plans, fire safety systems, and regular drills
                ensure student and staff safety in all situations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Health & Hygiene</h4>
              <p className="text-gray-600 text-sm">
                Clean, well-maintained facilities with proper sanitation, handwashing stations,
                and health protocols throughout the campus.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold text-gray-900 mb-3">Maintenance</h4>
              <p className="text-gray-600 text-sm">
                Regular maintenance and upgrades ensure all facilities remain in excellent
                condition and meet the highest standards.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


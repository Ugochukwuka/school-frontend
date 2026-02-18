"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import PlayfulHero from "./../components/PlayfulHero";
import Section from "./../components/Section";
import ColorfulSection from "./../components/ColorfulSection";
import TeamCarousel from "./../components/TeamCarousel";
import Card from "./../components/Card";
import Image from "next/image";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

export default function Secondary() {
  const { schoolName } = useSchoolProfile();
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PlayfulHero
        title="Secondary Education"
        subtitle="Preparing for Success, Grades 7-12"
        description={`Welcome to ${schoolName}'s Secondary Education Program - where quality education prepares students for university and beyond. Experience excellence through our rigorous academic programs.`}
        ctaText="Explore Programs"
        ctaLink="/academics"
        imageUrl="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=800&fit=crop&crop=faces"
        gradientFrom="from-indigo-600"
        gradientTo="to-purple-500"
      />

      {/* Certificate Section */}
      <Section title="Proactively Incentivize User-Centric Quality Vectors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Proactively incentivize user-centric quality vectors without interactive action items.
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Our Secondary program prepares students for higher education and future careers through
              a challenging curriculum, specialized subject tracks, and comprehensive support services.
              We focus on developing critical thinking, research skills, and independence.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With experienced faculty, modern facilities, and a track record of academic excellence,
              we ensure every student is well-prepared for their next steps in life.
            </p>
          </div>
          
          {/* Right Side - Certificate Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">CERTIFICATE OF APPRECIATION</div>
                <div className="text-2xl text-gray-700 mb-2">Name Surname</div>
                <div className="text-xl text-gray-600 mb-6">2023 AWARD</div>
                <div className="w-24 h-24 mx-auto bg-yellow-400 rounded-full flex items-center justify-center text-4xl">
                  🏆
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Team Section */}
      <Section title="Our Team" subtitle="Meet our experienced secondary educators">
        <TeamCarousel
          members={[
            {
              name: "Robert Martinez",
              role: "Science Specialist",
              imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-yellow-400",
            },
            {
              name: "Jennifer Lee",
              role: "Mathematics Teacher",
              imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-pink-400",
            },
            {
              name: "Mark Stevens",
              role: "English Literature Teacher",
              imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
              bgColor: "bg-blue-400",
            },
          ]}
        />
      </Section>

      <Section bgColor="gray" title="Academic Tracks">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            title="Science Track"
            description="Advanced courses in Physics, Chemistry, Biology, and Mathematics. Perfect for students pursuing careers in medicine, engineering, technology, or research."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
            imageAlt="Science track"
          />
          <Card
            title="Arts & Humanities"
            description="Comprehensive study of Literature, History, Geography, Languages, and Social Sciences. Ideal for careers in law, journalism, education, or public service."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Arts track"
          />
          <Card
            title="Commerce & Business"
            description="Business Studies, Economics, Accounting, and Mathematics. Prepares students for careers in business, finance, entrepreneurship, or management."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png"
            imageAlt="Commerce track"
          />
        </div>
      </Section>

      <Section title="Core Subjects">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Mathematics</h4>
            <p className="text-sm text-gray-600">
              Algebra, Geometry, Trigonometry, Calculus, and Statistics. Advanced placement
              options available for high-achieving students.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Sciences</h4>
            <p className="text-sm text-gray-600">
              Physics, Chemistry, Biology with fully equipped laboratories. Students conduct
              independent research projects.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
            <p className="text-sm text-gray-600">
              English, French, and local languages with emphasis on literature, composition,
              and communication skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Social Sciences</h4>
            <p className="text-sm text-gray-600">
              History, Geography, Economics, and Civics. Students develop critical analysis
              and research skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Technology</h4>
            <p className="text-sm text-gray-600">
              Computer Science, Programming, and Digital Literacy. Students learn coding,
              web development, and technology applications.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Arts</h4>
            <p className="text-sm text-gray-600">
              Visual Arts, Music, Drama, and Design. Students showcase their work in annual
              exhibitions and performances.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Physical Education</h4>
            <p className="text-sm text-gray-600">
              Sports, fitness, and health education. Competitive teams and intramural sports
              available for all students.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Life Skills</h4>
            <p className="text-sm text-gray-600">
              Career guidance, financial literacy, leadership, and personal development programs
              prepare students for adulthood.
            </p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="College Preparation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Academic Support</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• College entrance exam preparation (SAT, ACT, local exams)</li>
              <li>• Advanced Placement (AP) courses</li>
              <li>• Research and thesis writing support</li>
              <li>• Study skills and time management workshops</li>
              <li>• Academic tutoring and mentoring</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Guidance</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Career counseling and assessment</li>
              <li>• University application assistance</li>
              <li>• Scholarship and financial aid guidance</li>
              <li>• Internship and work experience programs</li>
              <li>• Alumni network and mentorship</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Extracurricular Activities">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Sports Teams</h4>
            <p className="text-gray-600 text-sm mb-3">
              Competitive teams in football, basketball, volleyball, track & field, and more.
              Students compete at regional and national levels.
            </p>
            <p className="text-xs text-gray-500">Ages 12-18</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Clubs & Societies</h4>
            <p className="text-gray-600 text-sm mb-3">
              Debate club, science club, drama society, music ensemble, robotics club, and
              many more interest-based groups.
            </p>
            <p className="text-xs text-gray-500">All students welcome</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Leadership Programs</h4>
            <p className="text-gray-600 text-sm mb-3">
              Student council, prefect system, peer mentoring, and community service projects
              develop leadership and responsibility.
            </p>
            <p className="text-xs text-gray-500">Leadership opportunities</p>
          </div>
        </div>
      </Section>

      <Section bgColor="blue" title="Success Stories">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl text-gray-700 mb-8">
            Our graduates have been accepted to top universities worldwide and are making
            significant contributions in their chosen fields.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <p className="text-gray-700">University Acceptance Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
              <p className="text-gray-700">Scholarship Recipients</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <p className="text-gray-700">Universities Worldwide</p>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


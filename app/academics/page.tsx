"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import AcademicsHero from "./../components/AcademicsHero";
import Section from "./../components/Section";
import Card from "./../components/Card";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

export default function Academics() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Navigation />
      
      <AcademicsHero
        title="Academics"
        subtitle="EXCELLENCE IN"
        features={["Rigorous Curriculum", "Innovative Teaching", "Outstanding Results"]}
        ctaText="Explore Programs"
        ctaLink="/courses"
        studentImage="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=800&fit=crop&crop=faces"
      />

      <Section 
        title="Our Educational Philosophy" 
        subtitle="A comprehensive curriculum designed to prepare students for success in academics and life"
      >
        <div className="max-w-4xl mx-auto mt-16">
          {/* Main content with improved typography and structure */}
          <div className="space-y-6">
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed text-left font-normal">
              At {schoolName}, we believe in providing a balanced education that combines
              academic rigor with practical skills and character development. Our curriculum
              is designed to challenge students while fostering creativity, critical thinking,
              and a love for lifelong learning.
            </p>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed text-left font-normal">
              We follow international best practices while maintaining strong local values,
              ensuring our students are well-prepared for both local and global opportunities.
            </p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Academic Divisions" subtitle="Tailored programs for every stage of learning">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Card
            title="Nursery (Ages 2-5)"
            description="Early childhood education focusing on play-based learning, social skills, and foundational literacy and numeracy. Our nurturing environment helps young learners develop confidence and curiosity."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png"
            imageAlt="Nursery program"
            link="/nursery"
          />
          <Card
            title="Primary (Grades 1-6)"
            description="Comprehensive primary education with strong emphasis on core subjects: Mathematics, English, Science, and Social Studies. Students also explore Arts, Music, and Physical Education."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3234.png"
            imageAlt="Primary program"
            link="/primary"
          />
          <Card
            title="Secondary (Grades 7-12)"
            description="Advanced curriculum with subject specialization, preparation for national and international examinations, and career guidance. Students choose from Science, Arts, and Commerce streams."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
            imageAlt="Secondary program"
            link="/secondary"
          />
        </div>
      </Section>

      <Section title="Core Academic Subjects" subtitle="Comprehensive coverage of essential learning areas">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: "Mathematics",
              description: "From basic numeracy to advanced calculus, our mathematics program builds strong analytical and problem-solving skills.",
              icon: "🔢",
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
              textColor: "text-blue-600",
            },
            {
              title: "Sciences",
              description: "Hands-on experiments and inquiry-based learning in Physics, Chemistry, and Biology with fully equipped laboratories.",
              icon: "🔬",
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50",
              textColor: "text-green-600",
            },
            {
              title: "Languages",
              description: "English, French, and local languages with emphasis on communication, literature, and cultural appreciation.",
              icon: "📚",
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
              textColor: "text-purple-600",
            },
            {
              title: "Social Studies",
              description: "History, Geography, and Civics that help students understand their world and develop global citizenship.",
              icon: "🌍",
              color: "from-orange-500 to-orange-600",
              bgColor: "bg-orange-50",
              textColor: "text-orange-600",
            },
            {
              title: "Arts & Design",
              description: "Visual arts, music, drama, and design technology to nurture creativity and self-expression.",
              icon: "🎨",
              color: "from-pink-500 to-pink-600",
              bgColor: "bg-pink-50",
              textColor: "text-pink-600",
            },
            {
              title: "Physical Education",
              description: "Sports, fitness, and health education promoting physical well-being and teamwork.",
              icon: "⚽",
              color: "from-red-500 to-red-600",
              bgColor: "bg-red-50",
              textColor: "text-red-600",
            },
            {
              title: "Technology",
              description: "Computer science, coding, and digital literacy preparing students for the technology-driven future.",
              icon: "💻",
              color: "from-cyan-500 to-cyan-600",
              bgColor: "bg-cyan-50",
              textColor: "text-cyan-600",
            },
            {
              title: "Character Education",
              description: "Values-based education focusing on ethics, leadership, and social responsibility.",
              icon: "🌟",
              color: "from-yellow-500 to-yellow-600",
              bgColor: "bg-yellow-50",
              textColor: "text-yellow-600",
            },
          ].map((subject, index) => (
            <div
              key={index}
              className={`group relative ${isDarkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-opacity-50 overflow-hidden`}
              style={{
                borderColor: isDarkMode ? undefined : subject.textColor.replace("text-", "").split("-")[0] + "-200",
              }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-14 h-14 ${isDarkMode ? "bg-gray-700" : subject.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{subject.icon}</span>
              </div>
              
              {/* Content */}
              <h4 className={`font-bold text-lg mb-3 ${isDarkMode ? "text-white group-hover:text-orange-400" : "text-gray-900"} transition-colors duration-300`}>
                {subject.title}
              </h4>
              <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {subject.description}
              </p>
              
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>
      </Section>

      <Section bgColor="gray" title="Innovative Teaching Methodology" subtitle="Modern approaches that engage and inspire students">
        <div className="max-w-5xl mx-auto space-y-6">
          {[
            {
              title: "Student-Centered Learning",
              description: "Our teachers act as facilitators, encouraging students to take ownership of their learning through inquiry, collaboration, and critical thinking.",
              icon: "👥",
              gradient: "from-blue-500 via-blue-400 to-cyan-500",
              accent: "bg-blue-500",
            },
            {
              title: "Differentiated Instruction",
              description: "We recognize that every student learns differently. Our teachers adapt their methods to meet individual needs, ensuring all students can succeed.",
              icon: "🎯",
              gradient: "from-purple-500 via-purple-400 to-pink-500",
              accent: "bg-purple-500",
            },
            {
              title: "Technology Integration",
              description: "Smart classrooms, digital resources, and online learning platforms enhance traditional teaching methods and prepare students for the digital age.",
              icon: "💡",
              gradient: "from-orange-500 via-orange-400 to-red-500",
              accent: "bg-orange-500",
            },
            {
              title: "Assessment for Learning",
              description: "Continuous assessment helps identify strengths and areas for improvement, allowing for timely intervention and personalized support.",
              icon: "📊",
              gradient: "from-green-500 via-green-400 to-teal-500",
              accent: "bg-green-500",
            },
          ].map((method, index) => (
            <div
              key={index}
              className={`group relative ${isDarkMode ? "bg-gray-800" : "bg-white"} p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border-l-4 ${method.accent}`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${method.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex items-start gap-6">
                {/* Icon Circle */}
                <div className={`flex-shrink-0 w-16 h-16 ${method.accent} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <span className="text-3xl">{method.icon}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className={`font-bold text-xl mb-3 ${isDarkMode ? "text-white group-hover:text-orange-400" : "text-gray-900"} transition-colors duration-300`}>
                    {method.title}
                  </h4>
                  <p className={`text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {method.description}
                  </p>
                </div>
                
                {/* Arrow indicator */}
                <div className={`flex-shrink-0 w-10 h-10 ${method.accent} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${method.accent} opacity-0 group-hover:opacity-5 rounded-full blur-3xl transition-opacity duration-500`}></div>
              <div className={`absolute bottom-0 left-0 w-24 h-24 ${method.accent} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`}></div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Proven Academic Excellence" subtitle="Outstanding results that speak for themselves">
        <div className="max-w-6xl mx-auto">
          {/* Dark Blue Statistics Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20">
              {/* Pass Rate */}
              <div className="p-8 md:p-12 text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">98%</div>
                <h4 className="text-xl md:text-2xl font-semibold text-white mb-2">Pass Rate</h4>
                <p className="text-white/80 text-sm md:text-base">Consistent high performance in national examinations</p>
              </div>
              
              {/* Distinction Rate */}
              <div className="p-8 md:p-12 text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">85%</div>
                <h4 className="text-xl md:text-2xl font-semibold text-white mb-2">Distinction Rate</h4>
                <p className="text-white/80 text-sm md:text-base">Students achieving top grades annually</p>
              </div>
              
              {/* Scholarships */}
              <div className="p-8 md:p-12 text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">150+</div>
                <h4 className="text-xl md:text-2xl font-semibold text-white mb-2">Scholarships</h4>
                <p className="text-white/80 text-sm md:text-base">Merit-based scholarships awarded each year</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


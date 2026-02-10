"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";

export default function Academics() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Excellence in Learning - Where Knowledge Meets Innovation"
        title="Academics"
        subtitle="Rigorous Curriculum, Innovative Teaching, Outstanding Results"
        description="Welcome to Elite Academy's Academic Excellence Program. Experience quality education through our comprehensive curriculum that combines traditional excellence with modern innovation. From early childhood to secondary education, we provide rigorous academic programs that challenge minds, inspire creativity, and prepare students for success in higher education and beyond. Our innovative teaching methods and outstanding results make us a leader in educational excellence."
        imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
        simple={true}
      />

      <Section title="Our Educational Philosophy" subtitle="A comprehensive curriculum designed to prepare students for success in academics and life">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            At Elite Academy, we believe in providing a balanced education that combines
            academic rigor with practical skills and character development. Our curriculum
            is designed to challenge students while fostering creativity, critical thinking,
            and a love for lifelong learning.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We follow international best practices while maintaining strong local values,
            ensuring our students are well-prepared for both local and global opportunities.
          </p>
        </div>
      </Section>

      <Section bgColor="gray" title="Academic Divisions" subtitle="Tailored programs for every stage of learning">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Mathematics</h4>
            <p className="text-sm text-gray-600">
              From basic numeracy to advanced calculus, our mathematics program builds strong
              analytical and problem-solving skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Sciences</h4>
            <p className="text-sm text-gray-600">
              Hands-on experiments and inquiry-based learning in Physics, Chemistry, and Biology
              with fully equipped laboratories.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
            <p className="text-sm text-gray-600">
              English, French, and local languages with emphasis on communication, literature,
              and cultural appreciation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Social Studies</h4>
            <p className="text-sm text-gray-600">
              History, Geography, and Civics that help students understand their world and
              develop global citizenship.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Arts & Design</h4>
            <p className="text-sm text-gray-600">
              Visual arts, music, drama, and design technology to nurture creativity and
              self-expression.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Physical Education</h4>
            <p className="text-sm text-gray-600">
              Sports, fitness, and health education promoting physical well-being and teamwork.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Technology</h4>
            <p className="text-sm text-gray-600">
              Computer science, coding, and digital literacy preparing students for the
              technology-driven future.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Character Education</h4>
            <p className="text-sm text-gray-600">
              Values-based education focusing on ethics, leadership, and social responsibility.
            </p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Innovative Teaching Methodology" subtitle="Modern approaches that engage and inspire students">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-2">Student-Centered Learning</h4>
            <p className="text-gray-600">
              Our teachers act as facilitators, encouraging students to take ownership of their
              learning through inquiry, collaboration, and critical thinking.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-2">Differentiated Instruction</h4>
            <p className="text-gray-600">
              We recognize that every student learns differently. Our teachers adapt their
              methods to meet individual needs, ensuring all students can succeed.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-2">Technology Integration</h4>
            <p className="text-gray-600">
              Smart classrooms, digital resources, and online learning platforms enhance
              traditional teaching methods and prepare students for the digital age.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-2">Assessment for Learning</h4>
            <p className="text-gray-600">
              Continuous assessment helps identify strengths and areas for improvement, allowing
              for timely intervention and personalized support.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Proven Academic Excellence" subtitle="Outstanding results that speak for themselves">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-4">98%</div>
            <h4 className="font-semibold text-gray-900 mb-2">Pass Rate</h4>
            <p className="text-gray-600">Consistent high performance in national examinations</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-4">85%</div>
            <h4 className="font-semibold text-gray-900 mb-2">Distinction Rate</h4>
            <p className="text-gray-600">Students achieving top grades annually</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-4">150+</div>
            <h4 className="font-semibold text-gray-900 mb-2">Scholarships</h4>
            <p className="text-gray-600">Merit-based scholarships awarded each year</p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


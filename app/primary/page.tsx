"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";

export default function Primary() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Building Strong Foundations - Where Every Child's Potential Shines"
        title="Primary Education"
        subtitle="Building Strong Foundations, Grades 1-6"
        description="Welcome to Elite Academy's Primary Education Program - where quality education builds strong foundations for lifelong success. Experience our comprehensive curriculum that develops critical thinking, creativity, and character in students from Grades 1-6. Our primary program ensures every child receives personalized attention and support to reach their full potential while fostering a genuine love for learning. Join us for an exceptional school experience that prepares students for academic excellence."
        imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3234.png"
        simple={true}
      />

      <Section title="Primary School Program" subtitle="A comprehensive education that builds knowledge, skills, and character">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Our Primary program provides a solid academic foundation while nurturing each child's
            unique talents and interests. We focus on developing critical thinking, creativity,
            and a love for learning that will serve students throughout their educational journey.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            With small class sizes, dedicated teachers, and a balanced curriculum, we ensure
            every student receives the attention and support they need to succeed.
          </p>
        </div>
      </Section>

      <Section bgColor="gray" title="Curriculum Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Mathematics"
            description="Building strong numeracy skills from basic operations to problem-solving, geometry, and data analysis. Hands-on activities make math engaging and practical."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3251.png"
            imageAlt="Mathematics"
          />
          <Card
            title="Language Arts"
            description="Comprehensive English program covering reading, writing, grammar, vocabulary, and communication skills. Students develop fluency and confidence in expression."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
            imageAlt="Language Arts"
          />
          <Card
            title="Sciences"
            description="Inquiry-based science education covering life, physical, and earth sciences. Students conduct experiments and explore the natural world."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png"
            imageAlt="Sciences"
          />
          <Card
            title="Social Studies"
            description="History, geography, and civics help students understand their community, country, and world. Field trips and projects bring learning to life."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3237.png"
            imageAlt="Social Studies"
          />
          <Card
            title="Arts & Music"
            description="Visual arts, music, and drama programs allow students to explore creativity, develop artistic skills, and build confidence through performance."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Arts"
          />
          <Card
            title="Physical Education"
            description="Regular PE classes, sports teams, and fitness activities promote physical health, teamwork, and sportsmanship."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
            imageAlt="Physical Education"
          />
        </div>
      </Section>

      <Section title="Grade Levels">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Lower Primary (Grades 1-3)</h3>
            <p className="text-gray-600 mb-4">
              Focus on foundational skills in reading, writing, and mathematics. Students learn
              through interactive activities, games, and hands-on projects.
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>• Phonics and reading fluency</li>
              <li>• Basic writing and composition</li>
              <li>• Number operations and problem-solving</li>
              <li>• Introduction to science and social studies</li>
              <li>• Character education and values</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upper Primary (Grades 4-6)</h3>
            <p className="text-gray-600 mb-4">
              Advanced curriculum preparing students for secondary school. Emphasis on critical
              thinking, research skills, and independent learning.
            </p>
            <ul className="text-gray-600 space-y-2">
              <li>• Advanced reading comprehension and analysis</li>
              <li>• Essay writing and research projects</li>
              <li>• Complex mathematics and problem-solving</li>
              <li>• In-depth science and social studies</li>
              <li>• Leadership and responsibility</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Special Programs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Reading Program</h4>
            <p className="text-gray-600 text-sm">
              Accelerated reading program with leveled books, reading challenges, and library
              visits to develop strong reading habits and comprehension skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">STEM Activities</h4>
            <p className="text-gray-600 text-sm">
              Science, Technology, Engineering, and Mathematics projects that encourage innovation,
              experimentation, and real-world problem-solving.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Character Development</h4>
            <p className="text-gray-600 text-sm">
              Values-based education focusing on respect, responsibility, integrity, and empathy
              through classroom activities and community service projects.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Extracurricular Activities</h4>
            <p className="text-gray-600 text-sm">
              Clubs, sports teams, music ensembles, and special interest groups allow students
              to explore passions and develop talents beyond the classroom.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Assessment & Support">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Continuous Assessment</h4>
              <p className="text-gray-600 text-sm mb-4">
                Regular quizzes, projects, presentations, and portfolios provide comprehensive
                evaluation of student progress. We focus on growth and improvement, not just grades.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Individual Support</h4>
              <p className="text-gray-600 text-sm">
                Teachers provide extra help during office hours, and our learning support team
                assists students who need additional attention in specific subjects.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Parent Communication</h4>
              <p className="text-gray-600 text-sm mb-4">
                Regular parent-teacher conferences, progress reports, and online portal access
                keep parents informed about their child's academic and social development.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">Enrichment Programs</h4>
              <p className="text-gray-600 text-sm">
                Advanced students can participate in enrichment activities, competitions, and
                accelerated learning opportunities.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


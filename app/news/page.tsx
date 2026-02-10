"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";
import Image from "next/image";

export default function News() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Stay Connected - Latest Updates from Our Community"
        title="News & Announcements"
        subtitle="Stay Updated with Latest School News and Events"
        description="Welcome to Elite Academy's News & Announcements - your source for the latest updates on our quality education programs and school events. Keep up with everything happening at Elite Academy, from exciting events and student achievements to important announcements and updates. Stay connected with our vibrant school community and never miss a moment of what makes our exceptional school experience special."
        imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3237.png"
        simple={true}
      />

      <Section title="Latest News & Updates" subtitle="Stay informed about everything happening at Elite Academy">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            title="Admissions Open for 2024-2025 Academic Year"
            description="We are pleased to announce that admissions are now open for the new academic year. Limited seats available in all programs. Early application is encouraged."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png"
            imageAlt="Admissions announcement"
          />
          <Card
            title="Annual Sports Day 2024 - A Grand Success"
            description="Our annual sports day was celebrated with great enthusiasm. Students showcased their athletic talents in various competitions. Congratulations to all participants!"
            imagePath="/FrontEndImages/freepik__35mm-film-photography-private-school-sports-field-__3238.png"
            imageAlt="Sports day"
          />
          <Card
            title="Science Fair Winners Announced"
            description="Congratulations to our students who won top prizes at the regional science fair. Their innovative projects demonstrated exceptional creativity and scientific understanding."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
            imageAlt="Science fair"
          />
          <Card
            title="New Library Resources Available"
            description="Our library has been updated with new books, digital resources, and study materials. Students can now access an expanded collection of educational resources."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
            imageAlt="Library resources"
          />
          <Card
            title="Parent-Teacher Conference Schedule"
            description="Parent-teacher conferences will be held next week. Please check your portal for your scheduled time slot. We look forward to discussing your child's progress."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png"
            imageAlt="Parent teacher conference"
          />
          <Card
            title="Art Exhibition Showcases Student Talent"
            description="Our annual art exhibition featured outstanding work from students across all levels. The exhibition is open to parents and visitors this week."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-art-class-in-a-private-schoo__3244.png"
            imageAlt="Art exhibition"
          />
        </div>
      </Section>

      <Section bgColor="gray" title="Upcoming School Events" subtitle="Mark your calendar for these exciting activities">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">15</span>
                  <span className="text-sm text-gray-600">March</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Open House Day</h3>
                <p className="text-gray-600 mb-3">
                  Join us for our annual open house. Tour our facilities, meet teachers, and learn
                  about our programs. All prospective families are welcome.
                </p>
                <span className="text-sm text-blue-600 font-medium">10:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">22</span>
                  <span className="text-sm text-gray-600">March</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Day Celebration</h3>
                <p className="text-gray-600 mb-3">
                  Celebrate diversity and culture with performances, food, and activities from
                  around the world. Students and families are invited to participate.
                </p>
                <span className="text-sm text-blue-600 font-medium">All Day Event</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">05</span>
                  <span className="text-sm text-gray-600">April</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Fair</h3>
                <p className="text-gray-600 mb-3">
                  Secondary students will have the opportunity to meet professionals from various
                  fields and learn about different career paths and opportunities.
                </p>
                <span className="text-sm text-blue-600 font-medium">9:00 AM - 2:00 PM</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">12</span>
                  <span className="text-sm text-gray-600">April</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Science & Technology Expo</h3>
                <p className="text-gray-600 mb-3">
                  Students showcase their science projects, experiments, and technology innovations.
                  Open to all students, parents, and community members.
                </p>
                <span className="text-sm text-blue-600 font-medium">10:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Important Announcements" subtitle="Critical information for students and parents">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">Important: Fee Payment Deadline</h4>
                <p className="text-gray-600 text-sm mt-1">
                  The deadline for second term fee payments is March 31st. Please ensure payments
                  are made on time to avoid late fees.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">Portal Maintenance</h4>
                <p className="text-gray-600 text-sm mt-1">
                  The student and parent portal will be under maintenance on March 20th from
                  10:00 PM to 2:00 AM. We apologize for any inconvenience.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-900">New After-School Programs</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Registration is now open for new after-school programs including robotics,
                  coding, music, and sports. Check the portal for details and registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Newsletter">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Subscribe to Our Newsletter</h3>
          <p className="text-gray-600 text-center mb-6">
            Stay informed about school news, events, and important announcements delivered
            directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


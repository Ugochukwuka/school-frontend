"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Image from "next/image";

export default function Contact() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="We're Here to Help - Your Questions, Our Priority"
        title="Contact Us"
        subtitle="We're Here to Help - Get in Touch"
        description="Welcome to Elite Academy - we're here to help you discover quality education and exceptional school experience. Have questions about our programs, admissions, or facilities? Our friendly and knowledgeable team is ready to assist you. Whether you're interested in admissions, have academic inquiries, or need support, reach out through any of our convenient channels, and we'll get back to you promptly. Let's start your journey to excellence together."
        imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3246.png"
        simple={true}
      />

      <Section title="Get in Touch With Us" subtitle="We're here to help. Reach out through any of these convenient channels">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                  <p className="text-gray-600">
                    123 Education Street<br />
                    Academic District<br />
                    City, State 12345<br />
                    Country
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📞</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                  <p className="text-gray-600">
                    Main Office: (123) 456-7890<br />
                    Admissions: (123) 456-7891<br />
                    Fax: (123) 456-7892
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-600">
                    General: info@eliteacademy.edu<br />
                    Admissions: admissions@eliteacademy.edu<br />
                    Support: support@eliteacademy.edu
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🕒</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-1">Office Hours</h4>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                    Saturday: 9:00 AM - 1:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="admissions">Admissions Inquiry</option>
                  <option value="academics">Academic Information</option>
                  <option value="fees">Fees & Payments</option>
                  <option value="portal">Portal Support</option>
                  <option value="general">General Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Department-Specific Contacts" subtitle="Connect with the right team for your inquiry">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Admissions Office</h4>
            <p className="text-gray-600 text-sm mb-3">
              For questions about enrollment, applications, and school tours.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              admissions@eliteacademy.edu<br />
              (123) 456-7891
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Academic Affairs</h4>
            <p className="text-gray-600 text-sm mb-3">
              Curriculum questions, academic programs, and student progress.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              academics@eliteacademy.edu<br />
              (123) 456-7893
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Finance Office</h4>
            <p className="text-gray-600 text-sm mb-3">
              Tuition, fees, payments, and financial aid inquiries.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              finance@eliteacademy.edu<br />
              (123) 456-7894
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">IT Support</h4>
            <p className="text-gray-600 text-sm mb-3">
              Portal access, technical issues, and system support.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              support@eliteacademy.edu<br />
              (123) 456-7895
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Student Services</h4>
            <p className="text-gray-600 text-sm mb-3">
              Counseling, health services, and student support programs.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              studentservices@eliteacademy.edu<br />
              (123) 456-7896
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Transportation</h4>
            <p className="text-gray-600 text-sm mb-3">
              Bus routes, schedules, and transportation inquiries.
            </p>
            <p className="text-blue-600 text-sm font-medium">
              transport@eliteacademy.edu<br />
              (123) 456-7897
            </p>
          </div>
        </div>
      </Section>

      <Section title="Schedule a Campus Visit" subtitle="Experience Elite Academy firsthand">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule a Campus Tour</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We welcome prospective families to visit our campus and see our facilities firsthand.
              Campus tours are available Monday through Friday and on select Saturdays. Our admissions
              team will guide you through our classrooms, laboratories, sports facilities, and more.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              To schedule a tour, please contact our admissions office or use the contact form above.
              We recommend scheduling at least one week in advance.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Tour Information</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Tours last approximately 1-2 hours</li>
                <li>• Available for individuals and groups</li>
                <li>• Meet with teachers and administrators</li>
                <li>• Q&A session included</li>
              </ul>
            </div>
          </div>
          <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
              alt="Campus tour"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section bgColor="blue" title="Emergency Contact">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white text-lg mb-4">
            For emergencies during school hours, please contact:
          </p>
          <p className="text-white text-2xl font-bold mb-6">
            Emergency Hotline: (123) 456-7899
          </p>
          <p className="text-white text-sm">
            Available 24/7 during school days. For non-emergency inquiries, please use our
            regular contact channels during office hours.
          </p>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


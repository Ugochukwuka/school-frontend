"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";
import Link from "next/link";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";

export default function Portal() {
  const { schoolName } = useSchoolProfile();
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Your Digital Gateway - Access Everything in One Place"
        title="Student & Parent Portal"
        subtitle="Access Your School Information Anytime, Anywhere"
        description={`Welcome to ${schoolName}'s ERP Portal - your digital gateway to quality education management. Experience seamless access to your child's education through our comprehensive online platform. Stay connected with grades, assignments, attendance, schedules, and important announcements all in one convenient system. Our user-friendly portal ensures students, parents, and teachers remain connected 24/7, enhancing the overall school experience for everyone.`}
        imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3241.png"
        simple={true}
      />

      <Section title="Comprehensive ERP System" subtitle="All your school information in one convenient platform">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Our integrated ERP system provides students, parents, and staff with easy access
            to all school-related information. Stay connected with your child's education
            through our user-friendly online platform that brings together academics, communication,
            and administrative functions seamlessly.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Whether you're checking grades, submitting assignments, viewing schedules, or making
            payments, everything you need is just a click away.
          </p>
        </div>
      </Section>

      <Section bgColor="gray" title="Portal Features & Access" subtitle="Discover what you can do with your portal account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Student Portal"
            description="Students can access their assignments, grades, class schedules, exam results, attendance records, and school announcements. Submit homework online and communicate with teachers."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png"
            imageAlt="Student portal"
          />
          <Card
            title="Parent Portal"
            description="Parents can monitor their child's academic progress, view attendance, check fee payments, communicate with teachers, and receive important school announcements and updates."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3246.png"
            imageAlt="Parent portal"
          />
        </div>
      </Section>

      <Section title="Key Portal Features" subtitle="Everything you need to stay connected and informed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Academic Records</h4>
            <p className="text-sm text-gray-600">
              View grades, transcripts, report cards, and academic performance analytics
              with detailed breakdowns by subject and term.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Attendance Tracking</h4>
            <p className="text-sm text-gray-600">
              Real-time attendance records showing daily attendance, absences, and tardiness
              with notifications for parents.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Assignment Management</h4>
            <p className="text-sm text-gray-600">
              View and submit assignments online, track deadlines, receive feedback from
              teachers, and access learning resources.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Fee Management</h4>
            <p className="text-sm text-gray-600">
              View fee statements, payment history, make online payments, and download
              receipts for all transactions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Communication</h4>
            <p className="text-sm text-gray-600">
              Direct messaging with teachers and administrators, school announcements,
              event notifications, and parent-teacher meeting scheduling.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Timetable & Schedules</h4>
            <p className="text-sm text-gray-600">
              Access class schedules, exam timetables, school calendar, and important
              dates. Set reminders for upcoming events.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Library Resources</h4>
            <p className="text-sm text-gray-600">
              Browse library catalog, check book availability, renew loans, and access
              digital resources and e-books.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Transportation</h4>
            <p className="text-sm text-gray-600">
              View bus routes, schedules, track bus location in real-time, and receive
              transportation updates and notifications.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold text-gray-900 mb-3">Report Cards</h4>
            <p className="text-sm text-gray-600">
              Download and view digital report cards, progress reports, and academic
              transcripts in PDF format.
            </p>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Getting Started" subtitle="How to access and use your portal account">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Students</h4>
              <p className="text-gray-600 text-sm mb-4">
                Students receive their login credentials at the beginning of the academic year.
                Username is typically your student ID, and you'll set your password during
                first login.
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Username: Your Student ID</li>
                <li>• Password: Set during first login</li>
                <li>• Contact IT support if you need assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">For Parents</h4>
              <p className="text-gray-600 text-sm mb-4">
                Parent portal access is provided during enrollment. You can link multiple
                children to a single parent account for easy management.
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Username: Your registered email</li>
                <li>• Password: Set during account activation</li>
                <li>• Reset password through email recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Login" bgColor="blue">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Portal Login</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username / Student ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <Link
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-center transition-colors duration-200"
            >
              Login to Portal
            </Link>
            <p className="text-center text-sm text-gray-600">
              Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


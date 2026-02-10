"use client";

import Navigation from "./../components/Navigation";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import Section from "./../components/Section";
import Card from "./../components/Card";
import Link from "next/link";

export default function Admissions() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <Hero
        greeting="Begin Your Journey to Excellence - Join Our Elite Community Today"
        title="Admissions"
        subtitle="Join the Elite Academy Family"
        description="Welcome to Elite Academy Admissions - your gateway to quality education and exceptional school experience. Begin your child's journey to excellence today through our streamlined admissions process designed to find the perfect fit for your family. We welcome students from diverse backgrounds who are eager to learn, grow, and contribute to our vibrant school community. Experience the difference of a school committed to your child's success."
        imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3237.png"
        ctaText="Apply Now"
        ctaLink="#application"
        simple={true}
      />

      <Section title="Welcome to Elite Academy" subtitle="Your child's journey to excellence begins here">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Our admissions process is designed to help us get to know your child and ensure
            that Elite Academy is the right fit for their educational journey. We welcome
            students from diverse backgrounds who are eager to learn, grow, and contribute
            to our vibrant school community.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We accept applications year-round, but early applications are encouraged as
            spaces are limited and fill quickly.
          </p>
        </div>
      </Section>

      <Section bgColor="gray" title="Admission Requirements by Level" subtitle="Understanding what's needed for each program">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card
            title="Nursery (Ages 2-5)"
            description="Age-appropriate assessment and parent interview. Focus on readiness for structured learning environment and social interaction."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png"
            imageAlt="Nursery admissions"
          />
          <Card
            title="Primary (Grades 1-6)"
            description="Academic assessment in core subjects, previous school records, and student interview. Emphasis on academic readiness and character."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3234.png"
            imageAlt="Primary admissions"
          />
          <Card
            title="Secondary (Grades 7-12)"
            description="Comprehensive entrance examination, academic transcripts, recommendation letters, and interview. Track selection based on interests and performance."
            imagePath="/FrontEndImages/freepik__35mm-film-photography-modern-elite-secondary-schoo__3235.png"
            imageAlt="Secondary admissions"
          />
          <Card
            title="Transfer Students"
            description="We welcome transfer students at all levels. Assessment of previous academic work and interview to ensure smooth transition."
            imagePath="/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3240.png"
            imageAlt="Transfer students"
          />
        </div>
      </Section>

      <Section title="Step-by-Step Application Process" subtitle="A straightforward guide to joining Elite Academy" id="application">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Application</h3>
                <p className="text-gray-600">
                  Complete the online application form or download and submit a paper application.
                  Include all required documents: birth certificate, previous school records,
                  passport photos, and medical records.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Assessment & Interview</h3>
                <p className="text-gray-600">
                  Students will be scheduled for age-appropriate assessments and interviews.
                  Parents will also have an opportunity to meet with admissions staff to
                  discuss their child's needs and our programs.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Admission Decision</h3>
                <p className="text-gray-600">
                  Admissions decisions are typically made within 2-3 weeks after the assessment.
                  You will receive a formal letter with the decision and next steps.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enrollment</h3>
                <p className="text-gray-600">
                  Accepted students complete enrollment by submitting fees, uniform orders,
                  and final documentation. Orientation programs help new families integrate
                  into our community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Important Admission Dates" subtitle="Key deadlines and timelines for the academic year">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Application Period Opens</h4>
                <p className="text-sm text-gray-600">September 1st</p>
              </div>
              <span className="text-blue-600 font-semibold">Early Application</span>
            </div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Priority Deadline</h4>
                <p className="text-sm text-gray-600">December 15th</p>
              </div>
              <span className="text-blue-600 font-semibold">Recommended</span>
            </div>
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h4 className="font-semibold text-gray-900">Regular Deadline</h4>
                <p className="text-sm text-gray-600">March 1st</p>
              </div>
              <span className="text-gray-600">Space Permitting</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900">Academic Year Begins</h4>
                <p className="text-sm text-gray-600">August 15th</p>
              </div>
              <span className="text-green-600 font-semibold">New Students Welcome</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tuition & Fees Information" subtitle="Transparent pricing and financial support options">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Nursery</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">$X,XXX</div>
            <p className="text-gray-600 text-sm mb-4">Per academic year</p>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li>• Includes all materials</li>
              <li>• Meals included</li>
              <li>• After-school care available</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Primary</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">$X,XXX</div>
            <p className="text-gray-600 text-sm mb-4">Per academic year</p>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li>• All textbooks included</li>
              <li>• Technology fees included</li>
              <li>• Extracurricular activities</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Secondary</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">$X,XXX</div>
            <p className="text-gray-600 text-sm mb-4">Per academic year</p>
            <ul className="text-left text-sm text-gray-600 space-y-2">
              <li>• Advanced courses included</li>
              <li>• College prep programs</li>
              <li>• Lab and technology fees</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Financial aid and scholarship opportunities are available for qualified students.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Contact Admissions Office
          </Link>
        </div>
      </Section>

      <Section bgColor="blue" title="Ready to Apply?">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Apply?
              </h2>
              <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Start your child's journey to excellence today. Our admissions team is here to
                guide you through every step of the process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/contact"
                  className="group bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-3 min-w-[220px] justify-center"
                >
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  Schedule a Visit
                </Link>
                <Link
                  href="/contact"
                  className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-3 min-w-[220px] justify-center"
                >
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download Application Form
                </Link>
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/20">
                <p className="text-blue-100 text-sm md:text-base">
                  Have questions? Our admissions office is ready to help.
                </p>
                <Link
                  href="/contact"
                  className="inline-block mt-3 text-white hover:text-blue-200 underline underline-offset-4 transition-colors duration-200 font-medium"
                >
                  Contact Us Today →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}


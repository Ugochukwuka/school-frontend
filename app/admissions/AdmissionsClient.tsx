"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import PlayfulHero from "../components/PlayfulHero";
import Section from "../components/Section";
import ColorfulSection from "../components/ColorfulSection";
import ApplicationStep from "../components/ApplicationStep";
import PopularClasses from "../components/PopularClasses";
import RedefiningEducation from "../components/RedefiningEducation";
import FAQAccordion from "../components/FAQAccordion";
import Image from "next/image";
import Link from "next/link";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";
import api from "@/app/lib/api";
import {
  type TuitionFee,
  getCardStyle,
  formatAmount,
  formatBillingCycle,
} from "./tuitionFeeUtils";

export default function AdmissionsClient() {
  const { schoolName } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  const [tuitionFees, setTuitionFees] = useState<TuitionFee[]>([]);
  const [tuitionLoading, setTuitionLoading] = useState(true);

  useEffect(() => {
    const fetchTuitionFees = async () => {
      try {
        const response = await api.get<TuitionFee[] | { data: TuitionFee[] }>("/viewAllTuitionFees");
        let data: TuitionFee[] = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && typeof response.data === "object" && "data" in response.data && Array.isArray((response.data as { data: TuitionFee[] }).data)) {
          data = (response.data as { data: TuitionFee[] }).data;
        }
        setTuitionFees(data);
      } catch {
        setTuitionFees([]);
      } finally {
        setTuitionLoading(false);
      }
    };
    fetchTuitionFees();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      <PlayfulHero
        title="Admissions"
        subtitle={`Join the ${schoolName} Family`}
        description={`Welcome to ${schoolName} Admissions - your gateway to quality education and exceptional school experience. Begin your child's journey to excellence today.`}
        ctaText="Apply Now"
        ctaLink="#application"
        imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
        gradientFrom="from-orange-600"
        gradientTo="to-red-500"
      />

      <ColorfulSection bgColor="yellow" title="Ask About Kids Acts">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=800&fit=crop&crop=faces"
                alt="Children exploring"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                suppressHydrationWarning
              />
            </div>
            <div className="absolute -top-4 -right-4 text-4xl">⭐</div>
            <div className="absolute -bottom-4 -left-4 text-3xl">🌍</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl">
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              <input type="tel" placeholder="Phone number" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              <input type="text" placeholder="Studying Class" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300">Submit</button>
            </form>
          </div>
        </div>
      </ColorfulSection>

      <Section bgColor="white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PopularClasses
            classes={[
              { id: 1, name: "Playgroup", ageRange: "1.8-3 YEARS", ageColor: "bg-blue-500", nameColor: "text-pink-600", description: "By creating a safe, consistent and welcoming environment", imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3245.png", imageAlt: "Playgroup class" },
              { id: 2, name: "Nursery", ageRange: "2.5-4 YEARS", ageColor: "bg-orange-500", nameColor: "text-orange-600", description: "By creating a safe, consistent and welcoming environment", imagePath: "/FrontEndImages/freepik__35mm-film-photography-toddlers-in-a-bright-african__3239.png", imageAlt: "Nursery class" },
              { id: 3, name: "Junior", ageRange: "3.5-5 YEARS", ageColor: "bg-green-500", nameColor: "text-green-600", description: "By creating a safe, consistent and welcoming environment", imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3246.png", imageAlt: "Junior class" },
              { id: 4, name: "Senior", ageRange: "4.5-6 YEARS", ageColor: "bg-purple-500", nameColor: "text-purple-600", description: "By creating a safe, consistent and welcoming environment", imagePath: "/FrontEndImages/freepik__the-style-is-candid-image-photography-with-natural__3247.png", imageAlt: "Senior class" },
            ]}
          />
        </div>
      </Section>

      <Section bgColor="white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RedefiningEducation
            title="We're redefining early child care education"
            activeLearningItems={[
              { id: 1, number: "01", title: "Active learning", description: "Childrens love this class room as it has many toys and educational games.", iconColor: "bg-blue-500" },
              { id: 2, number: "02", title: "Active learning", description: "Childrens love this class room as it has many toys and educational games.", iconColor: "bg-blue-300" },
              { id: 3, number: "03", title: "Active learning", description: "Childrens love this class room as it has many toys and educational games.", iconColor: "bg-pink-500" },
              { id: 4, number: "04", title: "Active learning", description: "Childrens love this class room as it has many toys and educational games.", iconColor: "bg-purple-300" },
            ]}
            mainImagePath="/FrontEndImages/freepik__35mm-film-photography-modern-school-library-africa__3242.png"
            mainImageAlt="Students learning in classroom"
          />
        </div>
      </Section>

      <Section title="Step-by-Step Application Process" subtitle={`A straightforward guide to joining ${schoolName}`} id="application">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 relative">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl hidden lg:block"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-100 rounded-full opacity-30 blur-3xl hidden lg:block"></div>
            <div className="relative z-10 space-y-12">
              <ApplicationStep number={1} title="Submit Application" description="Complete the online application form or download and submit a paper application. Include all required documents: birth certificate, previous school records, passport photos, and medical records." />
              <ApplicationStep number={2} title="Assessment & Interview" description="Students will be scheduled for age-appropriate assessments and interviews. Parents will also have an opportunity to meet with admissions staff to discuss their child's needs and our programs." />
              <ApplicationStep number={3} title="Admission Decision" description="Admissions decisions are typically made within 2-3 weeks after the assessment. You will receive a formal letter with the decision and next steps." />
              <ApplicationStep number={4} title="Enrollment" description="Accepted students complete enrollment by submitting fees, uniform orders, and final documentation. Orientation programs help new families integrate into our community." isLast={true} />
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Important Admission Dates" subtitle="Key deadlines and timelines for the academic year">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div><h4 className="font-semibold text-gray-900">Application Period Opens</h4><p className="text-sm text-gray-600">September 1st</p></div>
                <span className="text-blue-600 font-semibold">Early Application</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div><h4 className="font-semibold text-gray-900">Priority Deadline</h4><p className="text-sm text-gray-600">December 15th</p></div>
                <span className="text-blue-600 font-semibold">Recommended</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div><h4 className="font-semibold text-gray-900">Regular Deadline</h4><p className="text-sm text-gray-600">March 1st</p></div>
                <span className="text-gray-600">Space Permitting</span>
              </div>
              <div className="flex justify-between items-center">
                <div><h4 className="font-semibold text-gray-900">Academic Year Begins</h4><p className="text-sm text-gray-600">August 15th</p></div>
                <span className="text-green-600 font-semibold">New Students Welcome</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tuition & Fees Information" subtitle="Transparent pricing and financial support options">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {tuitionLoading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading tuition fees...</div>
            ) : tuitionFees.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No tuition fees available at the moment.</div>
            ) : (
              tuitionFees.map((fee) => {
                const style = getCardStyle(fee.class_category);
                const isPrimary = fee.class_category === "Primary";
                return (
                  <div
                    key={fee.id}
                    className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border ${isPrimary ? "border-2 border-blue-500" : ""} ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                  >
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${style.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`}></div>
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${style.accent}`}></div>
                    {"popular" in style && style.popular && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20">POPULAR</div>
                    )}
                    <div className="relative p-8 text-center">
                      <div className="mb-6 flex justify-center">
                        <div className={`relative w-20 h-20 bg-gradient-to-br ${style.iconBg} rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${style.iconHover} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}></div>
                          <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${style.hoverText} ${isDarkMode ? "text-white" : "text-gray-900"}`}>{fee.class_category}</h3>
                      <div className="mb-2">
                        <span className={`text-5xl font-bold bg-gradient-to-r ${style.textGradient} bg-clip-text text-transparent`}>{formatAmount(fee.amount)}</span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{formatBillingCycle(fee.billing_cycle)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="text-center mt-12 relative z-10">
            <div className={`inline-block p-6 rounded-2xl shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <p className={`text-lg mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Financial aid and scholarship opportunities are available for qualified students.</p>
              <Link href="/contact" className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Contact Admissions Office
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="blue" title="Ready to Apply?">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">Start your child's journey to excellence today. Our admissions team is here to guide you through every step of the process.</p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <Link href="/contact" className="group bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3 min-w-[200px] justify-center">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Schedule a Visit
                </Link>
                <Link href="/contact" className="group bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 transform flex items-center gap-3 min-w-[200px] justify-center">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download Application Form
                </Link>
              </div>
              <div className="mt-10 pt-8 border-t border-white/20">
                <p className="text-blue-100 text-sm md:text-base">Have questions? Our admissions office is ready to help.</p>
                <Link href="/contact" className="inline-block mt-3 text-white hover:text-blue-200 underline underline-offset-4 transition-colors duration-200 font-medium">Contact Us Today →</Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bgColor="gray" title="Frequently Asked Questions" subtitle="Everything you need to know about our admissions process">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="relative order-2 lg:order-1">
            <div className="relative w-full h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop" alt="Students and parents discussing admissions" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" suppressHydrationWarning />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent"></div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-400 rounded-full opacity-80 shadow-lg transform rotate-12 hidden lg:block"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-4 border-orange-200 rounded-full opacity-60 hidden lg:block"></div>
          </div>
          <div className="order-1 lg:order-2">
            <FAQAccordion
              title=""
              faqs={[
                { id: 1, question: "What are the age requirements for admission?", answer: "Our programs accept students based on age ranges: Nursery (2-5 years), Primary (6-11 years), and Secondary (12-18 years). Age is calculated as of September 1st of the academic year. We also consider developmental readiness and may make exceptions on a case-by-case basis." },
                { id: 2, question: "What documents are required for the application?", answer: "Required documents include: birth certificate or passport, previous school records (if applicable), passport-sized photographs, medical records and immunization certificates, parent/guardian identification, and completed application form. International students may need additional documentation such as visa and residency permits." },
                { id: 3, question: "Is there an application fee?", answer: "Yes, there is a non-refundable application fee that covers the processing of your application and assessment costs. The fee amount varies by program level. Please contact our admissions office for current fee information, as fees may be waived for families demonstrating financial need." },
                { id: 4, question: "What does the assessment process involve?", answer: "The assessment process is age-appropriate and designed to understand each child's academic readiness, social skills, and learning style. For younger children, it may include play-based observations and parent interviews. Older students may complete written assessments in core subjects. We also conduct family interviews to ensure a good fit between the school and family values." },
                { id: 5, question: "How long does the admissions process take?", answer: "Typically, the complete admissions process takes 2-4 weeks from application submission to final decision. This includes document review (1 week), assessment scheduling and completion (1 week), and decision notification (3-5 business days). During peak admission periods, processing may take slightly longer." },
                { id: 6, question: "Do you offer financial aid or scholarships?", answer: "Yes, we offer need-based financial aid and merit-based scholarships for qualified students. Financial aid applications are reviewed separately from admission applications. We encourage families to apply early, as funds are limited and awarded on a first-come, first-served basis. Contact our admissions office for detailed information about eligibility and application procedures." },
                { id: 7, question: "Can we schedule a school tour before applying?", answer: "Absolutely! We highly encourage prospective families to schedule a campus tour. Tours are available Monday through Friday and can be arranged by contacting our admissions office. During the tour, you'll see our facilities, meet with teachers, and learn more about our programs. Virtual tours are also available for families unable to visit in person." },
                { id: 8, question: "What happens if my child is placed on a waiting list?", answer: "If a program is full, qualified applicants may be placed on a waiting list. We maintain waiting lists for each grade level and notify families immediately if a space becomes available. Waiting list positions are determined by application date and assessment results. There is no additional fee for being on the waiting list." },
                { id: 9, question: "Are there any special programs for students with learning differences?", answer: "Yes, we have a learning support team that works with students who have diverse learning needs. We offer accommodations, individualized support plans, and specialized resources. During the admissions process, we assess how we can best support each child's unique learning profile. We encourage families to discuss any specific needs during the application process." },
                { id: 10, question: "What is your policy on mid-year admissions?", answer: "Mid-year admissions are considered on a space-available basis. We evaluate each case individually, considering the student's academic progress, social adjustment, and available resources. Mid-year applicants follow the same application process, though the timeline may be expedited. We recommend contacting our admissions office to discuss specific circumstances." },
              ]}
            />
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}

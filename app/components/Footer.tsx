"use client";

import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";
import { PhoneOutlined, ClockCircleOutlined, EnvironmentOutlined, MailOutlined } from "@ant-design/icons";
import { FacebookIcon, LinkedInIcon, InstagramIcon, YouTubeIcon } from "./SocialMediaIcons";
import { useState } from "react";

export default function Footer() {
  const { schoolName, motto, address, email, phone, logoPath } = useSchoolProfile();
  const { isDarkMode } = useHomepageDarkMode();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription API call
    setNewsletterSubmitted(true);
    setNewsletterEmail("");
    setTimeout(() => setNewsletterSubmitted(false), 3000);
  };

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Newsletter Section - Enhanced Design */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 sm:py-16 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large curved yellow arc */}
            <div className="absolute -left-20 top-0 w-96 h-96 bg-yellow-400 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-purple-400 rounded-full opacity-20 blur-3xl"></div>
            
            {/* Abstract decorative lines and dots */}
            <div className="absolute top-10 right-20 w-32 h-0.5 bg-white/20 rotate-45"></div>
            <div className="absolute bottom-20 left-32 w-24 h-0.5 bg-white/20 -rotate-12"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Side - Student Image */}
              <div className="relative flex-shrink-0 hidden lg:block">
                <div className="relative w-48 h-64 lg:w-56 lg:h-72">
                  <div className="absolute -top-4 -left-4 w-full h-full bg-yellow-400 rounded-2xl opacity-20 blur-xl"></div>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces"
                      alt="Student"
                      fill
                      className="object-cover"
                      sizes="224px"
                      priority
                    />
                  </div>
                  {/* Decorative yellow arc behind image */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 border-8 border-yellow-400 rounded-full opacity-40"></div>
                </div>
              </div>

              {/* Right Side - Content and Form */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Want To Stay <span className="text-yellow-300">Informed</span> About New <span className="text-yellow-300">Courses & Study</span>?
                </h3>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 mt-8 max-w-2xl mx-auto lg:mx-0">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Type Your E-Mail"
                    required
                    className="px-6 py-4 rounded-xl bg-purple-100/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all duration-300 flex-1 min-w-0 text-base font-medium shadow-lg"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-purple-700 shadow-xl hover:shadow-2xl text-base whitespace-nowrap"
                  >
                    {newsletterSubmitted ? "✓ Subscribed!" : "Subscribe Now"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
                <Logo width={40} height={40} logoPath={logoPath} />
                <span className="text-xl sm:text-2xl font-bold">{schoolName}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {motto}
              </p>
              <div className="flex items-center space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-all duration-300 hover:scale-110" aria-label="Facebook">
                  <FacebookIcon size={20} className="text-[#1877F2]" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0077B5] transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                  <LinkedInIcon size={20} className="text-[#0077B5]" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 hover:scale-110" aria-label="Instagram">
                  <InstagramIcon size={20} className="text-[#E4405F]" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF0000] transition-all duration-300 hover:scale-110" aria-label="YouTube">
                  <YouTubeIcon size={20} className="text-[#FF0000]" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-6 sm:mb-8 text-orange-400">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/academics" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Academics
                  </Link>
                </li>
                <li>
                  <Link href="/admissions" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Admissions
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Facilities
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-6 sm:mb-8 text-orange-400">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/portal" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Student Portal
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    News & Events
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-orange-400 transition-colors inline-block hover:translate-x-1">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-6 sm:mb-8 text-orange-400">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {phone && (
                  <li className="flex items-start space-x-3">
                    <PhoneOutlined className="text-orange-500 mt-1 flex-shrink-0" />
                    <a href={`tel:${phone}`} className="hover:text-orange-400 transition-colors">{phone}</a>
                  </li>
                )}
                {email && (
                  <li className="flex items-start space-x-3">
                    <MailOutlined className="text-blue-500 mt-1 flex-shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-orange-400 transition-colors break-all">{email}</a>
                  </li>
                )}
                <li className="flex items-start space-x-3">
                  <ClockCircleOutlined className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Mon - Fri 8 AM - 5 PM</span>
                </li>
                {address && (
                  <li className="flex items-start space-x-3">
                    <EnvironmentOutlined className="text-red-500 mt-1 flex-shrink-0" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
              <Link
                href="/contact"
                className="inline-block mt-4 text-orange-400 hover:text-orange-300 active:text-orange-200 transition-colors text-sm font-semibold"
              >
                Get Directions →
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-400">
              <p>&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <Link href="/about" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
                <span>|</span>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


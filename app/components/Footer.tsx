import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <Logo width={32} height={32} />
              <span className="text-lg sm:text-xl font-bold">Elite Academy</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Empowering students to achieve excellence through quality education
              and holistic development.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-gray-400 hover:text-white transition-colors">
                  Academics
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-gray-400 hover:text-white transition-colors">
                  Admissions
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/portal" className="text-gray-400 hover:text-white transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/facilities" className="text-gray-400 hover:text-white transition-colors">
                  Facilities
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                  News & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li>123 Education Street</li>
              <li>City, State 12345</li>
              <li>Phone: (123) 456-7890</li>
              <li>Email: info@eliteacademy.edu</li>
            </ul>
            <Link
              href="/contact"
              className="inline-block mt-3 sm:mt-4 text-blue-400 hover:text-blue-300 active:text-blue-200 transition-colors text-xs sm:text-sm touch-manipulation"
            >
              Get Directions →
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Elite Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


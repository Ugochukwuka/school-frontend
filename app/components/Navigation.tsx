"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { MenuOutlined, CloseOutlined, PhoneOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { FacebookIcon, LinkedInIcon, InstagramIcon } from "./SocialMediaIcons";
import { useSchoolProfile } from "@/app/lib/useSchoolProfile";
import { useHomepageDarkMode } from "@/app/lib/useHomepageDarkMode";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/facilities", label: "Facilities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;

/**
 * Professional Navigation component with accessibility, keyboard navigation, and performance optimizations
 */
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { schoolName, logoPath, phone, address, email } = useSchoolProfile();
  const { isDarkMode, toggleDarkMode, mounted } = useHomepageDarkMode();
  
  // Only show dark mode toggle on public pages (not dashboard pages)
  const isPublicPage = !pathname.startsWith("/dashboard") && !pathname.startsWith("/student") && !pathname.startsWith("/teacher") && !pathname.startsWith("/admin") && !pathname.startsWith("/parent");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open - save original value
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      document.body.style.overflow = "hidden";
      document.body.style.position = "relative";
      
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
      };
    }
    
    // Cleanup function for when menu closes
    return () => {
      if (!mobileMenuOpen) {
        document.body.style.overflow = "";
        document.body.style.position = "";
      }
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Handle keyboard navigation in mobile menu
  const handleMobileMenuKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown" && index < navLinks.length - 1) {
      e.preventDefault();
      const nextLink = document.querySelector(
        `[data-nav-link="${index + 1}"]`
      ) as HTMLElement;
      nextLink?.focus();
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      const prevLink = document.querySelector(
        `[data-nav-link="${index - 1}"]`
      ) as HTMLElement;
      prevLink?.focus();
    }
  }, []);

  return (
    <>
      {/* Top Bar with Contact Info */}
      <div className="hidden lg:block bg-gray-900 text-white py-2 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center space-x-2 hover:text-orange-400 transition-colors duration-300">
                  <PhoneOutlined className="text-orange-500" />
                  <span>Call: {phone}</span>
                </a>
              )}
              <div className="flex items-center space-x-2 text-gray-400">
                <ClockCircleOutlined className="text-blue-500" />
                <span>Mon - Fri 8 AM - 5 PM</span>
              </div>
              {address && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <EnvironmentOutlined className="text-red-500" />
                  <span>{address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group transition-all duration-300 hover:scale-110" aria-label="Facebook">
                <FacebookIcon size={20} className="text-[#1877F2] group-hover:opacity-80 transition-opacity duration-300" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                <LinkedInIcon size={20} className="text-[#0077B5] group-hover:opacity-80 transition-opacity duration-300" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group transition-all duration-300 hover:scale-110" aria-label="Instagram">
                <InstagramIcon size={20} className="text-[#E4405F] group-hover:opacity-80 transition-opacity duration-300" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        ref={navRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? isDarkMode 
              ? "shadow-lg bg-gray-900/95 backdrop-blur-sm" 
              : "shadow-lg bg-white/95 backdrop-blur-sm"
            : isDarkMode
              ? "shadow-md bg-gray-900"
              : "shadow-md bg-white"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label={`${schoolName} - Home`}
            >
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px]">
                <Logo width={50} height={50} logoPath={logoPath} className="w-full h-full" />
              </div>
              <span className={`text-base sm:text-lg lg:text-xl font-bold group-hover:text-orange-500 transition-colors duration-300 truncate max-w-[150px] sm:max-w-none ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                {schoolName}
              </span>
            </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center space-x-6" role="menubar">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    className={`relative text-base font-semibold transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded px-3 py-2 ${
                      isActive
                        ? "text-orange-600 font-bold"
                        : isDarkMode
                          ? "text-gray-200 hover:text-orange-400"
                          : "text-gray-900 hover:text-orange-600"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    role="menuitem"
                  >
                    <span className="relative z-10">{link.label}</span>
                    {isActive ? (
                      <span
                        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-orange-600 transform transition-all duration-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="absolute -bottom-1 left-3 h-0.5 bg-orange-600 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"
                        aria-hidden="true"
                      />
                    )}
                    {/* Hover background effect */}
                    <span
                      className="absolute inset-0 bg-orange-50 rounded-md transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center opacity-0 group-hover:opacity-100 -z-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              ref={menuButtonRef}
              className={`p-2 transition-colors duration-200 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="true"
            >
            <div className="transition-transform duration-300">
              {mobileMenuOpen ? (
                <CloseOutlined className="text-2xl" aria-hidden="true" />
              ) : (
                <MenuOutlined className="text-2xl" aria-hidden="true" />
              )}
            </div>
          </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-[calc(100vh-5rem)] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <ul className={`grid grid-cols-2 gap-2 sm:gap-3 pb-4 rounded-lg shadow-lg mt-2 overflow-y-auto max-h-[calc(100vh-6rem)] ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`} role="menubar">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} role="none">
                  <Link
                    data-nav-link={index}
                    href={link.href}
                    className={`text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-3 sm:px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-lg block text-center ${
                      isActive
                        ? isDarkMode
                          ? "text-orange-400 bg-orange-900/30 border-2 border-orange-400 font-bold"
                          : "text-orange-600 bg-orange-50 border-2 border-orange-600 font-bold"
                        : isDarkMode
                          ? "text-gray-200 hover:text-orange-400 hover:bg-gray-700 hover:scale-105"
                          : "text-gray-900 hover:text-orange-600 hover:bg-orange-50 hover:scale-105"
                    }`}
                    onClick={closeMobileMenu}
                    onKeyDown={(e) => handleMobileMenuKeyDown(e, index)}
                    aria-current={isActive ? "page" : undefined}
                    role="menuitem"
                    tabIndex={mobileMenuOpen ? 0 : -1}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
}

export default memo(Navigation);
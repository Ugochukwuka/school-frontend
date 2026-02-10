"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/facilities", label: "Facilities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/news", label: "News" },
  { href: "/login", label: "Login" },
  { href: "/contact", label: "Contact" },
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
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-md bg-white" : "shadow-sm bg-white"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            className="flex items-center space-x-3 group transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Elite Academy - Home"
          >
            <Logo width={50} height={50} />
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              Elite Academy
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
                    className={`relative text-base font-semibold transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2 ${
                      isActive
                        ? "text-blue-600 font-bold"
                        : "text-gray-900 hover:text-blue-600"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    role="menuitem"
                  >
                    <span className="relative z-10">{link.label}</span>
                    {isActive ? (
                      <span
                        className="absolute -bottom-1 left-3 right-3 h-0.5 bg-blue-600 transform transition-all duration-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="absolute -bottom-1 left-3 h-0.5 bg-blue-600 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"
                        aria-hidden="true"
                      />
                    )}
                    {/* Hover background effect */}
                    <span
                      className="absolute inset-0 bg-blue-50 rounded-md transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center opacity-0 group-hover:opacity-100 -z-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
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

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <ul className="flex flex-col space-y-2 pb-4 bg-white rounded-lg shadow-lg mt-2" role="menubar">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} role="none">
                  <Link
                    data-nav-link={index}
                    href={link.href}
                    className={`text-base font-semibold py-3 px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg block ${
                      isActive
                        ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600 font-bold"
                        : "text-gray-900 hover:text-blue-600 hover:bg-blue-50 hover:translate-x-2"
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
  );
}

export default memo(Navigation);
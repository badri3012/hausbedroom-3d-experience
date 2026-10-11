"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, PhoneCall } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "3D Showroom", href: "#showroom3d" },
    { name: "Explore", href: "#explore" },
    { name: "Collections", href: "#collections" },
    { name: "Personalise", href: "#personalise" },
    { name: "Our Approach", href: "#approach" },
    { name: "Contact", href: "#contact" },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#F6F3EE]/90 backdrop-blur-md py-4 border-b border-[#D8D0C5]/40 shadow-sm"
            : "bg-gradient-to-b from-black/60 via-black/20 to-transparent py-6 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="group flex flex-col focus:outline-none"
            aria-label="HausBedroom Singapore Home"
          >
            <span
              className={`font-serif-editorial text-2xl sm:text-3xl tracking-[0.2em] font-medium transition-colors ${
                scrolled ? "text-[#242421]" : "text-white"
              }`}
            >
              HAUSBEDROOM
            </span>
            <span
              className={`text-[9px] sm:text-[10px] tracking-[0.35em] uppercase font-light -mt-1 transition-colors ${
                scrolled ? "text-[#A79B8C]" : "text-white/70"
              }`}
            >
              SINGAPORE
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 relative py-1 hover:opacity-100 ${
                  scrolled
                    ? "text-[#242421]/80 hover:text-[#42372F]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#personalise"
              onClick={(e) => handleScrollTo(e, "#personalise")}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-300 shadow-sm ${
                scrolled
                  ? "bg-[#242421] text-[#F6F3EE] hover:bg-[#42372F]"
                  : "bg-white/90 text-[#242421] hover:bg-white hover:shadow-lg"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Design Your Space</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors focus:outline-none ${
              scrolled ? "text-[#242421]" : "text-white"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#F6F3EE] pt-28 px-6 pb-12 flex flex-col justify-between md:hidden"
          >
            <div className="flex flex-col space-y-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A79B8C]">
                Navigation Menu
              </span>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="font-serif-editorial text-3xl text-[#242421] hover:text-[#C5A059] transition-colors py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-[#D8D0C5]">
              <a
                href="#personalise"
                onClick={(e) => handleScrollTo(e, "#personalise")}
                className="w-full flex items-center justify-center space-x-2 py-4 rounded-full bg-[#242421] text-[#F6F3EE] text-xs uppercase tracking-[0.2em] font-semibold"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>Design Your Space</span>
              </a>

              <div className="text-center pt-2">
                <p className="text-xs text-[#A79B8C]">HausBedroom Showroom • Singapore</p>
                <p className="text-[11px] text-[#242421] font-medium mt-1">
                  9 Kaki Bukit Road 1, #02-10, Eunos Technolink
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

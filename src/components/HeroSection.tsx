"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  const handleScrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#242421]">
      {/* Background Image Container with subtle movement animation */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2000&auto=format&fit=crop"
          alt="HausBedroom Sanctuary"
          title="HausBedroom Sanctuary"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
        />
        {/* Layered Gradient Overlays for Cinematic Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#242421] via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-radial-vignette opacity-50 pointer-events-none" />
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center text-white pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs tracking-[0.25em] uppercase mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
          <span>The Art of Rest • HausBedroom Singapore</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-serif-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.08] mb-6 text-[#F6F3EE]"
        >
          Your Bedroom. <br />
          <span className="italic font-normal text-[#D8D0C5]">Your Sanctuary.</span>
        </motion.h1>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed mb-10 tracking-wide"
        >
          Explore a more personal way to create a bedroom that feels entirely yours — 
          tailored custom wardrobes, bespoke modular systems, and architectural serenity.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <button
            onClick={() => handleScrollTo("#personalise")}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full bg-[#F6F3EE] text-[#242421] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg group"
          >
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span>Personalise Your Bedroom</span>
            <ArrowRight className="w-4 h-4 text-[#242421] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleScrollTo("#explore")}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300"
          >
            <span>Explore the Experience</span>
          </button>
        </motion.div>
      </div>

      {/* Smooth Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center cursor-pointer"
        onClick={() => handleScrollTo("#explore")}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2 font-light">
          Scroll To Discover
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}

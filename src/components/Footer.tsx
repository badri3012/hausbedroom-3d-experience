"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#1A1A18] text-[#D8D0C5] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <span className="font-serif-editorial text-2xl tracking-[0.2em] font-medium text-[#F6F3EE]">
                HAUSBEDROOM
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-[#A79B8C]">
                SINGAPORE
              </span>
            </div>
            <p className="text-xs text-[#A79B8C] font-light max-w-sm leading-relaxed">
              Bespoke bedroom sanctuaries, HausFlex modular wardrobes, and climate-resilient space optimization for Singapore residences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="uppercase tracking-[0.2em] font-semibold text-white mb-2">Navigation</h4>
            <ul className="space-y-2 text-[#A79B8C]">
              <li><a href="#explore" className="hover:text-white transition-colors">Explore Sanctuary</a></li>
              <li><a href="#collections" className="hover:text-white transition-colors">Architectural Collections</a></li>
              <li><a href="#personalise" className="hover:text-white transition-colors">Interactive Configurator</a></li>
              <li><a href="#approach" className="hover:text-white transition-colors">Our Design Approach</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Showroom Appointment</a></li>
            </ul>
          </div>

          {/* Showroom & Legal */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="uppercase tracking-[0.2em] font-semibold text-white mb-2">Showroom Location</h4>
            <p className="text-[#A79B8C] font-light leading-relaxed">
              9 Kaki Bukit Road 1, #02-10<br />
              Eunos Technolink, Singapore 415938<br />
              Mon – Sat: 9:30 AM – 6:30 PM (By Appointment)
            </p>
          </div>
        </div>

        {/* Bottom Credits & BlazeByte Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A79B8C] gap-4">
          <p>© {currentYear} HausBedroom Singapore. All rights reserved.</p>

          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[11px] font-medium tracking-wide">
              Interactive concept prepared by <strong className="text-white font-semibold">BlazeByte Studio</strong>.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

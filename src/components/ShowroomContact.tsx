"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Phone, MessageSquare, CalendarCheck } from "lucide-react";

export default function ShowroomContact() {
  return (
    <section id="contact" className="py-24 bg-[#F6F3EE] text-[#242421] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D8D0C5] shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#A79B8C] block">
              Experience In Person • Singapore Showroom
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-light text-[#242421]">
              Visit The Sanctuary Gallery
            </h2>
            <p className="text-sm text-[#42372F]/80 font-light leading-relaxed">
              Explore full-scale HausFlex modular wardrobe displays, test tactile material finishes, and consult directly with master carpenters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#D8D0C5]/60 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-semibold text-[#242421]">
                  <MapPin className="w-4 h-4 text-[#C5A059]" />
                  <span>Showroom Address</span>
                </div>
                <p className="text-[#42372F]/80 pl-6">
                  9 Kaki Bukit Road 1, #02-10<br />
                  Eunos Technolink, Singapore 415938
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-semibold text-[#242421]">
                  <Clock className="w-4 h-4 text-[#C5A059]" />
                  <span>Gallery Hours</span>
                </div>
                <p className="text-[#42372F]/80 pl-6">
                  Mon – Sat: 9:30 AM – 6:30 PM<br />
                  <span className="text-[#A79B8C] font-medium">(By Appointment Only)</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://wa.me/6588157320"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#242421] hover:bg-[#42372F] text-[#F6F3EE] text-xs uppercase tracking-[0.18em] font-semibold transition-colors shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A059]" />
                <span>WhatsApp Appointment (+65 8815 7320)</span>
              </a>
              <a
                href="tel:+6568421514"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#F6F3EE] hover:bg-[#D8D0C5]/40 text-[#242421] text-xs uppercase tracking-[0.18em] font-medium transition-colors border border-[#D8D0C5]"
              >
                <Phone className="w-4 h-4 text-[#A79B8C]" />
                <span>Call (+65 6842 1514)</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl overflow-hidden h-72 sm:h-96 relative border border-[#D8D0C5]">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
              alt="HausBedroom Singapore Showroom Gallery"
              title="HausBedroom Singapore Showroom Gallery"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-center p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
              <p className="text-xs font-serif-editorial">
                "Precision Engineering Meets Editorial Bedroom Luxury"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

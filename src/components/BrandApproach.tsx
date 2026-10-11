"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Compass, Sliders, Layers } from "lucide-react";

export default function BrandApproach() {
  const pillars = [
    {
      icon: Sliders,
      title: "HausFlex Modular Precision",
      description:
        "Signature full-metal wardrobe systems engineered for adaptability. Relocatable, modular, and built to evolve with your home lifestyle.",
    },
    {
      icon: ShieldCheck,
      title: "Climate-Resilience Tech",
      description:
        "Crafted specifically for Singapore's tropical humidity — termite-proof, moisture-resistant, and flame-retardant structural materials.",
    },
    {
      icon: Compass,
      title: "Singapore Space Ergonomics",
      description:
        "Intelligent space optimization tailored for HDB, BTO, and luxury condo footprints, maximizing storage without compromising airiness.",
    },
    {
      icon: Layers,
      title: "Bespoke Carpentry Excellence",
      description:
        "Seamless integration of custom headboards, concealed ledges, integrated vanity desks, and architectural ambient lighting.",
    },
  ];

  return (
    <section id="approach" className="py-24 bg-[#F6F3EE] text-[#242421] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-[#D8D0C5] pb-8">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.3em] font-semibold text-[#A79B8C] block mb-3"
            >
              Our Philosophy • Craft & Architecture
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif-editorial text-3xl sm:text-5xl font-light tracking-tight text-[#242421]"
            >
              The Art of Rest. <br />
              <span className="italic font-normal text-[#A79B8C]">Architectural Serenity.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-sm text-[#42372F]/80 leading-relaxed mt-6 md:mt-0 font-light"
          >
            We believe the bedroom is not merely a place to sleep, but a private sanctuary where architectural form meets human emotional tranquility.
          </motion.p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/80 p-8 rounded-2xl border border-[#D8D0C5]/60 hover:border-[#A79B8C] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#F6F3EE] flex items-center justify-center text-[#242421] mb-6 group-hover:bg-[#242421] group-hover:text-[#F6F3EE] transition-colors duration-300">
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-serif-editorial text-xl font-medium text-[#242421] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#42372F]/75 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#F6F3EE] flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#A79B8C]">
                  <span>HausBedroom Standard</span>
                  <span className="font-serif-editorial text-sm">0{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

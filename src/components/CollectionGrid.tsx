"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Layers, Sliders, ExternalLink, ArrowRight } from "lucide-react";

export interface CollectionItem {
  id: string;
  category: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
  specs: { label: string; value: string }[];
}

export const COLLECTIONS: CollectionItem[] = [
  {
    id: "hausflex-system",
    category: "Modular Systems",
    title: "HausFlex Modular Wardrobe",
    tagline: "Relocatable, full-metal modular wardrobe architecture.",
    description:
      "Engineered with high-tensile aluminium alloy framework, HausFlex provides unmatched adaptability for Singapore residences. Fully fire, termite, and moisture resistant with customisable shelf hanging modules.",
    image: "https://images.unsplash.com/photo-1558882224-dda166733046?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Modular relocatable structure",
      "Termite & moisture-proof alloy",
      "Integrated motion-sensor LED strips",
      "Glass tint or solid front panel options",
    ],
    specs: [
      { label: "Structure", value: "Aluminium alloy core & tempered safety glass" },
      { label: "Suitable For", value: "HDB Master, Condo Walk-in & Landed Suites" },
      { label: "Warranty", value: "HausBedroom Structural Integrity Coverage" },
    ],
  },
  {
    id: "custom-headboard-panel",
    category: "Bedroom Essentials",
    title: "Bespoke Fluted Headboard Wall",
    tagline: "Acoustic-softened wall panels with integrated nightstand ledges.",
    description:
      "Create a hotel-suite centerpiece with wall-to-wall upholstered fluted panelling. Seamlessly integrates bedside power channels, reading sconces, and floating nightstand ledges.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Acoustic dampening fabric upholstery",
      "Concealed cable management conduit",
      "Built-in wireless charging pad option",
      "Warm accent backlighting",
    ],
    specs: [
      { label: "Upholstery", value: "Stain-resistant luxury linen or faux velvet" },
      { label: "Ledge Finish", value: "Natural Oak, Smoky Walnut or Matte Black" },
      { label: "Customisation", value: "Tailored to exact ceiling height" },
    ],
  },
  {
    id: "sliding-wardrobe-glide",
    category: "Storage Solutions",
    title: "HausGlide Sliding System",
    tagline: "Ultra-smooth sliding track system for compact Singapore rooms.",
    description:
      "Designed specifically for rooms where swing-door clearance is limited. Silent damped glide mechanisms ensure effortless operation and maximal floor plan efficiency.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Soft-close magnetic dampeners",
      "Full-height reflective mirror option",
      "Concealed overhead track system",
      "Custom internal drawer divides",
    ],
    specs: [
      { label: "Clearance Requirement", value: "Zero swing clearance needed" },
      { label: "Door Widths", value: "Custom engineered up to 1500mm per panel" },
      { label: "Mechanism", value: "German engineered heavy-duty bearings" },
    ],
  },
  {
    id: "complete-sanctuary-suite",
    category: "Complete Sanctuaries",
    title: "The Editorial Master Sanctuary",
    tagline: "Harmonious integration of wardrobe, bed, vanity and ambient lighting.",
    description:
      "A holistic bedroom interior transformation where carpentry, bed frame, wardrobe, and vanity desk flow as a single architectural gesture.",
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c517a?q=80&w=1200&auto=format&fit=crop",
    highlights: [
      "Unified spatial aesthetic",
      "Custom desk vanity combination",
      "Ambient layered light scheme",
      "Integrated full-height storage",
    ],
    specs: [
      { label: "Scope", value: "Full room custom carpentry & modular layout" },
      { label: "Design Process", value: "Interactive 3D elevation rendering" },
      { label: "Installation", value: "Precision on-site assembly" },
    ],
  },
];

export default function CollectionGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeItem, setActiveItem] = useState<CollectionItem | null>(null);

  const categories = ["All", "Modular Systems", "Storage Solutions", "Bedroom Essentials", "Complete Sanctuaries"];

  const filteredItems =
    selectedCategory === "All"
      ? COLLECTIONS
      : COLLECTIONS.filter((item) => item.category === selectedCategory);

  const handleInquireFromModal = () => {
    setActiveItem(null);
    const enquiryEl = document.querySelector("#enquiry");
    if (enquiryEl) {
      enquiryEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="collections" className="py-24 bg-[#F6F3EE] text-[#242421] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-[#D8D0C5]">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#A79B8C] block mb-2">
              Curated Collections • Conceptual Preview
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl font-light text-[#242421]">
              Architectural Collections
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#42372F]/80 font-light leading-relaxed mt-4 md:mt-0">
            Explore conceptual sanctuary configurations designed for modern Singapore living. Click any design to inspect detailed architectural features.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-[#242421] text-[#F6F3EE] shadow-md"
                  : "bg-white text-[#242421]/70 hover:bg-[#D8D0C5]/40 hover:text-[#242421]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Collection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#D8D0C5]/60 hover:border-[#A79B8C] hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              {/* Image Container with Hover Zoom & Editorial Overlay */}
              <div className="relative h-72 sm:h-80 overflow-hidden bg-[#242421]">
                <img
                  src={item.image}
                  alt={item.title}
                  title={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 left-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#F6F3EE] bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white transform group-hover:-translate-y-1 transition-transform">
                  <h3 className="font-serif-editorial text-2xl font-medium mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/80 font-light">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Details Row */}
              <div className="p-6 flex items-center justify-between bg-white text-xs text-[#242421]">
                <div className="flex items-center space-x-2 text-[#A79B8C]">
                  <Layers className="w-4 h-4" />
                  <span>Interactive Inspiration</span>
                </div>
                <span className="inline-flex items-center space-x-1 font-semibold uppercase tracking-[0.15em] text-[#42372F] group-hover:text-[#C5A059] transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveItem(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F6F3EE] rounded-3xl shadow-2xl border border-[#D8D0C5] z-10 p-6 sm:p-10 text-[#242421]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-[#242421] text-white hover:bg-[#42372F] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-6 rounded-2xl overflow-hidden h-64 sm:h-80 relative border border-[#D8D0C5]">
                  <img
                    src={activeItem.image}
                    alt={activeItem.title}
                    title={activeItem.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white bg-black/60 px-3 py-1 rounded-full">
                      {activeItem.category}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-6">
                  <div>
                    <h3 className="font-serif-editorial text-3xl font-medium text-[#242421] mb-2">
                      {activeItem.title}
                    </h3>
                    <p className="text-xs text-[#A79B8C] uppercase tracking-[0.2em] font-medium">
                      {activeItem.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-[#42372F]/80 leading-relaxed font-light">
                    {activeItem.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-[#242421]">
                      Key Features & Engineering:
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-[#42372F]">
                      {activeItem.highlights.map((h, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Specs */}
                  <div className="pt-4 border-t border-[#D8D0C5] space-y-2 text-xs">
                    {activeItem.specs.map((s, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-[#A79B8C] font-medium">{s.label}:</span>
                        <span className="text-[#242421] font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleInquireFromModal}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-[#242421] hover:bg-[#42372F] text-[#F6F3EE] text-xs uppercase tracking-[0.2em] font-semibold transition-colors shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <span>Inquire About This Design</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

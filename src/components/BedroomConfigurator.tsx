"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Bed,
  Palette,
  Maximize2,
  DollarSign,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Info,
} from "lucide-react";

// Configurator Types
export interface ConfigState {
  style: string;
  palette: string;
  bedSize: string;
  priority: string;
  budget: string;
}

interface BedroomConfiguratorProps {
  onComplete: (config: ConfigState) => void;
}

export const STYLES = [
  {
    id: "modern-minimal",
    title: "Modern Minimal",
    tagline: "Uncluttered lines, concealed storage & serene architectural geometry.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
    features: ["Handleless cabinetry", "Recessed LED strip lighting", "HausFlex integrated wardrobe"],
  },
  {
    id: "contemporary-luxury",
    title: "Contemporary Luxury",
    tagline: "Tactile upholstered headboards, metallic accents & ambient glass panelling.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200&auto=format&fit=crop",
    features: ["Bronze tinted glass doors", "Plush suede headboard wall", "Concealed jewelry drawers"],
  },
  {
    id: "warm-natural",
    title: "Warm Natural",
    tagline: "Organic wood fluting, linen textures & warm inviting sanctuary tones.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    features: ["Natural oak fluted panels", "Breathable fabric upholstery", "Integrated planter ledges"],
  },
  {
    id: "timeless-classic",
    title: "Timeless Classic",
    tagline: "Refined moldings, warm brass details & enduring editorial elegance.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    features: ["Classic wainscoting detail", "Solid hardwood framing", "Brass pull handles"],
  },
];

export const PALETTES = [
  {
    id: "warm-neutral",
    title: "Warm Neutral",
    swatches: ["#F6F3EE", "#D8D0C5", "#A79B8C", "#42372F"],
    description: "Creamy ivories, soft oat, and deep taupe for grounding warmth.",
  },
  {
    id: "soft-grey",
    title: "Soft Grey",
    swatches: ["#F0F2F5", "#D0D5DD", "#667085", "#1D2939"],
    description: "Cool slate, misty smoke, and dark charcoal for serene contrast.",
  },
  {
    id: "earthy-brown",
    title: "Earthy Brown",
    swatches: ["#FAF5EF", "#E4D4C8", "#8D6E63", "#3E2723"],
    description: "Terracotta warmth, rich walnut, and deep espresso tones.",
  },
  {
    id: "ivory-cream",
    title: "Ivory & Cream",
    swatches: ["#FFFFFF", "#FDFBF7", "#F3EFE6", "#C5A059"],
    description: "Pure alabaster, warm cream, and subtle muted champagne gold.",
  },
];

export const BED_SIZES = [
  {
    id: "single",
    title: "Single",
    dims: "91 cm × 190 cm",
    note: "Ideal for compact studio spaces, guest sanctuaries or kid's rooms.",
  },
  {
    id: "super-single",
    title: "Super Single",
    dims: "107 cm × 190 cm",
    note: "Extra comfort for single living without dominating floor footprint.",
  },
  {
    id: "queen",
    title: "Queen",
    dims: "152 cm × 190 cm",
    note: "Singapore standard choice for master bedrooms and condo suites.",
  },
  {
    id: "king",
    title: "King",
    dims: "183 cm × 190 cm",
    note: "Ultimate luxury spatial freedom for grand master bedrooms.",
  },
];

export const PRIORITIES = [
  {
    id: "comfort",
    title: "Comfort & Rest",
    description: "Acoustic wall paneling, glare-free lighting, and ergonomic bedding ergonomics.",
  },
  {
    id: "storage",
    title: "Storage Maximisation",
    description: "Floor-to-ceiling HausFlex modular wardrobes, under-bed drawers & pull-out racks.",
  },
  {
    id: "elegant-design",
    title: "Elegant Architectural Design",
    description: "Bespoke carpentry, statement headboard wall, and editorial showcase lighting.",
  },
  {
    id: "space-optimisation",
    title: "Space Optimisation",
    description: "Multi-functional vanity-desk setups, sliding pocket doors & compact layouts.",
  },
];

export const BUDGETS = [
  { id: "discuss", title: "Prefer to discuss", note: "Explore tailored custom packages during consultation" },
  { id: "below-2k", title: "Below S$2,000", note: "Modular space optimization & standalone wardrobe accents" },
  { id: "2k-5k", title: "S$2,000 – S$5,000", note: "Comprehensive wardrobe build & custom bed headboard unit" },
  { id: "above-5k", title: "Above S$5,000", note: "Full master bedroom sanctuary transformation & custom carpentry" },
];

export default function BedroomConfigurator({ onComplete }: BedroomConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [config, setConfig] = useState<ConfigState>({
    style: "modern-minimal",
    palette: "warm-neutral",
    bedSize: "queen",
    priority: "storage",
    budget: "2k-5k",
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
  };

  const getSelectedStyleObj = () => STYLES.find((s) => s.id === config.style) || STYLES[0];
  const getSelectedPaletteObj = () => PALETTES.find((p) => p.id === config.palette) || PALETTES[0];
  const getSelectedSizeObj = () => BED_SIZES.find((b) => b.id === config.bedSize) || BED_SIZES[2];
  const getSelectedPriorityObj = () => PRIORITIES.find((pr) => pr.id === config.priority) || PRIORITIES[1];
  const getSelectedBudgetObj = () => BUDGETS.find((b) => b.id === config.budget) || BUDGETS[2];

  const handleConsultationClick = () => {
    onComplete(config);
    const enquiryEl = document.querySelector("#enquiry");
    if (enquiryEl) {
      enquiryEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="personalise" className="py-24 bg-[#242421] text-[#F6F3EE] relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5A059]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 text-[#C5A059] text-xs uppercase tracking-[0.25em] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Studio Experience</span>
          </motion.div>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-light tracking-tight mb-4 text-[#F6F3EE]">
            Personalise Your Bedroom
          </h2>
          <p className="text-sm sm:text-base text-[#D8D0C5]/80 font-light leading-relaxed">
            Curate your ideal sanctuary in 5 intuitive steps. Receive a instant personalized style summary and tailored layout recommendation.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.15em] text-[#A79B8C] mb-3">
            <span>
              Step 0{currentStep} of 0{totalSteps - 1} —{" "}
              {currentStep === 1 && "Bedroom Style"}
              {currentStep === 2 && "Colour Palette"}
              {currentStep === 3 && "Bed Dimensions"}
              {currentStep === 4 && "Key Priority"}
              {currentStep === 5 && "Budget Preference"}
              {currentStep === 6 && "Your Inspiration Result"}
            </span>
            <span>{Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#A79B8C] to-[#C5A059]"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Configurator Box Container */}
        <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: CHOOSE BEDROOM STYLE */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-white font-medium mb-2">
                    1. Select Your Aesthetic Architectural Style
                  </h3>
                  <p className="text-xs text-[#D8D0C5]/70 font-light">
                    Choose the design theme that aligns best with your visual vision.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {STYLES.map((style) => {
                    const isSelected = config.style === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setConfig({ ...config, style: style.id })}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group ${
                          isSelected
                            ? "border-[#C5A059] shadow-lg shadow-[#C5A059]/20"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <div className="h-48 sm:h-56 relative overflow-hidden bg-[#1C1C19]">
                          <img
                            src={style.image}
                            alt={style.title}
                            title={style.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                          {isSelected && (
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#C5A059] text-[#242421] flex items-center justify-center shadow-md">
                              <Check className="w-5 h-5 stroke-[2.5]" />
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="font-serif-editorial text-xl font-medium text-white mb-1">
                              {style.title}
                            </h4>
                            <p className="text-xs text-white/80 font-light line-clamp-2">
                              {style.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-[#242421]/90 flex flex-wrap gap-2 border-t border-white/5">
                          {style.features.map((feat) => (
                            <span
                              key={feat}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#D8D0C5]"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CHOOSE COLOUR PALETTE */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-white font-medium mb-2">
                    2. Choose Your Sanctuary Colour Palette
                  </h3>
                  <p className="text-xs text-[#D8D0C5]/70 font-light">
                    Select a tonal harmony for cabinet finishes, wall panelling & textiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {PALETTES.map((pal) => {
                    const isSelected = config.palette === pal.id;
                    return (
                      <div
                        key={pal.id}
                        onClick={() => setConfig({ ...config, palette: pal.id })}
                        className={`p-6 rounded-2xl bg-white/5 border-2 cursor-pointer transition-all duration-300 relative ${
                          isSelected
                            ? "border-[#C5A059] bg-white/10 shadow-lg shadow-[#C5A059]/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#C5A059] text-[#242421] flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        <h4 className="font-serif-editorial text-xl font-medium text-white mb-2">
                          {pal.title}
                        </h4>
                        <p className="text-xs text-[#D8D0C5]/80 font-light mb-6">
                          {pal.description}
                        </p>

                        {/* Swatches display */}
                        <div className="flex items-center space-x-3">
                          {pal.swatches.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded-full border border-white/20 shadow-inner transform transition-transform group-hover:scale-110"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: SELECT BED SIZE */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-white font-medium mb-2">
                    3. Select Bed Size & Spatial Dimensions
                  </h3>
                  <p className="text-xs text-[#D8D0C5]/70 font-light">
                    Tailored for Singapore bedroom floor plans (HDB, BTO & Condos).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {BED_SIZES.map((size) => {
                    const isSelected = config.bedSize === size.id;
                    return (
                      <div
                        key={size.id}
                        onClick={() => setConfig({ ...config, bedSize: size.id })}
                        className={`p-6 rounded-2xl bg-white/5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between relative ${
                          isSelected
                            ? "border-[#C5A059] bg-white/10 shadow-lg shadow-[#C5A059]/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#C5A059] text-[#242421] flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        <div>
                          <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C5A059] flex items-center justify-center mb-4">
                            <Bed className="w-5 h-5" />
                          </div>
                          <h4 className="font-serif-editorial text-2xl font-medium text-white mb-1">
                            {size.title}
                          </h4>
                          <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-[11px] font-mono text-[#C5A059] mb-4">
                            {size.dims}
                          </span>
                          <p className="text-xs text-[#D8D0C5]/75 font-light leading-relaxed">
                            {size.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: CHOOSE YOUR PRIORITY */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-white font-medium mb-2">
                    4. What is Your Key Functional Priority?
                  </h3>
                  <p className="text-xs text-[#D8D0C5]/70 font-light">
                    Helps our space designers optimize layout proportions and storage modules.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {PRIORITIES.map((p) => {
                    const isSelected = config.priority === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setConfig({ ...config, priority: p.id })}
                        className={`p-6 rounded-2xl bg-white/5 border-2 cursor-pointer transition-all duration-300 relative ${
                          isSelected
                            ? "border-[#C5A059] bg-white/10 shadow-lg shadow-[#C5A059]/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#C5A059] text-[#242421] flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        <h4 className="font-serif-editorial text-xl font-medium text-white mb-2">
                          {p.title}
                        </h4>
                        <p className="text-xs text-[#D8D0C5]/80 font-light leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5: BUDGET PREFERENCE */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-white font-medium mb-2">
                    5. Budget Preference (Singapore Dollars)
                  </h3>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#C5A059]/20 text-[#C5A059] text-[11px] font-medium mt-1 mb-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Illustrative customer preferences for consultation planning (not fixed pricing)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {BUDGETS.map((b) => {
                    const isSelected = config.budget === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setConfig({ ...config, budget: b.id })}
                        className={`p-6 rounded-2xl bg-white/5 border-2 cursor-pointer transition-all duration-300 relative ${
                          isSelected
                            ? "border-[#C5A059] bg-white/10 shadow-lg shadow-[#C5A059]/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#C5A059] text-[#242421] flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        <h4 className="font-serif-editorial text-2xl font-medium text-white mb-2">
                          {b.title}
                        </h4>
                        <p className="text-xs text-[#D8D0C5]/80 font-light leading-relaxed">
                          {b.note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 6: PERSONALISED RESULT SCREEN */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-1">
                      Curated Concept Ready
                    </span>
                    <h3 className="font-serif-editorial text-3xl sm:text-4xl text-white font-light">
                      Your Bedroom Inspiration
                    </h3>
                  </div>
                  <button
                    onClick={handleRestart}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs text-[#D8D0C5] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restart Selections</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Dynamic Inspiration Image */}
                  <div className="lg:col-span-7 rounded-2xl overflow-hidden relative min-h-[320px] sm:min-h-[400px] border border-white/15 bg-[#1C1C19]">
                    <img
                      src={getSelectedStyleObj().image}
                      alt={getSelectedStyleObj().title}
                      title={getSelectedStyleObj().title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#C5A059]/40">
                        {getSelectedStyleObj().title} • {getSelectedPaletteObj().title}
                      </span>
                      <h4 className="font-serif-editorial text-2xl text-white mt-3 font-medium">
                        Custom {getSelectedSizeObj().title} Bedroom Sanctuary
                      </h4>
                    </div>
                  </div>

                  {/* Specification Breakdown Card */}
                  <div className="lg:col-span-5 bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#A79B8C] mb-4">
                        Your Custom Specification Summary
                      </h4>

                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#D8D0C5]/70">Selected Style:</span>
                          <span className="text-white font-medium">{getSelectedStyleObj().title}</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#D8D0C5]/70">Colour Harmony:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{getSelectedPaletteObj().title}</span>
                            <div className="flex space-x-1">
                              {getSelectedPaletteObj().swatches.slice(0, 3).map((c, i) => (
                                <span key={i} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#D8D0C5]/70">Bed Dimensions:</span>
                          <span className="text-white font-medium">{getSelectedSizeObj().title} ({getSelectedSizeObj().dims})</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#D8D0C5]/70">Design Priority:</span>
                          <span className="text-white font-medium">{getSelectedPriorityObj().title}</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="text-[#D8D0C5]/70">Budget Range:</span>
                          <span className="text-[#C5A059] font-medium">{getSelectedBudgetObj().title}</span>
                        </div>
                      </div>

                      {/* Recommended HausBedroom System */}
                      <div className="mt-6 p-4 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-xs">
                        <div className="flex items-center space-x-2 text-[#C5A059] font-medium mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Recommended System Match:</span>
                        </div>
                        <p className="text-[#D8D0C5] text-[11px] leading-relaxed">
                          HausFlex Modular Full-Metal Wardrobe with integrated LED profile lighting and concealed storage modules.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleConsultationClick}
                      className="w-full flex items-center justify-center space-x-3 py-4 rounded-full bg-[#F6F3EE] hover:bg-white text-[#242421] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-xl group"
                    >
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <span>Request a Personal Consultation</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls (Back / Next) */}
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all ${
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed text-white/50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 6 && (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#C5A059] hover:bg-[#b08d47] text-[#242421] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-lg transform hover:-translate-y-0.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

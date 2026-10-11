"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  PhoneCall,
  MapPin,
  Sparkles,
  Info,
  Sliders,
} from "lucide-react";
import { ConfigState, STYLES, PALETTES, BED_SIZES, PRIORITIES, BUDGETS } from "./BedroomConfigurator";

interface EnquiryFormProps {
  config: ConfigState | null;
}

export default function EnquiryForm({ config }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    contactMethod: "WhatsApp",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (config) {
      // Auto pre-populate notes if user completed configurator
      const styleTitle = STYLES.find((s) => s.id === config.style)?.title;
      const paletteTitle = PALETTES.find((p) => p.id === config.palette)?.title;
      const sizeTitle = BED_SIZES.find((b) => b.id === config.bedSize)?.title;
      const priorityTitle = PRIORITIES.find((pr) => pr.id === config.priority)?.title;
      const budgetTitle = BUDGETS.find((b) => b.id === config.budget)?.title;

      setFormData((prev) => ({
        ...prev,
        notes: prev.notes || `Configurator Selections:
- Style: ${styleTitle}
- Palette: ${paletteTitle}
- Bed Size: ${sizeTitle}
- Priority: ${priorityTitle}
- Budget: ${budgetTitle}`,
      }));
    }
  }, [config]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) errs.email = "Valid email is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  const generateSummaryText = () => {
    return `HAUSBEDROOM DEMO ENQUIRY SUMMARY
----------------------------------------
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Preferred Contact: ${formData.contactMethod}

PROJECT NOTES & SELECTIONS:
${formData.notes}

Submitted via HausBedroom Interactive Demo prepared by BlazeByte Studio.`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(generateSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="enquiry" className="py-24 bg-[#242421] text-[#F6F3EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A059] block mb-3">
                Personal Consultation • Singapore Studio
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-5xl font-light text-[#F6F3EE] mb-4">
                Begin Your Sanctuary Journey
              </h2>
              <p className="text-sm text-[#D8D0C5]/80 font-light leading-relaxed">
                Connect with HausBedroom design specialists to discuss your layout requirements, modular configurations, and showroom appointments.
              </p>
            </div>

            {/* Official Showroom Details */}
            <div className="space-y-4 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-start space-x-3 text-[#D8D0C5]">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Singapore Showroom (By Appointment Only)</span>
                  <span>9 Kaki Bukit Road 1, #02-10, Eunos Technolink, Singapore 415938</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[#D8D0C5]">
                <PhoneCall className="w-4 h-4 text-[#C5A059] shrink-0" />
                <div>
                  <span className="font-medium text-white block">Official Contact</span>
                  <span>Phone: +65 6842 1514 • WhatsApp: +65 8815 7320</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[#D8D0C5]">
                <MessageSquare className="w-4 h-4 text-[#C5A059] shrink-0" />
                <div>
                  <span className="font-medium text-white block">Operating Hours</span>
                  <span>Mon – Sat: 9:30 AM – 6:30 PM</span>
                </div>
              </div>
            </div>

            {/* Attached Configurator Summary Indicator */}
            {config && (
              <div className="p-4 rounded-2xl bg-white/5 border border-[#C5A059]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C5A059] font-medium flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Configurator Choices Attached</span>
                  </span>
                  <span className="text-[10px] text-[#A79B8C]">Ready</span>
                </div>
                <div className="text-[11px] text-[#D8D0C5] flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/10">Style: {STYLES.find(s => s.id === config.style)?.title}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10">Bed: {BED_SIZES.find(b => b.id === config.bedSize)?.title}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10">Budget: {BUDGETS.find(b => b.id === config.budget)?.title}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Form / Summary Column */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10">
            {/* Clear Demo Notice */}
            <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center space-x-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Demo enquiry</strong> — no actual information will be transmitted over external servers.
              </span>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-[#D8D0C5] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Tan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                    {errors.fullName && <p className="text-red-400 text-[10px] mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-[#D8D0C5] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. sarah.tan@example.sg"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                    {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-[#D8D0C5] mb-2">
                      Phone / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +65 9123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                    {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone}</p>}
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] font-medium text-[#D8D0C5] mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      value={formData.contactMethod}
                      onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#242421] border border-white/15 text-white text-xs focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Email">Email Response</option>
                    </select>
                  </div>
                </div>

                {/* Project Notes */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] font-medium text-[#D8D0C5] mb-2">
                    Project Notes & Bedroom Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your home type (HDB/BTO/Condo), target key collection date, or special storage requests..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-full bg-[#F6F3EE] hover:bg-white text-[#242421] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-xl"
                >
                  <Send className="w-4 h-4 text-[#C5A059]" />
                  <span>Generate Demo Consultation Summary</span>
                </button>
              </form>
            ) : (
              /* Success & Summary View */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 text-[#C5A059]">
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <div>
                    <h3 className="font-serif-editorial text-2xl text-white font-medium">
                      Demo Enquiry Generated Successfully
                    </h3>
                    <p className="text-xs text-[#D8D0C5]/70">
                      Your consultation details have been compiled locally in component state.
                    </p>
                  </div>
                </div>

                {/* Formatted Code / Summary Box */}
                <div className="bg-[#1A1A18] rounded-2xl p-5 border border-white/10 font-mono text-[11px] text-[#D8D0C5] space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white font-sans text-xs">
                    <span className="font-medium text-[#C5A059]">Demo Consultation Spec Card</span>
                    <button
                      onClick={handleCopySummary}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Summary"}</span>
                    </button>
                  </div>

                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed pt-2">
                    {generateSummaryText()}
                  </pre>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                  <a
                    href="https://wa.me/6588157320"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-[0.15em] font-semibold transition-colors shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Connect via Official WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="flex-1 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-[0.15em] font-medium transition-colors"
                  >
                    Edit Demo Fields
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

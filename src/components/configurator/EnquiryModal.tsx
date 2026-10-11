"use client";

import React, { useState } from "react";
import {
  WardrobeInteractionState,
  CustomerEnquiry,
  WardrobeVariant,
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
} from "@/types/wardrobe";
import { HOUSING_TYPES, TIMELINES } from "@/lib/wardrobe-config";
import {
  FileText,
  Send,
  CheckCircle2,
  Copy,
  Check,
  X,
  Info,
  Calendar,
  Home,
  Phone,
  Mail,
  User,
} from "lucide-react";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: WardrobeInteractionState;
  variant: WardrobeVariant;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
}

export function EnquiryModal({
  isOpen,
  onClose,
  state,
  variant,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
}: EnquiryModalProps) {
  const [formData, setFormData] = useState<CustomerEnquiry>({
    fullName: "",
    email: "",
    phone: "",
    housingType: HOUSING_TYPES[0],
    estimatedTimeline: TIMELINES[1],
    approxWidth: `${variant.dimensions.width}`,
    approxHeight: `${variant.dimensions.height}`,
    customRequirements: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getSummaryText = () => {
    return `=== HAUSBEDROOM BESPOKE 3D WARDROBE ENQUIRY ===
Generated via Interactive 3D Configurator Demonstration

[CLIENT INFORMATION]
Name: ${formData.fullName || "Demo Client"}
Email: ${formData.email || "demo@hausbedroom.sg"}
Phone: ${formData.phone || "+65 9123 4567"}
Property Type: ${formData.housingType}
Timeline: ${formData.estimatedTimeline}

[WARDROBE SPECIFICATIONS]
Model: ${variant.title} (${variant.referenceTag})
Reference Inspiration: ${variant.referenceName}
Wood Finish: ${woodMaterial.name} (${woodMaterial.subtitle})
Frame Profile: ${frameMaterial.name}
Door Facade: ${doorPanelMaterial.name}
Provisional Dimensions: W ${formData.approxWidth} × H ${formData.approxHeight} × D ${variant.dimensions.depth} mm
Sliding Doors: ${variant.dimensions.doorType === "sliding" ? "Dual-Track Soft-Close Bypass" : "Open Post Suspension"}
Interior Lights: ${state.shelfLedsOn ? "Active (Warm 3000K LED)" : "Standard"}

[ADDITIONAL REQUIREMENTS]
${formData.customRequirements || "Standard luxury installation requested."}

=== HAUSBEDROOM SINGAPORE DEMO ===`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] text-[#242424] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E6E1D8] relative">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md px-6 py-4 border-b border-[#E6E1D8] flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A88C69]">
              HausBedroom Singapore
            </div>
            <h3 className="text-[18px] font-semibold text-[#242424]">
              Request This Wardrobe Consultation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#77736D] hover:text-[#242424] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active 3D Configuration Summary Chip */}
          <div className="p-4 bg-white rounded-xl border border-[#E6E1D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[#A88C69] font-medium">
                Active 3D Configuration
              </span>
              <span className="text-[11px] font-mono text-[#77736D]">
                {variant.dimensions.width} mm W
              </span>
            </div>
            <div className="text-[15px] font-medium text-[#242424]">
              {variant.title}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-[#F6F4F0] rounded-lg">
                <span className="text-[#77736D] block text-[10px]">Wood</span>
                <span className="font-medium text-[#242424]">{woodMaterial.name}</span>
              </div>
              <div className="p-2 bg-[#F6F4F0] rounded-lg">
                <span className="text-[#77736D] block text-[10px]">Frame</span>
                <span className="font-medium text-[#242424]">{frameMaterial.name}</span>
              </div>
              <div className="p-2 bg-[#F6F4F0] rounded-lg">
                <span className="text-[#77736D] block text-[10px]">Doors</span>
                <span className="font-medium text-[#242424]">{doorPanelMaterial.name}</span>
              </div>
            </div>
          </div>

          {!submitted ? (
            /* Enquiry Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A88C69] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Tan"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] focus:ring-1 focus:ring-[#A88C69] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Contact Phone (+65) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#A88C69] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="+65 9123 4567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] focus:ring-1 focus:ring-[#A88C69] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A88C69] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="rachel.tan@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] focus:ring-1 focus:ring-[#A88C69] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Property Type
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-[#A88C69] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.housingType}
                      onChange={(e) =>
                        setFormData({ ...formData, housingType: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] outline-none"
                    >
                      {HOUSING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Target Timeline
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#A88C69] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.estimatedTimeline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedTimeline: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] outline-none"
                    >
                      {TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Estimated Width (mm)
                  </label>
                  <input
                    type="text"
                    value={formData.approxWidth}
                    onChange={(e) =>
                      setFormData({ ...formData, approxWidth: e.target.value })
                    }
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                    Ceiling Height (mm)
                  </label>
                  <input
                    type="text"
                    value={formData.approxHeight}
                    onChange={(e) =>
                      setFormData({ ...formData, approxHeight: e.target.value })
                    }
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#DCD6CC] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#77736D] mb-1">
                  Custom Requirements or Storage Preferences
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Extra suit hanging clearance, integrated LED sensors, jewelry tray divider..."
                  value={formData.customRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customRequirements: e.target.value,
                    })
                  }
                  className="w-full p-3 text-[13px] bg-white border border-[#DCD6CC] rounded-xl focus:border-[#A88C69] outline-none resize-none"
                />
              </div>

              {/* Demo Notice */}
              <div className="p-3 bg-[#EFECE6]/70 rounded-xl border border-[#E0D9CE] text-[11px] text-[#77736D] flex gap-2 items-start">
                <Info className="w-4 h-4 text-[#A88C69] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#242424]">Demonstration Notice: </strong>
                  This interactive demo simulates client enquiry submission. In production, this dispatches a structured PDF spec sheet to the HausBedroom sales team.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#242424] text-white hover:bg-[#383838] rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Send className="w-4 h-4 text-[#A88C69]" />
                Submit Demonstration Enquiry
              </button>
            </form>
          ) : (
            /* Submission Confirmation View */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-5 bg-[#F2F7F2] border border-[#C5DDC5] rounded-2xl flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-[#2D7A32] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[15px] font-semibold text-[#1B4D20]">
                    Demonstration Enquiry Confirmed
                  </h4>
                  <p className="text-[12px] text-[#2D7A32] leading-relaxed">
                    Thank you, {formData.fullName}. Your customized 3D wardrobe configuration has been compiled into an architectural specification summary.
                  </p>
                </div>
              </div>

              {/* Structured Summary Receipt */}
              <div className="bg-white p-4 rounded-xl border border-[#E6E1D8] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#77736D]">
                    Structured Specification Summary
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="text-[11px] text-[#A88C69] font-medium flex items-center gap-1 hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Summary
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#1C1C19] text-[#EBE5DB] rounded-lg text-[10.5px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-black/20">
                  {getSummaryText()}
                </pre>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="flex-1 py-2.5 px-3 bg-white border border-[#D1C9BC] rounded-xl text-[12px] font-medium text-[#242424] hover:bg-[#F9F7F4] transition-colors"
                >
                  Edit Enquiry Details
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 bg-[#242424] text-white rounded-xl text-[12px] font-medium hover:bg-[#383838] transition-colors"
                >
                  Close & Return to 3D View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

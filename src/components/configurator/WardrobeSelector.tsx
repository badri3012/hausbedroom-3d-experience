"use client";

import React, { useState } from "react";
import { WARDROBE_VARIANTS } from "@/lib/wardrobe-config";
import { WardrobeVariantId } from "@/types/wardrobe";
import { Check, Layers, Image as ImageIcon, X } from "lucide-react";

interface WardrobeSelectorProps {
  activeVariant: WardrobeVariantId;
  onSelectVariant: (id: WardrobeVariantId) => void;
}

const REFERENCE_IMAGES: Record<WardrobeVariantId, string> = {
  "contemporary-sliding": "/references/ref3-primary.jpg",
  "full-modular": "/references/ref1-modular.jpg",
  "open-modular": "/references/ref2-open.jpg",
};

export function WardrobeSelector({
  activeVariant,
  onSelectVariant,
}: WardrobeSelectorProps) {
  const [inspectImage, setInspectImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-widest text-[#77736D] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#A88C69]" />
          Select Wardrobe Variant
        </label>
        <span className="text-[10px] text-[#A88C69] font-medium tracking-wide">
          3 Architectural Geometries
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {WARDROBE_VARIANTS.map((variant) => {
          const isSelected = activeVariant === variant.id;
          const imageSrc = REFERENCE_IMAGES[variant.id];

          return (
            <div
              key={variant.id}
              onClick={() => onSelectVariant(variant.id)}
              className={`group text-left p-3 rounded-xl border transition-all duration-200 relative cursor-pointer ${
                isSelected
                  ? "bg-white border-[#A88C69] shadow-md ring-1 ring-[#A88C69]/30"
                  : "bg-white/60 hover:bg-white border-[#E6E1D8] hover:border-[#D1C9BC]"
              }`}
            >
              {/* Reference Tag Badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded tracking-wider ${
                    isSelected
                      ? "bg-[#A88C69] text-white"
                      : "bg-[#EFECE6] text-[#77736D] group-hover:text-[#242424]"
                  }`}
                >
                  {variant.referenceTag}
                </span>

                <span className="text-[11px] text-[#77736D] font-mono">
                  {variant.dimensions.width} mm W
                </span>
              </div>

              {/* Content with Reference Thumbnail */}
              <div className="flex items-start gap-3">
                {/* Reference Photo Thumbnail */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectImage({ url: imageSrc, title: variant.title });
                  }}
                  className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-black/10 relative group/img bg-[#EAE6DF]"
                  title="Click to view reference photograph"
                >
                  <img
                    src={imageSrc}
                    alt={variant.title}
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-[13.5px] font-medium text-[#242424] leading-snug group-hover:text-[#A88C69] transition-colors truncate">
                      {variant.title}
                    </h4>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-[#A88C69] text-white"
                          : "border border-[#D1C9BC] text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#77736D] line-clamp-2 mt-0.5 leading-relaxed">
                    {variant.tagline}
                  </p>
                </div>
              </div>

              {/* Subtle Reference Note */}
              <div className="mt-2 pt-2 border-t border-[#F2EEE9] flex items-center justify-between text-[10px] text-[#A88C69]/90 font-mono">
                <span>{variant.referenceName}</span>
                <span className="uppercase tracking-wider">
                  {variant.dimensions.doorType === "sliding" ? "Sliding Track" : "Open System"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reference Image Lightbox Modal */}
      {inspectImage && (
        <div
          onClick={() => setInspectImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1C1C19] rounded-2xl max-w-xl w-full p-4 border border-white/10 text-white space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C5A059]">
                  Design Reference Photo
                </span>
                <h4 className="text-[15px] font-medium text-white">
                  {inspectImage.title}
                </h4>
              </div>
              <button
                onClick={() => setInspectImage(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black/40">
              <img
                src={inspectImage.url}
                alt={inspectImage.title}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <p className="text-[11px] text-[#D8D0C5] font-mono text-center">
              Demonstrating 3D architectural geometric fidelity to supplied client reference.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

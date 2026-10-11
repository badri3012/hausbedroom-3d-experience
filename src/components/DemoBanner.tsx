"use client";

import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm bg-[#242421]/95 text-white p-4 rounded-2xl border border-[#C5A059]/40 backdrop-blur-md shadow-2xl transition-all animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#F6F3EE] uppercase tracking-wider">
              Client Demo Experience
            </h4>
            <p className="text-[11px] text-[#D8D0C5]/90 font-light mt-0.5 leading-snug">
              Interactive proposal presentation for <strong>HausBedroom Singapore</strong> prepared by <strong>BlazeByte Studio</strong>.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { WardrobeDimensions } from "@/types/wardrobe";
import { Ruler, Check, Info, Eye, EyeOff } from "lucide-react";

interface DimensionsPanelProps {
  dimensions: WardrobeDimensions;
  showDimensions: boolean;
  onToggleShowDimensions: () => void;
}

export function DimensionsPanel({
  dimensions,
  showDimensions,
  onToggleShowDimensions,
}: DimensionsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-widest text-[#77736D] flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-[#A88C69]" />
          Architectural Sizing
        </label>
        <span className="text-[10px] text-[#A88C69] font-mono px-2 py-0.5 rounded bg-[#A88C69]/10">
          Demo Assumptions
        </span>
      </div>

      {/* 3D Overlay Toggle Button */}
      <button
        onClick={onToggleShowDimensions}
        className={`w-full py-2.5 px-3 rounded-xl border text-[12px] font-medium flex items-center justify-center gap-2 transition-all ${
          showDimensions
            ? "bg-[#242424] text-white border-[#242424] shadow-sm"
            : "bg-white text-[#242424] border-[#A88C69] hover:bg-[#F9F7F4]"
        }`}
      >
        {showDimensions ? (
          <>
            <EyeOff className="w-4 h-4 text-[#A88C69]" />
            Hide 3D Dimension Callouts
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 text-[#A88C69]" />
            Show 3D Dimension Callouts in Scene
          </>
        )}
      </button>

      {/* Sizing Grid Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] text-center">
          <div className="text-[10px] font-mono text-[#77736D] uppercase">
            Width
          </div>
          <div className="text-[16px] font-semibold text-[#242424] mt-0.5 font-mono">
            {dimensions.width}
          </div>
          <div className="text-[9.5px] text-[#A88C69] font-mono">mm</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] text-center">
          <div className="text-[10px] font-mono text-[#77736D] uppercase">
            Height
          </div>
          <div className="text-[16px] font-semibold text-[#242424] mt-0.5 font-mono">
            {dimensions.height}
          </div>
          <div className="text-[9.5px] text-[#A88C69] font-mono">mm</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] text-center">
          <div className="text-[10px] font-mono text-[#77736D] uppercase">
            Depth
          </div>
          <div className="text-[16px] font-semibold text-[#242424] mt-0.5 font-mono">
            {dimensions.depth}
          </div>
          <div className="text-[9.5px] text-[#A88C69] font-mono">mm</div>
        </div>
      </div>

      {/* Modular Bay Allocation Breakdown */}
      <div className="p-3.5 bg-white rounded-xl border border-[#E6E1D8] space-y-2">
        <div className="text-[11px] font-mono uppercase text-[#242424] font-medium">
          Modular Compartment Clearances
        </div>
        <div className="space-y-1.5 text-[11px] text-[#77736D]">
          <div className="flex justify-between py-1 border-b border-[#F2EEE9]">
            <span>Left Garment Bay</span>
            <span className="font-mono text-[#242424]">1050 mm clearance</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F2EEE9]">
            <span>Central Cubby & Drawer Tower</span>
            <span className="font-mono text-[#242424]">800 mm clearance</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#F2EEE9]">
            <span>Right Garment Bay</span>
            <span className="font-mono text-[#242424]">1050 mm clearance</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Floor Skirting Inset</span>
            <span className="font-mono text-[#242424]">90 mm allowance</span>
          </div>
        </div>
      </div>

      {/* Client Demonstration Assumptions Disclosure */}
      <div className="p-3 bg-[#EFECE6]/70 rounded-xl border border-[#E0D9CE] text-[11px] text-[#77736D] flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-[#A88C69] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#242424] font-medium">Client Demo Note: </strong>
          Dimensions shown (3000 × 2400 × 600 mm) are provisional baseline assumptions for this interactive demonstration. For actual installations, HausBedroom performs 3D on-site laser surveys to customize floor-to-ceiling proportions to exact millimeter specifications.
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { WardrobeInteractionState } from "@/types/wardrobe";
import { SlidersHorizontal, ArrowLeftRight, Check, Eye } from "lucide-react";

interface DoorControlsProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

export function DoorControls({ state, onUpdateState }: DoorControlsProps) {
  const isLeftOpen = state.leftDoorOpen || state.bothDoorsOpen;
  const isRightOpen = state.rightDoorOpen || state.bothDoorsOpen;
  const areBothOpen = isLeftOpen && isRightOpen;

  const handleToggleLeft = () => {
    onUpdateState({
      leftDoorOpen: !isLeftOpen,
      bothDoorsOpen: false,
    });
  };

  const handleToggleRight = () => {
    onUpdateState({
      rightDoorOpen: !isRightOpen,
      bothDoorsOpen: false,
    });
  };

  const handleToggleBoth = () => {
    if (areBothOpen) {
      onUpdateState({
        leftDoorOpen: false,
        rightDoorOpen: false,
        bothDoorsOpen: false,
      });
    } else {
      onUpdateState({
        leftDoorOpen: true,
        rightDoorOpen: true,
        bothDoorsOpen: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-widest text-[#77736D] flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#A88C69]" />
          Sliding Door Operation
        </label>
        <span className="text-[11px] text-[#A88C69] font-mono">
          Dual-Track Bypass
        </span>
      </div>

      {/* Main Dual Button */}
      <button
        onClick={handleToggleBoth}
        className={`w-full py-3 px-4 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 border transition-all ${
          areBothOpen
            ? "bg-[#242424] text-white border-[#242424] shadow-md"
            : "bg-white text-[#242424] border-[#A88C69] hover:bg-[#F9F7F4] shadow-sm"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#A88C69]" />
        {areBothOpen ? "Close All Sliding Doors" : "Slide Open Both Doors"}
      </button>

      {/* Independent Door Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleToggleLeft}
          className={`p-3 rounded-xl border text-left transition-all ${
            isLeftOpen
              ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
              : "bg-white/60 hover:bg-white border-[#E6E1D8]"
          }`}
        >
          <div className="text-[11px] text-[#77736D] font-mono uppercase">
            Left Panel
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isLeftOpen ? "Slid Left (Open)" : "Closed (Center)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isLeftOpen ? "close" : "slide left"}
          </div>
        </button>

        <button
          onClick={handleToggleRight}
          className={`p-3 rounded-xl border text-left transition-all ${
            isRightOpen
              ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
              : "bg-white/60 hover:bg-white border-[#E6E1D8]"
          }`}
        >
          <div className="text-[11px] text-[#77736D] font-mono uppercase">
            Right Panel
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isRightOpen ? "Slid Right (Open)" : "Closed (Center)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isRightOpen ? "close" : "slide right"}
          </div>
        </button>
      </div>

      {/* Interactive 3D Hint */}
      <div className="p-3 bg-white/70 rounded-xl border border-[#E6E1D8] text-[11px] text-[#77736D] space-y-1">
        <div className="font-medium text-[#242424] flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#A88C69]" />
          Direct 3D Click Interaction
        </div>
        <p className="leading-relaxed">
          Hover and click on any door panel directly in the 3D view to slide it along its horizontal track.
        </p>
      </div>

      {/* Engineering Highlights */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-mono uppercase text-[#77736D]">
          Track Engineering Specifications
        </div>
        <ul className="text-[11px] text-[#77736D] space-y-1 list-disc list-inside">
          <li>Concealed dual ceiling track with German dampeners</li>
          <li>Flush floor guide with 3mm low-profile threshold</li>
          <li>Whisper-damped soft-close decelerators at track terminals</li>
        </ul>
      </div>
    </div>
  );
}

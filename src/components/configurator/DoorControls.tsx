"use client";

import React from "react";
import { WardrobeInteractionState } from "@/types/wardrobe";
import { SlidersHorizontal, ArrowLeftRight, Check, Eye, Camera } from "lucide-react";

interface DoorControlsProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

export function DoorControls({ state, onUpdateState }: DoorControlsProps) {
  const isLeftSlid = state.leftDoorOpen || state.bothDoorsOpen;
  const isRightSlid = state.rightDoorOpen || state.bothDoorsOpen;
  const areBothSlid = isLeftSlid && isRightSlid;

  const handleToggleLeft = () => {
    onUpdateState({
      leftDoorOpen: !isLeftSlid,
      bothDoorsOpen: false,
    });
  };

  const handleToggleRight = () => {
    onUpdateState({
      rightDoorOpen: !isRightSlid,
      bothDoorsOpen: false,
    });
  };

  const handleToggleBoth = () => {
    if (areBothSlid || isLeftSlid || isRightSlid) {
      // Park both doors at outer sides (Photographed Reference 3 state)
      onUpdateState({
        leftDoorOpen: false,
        rightDoorOpen: false,
        bothDoorsOpen: false,
      });
    } else {
      // Slide both doors to center
      onUpdateState({
        leftDoorOpen: true,
        rightDoorOpen: true,
        bothDoorsOpen: true,
      });
    }
  };

  const handleSetReferenceState = () => {
    onUpdateState({
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
      topDrawerOpen: false,
      bottomDrawerOpen: false,
      drawersOpen: false,
      cameraPreset: "front",
      interiorViewActive: false,
    });
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

      {/* Quick Action: Client Reference Photo State */}
      <button
        onClick={handleSetReferenceState}
        className="w-full py-2 px-3 rounded-lg bg-[#A88C69]/10 hover:bg-[#A88C69]/20 border border-[#A88C69]/30 text-[#A88C69] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
      >
        <Camera className="w-3.5 h-3.5" />
        Match Reference Photo State (Front View + Center Exposed)
      </button>

      {/* Master Toggle Button */}
      <button
        onClick={handleToggleBoth}
        className={`w-full py-3 px-4 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 border transition-all ${
          areBothSlid
            ? "bg-[#242424] text-white border-[#242424] shadow-md"
            : "bg-white text-[#242424] border-[#A88C69] hover:bg-[#F9F7F4] shadow-sm"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#A88C69]" />
        {areBothSlid || isLeftSlid || isRightSlid
          ? "Park Both Doors (Showcase Center)"
          : "Slide Doors to Center"}
      </button>

      {/* Independent Door Control Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleToggleLeft}
          className={`p-3 rounded-xl border text-left transition-all ${
            isLeftSlid
              ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
              : "bg-white/60 hover:bg-white border-[#E6E1D8]"
          }`}
        >
          <div className="text-[11px] text-[#77736D] font-mono uppercase">
            Left Panel
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isLeftSlid ? "Slid to Center" : "Parked Left (Open)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isLeftSlid ? "park at left" : "slide to center"}
          </div>
        </button>

        <button
          onClick={handleToggleRight}
          className={`p-3 rounded-xl border text-left transition-all ${
            isRightSlid
              ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
              : "bg-white/60 hover:bg-white border-[#E6E1D8]"
          }`}
        >
          <div className="text-[11px] text-[#77736D] font-mono uppercase">
            Right Panel
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isRightSlid ? "Slid to Center" : "Parked Right (Open)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isRightSlid ? "park at right" : "slide to center"}
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
          Click either door directly in the 3D canvas to slide it along its bypass track with soft-close deceleration.
        </p>
      </div>

      {/* Engineering Specifications */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-mono uppercase text-[#77736D]">
          Track Engineering Specifications
        </div>
        <ul className="text-[11px] text-[#77736D] space-y-1 list-disc list-inside">
          <li>Concealed dual ceiling track with German soft-close dampeners</li>
          <li>Independent parallel tracks with 40mm bypass clearance (no geometric collision)</li>
          <li>Milky acid-etched frosted satin privacy glass with alabaster border bands</li>
        </ul>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { WardrobeInteractionState } from "@/types/wardrobe";
import { computeDoorTravel, CONTEMPORARY_DOOR_SPEC } from "@/lib/door-kinematics";
import { SlidersHorizontal, ArrowLeftRight, Eye, Camera, Info } from "lucide-react";

interface DoorControlsProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

const NO_DRAWERS = {
  topDrawerOpen: false,
  bottomDrawerOpen: false,
  drawersOpen: false,
};

export function DoorControls({ state, onUpdateState }: DoorControlsProps) {
  const travel = useMemo(() => computeDoorTravel(CONTEMPORARY_DOOR_SPEC), []);
  const slideMm = Math.round(Math.min(Math.abs(travel.left.slideDelta), Math.abs(travel.right.slideDelta)) * 1000);
  const gapMm = Math.round(travel.centreGapAtFullTravel * 1000);

  const isLeftSlid = state.leftDoorOpen || state.bothDoorsOpen;
  const isRightSlid = state.rightDoorOpen || state.bothDoorsOpen;
  const anySlid = isLeftSlid || isRightSlid;

  const handleToggleLeft = () => {
    onUpdateState({
      leftDoorOpen: !isLeftSlid,
      rightDoorOpen: isRightSlid,
      bothDoorsOpen: false,
    });
  };

  const handleToggleRight = () => {
    onUpdateState({
      rightDoorOpen: !isRightSlid,
      leftDoorOpen: isLeftSlid,
      bothDoorsOpen: false,
    });
  };

  const handleResetDoors = () => {
    onUpdateState({
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
    });
  };

  const handleSlideBoth = () => {
    onUpdateState({
      leftDoorOpen: true,
      rightDoorOpen: true,
      bothDoorsOpen: true,
    });
  };

  const handleSetReferenceState = () => {
    onUpdateState({
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
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
          Outward-Only Bypass
        </span>
      </div>

      {/* Quick Action: Client Reference Photo State */}
      <button
        onClick={handleSetReferenceState}
        className="w-full py-2 px-3 rounded-lg bg-[#A88C69]/10 hover:bg-[#A88C69]/20 border border-[#A88C69]/30 text-[#A88C69] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all"
      >
        <Camera className="w-3.5 h-3.5" />
        Match Reference Photo (Doors Outer, Centre Exposed)
      </button>

      {/* Outward Kinematics Status Box */}
      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] text-[11px] text-[#6B5A36] space-y-1.5">
        <div className="font-semibold text-[#242424] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#A88C69]" />
          Outward-Only Sliding Mechanism
        </div>
        <p className="leading-relaxed text-[#5C5852]">
          • <strong>Left Door:</strong> Slides horizontally toward the <strong>LEFT</strong> (negative X).<br />
          • <strong>Right Door:</strong> Slides horizontally toward the <strong>RIGHT</strong> (positive X).<br />
          • <strong>Central Storage:</strong> Remains permanently fixed, accessible, and unblocked.<br />
          • <strong>Reference Position:</strong> Strict maximum inward boundary (doors never cross centreline or meet at centre).
        </p>
      </div>

      {/* Master Toggle Button: Slide Doors / Return Doors */}
      <button
        onClick={anySlid ? handleResetDoors : handleSlideBoth}
        className={`w-full py-3 px-4 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 border transition-all ${
          anySlid
            ? "bg-[#242424] text-white border-[#242424] shadow-md"
            : "bg-white text-[#242424] border-[#A88C69] hover:bg-[#F9F7F4] shadow-sm"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#A88C69]" />
        {anySlid ? "Return Doors" : "Slide Doors"}
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
            Left Door
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isLeftSlid ? `Slid Left ${slideMm} mm` : "Reference (Left)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isLeftSlid ? "return inward" : "slide left (outward)"}
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
            Right Door
          </div>
          <div className="text-[13px] font-medium text-[#242424] mt-0.5">
            {isRightSlid ? `Slid Right ${slideMm} mm` : "Reference (Right)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isRightSlid ? "return inward" : "slide right (outward)"}
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
          Click either door in the 3D viewport to slide it outward along its track. Click again to return it to the reference position.
        </p>
      </div>

      {/* Engineering Specifications */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-mono uppercase text-[#77736D]">
          Track Engineering Specifications
        </div>
        <ul className="text-[11px] text-[#77736D] space-y-1 list-disc list-inside">
          <li>Independent parallel tracks, 40mm bypass clearance (no door-to-door collision)</li>
          <li>Continuous 3.50m guide rails with mechanical end stops at ±1.75m</li>
          <li>Milky acid-etched frosted satin privacy glass with alabaster border bands</li>
        </ul>
      </div>
    </div>
  );
}

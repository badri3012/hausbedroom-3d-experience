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
      ...(!isLeftSlid ? NO_DRAWERS : {}),
    });
  };

  const handleToggleRight = () => {
    onUpdateState({
      rightDoorOpen: !isRightSlid,
      leftDoorOpen: isLeftSlid,
      bothDoorsOpen: false,
      ...(!isRightSlid ? NO_DRAWERS : {}),
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
      ...NO_DRAWERS,
    });
  };

  const handleSetReferenceState = () => {
    onUpdateState({
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
      ...NO_DRAWERS,
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
        Match Reference Photo (Doors Outer, Centre Exposed)
      </button>

      {/* Geometry validation notice */}
      {!travel.outwardTravelPossible && (
        <div className="p-3 bg-[#FFF8EA] rounded-xl border border-[#E9D5A8] text-[11px] text-[#6B5A36] space-y-1">
          <div className="font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#A88C69]" />
            Travel limitation (demo dimensions)
          </div>
          <p className="leading-relaxed">
            In the reference layout both doors already sit flush against their
            side panels, so there is 0&nbsp;mm of outward track to slide into.
            Each door therefore moves independently inward only, up to{" "}
            {slideMm}&nbsp;mm, and the two doors always keep at least {gapMm}&nbsp;mm
            apart — they never meet at the centre and never stack on one side.
          </p>
        </div>
      )}

      {/* Master Toggle Button */}
      <button
        onClick={anySlid ? handleResetDoors : handleSlideBoth}
        className={`w-full py-3 px-4 rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 border transition-all ${
          anySlid
            ? "bg-[#242424] text-white border-[#242424] shadow-md"
            : "bg-white text-[#242424] border-[#A88C69] hover:bg-[#F9F7F4] shadow-sm"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4 text-[#A88C69]" />
        {anySlid ? "Return Doors to Reference Position" : "Slide Both Doors (Independent)"}
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
            {isLeftSlid ? `Slid ${slideMm} mm` : "Reference (Left)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isLeftSlid ? "return to left" : "slide along track"}
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
            {isRightSlid ? `Slid ${slideMm} mm` : "Reference (Right)"}
          </div>
          <div className="text-[10px] text-[#A88C69] mt-1">
            Click to {isRightSlid ? "return to right" : "slide along track"}
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
          Click either door in the 3D view to slide it along its own track. Opening a drawer
          returns the doors to their reference positions first.
        </p>
      </div>

      {/* Engineering Specifications */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-mono uppercase text-[#77736D]">
          Track Engineering Specifications
        </div>
        <ul className="text-[11px] text-[#77736D] space-y-1 list-disc list-inside">
          <li>Independent parallel tracks, 40mm bypass clearance (no door-to-door collision)</li>
          <li>Hard travel limits: doors cannot leave the track or touch the side panels</li>
          <li>Milky acid-etched frosted satin privacy glass with alabaster border bands</li>
        </ul>
      </div>
    </div>
  );
}

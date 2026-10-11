"use client";

import React from "react";
import { WardrobeInteractionState } from "@/types/wardrobe";
import {
  Layers,
  Lightbulb,
  Maximize2,
  Box,
  Sliders,
  Sparkles,
} from "lucide-react";

interface InteriorControlsProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

export function InteriorControls({
  state,
  onUpdateState,
}: InteriorControlsProps) {
  const areDrawersOpen =
    state.drawersOpen || state.topDrawerOpen || state.bottomDrawerOpen;

  const handleToggleAllDrawers = () => {
    if (areDrawersOpen) {
      onUpdateState({
        drawersOpen: false,
        topDrawerOpen: false,
        bottomDrawerOpen: false,
      });
    } else {
      onUpdateState({
        drawersOpen: true,
        topDrawerOpen: true,
        bottomDrawerOpen: true,
      });
    }
  };

  const handleToggleInteriorView = () => {
    const nextState = !state.interiorViewActive;
    onUpdateState({
      interiorViewActive: nextState,
      leftDoorOpen: nextState ? true : state.leftDoorOpen,
      rightDoorOpen: nextState ? true : state.rightDoorOpen,
      bothDoorsOpen: nextState ? true : state.bothDoorsOpen,
      cameraPreset: nextState ? "interior" : "default",
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. INTERIOR INSPECTION HERO BUTTON */}
      <div className="p-3.5 bg-gradient-to-br from-white to-[#FAF8F5] rounded-xl border border-[#A88C69]/40 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A88C69] font-medium flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            Dedicated Interior Inspection
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#A88C69]/10 text-[#A88C69] font-mono">
            Focus Mode
          </span>
        </div>

        <p className="text-[11px] text-[#77736D] leading-relaxed">
          Automatically opens exterior sliding doors and guides the 3D camera into the central storage cubbies and interior organizers.
        </p>

        <button
          onClick={handleToggleInteriorView}
          className={`w-full py-2.5 px-3 rounded-lg text-[12px] font-medium flex items-center justify-center gap-2 transition-all ${
            state.interiorViewActive
              ? "bg-[#242424] text-white"
              : "bg-[#A88C69] text-white hover:bg-[#967C5B] shadow-sm"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {state.interiorViewActive
            ? "Exit Interior Inspection"
            : "Enter Interior Inspection View"}
        </button>
      </div>

      {/* 2. DRAWER INTERACTION SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#77736D] flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-[#A88C69]" />
            Soft-Close Drawers
          </label>
          <span className="text-[11px] text-[#A88C69] font-mono">
            Under-Mount Glides
          </span>
        </div>

        <button
          onClick={handleToggleAllDrawers}
          className="w-full py-2.5 px-3 rounded-xl border border-[#D1C9BC] bg-white hover:bg-[#F9F7F4] text-[#242424] text-[12px] font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-[#A88C69]" />
          {areDrawersOpen ? "Push In All Drawers" : "Pull Out All Drawers"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onUpdateState({
                topDrawerOpen: !state.topDrawerOpen,
                drawersOpen: false,
              })
            }
            className={`p-2.5 rounded-lg border text-left text-[11px] transition-all ${
              state.topDrawerOpen
                ? "bg-white border-[#A88C69] font-medium"
                : "bg-white/60 border-[#E6E1D8]"
            }`}
          >
            <div className="text-[#77736D]">Upper Drawer</div>
            <div className="text-[#242424] font-medium mt-0.5">
              {state.topDrawerOpen ? "Pulled Out (Open)" : "Closed"}
            </div>
          </button>

          <button
            onClick={() =>
              onUpdateState({
                bottomDrawerOpen: !state.bottomDrawerOpen,
                drawersOpen: false,
              })
            }
            className={`p-2.5 rounded-lg border text-left text-[11px] transition-all ${
              state.bottomDrawerOpen
                ? "bg-white border-[#A88C69] font-medium"
                : "bg-white/60 border-[#E6E1D8]"
            }`}
          >
            <div className="text-[#77736D]">Lower Drawer</div>
            <div className="text-[#242424] font-medium mt-0.5">
              {state.bottomDrawerOpen ? "Pulled Out (Open)" : "Closed"}
            </div>
          </button>
        </div>
      </div>

      {/* 3. INTEGRATED LED LIGHTING TOGGLE */}
      <div className="p-3 bg-white rounded-xl border border-[#E6E1D8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              state.shelfLedsOn
                ? "bg-[#FFE8B8] text-[#C5A059]"
                : "bg-[#EFECE6] text-[#77736D]"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[12px] font-medium text-[#242424]">
              Warm Shelf LED Channels
            </div>
            <div className="text-[10px] text-[#77736D]">
              3000K warm interior illumination
            </div>
          </div>
        </div>

        <button
          onClick={() => onUpdateState({ shelfLedsOn: !state.shelfLedsOn })}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            state.shelfLedsOn
              ? "bg-[#A88C69] text-white"
              : "bg-[#EFECE6] text-[#77736D] hover:bg-[#E2DDD5]"
          }`}
        >
          {state.shelfLedsOn ? "LEDs On" : "LEDs Off"}
        </button>
      </div>

      {/* 4. INTERIOR STORAGE COMPARTMENTS BREAKDOWN */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-mono uppercase text-[#77736D]">
          Interior Organization Breakdown
        </div>
        <ul className="text-[11px] text-[#77736D] space-y-1 list-disc list-inside">
          <li>Central 6-tier display cubby grid for folded knits & bags</li>
          <li>Dual high-load garment hanging rails with anti-slip buffer</li>
          <li>Top luggage shelves accommodating full-size Rimowa luggage</li>
          <li>Under-mount soft-close drawer runners rated for 40kg load</li>
        </ul>
      </div>
    </div>
  );
}

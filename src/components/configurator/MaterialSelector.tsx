"use client";

import React, { useState } from "react";
import {
  WOOD_FINISH_OPTIONS,
  FRAME_FINISH_OPTIONS,
  DOOR_PANEL_OPTIONS,
} from "@/lib/materials";
import {
  WoodFinishId,
  FrameFinishId,
  DoorPanelId,
} from "@/types/wardrobe";
import { Check, Palette, Sparkles } from "lucide-react";

interface MaterialSelectorProps {
  activeWood: WoodFinishId;
  activeFrame: FrameFinishId;
  activeDoorPanel: DoorPanelId;
  onSelectWood: (id: WoodFinishId) => void;
  onSelectFrame: (id: FrameFinishId) => void;
  onSelectDoorPanel: (id: DoorPanelId) => void;
}

export function MaterialSelector({
  activeWood,
  activeFrame,
  activeDoorPanel,
  onSelectWood,
  onSelectFrame,
  onSelectDoorPanel,
}: MaterialSelectorProps) {
  const [subTab, setSubTab] = useState<"wood" | "frame" | "doors">("wood");

  return (
    <div className="space-y-4">
      {/* Subcategory Pill Switcher */}
      <div className="flex bg-[#EFECE6] p-1 rounded-xl">
        <button
          onClick={() => setSubTab("wood")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-medium transition-all ${
            subTab === "wood"
              ? "bg-white text-[#242424] shadow-sm"
              : "text-[#77736D] hover:text-[#242424]"
          }`}
        >
          Wood Interior
        </button>
        <button
          onClick={() => setSubTab("frame")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-medium transition-all ${
            subTab === "frame"
              ? "bg-white text-[#242424] shadow-sm"
              : "text-[#77736D] hover:text-[#242424]"
          }`}
        >
          Aluminium Frame
        </button>
        <button
          onClick={() => setSubTab("doors")}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-medium transition-all ${
            subTab === "doors"
              ? "bg-white text-[#242424] shadow-sm"
              : "text-[#77736D] hover:text-[#242424]"
          }`}
        >
          Door Facade
        </button>
      </div>

      {/* 1. WOOD FINISHES */}
      {subTab === "wood" && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#77736D]">
              Select Wood Finish
            </span>
            <span className="text-[11px] text-[#A88C69] font-mono">
              E0 Moisture-Resistant
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {WOOD_FINISH_OPTIONS.map((option) => {
              const isSelected = activeWood === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelectWood(option.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
                      : "bg-white/50 hover:bg-white border-[#E6E1D8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Material Swatch Circle */}
                    <div
                      className="w-8 h-8 rounded-full border border-black/10 shadow-inner shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#242424]">
                        {option.name}
                      </div>
                      <div className="text-[11px] text-[#77736D]">
                        {option.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#A88C69] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#77736D] leading-relaxed pt-1">
            Manufactured with E0 low-formaldehyde engineered timber cores, calibrated for Singapore’s tropical humidity.
          </p>
        </div>
      )}

      {/* 2. FRAME FINISHES */}
      {subTab === "frame" && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#77736D]">
              Select Frame Profile
            </span>
            <span className="text-[11px] text-[#A88C69] font-mono">
              Anodized Alloy
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {FRAME_FINISH_OPTIONS.map((option) => {
              const isSelected = activeFrame === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelectFrame(option.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
                      : "bg-white/50 hover:bg-white border-[#E6E1D8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-black/15 shadow-inner shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#242424]">
                        {option.name}
                      </div>
                      <div className="text-[11px] text-[#77736D]">
                        {option.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#A88C69] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#77736D] leading-relaxed pt-1">
            Aerospace-grade extruded aluminium extrusion with electro-deposited micro-coating for scratch and corrosion resistance.
          </p>
        </div>
      )}

      {/* 3. DOOR PANELS */}
      {subTab === "doors" && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#77736D]">
              Select Door Panel Finish
            </span>
            <span className="text-[11px] text-[#A88C69] font-mono">
              Safety Tempered
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DOOR_PANEL_OPTIONS.map((option) => {
              const isSelected = activeDoorPanel === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelectDoorPanel(option.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white border-[#A88C69] shadow-sm ring-1 ring-[#A88C69]/20"
                      : "bg-white/50 hover:bg-white border-[#E6E1D8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-black/15 shadow-inner shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#242424]">
                        {option.name}
                      </div>
                      <div className="text-[11px] text-[#77736D]">
                        {option.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#A88C69] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#77736D] leading-relaxed pt-1">
            Frosted satin privacy glass softens internal contents while allowing interior LED illumination to emit a warm architectural glow.
          </p>
        </div>
      )}
    </div>
  );
}

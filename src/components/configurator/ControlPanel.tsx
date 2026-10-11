"use client";

import React from "react";
import { WardrobeInteractionState, CameraPreset } from "@/types/wardrobe";
import {
  RotateCcw,
  Compass,
  Lightbulb,
  Ruler,
  Maximize2,
  ArrowLeftRight,
  Box,
  Eye,
} from "lucide-react";

interface ControlPanelProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  onResetView: () => void;
}

export function ControlPanel({
  state,
  onUpdateState,
  onResetView,
}: ControlPanelProps) {
  const isDoorsOpen = state.leftDoorOpen || state.rightDoorOpen || state.bothDoorsOpen;
  const isDrawersOpen = state.drawersOpen || state.topDrawerOpen || state.bottomDrawerOpen;

  const handleToggleDoors = () => {
    if (isDoorsOpen) {
      // Return both doors to their reference-photo positions
      onUpdateState({
        leftDoorOpen: false,
        rightDoorOpen: false,
        bothDoorsOpen: false,
      });
    } else {
      // Slide each door independently within its own track limits;
      // drawers must be closed first (they pull out through the door plane)
      onUpdateState({
        leftDoorOpen: true,
        rightDoorOpen: true,
        bothDoorsOpen: true,
        drawersOpen: false,
        topDrawerOpen: false,
        bottomDrawerOpen: false,
      });
    }
  };

  const handleToggleDrawers = () => {
    if (isDrawersOpen) {
      onUpdateState({
        drawersOpen: false,
        topDrawerOpen: false,
        bottomDrawerOpen: false,
      });
    } else {
      // Doors return to reference positions so they can't block the drawers
      onUpdateState({
        drawersOpen: true,
        topDrawerOpen: true,
        bottomDrawerOpen: true,
        leftDoorOpen: false,
        rightDoorOpen: false,
        bothDoorsOpen: false,
      });
    }
  };

  const handleToggleInteriorView = () => {
    const nextState = !state.interiorViewActive;
    onUpdateState({
      interiorViewActive: nextState,
      // The centre storage is already exposed at the reference door positions
      ...(nextState
        ? { leftDoorOpen: false, rightDoorOpen: false, bothDoorsOpen: false }
        : {}),
      cameraPreset: nextState ? "interior" : "default",
    });
  };

  const toggleSpotlights = () => {
    onUpdateState({ showSpotlights: !state.showSpotlights });
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. TOP VIEWPORT HUD: CLEAN, RESPONSIVE, ZERO CLIPPING     */}
      {/* ========================================================= */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Camera Presets Segmented Bar */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-[#1C1C19]/85 backdrop-blur-md border border-white/10 rounded-xl shadow-lg text-white">
          {(
            [
              { id: "default", label: "Perspective" },
              { id: "front", label: "Front" },
              { id: "interior", label: "Interior" },
              { id: "side", label: "Side 45°" },
              { id: "top", label: "Top" },
            ] as { id: CameraPreset; label: string }[]
          ).map((cam) => {
            const isActive =
              (state.interiorViewActive && cam.id === "interior") ||
              (!state.interiorViewActive && state.cameraPreset === cam.id);

            return (
              <button
                key={cam.id}
                onClick={() => {
                  if (cam.id === "interior") {
                    handleToggleInteriorView();
                  } else {
                    onUpdateState({
                      cameraPreset: cam.id,
                      interiorViewActive: false,
                    });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-[#A88C69] text-white shadow-sm font-semibold"
                    : "text-[#D8D0C5] hover:text-white hover:bg-white/10"
                }`}
              >
                {cam.label}
              </button>
            );
          })}
        </div>

        {/* Viewport Utilities (Dimensions, Lights, Auto-Rotate, Reset) */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-[#1C1C19]/85 backdrop-blur-md border border-white/10 rounded-xl shadow-lg text-white">
          {/* Dimensions Toggle */}
          <button
            onClick={() =>
              onUpdateState({ showDimensions: !state.showDimensions })
            }
            title="Toggle 3D Architectural Dimensions"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              state.showDimensions
                ? "bg-[#A88C69] text-white"
                : "text-[#D8D0C5] hover:text-white hover:bg-white/10"
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dimensions</span>
          </button>

          {/* Spotlights Toggle */}
          <button
            onClick={toggleSpotlights}
            title="Toggle Ceiling Spotlights"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              state.showSpotlights
                ? "text-white bg-white/15"
                : "text-[#77736D] hover:text-[#D8D0C5] hover:bg-white/10"
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${state.showSpotlights ? "text-[#C5A059]" : ""}`} />
            <span className="hidden sm:inline">Lighting</span>
          </button>

          {/* 360 Turntable Auto-Rotate */}
          <button
            onClick={() => onUpdateState({ autoRotate: !state.autoRotate })}
            title="Toggle 360° Turntable Rotation"
            className={`p-1.5 rounded-lg transition-all ${
              state.autoRotate
                ? "bg-[#A88C69] text-white"
                : "text-[#D8D0C5] hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${state.autoRotate ? "animate-spin" : ""}`} />
          </button>

          {/* Quick Reset */}
          <button
            onClick={onResetView}
            title="Reset Camera & Wardrobe Position"
            className="p-1.5 rounded-lg text-[#D8D0C5] hover:text-white hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BOTTOM FLOATING INTERACTION BAR: SAFE & BALANCED       */}
      {/* ========================================================= */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-[#1C1C19]/90 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl text-white">
          {/* Toggle Sliding Doors */}
          <button
            onClick={handleToggleDoors}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11.5px] sm:text-[12px] font-medium flex items-center gap-2 transition-all ${
              isDoorsOpen
                ? "bg-white text-[#1C1C19] shadow-sm font-semibold"
                : "text-[#E0D8CE] hover:text-white hover:bg-white/10"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A88C69]" />
            <span>{isDoorsOpen ? "Reset Doors" : "Slide Doors"}</span>
          </button>

          {/* Toggle Drawers */}
          <button
            onClick={handleToggleDrawers}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11.5px] sm:text-[12px] font-medium flex items-center gap-2 transition-all ${
              isDrawersOpen
                ? "bg-white text-[#1C1C19] shadow-sm font-semibold"
                : "text-[#E0D8CE] hover:text-white hover:bg-white/10"
            }`}
          >
            <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A88C69]" />
            <span>{isDrawersOpen ? "Close Drawers" : "Open Drawers"}</span>
          </button>

          {/* Interior View Mode */}
          <button
            onClick={handleToggleInteriorView}
            className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11.5px] sm:text-[12px] font-medium flex items-center gap-2 transition-all ${
              state.interiorViewActive
                ? "bg-[#A88C69] text-white shadow-md font-semibold"
                : "text-[#E0D8CE] hover:text-white hover:bg-white/10"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Interior View</span>
          </button>
        </div>
      </div>
    </>
  );
}

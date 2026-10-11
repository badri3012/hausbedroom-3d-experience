"use client";

import React, { useState } from "react";
import { Scene } from "@/components/three/Scene";
import { ControlPanel } from "./ControlPanel";
import { WardrobeSelector } from "./WardrobeSelector";
import { MaterialSelector } from "./MaterialSelector";
import { DoorControls } from "./DoorControls";
import { InteriorControls } from "./InteriorControls";
import { DimensionsPanel } from "./DimensionsPanel";
import { EnquiryModal } from "./EnquiryModal";
import {
  WardrobeInteractionState,
  ConfiguratorTab,
  WardrobeVariantId,
  WoodFinishId,
  FrameFinishId,
  DoorPanelId,
} from "@/types/wardrobe";
import { WARDROBE_VARIANTS } from "@/lib/wardrobe-config";
import {
  WOOD_FINISH_OPTIONS,
  FRAME_FINISH_OPTIONS,
  DOOR_PANEL_OPTIONS,
} from "@/lib/materials";
import {
  Layers,
  Palette,
  ArrowLeftRight,
  Maximize2,
  Ruler,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function Configurator() {
  // Master interaction & configuration state
  const [state, setState] = useState<WardrobeInteractionState>({
    activeVariant: "contemporary-sliding",
    woodFinish: "natural-oak",
    frameFinish: "matte-black",
    doorPanel: "frosted-glass",

    leftDoorOpen: false,
    rightDoorOpen: false,
    bothDoorsOpen: false,

    topDrawerOpen: false,
    bottomDrawerOpen: false,
    drawersOpen: false,

    cameraPreset: "default",
    interiorViewActive: false,
    autoRotate: false,

    lightingMode: "showroom-spots",
    showDimensions: false,
    showSpotlights: true,
    shelfLedsOn: true,

    hoveredComponent: null,
    selectedComponent: null,
  });

  const [activeTab, setActiveTab] = useState<ConfiguratorTab>("overview");
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(true);

  // Active variant & finish lookups
  const currentVariant =
    WARDROBE_VARIANTS.find((v) => v.id === state.activeVariant) ||
    WARDROBE_VARIANTS[0];

  const currentWood =
    WOOD_FINISH_OPTIONS.find((w) => w.id === state.woodFinish) ||
    WOOD_FINISH_OPTIONS[0];

  const currentFrame =
    FRAME_FINISH_OPTIONS.find((f) => f.id === state.frameFinish) ||
    FRAME_FINISH_OPTIONS[0];

  const currentDoorPanel =
    DOOR_PANEL_OPTIONS.find((d) => d.id === state.doorPanel) ||
    DOOR_PANEL_OPTIONS[0];

  const handleUpdateState = (updates: Partial<WardrobeInteractionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectVariant = (id: WardrobeVariantId) => {
    const variant = WARDROBE_VARIANTS.find((v) => v.id === id);
    if (!variant) return;

    setState((prev) => ({
      ...prev,
      activeVariant: id,
      woodFinish: variant.defaultWood,
      frameFinish: variant.defaultFrame,
      doorPanel: variant.defaultDoorPanel,
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
      topDrawerOpen: false,
      bottomDrawerOpen: false,
      drawersOpen: false,
      interiorViewActive: false,
      cameraPreset: "default",
    }));
  };

  const handleResetView = () => {
    const variant = WARDROBE_VARIANTS.find((v) => v.id === state.activeVariant);
    setState({
      activeVariant: state.activeVariant,
      woodFinish: variant?.defaultWood || "natural-oak",
      frameFinish: variant?.defaultFrame || "matte-black",
      doorPanel: variant?.defaultDoorPanel || "frosted-glass",
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
      topDrawerOpen: false,
      bottomDrawerOpen: false,
      drawersOpen: false,
      cameraPreset: "default",
      interiorViewActive: false,
      autoRotate: false,
      lightingMode: "showroom-spots",
      showDimensions: false,
      showSpotlights: true,
      shelfLedsOn: true,
      hoveredComponent: null,
      selectedComponent: null,
    });
  };

  const tabs: { id: ConfiguratorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "materials", label: "Materials", icon: Palette },
    { id: "doors", label: "Doors", icon: ArrowLeftRight },
    { id: "interior", label: "Interior", icon: Maximize2 },
    { id: "dimensions", label: "Dimensions", icon: Ruler },
    { id: "enquire", label: "Enquire", icon: FileText },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-[#F5F3EF] text-[#242424] overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. TOP LUXURY NAVIGATION BAR (Protected from Clipping)    */}
      {/* ========================================================= */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-[#F5F3EF] border-b border-[#E6E1D8] flex items-center justify-between shrink-0 z-20 gap-3">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="flex flex-col">
            <span className="font-serif-editorial text-[18px] sm:text-[20px] tracking-tight font-bold text-[#242424] leading-none whitespace-nowrap">
              HausBedroom
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#A88C69] mt-0.5 whitespace-nowrap">
              Singapore 3D Experience
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3.5 border-l border-[#E6E1D8]">
            <span className="text-[11px] font-mono text-[#77736D]">
              Active: <strong className="text-[#242424]">{currentVariant.title}</strong>
            </span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleResetView}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-[#77736D] hover:text-[#242424] hover:bg-white/70 border border-transparent hover:border-[#E6E1D8] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>

          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-medium bg-[#242424] text-white hover:bg-[#3A3A3A] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="whitespace-nowrap">Request This Wardrobe</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN SPLIT INTERACTION AREA                            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {/* ======================================================= */}
        {/* LEFT VIEWPORT: 3D REAL-TIME WEBGL CANVAS                */}
        {/* ======================================================= */}
        <div className="flex-1 relative h-[55vh] md:h-full bg-[#181816] overflow-hidden">
          <Scene state={state} onUpdateState={handleUpdateState} />

          {/* Clean Floating HUD (Camera, Lights, Doors, Drawers) */}
          <ControlPanel
            state={state}
            onUpdateState={handleUpdateState}
            onResetView={handleResetView}
          />
        </div>

        {/* ======================================================= */}
        {/* RIGHT PANEL: LUXURY PRODUCT CONFIGURATOR                */}
        {/* ======================================================= */}
        <aside
          className={`w-full md:w-[380px] lg:w-[420px] xl:w-[440px] bg-[#FAF8F5] border-t md:border-t-0 md:border-l border-[#E6E1D8] flex flex-col shrink-0 z-20 transition-all duration-300 ${
            mobileSheetOpen ? "h-[45vh] md:h-full" : "h-11 md:h-full"
          }`}
        >
          {/* Mobile Sheet Toggle Bar */}
          <div
            onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
            className="md:hidden flex items-center justify-between px-4 py-2 bg-[#F5F3EF] border-b border-[#E6E1D8] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#242424]">
                Configuration Options
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#A88C69]/10 text-[#A88C69] font-mono">
                {currentVariant.title}
              </span>
            </div>
            {mobileSheetOpen ? (
              <ChevronDown className="w-4 h-4 text-[#77736D]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#77736D]" />
            )}
          </div>

          {/* CONFIGURATOR TABS HEADER */}
          <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 bg-[#F5F3EF] border-b border-[#E6E1D8] overflow-x-auto no-scrollbar shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "enquire") {
                      setIsEnquiryOpen(true);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-[11.5px] font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-[#242424] shadow-sm font-semibold"
                      : "text-[#77736D] hover:text-[#242424]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#A88C69]" : "text-[#77736D]"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CONFIGURATOR SCROLLABLE BODY */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Variant Selector */}
                <WardrobeSelector
                  activeVariant={state.activeVariant}
                  onSelectVariant={handleSelectVariant}
                />

                {/* Model Overview Details */}
                <div className="p-4 bg-white rounded-xl border border-[#E6E1D8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-[#A88C69] font-medium">
                      Design Highlights
                    </span>
                    <span className="text-[11px] font-mono text-[#77736D]">
                      {currentVariant.referenceTag}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#77736D] leading-relaxed">
                    {currentVariant.description}
                  </p>

                  <ul className="space-y-1.5 text-[11px] text-[#242424]">
                    {currentVariant.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A88C69] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Active Materials Summary Card */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E6E1D8] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[#77736D] block text-[10px] font-mono uppercase">
                      Selected Finishes
                    </span>
                    <span className="font-medium text-[#242424]">
                      {currentWood.name} · {currentFrame.name} · {currentDoorPanel.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className="text-[#A88C69] font-medium hover:underline text-[11px]"
                  >
                    Customize →
                  </button>
                </div>
              </div>
            )}

            {/* 2. MATERIALS TAB */}
            {activeTab === "materials" && (
              <div className="animate-in fade-in duration-200">
                <MaterialSelector
                  activeWood={state.woodFinish}
                  activeFrame={state.frameFinish}
                  activeDoorPanel={state.doorPanel}
                  onSelectWood={(w: WoodFinishId) => handleUpdateState({ woodFinish: w })}
                  onSelectFrame={(f: FrameFinishId) => handleUpdateState({ frameFinish: f })}
                  onSelectDoorPanel={(d: DoorPanelId) => handleUpdateState({ doorPanel: d })}
                />
              </div>
            )}

            {/* 3. DOORS TAB */}
            {activeTab === "doors" && (
              <div className="animate-in fade-in duration-200">
                <DoorControls state={state} onUpdateState={handleUpdateState} />
              </div>
            )}

            {/* 4. INTERIOR TAB */}
            {activeTab === "interior" && (
              <div className="animate-in fade-in duration-200">
                <InteriorControls state={state} onUpdateState={handleUpdateState} />
              </div>
            )}

            {/* 5. DIMENSIONS TAB */}
            {activeTab === "dimensions" && (
              <div className="animate-in fade-in duration-200">
                <DimensionsPanel
                  dimensions={currentVariant.dimensions}
                  showDimensions={state.showDimensions}
                  onToggleShowDimensions={() =>
                    handleUpdateState({ showDimensions: !state.showDimensions })
                  }
                />
              </div>
            )}
          </div>

          {/* BOTTOM CTA BAR */}
          <div className="p-3.5 sm:p-4 bg-[#F5F3EF] border-t border-[#E6E1D8] shrink-0">
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="w-full py-3 px-4 bg-[#242424] hover:bg-[#383838] text-white rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Request This Wardrobe Quote</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 3. CLIENT ENQUIRY MODAL                                   */}
      {/* ========================================================= */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        state={state}
        variant={currentVariant}
        woodMaterial={currentWood}
        frameMaterial={currentFrame}
        doorPanelMaterial={currentDoorPanel}
      />
    </div>
  );
}

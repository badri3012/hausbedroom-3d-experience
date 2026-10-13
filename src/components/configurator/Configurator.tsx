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
  SystemShapeSelector,
  DimensionalControls,
  DoorConfigurationPanel,
  InternalLayoutAddonsPanel,
  LiveQuotationCard,
} from "./engineering";
import { useConfiguratorEngineering } from "@/hooks/useConfiguratorEngineering";
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
  Ruler,
  Palette,
  ArrowLeftRight,
  Maximize2,
  Calculator,
  MessageSquare,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Columns3,
  Check,
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
  const [headerCopied, setHeaderCopied] = useState(false);

  // Engineering calculation engine hook
  const eng = useConfiguratorEngineering();

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
    setState((prev) => ({
      ...prev,
      leftDoorOpen: false,
      rightDoorOpen: false,
      bothDoorsOpen: false,
      topDrawerOpen: false,
      bottomDrawerOpen: false,
      drawersOpen: false,
      cameraPreset: "default",
      interiorViewActive: false,
      autoRotate: false,
      showDimensions: false,
    }));
  };

  const handleCopyHeaderQuote = () => {
    navigator.clipboard.writeText(eng.quotationText);
    setHeaderCopied(true);
    setTimeout(() => setHeaderCopied(false), 2500);
  };

  // Active price calculation for display (includes add-ons for HausPole)
  const currentTotal =
    eng.productSystem === "pole"
      ? eng.poleAddons.grandTotal || 0
      : eng.flexPrice.total || 0;

  const currentFootage =
    eng.productSystem === "pole"
      ? eng.shape === "lshape"
        ? eng.poleLSPrice.feet
        : eng.poleStraightPrice.feet
      : eng.flexPrice.feet;

  const tabs: {
    id: ConfiguratorTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "overview", label: "Dimensions", icon: Ruler },
    { id: "doors", label: "Doors", icon: ArrowLeftRight },
    { id: "interior", label: "Interior", icon: Maximize2 },
    { id: "materials", label: "Materials", icon: Palette },
    { id: "quote", label: "Quotation", icon: Calculator },
    { id: "showroom", label: "Showroom", icon: Columns3 },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-[#F5F3EF] text-[#242424] overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR                                     */}
      {/* ========================================================= */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-[#F5F3EF] border-b border-[#E6E1D8] flex items-center justify-between shrink-0 z-20 gap-3">
        {/* Brand Logo & System Info */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="flex flex-col">
            <span className="font-serif-editorial text-[18px] sm:text-[20px] tracking-tight font-bold text-[#242424] leading-none whitespace-nowrap">
              HausBedroom
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#A88C69] mt-0.5 whitespace-nowrap">
              3D Wardrobe Configurator
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3.5 border-l border-[#E6E1D8]">
            <span className="text-[11px] font-mono text-[#77736D]">
              System:{" "}
              <strong className="text-[#242424]">
                {eng.productSystem === "pole" ? "HausPole" : "HausFlex"} (
                {eng.shape === "straight" ? "Straight" : "L-Shape"})
              </strong>
            </span>
            <span className="text-[11px] font-mono text-[#A88C69]">
              · {currentFootage.toFixed(1)} ft
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
            onClick={handleCopyHeaderQuote}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all shadow-sm ${
              headerCopied
                ? "bg-emerald-600 text-white"
                : "bg-[#25D366] hover:bg-[#20BE5B] text-white"
            }`}
          >
            {headerCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">WhatsApp Quote</span>
                <span className="sm:hidden">Quote</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-medium bg-[#242424] text-white hover:bg-[#3A3A3A] transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="whitespace-nowrap hidden sm:inline">Enquire Custom</span>
            <span className="sm:hidden">Enquire</span>
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
        <div className="flex-1 relative h-[54vh] md:h-full bg-[#181816] overflow-hidden">
          <Scene
            state={state}
            onUpdateState={handleUpdateState}
            productSystem={
              activeTab === "showroom" ? "showroom" : eng.productSystem
            }
            shape={eng.shape}
            poleState={eng.poleState}
            poleDesign={eng.poleDesign}
            poleLShapeDesign={eng.poleLShapeDesign}
            flexState={eng.flexState}
            flexDesign={eng.flexDesign}
            flexLShapeDesign={eng.flexLShapeDesign}
          />

          {/* Clean Floating HUD (Camera, Lights, Doors, Drawers, Dimensions) */}
          <ControlPanel
            state={state}
            onUpdateState={handleUpdateState}
            onResetView={handleResetView}
          />
        </div>

        {/* ======================================================= */}
        {/* RIGHT PANEL: CONFIGURATOR CONTROLS                      */}
        {/* ======================================================= */}
        <aside
          className={`w-full md:w-[400px] lg:w-[435px] xl:w-[455px] bg-[#FAF8F5] border-t md:border-t-0 md:border-l border-[#E6E1D8] flex flex-col shrink-0 z-20 transition-all duration-300 ${
            mobileSheetOpen ? "h-[46vh] md:h-full" : "h-11 md:h-full"
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
                ${currentTotal.toFixed(2)} SGD
              </span>
            </div>
            {mobileSheetOpen ? (
              <ChevronDown className="w-4 h-4 text-[#77736D]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#77736D]" />
            )}
          </div>

          {/* CONFIGURATOR TABS HEADER — NON-CLIPPING 3x2 SEGMENTED GRID */}
          <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5 bg-[#F5F3EF] border-b border-[#E6E1D8] shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11.5px] font-medium transition-all ${
                    isActive
                      ? "bg-white text-[#242424] shadow-sm font-semibold border border-[#E6E1D8]"
                      : "text-[#77736D] hover:text-[#242424] hover:bg-white/50 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-[#A88C69]" : "text-[#77736D]"
                    }`}
                  />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* CONFIGURATOR SCROLLABLE BODY */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
            {/* 1. DIMENSIONS & SYSTEM TAB */}
            {activeTab === "overview" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <SystemShapeSelector
                  productSystem={eng.productSystem}
                  onSelectSystem={eng.setProductSystem}
                  shape={eng.shape}
                  onSelectShape={eng.setShape}
                />
                <DimensionalControls
                  productSystem={eng.productSystem}
                  shape={eng.shape}
                  poleState={eng.poleState}
                  onUpdatePole={eng.updatePoleState}
                  flexState={eng.flexState}
                  onUpdateFlex={eng.updateFlexState}
                />
              </div>
            )}

            {/* 2. DOORS TAB */}
            {activeTab === "doors" && (
              <div className="animate-in fade-in duration-200">
                <DoorConfigurationPanel
                  productSystem={eng.productSystem}
                  shape={eng.shape}
                  poleState={eng.poleState}
                  onUpdatePole={eng.updatePoleState}
                  poleDesign={eng.poleDesign}
                  poleLShapeDesign={eng.poleLShapeDesign}
                  flexState={eng.flexState}
                  onUpdateFlex={eng.updateFlexState}
                  flexDesign={eng.flexDesign}
                  flexLShapeDesign={eng.flexLShapeDesign}
                />
              </div>
            )}

            {/* 3. INTERIOR TAB */}
            {activeTab === "interior" && (
              <div className="animate-in fade-in duration-200">
                <InternalLayoutAddonsPanel
                  productSystem={eng.productSystem}
                  poleState={eng.poleState}
                  onUpdatePole={eng.updatePoleState}
                  poleDesign={eng.poleDesign}
                  flexState={eng.flexState}
                  onUpdateFlex={eng.updateFlexState}
                  flexDesign={eng.flexDesign}
                  activeFlexProposal={eng.activeFlexProposal || undefined}
                />
              </div>
            )}

            {/* 4. MATERIALS TAB */}
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

            {/* 5. LIVE QUOTATION TAB */}
            {activeTab === "quote" && (
              <div className="animate-in fade-in duration-200">
                <LiveQuotationCard
                  productSystem={eng.productSystem}
                  shape={eng.shape}
                  poleState={eng.poleState}
                  poleDesign={eng.poleDesign}
                  poleLShapeDesign={eng.poleLShapeDesign}
                  poleStraightPrice={eng.poleStraightPrice}
                  poleLSPrice={eng.poleLSPrice}
                  poleAddons={eng.poleAddons}
                  flexState={eng.flexState}
                  flexDesign={eng.flexDesign}
                  flexPrice={eng.flexPrice}
                  quotationText={eng.quotationText}
                />
              </div>
            )}

            {/* 6. SHOWROOM EXHIBITION GALLERY TAB */}
            {activeTab === "showroom" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <WardrobeSelector
                  activeVariant={state.activeVariant}
                  onSelectVariant={handleSelectVariant}
                />
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

          {/* BOTTOM LIVE PRICING & CTA BAR */}
          <div className="p-3.5 sm:p-4 bg-[#F5F3EF] border-t border-[#E6E1D8] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#777] block">Estimated Total:</span>
                <span className="font-mono font-bold text-[16px] text-[#242424]">
                  ${currentTotal.toFixed(2)} SGD
                </span>
              </div>
              <button
                onClick={() => setActiveTab("quote")}
                className="text-[11px] font-medium text-[#A88C69] hover:underline"
              >
                View Breakdown →
              </button>
            </div>

            <button
              onClick={handleCopyHeaderQuote}
              className={`w-full py-2.5 px-4 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition-all shadow-sm ${
                headerCopied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#25D366] hover:bg-[#20BE5B] text-white"
              }`}
            >
              {headerCopied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Quotation Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Copy WhatsApp Quotation (${currentTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* CUSTOM ENQUIRY MODAL */}
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

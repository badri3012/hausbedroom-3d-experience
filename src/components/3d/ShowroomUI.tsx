"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Sliders,
  Layers,
  Sparkles,
  Maximize2,
  Box,
  Check,
  Info,
  ShieldCheck,
  ChevronRight,
  Eye,
  CheckCircle2,
  Lock,
  Send,
  X,
} from "lucide-react";
import {
  HAUSFLEX_COMPONENTS,
  FRAME_FINISHES,
  WOOD_FINISHES,
  GLASS_FINISHES,
  CATALOG_PRODUCTS,
  MaterialOption,
  ComponentMetadata,
} from "@/types/showroom";

interface ShowroomUIProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isExploded: boolean;
  onToggleExploded: () => void;
  doorsOpen: boolean;
  onToggleDoors: () => void;
  drawersOpen: boolean;
  onToggleDrawers: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  frameMaterial: MaterialOption;
  onSelectFrameMaterial: (mat: MaterialOption) => void;
  woodMaterial: MaterialOption;
  onSelectWoodMaterial: (mat: MaterialOption) => void;
  glassMaterial: MaterialOption;
  onSelectGlassMaterial: (mat: MaterialOption) => void;
  activeProductId: string;
  onSelectProduct: (productId: string) => void;
}

export default function ShowroomUI({
  selectedComponentId,
  onSelectComponent,
  isExploded,
  onToggleExploded,
  doorsOpen,
  onToggleDoors,
  drawersOpen,
  onToggleDrawers,
  autoRotate,
  onToggleAutoRotate,
  frameMaterial,
  onSelectFrameMaterial,
  woodMaterial,
  onSelectWoodMaterial,
  glassMaterial,
  onSelectGlassMaterial,
  activeProductId,
  onSelectProduct,
}: ShowroomUIProps) {
  const [activeTab, setActiveTab] = useState<"inspect" | "materials" | "hierarchy">("inspect");
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const activeComponent: ComponentMetadata | null = selectedComponentId
    ? HAUSFLEX_COMPONENTS[selectedComponentId] || null
    : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
      {/* TOP BAR: Product Catalogue Tabs & Verification Badge */}
      <div className="pointer-events-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Product Switcher Pills */}
        <div className="flex items-center space-x-2 bg-[#242421]/90 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-xl">
          {CATALOG_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all ${
                activeProductId === prod.id
                  ? "bg-[#C5A059] text-[#242421] font-semibold shadow-md"
                  : "text-[#D8D0C5] hover:text-white hover:bg-white/10"
              }`}
            >
              {prod.name}
            </button>
          ))}
        </div>

        {/* Verification Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-mono text-[11px] tracking-wide">
            Verified HausFlex CAD Architecture • 3D WebGL
          </span>
        </div>
      </div>

      {/* CENTER HINT IF NOTHING SELECTED */}
      {!selectedComponentId && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/50 text-xs tracking-widest uppercase bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10 hidden md:block">
          Click any 3D component to inspect construction details
        </div>
      )}

      {/* BOTTOM FLOATING 3D CONTROLS BAR */}
      <div className="pointer-events-auto self-center mb-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#242421]/90 backdrop-blur-xl p-2.5 rounded-full border border-white/15 shadow-2xl">
        {/* Explode / Reassemble Toggle */}
        <button
          onClick={onToggleExploded}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold transition-all ${
            isExploded
              ? "bg-[#C5A059] text-[#242421] shadow-lg"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{isExploded ? "Reassemble Product" : "Explode Construction"}</span>
        </button>

        {/* Doors Open / Close */}
        <button
          onClick={onToggleDoors}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all ${
            doorsOpen
              ? "bg-white text-[#242421] shadow-md"
              : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/15"
          }`}
        >
          <span>{doorsOpen ? "Close Doors" : "Open Glass Doors"}</span>
        </button>

        {/* Drawers Open / Close */}
        <button
          onClick={onToggleDrawers}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all ${
            drawersOpen
              ? "bg-white text-[#242421] shadow-md"
              : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/15"
          }`}
        >
          <span>{drawersOpen ? "Close Drawers" : "Slide Open Drawers"}</span>
        </button>

        {/* 360° Auto Rotate */}
        <button
          onClick={onToggleAutoRotate}
          className={`p-2.5 rounded-full text-xs transition-all ${
            autoRotate
              ? "bg-[#C5A059] text-[#242421]"
              : "bg-white/10 hover:bg-white/20 text-white/80"
          }`}
          title="Toggle 360° Auto Rotation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* RIGHT SIDE INSPECTION & CONFIG PANEL (Desktop 30% width, Mobile Drawer) */}
      <div className="pointer-events-auto absolute top-20 right-6 bottom-24 w-full max-w-sm bg-[#242421]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col justify-between hidden md:flex text-white">
        {/* Panel Tabs */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <button
              onClick={() => setActiveTab("inspect")}
              className={`text-xs uppercase tracking-[0.15em] font-semibold transition-colors pb-1 border-b-2 ${
                activeTab === "inspect"
                  ? "border-[#C5A059] text-[#C5A059]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              Inspection
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`text-xs uppercase tracking-[0.15em] font-semibold transition-colors pb-1 border-b-2 ${
                activeTab === "materials"
                  ? "border-[#C5A059] text-[#C5A059]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              PBR Finishes
            </button>
            <button
              onClick={() => setActiveTab("hierarchy")}
              className={`text-xs uppercase tracking-[0.15em] font-semibold transition-colors pb-1 border-b-2 ${
                activeTab === "hierarchy"
                  ? "border-[#C5A059] text-[#C5A059]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              3D Hierarchy
            </button>
          </div>

          {/* TAB 1: INSPECTION CARD */}
          {activeTab === "inspect" && (
            <div className="space-y-4">
              {activeComponent ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded-full border border-[#C5A059]/30">
                      {activeComponent.category}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      {activeComponent.sourceStatus}
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-2xl text-white font-medium">
                    {activeComponent.name}
                  </h3>

                  <p className="text-xs text-[#D8D0C5]/80 font-light leading-relaxed">
                    {activeComponent.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60 font-medium">Function:</span>
                      <span className="text-white text-right max-w-[180px]">{activeComponent.function}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-medium">Verified Material:</span>
                      <span className="text-white text-right max-w-[180px]">{activeComponent.verifiedMaterial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 font-medium">Dimensions:</span>
                      <span className="text-mono text-[#C5A059]">{activeComponent.dimensions}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#D8D0C5]/80 font-mono">
                    Reference: {activeComponent.sourceReference}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-white/50 text-xs space-y-3">
                  <Box className="w-10 h-10 mx-auto stroke-[1.2] text-[#C5A059]" />
                  <p className="max-w-[200px] mx-auto font-light">
                    Click any 3D component in the WebGL viewer to inspect verified specs & structural details.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE PBR MATERIALS */}
          {activeTab === "materials" && (
            <div className="space-y-6 animate-fade-in text-xs">
              {/* Frame Alloy Finish */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] font-semibold text-[#C5A059] mb-2">
                  Aluminium Frame Alloy Finish
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {FRAME_FINISHES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onSelectFrameMaterial(f)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        frameMaterial.id === f.id
                          ? "border-[#C5A059] bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: f.color }} />
                        <span className="font-medium">{f.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400">VERIFIED</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wood Cabinet Finish */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] font-semibold text-[#C5A059] mb-2">
                  Wood Cabinetry & Shelving Finish
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {WOOD_FINISHES.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onSelectWoodMaterial(w)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        woodMaterial.id === w.id
                          ? "border-[#C5A059] bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: w.color }} />
                        <span className="font-medium">{w.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400">VERIFIED</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glass Door Finish */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] font-semibold text-[#C5A059] mb-2">
                  Glass Door Panel Finish
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GLASS_FINISHES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onSelectGlassMaterial(g)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        glassMaterial.id === g.id
                          ? "border-[#C5A059] bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: g.color }} />
                        <span className="font-medium">{g.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400">VERIFIED</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HIERARCHY TREE */}
          {activeTab === "hierarchy" && (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 text-xs font-mono">
              {Object.values(HAUSFLEX_COMPONENTS).map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => onSelectComponent(comp.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    selectedComponentId === comp.id
                      ? "bg-[#C5A059] text-[#242421] font-semibold"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="truncate">{comp.meshName}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <button
          onClick={() => setConsultationModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-[#F6F3EE] hover:bg-white text-[#242421] text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-xl mt-4"
        >
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>Save 3D Specification Spec</span>
        </button>
      </div>

      {/* CONSULTATION SPEC MODAL */}
      <AnimatePresence>
        {consultationModalOpen && (
          <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4">
            <div
              onClick={() => setConsultationModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#242421] text-white rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl z-10 space-y-6"
            >
              <button
                onClick={() => setConsultationModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
                  Verified 3D Configurator Output
                </span>
                <h3 className="font-serif-editorial text-3xl font-light">
                  HausFlex 3D Consultation Spec Card
                </h3>
              </div>

              <div className="bg-[#191917] rounded-2xl p-4 border border-white/10 font-mono text-xs text-[#D8D0C5] space-y-2">
                <div className="pb-2 border-b border-white/10 text-[#C5A059] font-bold">
                  HAUSBEDROOM 3D SPECIFICATION SUMMARY
                </div>
                <div>Product: HausFlex Modular Wardrobe System</div>
                <div>Aluminium Frame: {frameMaterial.name}</div>
                <div>Cabinet Finish: {woodMaterial.name}</div>
                <div>Glass Doors: {glassMaterial.name}</div>
                <div>Focus Component: {activeComponent?.name || "Full Assembly"}</div>
                <div>Status: VERIFIED MANUFACTURER ARCHITECTURE</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/6588157320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-[0.15em] font-semibold transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via Official WhatsApp</span>
                </a>
                <button
                  onClick={() => setConsultationModalOpen(false)}
                  className="py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-[0.15em]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

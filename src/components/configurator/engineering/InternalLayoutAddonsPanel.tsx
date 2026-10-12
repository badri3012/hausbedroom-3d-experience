"use client";

import React from "react";
import { ProductSystemType } from "@/hooks/useConfiguratorEngineering";
import { PoleState, FlexState, PoleDesignResult, FlexDesignResult, FlexProposal } from "@/lib/engineering/types";
import { Grid, Sparkles, Layers, Plus, Minus, Check } from "lucide-react";

interface InternalLayoutAddonsPanelProps {
  productSystem: ProductSystemType;
  poleState: PoleState;
  onUpdatePole: (updates: Partial<PoleState>) => void;
  poleDesign?: PoleDesignResult;
  flexState: FlexState;
  onUpdateFlex: (updates: Partial<FlexState>) => void;
  flexDesign?: FlexDesignResult;
  activeFlexProposal?: FlexProposal;
}

export function InternalLayoutAddonsPanel({
  productSystem,
  poleState,
  onUpdatePole,
  poleDesign,
  flexState,
  onUpdateFlex,
  flexDesign,
  activeFlexProposal,
}: InternalLayoutAddonsPanelProps) {
  const isPole = productSystem === "pole";

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* HAUSPOLE INTERNAL SYSTEM & ACCESSORIES                              */}
      {/* =================================================================== */}
      {isPole && poleDesign && (
        <>
          {/* 1. INTERNAL BAYS COMPUTATION CARD */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#242424] flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#A88C69]" />
                Internal Bay Allocation
              </span>
              <span className="text-[11px] font-mono text-[#77736D]">
                Internal W: {poleDesign.internalWidth}mm
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {poleDesign.internalLayout.bays.map((bay, idx) => {
                const isDrawerBay = idx === poleDesign.internalLayout.drawerBayIndex;
                return (
                  <div
                    key={`bay-pill-${idx}`}
                    className={`flex-1 min-w-[90px] p-2 rounded-lg border text-center ${
                      isDrawerBay
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-[#FAF8F5] border-[#E6E1D8] text-[#242424]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono block text-[#777]">
                      Bay {idx + 1}
                    </span>
                    <span className="text-[12px] font-mono font-bold block">
                      {bay.width} mm
                    </span>
                    <span className="text-[9px] font-medium text-[#888] block">
                      {isDrawerBay ? `${poleDesign.drawerCount} Drawers` : "Hanging / Shelf"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. POLE FINISH SELECTOR */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Structural 26mm Pole Finish
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "silver", label: "Silver", sub: "Standard ($0)" },
                { id: "champagne", label: "Champagne", sub: "+$30/ft" },
                { id: "black", label: "Black", sub: "+$30/ft" },
              ].map((p) => {
                const isSelected = (poleState.poleFinish || "silver") === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onUpdatePole({ poleFinish: p.id as any })}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-[#242424] text-white border-[#242424] shadow-sm"
                        : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8] hover:border-[#A88C69]"
                    }`}
                  >
                    <span className="text-[11px] font-semibold block">{p.label}</span>
                    <span
                      className={`text-[9px] font-mono ${
                        isSelected ? "text-[#C5A059]" : "text-[#77736D]"
                      }`}
                    >
                      {p.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. DRAWERS & ACCESSORIES COUNTERS */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-3">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Drawer & Interior Add-Ons
            </span>

            {/* Extra Drawers */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-medium text-[#242424] block">Extra Drawers</span>
                <span className="text-[10px] text-[#777] font-mono">+$80 each</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdatePole({
                      addonExtraDrawers: Math.max(0, (poleState.addonExtraDrawers || 0) - 1),
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center font-mono font-bold">
                  {poleState.addonExtraDrawers || 0}
                </span>
                <button
                  onClick={() =>
                    onUpdatePole({
                      addonExtraDrawers: (poleState.addonExtraDrawers || 0) + 1,
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Secret Drawer */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-medium text-[#242424] block">Secret Compartment Drawer</span>
                <span className="text-[10px] text-[#777] font-mono">+$100</span>
              </div>
              <input
                type="checkbox"
                checked={!!poleState.addonSecretDrawer}
                onChange={(e) =>
                  onUpdatePole({ addonSecretDrawer: e.target.checked ? 1 : 0 })
                }
                className="w-4 h-4 accent-[#242424] rounded"
              />
            </div>

            {/* Mirror Panel Upgrades */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-medium text-[#242424] block">Full Mirror Door Panels</span>
                <span className="text-[10px] text-[#777] font-mono">+$150 / panel</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdatePole({
                      mirrorQty: Math.max(0, (poleState.mirrorQty || 0) - 1),
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center font-mono font-bold">
                  {poleState.mirrorQty || 0}
                </span>
                <button
                  onClick={() =>
                    onUpdatePole({
                      mirrorQty: (poleState.mirrorQty || 0) + 1,
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Dismantle */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E6E1D8]">
              <div>
                <span className="font-medium text-[#242424] block">
                  Dismantle Existing Wardrobe
                </span>
                <span className="text-[10px] text-[#777] font-mono">$40/ft (min $200)</span>
              </div>
              <input
                type="checkbox"
                checked={!!poleState.dismantle}
                onChange={(e) => onUpdatePole({ dismantle: e.target.checked })}
                className="w-4 h-4 accent-[#242424] rounded"
              />
            </div>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* HAUSFLEX MODULAR PROPOSALS & WIRE BASKETS                           */}
      {/* =================================================================== */}
      {!isPole && flexDesign && activeFlexProposal && (
        <>
          {/* 1. PROPOSAL SELECTOR (A vs B) */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#242424] block">
                Modular Filling Proposals
              </span>
              <span className="text-[10px] font-mono text-[#777]">
                Budget: {flexDesign.moduleBudget}mm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Proposal A */}
              <button
                onClick={() => onUpdateFlex({ proposal: "A" })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  flexState.proposal === "A"
                    ? "bg-[#242424] text-white border-[#242424] shadow-sm"
                    : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8]"
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] font-bold">Proposal A</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      flexState.proposal === "A"
                        ? "bg-[#A88C69] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Under-Target
                  </span>
                </div>
                <span className="text-[11px] font-mono block">
                  Total: {flexDesign.proposalA?.combo.total || 0} mm
                </span>
                <span className="text-[10px] opacity-80 block">
                  {flexDesign.proposalA?.widths.length || 0} modular sections
                </span>
              </button>

              {/* Proposal B */}
              {flexDesign.proposalB ? (
                <button
                  onClick={() => onUpdateFlex({ proposal: "B" })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    flexState.proposal === "B"
                      ? "bg-[#242424] text-white border-[#242424] shadow-sm"
                      : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[11px] font-bold">Proposal B</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        flexState.proposal === "B"
                          ? "bg-[#A88C69] text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Closest Fit
                    </span>
                  </div>
                  <span className="text-[11px] font-mono block">
                    Total: {flexDesign.proposalB.combo.total} mm
                  </span>
                  <span className="text-[10px] opacity-80 block">
                    {flexDesign.proposalB.widths.length} modular sections
                  </span>
                </button>
              ) : (
                <div className="p-2.5 rounded-xl border border-dashed border-[#E6E1D8] text-center flex flex-col justify-center text-[10px] text-[#888]">
                  Exact fit reached in Proposal A
                </div>
              )}
            </div>
          </div>

          {/* 2. ACTIVE MODULAR BREAKDOWN */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Modular Sections Breakdown
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeFlexProposal.widths.map((w, idx) => (
                <div
                  key={`flex-mod-${idx}`}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1D8] text-center"
                >
                  <span className="text-[9px] font-mono uppercase block text-[#777]">
                    Sec {idx + 1}
                  </span>
                  <span className="text-[12px] font-mono font-bold block text-[#242424]">
                    {w} mm
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. WIRE BASKETS & ACCESSORIES */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-3">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Modular Wire Baskets & Options
            </span>

            {/* Wire Baskets */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-medium text-[#242424] block">Pullout Wire Baskets</span>
                <span className="text-[10px] text-[#777] font-mono">+$60 each</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateFlex({
                      flexWireBasketQty: Math.max(0, (flexState.flexWireBasketQty || 0) - 1),
                      wireBasketTouched: true,
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <span className="w-6 text-center font-mono font-bold">
                  {flexState.flexWireBasketQty || 0}
                </span>
                <button
                  onClick={() =>
                    onUpdateFlex({
                      flexWireBasketQty: (flexState.flexWireBasketQty || 0) + 1,
                      wireBasketTouched: true,
                    })
                  }
                  className="w-6 h-6 rounded bg-[#F5F3EF] hover:bg-[#EAE5DC] flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* LED Lighting */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-medium text-[#242424] block">Integrated LED System</span>
                <span className="text-[10px] text-[#777] font-mono">Profile LED + sensor</span>
              </div>
              <input
                type="checkbox"
                checked={!!flexState.flexLed}
                onChange={(e) => onUpdateFlex({ flexLed: e.target.checked })}
                className="w-4 h-4 accent-[#242424] rounded"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

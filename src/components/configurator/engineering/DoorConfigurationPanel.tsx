"use client";

import React from "react";
import { ProductSystemType } from "@/hooks/useConfiguratorEngineering";
import { PoleState, FlexState, PoleDesignResult, FlexDesignResult } from "@/lib/engineering/types";
import { ArrowLeftRight, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface DoorConfigurationPanelProps {
  productSystem: ProductSystemType;
  poleState: PoleState;
  onUpdatePole: (updates: Partial<PoleState>) => void;
  poleDesign?: PoleDesignResult;
  flexState: FlexState;
  onUpdateFlex: (updates: Partial<FlexState>) => void;
  flexDesign?: FlexDesignResult;
}

export function DoorConfigurationPanel({
  productSystem,
  poleState,
  onUpdatePole,
  poleDesign,
  flexState,
  onUpdateFlex,
  flexDesign,
}: DoorConfigurationPanelProps) {
  const isPole = productSystem === "pole";
  const doorRequired = isPole ? poleState.doorRequired : flexState.doorRequired;
  const doorHeightUpgrade = isPole ? poleState.doorHeightUpgrade : flexState.doorHeightUpgrade;
  const internalHeightUpgrade = isPole
    ? poleState.internalHeightUpgrade
    : flexState.internalHeightUpgrade;

  const resolvedDoor = isPole ? poleDesign?.door : flexDesign?.door;
  const doorOpening = isPole ? poleDesign?.doorOpening : flexDesign?.doorOpening;
  const doorHeight = isPole ? (poleDesign?.doorHeight || 2400) : (flexDesign?.doorHeight || 2400);
  const isInfeasible = isPole ? !!poleDesign?.door?.infeasible : !!flexDesign?.door?.forced;
  const pelmetHeight = isPole
    ? poleDesign?.pelmetHeight
    : Math.max(0, (flexState.ceiling || 2600) - 2400);

  return (
    <div className="space-y-4">
      {/* 1. DOOR REQUIRED TOGGLE */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold text-[#242424] block">
            Wardrobe Doors
          </span>
          <span className="text-[10px] text-[#77736D]">
            {doorRequired ? "Full enclosed door system" : "Open walk-in wardrobe concept"}
          </span>
        </div>
        <button
          onClick={() => {
            if (isPole) onUpdatePole({ doorRequired: !doorRequired });
            else onUpdateFlex({ doorRequired: !doorRequired });
          }}
          className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
            doorRequired
              ? "bg-[#242424] text-white shadow-sm"
              : "bg-[#F5F3EF] text-[#77736D] border border-[#E6E1D8]"
          }`}
        >
          {doorRequired ? "Doors Included" : "No Doors (Open)"}
        </button>
      </div>

      {doorRequired && (
        <>
          {/* 2. DOOR TYPE PREFERENCE */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Door Type Preference
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "auto", label: "Auto (Recommended)" },
                { id: "sliding", label: "Sliding Track" },
                { id: "bifold", label: "Bifold Folding" },
                { id: "swing", label: "Swing Hinged" },
              ].map((opt) => {
                const currentPref = isPole
                  ? poleState.doorTypePref
                  : flexState.flexDoorTypePref;
                const isSelected = currentPref === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (isPole)
                        onUpdatePole({
                          doorTypePref: opt.id as any,
                          doorForcedSwing: opt.id === "swing",
                        });
                      else
                        onUpdateFlex({
                          flexDoorTypePref: opt.id as any,
                        });
                    }}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-medium border text-left transition-all ${
                      isSelected
                        ? "bg-[#A88C69] text-white border-[#A88C69] shadow-sm"
                        : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8] hover:border-[#A88C69]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. MATERIAL PREFERENCE (POLE SYSTEM) */}
          {isPole && (
            <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
              <span className="text-[12px] font-semibold text-[#242424] block">
                Door Profile Material
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onUpdatePole({ doorType: "sliding", doorAutoMaterial: false })
                  }
                  className={`p-2 rounded-lg text-[11px] border font-medium transition-all ${
                    poleState.doorType === "sliding"
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8]"
                  }`}
                >
                  Aluminium Framing
                </button>
                <button
                  onClick={() =>
                    onUpdatePole({ doorType: "wooden", doorAutoMaterial: false })
                  }
                  className={`p-2 rounded-lg text-[11px] border font-medium transition-all ${
                    poleState.doorType === "wooden"
                      ? "bg-[#242424] text-white border-[#242424]"
                      : "bg-[#FAF8F5] text-[#242424] border-[#E6E1D8]"
                  }`}
                >
                  Full Wooden Flush
                </button>
              </div>
            </div>
          )}

          {/* 4. HEIGHT UPGRADE OPTIONS */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2.5">
            <span className="text-[12px] font-semibold text-[#242424] block">
              Height Upgrades
            </span>
            <label className="flex items-center justify-between text-[11px] text-[#333] cursor-pointer">
              <span>Upgrade Door Height (to 2800mm max)</span>
              <input
                type="checkbox"
                checked={doorHeightUpgrade}
                onChange={(e) => {
                  if (isPole) onUpdatePole({ doorHeightUpgrade: e.target.checked });
                  else onUpdateFlex({ doorHeightUpgrade: e.target.checked });
                }}
                className="w-4 h-4 accent-[#242424] rounded"
              />
            </label>
            <label className="flex items-center justify-between text-[11px] text-[#333] cursor-pointer">
              <span>Upgrade Internal Height (2080 → 2400mm)</span>
              <input
                type="checkbox"
                checked={internalHeightUpgrade}
                onChange={(e) => {
                  if (isPole) onUpdatePole({ internalHeightUpgrade: e.target.checked });
                  else onUpdateFlex({ internalHeightUpgrade: e.target.checked });
                }}
                className="w-4 h-4 accent-[#242424] rounded"
              />
            </label>
          </div>

          {/* 5. LIVE ENGINEERING CALCULATION STATUS CARD */}
          {resolvedDoor && (
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E6E1D8] space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#242424]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Computed Door Resolution</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono">
                <div>
                  <span className="text-[#777]">Opening: </span>
                  <strong>{doorOpening} mm</strong>
                </div>
                <div>
                  <span className="text-[#777]">Door Type: </span>
                  <strong className="capitalize">{resolvedDoor.type}</strong>
                </div>
                <div>
                  <span className="text-[#777]">Panels: </span>
                  <strong>{resolvedDoor.panelCount} panels</strong>
                </div>
                <div>
                  <span className="text-[#777]">Panel Width: </span>
                  <strong>{resolvedDoor.panelWidth} mm</strong>
                </div>
                <div>
                  <span className="text-[#777]">Door Height: </span>
                  <strong>{doorHeight} mm</strong>
                </div>
                <div>
                  <span className="text-[#777]">Pelmet: </span>
                  <strong>{pelmetHeight} mm</strong>
                </div>
              </div>

              {/* Warning / fallback badge */}
              {isInfeasible && (
                <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Warning: Opening of {doorOpening}mm is narrow for requested sliding doors.
                    Automated fallback is recommended.
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

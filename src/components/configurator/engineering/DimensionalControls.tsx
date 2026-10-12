"use client";

import React from "react";
import { ProductSystemType, WardrobeShapeType } from "@/hooks/useConfiguratorEngineering";
import { PoleState, FlexState, SideCondition } from "@/lib/engineering/types";
import { Ruler, Maximize2, Columns } from "lucide-react";

interface DimensionalControlsProps {
  productSystem: ProductSystemType;
  shape: WardrobeShapeType;
  poleState: PoleState;
  onUpdatePole: (updates: Partial<PoleState>) => void;
  flexState: FlexState;
  onUpdateFlex: (updates: Partial<FlexState>) => void;
}

export function DimensionalControls({
  productSystem,
  shape,
  poleState,
  onUpdatePole,
  flexState,
  onUpdateFlex,
}: DimensionalControlsProps) {
  const isPole = productSystem === "pole";
  const length = isPole ? poleState.length : flexState.length;
  const ceiling = isPole ? poleState.ceiling : flexState.ceiling;
  const depth = (isPole ? poleState.depth : flexState.depth) || 600;

  const left = isPole ? poleState.left : flexState.left;
  const right = isPole ? poleState.right : flexState.right;

  const handleLengthChange = (val: number) => {
    if (isPole) onUpdatePole({ length: val });
    else onUpdateFlex({ length: val });
  };

  const handleCeilingChange = (val: number) => {
    if (isPole) onUpdatePole({ ceiling: val });
    else onUpdateFlex({ ceiling: val });
  };

  const handleDepthChange = (val: number) => {
    if (isPole) onUpdatePole({ depth: val });
    else onUpdateFlex({ depth: val });
  };

  const handleSideChange = (side: "left" | "right", type: "none" | "wall" | "beam", beamWidth: number = 130) => {
    const updated: SideCondition = { type, beamWidth };
    if (isPole) onUpdatePole({ [side]: updated });
    else onUpdateFlex({ [side]: updated });
  };

  return (
    <div className="space-y-4">
      {/* 1. LENGTH CONTROL (STRAIGHT) OR LEGS (L-SHAPE) */}
      {shape === "straight" ? (
        <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#242424] flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#A88C69]" />
              Wardrobe Length
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={length}
                step={50}
                min={1200}
                max={4500}
                onChange={(e) => handleLengthChange(Number(e.target.value))}
                className="w-16 px-1.5 py-0.5 text-right font-mono text-[12px] font-bold border border-[#E6E1D8] rounded bg-[#FAF8F5]"
              />
              <span className="text-[11px] font-mono text-[#77736D]">mm</span>
              <span className="text-[11px] font-mono font-medium text-[#A88C69] ml-1">
                ({(length / 304.8).toFixed(1)} ft)
              </span>
            </div>
          </div>
          <input
            type="range"
            min={1200}
            max={4200}
            step={50}
            value={length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="w-full accent-[#242424] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#77736D]">
            <span>1200mm (3.9ft)</span>
            <span>2700mm (8.9ft)</span>
            <span>4200mm (13.8ft)</span>
          </div>
        </div>
      ) : (
        /* L-SHAPED LEGS */
        <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#242424] flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-[#A88C69]" />
              L-Shape Dimensions
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono">
              Corner: 600mm deduction
            </span>
          </div>

          {/* Leg A */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#555]">Leg A (Main Wall):</span>
              <span className="font-mono font-bold">
                {isPole ? poleState.ls.legALength : flexState.ls.legA.length} mm
              </span>
            </div>
            <input
              type="range"
              min={1200}
              max={3000}
              step={50}
              value={isPole ? poleState.ls.legALength : flexState.ls.legA.length}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (isPole)
                  onUpdatePole({ ls: { ...poleState.ls, legALength: val } });
                else
                  onUpdateFlex({
                    ls: {
                      ...flexState.ls,
                      legA: { ...flexState.ls.legA, length: val },
                    },
                  });
              }}
              className="w-full accent-[#242424] cursor-pointer"
            />
          </div>

          {/* Leg B */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#555]">Leg B (Return Wall):</span>
              <span className="font-mono font-bold">
                {isPole ? poleState.ls.legBLength : flexState.ls.legB.length} mm
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={2500}
              step={50}
              value={isPole ? poleState.ls.legBLength : flexState.ls.legB.length}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (isPole)
                  onUpdatePole({ ls: { ...poleState.ls, legBLength: val } });
                else
                  onUpdateFlex({
                    ls: {
                      ...flexState.ls,
                      legB: { ...flexState.ls.legB, length: val },
                    },
                  });
              }}
              className="w-full accent-[#242424] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 2. CEILING HEIGHT CONTROL */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#242424] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-[#A88C69]" />
            Ceiling Height
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={ceiling}
              step={50}
              min={2200}
              max={3600}
              onChange={(e) => handleCeilingChange(Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-right font-mono text-[12px] font-bold border border-[#E6E1D8] rounded bg-[#FAF8F5]"
            />
            <span className="text-[11px] font-mono text-[#77736D]">mm</span>
          </div>
        </div>
        <input
          type="range"
          min={2200}
          max={3500}
          step={25}
          value={ceiling}
          onChange={(e) => handleCeilingChange(Number(e.target.value))}
          className="w-full accent-[#242424] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-[#77736D]">
          <span>Standard: 2400-2600mm</span>
          {ceiling > 2650 && ceiling <= 3000 && (
            <span className="text-amber-700 font-semibold">Tier: +$30/ft</span>
          )}
          {ceiling > 3000 && (
            <span className="text-amber-800 font-semibold">Tier: +$100/ft</span>
          )}
          {!isPole && ceiling > 3300 && (
            <span className="text-red-600 font-semibold">Max system height 3300mm</span>
          )}
        </div>
      </div>

      {/* 3. DEPTH TOGGLE */}
      <div className="bg-white p-3 rounded-xl border border-[#E6E1D8] flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold text-[#242424] block">Cabinet Depth</span>
          <span className="text-[10px] text-[#77736D]">Hanging clearance depth</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleDepthChange(600)}
            className={`px-3 py-1 rounded-lg text-[12px] font-mono transition-all ${
              depth === 600
                ? "bg-[#242424] text-white font-bold"
                : "bg-[#F5F3EF] text-[#77736D] hover:bg-[#EAE5DC]"
            }`}
          >
            600 mm (Std)
          </button>
          <button
            onClick={() => handleDepthChange(500)}
            className={`px-3 py-1 rounded-lg text-[12px] font-mono transition-all ${
              depth === 500
                ? "bg-[#242424] text-white font-bold"
                : "bg-[#F5F3EF] text-[#77736D] hover:bg-[#EAE5DC]"
            }`}
          >
            500 mm
          </button>
        </div>
      </div>

      {/* 4. SIDE CONDITIONS (LEFT & RIGHT) */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D8] space-y-3">
        <span className="text-[12px] font-semibold text-[#242424] block">
          Side Conditions & Beams
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Left Side */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#555] block">Left Side:</span>
            <select
              value={left.type}
              onChange={(e) =>
                handleSideChange(
                  "left",
                  e.target.value as "none" | "wall" | "beam",
                  left.beamWidth || 130
                )
              }
              className="w-full text-[11px] p-1.5 border border-[#E6E1D8] rounded bg-[#FAF8F5]"
            >
              <option value="none">Open (60mm Partition)</option>
              <option value="wall">Wall (50mm Infill)</option>
              <option value="beam">Beam (50mm + Cutout)</option>
            </select>
            {left.type === "beam" && (
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-[#777]">Beam W:</span>
                <input
                  type="number"
                  value={left.beamWidth || 130}
                  onChange={(e) => handleSideChange("left", "beam", Number(e.target.value))}
                  className="w-12 px-1 py-0.5 border rounded text-right font-mono"
                />
                <span className="text-[#777]">mm</span>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-[#555] block">Right Side:</span>
            <select
              value={right.type}
              onChange={(e) =>
                handleSideChange(
                  "right",
                  e.target.value as "none" | "wall" | "beam",
                  right.beamWidth || 130
                )
              }
              className="w-full text-[11px] p-1.5 border border-[#E6E1D8] rounded bg-[#FAF8F5]"
            >
              <option value="none">Open (60mm Partition)</option>
              <option value="wall">Wall (50mm Infill)</option>
              <option value="beam">Beam (50mm + Cutout)</option>
            </select>
            {right.type === "beam" && (
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-[#777]">Beam W:</span>
                <input
                  type="number"
                  value={right.beamWidth || 130}
                  onChange={(e) => handleSideChange("right", "beam", Number(e.target.value))}
                  className="w-12 px-1 py-0.5 border rounded text-right font-mono"
                />
                <span className="text-[#777]">mm</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

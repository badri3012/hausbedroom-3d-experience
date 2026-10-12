"use client";

import React from "react";
import { ProductSystemType, WardrobeShapeType } from "@/hooks/useConfiguratorEngineering";
import { Columns3, Grid3X3, CornerDownRight, Minus } from "lucide-react";

interface SystemShapeSelectorProps {
  productSystem: ProductSystemType;
  onSelectSystem: (system: ProductSystemType) => void;
  shape: WardrobeShapeType;
  onSelectShape: (shape: WardrobeShapeType) => void;
}

export function SystemShapeSelector({
  productSystem,
  onSelectSystem,
  shape,
  onSelectShape,
}: SystemShapeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* 1. PRODUCT SYSTEM SELECTION */}
      <div>
        <label className="text-[11px] font-mono tracking-wider text-[#77736D] uppercase block mb-1.5">
          Wardrobe Engineering System
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* HausPole System */}
          <button
            onClick={() => onSelectSystem("pole")}
            className={`p-3 rounded-xl border text-left transition-all ${
              productSystem === "pole"
                ? "bg-[#242424] text-white border-[#242424] shadow-sm"
                : "bg-white text-[#242424] border-[#E6E1D8] hover:border-[#C5A059]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Columns3
                className={`w-4 h-4 ${
                  productSystem === "pole" ? "text-[#C5A059]" : "text-[#77736D]"
                }`}
              />
              <span className="text-[13px] font-semibold">HausPole</span>
            </div>
            <p
              className={`text-[11px] leading-snug ${
                productSystem === "pole" ? "text-[#D0CBC2]" : "text-[#77736D]"
              }`}
            >
              26mm structural pole system, custom bays & standard drawers.
            </p>
          </button>

          {/* HausFlex System */}
          <button
            onClick={() => onSelectSystem("flex")}
            className={`p-3 rounded-xl border text-left transition-all ${
              productSystem === "flex"
                ? "bg-[#242424] text-white border-[#242424] shadow-sm"
                : "bg-white text-[#242424] border-[#E6E1D8] hover:border-[#C5A059]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Grid3X3
                className={`w-4 h-4 ${
                  productSystem === "flex" ? "text-[#C5A059]" : "text-[#77736D]"
                }`}
              />
              <span className="text-[13px] font-semibold">HausFlex</span>
            </div>
            <p
              className={`text-[11px] leading-snug ${
                productSystem === "flex" ? "text-[#D0CBC2]" : "text-[#77736D]"
              }`}
            >
              Modular steel uprights, 550/609/762mm sections & wire baskets.
            </p>
          </button>
        </div>
      </div>

      {/* 2. SHAPE SELECTION */}
      <div>
        <label className="text-[11px] font-mono tracking-wider text-[#77736D] uppercase block mb-1.5">
          Configuration Layout
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Straight Wardrobe */}
          <button
            onClick={() => onSelectShape("straight")}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              shape === "straight"
                ? "bg-[#A88C69] text-white border-[#A88C69] font-medium shadow-sm"
                : "bg-white text-[#242424] border-[#E6E1D8] hover:border-[#A88C69]"
            }`}
          >
            <Minus className="w-4 h-4" />
            <span className="text-[12px]">Straight Layout</span>
          </button>

          {/* L-Shaped Corner Wardrobe */}
          <button
            onClick={() => onSelectShape("lshape")}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
              shape === "lshape"
                ? "bg-[#A88C69] text-white border-[#A88C69] font-medium shadow-sm"
                : "bg-white text-[#242424] border-[#E6E1D8] hover:border-[#A88C69]"
            }`}
          >
            <CornerDownRight className="w-4 h-4" />
            <span className="text-[12px]">L-Shaped Corner</span>
          </button>
        </div>
      </div>
    </div>
  );
}

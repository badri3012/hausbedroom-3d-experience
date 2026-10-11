"use client";

import React from "react";
import { Html, Line } from "@react-three/drei";
import { WardrobeDimensions } from "@/types/wardrobe";

interface DimensionOverlayProps {
  dimensions: WardrobeDimensions;
  visible: boolean;
}

export function DimensionOverlay3D({ dimensions, visible }: DimensionOverlayProps) {
  if (!visible) return null;

  const w = dimensions.width / 1000;  // in meters, e.g. 3.0
  const h = dimensions.height / 1000; // in meters, e.g. 2.4
  const d = dimensions.depth / 1000;  // in meters, e.g. 0.6

  const offsetW = 0.28;
  const offsetH = 0.25;
  const offsetD = 0.25;

  return (
    <group>
      {/* ========================================================= */}
      {/* 1. WIDTH DIMENSION (Horizontal along Top Front)           */}
      {/* ========================================================= */}
      <group position={[0, h + offsetW, d / 2 + 0.1]}>
        <Line
          points={[
            [-w / 2, 0, 0],
            [w / 2, 0, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
          dashed
          dashSize={0.06}
          gapSize={0.03}
        />
        {/* End ticks */}
        <Line
          points={[
            [-w / 2, -0.06, 0],
            [-w / 2, 0.06, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        <Line
          points={[
            [w / 2, -0.06, 0],
            [w / 2, 0.06, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        {/* Dimension Badge */}
        <Html position={[0, 0.08, 0]} center>
          <div className="bg-[#1C1C19]/90 text-[#F6F3EE] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-[#A88C69]/40 shadow-lg pointer-events-none whitespace-nowrap">
            Width: <span className="text-[#C5A059] font-bold">{dimensions.width} mm</span>
          </div>
        </Html>
      </group>

      {/* ========================================================= */}
      {/* 2. HEIGHT DIMENSION (Vertical along Right Side)           */}
      {/* ========================================================= */}
      <group position={[w / 2 + offsetH, h / 2, d / 2 + 0.1]}>
        <Line
          points={[
            [0, -h / 2, 0],
            [0, h / 2, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
          dashed
          dashSize={0.06}
          gapSize={0.03}
        />
        {/* End ticks */}
        <Line
          points={[
            [-0.06, -h / 2, 0],
            [0.06, -h / 2, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        <Line
          points={[
            [-0.06, h / 2, 0],
            [0.06, h / 2, 0],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        {/* Dimension Badge */}
        <Html position={[0.12, 0, 0]} center>
          <div className="bg-[#1C1C19]/90 text-[#F6F3EE] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-[#A88C69]/40 shadow-lg pointer-events-none whitespace-nowrap">
            Height: <span className="text-[#C5A059] font-bold">{dimensions.height} mm</span>
          </div>
        </Html>
      </group>

      {/* ========================================================= */}
      {/* 3. DEPTH DIMENSION (Along Floor Right Side)               */}
      {/* ========================================================= */}
      <group position={[w / 2 + 0.12, 0.05, 0]}>
        <Line
          points={[
            [0, 0, -d / 2],
            [0, 0, d / 2],
          ]}
          color="#A88C69"
          lineWidth={2}
          dashed
          dashSize={0.06}
          gapSize={0.03}
        />
        {/* End ticks */}
        <Line
          points={[
            [0, 0, -d / 2],
            [0.06, 0, -d / 2],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        <Line
          points={[
            [0, 0, d / 2],
            [0.06, 0, d / 2],
          ]}
          color="#A88C69"
          lineWidth={2}
        />
        {/* Dimension Badge */}
        <Html position={[0.15, 0, 0]} center>
          <div className="bg-[#1C1C19]/90 text-[#F6F3EE] backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-[#A88C69]/40 shadow-lg pointer-events-none whitespace-nowrap">
            Depth: <span className="text-[#C5A059] font-bold">{dimensions.depth} mm</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

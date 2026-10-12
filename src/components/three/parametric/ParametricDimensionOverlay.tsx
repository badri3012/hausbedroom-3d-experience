"use client";

import React from "react";
import { Html } from "@react-three/drei";

interface ParametricDimensionOverlayProps {
  totalWidthMm: number;
  ceilingMm: number;
  depthMm?: number;
  doorOpeningMm?: number;
  pelmetMm?: number;
  bays?: { width: number; xCenter: number }[];
  visible: boolean;
}

export function ParametricDimensionOverlay({
  totalWidthMm,
  ceilingMm,
  depthMm = 600,
  doorOpeningMm,
  pelmetMm,
  bays,
  visible,
}: ParametricDimensionOverlayProps) {
  if (!visible) return null;

  const w = totalWidthMm / 1000;
  const h = ceilingMm / 1000;
  const d = depthMm / 1000;

  return (
    <group position={[0, 0, d / 2 + 0.12]}>
      {/* 1. Overall Width Dimension Line & Badge */}
      <group position={[0, -0.08, 0]}>
        {/* Horizontal Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[w, 0.003, 0.003]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
        {/* Left Tick */}
        <mesh position={[-w / 2, 0.02, 0]}>
          <boxGeometry args={[0.003, 0.04, 0.003]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
        {/* Right Tick */}
        <mesh position={[w / 2, 0.02, 0]}>
          <boxGeometry args={[0.003, 0.04, 0.003]} />
          <meshBasicMaterial color="#3B82F6" />
        </mesh>
        {/* Text Badge */}
        <Html position={[0, -0.06, 0]} center distanceFactor={8}>
          <div className="bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-xs font-mono font-semibold shadow-md whitespace-nowrap">
            Width: {totalWidthMm} mm ({(totalWidthMm / 304.8).toFixed(1)} ft)
          </div>
        </Html>
      </group>

      {/* 2. Ceiling Height Dimension Line & Badge */}
      <group position={[-w / 2 - 0.10, h / 2, 0]}>
        {/* Vertical Line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.003, h, 0.003]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        {/* Top Tick */}
        <mesh position={[0.02, h / 2, 0]}>
          <boxGeometry args={[0.04, 0.003, 0.003]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        {/* Bottom Tick */}
        <mesh position={[0.02, -h / 2, 0]}>
          <boxGeometry args={[0.04, 0.003, 0.003]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        {/* Height Badge */}
        <Html position={[-0.08, 0, 0]} center distanceFactor={8}>
          <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-xs font-mono font-semibold shadow-md whitespace-nowrap">
            Ceiling: {ceilingMm} mm
          </div>
        </Html>
      </group>

      {/* 3. Pelmet Dimension if exists */}
      {pelmetMm && pelmetMm > 20 && (
        <group position={[w / 2 + 0.10, h - (pelmetMm / 2000), 0]}>
          <Html position={[0.06, 0, 0]} center distanceFactor={8}>
            <div className="bg-amber-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono font-semibold shadow-md whitespace-nowrap">
              Pelmet: {pelmetMm} mm
            </div>
          </Html>
        </group>
      )}

      {/* 4. Internal Bays Breakdown Badges */}
      {bays &&
        bays.map((bay, i) => (
          <group key={`bay-dim-${i}`} position={[bay.xCenter / 1000, 0.22, 0]}>
            <Html center distanceFactor={9}>
              <div className="bg-slate-900/80 backdrop-blur-sm text-slate-200 border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                Bay {i + 1}: {bay.width} mm
              </div>
            </Html>
          </group>
        ))}
    </group>
  );
}

"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { FlexDesignResult, FlexState } from "@/lib/engineering/types";
import { ParametricDoors } from "./ParametricDoors";
import { GarmentHanger, FoldedTowels, RolledTowel, StorageBox } from "../GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface ParametricFlexWardrobeProps {
  flexState: FlexState;
  flexDesign: FlexDesignResult;
  interactionState: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function ParametricFlexWardrobe({
  flexState,
  flexDesign,
  interactionState,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: ParametricFlexWardrobeProps) {
  // Dimensions in meters
  const totalWidth = flexState.length / 1000;
  const ceiling = Math.min(3.30, flexState.ceiling / 1000);
  const depth = (flexState.depth || 600) / 1000;
  const internalWidth = flexDesign.internalWidth / 1000;
  const doorOpening = flexDesign.doorOpening / 1000;

  // Active Proposal (A or B)
  const activeProposal =
    flexState.proposal === "B" && flexDesign.proposalB
      ? flexDesign.proposalB
      : flexDesign.proposalA;

  if (!activeProposal) return null;

  const sectionWidths = activeProposal.widths; // e.g. [762, 762, 609, 609, 550] in mm
  const totalModuleWidth = activeProposal.combo.total / 1000;

  // PBR Metal Structural Finish (Anodized Architectural Aluminum / Steel)
  const pbrSteelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#2C2D30",
      roughness: 0.38,
      metalness: 0.88,
      envMapIntensity: 1.1,
    });
  }, []);

  const pbrChromeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E0E3E8",
      roughness: 0.20,
      metalness: 0.95,
      envMapIntensity: 1.2,
    });
  }, []);

  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.85,
    });
  }, [woodMaterial, woodTexture]);

  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E6E2DB",
      roughness: 0.92,
    });
  }, []);

  // Side element deductions
  const leftW = (flexDesign.sideL?.internalW || 60) / 1000;
  const rightW = (flexDesign.sideR?.internalW || 60) / 1000;
  const internalStartX = -totalWidth / 2 + leftW;
  const internalEndX = totalWidth / 2 - rightW;
  const internalCenterX = (internalStartX + internalEndX) / 2;

  // Post & panel profiles
  const uprightPostW = 0.038; // 38mm slotted upright
  const uprightPostD = 0.038;
  const shelfThickness = 0.022;
  const systemHeight = Math.min(2.70, ceiling - 0.06);

  // Remaining clearance gap (centered)
  const remainingGap = Math.max(0, internalWidth - totalModuleWidth);
  const modulesStartX = internalStartX + remainingGap / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* ================================================================= */}
      {/* 1. OUTER CARCASS & SIDE SUPPORTS                                  */}
      {/* ================================================================= */}
      {/* Left Infill / Partition */}
      <mesh position={[-totalWidth / 2 + leftW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[leftW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Right Infill / Partition */}
      <mesh position={[totalWidth / 2 - rightW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[rightW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Rear Structural Wall */}
      <mesh position={[internalCenterX, ceiling / 2, -depth / 2 + 0.008]} receiveShadow>
        <boxGeometry args={[internalWidth, ceiling, 0.016]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>

      {/* Floor Runner Plinth */}
      <mesh position={[internalCenterX, 0.025, 0]} receiveShadow>
        <boxGeometry args={[internalWidth, 0.05, depth - 0.04]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Top Header Fascia */}
      <mesh position={[internalCenterX, systemHeight + 0.015, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[internalWidth, 0.03, depth - 0.06]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. MODULAR SECTIONS (550 / 609 / 762 mm)                          */}
      {/* ================================================================= */}
      {(() => {
        let currentX = modulesStartX;
        return sectionWidths.map((secWidthMm, idx) => {
          const secW = secWidthMm / 1000;
          const secStartX = currentX;
          const secCenterX = currentX + secW / 2;
          const secEndX = currentX + secW;
          currentX = secEndX;

          // Wire basket allocation in this section
          const basketCount = activeProposal.basketCounts?.[idx] || 0;

          return (
            <group key={`flex-section-${idx}`}>
              {/* Slotted Metal Upright at Section Left Border */}
              <mesh position={[secStartX, systemHeight / 2 + 0.05, depth / 2 - 0.06]} castShadow>
                <boxGeometry args={[uprightPostW, systemHeight, uprightPostD]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
              {/* Slotted Slots Graphic Indent */}
              <mesh position={[secStartX, systemHeight / 2 + 0.05, depth / 2 - 0.039]}>
                <boxGeometry args={[0.012, systemHeight * 0.95, 0.002]} />
                <meshBasicMaterial color="#151515" />
              </mesh>

              {/* Rear Wall Bracket Upright */}
              <mesh position={[secStartX, systemHeight / 2 + 0.05, -depth / 2 + 0.03]} castShadow>
                <boxGeometry args={[uprightPostW, systemHeight, 0.024]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>

              {/* Final right upright on last section */}
              {idx === sectionWidths.length - 1 && (
                <mesh position={[secEndX, systemHeight / 2 + 0.05, depth / 2 - 0.06]} castShadow>
                  <boxGeometry args={[uprightPostW, systemHeight, uprightPostD]} />
                  <primitive object={pbrSteelMat} attach="material" />
                </mesh>
              )}

              {/* Top Modular Shelf */}
              <group position={[secCenterX, systemHeight - 0.35, -0.02]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[secW - 0.015, shelfThickness, depth - 0.08]} />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>
                {/* Steel Support Bracket Arms */}
                <mesh position={[-secW / 2 + 0.02, -0.04, 0]} castShadow>
                  <boxGeometry args={[0.015, 0.08, depth - 0.12]} />
                  <primitive object={pbrSteelMat} attach="material" />
                </mesh>
                <mesh position={[secW / 2 - 0.02, -0.04, 0]} castShadow>
                  <boxGeometry args={[0.015, 0.08, depth - 0.12]} />
                  <primitive object={pbrSteelMat} attach="material" />
                </mesh>
              </group>

              {/* Mid Modular Shelf */}
              <group position={[secCenterX, systemHeight / 2 - 0.05, -0.02]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[secW - 0.015, shelfThickness, depth - 0.08]} />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>
              </group>

              {/* Upper Hanging Rail */}
              <group position={[secCenterX, systemHeight - 0.45, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.012, 0.012, secW - 0.03, 16]} />
                  <primitive object={pbrChromeMat} attach="material" />
                </mesh>
                {/* Clothes */}
                <GarmentHanger
                  type="suit"
                  color="#26282B"
                  position={[-secW * 0.22, -0.02, 0]}
                />
                <GarmentHanger
                  type="shirt"
                  color="#FFFFFF"
                  position={[0, -0.02, 0]}
                />
                {secWidthMm >= 609 && (
                  <GarmentHanger
                    type="dress"
                    color="#6B3A44"
                    position={[secW * 0.22, -0.02, 0]}
                  />
                )}
              </group>

              {/* Lower Section: Wire Baskets or Lower Hanging */}
              {basketCount > 0 ? (
                // WIRE BASKETS STACK
                <group position={[secCenterX, 0.08, 0]}>
                  {Array.from({ length: Math.min(4, basketCount) }).map((_, bIdx) => {
                    const bY = bIdx * 0.22 + 0.10;
                    const isOpen = interactionState.drawersOpen;
                    return (
                      <WireBasketModule
                        key={`basket-${idx}-${bIdx}`}
                        width={secW - 0.05}
                        depth={depth - 0.12}
                        y={bY}
                        isOpen={isOpen}
                        pbrChromeMat={pbrChromeMat}
                        pbrSteelMat={pbrSteelMat}
                      />
                    );
                  })}
                </group>
              ) : (
                // LOWER HANGING OR ACCENTS
                <group position={[secCenterX, 0.08, 0]}>
                  {idx % 2 === 0 ? (
                    <group position={[0, systemHeight / 2 - 0.20, 0]}>
                      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.012, 0.012, secW - 0.03, 16]} />
                        <primitive object={pbrChromeMat} attach="material" />
                      </mesh>
                      <GarmentHanger
                        type="shirt"
                        color="#334455"
                        position={[-secW * 0.18, -0.02, 0]}
                      />
                      <GarmentHanger
                        type="coat"
                        color="#4B3A2F"
                        position={[secW * 0.18, -0.02, 0]}
                      />
                    </group>
                  ) : (
                    <group position={[0, 0.12, 0]}>
                      <StorageBox
                        position={[0, 0, 0]}
                        width={secW - 0.08}
                        height={0.22}
                        depth={depth - 0.16}
                        color="#44464A"
                      />
                    </group>
                  )}
                </group>
              )}
            </group>
          );
        });
      })()}

      {/* ================================================================= */}
      {/* 3. PARAMETRIC DOORS                                               */}
      {/* ================================================================= */}
      {flexState.doorRequired && (
        <ParametricDoors
          openingWidth={doorOpening}
          openingHeight={Math.min(2.40, ceiling)}
          ceilingHeight={ceiling}
          doorType={
            flexDesign.door.type === "sliding"
              ? "sliding"
              : flexDesign.door.type === "none" || flexDesign.door.type === "infeasible"
              ? "none"
              : (flexDesign.door.material === "wooden" ? "wooden" : "aluminum")
          }
          doorSubtype={
            flexDesign.door.type === "sliding"
              ? "sliding"
              : flexDesign.door.type === "bifold"
              ? "bifold"
              : "swing"
          }
          panelCount={flexDesign.door.panelCount}
          panelWidth={flexDesign.door.panelWidth / 1000}
          pelmetHeight={Math.max(0, ceiling - 2.40)}
          isOpen={
            interactionState.leftDoorOpen ||
            interactionState.rightDoorOpen ||
            interactionState.bothDoorsOpen
          }
          onToggle={() => {
            const next = !interactionState.bothDoorsOpen;
            onUpdateState({
              bothDoorsOpen: next,
              leftDoorOpen: next,
              rightDoorOpen: next,
            });
          }}
          frameMaterial={frameMaterial}
          doorPanelMaterial={doorPanelMaterial}
          woodMaterial={woodMaterial}
          woodTexture={woodTexture}
          depthOffset={depth / 2 + 0.015}
        />
      )}
    </group>
  );
}

// 3D Pullout Metal Wire Mesh Basket with Undermount Slide Runners
function WireBasketModule({
  width,
  depth,
  y,
  isOpen,
  pbrChromeMat,
  pbrSteelMat,
}: {
  width: number;
  depth: number;
  y: number;
  isOpen: boolean;
  pbrChromeMat: THREE.Material;
  pbrSteelMat: THREE.Material;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const slideZ = isOpen ? 0.32 : 0;

  return (
    <group ref={groupRef} position={[0, y, slideZ]}>
      {/* Side Slide Mounting Rails */}
      <mesh position={[-width / 2 - 0.008, 0, 0]} castShadow>
        <boxGeometry args={[0.012, 0.024, depth]} />
        <primitive object={pbrSteelMat} attach="material" />
      </mesh>
      <mesh position={[width / 2 + 0.008, 0, 0]} castShadow>
        <boxGeometry args={[0.012, 0.024, depth]} />
        <primitive object={pbrSteelMat} attach="material" />
      </mesh>

      {/* Wire Basket Perimeter Rim */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[width, 0.008, depth]} />
        <primitive object={pbrChromeMat} attach="material" />
      </mesh>

      {/* Wire Mesh Floor Plate */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[width - 0.01, 0.006, depth - 0.01]} />
        <primitive object={pbrChromeMat} attach="material" />
      </mesh>

      {/* Vertical Wire Grille Bars */}
      {Array.from({ length: 6 }).map((_, i) => {
        const barX = -width / 2 + (width / 5) * i;
        return (
          <mesh key={`wire-bar-${i}`} position={[barX, 0.01, depth / 2 - 0.005]}>
            <cylinderGeometry args={[0.002, 0.002, 0.14, 8]} />
            <primitive object={pbrChromeMat} attach="material" />
          </mesh>
        );
      })}

      {/* Contents inside basket: Folded Linens */}
      <group position={[0, -0.02, 0]}>
        <FoldedTowels
          position={[-width * 0.20, 0, 0]}
          color="#EDE8DF"
          count={2}
        />
        <RolledTowel position={[width * 0.18, 0.02, 0.02]} color="#D4CBC0" />
      </group>
    </group>
  );
}

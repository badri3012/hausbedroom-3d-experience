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
  const doorHeight = (flexDesign.doorHeight || 2400) / 1000;
  const pelmetHeight = (flexDesign.pelmetHeight || Math.max(0, flexState.ceiling - 2400)) / 1000;

  // PBR SPCC Powder-Coated Steel Structural Finishes
  const pbrSteelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#22252A", // Architectural Anthracite SPCC Powder-Coated Steel
      roughness: 0.30,
      metalness: 0.88,
      envMapIntensity: 1.3,
    });
  }, []);

  const pbrPowderShelfMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#F2F0EC", // Crisp matte satin white/alabaster powder-coated SPCC steel shelf
      roughness: 0.36,
      metalness: 0.45,
      envMapIntensity: 1.1,
    });
  }, []);

  const pbrChromeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#DCE2E8",
      roughness: 0.18,
      metalness: 0.94,
      envMapIntensity: 1.4,
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
      color: "#E5E0D8",
      roughness: 0.90,
    });
  }, []);

  // Side element deductions
  const leftW = (flexDesign.sideL?.internalW || 60) / 1000;
  const rightW = (flexDesign.sideR?.internalW || 60) / 1000;
  const internalStartX = -totalWidth / 2 + leftW;
  const internalEndX = totalWidth / 2 - rightW;
  const internalCenterX = (internalStartX + internalEndX) / 2;

  // SPCC Twin-Slot Wall Upright & Cantilever Profiles
  const uprightPostW = 0.034; // 34mm heavy-duty twin-slot wall upright
  const shelfThickness = 0.018; // Slim 18mm folded SPCC steel shelf deck
  const systemHeight = Math.min(2.70, ceiling - 0.06);
  const rearWallZ = -depth / 2 + 0.012;
  const uprightZ = rearWallZ + 0.022;

  // Remaining clearance gap (centered)
  const remainingGap = Math.max(0, internalWidth - totalModuleWidth);
  const modulesStartX = internalStartX + remainingGap / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* ================================================================= */}
      {/* 1. OUTER SIDE INFILLS & REAR STRUCTURAL WALL                      */}
      {/* ================================================================= */}
      {/* Left Side Partition / Infill */}
      <mesh position={[-totalWidth / 2 + leftW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[leftW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Right Side Partition / Infill */}
      <mesh position={[totalWidth / 2 - rightW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[rightW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Rear Wall Mounting Surface */}
      <mesh position={[internalCenterX, ceiling / 2, rearWallZ - 0.006]} receiveShadow>
        <boxGeometry args={[internalWidth, ceiling, 0.012]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. TOP-HUNG HORIZONTAL SPCC STEEL MOUNTING TRACK                  */}
      {/* ================================================================= */}
      <group position={[internalCenterX, systemHeight - 0.02, uprightZ]}>
        {/* Main Heavy-Duty Top Hang-Track Rail */}
        <mesh castShadow>
          <boxGeometry args={[totalModuleWidth + 0.06, 0.052, 0.028]} />
          <primitive object={pbrSteelMat} attach="material" />
        </mesh>
        {/* Chrome Anchor Bolts Along Top Track */}
        {Array.from({ length: sectionWidths.length + 1 }).map((_, bIdx) => {
          const bx = -totalModuleWidth / 2 + (totalModuleWidth / Math.max(1, sectionWidths.length)) * bIdx;
          return (
            <mesh key={`track-bolt-${bIdx}`} position={[bx, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.008, 12]} />
              <primitive object={pbrChromeMat} attach="material" />
            </mesh>
          );
        })}
      </group>

      {/* ================================================================= */}
      {/* 3. WALL-MOUNTED MODULAR SECTIONS (550 / 609 / 762 mm)             */}
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
          const shelfDepth = depth - 0.10;
          const shelfCenterZ = uprightZ + shelfDepth / 2 + 0.01;

          // Helper to render a Twin-Slot Wall Upright at X
          const renderTwinSlotUpright = (ux: number, keyPrefix: string) => (
            <group key={keyPrefix} position={[ux, systemHeight / 2 + 0.04, uprightZ]}>
              {/* Main Vertical Steel Channel */}
              <mesh castShadow>
                <boxGeometry args={[uprightPostW, systemHeight - 0.08, 0.026]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
              {/* Twin Vertical Slot Channels (High-Contrast Perforation Detail) */}
              <mesh position={[-0.006, 0, 0.014]}>
                <boxGeometry args={[0.004, systemHeight - 0.14, 0.002]} />
                <primitive object={pbrChromeMat} attach="material" />
              </mesh>
              <mesh position={[0.006, 0, 0.014]}>
                <boxGeometry args={[0.004, systemHeight - 0.14, 0.002]} />
                <primitive object={pbrChromeMat} attach="material" />
              </mesh>
            </group>
          );

          // Helper to render a Cantilevered SPCC Steel Shelf with Side Brackets
          const renderCantileverShelf = (sy: number, keyPrefix: string) => (
            <group key={keyPrefix} position={[secCenterX, sy, shelfCenterZ]}>
              {/* Powder-Coated SPCC Steel Shelf Deck */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[secW - 0.012, shelfThickness, shelfDepth]} />
                <primitive object={pbrPowderShelfMat} attach="material" />
              </mesh>
              {/* Anthracite Steel Front Bullnose Lip */}
              <mesh position={[0, 0, shelfDepth / 2 + 0.004]} castShadow>
                <boxGeometry args={[secW - 0.008, shelfThickness + 0.006, 0.010]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
              {/* Left & Right Tapered Cantilever Steel Brackets Projecting from Rear Upright */}
              <mesh position={[-secW / 2 + 0.014, -0.028, -0.01]} castShadow>
                <boxGeometry args={[0.012, 0.048, shelfDepth - 0.02]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
              <mesh position={[secW / 2 - 0.014, -0.028, -0.01]} castShadow>
                <boxGeometry args={[0.012, 0.048, shelfDepth - 0.02]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
            </group>
          );

          const topShelfY = systemHeight - 0.34;
          const midShelfY = systemHeight * 0.52;
          const lowShelfY = 0.16;

          return (
            <group key={`flex-section-${idx}`}>
              {/* Left Wall-Mounted Twin-Slot Upright */}
              {renderTwinSlotUpright(secStartX, `upright-left-${idx}`)}

              {/* Right Wall-Mounted Twin-Slot Upright on Final Section */}
              {idx === sectionWidths.length - 1 &&
                renderTwinSlotUpright(secEndX, `upright-right-${idx}`)}

              {/* Top Cantilevered Shelf */}
              {renderCantileverShelf(topShelfY, `shelf-top-${idx}`)}

              {/* Mid Cantilevered Shelf */}
              {renderCantileverShelf(midShelfY, `shelf-mid-${idx}`)}

              {/* Optional LED Strip Under Top Shelf */}
              {interactionState.shelfLedsOn && (
                <pointLight
                  position={[secCenterX, topShelfY - 0.05, 0.05]}
                  intensity={0.70}
                  distance={1.6}
                  color="#FFF3E0"
                />
              )}

              {/* Top Shelf Storage Box */}
              <StorageBox
                position={[secCenterX, topShelfY + shelfThickness / 2 + 0.10, shelfCenterZ]}
                width={Math.min(0.36, secW * 0.60)}
                height={0.18}
                depth={0.34}
                color={idx % 2 === 0 ? "#2D3034" : "#DBD5CA"}
              />

              {/* Upper Cantilevered Hanging Rail (Suspended by J-Brackets) */}
              <group position={[secCenterX, topShelfY - 0.10, shelfCenterZ]}>
                {/* Left & Right J-Hanger Drop Brackets */}
                <mesh position={[-secW / 2 + 0.04, 0.045, 0]} castShadow>
                  <boxGeometry args={[0.010, 0.09, 0.018]} />
                  <primitive object={pbrSteelMat} attach="material" />
                </mesh>
                <mesh position={[secW / 2 - 0.04, 0.045, 0]} castShadow>
                  <boxGeometry args={[0.010, 0.09, 0.018]} />
                  <primitive object={pbrSteelMat} attach="material" />
                </mesh>
                {/* Chrome Hanging Rod */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.013, 0.013, secW - 0.016, 18]} />
                  <primitive object={pbrChromeMat} attach="material" />
                </mesh>
                {/* Garments */}
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

              {/* Lower Zone: Pull-Out Metallic Wire Mesh Baskets OR Double Hanging / Multi-Shelf */}
              {basketCount > 0 ? (
                <group position={[secCenterX, 0.14, shelfCenterZ]}>
                  {Array.from({ length: Math.min(4, basketCount) }).map((_, bIdx) => {
                    const bY = bIdx * 0.22 + 0.08;
                    const isOpen =
                      interactionState.drawersOpen ||
                      (bIdx === 0 && interactionState.topDrawerOpen) ||
                      (bIdx === 1 && interactionState.bottomDrawerOpen);
                    return (
                      <WireBasketModule
                        key={`basket-${idx}-${bIdx}`}
                        width={secW - 0.036}
                        depth={shelfDepth - 0.02}
                        y={bY}
                        isOpen={isOpen}
                        onToggle={() => {
                          const next = !interactionState.drawersOpen;
                          onUpdateState({
                            drawersOpen: next,
                            topDrawerOpen: next,
                            bottomDrawerOpen: next,
                          });
                        }}
                        pbrChromeMat={pbrChromeMat}
                        pbrSteelMat={pbrSteelMat}
                      />
                    );
                  })}
                </group>
              ) : (
                <group>
                  {renderCantileverShelf(lowShelfY, `shelf-low-${idx}`)}
                  {idx % 2 === 0 ? (
                    <group position={[secCenterX, midShelfY - 0.10, shelfCenterZ]}>
                      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.013, 0.013, secW - 0.016, 18]} />
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
                    <>
                      {renderCantileverShelf((midShelfY + lowShelfY) / 2, `shelf-sub-${idx}`)}
                      <FoldedTowels
                        position={[secCenterX - secW * 0.15, (midShelfY + lowShelfY) / 2 + 0.02, shelfCenterZ]}
                        color="#EAE5DC"
                        count={3}
                      />
                      <StorageBox
                        position={[secCenterX, lowShelfY + 0.12, shelfCenterZ]}
                        width={secW - 0.10}
                        height={0.20}
                        depth={shelfDepth - 0.08}
                        color="#3A3D42"
                      />
                    </>
                  )}
                </group>
              )}
            </group>
          );
        });
      })()}

      {/* ================================================================= */}
      {/* 4. PARAMETRIC DOORS                                               */}
      {/* ================================================================= */}
      {flexState.doorRequired && (
        <ParametricDoors
          openingWidth={doorOpening}
          openingHeight={doorHeight}
          ceilingHeight={ceiling}
          doorType={
            flexDesign.door.type === "sliding"
              ? "sliding"
              : flexDesign.door.type === "none" || flexDesign.door.type === "infeasible"
              ? "none"
              : flexDesign.door.material === "wooden"
              ? "wooden"
              : "aluminum"
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
          pelmetHeight={pelmetHeight}
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

// 3D Pullout SPCC Metal Wire Mesh Basket with Cantilevered Slide Runners
function WireBasketModule({
  width,
  depth,
  y,
  isOpen,
  onToggle,
  pbrChromeMat,
  pbrSteelMat,
}: {
  width: number;
  depth: number;
  y: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrChromeMat: THREE.Material;
  pbrSteelMat: THREE.Material;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const slideZ = isOpen ? 0.26 : 0;

  return (
    <group
      ref={groupRef}
      position={[0, y, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {/* Fixed Cantilever Slide Rails Attached to Rear Uprights */}
      <mesh position={[-width / 2 - 0.008, 0.04, 0]} castShadow>
        <boxGeometry args={[0.014, 0.026, depth]} />
        <primitive object={pbrSteelMat} attach="material" />
      </mesh>
      <mesh position={[width / 2 + 0.008, 0.04, 0]} castShadow>
        <boxGeometry args={[0.014, 0.026, depth]} />
        <primitive object={pbrSteelMat} attach="material" />
      </mesh>

      {/* Sliding Wire Basket Body */}
      <group position={[0, 0, slideZ]}>
        {/* Top Steel Perimeter Frame Rim */}
        <mesh position={[0, 0.05, depth / 2]} castShadow>
          <boxGeometry args={[width, 0.016, 0.014]} />
          <primitive object={pbrSteelMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.05, -depth / 2]} castShadow>
          <boxGeometry args={[width, 0.016, 0.014]} />
          <primitive object={pbrSteelMat} attach="material" />
        </mesh>
        {/* Front Pull Handle Bar */}
        <mesh position={[0, 0.05, depth / 2 + 0.018]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, width * 0.45, 12]} />
          <primitive object={pbrChromeMat} attach="material" />
        </mesh>

        {/* Bottom Wire Mesh Floor */}
        <mesh position={[0, -0.07, 0]} receiveShadow>
          <boxGeometry args={[width - 0.02, 0.006, depth - 0.02]} />
          <primitive object={pbrChromeMat} attach="material" />
        </mesh>

        {/* Front & Side Vertical Wire Mesh Bars */}
        {Array.from({ length: 9 }).map((_, i) => {
          const barX = -width / 2 + 0.02 + ((width - 0.04) / 8) * i;
          return (
            <mesh key={`wire-bar-${i}`} position={[barX, -0.01, depth / 2 - 0.005]}>
              <cylinderGeometry args={[0.0025, 0.0025, 0.12, 8]} />
              <primitive object={pbrChromeMat} attach="material" />
            </mesh>
          );
        })}

        {/* Horizontal Front Wire Guard Rail */}
        <mesh position={[0, -0.01, depth / 2 - 0.005]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0025, 0.0025, width - 0.02, 8]} />
          <primitive object={pbrChromeMat} attach="material" />
        </mesh>

        {/* Contents inside basket: Folded Linens */}
        <group position={[0, -0.04, 0]}>
          <FoldedTowels
            position={[-width * 0.18, 0, 0]}
            color="#EDE8DF"
            count={2}
          />
          <RolledTowel position={[width * 0.18, 0.02, 0.02]} color="#D4CBC0" />
        </group>
      </group>
    </group>
  );
}

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PoleDesignResult, PoleState } from "@/lib/engineering/types";
import { ParametricDoors } from "./ParametricDoors";
import { Drawer } from "../Drawer";
import { GarmentHanger, FoldedTowels, RolledTowel, StorageBox } from "../GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface ParametricPoleWardrobeProps {
  poleState: PoleState;
  poleDesign: PoleDesignResult;
  interactionState: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function ParametricPoleWardrobe({
  poleState,
  poleDesign,
  interactionState,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: ParametricPoleWardrobeProps) {
  // Dimensions in meters
  const totalWidth = poleState.length / 1000;
  const ceiling = poleState.ceiling / 1000;
  const depth = (poleState.depth || 600) / 1000;
  const internalWidth = poleDesign.internalWidth / 1000;
  const internalHeight = poleDesign.internalHeight / 1000;
  const doorOpening = poleDesign.doorOpening / 1000;
  const pelmetHeight = poleDesign.pelmetHeight / 1000;
  const doorHeight = (poleDesign.doorHeight || 2400) / 1000;

  // Pole Finish Material (26mm round structural anodized aluminium pole)
  const poleColor = useMemo(() => {
    if (poleState.poleFinish === "champagne") return "#C8B294";
    if (poleState.poleFinish === "black") return "#1A1B1D";
    return "#DCE1E7"; // Precision Anodized Silver
  }, [poleState.poleFinish]);

  const pbrPoleMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: poleColor,
      roughness: poleState.poleFinish === "black" ? 0.32 : 0.18,
      metalness: poleState.poleFinish === "black" ? 0.78 : 0.92,
      envMapIntensity: 1.4,
    });
  }, [poleColor, poleState.poleFinish]);

  const pbrClampMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: poleState.poleFinish === "black" ? "#111214" : "#B8BEC6",
      roughness: 0.28,
      metalness: 0.90,
      envMapIntensity: 1.3,
    });
  }, [poleState.poleFinish]);

  // Wood shelf and carcass material
  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.85,
    });
  }, [woodMaterial, woodTexture]);

  // Architectural wall backing behind open pole system
  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#EAE5DC",
      roughness: 0.88,
    });
  }, []);

  // Side element deductions
  const leftW = (poleDesign.sideL?.width ?? poleDesign.sideL?.internalW ?? 60) / 1000;
  const rightW = (poleDesign.sideR?.width ?? poleDesign.sideR?.internalW ?? 60) / 1000;

  // Center coordinate of internal carcass
  const internalStartX = -totalWidth / 2 + leftW;
  const internalEndX = totalWidth / 2 - rightW;
  const internalCenterX = (internalStartX + internalEndX) / 2;

  // Bays layout
  const bays = poleDesign.internalLayout.bays;
  const drawerBayIndex = poleDesign.internalLayout.drawerBayIndex;
  const drawerCount = poleDesign.drawerCount + (poleState.addonExtraDrawers || 0);

  // Structural pole diameter: 26mm -> 0.013m radius (rendered at 0.016m for crisp 3D legibility)
  const poleRadius = 0.016;
  const frontPoleZ = depth * 0.24;
  const rearPoleZ = -depth * 0.34;
  const shelfThickness = 0.025;
  const basePlinthHeight = 0.06;

  // Collect all X positions where floor-to-ceiling twin poles stand (left boundary + each bay end)
  const poleXPositions = useMemo(() => {
    const xs: number[] = [internalStartX + 0.022];
    bays.forEach((bay, idx) => {
      const xEnd = internalStartX + bay.xEnd / 1000;
      xs.push(idx === bays.length - 1 ? xEnd - 0.022 : xEnd);
    });
    return xs;
  }, [bays, internalStartX]);

  const topShelfY = basePlinthHeight + internalHeight - 0.36;
  const midShelfY = basePlinthHeight + (internalHeight - 0.36) * 0.50;
  const ledsActive = interactionState.shelfLedsOn || poleState.led;

  // Drawer open toggle helper
  const handleToggleDrawers = () => {
    const next = !interactionState.drawersOpen;
    onUpdateState({
      drawersOpen: next,
      topDrawerOpen: next,
      bottomDrawerOpen: next,
    });
  };

  return (
    <group position={[0, 0, 0]}>
      {/* ================================================================= */}
      {/* 1. SIDE PARTITIONS / WALL INFILLS & BACK WALL                     */}
      {/* ================================================================= */}
      {/* Left Side Element (60mm Full-Height Partition or 50mm Wall Infill) */}
      <mesh position={[-totalWidth / 2 + leftW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[leftW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Right Side Element */}
      <mesh position={[totalWidth / 2 - rightW / 2, ceiling / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[rightW, ceiling, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Ceiling Beam Box if Left Beam */}
      {poleState.left.type === "beam" && (
        <mesh
          position={[
            -totalWidth / 2 + (poleState.left.beamWidth || 130) / 2000,
            ceiling - 0.15,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[(poleState.left.beamWidth || 130) / 1000, 0.30, depth + 0.05]}
          />
          <primitive object={pbrBackWallMat} attach="material" />
        </mesh>
      )}

      {/* Rear Wall Plane */}
      <mesh
        position={[internalCenterX, ceiling / 2, -depth / 2 + 0.006]}
        receiveShadow
      >
        <boxGeometry args={[internalWidth, ceiling, 0.012]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. FLOOR-TO-CEILING 26MM ANODIZED ALUMINIUM TWIN-POLE STANCHIONS  */}
      {/* ================================================================= */}
      {poleXPositions.map((px, pIdx) => (
        <group key={`twin-pole-stanchion-${pIdx}`} position={[px, 0, 0]}>
          {/* Front Floor-to-Ceiling 26mm Structural Pole */}
          <mesh position={[0, ceiling / 2, frontPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius, poleRadius, ceiling, 24]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>
          {/* Rear Floor-to-Ceiling 26mm Structural Pole */}
          <mesh position={[0, ceiling / 2, rearPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius, poleRadius, ceiling, 24]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>

          {/* Floor Adjuster Foot Flanges */}
          <mesh position={[0, 0.012, frontPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius * 1.9, poleRadius * 2.1, 0.024, 20]} />
            <primitive object={pbrClampMat} attach="material" />
          </mesh>
          <mesh position={[0, 0.012, rearPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius * 1.9, poleRadius * 2.1, 0.024, 20]} />
            <primitive object={pbrClampMat} attach="material" />
          </mesh>

          {/* Ceiling Compression Jack Flanges */}
          <mesh position={[0, ceiling - 0.014, frontPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius * 2.1, poleRadius * 1.9, 0.028, 20]} />
            <primitive object={pbrClampMat} attach="material" />
          </mesh>
          <mesh position={[0, ceiling - 0.014, rearPoleZ]} castShadow>
            <cylinderGeometry args={[poleRadius * 2.1, poleRadius * 1.9, 0.028, 20]} />
            <primitive object={pbrClampMat} attach="material" />
          </mesh>

          {/* Horizontal Front-to-Rear Pole Stabilizer Cross-Bars & Collar Clamps */}
          {[topShelfY, midShelfY, basePlinthHeight + 0.02].map((braceY, bIdx) => (
            <group key={`pole-brace-${pIdx}-${bIdx}`} position={[0, braceY - shelfThickness / 2, 0]}>
              {/* Cross-brace rod between front and rear pole */}
              <mesh
                position={[0, 0, (frontPoleZ + rearPoleZ) / 2]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
              >
                <cylinderGeometry
                  args={[poleRadius * 0.65, poleRadius * 0.65, frontPoleZ - rearPoleZ, 14]}
                />
                <primitive object={pbrClampMat} attach="material" />
              </mesh>
              {/* Die-cast Clamp Collar on Front Pole */}
              <mesh position={[0, 0, frontPoleZ]}>
                <cylinderGeometry args={[poleRadius * 1.45, poleRadius * 1.45, 0.032, 18]} />
                <primitive object={pbrClampMat} attach="material" />
              </mesh>
              {/* Die-cast Clamp Collar on Rear Pole */}
              <mesh position={[0, 0, rearPoleZ]}>
                <cylinderGeometry args={[poleRadius * 1.45, poleRadius * 1.45, 0.032, 18]} />
                <primitive object={pbrClampMat} attach="material" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ================================================================= */}
      {/* 3. DYNAMIC BAYS: SHELVES, DRAWER STACK, RODS & ADD-ONS            */}
      {/* ================================================================= */}
      {bays.map((bay, bayIdx) => {
        const bayW = bay.width / 1000;
        const bayStartX = internalStartX + bay.xStart / 1000;
        const bayEndX = internalStartX + bay.xEnd / 1000;
        const bayCenterX = (bayStartX + bayEndX) / 2;

        const isDrawerBay = bayIdx === drawerBayIndex;

        return (
          <group key={`pole-bay-${bayIdx}`}>
            {/* Top Luggage Shelf Clamped Between Poles */}
            <mesh
              position={[bayCenterX, topShelfY, -0.03]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[bayW - 0.036, shelfThickness, depth - 0.10]} />
              <primitive object={pbrWoodMat} attach="material" />
            </mesh>

            {/* Warm Linear LED Strip Under Top Shelf */}
            {ledsActive && (
              <group position={[bayCenterX, topShelfY - shelfThickness / 2 - 0.003, 0.04]}>
                <mesh>
                  <boxGeometry args={[bayW - 0.08, 0.005, 0.014]} />
                  <meshBasicMaterial color="#FFF4DF" />
                </mesh>
                <pointLight
                  position={[0, -0.04, 0.02]}
                  intensity={0.75}
                  distance={1.8}
                  color="#FFF1D6"
                />
              </group>
            )}

            {/* Content within Bay */}
            {isDrawerBay ? (
              // DRAWER STACK BAY
              <group position={[bayCenterX, basePlinthHeight, 0]}>
                {/* Drawer Bank Outer Casing Box Clamped to Poles */}
                <mesh position={[0, (drawerCount * 0.20) / 2 + 0.02, -0.03]} castShadow receiveShadow>
                  <boxGeometry
                    args={[Math.min(bayW - 0.036, 0.82), drawerCount * 0.20 + 0.04, depth - 0.10]}
                  />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>

                {/* Drawers */}
                {Array.from({ length: Math.min(6, drawerCount) }).map((_, dIdx) => {
                  const dHeight = 0.18;
                  const dY = 0.02 + dIdx * 0.19 + dHeight / 2;
                  const dWidth = Math.min(bayW - 0.056, 0.80);
                  const isOpen =
                    dIdx === 0
                      ? interactionState.topDrawerOpen || interactionState.drawersOpen
                      : dIdx === 1
                      ? interactionState.bottomDrawerOpen || interactionState.drawersOpen
                      : interactionState.drawersOpen;

                  return (
                    <Drawer
                      key={`drawer-${dIdx}`}
                      id={`pole-drawer-${dIdx}`}
                      name={`Drawer ${dIdx + 1}`}
                      width={dWidth}
                      height={dHeight}
                      depth={depth - 0.14}
                      position={[0, dY, 0.01]}
                      isOpen={isOpen}
                      onToggle={handleToggleDrawers}
                      woodMaterial={woodMaterial}
                      frameMaterial={frameMaterial}
                      woodTexture={woodTexture}
                      handleStyle="horizontal-bar"
                      handleColor={poleColor}
                    />
                  );
                })}

                {/* Folded linens on top of drawer bank */}
                <group position={[0, drawerCount * 0.20 + 0.06, -0.02]}>
                  <FoldedTowels
                    position={[-bayW * 0.20, 0, 0]}
                    color="#EFEAE1"
                    count={3}
                  />
                  <RolledTowel position={[bayW * 0.18, 0.03, 0.04]} color="#E4DDD3" />
                </group>

                {/* Hanging rail above drawer stack */}
                {poleState.hangingRod && (
                  <group position={[0, topShelfY - basePlinthHeight - 0.08, -0.02]}>
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.013, 0.013, bayW - 0.03, 18]} />
                      <primitive object={pbrPoleMat} attach="material" />
                    </mesh>
                    <GarmentHanger
                      type="shirt"
                      color="#3A3D40"
                      position={[-bayW * 0.20, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="suit"
                      color="#22252A"
                      position={[bayW * 0.15, -0.02, 0]}
                    />
                  </group>
                )}
              </group>
            ) : (
              // HANGING & SHELVING BAY
              <group position={[bayCenterX, 0, 0]}>
                {/* Intermediate Pole-Clamped Shelf */}
                <mesh
                  position={[0, midShelfY, -0.03]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[bayW - 0.036, shelfThickness, depth - 0.10]} />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>

                {/* Bottom Pole-Clamped Shoe/Storage Shelf */}
                <mesh
                  position={[0, basePlinthHeight + 0.02, -0.03]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[bayW - 0.036, shelfThickness, depth - 0.10]} />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>

                {/* Upper Hanging Rod Clamped Between Poles */}
                {poleState.hangingRod && (
                  <group position={[0, topShelfY - 0.08, -0.02]}>
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.013, 0.013, bayW - 0.03, 18]} />
                      <primitive object={pbrPoleMat} attach="material" />
                    </mesh>
                    <GarmentHanger
                      type="suit"
                      color="#1F2327"
                      position={[-bayW * 0.24, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="shirt"
                      color="#EAE6DF"
                      position={[-bayW * 0.08, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="coat"
                      color="#4A3B32"
                      position={[bayW * 0.10, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="dress"
                      color="#8C2D38"
                      position={[bayW * 0.25, -0.02, 0]}
                    />
                  </group>
                )}

                {/* Lower Zone: Addon Baskets / Trouser Rack / Lower Hanging / Boxes */}
                {poleState.addonWireBasket > 0 && bayIdx === (drawerBayIndex === 0 ? 1 : 0) ? (
                  <group position={[0, basePlinthHeight + 0.18, -0.02]}>
                    {Array.from({ length: Math.min(3, poleState.addonWireBasket) }).map((_, bIdx) => (
                      <group key={`pole-addon-basket-${bIdx}`} position={[0, bIdx * 0.22, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[bayW - 0.06, 0.12, depth - 0.14]} />
                          <primitive object={pbrClampMat} attach="material" />
                        </mesh>
                        <FoldedTowels position={[0, 0.02, 0]} color="#EFECE6" count={2} />
                      </group>
                    ))}
                  </group>
                ) : bayIdx % 2 === 0 && poleState.hangingRod ? (
                  <group position={[0, midShelfY - 0.08, -0.02]}>
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.013, 0.013, bayW - 0.03, 18]} />
                      <primitive object={pbrPoleMat} attach="material" />
                    </mesh>
                    <GarmentHanger
                      type="shirt"
                      color="#445566"
                      position={[-bayW * 0.20, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="shirt"
                      color="#FFFFFF"
                      position={[0, -0.02, 0]}
                    />
                    <GarmentHanger
                      type="suit"
                      color="#2B2D2F"
                      position={[bayW * 0.20, -0.02, 0]}
                    />
                  </group>
                ) : (
                  <group position={[0, basePlinthHeight + 0.15, -0.03]}>
                    <StorageBox
                      position={[-bayW * 0.20, 0, 0]}
                      width={Math.min(0.28, bayW * 0.38)}
                      height={0.22}
                      depth={0.36}
                      color="#D6CEBE"
                    />
                    <StorageBox
                      position={[bayW * 0.20, 0, 0]}
                      width={Math.min(0.28, bayW * 0.38)}
                      height={0.22}
                      depth={0.36}
                      color="#323335"
                    />
                  </group>
                )}
              </group>
            )}

            {/* Top Luggage Shelf Items */}
            <group position={[bayCenterX, topShelfY + shelfThickness / 2 + 0.10, -0.03]}>
              <StorageBox
                position={[0, 0, 0]}
                width={Math.min(0.36, bayW * 0.55)}
                height={0.18}
                depth={0.34}
                color={bayIdx % 2 === 0 ? "#DED8CE" : "#4A4845"}
              />
            </group>
          </group>
        );
      })}

      {/* Optional Rotating Dressing Mirror Add-On */}
      {(poleState.addonFullMirror > 0 ||
        poleState.addonBoxMirror > 0 ||
        poleState.addonFlipMirror > 0) && (
        <group position={[internalEndX - 0.06, ceiling * 0.48, 0.04]} rotation={[0, -0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.02, 1.15, 0.34]} />
            <primitive object={pbrClampMat} attach="material" />
          </mesh>
          <mesh position={[-0.012, 0, 0]}>
            <planeGeometry args={[0.30, 1.10]} />
            <meshStandardMaterial color="#E8F0F5" roughness={0.05} metalness={0.96} />
          </mesh>
        </group>
      )}

      {/* ================================================================= */}
      {/* 4. PARAMETRIC DOORS                                               */}
      {/* ================================================================= */}
      {poleState.doorRequired && (
        <ParametricDoors
          openingWidth={doorOpening}
          openingHeight={doorHeight}
          ceilingHeight={ceiling}
          doorType={poleDesign.door.type}
          doorSubtype={
            poleDesign.door.type === "sliding"
              ? "sliding"
              : poleDesign.door.bifoldPairs > 0
              ? "bifold"
              : "swing"
          }
          panelCount={poleDesign.door.panelCount}
          panelWidth={poleDesign.door.panelWidth / 1000}
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

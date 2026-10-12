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
  const doorHeight = poleDesign.door.height / 1000;

  // Pole Finish Material (26mm round structural pole)
  const poleColor = useMemo(() => {
    if (poleState.poleFinish === "champagne") return "#C6B296";
    if (poleState.poleFinish === "black") return "#1E1E1E";
    return "#D8DCE0"; // Silver
  }, [poleState.poleFinish]);

  const pbrPoleMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: poleColor,
      roughness: poleState.poleFinish === "black" ? 0.45 : 0.25,
      metalness: poleState.poleFinish === "black" ? 0.65 : 0.85,
      envMapIntensity: 1.2,
    });
  }, [poleColor, poleState.poleFinish]);

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

  // Carcass backing
  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E2DDD5",
      roughness: 0.90,
    });
  }, []);

  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.1,
    });
  }, [frameMaterial]);

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

  // Structural pole diameter: 26mm -> 0.026m
  const poleRadius = 0.013;
  const shelfThickness = 0.025;
  const basePlinthHeight = 0.08;

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
      {/* 1. SIDE ELEMENTS & EXTERNAL CARCASS                               */}
      {/* ================================================================= */}
      {/* Left Side Element */}
      {poleDesign.sideL.kind === "partition" ? (
        // 60mm Full Height Partition
        <mesh position={[-totalWidth / 2 + leftW / 2, ceiling / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[leftW, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>
      ) : (
        // Wall Infill (50mm)
        <mesh position={[-totalWidth / 2 + leftW / 2, ceiling / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[leftW, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>
      )}

      {/* Right Side Element */}
      {poleDesign.sideR.kind === "partition" ? (
        <mesh position={[totalWidth / 2 - rightW / 2, ceiling / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[rightW, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>
      ) : (
        <mesh position={[totalWidth / 2 - rightW / 2, ceiling / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[rightW, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>
      )}

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

      {/* Base Plinth / Floor Floorboard */}
      <mesh position={[internalCenterX, basePlinthHeight / 2, -0.01]} receiveShadow>
        <boxGeometry args={[internalWidth, basePlinthHeight, depth - 0.04]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Back Panel */}
      <mesh
        position={[internalCenterX, internalHeight / 2 + basePlinthHeight / 2, -depth / 2 + 0.008]}
        receiveShadow
      >
        <boxGeometry args={[internalWidth, internalHeight, 0.016]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>

      {/* Top Header Shelf / Cap Panel */}
      <mesh
        position={[
          internalCenterX,
          basePlinthHeight + internalHeight - shelfThickness / 2,
          -0.01,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[internalWidth, shelfThickness, depth - 0.04]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. DYNAMIC BAYS & STRUCTURAL 26MM POLES                           */}
      {/* ================================================================= */}
      {bays.map((bay, bayIdx) => {
        const bayW = bay.width / 1000;
        const bayStartX = internalStartX + bay.xStart / 1000;
        const bayEndX = internalStartX + bay.xEnd / 1000;
        const bayCenterX = (bayStartX + bayEndX) / 2;

        const isDrawerBay = bayIdx === drawerBayIndex;

        return (
          <group key={`pole-bay-${bayIdx}`}>
            {/* Structural Pole on Right Boundary of Bay (except far right outer wall) */}
            {bayIdx < bays.length - 1 && (
              <mesh position={[bayEndX, ceiling / 2, depth / 2 - 0.06]} castShadow>
                <cylinderGeometry args={[poleRadius, poleRadius, ceiling, 24]} />
                <primitive object={pbrPoleMat} attach="material" />
              </mesh>
            )}

            {/* Rear Structural Pole matching front pole */}
            {bayIdx < bays.length - 1 && (
              <mesh position={[bayEndX, internalHeight / 2 + basePlinthHeight, -depth / 4]} castShadow>
                <cylinderGeometry
                  args={[poleRadius * 0.85, poleRadius * 0.85, internalHeight, 20]}
                />
                <primitive object={pbrPoleMat} attach="material" />
              </mesh>
            )}

            {/* Top Shelf in Bay */}
            <mesh
              position={[
                bayCenterX,
                basePlinthHeight + internalHeight - 0.40,
                -0.02,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[bayW - 0.02, shelfThickness, depth - 0.06]} />
              <primitive object={pbrWoodMat} attach="material" />
            </mesh>

            {/* Upper LED Light Strip Under Top Shelf */}
            {interactionState.shelfLedsOn && (
              <pointLight
                position={[bayCenterX, basePlinthHeight + internalHeight - 0.43, 0.05]}
                intensity={0.65}
                distance={1.6}
                color="#FFF1DE"
              />
            )}

            {/* Content within Bay */}
            {isDrawerBay ? (
              // DRAWER STACK
              <group position={[bayCenterX, basePlinthHeight, 0]}>
                {/* Drawer Bank Casing Box */}
                <mesh position={[0, (drawerCount * 0.20) / 2 + 0.02, -0.02]} receiveShadow>
                  <boxGeometry
                    args={[Math.min(bayW - 0.02, 0.82), drawerCount * 0.20 + 0.04, depth - 0.06]}
                  />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>

                {/* Drawers */}
                {Array.from({ length: Math.min(6, drawerCount) }).map((_, dIdx) => {
                  const dHeight = 0.18;
                  const dY = 0.02 + dIdx * 0.19 + dHeight / 2;
                  const dWidth = Math.min(bayW - 0.04, 0.80);
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
                      depth={depth - 0.10}
                      position={[0, dY, 0.02]}
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

                {/* Storage accessories above drawers */}
                <group position={[0, drawerCount * 0.20 + 0.08, 0]}>
                  <FoldedTowels
                    position={[-bayW * 0.22, 0, 0]}
                    color="#EFEAE1"
                    count={3}
                  />
                  <RolledTowel position={[bayW * 0.20, 0.03, 0.04]} color="#EFEAE1" />
                </group>

                {/* Hanging rail above drawer storage */}
                {poleState.hangingRod && (
                  <group
                    position={[
                      0,
                      basePlinthHeight + internalHeight - 0.50,
                      0,
                    ]}
                  >
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.012, 0.012, bayW - 0.04, 16]} />
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
              // HANGING / SHELVING BAY
              <group position={[bayCenterX, 0, 0]}>
                {/* Intermediate Shelf */}
                <mesh
                  position={[0, basePlinthHeight + (internalHeight - 0.40) / 2, -0.02]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[bayW - 0.02, shelfThickness, depth - 0.06]} />
                  <primitive object={pbrWoodMat} attach="material" />
                </mesh>

                {/* Upper Hanging Rod */}
                <group position={[0, basePlinthHeight + internalHeight - 0.50, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.012, 0.012, bayW - 0.04, 16]} />
                    <primitive object={pbrPoleMat} attach="material" />
                  </mesh>
                  {/* Hangers */}
                  <GarmentHanger
                    type="suit"
                    color="#1F2327"
                    position={[-bayW * 0.25, -0.02, 0]}
                  />
                  <GarmentHanger
                    type="shirt"
                    color="#EAE6DF"
                    position={[-bayW * 0.08, -0.02, 0]}
                  />
                  <GarmentHanger
                    type="coat"
                    color="#4A3B32"
                    position={[bayW * 0.12, -0.02, 0]}
                  />
                  <GarmentHanger
                    type="dress"
                    color="#8C2D38"
                    position={[bayW * 0.28, -0.02, 0]}
                  />
                </group>

                {/* Lower Hanging Rod or Storage Boxes */}
                {bayIdx % 2 === 0 ? (
                  <group
                    position={[
                      0,
                      basePlinthHeight + (internalHeight - 0.40) / 2 - 0.10,
                      0,
                    ]}
                  >
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.012, 0.012, bayW - 0.04, 16]} />
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
                  <group position={[0, basePlinthHeight + 0.12, 0]}>
                    <StorageBox
                      position={[-bayW * 0.22, 0, 0]}
                      width={0.28}
                      height={0.22}
                      depth={0.38}
                      color="#D6CEBE"
                    />
                    <StorageBox
                      position={[bayW * 0.22, 0, 0]}
                      width={0.28}
                      height={0.22}
                      depth={0.38}
                      color="#323335"
                    />
                  </group>
                )}
              </group>
            )}
          </group>
        );
      })}

      {/* ================================================================= */}
      {/* 3. PARAMETRIC DOORS                                               */}
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

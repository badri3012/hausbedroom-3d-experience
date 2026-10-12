"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { PoleLShapeDesign, PoleState, FlexState, FlexDesignResult } from "@/lib/engineering/types";
import { ParametricDoors } from "./ParametricDoors";
import { Drawer } from "../Drawer";
import { GarmentHanger, FoldedTowels, StorageBox } from "../GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface ParametricLShapeAssemblyProps {
  productSystem: "pole" | "flex";
  poleState: PoleState;
  poleLShapeDesign?: PoleLShapeDesign;
  flexState: FlexState;
  flexDesign?: FlexDesignResult;
  interactionState: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function ParametricLShapeAssembly({
  productSystem,
  poleState,
  poleLShapeDesign,
  flexState,
  flexDesign,
  interactionState,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: ParametricLShapeAssemblyProps) {
  // PBR Materials
  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.85,
    });
  }, [woodMaterial, woodTexture]);

  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.1,
    });
  }, [frameMaterial]);

  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E2DDD5",
      roughness: 0.90,
    });
  }, []);

  const pbrPoleMat = useMemo(() => {
    const col = poleState.poleFinish === "champagne" ? "#C6B296" : poleState.poleFinish === "black" ? "#1E1E1E" : "#D8DCE0";
    return new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.35,
      metalness: 0.85,
      envMapIntensity: 1.2,
    });
  }, [poleState.poleFinish]);

  // Dimensions
  const legALengthMm = productSystem === "pole" ? poleState.ls.legALength : flexState.ls.legA.length;
  const legBLengthMm = productSystem === "pole" ? poleState.ls.legBLength : flexState.ls.legB.length;
  const ceilingMm = productSystem === "pole" ? poleState.ls.ceiling : flexState.ls.ceiling;

  const legAW = legALengthMm / 1000;
  const legBW = legBLengthMm / 1000;
  const ceiling = Math.min(3.30, ceilingMm / 1000);
  const depth = 0.60;
  const cornerDeduction = 0.60; // Standard 600mm corner deduction

  // Center alignment for Leg A (along X axis) and Leg B (along Z axis at right angle)
  // Corner is located at X = -legAW/2, Z = -legBW/2
  const cornerX = -legAW / 2;
  const cornerZ = -legBW / 2;

  // Leg A runs from cornerX to cornerX + legAW along X
  // Leg B runs from cornerZ to cornerZ + legBW along Z
  const legACenterX = cornerX + legAW / 2;
  const legBCenterZ = cornerZ + legBW / 2;

  // Door openings from calculation
  const doorAOpening = poleLShapeDesign ? poleLShapeDesign.doorA.opening / 1000 : legAW - 0.06 - cornerDeduction;
  const doorBOpening = poleLShapeDesign ? poleLShapeDesign.doorB.opening / 1000 : legBW - 0.06 - cornerDeduction;

  const drawerCount = poleLShapeDesign ? poleLShapeDesign.drawerCount + (poleState.addonExtraDrawers || 0) : 4;

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
      {/* 1. CORNER POST & CORNER RETURN PANEL                              */}
      {/* ================================================================= */}
      {/* Structural Corner Column (90° Joint) */}
      <mesh position={[cornerX + depth - 0.02, ceiling / 2, cornerZ + depth - 0.02]} castShadow>
        <boxGeometry args={[0.04, ceiling, 0.04]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Corner Ceiling Infill Panel */}
      <mesh
        position={[cornerX + depth / 2, ceiling - 0.015, cornerZ + depth / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[depth, 0.03, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Corner Floor Base */}
      <mesh position={[cornerX + depth / 2, 0.04, cornerZ + depth / 2]} receiveShadow>
        <boxGeometry args={[depth, 0.08, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Corner L-Shelf (Access to corner void) */}
      <mesh position={[cornerX + depth / 2, ceiling / 2, cornerZ + depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[depth - 0.04, 0.025, depth - 0.04]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. LEG A (MAIN WING ALONG X-AXIS)                                */}
      {/* ================================================================= */}
      <group position={[cornerX + cornerDeduction, 0, cornerZ]}>
        {/* Back Wall for Leg A */}
        <mesh position={[(legAW - cornerDeduction) / 2, ceiling / 2, 0.01]} receiveShadow>
          <boxGeometry args={[legAW - cornerDeduction, ceiling, 0.016]} />
          <primitive object={pbrBackWallMat} attach="material" />
        </mesh>

        {/* Floorboard */}
        <mesh position={[(legAW - cornerDeduction) / 2, 0.04, depth / 2]} receiveShadow>
          <boxGeometry args={[legAW - cornerDeduction, 0.08, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Top Header Shelf */}
        <mesh position={[(legAW - cornerDeduction) / 2, ceiling - 0.35, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legAW - cornerDeduction - 0.02, 0.025, depth - 0.04]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Outer Far Right End Partition */}
        <mesh position={[legAW - cornerDeduction - 0.03, ceiling / 2, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.06, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Drawers in Leg A (Consolidated Bank) */}
        <group position={[0.45, 0.08, depth / 2]}>
          <mesh position={[0, (drawerCount * 0.20) / 2, 0]} receiveShadow>
            <boxGeometry args={[0.82, drawerCount * 0.20 + 0.02, depth - 0.06]} />
            <primitive object={pbrWoodMat} attach="material" />
          </mesh>
          {Array.from({ length: Math.min(6, drawerCount) }).map((_, dIdx) => (
            <Drawer
              key={`ls-drawer-${dIdx}`}
              id={`ls-legA-drawer-${dIdx}`}
              name={`Drawer ${dIdx + 1}`}
              width={0.80}
              height={0.18}
              depth={depth - 0.10}
              position={[0, 0.02 + dIdx * 0.19 + 0.09, 0.02]}
              isOpen={interactionState.drawersOpen}
              onToggle={handleToggleDrawers}
              woodMaterial={woodMaterial}
              frameMaterial={frameMaterial}
              woodTexture={woodTexture}
            />
          ))}
          <FoldedTowels position={[-0.15, drawerCount * 0.20 + 0.06, 0]} color="#F0ECE1" count={2} />
        </group>

        {/* Hanging rail on Leg A */}
        <group position={[(legAW - cornerDeduction) * 0.72, ceiling - 0.45, depth / 2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, (legAW - cornerDeduction) * 0.45, 16]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>
          <GarmentHanger type="suit" color="#26272B" position={[-0.15, -0.02, 0]} />
          <GarmentHanger type="shirt" color="#FFFFFF" position={[0, -0.02, 0]} />
          <GarmentHanger type="dress" color="#852E38" position={[0.15, -0.02, 0]} />
        </group>

        {/* Leg A Doors */}
        {poleState.doorRequired && poleLShapeDesign && (
          <ParametricDoors
            openingWidth={doorAOpening}
            openingHeight={Math.min(2.40, ceiling)}
            ceilingHeight={ceiling}
            doorType={poleLShapeDesign.doorA.type}
            doorSubtype={poleLShapeDesign.doorA.type === "sliding" ? "sliding" : "bifold"}
            panelCount={poleLShapeDesign.doorA.panelCount || 2}
            panelWidth={doorAOpening / (poleLShapeDesign.doorA.panelCount || 2)}
            pelmetHeight={Math.max(0, ceiling - 2.40)}
            isOpen={interactionState.bothDoorsOpen}
            onToggle={() => onUpdateState({ bothDoorsOpen: !interactionState.bothDoorsOpen })}
            frameMaterial={frameMaterial}
            doorPanelMaterial={doorPanelMaterial}
            woodMaterial={woodMaterial}
            woodTexture={woodTexture}
            position={[(doorAOpening) / 2, 0, depth + 0.015]}
          />
        )}
      </group>

      {/* ================================================================= */}
      {/* 3. LEG B (RETURN WING ALONG Z-AXIS AT 90°)                        */}
      {/* ================================================================= */}
      <group position={[cornerX, 0, cornerZ + cornerDeduction]} rotation={[0, Math.PI / 2, 0]}>
        {/* Back Wall for Leg B */}
        <mesh position={[(legBW - cornerDeduction) / 2, ceiling / 2, -0.01]} receiveShadow>
          <boxGeometry args={[legBW - cornerDeduction, ceiling, 0.016]} />
          <primitive object={pbrBackWallMat} attach="material" />
        </mesh>

        {/* Floorboard */}
        <mesh position={[(legBW - cornerDeduction) / 2, 0.04, -depth / 2]} receiveShadow>
          <boxGeometry args={[legBW - cornerDeduction, 0.08, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Top Header Shelf */}
        <mesh position={[(legBW - cornerDeduction) / 2, ceiling - 0.35, -depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legBW - cornerDeduction - 0.02, 0.025, depth - 0.04]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Outer Far End Partition */}
        <mesh position={[legBW - cornerDeduction - 0.03, ceiling / 2, -depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.06, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* Shelving & Hanging on Leg B */}
        <group position={[(legBW - cornerDeduction) / 2, ceiling - 0.45, -depth / 2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, (legBW - cornerDeduction) * 0.80, 16]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>
          <GarmentHanger type="shirt" color="#455667" position={[-0.15, -0.02, 0]} />
          <GarmentHanger type="coat" color="#3B2F28" position={[0.15, -0.02, 0]} />
        </group>

        {/* Lower Shelving on Leg B */}
        <mesh position={[(legBW - cornerDeduction) / 2, ceiling / 2 - 0.15, -depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legBW - cornerDeduction - 0.04, 0.025, depth - 0.06]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>
        <StorageBox position={[(legBW - cornerDeduction) / 2, 0.15, -depth / 2]} width={0.40} height={0.22} depth={0.35} color="#D4CCBC" />

        {/* Leg B Doors */}
        {poleState.doorRequired && poleLShapeDesign && (
          <ParametricDoors
            openingWidth={doorBOpening}
            openingHeight={Math.min(2.40, ceiling)}
            ceilingHeight={ceiling}
            doorType={poleLShapeDesign.doorB.type}
            doorSubtype={poleLShapeDesign.doorB.type === "sliding" ? "sliding" : "bifold"}
            panelCount={poleLShapeDesign.doorB.panelCount || 2}
            panelWidth={doorBOpening / (poleLShapeDesign.doorB.panelCount || 2)}
            pelmetHeight={Math.max(0, ceiling - 2.40)}
            isOpen={interactionState.bothDoorsOpen}
            onToggle={() => onUpdateState({ bothDoorsOpen: !interactionState.bothDoorsOpen })}
            frameMaterial={frameMaterial}
            doorPanelMaterial={doorPanelMaterial}
            woodMaterial={woodMaterial}
            woodTexture={woodTexture}
            position={[(doorBOpening) / 2, 0, -depth - 0.015]}
            rotation={[0, Math.PI, 0]}
          />
        )}
      </group>
    </group>
  );
}

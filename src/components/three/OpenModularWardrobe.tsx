"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Drawer } from "./Drawer";
import { GarmentHanger, StorageBox } from "./GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface OpenModularWardrobeProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function OpenModularWardrobe({
  state,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: OpenModularWardrobeProps) {
  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.9,
    });
  }, [woodMaterial, woodTexture]);

  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.2,
    });
  }, [frameMaterial]);

  const pbrRailMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: 0.25,
      metalness: 0.9,
    });
  }, [frameMaterial]);

  // Integrated Warm LED Strip under each shelf (Signature Ref 2)
  const pbrLedMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#FFEED1",
      emissive: state.shelfLedsOn ? "#FFD27D" : "#000000",
      emissiveIntensity: state.shelfLedsOn ? 2.6 : 0,
      roughness: 0.15,
    });
  }, [state.shelfLedsOn]);

  const totalW = 2.8;
  const totalH = 2.4;
  const totalD = 0.55;
  const shelfThickness = 0.028;

  // 3 pairs of vertical metal posts at X = -0.90, X = 0.0, X = 0.90
  const postPositions = [-0.90, 0.0, 0.90];

  return (
    <group position={[0, totalH / 2, 0]}>
      {/* ========================================================= */}
      {/* 1. BLACK METAL STRUCTURAL SUPPORT COLUMNS (Reference 2)   */}
      {/* ========================================================= */}
      {postPositions.map((xPos, idx) => (
        <group key={idx} position={[xPos, 0, 0]}>
          {/* Front Vertical Column */}
          <mesh position={[0, 0, totalD / 2 - 0.03]} material={pbrFrameMat} castShadow>
            <boxGeometry args={[0.04, totalH, 0.05]} />
          </mesh>
          {/* Rear Vertical Column (Wall Mount) */}
          <mesh position={[0, 0, -totalD / 2 + 0.03]} material={pbrFrameMat} castShadow>
            <boxGeometry args={[0.04, totalH, 0.05]} />
          </mesh>
          {/* Ceiling & Floor Flange Mount Plates */}
          <mesh position={[0, totalH / 2 - 0.01, totalD / 2 - 0.03]} material={pbrFrameMat}>
            <boxGeometry args={[0.07, 0.015, 0.08]} />
          </mesh>
          <mesh position={[0, -totalH / 2 + 0.01, totalD / 2 - 0.03]} material={pbrFrameMat}>
            <boxGeometry args={[0.07, 0.015, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* ========================================================= */}
      {/* 2. FLOATING NATURAL WOOD SHELVES WITH INTEGRATED LEDS     */}
      {/* ========================================================= */}
      {/* Top Shelf Left (X: -0.45m) */}
      <group position={[-0.45, 0.92, 0]}>
        <mesh material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
        {/* Warm LED Strip Underneath */}
        <mesh position={[0, -shelfThickness / 2 - 0.004, 0]} material={pbrLedMat}>
          <boxGeometry args={[0.84, 0.008, 0.02]} />
        </mesh>
        {state.shelfLedsOn && (
          <pointLight
            position={[0, -0.08, 0]}
            color="#FFDCA8"
            intensity={1.2}
            distance={1.2}
            decay={2}
          />
        )}
        <StorageBox position={[0, 0.02, 0]} color="#D1983D" width={0.34} height={0.20} />
      </group>

      {/* Top Shelf Right (X: +0.45m) */}
      <group position={[0.45, 0.92, 0]}>
        <mesh material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
        {/* Warm LED Strip Underneath */}
        <mesh position={[0, -shelfThickness / 2 - 0.004, 0]} material={pbrLedMat}>
          <boxGeometry args={[0.84, 0.008, 0.02]} />
        </mesh>
        {state.shelfLedsOn && (
          <pointLight
            position={[0, -0.08, 0]}
            color="#FFDCA8"
            intensity={1.2}
            distance={1.2}
            decay={2}
          />
        )}
        <StorageBox position={[0, 0.02, 0]} color="#2B2D31" width={0.34} height={0.20} />
      </group>

      {/* Mid Floating Display Shelf Left */}
      <group position={[-0.45, 0.72, 0]}>
        <mesh material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
        <mesh position={[0, -shelfThickness / 2 - 0.004, 0]} material={pbrLedMat}>
          <boxGeometry args={[0.84, 0.008, 0.02]} />
        </mesh>
        {state.shelfLedsOn && (
          <pointLight
            position={[0, -0.08, 0]}
            color="#FFDCA8"
            intensity={1.0}
            distance={1.0}
            decay={2}
          />
        )}
      </group>

      {/* Mid Floating Display Shelf Right */}
      <group position={[0.45, 0.72, 0]}>
        <mesh material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
        <mesh position={[0, -shelfThickness / 2 - 0.004, 0]} material={pbrLedMat}>
          <boxGeometry args={[0.84, 0.008, 0.02]} />
        </mesh>
        {state.shelfLedsOn && (
          <pointLight
            position={[0, -0.08, 0]}
            color="#FFDCA8"
            intensity={1.0}
            distance={1.0}
            decay={2}
          />
        )}
      </group>

      {/* ========================================================= */}
      {/* 3. OPEN HANGING BARS WITH DARK SHIRTS (Reference Image 2)  */}
      {/* ========================================================= */}
      {/* Left Hanging Section */}
      <group position={[-0.45, 0.60, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={pbrRailMat} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.86, 16]} />
        </mesh>
        <GarmentHanger type="shirt" color="#1A1C1E" position={[-0.24, 0, 0]} />
        <GarmentHanger type="shirt" color="#26282B" position={[-0.08, 0, 0]} />
        <GarmentHanger type="shirt" color="#1E2023" position={[0.08, 0, 0]} />
        <GarmentHanger type="shirt" color="#2F3238" position={[0.24, 0, 0]} />
      </group>

      {/* Right Hanging Section */}
      <group position={[0.45, 0.60, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={pbrRailMat} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.86, 16]} />
        </mesh>
        <GarmentHanger type="shirt" color="#1D1F22" position={[-0.24, 0, 0]} />
        <GarmentHanger type="shirt" color="#353940" position={[-0.08, 0, 0]} />
        <GarmentHanger type="shirt" color="#232528" position={[0.08, 0, 0]} />
        <GarmentHanger type="shirt" color="#1A1C1E" position={[0.24, 0, 0]} />
      </group>

      {/* ========================================================= */}
      {/* 4. FLOATING DRAWERS WITH SMOKED GLASS FRONTS (Reference 2) */}
      {/* ========================================================= */}
      {/* Left Floating Drawer Module */}
      <group position={[-0.45, -0.22, 0]}>
        {/* Wood Outer Shell for Drawer Pedestal */}
        <mesh position={[0, 0.12, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.86, 0.02, totalD - 0.04]} />
        </mesh>
        <mesh position={[-0.42, -0.15, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.02, 0.54, totalD - 0.04]} />
        </mesh>
        <mesh position={[0.42, -0.15, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.02, 0.54, totalD - 0.04]} />
        </mesh>

        {/* Upper Smoked-Glass Front Drawer */}
        <Drawer
          id="open.left.drawer.top"
          name="Left Upper Smoked Glass Drawer"
          width={0.80}
          height={0.22}
          depth={0.48}
          position={[0, 0.0, 0]}
          isOpen={state.topDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ topDrawerOpen: !(state.topDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          frontType="smoked-glass"
          handleStyle="recessed-lip"
        />

        {/* Lower Smoked-Glass Front Drawer */}
        <Drawer
          id="open.left.drawer.bottom"
          name="Left Lower Smoked Glass Drawer"
          width={0.80}
          height={0.24}
          depth={0.48}
          position={[0, -0.25, 0]}
          isOpen={state.bottomDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ bottomDrawerOpen: !(state.bottomDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          frontType="smoked-glass"
          handleStyle="recessed-lip"
        />

        {/* Bottom Floating Shelf */}
        <mesh position={[0, -0.72, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
      </group>

      {/* Right Floating Drawer Module */}
      <group position={[0.45, -0.22, 0]}>
        {/* Wood Outer Shell */}
        <mesh position={[0, 0.12, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.86, 0.02, totalD - 0.04]} />
        </mesh>
        <mesh position={[-0.42, -0.15, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.02, 0.54, totalD - 0.04]} />
        </mesh>
        <mesh position={[0.42, -0.15, 0]} material={pbrWoodMat} castShadow>
          <boxGeometry args={[0.02, 0.54, totalD - 0.04]} />
        </mesh>

        {/* Upper Smoked-Glass Front Drawer */}
        <Drawer
          id="open.right.drawer.top"
          name="Right Upper Smoked Glass Drawer"
          width={0.80}
          height={0.22}
          depth={0.48}
          position={[0, 0.0, 0]}
          isOpen={state.topDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ topDrawerOpen: !(state.topDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          frontType="smoked-glass"
          handleStyle="recessed-lip"
        />

        {/* Lower Smoked-Glass Front Drawer */}
        <Drawer
          id="open.right.drawer.bottom"
          name="Right Lower Smoked Glass Drawer"
          width={0.80}
          height={0.24}
          depth={0.48}
          position={[0, -0.25, 0]}
          isOpen={state.bottomDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ bottomDrawerOpen: !(state.bottomDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          frontType="smoked-glass"
          handleStyle="recessed-lip"
        />

        {/* Bottom Floating Shelf */}
        <mesh position={[0, -0.72, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.86, shelfThickness, totalD - 0.04]} />
        </mesh>
      </group>
    </group>
  );
}

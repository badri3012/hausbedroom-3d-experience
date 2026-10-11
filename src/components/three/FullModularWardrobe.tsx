"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Drawer } from "./Drawer";
import { SlidingDoor } from "./SlidingDoor";
import {
  GarmentHanger,
  FoldedTowels,
  RolledTowel,
  StorageBox,
  WireBasket,
} from "./GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface FullModularWardrobeProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function FullModularWardrobe({
  state,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: FullModularWardrobeProps) {
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

  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E2DDD5",
      roughness: 0.9,
    });
  }, []);

  const totalW = 3.6;
  const totalH = 2.4;
  const totalD = 0.6;
  const boardThickness = 0.022;

  // 4 bays: each approx 0.88m wide
  // X centers:
  // Bay 1: -1.32m
  // Bay 2: -0.44m
  // Bay 3: +0.44m
  // Bay 4: +1.32m

  return (
    <group position={[0, totalH / 2, 0]}>
      {/* 1. BACK WALL & SHELL */}
      <mesh position={[0, 0, -totalD / 2 + 0.005]} material={pbrBackWallMat} receiveShadow>
        <boxGeometry args={[totalW, totalH, 0.01]} />
      </mesh>

      {/* Top Header Panel */}
      <mesh
        position={[0, totalH / 2 - boardThickness / 2, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalW, boardThickness, totalD]} />
      </mesh>

      {/* Bottom Floor Base Panel */}
      <mesh
        position={[0, -totalH / 2 + boardThickness / 2, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalW, boardThickness, totalD]} />
      </mesh>

      {/* Outer Gable Ends */}
      <mesh
        position={[-totalW / 2 + boardThickness / 2, 0, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardThickness, totalH, totalD]} />
      </mesh>
      <mesh
        position={[totalW / 2 - boardThickness / 2, 0, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardThickness, totalH, totalD]} />
      </mesh>

      {/* Outer Anodized Trim */}
      <mesh position={[0, totalH / 2 - 0.015, totalD / 2 + 0.01]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.06, 0.035, 0.04]} />
      </mesh>
      <mesh position={[0, -totalH / 2 + 0.015, totalD / 2 + 0.01]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.06, 0.035, 0.04]} />
      </mesh>

      {/* 2. THREE INTERNAL ALUMINIUM DIVIDER PILLARS (Columns between 4 bays) */}
      {[-0.88, 0, 0.88].map((xPos, idx) => (
        <group key={idx} position={[xPos, 0, 0]}>
          {/* Main vertical wood divider */}
          <mesh material={pbrWoodMat} castShadow receiveShadow>
            <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.06]} />
          </mesh>
          {/* Vertical extruded aluminium structural column on front edge (Reference 1) */}
          <mesh position={[0, 0, totalD / 2 - 0.035]} material={pbrFrameMat}>
            <boxGeometry args={[0.035, totalH - 0.06, 0.04]} />
          </mesh>
        </group>
      ))}

      {/* Top Continuous Track for sliding door */}
      <mesh position={[0, totalH / 2 - 0.03, totalD / 2 - 0.01]} material={pbrFrameMat}>
        <boxGeometry args={[totalW, 0.025, 0.07]} />
      </mesh>
      <mesh position={[0, -totalH / 2 + 0.03, totalD / 2 - 0.01]} material={pbrFrameMat}>
        <boxGeometry args={[totalW, 0.015, 0.07]} />
      </mesh>

      {/* ========================================================= */}
      {/* 3. BAY 1: LEFT BAY (-1.32m)                                */}
      {/* Top shelf + red box, hanging dresses, lower 4-cubby unit  */}
      {/* ========================================================= */}
      <group position={[-1.32, 0, 0]}>
        {/* Top luggage shelf */}
        <mesh position={[0, 0.82, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.85, 0]} color="#7E2632" width={0.42} height={0.22} />

        {/* Hanging Rail */}
        <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.84, 16]} />
        </mesh>
        <GarmentHanger type="dress" color="#8C939A" position={[-0.24, 0.68, 0]} />
        <GarmentHanger type="dress" color="#C7C2B8" position={[-0.08, 0.68, 0]} />
        <GarmentHanger type="dress" color="#B8B2A6" position={[0.08, 0.68, 0]} />
        <GarmentHanger type="suit" color="#303438" position={[0.24, 0.68, 0]} />

        {/* Mid Divider Shelf */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower 4-Cubby Unit (2x2 grid) */}
        {/* Vertical center divider */}
        <mesh position={[0, -0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        {/* Horizontal middle shelf */}
        <mesh position={[0, -0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.1]} />
        </mesh>
        {/* Cubby items (Reference 1 yellow rolled towels & accessories) */}
        <RolledTowel position={[-0.22, -0.42, 0]} color="#D4A72C" />
        <FoldedTowels position={[0.22, -0.48, 0]} color="#EAE5DC" count={2} />
        <StorageBox position={[-0.22, -0.88, 0]} color="#38302A" width={0.28} height={0.18} />
        <RolledTowel position={[0.22, -0.82, 0]} color="#D4A72C" />
      </group>

      {/* ========================================================= */}
      {/* 4. BAY 2: CENTER-LEFT BAY (-0.44m)                         */}
      {/* Top shelf + box, suits hanging, 2 drawers, wire basket    */}
      {/* ========================================================= */}
      <group position={[-0.44, 0, 0]}>
        {/* Top shelf */}
        <mesh position={[0, 0.82, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.85, 0]} color="#7E2632" width={0.42} height={0.22} />

        {/* Hanging Rail & Suits */}
        <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.84, 16]} />
        </mesh>
        <GarmentHanger type="suit" color="#242629" position={[-0.24, 0.68, 0]} />
        <GarmentHanger type="suit" color="#353A40" position={[-0.08, 0.68, 0]} />
        <GarmentHanger type="suit" color="#1F2022" position={[0.08, 0.68, 0]} />
        <GarmentHanger type="coat" color="#423E3A" position={[0.24, 0.68, 0]} />

        {/* Shelf separating hanging from drawers */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Two Soft-Close Drawers */}
        <Drawer
          id="bay2.drawer.top"
          name="Bay 2 Upper Drawer"
          width={0.82}
          height={0.20}
          depth={0.48}
          position={[0, -0.24, 0]}
          isOpen={state.topDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ topDrawerOpen: !(state.topDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          woodTexture={woodTexture}
          frontType="wood"
          handleStyle="horizontal-bar"
        />

        <Drawer
          id="bay2.drawer.bottom"
          name="Bay 2 Lower Drawer"
          width={0.82}
          height={0.20}
          depth={0.48}
          position={[0, -0.46, 0]}
          isOpen={state.bottomDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ bottomDrawerOpen: !(state.bottomDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          woodTexture={woodTexture}
          frontType="wood"
          handleStyle="horizontal-bar"
        />

        {/* Shelf below drawers */}
        <mesh position={[0, -0.58, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower Chrome Wire Laundry Basket with Linens (Reference 1) */}
        <WireBasket position={[0, -0.92, 0]} width={0.78} height={0.18} depth={0.46} />
      </group>

      {/* ========================================================= */}
      {/* 5. BAY 3: CENTER-RIGHT BAY (+0.44m)                        */}
      {/* Top shelf + box, shirts hanging, 2 drawers, wire basket   */}
      {/* ========================================================= */}
      <group position={[0.44, 0, 0]}>
        {/* Top shelf */}
        <mesh position={[0, 0.82, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.85, 0]} color="#7E2632" width={0.42} height={0.22} />

        {/* Hanging Rail & Dark Shirts */}
        <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.84, 16]} />
        </mesh>
        <GarmentHanger type="shirt" color="#1A1C1E" position={[-0.24, 0.68, 0]} />
        <GarmentHanger type="shirt" color="#26282B" position={[-0.08, 0.68, 0]} />
        <GarmentHanger type="shirt" color="#31353B" position={[0.08, 0.68, 0]} />
        <GarmentHanger type="shirt" color="#1C1E20" position={[0.24, 0.68, 0]} />

        {/* Shelf separating hanging from drawers */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Two Soft-Close Drawers */}
        <Drawer
          id="bay3.drawer.top"
          name="Bay 3 Upper Drawer"
          width={0.82}
          height={0.20}
          depth={0.48}
          position={[0, -0.24, 0]}
          isOpen={state.topDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ topDrawerOpen: !(state.topDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          woodTexture={woodTexture}
          frontType="wood"
          handleStyle="horizontal-bar"
        />

        <Drawer
          id="bay3.drawer.bottom"
          name="Bay 3 Lower Drawer"
          width={0.82}
          height={0.20}
          depth={0.48}
          position={[0, -0.46, 0]}
          isOpen={state.bottomDrawerOpen || state.drawersOpen}
          onToggle={() =>
            onUpdateState({ bottomDrawerOpen: !(state.bottomDrawerOpen || state.drawersOpen) })
          }
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          woodTexture={woodTexture}
          frontType="wood"
          handleStyle="horizontal-bar"
        />

        {/* Shelf below drawers */}
        <mesh position={[0, -0.58, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower Chrome Wire Basket */}
        <WireBasket position={[0, -0.92, 0]} width={0.78} height={0.18} depth={0.46} />
      </group>

      {/* ========================================================= */}
      {/* 6. BAY 4: RIGHT BAY (+1.32m)                               */}
      {/* Top shelf + box, blazers, 6-cubby unit with yellow towels */}
      {/* ========================================================= */}
      <group position={[1.32, 0, 0]}>
        {/* Top shelf */}
        <mesh position={[0, 0.82, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.85, 0]} color="#7E2632" width={0.42} height={0.22} />

        {/* Hanging Rail & Blazers */}
        <mesh position={[0, 0.68, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.84, 16]} />
        </mesh>
        <GarmentHanger type="suit" color="#1E2023" position={[-0.24, 0.68, 0]} />
        <GarmentHanger type="coat" color="#2C2E33" position={[-0.08, 0.68, 0]} />
        <GarmentHanger type="suit" color="#1A1B1D" position={[0.08, 0.68, 0]} />
        <GarmentHanger type="coat" color="#3B3530" position={[0.24, 0.68, 0]} />

        {/* Mid Shelf */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower 6-Cubby Accessories Tower (Reference 1 right side) */}
        {/* 2 Vertical divider boards */}
        <mesh position={[-0.14, -0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        <mesh position={[0.14, -0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        {/* Horizontal divider shelves */}
        <mesh position={[0, -0.45, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.1]} />
        </mesh>
        <mesh position={[0, -0.75, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.85, boardThickness, totalD - 0.1]} />
        </mesh>

        {/* Rolled & Folded Luxury Yellow Towels (Matching Ref 1 exactly!) */}
        <RolledTowel position={[-0.28, -0.32, 0]} color="#D4A72C" />
        <RolledTowel position={[0, -0.32, 0]} color="#D4A72C" />
        <RolledTowel position={[0.28, -0.32, 0]} color="#D4A72C" />
        <FoldedTowels position={[-0.28, -0.65, 0]} color="#D4A72C" count={2} />
        <FoldedTowels position={[0, -0.65, 0]} color="#D4A72C" count={2} />
        <FoldedTowels position={[0.28, -0.65, 0]} color="#D4A72C" count={2} />
        <RolledTowel position={[-0.28, -0.92, 0]} color="#D4A72C" />
        <RolledTowel position={[0, -0.92, 0]} color="#D4A72C" />
        <RolledTowel position={[0.28, -0.92, 0]} color="#D4A72C" />
      </group>

      {/* ========================================================= */}
      {/* 7. EXTERIOR SLIDING DOOR PANEL (Visible on Left in Ref 1) */}
      {/* ========================================================= */}
      <SlidingDoor
        id="modular.door.left"
        name="Exterior Sliding Frosted Screen"
        width={1.05}
        height={2.32}
        closedX={-1.32}
        openOffset={1.5}
        trackZ={totalD / 2 + 0.02}
        isOpen={state.leftDoorOpen || state.bothDoorsOpen}
        onToggle={() =>
          onUpdateState({
            leftDoorOpen: !(state.leftDoorOpen || state.bothDoorsOpen),
            bothDoorsOpen: false,
          })
        }
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        hasBands={false}
      />
    </group>
  );
}

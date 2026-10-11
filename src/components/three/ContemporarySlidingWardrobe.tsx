"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { SlidingDoor } from "./SlidingDoor";
import { Drawer } from "./Drawer";
import { GarmentHanger, FoldedTowels, RolledTowel, StorageBox } from "./GarmentHanger";
import {
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
  WardrobeInteractionState,
} from "@/types/wardrobe";

interface ContemporarySlidingWardrobeProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodTexture?: THREE.CanvasTexture | null;
}

export function ContemporarySlidingWardrobe({
  state,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: ContemporarySlidingWardrobeProps) {
  // PBR Materials for carcass & framework
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
      color: "#D8D4CC",
      roughness: 0.9,
    });
  }, []);

  const pbrRailMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: 0.25,
      metalness: 0.9,
    });
  }, [frameMaterial]);

  const pbrLedMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#FFF2D6",
      emissive: state.shelfLedsOn ? "#FFD992" : "#000000",
      emissiveIntensity: state.shelfLedsOn ? 1.5 : 0,
      roughness: 0.2,
    });
  }, [state.shelfLedsOn]);

  // Overall dimensions: W: 3.0m, H: 2.4m, D: 0.6m
  const totalW = 3.0;
  const totalH = 2.4;
  const totalD = 0.6;
  const boardThickness = 0.020; // Authentic 20mm furniture board

  // Door widths & tracks (Bypass sliding doors)
  const doorW = 1.52;
  const doorH = 2.34;

  return (
    <group position={[0, totalH / 2, 0]}>
      {/* ========================================================= */}
      {/* 1. OUTER CARCASS & ENCLOSURE (Reference Image 3)          */}
      {/* ========================================================= */}

      {/* Recessed Back Wall Panel */}
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

      {/* Left Outer Gable End */}
      <mesh
        position={[-totalW / 2 + boardThickness / 2, 0, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardThickness, totalH, totalD]} />
      </mesh>

      {/* Right Outer Gable End */}
      <mesh
        position={[totalW / 2 - boardThickness / 2, 0, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[boardThickness, totalH, totalD]} />
      </mesh>

      {/* Architectural Slim Outer Frame Trim (Black Aluminium Border) */}
      <mesh position={[0, totalH / 2 - 0.014, totalD / 2 + 0.008]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.028, 0.035]} />
      </mesh>
      <mesh position={[0, -totalH / 2 + 0.014, totalD / 2 + 0.008]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.028, 0.035]} />
      </mesh>
      <mesh position={[-totalW / 2 - 0.014, 0, totalD / 2 + 0.008]} material={pbrFrameMat}>
        <boxGeometry args={[0.028, totalH + 0.04, 0.035]} />
      </mesh>
      <mesh position={[totalW / 2 + 0.014, 0, totalD / 2 + 0.008]} material={pbrFrameMat}>
        <boxGeometry args={[0.028, totalH + 0.04, 0.035]} />
      </mesh>

      {/* Proper Dual Top Sliding Track Profile with Recessed Channels */}
      <group position={[0, totalH / 2 - 0.028, totalD / 2 - 0.02]}>
        {/* Track header plate */}
        <mesh material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.022, 0.09]} />
        </mesh>
        {/* Front track channel groove */}
        <mesh position={[0, -0.012, 0.02]} material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.006, 0.012]} />
        </mesh>
        {/* Rear track channel groove */}
        <mesh position={[0, -0.012, -0.02]} material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.006, 0.012]} />
        </mesh>
      </group>

      {/* Proper Dual Bottom Floor Track Profile */}
      <mesh position={[0, -totalH / 2 + 0.018, totalD / 2 - 0.02]} material={pbrFrameMat}>
        <boxGeometry args={[totalW - 0.04, 0.012, 0.09]} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. INTERNAL PARTITIONS & DIVIDERS                         */}
      {/* ========================================================= */}

      {/* Left Center Partition (between Left Bay and Central Tower) */}
      <mesh position={[-0.41, 0, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.06]} />
      </mesh>

      {/* Right Center Partition (between Central Tower and Right Bay) */}
      <mesh position={[0.41, 0, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.06]} />
      </mesh>

      {/* Vertical Concealed Ambient LED Channels */}
      <mesh position={[-0.395, 0, 0.22]} material={pbrLedMat}>
        <boxGeometry args={[0.006, totalH - 0.1, 0.01]} />
      </mesh>
      <mesh position={[0.395, 0, 0.22]} material={pbrLedMat}>
        <boxGeometry args={[0.006, totalH - 0.1, 0.01]} />
      </mesh>

      {/* ========================================================= */}
      {/* 3. CENTRAL STORAGE MODULE (Reference Image 3 Signature)    */}
      {/* 6 Cubbies (2 cols x 3 tiers) + 2 Wooden Drawers + Plinth  */}
      {/* ========================================================= */}

      {/* Central Division Vertical Board for Cubbies */}
      <mesh position={[0, 0.42, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, 0.72, totalD - 0.08]} />
      </mesh>

      {/* Horizontal Shelves for 6 Cubbies */}
      {/* Shelf above cubbies */}
      <mesh position={[0, 0.78, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>
      {/* Cubby divider shelf 1 (upper) */}
      <mesh position={[0, 0.54, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>
      {/* Cubby divider shelf 2 (lower) */}
      <mesh position={[0, 0.30, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>
      {/* Shelf separating cubbies from drawers */}
      <mesh position={[0, 0.06, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Upper Top Storage Hat Compartment above Central Cubbies */}
      <mesh position={[0, 0.95, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Central Items in Cubbies (Reference Image 3 details) */}
      <RolledTowel position={[-0.2, 0.42, 0]} color="#D4B48A" />
      <RolledTowel position={[-0.2, 0.18, 0]} color="#C5A059" />
      <FoldedTowels position={[0.2, 0.32, 0]} color="#FFFFFF" count={3} />
      <FoldedTowels position={[0.2, 0.08, 0]} color="#DFD9D0" count={2} />

      {/* TWO INTERACTIVE WOODEN DRAWERS (Reference Image 3) */}
      {/* Top Drawer */}
      <Drawer
        id="central.drawer.top"
        name="Central Upper Soft-Close Drawer"
        width={0.78}
        height={0.21}
        depth={0.48}
        position={[0, -0.06, 0]}
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

      {/* Bottom Drawer */}
      <Drawer
        id="central.drawer.bottom"
        name="Central Deep Base Drawer"
        width={0.78}
        height={0.25}
        depth={0.48}
        position={[0, -0.31, 0]}
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
      <mesh position={[0, -0.46, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[0.80, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Open Base Plinth Elevation with Sleek Frame Feet (Reference 3) */}
      <group position={[0, -0.56, 0]}>
        {/* Plinth support bar */}
        <mesh position={[0, 0, totalD / 2 - 0.12]} material={pbrFrameMat}>
          <boxGeometry args={[0.76, 0.015, 0.02]} />
        </mesh>
        <FoldedTowels position={[0, 0.02, 0]} color="#A39382" count={2} />
      </group>

      {/* ========================================================= */}
      {/* 4. LEFT WARDROBE COMPARTMENT (Hanging Bay)                 */}
      {/* ========================================================= */}
      {/* Left Top Shelf */}
      <mesh position={[-0.96, 0.78, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[1.06, boardThickness, totalD - 0.08]} />
      </mesh>
      <StorageBox position={[-0.96, 0.81, 0]} color="#4A3B32" width={0.42} height={0.22} />

      {/* Left Garment Hanging Rail */}
      <mesh
        position={[-0.96, 0.65, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={pbrRailMat}
        castShadow
      >
        <cylinderGeometry args={[0.015, 0.015, 1.05, 16]} />
      </mesh>

      {/* Hung Tailored Garments in Left Bay */}
      <GarmentHanger type="dress" color="#B0ABA0" position={[-1.28, 0.65, 0]} />
      <GarmentHanger type="coat" color="#2E3338" position={[-1.12, 0.65, 0]} />
      <GarmentHanger type="suit" color="#1F2022" position={[-0.96, 0.65, 0]} />
      <GarmentHanger type="shirt" color="#EBE7DF" position={[-0.80, 0.65, 0]} />
      <GarmentHanger type="shirt" color="#3E4249" position={[-0.64, 0.65, 0]} />

      {/* Left Bottom Shelf */}
      <mesh position={[-0.96, -0.55, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[1.06, boardThickness, totalD - 0.08]} />
      </mesh>
      <FoldedTowels position={[-0.96, -0.52, 0]} color="#C5A059" count={3} />

      {/* ========================================================= */}
      {/* 5. RIGHT WARDROBE COMPARTMENT (Hanging Bay)                */}
      {/* ========================================================= */}
      {/* Right Top Shelf */}
      <mesh position={[0.96, 0.78, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[1.06, boardThickness, totalD - 0.08]} />
      </mesh>
      <StorageBox position={[0.96, 0.81, 0]} color="#682E38" width={0.42} height={0.22} />

      {/* Right Garment Hanging Rail */}
      <mesh
        position={[0.96, 0.65, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={pbrRailMat}
        castShadow
      >
        <cylinderGeometry args={[0.015, 0.015, 1.05, 16]} />
      </mesh>

      {/* Hung Tailored Garments in Right Bay */}
      <GarmentHanger type="suit" color="#1E1E20" position={[0.64, 0.65, 0]} />
      <GarmentHanger type="suit" color="#2B2D31" position={[0.80, 0.65, 0]} />
      <GarmentHanger type="shirt" color="#F0ECE4" position={[0.96, 0.65, 0]} />
      <GarmentHanger type="coat" color="#342822" position={[1.12, 0.65, 0]} />
      <GarmentHanger type="shirt" color="#6C757D" position={[1.28, 0.65, 0]} />

      {/* Right Mid / Lower Shelf */}
      <mesh position={[0.96, -0.45, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[1.06, boardThickness, totalD - 0.08]} />
      </mesh>
      <FoldedTowels position={[0.96, -0.42, 0]} color="#EDE8DF" count={3} />

      {/* ========================================================= */}
      {/* 6. DUAL SLIDING DOORS (Reference Image 3 Signature)        */}
      {/* Left Door & Right Door sliding on parallel tracks          */}
      {/* ========================================================= */}

      {/* Left Sliding Door (Front Track at Z = 0.312) */}
      <SlidingDoor
        id="sliding.door.left"
        name="Left Sliding Door Panel"
        width={doorW}
        height={doorH}
        closedX={-doorW / 2 + 0.02}
        openOffset={-1.25}
        trackZ={totalD / 2 + 0.012}
        isOpen={state.leftDoorOpen || state.bothDoorsOpen}
        onToggle={() =>
          onUpdateState({
            leftDoorOpen: !(state.leftDoorOpen || state.bothDoorsOpen),
            bothDoorsOpen: false,
          })
        }
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        hasBands={true}
      />

      {/* Right Sliding Door (Rear Track at Z = 0.276) */}
      <SlidingDoor
        id="sliding.door.right"
        name="Right Sliding Door Panel"
        width={doorW}
        height={doorH}
        closedX={doorW / 2 - 0.02}
        openOffset={1.25}
        trackZ={totalD / 2 - 0.024}
        isOpen={state.rightDoorOpen || state.bothDoorsOpen}
        onToggle={() =>
          onUpdateState({
            rightDoorOpen: !(state.rightDoorOpen || state.bothDoorsOpen),
            bothDoorsOpen: false,
          })
        }
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        hasBands={true}
      />
    </group>
  );
}

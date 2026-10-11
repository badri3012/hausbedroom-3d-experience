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

  // Recessed back wall material: warm neutral shadow backing
  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#D2CCC2",
      roughness: 0.92,
    });
  }, []);

  // Dark charcoal recessed backing for central cubbies & top alcove (Reference Image 3)
  const pbrDarkAlcoveMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#2C2D30",
      roughness: 0.88,
      metalness: 0.05,
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
      color: "#FFF5DC",
      emissive: state.shelfLedsOn ? "#FFDCA2" : "#000000",
      emissiveIntensity: state.shelfLedsOn ? 1.6 : 0,
      roughness: 0.2,
    });
  }, [state.shelfLedsOn]);

  // Overall dimensions matching Reference 3 proportions: W: 3.0m, H: 2.4m, D: 0.60m
  const totalW = 3.0;
  const totalH = 2.4;
  const totalD = 0.60;
  const boardThickness = 0.020; // Authentic 20mm furniture board

  // Layout partition coordinates:
  // Center Bay: X = -0.42 to +0.42 (width = 0.84m)
  // Left Bay: X = -1.50 to -0.42 (width = 1.08m)
  // Right Bay: X = +0.42 to +1.50 (width = 1.08m)
  const centerPartitionX = 0.42;
  const centralBayW = centerPartitionX * 2; // 0.84m
  const sideBayW = totalW / 2 - centerPartitionX; // 1.08m

  // Door dimensions matching Reference 3:
  // In the photograph, Left Door covers Left Bay, Right Door covers Right Bay,
  // leaving the Central Bay completely exposed.
  // Each door is ~1.14m wide (covers side bay + 60mm overlap with center partition).
  const doorW = 1.14;
  const doorH = 2.34;

  // Parked X positions (Photographed Reference 3 default state):
  const leftDoorParkedX = -totalW / 2 + doorW / 2; // -1.50 + 0.57 = -0.93m
  const rightDoorParkedX = totalW / 2 - doorW / 2; // +1.50 - 0.57 = +0.93m

  // Sliding offset when slid to center:
  // Left Door slides from -0.93m to 0.0m (slide delta = +0.93m)
  // Right Door slides from +0.93m to 0.0m (slide delta = -0.93m)
  const leftSlideDelta = Math.abs(leftDoorParkedX);
  const rightSlideDelta = -Math.abs(rightDoorParkedX);

  // Parallel bypass tracks:
  // Front Track at Z = +0.316m (Left Door)
  // Rear Track at Z = +0.276m (Right Door)
  const frontTrackZ = totalD / 2 + 0.016;
  const rearTrackZ = totalD / 2 - 0.024;

  return (
    <group position={[0, totalH / 2, 0]}>
      {/* ========================================================= */}
      {/* 1. OUTER CARCASS & ARCHITECTURAL TRIM (Reference 3)       */}
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

      {/* Architectural Outer Frame Trim (Crisp Black Aluminium Border as in Ref 3) */}
      <mesh position={[0, totalH / 2 - 0.014, totalD / 2 + 0.012]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.028, 0.04]} />
      </mesh>
      <mesh position={[0, -totalH / 2 + 0.014, totalD / 2 + 0.012]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.028, 0.04]} />
      </mesh>
      <mesh position={[-totalW / 2 - 0.014, 0, totalD / 2 + 0.012]} material={pbrFrameMat}>
        <boxGeometry args={[0.028, totalH + 0.04, 0.04]} />
      </mesh>
      <mesh position={[totalW / 2 + 0.014, 0, totalD / 2 + 0.012]} material={pbrFrameMat}>
        <boxGeometry args={[0.028, totalH + 0.04, 0.04]} />
      </mesh>

      {/* Proper Dual Top Sliding Track Profile with Bypass Channels */}
      <group position={[0, totalH / 2 - 0.028, totalD / 2 - 0.005]}>
        {/* Track header casing */}
        <mesh material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.024, 0.095]} />
        </mesh>
        {/* Front track channel groove */}
        <mesh position={[0, -0.013, 0.021]} material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.006, 0.014]} />
        </mesh>
        {/* Rear track channel groove */}
        <mesh position={[0, -0.013, -0.019]} material={pbrFrameMat}>
          <boxGeometry args={[totalW - 0.04, 0.006, 0.014]} />
        </mesh>
      </group>

      {/* Dual Bottom Floor Track Profile */}
      <mesh position={[0, -totalH / 2 + 0.018, totalD / 2 - 0.005]} material={pbrFrameMat}>
        <boxGeometry args={[totalW - 0.04, 0.014, 0.095]} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. INTERNAL PARTITIONS & DIVIDERS                         */}
      {/* ========================================================= */}

      {/* Left Center Partition (between Left Bay and Central Tower) */}
      <mesh position={[-centerPartitionX, 0, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.06]} />
      </mesh>

      {/* Right Center Partition (between Central Tower and Right Bay) */}
      <mesh position={[centerPartitionX, 0, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.06]} />
      </mesh>

      {/* Vertical Concealed Ambient Warm LED Channels */}
      <mesh position={[-centerPartitionX + 0.012, 0, 0.22]} material={pbrLedMat}>
        <boxGeometry args={[0.006, totalH - 0.1, 0.01]} />
      </mesh>
      <mesh position={[centerPartitionX - 0.012, 0, 0.22]} material={pbrLedMat}>
        <boxGeometry args={[0.006, totalH - 0.1, 0.01]} />
      </mesh>

      {/* ========================================================= */}
      {/* 3. CENTRAL STORAGE TOWER (Reference Image 3 Signature)    */}
      {/* - Top Dark Recessed Compartment                           */}
      {/* - 6 Cubbies (2 cols x 3 tiers) with Natural Oak Grid      */}
      {/* - Open Horizontal Shelf Space                             */}
      {/* - 2 Wooden Drawers with Horizontal Silver Handles        */}
      {/* - Open Base with Suspended Oak Slat Shelf                 */}
      {/* ========================================================= */}

      {/* A. Top Dark Recessed Compartment Backing Panel */}
      <mesh position={[0, 1.01, -totalD / 2 + 0.012]} material={pbrDarkAlcoveMat}>
        <boxGeometry args={[centralBayW - boardThickness * 2, 0.32, 0.01]} />
      </mesh>

      {/* Shelf separating top dark compartment from 6 cubbies */}
      <mesh position={[0, 0.86, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* B. 6 Cubbies Backing Wall (Dark Graphite contrast backing) */}
      <mesh position={[0, 0.50, -totalD / 2 + 0.012]} material={pbrDarkAlcoveMat}>
        <boxGeometry args={[centralBayW - boardThickness * 2, 0.72, 0.01]} />
      </mesh>

      {/* Central Division Vertical Board for 6 Cubbies (2 columns) */}
      <mesh position={[0, 0.50, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, 0.72, totalD - 0.08]} />
      </mesh>

      {/* Cubby divider shelf 1 (upper tier) */}
      <mesh position={[0, 0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Cubby divider shelf 2 (lower tier) */}
      <mesh position={[0, 0.38, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Bottom shelf plate of 6 cubbies */}
      <mesh position={[0, 0.14, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* Staged Items inside the 6 Cubbies (Reference Image 3 details) */}
      <RolledTowel position={[-0.20, 0.44, 0]} color="#D4B48A" />
      <RolledTowel position={[-0.20, 0.20, 0]} color="#C5A059" />
      <FoldedTowels position={[0.20, 0.39, 0]} color="#FFFFFF" count={3} />
      <FoldedTowels position={[0.20, 0.15, 0]} color="#E2DDD5" count={2} />

      {/* C. Open Horizontal Shelf Tier Below Cubbies */}
      <mesh position={[0, -0.04, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* D. TWO STACKED NATURAL OAK DRAWERS (Reference Image 3) */}
      {/* Top Drawer with Brushed Silver Horizontal Handle */}
      <Drawer
        id="central.drawer.top"
        name="Central Upper Soft-Close Drawer"
        width={0.78}
        height={0.20}
        depth={0.48}
        position={[0, -0.15, 0]}
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

      {/* Bottom Drawer (Slightly deeper, matching Reference 3 photo) */}
      <Drawer
        id="central.drawer.bottom"
        name="Central Deep Base Drawer"
        width={0.78}
        height={0.24}
        depth={0.48}
        position={[0, -0.39, 0]}
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

      {/* Shelf board below bottom drawer */}
      <mesh position={[0, -0.53, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[centralBayW - boardThickness * 2, boardThickness, totalD - 0.08]} />
      </mesh>

      {/* E. Open Bottom Niche & Suspended Slatted Shoe/Bag Shelf (Reference 3) */}
      <group position={[0, -0.96, 0]}>
        {/* Suspended Oak Slat Shelf */}
        <mesh position={[0, 0, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.78, boardThickness, totalD - 0.10]} />
        </mesh>
        {/* Slim matte black riser posts / legs connecting down to base */}
        <mesh position={[-0.37, -0.11, totalD / 2 - 0.12]} material={pbrFrameMat}>
          <boxGeometry args={[0.016, 0.22, 0.016]} />
        </mesh>
        <mesh position={[0.37, -0.11, totalD / 2 - 0.12]} material={pbrFrameMat}>
          <boxGeometry args={[0.016, 0.22, 0.016]} />
        </mesh>
        <mesh position={[-0.37, -0.11, -totalD / 2 + 0.12]} material={pbrFrameMat}>
          <boxGeometry args={[0.016, 0.22, 0.016]} />
        </mesh>
        <mesh position={[0.37, -0.11, -totalD / 2 + 0.12]} material={pbrFrameMat}>
          <boxGeometry args={[0.016, 0.22, 0.016]} />
        </mesh>
        {/* Staged folded leather/neutral linens on bottom shelf */}
        <FoldedTowels position={[0, 0.02, 0]} color="#9E8D7D" count={2} />
      </group>

      {/* ========================================================= */}
      {/* 4. LEFT WARDROBE COMPARTMENT (Hanging Bay)                 */}
      {/* ========================================================= */}
      {/* Left Top Shelf */}
      <mesh position={[-0.96, 0.86, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[sideBayW - boardThickness, boardThickness, totalD - 0.08]} />
      </mesh>
      <StorageBox position={[-0.96, 0.99, 0]} color="#4A3B32" width={0.42} height={0.22} />

      {/* Left Garment Hanging Rail */}
      <mesh
        position={[-0.96, 0.72, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={pbrRailMat}
        castShadow
      >
        <cylinderGeometry args={[0.014, 0.014, sideBayW - boardThickness - 0.02, 16]} />
      </mesh>

      {/* Hung Tailored Garments in Left Bay */}
      <GarmentHanger type="dress" color="#B0ABA0" position={[-1.28, 0.72, 0]} />
      <GarmentHanger type="coat" color="#2E3338" position={[-1.12, 0.72, 0]} />
      <GarmentHanger type="suit" color="#1F2022" position={[-0.96, 0.72, 0]} />
      <GarmentHanger type="shirt" color="#EBE7DF" position={[-0.80, 0.72, 0]} />
      <GarmentHanger type="shirt" color="#3E4249" position={[-0.64, 0.72, 0]} />

      {/* Left Bottom Shelf */}
      <mesh position={[-0.96, -0.53, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[sideBayW - boardThickness, boardThickness, totalD - 0.08]} />
      </mesh>
      <FoldedTowels position={[-0.96, -0.50, 0]} color="#C5A059" count={3} />

      {/* ========================================================= */}
      {/* 5. RIGHT WARDROBE COMPARTMENT (Hanging Bay)                */}
      {/* ========================================================= */}
      {/* Right Top Shelf */}
      <mesh position={[0.96, 0.86, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[sideBayW - boardThickness, boardThickness, totalD - 0.08]} />
      </mesh>
      <StorageBox position={[0.96, 0.99, 0]} color="#682E38" width={0.42} height={0.22} />

      {/* Right Garment Hanging Rail */}
      <mesh
        position={[0.96, 0.72, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={pbrRailMat}
        castShadow
      >
        <cylinderGeometry args={[0.014, 0.014, sideBayW - boardThickness - 0.02, 16]} />
      </mesh>

      {/* Hung Tailored Garments in Right Bay */}
      <GarmentHanger type="suit" color="#1E1E20" position={[0.64, 0.72, 0]} />
      <GarmentHanger type="suit" color="#2B2D31" position={[0.80, 0.72, 0]} />
      <GarmentHanger type="shirt" color="#F0ECE4" position={[0.96, 0.72, 0]} />
      <GarmentHanger type="coat" color="#342822" position={[1.12, 0.72, 0]} />
      <GarmentHanger type="shirt" color="#6C757D" position={[1.28, 0.72, 0]} />

      {/* Right Lower Shelf */}
      <mesh position={[0.96, -0.53, 0]} material={pbrWoodMat} castShadow receiveShadow>
        <boxGeometry args={[sideBayW - boardThickness, boardThickness, totalD - 0.08]} />
      </mesh>
      <FoldedTowels position={[0.96, -0.50, 0]} color="#EDE8DF" count={3} />

      {/* ========================================================= */}
      {/* 6. DUAL SLIDING DOORS (Reference Image 3 Signature)        */}
      {/* In the default photographed state, both doors are PARKED   */}
      {/* at the outer left and right, leaving the center exposed!  */}
      {/* Left Door is on the Front Track (Z = +0.316)              */}
      {/* Right Door is on the Rear Track (Z = +0.276)              */}
      {/* ========================================================= */}

      {/* Left Sliding Door (Front Track) */}
      <SlidingDoor
        id="sliding.door.left"
        name="Left Sliding Door Panel"
        width={doorW}
        height={doorH}
        closedX={leftDoorParkedX}
        openOffset={leftSlideDelta}
        trackZ={frontTrackZ}
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
        handleSide="right"
      />

      {/* Right Sliding Door (Rear Track) */}
      <SlidingDoor
        id="sliding.door.right"
        name="Right Sliding Door Panel"
        width={doorW}
        height={doorH}
        closedX={rightDoorParkedX}
        openOffset={rightSlideDelta}
        trackZ={rearTrackZ}
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
        handleSide="left"
      />
    </group>
  );
}

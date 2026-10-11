"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Drawer } from "./Drawer";
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

/**
 * RECONSTRUCTED FULL MODULAR BUILT-IN WARDROBE (Reference Image 1)
 *
 * ARCHITECTURAL COMPOSITION:
 * - LEFT SIDE: Large grey sliding panel with dark aluminium framing and multiple horizontal subdivisions.
 *              Parked on the LEFT in the reference presentation state.
 * - RIGHT SIDE: Four (4) distinct open modular bays with thin metallic vertical supports:
 *   - Bay 1: Upper Burgundy box, 3 white dresses on wooden hangers, 4-cubby unit with yellow luxury towels.
 *   - Bay 2: Upper Burgundy box, 3 dark tailored suits, dual solid oak drawers, lower pull-out wire basket with linens.
 *   - Bay 3: Upper Burgundy box, 4 dark shirts, dual solid oak drawers, lower pull-out wire basket with linens.
 *   - Bay 4: Upper Burgundy box & luggage, 4 dark blazers, 6-cubby unit with yellow luxury towels & accessories.
 */
export function FullModularWardrobe({
  state,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: FullModularWardrobeProps) {
  // PBR Materials
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

  // Thin metallic upright pillar material (Silver / Champagne anodized aluminium in Ref 1)
  const pbrPillarMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#9EA4AA",
      roughness: 0.28,
      metalness: 0.88,
      envMapIntensity: 1.1,
    });
  }, []);

  const pbrRailMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#A2A7AD",
      roughness: 0.22,
      metalness: 0.92,
    });
  }, []);

  const pbrBackWallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#D8D3CA",
      roughness: 0.92,
    });
  }, []);

  // Frosted grey satin privacy glass material for the large sliding door panel
  const pbrFrostedGlassMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#7E858D", // Slate grey satin tone as seen in Reference 1
      roughness: 0.68,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92,
      depthWrite: true,
    });
  }, []);

  // Total wardrobe physical bounds (5 modules: 1 left door zone + 4 open bays)
  const totalW = 4.30;
  const totalH = 2.40;
  const totalD = 0.60;
  const boardThickness = 0.022;

  // Horizontal module layout:
  // Left Zone (Door parked): X from -2.15m to -1.07m (Width 1.08m, Center = -1.61m)
  // Bay 1: X from -1.07m to -0.27m (Width 0.80m, Center = -0.67m)
  // Bay 2: X from -0.27m to +0.53m (Width 0.80m, Center = +0.13m)
  // Bay 3: X from +0.53m to +1.33m (Width 0.80m, Center = +0.93m)
  // Bay 4: X from +1.33m to +2.13m (Width 0.80m, Center = +1.73m)
  const doorWidth = 1.08;
  const doorHeight = 2.34;
  const doorParkedX = -1.61;
  const doorSlidX = -0.67; // slides right across track to cover Bay 1 and reveal left recess

  // Animated sliding door ref
  const doorRef = useRef<THREE.Group>(null);
  const isDoorSlid = state.leftDoorOpen || state.bothDoorsOpen;

  useFrame((_, delta) => {
    if (!doorRef.current) return;
    const targetX = isDoorSlid ? doorSlidX : doorParkedX;
    const nextX = THREE.MathUtils.lerp(
      doorRef.current.position.x,
      targetX,
      Math.min(1, delta * 6.0)
    );
    doorRef.current.position.x =
      Math.abs(nextX - targetX) < 0.0005 ? targetX : nextX;
  });

  return (
    <group position={[0, totalH / 2, 0]}>
      {/* ========================================================= */}
      {/* 1. BACK RECESS & CONTINUOUS ARCHITECTURAL HEADER/BASE     */}
      {/* ========================================================= */}

      {/* Recessed Back Wall */}
      <mesh position={[0, 0, -totalD / 2 + 0.005]} material={pbrBackWallMat} receiveShadow>
        <boxGeometry args={[totalW, totalH, 0.01]} />
      </mesh>

      {/* Continuous Top Header Shelf */}
      <mesh
        position={[0, totalH / 2 - boardThickness / 2, 0]}
        material={pbrWoodMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[totalW, boardThickness, totalD]} />
      </mesh>

      {/* Continuous Floor Base Panel */}
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

      {/* Continuous Upper and Lower Sliding Tracks across entire 4.30m width */}
      <mesh position={[0, totalH / 2 - 0.026, totalD / 2 + 0.018]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.032, 0.075]} />
      </mesh>
      <mesh position={[0, -totalH / 2 + 0.016, totalD / 2 + 0.018]} material={pbrFrameMat}>
        <boxGeometry args={[totalW + 0.04, 0.020, 0.075]} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. THIN METALLIC STRUCTURAL UPRIGHT PILLARS (Reference 1) */}
      {/* Extruded pillars with mounting brackets and floor feet     */}
      {/* ========================================================= */}
      {[-1.07, -0.27, 0.53, 1.33].map((xPos, idx) => (
        <group key={idx} position={[xPos, 0, totalD / 2 - 0.04]}>
          {/* Vertical Aluminium Pillar Post */}
          <mesh material={pbrPillarMat} castShadow>
            <boxGeometry args={[0.026, totalH - 0.05, 0.038]} />
          </mesh>
          {/* Top ceiling mounting bracket */}
          <mesh position={[0, totalH / 2 - 0.04, 0]} material={pbrPillarMat}>
            <boxGeometry args={[0.045, 0.035, 0.06]} />
          </mesh>
          {/* Bottom floor foot plate */}
          <mesh position={[0, -totalH / 2 + 0.035, 0]} material={pbrPillarMat}>
            <boxGeometry args={[0.045, 0.025, 0.06]} />
          </mesh>
          {/* Rear wood partition board behind post */}
          <mesh position={[0, 0, -totalD / 2 + 0.06]} material={pbrWoodMat} castShadow receiveShadow>
            <boxGeometry args={[boardThickness, totalH - boardThickness * 2, totalD - 0.08]} />
          </mesh>
        </group>
      ))}

      {/* ========================================================= */}
      {/* 3. LEFT ZONE: RECESSED INTERIOR BEHIND SLIDING DOOR       */}
      {/* (Revealed when the sliding door glides to the right)      */}
      {/* ========================================================= */}
      <group position={[-1.61, 0, 0]}>
        {/* Upper Storage Shelf */}
        <mesh position={[0, 0.84, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[1.04, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[-0.24, 0.87, 0]} color="#8A252E" width={0.42} height={0.22} />
        <StorageBox position={[0.24, 0.87, 0]} color="#2A2D32" width={0.42} height={0.22} />

        {/* Hanging Rail & Garments */}
        <mesh position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 1.02, 16]} />
        </mesh>
        <GarmentHanger type="coat" color="#3B3530" position={[-0.32, 0.70, 0]} />
        <GarmentHanger type="suit" color="#1F2124" position={[-0.10, 0.70, 0]} />
        <GarmentHanger type="shirt" color="#4A525D" position={[0.10, 0.70, 0]} />
        <GarmentHanger type="coat" color="#26282B" position={[0.32, 0.70, 0]} />

        {/* Mid Shelf */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[1.04, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower Shelf & Travel Linens */}
        <mesh position={[0, -0.62, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[1.04, boardThickness, totalD - 0.08]} />
        </mesh>
        <FoldedTowels position={[-0.28, -0.58, 0]} color="#E5DFC8" count={3} />
        <FoldedTowels position={[0.28, -0.58, 0]} color="#E5DFC8" count={3} />
      </group>

      {/* ========================================================= */}
      {/* 4. BAY 1: FIRST OPEN BAY (Leftmost of the 4 open bays)     */}
      {/* Upper Burgundy box, 3 white dresses, 4-cubby yellow towels*/}
      {/* ========================================================= */}
      <group position={[-0.67, 0, 0]}>
        {/* Top Upper Shelf with Red Box */}
        <mesh position={[0, 0.84, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.87, 0]} color="#8A252E" width={0.42} height={0.22} />

        {/* Hanging Rail & 3 White/Pale Grey Dresses (Reference 1) */}
        <mesh position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.76, 16]} />
        </mesh>
        <GarmentHanger type="dress" color="#F6F4EE" position={[-0.22, 0.70, 0]} />
        <GarmentHanger type="dress" color="#EDE7DB" position={[0, 0.70, 0]} />
        <GarmentHanger type="dress" color="#DFD8CA" position={[0.22, 0.70, 0]} />

        {/* Mid Divider Shelf */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower 4-Cubby Unit (2x2 grid, matching Reference 1) */}
        {/* Vertical center divider */}
        <mesh position={[0, -0.64, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        {/* Horizontal middle shelf */}
        <mesh position={[0, -0.64, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.1]} />
        </mesh>

        {/* Cubby Accessories & Yellow Towels */}
        {/* Top-Left: Folded luxury yellow towels */}
        <FoldedTowels position={[-0.19, -0.58, 0]} color="#E0AA24" count={3} />
        {/* Top-Right: Pale storage box */}
        <StorageBox position={[0.19, -0.60, 0]} color="#F0ECE1" width={0.26} height={0.18} depth={0.34} />
        {/* Bottom-Left: Dark accessory case */}
        <StorageBox position={[-0.19, -0.92, 0]} color="#38302A" width={0.26} height={0.18} depth={0.34} />
        {/* Bottom-Right: Rolled yellow towels */}
        <RolledTowel position={[0.19, -0.86, 0]} color="#E0AA24" />
      </group>

      {/* ========================================================= */}
      {/* 5. BAY 2: SECOND OPEN BAY                                 */}
      {/* Upper Burgundy box, 3 dark suits, 2 drawers, wire basket  */}
      {/* ========================================================= */}
      <group position={[0.13, 0, 0]}>
        {/* Top Shelf with Red Box */}
        <mesh position={[0, 0.84, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.87, 0]} color="#8A252E" width={0.42} height={0.22} />

        {/* Hanging Rail & 3 Tailored Dark Suits (Reference 1) */}
        <mesh position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.76, 16]} />
        </mesh>
        <GarmentHanger type="suit" color="#202226" position={[-0.22, 0.70, 0]} />
        <GarmentHanger type="suit" color="#2C3037" position={[0, 0.70, 0]} />
        <GarmentHanger type="coat" color="#3B3834" position={[0.22, 0.70, 0]} />

        {/* Shelf separating hanging section from drawers */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Two Soft-Close Solid Oak Drawers */}
        <Drawer
          id="bay2.drawer.top"
          name="Bay 2 Upper Drawer"
          width={0.76}
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
          width={0.76}
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
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower Chrome Wire Laundry Basket Drawer with Folded Linens */}
        <WireBasket position={[0, -0.92, 0]} width={0.74} height={0.17} depth={0.46} />
      </group>

      {/* ========================================================= */}
      {/* 6. BAY 3: THIRD OPEN BAY                                  */}
      {/* Upper Burgundy box, 4 dark shirts, 2 drawers, wire basket */}
      {/* ========================================================= */}
      <group position={[0.93, 0, 0]}>
        {/* Top Shelf with Red Box */}
        <mesh position={[0, 0.84, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[0, 0.87, 0]} color="#8A252E" width={0.42} height={0.22} />

        {/* Hanging Rail & 4 Dark Shirts (Reference 1) */}
        <mesh position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.76, 16]} />
        </mesh>
        <GarmentHanger type="shirt" color="#1A1C1F" position={[-0.26, 0.70, 0]} />
        <GarmentHanger type="shirt" color="#24272C" position={[-0.09, 0.70, 0]} />
        <GarmentHanger type="shirt" color="#2F333B" position={[0.09, 0.70, 0]} />
        <GarmentHanger type="shirt" color="#1D1E22" position={[0.26, 0.70, 0]} />

        {/* Shelf separating hanging section from drawers */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Two Soft-Close Solid Oak Drawers */}
        <Drawer
          id="bay3.drawer.top"
          name="Bay 3 Upper Drawer"
          width={0.76}
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
          width={0.76}
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
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower Chrome Wire Laundry Basket Drawer with Folded Linens */}
        <WireBasket position={[0, -0.92, 0]} width={0.74} height={0.17} depth={0.46} />
      </group>

      {/* ========================================================= */}
      {/* 7. BAY 4: FOURTH OPEN BAY (Rightmost)                     */}
      {/* Upper Burgundy box, dark blazers, 6-cubby yellow towels   */}
      {/* ========================================================= */}
      <group position={[1.73, 0, 0]}>
        {/* Top Luggage Shelves & Storage Boxes */}
        <mesh position={[0, 0.84, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>
        <StorageBox position={[-0.18, 0.87, 0]} color="#8A252E" width={0.36} height={0.22} />
        <StorageBox position={[0.18, 0.87, 0]} color="#2B2D32" width={0.34} height={0.22} />

        {/* Hanging Rail & 4 Tailored Blazers/Coats (Reference 1) */}
        <mesh position={[0, 0.70, 0]} rotation={[0, 0, Math.PI / 2]} material={pbrRailMat}>
          <cylinderGeometry args={[0.016, 0.016, 0.76, 16]} />
        </mesh>
        <GarmentHanger type="suit" color="#1F2023" position={[-0.26, 0.70, 0]} />
        <GarmentHanger type="coat" color="#2A2D33" position={[-0.09, 0.70, 0]} />
        <GarmentHanger type="suit" color="#18191B" position={[0.09, 0.70, 0]} />
        <GarmentHanger type="coat" color="#39332E" position={[0.26, 0.70, 0]} />

        {/* Mid Divider Shelf */}
        <mesh position={[0, -0.12, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.08]} />
        </mesh>

        {/* Lower 6-Cubby Organizer Unit (3 columns x 2 rows, matching Reference 1) */}
        {/* 2 Vertical divider boards */}
        <mesh position={[-0.13, -0.64, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        <mesh position={[0.13, -0.64, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[boardThickness, 0.98, totalD - 0.1]} />
        </mesh>
        {/* Horizontal middle shelf */}
        <mesh position={[0, -0.64, 0]} material={pbrWoodMat} castShadow receiveShadow>
          <boxGeometry args={[0.77, boardThickness, totalD - 0.1]} />
        </mesh>

        {/* Rolled & Folded Luxury Yellow Towels (All 6 cubbies populated as in Ref 1) */}
        <RolledTowel position={[-0.25, -0.38, 0]} color="#E0AA24" />
        <FoldedTowels position={[0, -0.44, 0]} color="#E0AA24" count={2} />
        <RolledTowel position={[0.25, -0.38, 0]} color="#E0AA24" />

        <FoldedTowels position={[-0.25, -0.74, 0]} color="#E0AA24" count={2} />
        <RolledTowel position={[0, -0.70, 0]} color="#E0AA24" />
        <FoldedTowels position={[0.25, -0.74, 0]} color="#E0AA24" count={2} />
      </group>

      {/* ========================================================= */}
      {/* 8. LARGE GREY SLIDING WARDROBE PANEL (Left Side, Ref 1)   */}
      {/* Positioned on the LEFT in the reference presentation state*/}
      {/* Features dark aluminium frame and horizontal subdivisions */}
      {/* ========================================================= */}
      <group
        ref={doorRef}
        position={[doorParkedX, 0, totalD / 2 + 0.024]}
        onClick={(e) => {
          e.stopPropagation();
          onUpdateState({
            leftDoorOpen: !isDoorSlid,
            bothDoorsOpen: false,
          });
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        {/* Outer Black Aluminium Perimeter Frame */}
        {/* Top Stile */}
        <mesh position={[0, doorHeight / 2 - 0.015, 0]} material={pbrFrameMat}>
          <boxGeometry args={[doorWidth, 0.030, 0.028]} />
        </mesh>
        {/* Bottom Stile */}
        <mesh position={[0, -doorHeight / 2 + 0.015, 0]} material={pbrFrameMat}>
          <boxGeometry args={[doorWidth, 0.030, 0.028]} />
        </mesh>
        {/* Left Vertical Frame */}
        <mesh position={[-doorWidth / 2 + 0.015, 0, 0]} material={pbrFrameMat}>
          <boxGeometry args={[0.030, doorHeight, 0.028]} />
        </mesh>
        {/* Right Vertical Frame */}
        <mesh position={[doorWidth / 2 - 0.015, 0, 0]} material={pbrFrameMat}>
          <boxGeometry args={[0.030, doorHeight, 0.028]} />
        </mesh>

        {/* Horizontal Subdividing Rails (Multiple panel subdivisions as in Ref 1) */}
        {/* Upper horizontal rail */}
        <mesh position={[0, 0.72, 0]} material={pbrFrameMat}>
          <boxGeometry args={[doorWidth - 0.03, 0.022, 0.026]} />
        </mesh>
        {/* Lower horizontal rail */}
        <mesh position={[0, -0.72, 0]} material={pbrFrameMat}>
          <boxGeometry args={[doorWidth - 0.03, 0.022, 0.026]} />
        </mesh>

        {/* Vertical dividing mullions for upper & lower bands */}
        <mesh position={[-0.14, 0.90, 0]} material={pbrFrameMat}>
          <boxGeometry args={[0.018, 0.34, 0.024]} />
        </mesh>
        <mesh position={[-0.14, -0.90, 0]} material={pbrFrameMat}>
          <boxGeometry args={[0.018, 0.34, 0.024]} />
        </mesh>

        {/* Glass Panels: Frosted Grey Satin Privacy Glass */}
        {/* Top Panes */}
        <mesh position={[-0.31, 0.90, 0]} material={pbrFrostedGlassMat} castShadow>
          <boxGeometry args={[0.31, 0.34, 0.008]} />
        </mesh>
        <mesh position={[0.19, 0.90, 0]} material={pbrFrostedGlassMat} castShadow>
          <boxGeometry args={[0.65, 0.34, 0.008]} />
        </mesh>

        {/* Main Central Large Frosted Grey Satin Glass Screen */}
        <mesh position={[0, 0, 0]} material={pbrFrostedGlassMat} castShadow>
          <boxGeometry args={[doorWidth - 0.03, 1.40, 0.008]} />
        </mesh>

        {/* Bottom Panes */}
        <mesh position={[-0.31, -0.90, 0]} material={pbrFrostedGlassMat} castShadow>
          <boxGeometry args={[0.31, 0.34, 0.008]} />
        </mesh>
        <mesh position={[0.19, -0.90, 0]} material={pbrFrostedGlassMat} castShadow>
          <boxGeometry args={[0.65, 0.34, 0.008]} />
        </mesh>

        {/* Sleek Integrated Aluminium Side Edge Pull Handle */}
        <mesh position={[doorWidth / 2 - 0.012, 0, 0.016]} material={pbrFrameMat}>
          <boxGeometry args={[0.014, 0.65, 0.012]} />
        </mesh>
      </group>
    </group>
  );
}

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import {
  PoleLShapeDesign,
  PoleState,
  FlexState,
  FlexDesignResult,
  FlexLShapeDesign,
} from "@/lib/engineering/types";
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
  flexLShapeDesign?: FlexLShapeDesign;
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
  flexLShapeDesign,
  interactionState,
  onUpdateState,
  woodMaterial,
  frameMaterial,
  doorPanelMaterial,
  woodTexture,
}: ParametricLShapeAssemblyProps) {
  const isFlex = productSystem === "flex";

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
      color: isFlex ? "#E5E0D8" : "#EAE5DC",
      roughness: 0.90,
    });
  }, [isFlex]);

  const pbrPoleMat = useMemo(() => {
    const col =
      poleState.poleFinish === "champagne"
        ? "#C8B294"
        : poleState.poleFinish === "black"
        ? "#1A1B1D"
        : "#DCE1E7";
    return new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.22,
      metalness: 0.90,
      envMapIntensity: 1.35,
    });
  }, [poleState.poleFinish]);

  const pbrSteelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#22252A",
      roughness: 0.30,
      metalness: 0.88,
      envMapIntensity: 1.3,
    });
  }, []);

  const pbrPowderShelfMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#F2F0EC",
      roughness: 0.36,
      metalness: 0.45,
      envMapIntensity: 1.1,
    });
  }, []);

  // Dimensions
  const legALengthMm = isFlex ? flexState.ls.legA.length : poleState.ls.legALength;
  const legBLengthMm = isFlex ? flexState.ls.legB.length : poleState.ls.legBLength;
  const ceilingMm = isFlex ? flexState.ls.ceiling : poleState.ls.ceiling;

  const legAW = legALengthMm / 1000;
  const legBW = legBLengthMm / 1000;
  const ceiling = Math.min(3.30, ceilingMm / 1000);
  const depth = 0.60;
  const cornerDeduction = 0.60; // Standard 600mm corner deduction

  // Corner is located at X = -legAW/2, Z = -legBW/2
  const cornerX = -legAW / 2;
  const cornerZ = -legBW / 2;

  const legSpanA = Math.max(0.6, legAW - cornerDeduction);
  const legSpanB = Math.max(0.6, legBW - cornerDeduction);

  // Door openings from engineering engines
  const doorAOpening =
    isFlex && flexLShapeDesign?.legA
      ? flexLShapeDesign.legA.doorOpening / 1000
      : poleLShapeDesign
      ? poleLShapeDesign.doorA.opening / 1000
      : legSpanA - 0.06;

  const doorBOpening =
    isFlex && flexLShapeDesign?.legB
      ? flexLShapeDesign.legB.doorOpening / 1000
      : poleLShapeDesign
      ? poleLShapeDesign.doorB.opening / 1000
      : legSpanB - 0.06;

  const doorHeightA =
    isFlex && flexLShapeDesign?.doorHeight
      ? flexLShapeDesign.doorHeight / 1000
      : poleState.ls.doorHeightUpgrade
      ? Math.min(2.80, ceiling)
      : Math.min(2.40, ceiling);

  const pelmetHeight = Math.max(0, ceiling - doorHeightA);

  const drawerCount = poleLShapeDesign
    ? poleLShapeDesign.drawerCount + (poleState.addonExtraDrawers || 0)
    : 4;

  const handleToggleDrawers = () => {
    const next = !interactionState.drawersOpen;
    onUpdateState({
      drawersOpen: next,
      topDrawerOpen: next,
      bottomDrawerOpen: next,
    });
  };

  const shelfMat = isFlex ? pbrPowderShelfMat : pbrWoodMat;

  return (
    <group position={[0, 0, 0]}>
      {/* ================================================================= */}
      {/* 1. 90° CORNER TOWER (SHARED DEAD-CORNER HANGING & SHELF ZONE)     */}
      {/* ================================================================= */}
      {/* Front Corner Structural Column / Pole */}
      <mesh position={[cornerX + depth - 0.02, ceiling / 2, cornerZ + depth - 0.02]} castShadow>
        {isFlex ? (
          <boxGeometry args={[0.036, ceiling, 0.036]} />
        ) : (
          <cylinderGeometry args={[0.016, 0.016, ceiling, 24]} />
        )}
        <primitive object={isFlex ? pbrSteelMat : pbrPoleMat} attach="material" />
      </mesh>

      {/* Corner Back Walls */}
      <mesh position={[cornerX + depth / 2, ceiling / 2, cornerZ + 0.008]} receiveShadow>
        <boxGeometry args={[depth, ceiling, 0.016]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>
      <mesh position={[cornerX + 0.008, ceiling / 2, cornerZ + depth / 2]} receiveShadow>
        <boxGeometry args={[0.016, ceiling, depth]} />
        <primitive object={pbrBackWallMat} attach="material" />
      </mesh>

      {/* Corner Ceiling Cap & Floor Base */}
      <mesh
        position={[cornerX + depth / 2, ceiling - 0.015, cornerZ + depth / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[depth, 0.03, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>
      <mesh position={[cornerX + depth / 2, 0.03, cornerZ + depth / 2]} receiveShadow>
        <boxGeometry args={[depth, 0.06, depth]} />
        <primitive object={pbrWoodMat} attach="material" />
      </mesh>

      {/* Corner L-Shelves */}
      {[ceiling - 0.36, ceiling * 0.50].map((cy, cIdx) => (
        <mesh
          key={`corner-shelf-${cIdx}`}
          position={[cornerX + depth / 2, cy, cornerZ + depth / 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[depth - 0.04, 0.022, depth - 0.04]} />
          <primitive object={shelfMat} attach="material" />
        </mesh>
      ))}

      {/* Corner Hanging Rods */}
      <mesh
        position={[cornerX + depth / 2, ceiling - 0.46, cornerZ + depth / 2]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.013, 0.013, depth - 0.08, 16]} />
        <primitive object={pbrPoleMat} attach="material" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. LEG A (MAIN WING ALONG X-AXIS)                                 */}
      {/* ================================================================= */}
      <group position={[cornerX + cornerDeduction, 0, cornerZ]}>
        {/* Back Wall for Leg A */}
        <mesh position={[legSpanA / 2, ceiling / 2, 0.008]} receiveShadow>
          <boxGeometry args={[legSpanA, ceiling, 0.016]} />
          <primitive object={pbrBackWallMat} attach="material" />
        </mesh>

        {/* Outer Far Right End Partition */}
        <mesh position={[legSpanA - 0.03, ceiling / 2, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.06, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* System-Specific Structural Uprights on Leg A */}
        {isFlex ? (
          <>
            {/* Top Horizontal SPCC Steel Hang-Track */}
            <mesh position={[legSpanA / 2, ceiling - 0.08, 0.028]} castShadow>
              <boxGeometry args={[legSpanA - 0.08, 0.048, 0.024]} />
              <primitive object={pbrSteelMat} attach="material" />
            </mesh>
            {/* Rear Twin-Slot Uprights */}
            {[0.04, legSpanA * 0.48, legSpanA - 0.08].map((ux, uIdx) => (
              <mesh
                key={`ls-flex-upA-${uIdx}`}
                position={[ux, ceiling / 2, 0.028]}
                castShadow
              >
                <boxGeometry args={[0.032, ceiling - 0.12, 0.024]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
            ))}
          </>
        ) : (
          <>
            {/* HausPole 26mm Twin Front+Rear Floor-to-Ceiling Poles */}
            {[0.02, legSpanA * 0.48, legSpanA - 0.08].map((px, pIdx) => (
              <group key={`ls-pole-A-${pIdx}`} position={[px, 0, 0]}>
                <mesh position={[0, ceiling / 2, depth * 0.74]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, ceiling, 20]} />
                  <primitive object={pbrPoleMat} attach="material" />
                </mesh>
                <mesh position={[0, ceiling / 2, depth * 0.16]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, ceiling, 20]} />
                  <primitive object={pbrPoleMat} attach="material" />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Top Header Shelf */}
        <mesh position={[legSpanA / 2, ceiling - 0.36, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legSpanA - 0.08, 0.022, depth - 0.08]} />
          <primitive object={shelfMat} attach="material" />
        </mesh>

        {/* Drawers (HausPole) or Pull-Out Wire Baskets (HausFlex) in Leg A */}
        {isFlex ? (
          <group position={[legSpanA * 0.25, 0.18, depth / 2]}>
            {[0, 1, 2, 3].map((bIdx) => (
              <group
                key={`ls-flex-basket-A-${bIdx}`}
                position={[0, bIdx * 0.22, interactionState.drawersOpen ? 0.22 : 0]}
              >
                <mesh castShadow>
                  <boxGeometry args={[Math.min(0.70, legSpanA * 0.42), 0.11, depth - 0.14]} />
                  <primitive object={pbrPoleMat} attach="material" />
                </mesh>
                <FoldedTowels position={[0, 0.02, 0]} color="#EFECE6" count={2} />
              </group>
            ))}
          </group>
        ) : (
          <group position={[Math.min(0.44, legSpanA * 0.26), 0.06, depth / 2]}>
            <mesh position={[0, (drawerCount * 0.20) / 2, 0]} receiveShadow>
              <boxGeometry
                args={[Math.min(0.80, legSpanA * 0.45), drawerCount * 0.20 + 0.02, depth - 0.08]}
              />
              <primitive object={pbrWoodMat} attach="material" />
            </mesh>
            {Array.from({ length: Math.min(6, drawerCount) }).map((_, dIdx) => (
              <Drawer
                key={`ls-drawer-${dIdx}`}
                id={`ls-legA-drawer-${dIdx}`}
                name={`Drawer ${dIdx + 1}`}
                width={Math.min(0.76, legSpanA * 0.43)}
                height={0.18}
                depth={depth - 0.12}
                position={[0, 0.02 + dIdx * 0.19 + 0.09, 0.02]}
                isOpen={interactionState.drawersOpen}
                onToggle={handleToggleDrawers}
                woodMaterial={woodMaterial}
                frameMaterial={frameMaterial}
                woodTexture={woodTexture}
              />
            ))}
            <FoldedTowels
              position={[-0.12, drawerCount * 0.20 + 0.05, 0]}
              color="#F0ECE1"
              count={2}
            />
          </group>
        )}

        {/* Hanging rail on Leg A */}
        <group position={[legSpanA * 0.73, ceiling - 0.46, depth / 2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.013, 0.013, legSpanA * 0.44, 16]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>
          <GarmentHanger type="suit" color="#26272B" position={[-0.14, -0.02, 0]} />
          <GarmentHanger type="shirt" color="#FFFFFF" position={[0, -0.02, 0]} />
          <GarmentHanger type="dress" color="#852E38" position={[0.14, -0.02, 0]} />
        </group>

        {/* Leg A Doors */}
        {((!isFlex && poleState.doorRequired && poleLShapeDesign) ||
          (isFlex && flexState.ls.doorRequired && flexLShapeDesign?.legA)) && (
          <ParametricDoors
            openingWidth={doorAOpening}
            openingHeight={doorHeightA}
            ceilingHeight={ceiling}
            doorType={
              isFlex && flexLShapeDesign?.legA
                ? flexLShapeDesign.legA.door.type === "sliding"
                  ? "sliding"
                  : flexLShapeDesign.legA.door.type === "none" ||
                    flexLShapeDesign.legA.door.type === "infeasible"
                  ? "none"
                  : flexLShapeDesign.legA.door.material === "wooden"
                  ? "wooden"
                  : "aluminum"
                : poleLShapeDesign?.doorA.type || "sliding"
            }
            doorSubtype={
              isFlex && flexLShapeDesign?.legA
                ? flexLShapeDesign.legA.door.type === "sliding"
                  ? "sliding"
                  : flexLShapeDesign.legA.door.type === "bifold"
                  ? "bifold"
                  : "swing"
                : poleLShapeDesign?.doorA.type === "sliding"
                ? "sliding"
                : "bifold"
            }
            panelCount={
              (isFlex && flexLShapeDesign?.legA
                ? flexLShapeDesign.legA.door.panelCount
                : poleLShapeDesign?.doorA.panelCount) || 2
            }
            panelWidth={
              doorAOpening /
              ((isFlex && flexLShapeDesign?.legA
                ? flexLShapeDesign.legA.door.panelCount
                : poleLShapeDesign?.doorA.panelCount) || 2)
            }
            pelmetHeight={pelmetHeight}
            isOpen={interactionState.bothDoorsOpen}
            onToggle={() => onUpdateState({ bothDoorsOpen: !interactionState.bothDoorsOpen })}
            frameMaterial={frameMaterial}
            doorPanelMaterial={doorPanelMaterial}
            woodMaterial={woodMaterial}
            woodTexture={woodTexture}
            position={[doorAOpening / 2, 0, depth + 0.015]}
          />
        )}
      </group>

      {/* ================================================================= */}
      {/* 3. LEG B (RETURN WING ALONG +Z AXIS AT 90° ON LEFT WALL)          */}
      {/* ================================================================= */}
      <group
        position={[cornerX, 0, cornerZ + cornerDeduction + legSpanB]}
        rotation={[0, Math.PI / 2, 0]}
      >
        {/* Back Wall for Leg B (Flush against left return wall at worldX = cornerX) */}
        <mesh position={[legSpanB / 2, ceiling / 2, 0.008]} receiveShadow>
          <boxGeometry args={[legSpanB, ceiling, 0.016]} />
          <primitive object={pbrBackWallMat} attach="material" />
        </mesh>

        {/* Outer Far End Partition (At front-most end of Leg B, local x = 0.03) */}
        <mesh position={[0.03, ceiling / 2, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.06, ceiling, depth]} />
          <primitive object={pbrWoodMat} attach="material" />
        </mesh>

        {/* System-Specific Structural Uprights on Leg B */}
        {isFlex ? (
          <>
            <mesh position={[legSpanB / 2, ceiling - 0.08, 0.028]} castShadow>
              <boxGeometry args={[legSpanB - 0.08, 0.048, 0.024]} />
              <primitive object={pbrSteelMat} attach="material" />
            </mesh>
            {[0.08, legSpanB * 0.52, legSpanB - 0.04].map((ux, uIdx) => (
              <mesh
                key={`ls-flex-upB-${uIdx}`}
                position={[ux, ceiling / 2, 0.028]}
                castShadow
              >
                <boxGeometry args={[0.032, ceiling - 0.12, 0.024]} />
                <primitive object={pbrSteelMat} attach="material" />
              </mesh>
            ))}
          </>
        ) : (
          <>
            {[0.08, legSpanB * 0.52, legSpanB - 0.02].map((px, pIdx) => (
              <group key={`ls-pole-B-${pIdx}`} position={[px, 0, 0]}>
                <mesh position={[0, ceiling / 2, depth * 0.74]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, ceiling, 20]} />
                  <primitive object={pbrPoleMat} attach="material" />
                </mesh>
                <mesh position={[0, ceiling / 2, depth * 0.16]} castShadow>
                  <cylinderGeometry args={[0.016, 0.016, ceiling, 20]} />
                  <primitive object={pbrPoleMat} attach="material" />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Top Header Shelf */}
        <mesh position={[legSpanB / 2, ceiling - 0.36, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legSpanB - 0.08, 0.022, depth - 0.08]} />
          <primitive object={shelfMat} attach="material" />
        </mesh>

        {/* Shelving & Hanging on Leg B */}
        <group position={[legSpanB / 2, ceiling - 0.46, depth / 2]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.013, 0.013, legSpanB * 0.80, 16]} />
            <primitive object={pbrPoleMat} attach="material" />
          </mesh>
          <GarmentHanger type="shirt" color="#455667" position={[-0.15, -0.02, 0]} />
          <GarmentHanger type="coat" color="#3B2F28" position={[0.15, -0.02, 0]} />
        </group>

        {/* Lower Shelving on Leg B */}
        <mesh position={[legSpanB / 2, ceiling * 0.48, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[legSpanB - 0.08, 0.022, depth - 0.08]} />
          <primitive object={shelfMat} attach="material" />
        </mesh>
        <StorageBox
          position={[legSpanB / 2, 0.15, depth / 2]}
          width={Math.min(0.38, legSpanB * 0.55)}
          height={0.22}
          depth={0.35}
          color="#D4CCBC"
        />

        {/* Leg B Doors (Facing +X into the room) */}
        {((!isFlex && poleState.doorRequired && poleLShapeDesign) ||
          (isFlex && flexState.ls.doorRequired && flexLShapeDesign?.legB)) && (
          <ParametricDoors
            openingWidth={doorBOpening}
            openingHeight={doorHeightA}
            ceilingHeight={ceiling}
            doorType={
              isFlex && flexLShapeDesign?.legB
                ? flexLShapeDesign.legB.door.type === "sliding"
                  ? "sliding"
                  : flexLShapeDesign.legB.door.type === "none" ||
                    flexLShapeDesign.legB.door.type === "infeasible"
                  ? "none"
                  : flexLShapeDesign.legB.door.material === "wooden"
                  ? "wooden"
                  : "aluminum"
                : poleLShapeDesign?.doorB.type || "sliding"
            }
            doorSubtype={
              isFlex && flexLShapeDesign?.legB
                ? flexLShapeDesign.legB.door.type === "sliding"
                  ? "sliding"
                  : flexLShapeDesign.legB.door.type === "bifold"
                  ? "bifold"
                  : "swing"
                : poleLShapeDesign?.doorB.type === "sliding"
                ? "sliding"
                : "bifold"
            }
            panelCount={
              (isFlex && flexLShapeDesign?.legB
                ? flexLShapeDesign.legB.door.panelCount
                : poleLShapeDesign?.doorB.panelCount) || 2
            }
            panelWidth={
              doorBOpening /
              ((isFlex && flexLShapeDesign?.legB
                ? flexLShapeDesign.legB.door.panelCount
                : poleLShapeDesign?.doorB.panelCount) || 2)
            }
            pelmetHeight={pelmetHeight}
            isOpen={interactionState.bothDoorsOpen}
            onToggle={() => onUpdateState({ bothDoorsOpen: !interactionState.bothDoorsOpen })}
            frameMaterial={frameMaterial}
            doorPanelMaterial={doorPanelMaterial}
            woodMaterial={woodMaterial}
            woodTexture={woodTexture}
            position={[0.06 + doorBOpening / 2, 0, depth + 0.015]}
          />
        )}
      </group>
    </group>
  );
}

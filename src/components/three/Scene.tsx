"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { ShowroomEnvironment } from "./ShowroomEnvironment";
import { Lighting } from "./Lighting";
import { CameraController } from "./CameraController";
import { WardrobeModel } from "./WardrobeModel";
import { DimensionOverlay3D } from "./DimensionOverlay3D";
import { ParametricDimensionOverlay } from "./parametric";
import { WardrobeInteractionState } from "@/types/wardrobe";
import { WARDROBE_VARIANTS } from "@/lib/wardrobe-config";
import {
  PoleState,
  PoleDesignResult,
  PoleLShapeDesign,
  FlexState,
  FlexDesignResult,
  FlexLShapeDesign,
} from "@/lib/engineering/types";

export interface SceneProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  productSystem?: "pole" | "flex" | "showroom";
  shape?: "straight" | "lshape";
  poleState?: PoleState;
  poleDesign?: PoleDesignResult;
  poleLShapeDesign?: PoleLShapeDesign;
  flexState?: FlexState;
  flexDesign?: FlexDesignResult;
  flexLShapeDesign?: FlexLShapeDesign;
}

export function Scene({
  state,
  onUpdateState,
  productSystem = "pole",
  shape = "straight",
  poleState,
  poleDesign,
  poleLShapeDesign,
  flexState,
  flexDesign,
  flexLShapeDesign,
}: SceneProps) {
  const currentVariant =
    WARDROBE_VARIANTS.find((v) => v.id === state.activeVariant) ||
    WARDROBE_VARIANTS[0];

  const activeFlexProposal =
    flexState && flexDesign
      ? flexState.proposal === "B" && flexDesign.proposalB
        ? flexDesign.proposalB
        : flexDesign.proposalA
      : null;

  // Compute physical dimensions in meters for auto-framing camera, lighting, and showroom enclosure
  const widthMeters =
    productSystem === "pole" && poleState
      ? (shape === "lshape" ? poleState.ls.legALength : poleState.length) / 1000
      : productSystem === "flex" && flexState
      ? (shape === "lshape" ? flexState.ls.legA.length : flexState.length) / 1000
      : currentVariant.dimensions.width / 1000;

  const heightMeters =
    productSystem === "pole" && poleState
      ? (shape === "lshape" ? poleState.ls.ceiling : poleState.ceiling) / 1000
      : productSystem === "flex" && flexState
      ? Math.min(3.30, (shape === "lshape" ? flexState.ls.ceiling : flexState.ceiling) / 1000)
      : currentVariant.dimensions.height / 1000;

  const legBMeters =
    productSystem === "pole" && poleState
      ? poleState.ls.legBLength / 1000
      : productSystem === "flex" && flexState
      ? flexState.ls.legB.length / 1000
      : 2.0;

  const effectiveShape = productSystem === "showroom" ? "straight" : shape;

  return (
    <div className="w-full h-full relative select-none bg-[#181816] overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0.75, 1.25, 4.35], fov: 38 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
      >
        <Suspense fallback={null}>
          {/* Studio & Ceiling Lighting Rig */}
          <Lighting
            lightingMode={state.lightingMode}
            showSpotlights={state.showSpotlights}
            heightMeters={heightMeters}
            widthMeters={widthMeters}
          />

          {/* HDR Environment for Realistic PBR Metal/Glass Reflections */}
          <Environment preset="city" />

          {/* Realistic Showroom Floor & Enclosure */}
          <ShowroomEnvironment
            activeVariant={state.activeVariant}
            widthMeters={widthMeters}
            heightMeters={heightMeters}
            shape={effectiveShape}
            legBMeters={legBMeters}
          />

          {/* Ground Contact Shadows */}
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.65}
            scale={10.0}
            blur={2.0}
            far={4.0}
            color="#140E0A"
          />

          {/* Active 3D Interactive Wardrobe Model */}
          <WardrobeModel
            state={state}
            onUpdateState={onUpdateState}
            productSystem={productSystem}
            shape={shape}
            poleState={poleState}
            poleDesign={poleDesign}
            poleLShapeDesign={poleLShapeDesign}
            flexState={flexState}
            flexDesign={flexDesign}
            flexLShapeDesign={flexLShapeDesign}
          />

          {/* Dimension Overlays */}
          {productSystem === "pole" && poleState && poleDesign && shape === "straight" ? (
            <ParametricDimensionOverlay
              totalWidthMm={poleState.length}
              ceilingMm={poleState.ceiling}
              depthMm={poleState.depth || 600}
              doorOpeningMm={poleDesign.doorOpening}
              pelmetMm={poleDesign.pelmetHeight}
              bays={poleDesign.internalLayout?.bays?.map((b: { width: number; xStart: number; xEnd: number }) => ({
                width: b.width,
                xCenter: (b.xStart + b.xEnd) / 2 - (poleDesign.internalWidth || poleState.length) / 2,
              })) || []}
              visible={state.showDimensions}
            />
          ) : productSystem === "flex" && flexState && flexDesign && activeFlexProposal && shape === "straight" ? (
            <ParametricDimensionOverlay
              totalWidthMm={flexState.length}
              ceilingMm={flexState.ceiling}
              depthMm={flexState.depth || 600}
              doorOpeningMm={flexDesign.doorOpening}
              pelmetMm={Math.max(0, flexState.ceiling - (flexDesign.doorHeight || 2400))}
              bays={activeFlexProposal.widths.map((w, idx) => ({
                width: w,
                xCenter: idx * 0.6 - (activeFlexProposal.widths.length * 0.6) / 2,
              }))}
              visible={state.showDimensions}
            />
          ) : (
            <DimensionOverlay3D
              dimensions={currentVariant.dimensions}
              visible={state.showDimensions}
            />
          )}

          {/* Interactive Camera Controller & Dynamic Bounding Box Framing */}
          <CameraController
            preset={state.cameraPreset}
            interiorViewActive={state.interiorViewActive}
            autoRotate={state.autoRotate}
            activeVariant={state.activeVariant}
            widthMeters={widthMeters}
            heightMeters={heightMeters}
            shape={effectiveShape}
            legBMeters={legBMeters}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

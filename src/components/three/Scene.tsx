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
import { WardrobeInteractionState } from "@/types/wardrobe";
import { WARDROBE_VARIANTS } from "@/lib/wardrobe-config";

interface SceneProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

export function Scene({ state, onUpdateState }: SceneProps) {
  const currentVariant =
    WARDROBE_VARIANTS.find((v) => v.id === state.activeVariant) ||
    WARDROBE_VARIANTS[0];

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
          toneMappingExposure: 1.05,
        }}
      >
        <Suspense fallback={null}>
          {/* Studio & Ceiling Lighting Rig */}
          <Lighting
            lightingMode={state.lightingMode}
            showSpotlights={state.showSpotlights}
          />

          {/* HDR Environment for Realistic PBR Metal/Glass Reflections */}
          <Environment preset="city" />

          {/* Realistic Showroom Floor & Enclosure */}
          <ShowroomEnvironment activeVariant={state.activeVariant} />

          {/* Ground Contact Shadows */}
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.65}
            scale={8.0}
            blur={2.0}
            far={4.0}
            color="#140E0A"
          />

          {/* Active 3D Interactive Wardrobe Model */}
          <WardrobeModel state={state} onUpdateState={onUpdateState} />

          {/* 3D Architectural Dimensions Overlay */}
          <DimensionOverlay3D
            dimensions={currentVariant.dimensions}
            visible={state.showDimensions}
          />

          {/* Interactive Camera Controller & Preset Interpolation */}
          <CameraController
            preset={state.cameraPreset}
            interiorViewActive={state.interiorViewActive}
            autoRotate={state.autoRotate}
            activeVariant={state.activeVariant}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

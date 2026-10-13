"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { WardrobeInteractionState } from "@/types/wardrobe";

interface LightingProps {
  lightingMode: WardrobeInteractionState["lightingMode"];
  showSpotlights: boolean;
  heightMeters?: number;
  widthMeters?: number;
}

export function Lighting({
  lightingMode,
  showSpotlights,
  heightMeters = 2.60,
  widthMeters = 2.74,
}: LightingProps) {
  const ceilingY = Math.max(2.20, heightMeters + 0.006);
  const trackSpan = Math.min(3.6, Math.max(1.8, widthMeters * 0.85));

  // Spotlight cylinder fixture material (Black aluminium cans as seen in Ref 3)
  const spotCanMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181818",
        roughness: 0.45,
        metalness: 0.8,
      }),
    []
  );

  const spotLensMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#FFF5E0",
        emissive: "#FFE19F",
        emissiveIntensity: 1.2,
        roughness: 0.25,
      }),
    []
  );

  const ambientIntensity =
    lightingMode === "daylight" ? 0.82 : lightingMode === "evening" ? 0.50 : 0.70;

  const keyIntensity =
    lightingMode === "daylight" ? 1.35 : lightingMode === "evening" ? 0.95 : 1.20;

  const spotIntensity =
    lightingMode === "evening" ? 1.65 : lightingMode === "daylight" ? 1.05 : 1.40;

  const spotColor = lightingMode === "daylight" ? "#F5EFEB" : "#FFE5B4";

  return (
    <group>
      {/* 1. BALANCED AMBIENT & HEMISPHERE FILL LIGHT */}
      <ambientLight intensity={ambientIntensity} color="#F7F5F0" />
      <hemisphereLight
        color="#FFFBF5"
        groundColor="#6E5540"
        intensity={0.45}
      />

      {/* 2. PRIMARY DIRECTIONAL KEY LIGHT WITH SOFT SHADOWS */}
      <directionalLight
        position={[3.4, 5.4, 4.4]}
        intensity={keyIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-camera-left={-4.0}
        shadow-camera-right={4.0}
        shadow-camera-top={4.0}
        shadow-camera-bottom={-1.5}
        shadow-bias={-0.00015}
        shadow-radius={3.5}
      />

      {/* Secondary Soft Fill Light for Natural Shadow Softening */}
      <directionalLight position={[-3.2, 3.8, 3.0]} intensity={0.48} color="#EFE9DF" />

      {/* Dedicated Interior Wardrobe Illumination (Ensures Interior Clarity Behind Glass) */}
      <pointLight
        position={[-widthMeters * 0.24, heightMeters * 0.58, 0.08]}
        intensity={0.75}
        distance={3.2}
        color="#FFF5E4"
      />
      <pointLight
        position={[widthMeters * 0.24, heightMeters * 0.58, 0.08]}
        intensity={0.75}
        distance={3.2}
        color="#FFF5E4"
      />

      {/* ========================================================= */}
      {/* 3. CEILING TRACK SPOTLIGHTS (Dynamic Ceiling Height)      */}
      {/* ========================================================= */}
      <group position={[0, ceilingY - 0.015, 0.62]}>
        {/* Horizontal Black Track Rail */}
        <mesh material={spotCanMat}>
          <boxGeometry args={[trackSpan, 0.02, 0.03]} />
        </mesh>

        {/* 3 Spotlight Fixture Cans: Left, Center, Right */}
        {[-trackSpan * 0.34, 0.0, trackSpan * 0.34].map((xPos, idx) => (
          <group key={idx} position={[xPos, -0.04, 0]}>
            {/* Fixture Mount Stem */}
            <mesh material={spotCanMat}>
              <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
            </mesh>

            {/* Fixture Body Can */}
            <group position={[0, -0.05, 0]} rotation={[0.25, 0, 0]}>
              <mesh material={spotCanMat} castShadow>
                <cylinderGeometry args={[0.032, 0.036, 0.09, 16]} />
              </mesh>
              {/* Emissive Lens Face */}
              <mesh position={[0, -0.046, 0]} material={spotLensMat}>
                <circleGeometry args={[0.032, 16]} />
              </mesh>
            </group>

            {/* Soft Three.js SpotLight Beam */}
            {showSpotlights && (
              <spotLight
                position={[0, -0.08, 0]}
                target-position={[xPos, heightMeters * 0.45, 0]}
                intensity={spotIntensity}
                angle={0.65}
                penumbra={0.85}
                distance={5.5}
                color={spotColor}
                castShadow
              />
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

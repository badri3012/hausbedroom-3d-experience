"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { WardrobeInteractionState } from "@/types/wardrobe";

interface LightingProps {
  lightingMode: WardrobeInteractionState["lightingMode"];
  showSpotlights: boolean;
}

export function Lighting({ lightingMode, showSpotlights }: LightingProps) {
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
        emissiveIntensity: 1.2, // Subtle, natural lens illumination without artificial glow
        roughness: 0.25,
      }),
    []
  );

  const ambientIntensity =
    lightingMode === "daylight" ? 0.70 : lightingMode === "evening" ? 0.40 : 0.58;

  const keyIntensity =
    lightingMode === "daylight" ? 1.25 : lightingMode === "evening" ? 0.85 : 1.10;

  const spotIntensity =
    lightingMode === "evening" ? 1.6 : lightingMode === "daylight" ? 0.9 : 1.35;

  const spotColor = lightingMode === "daylight" ? "#F5EFEB" : "#FFE5B4";

  return (
    <group>
      {/* 1. BALANCED AMBIENT FILL LIGHT */}
      <ambientLight intensity={ambientIntensity} color="#F5F3EF" />

      {/* 2. PRIMARY DIRECTIONAL KEY LIGHT WITH SOFT SHADOWS */}
      <directionalLight
        position={[3.2, 5.2, 4.0]}
        intensity={keyIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-1.5}
        shadow-bias={-0.00015}
        shadow-radius={3.5}
      />

      {/* Secondary Soft Fill Light for Natural Shadow Softening */}
      <directionalLight position={[-3.0, 3.8, 2.5]} intensity={0.35} color="#E8E2D8" />

      {/* Subtle Rim Light */}
      <directionalLight position={[0, 4.0, -2.5]} intensity={0.2} color="#DCD6CC" />

      {/* ========================================================= */}
      {/* 3. CEILING TRACK SPOTLIGHTS (Reference Image 3 Signature)  */}
      {/* 3 Black directional spotlights with soft penumbra         */}
      {/* ========================================================= */}
      <group position={[0, 2.62, 0.45]}>
        {/* Horizontal Black Track Rail */}
        <mesh material={spotCanMat}>
          <boxGeometry args={[2.8, 0.02, 0.03]} />
        </mesh>

        {/* 3 Spotlight Fixture Cans: Left, Center, Right */}
        {[-0.95, 0.0, 0.95].map((xPos, idx) => (
          <group key={idx} position={[xPos, -0.04, 0]}>
            {/* Fixture Mount Stem */}
            <mesh material={spotCanMat}>
              <cylinderGeometry args={[0.006, 0.006, 0.05, 12]} />
            </mesh>

            {/* Fixture Body Can */}
            <group position={[0, -0.05, 0]} rotation={[0.22, 0, 0]}>
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
                target-position={[xPos, 1.0, 0]}
                intensity={spotIntensity}
                angle={0.62}
                penumbra={0.85} // Soft gradient edge
                distance={4.8}
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

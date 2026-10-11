"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface GarmentProps {
  type: "shirt" | "suit" | "dress" | "coat";
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function GarmentHanger({
  type,
  color = "#2A2A2A",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: GarmentProps) {
  // Wood hanger material
  const hangerWoodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#B88E5A",
        roughness: 0.5,
        metalness: 0.05,
      }),
    []
  );

  // Chrome hook material
  const hookMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D0D0D0",
        roughness: 0.2,
        metalness: 0.9,
      }),
    []
  );

  // Garment fabric material
  const fabricMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.02,
      }),
    [color]
  );

  const garmentHeight = type === "dress" ? 0.75 : type === "coat" ? 0.65 : 0.55;
  const garmentWidth = type === "dress" ? 0.32 : 0.38;
  const garmentDepth = type === "coat" ? 0.16 : 0.11;

  return (
    <group position={position} rotation={rotation}>
      {/* Chrome Hook */}
      <mesh position={[0, 0.04, 0]} material={hookMat}>
        <torusGeometry args={[0.022, 0.0025, 8, 16, Math.PI * 1.2]} />
      </mesh>

      {/* Wooden Hanger Shoulder Bar */}
      <group position={[0, 0.015, 0]}>
        <mesh material={hangerWoodMat} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.22, 0.012, 0.015]} />
        </mesh>
        <mesh material={hangerWoodMat} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.22, 0.012, 0.015]} />
        </mesh>
      </group>

      {/* Main Garment Body */}
      <mesh
        position={[0, -garmentHeight / 2, 0]}
        material={fabricMat}
        castShadow
      >
        <boxGeometry args={[garmentWidth, garmentHeight, garmentDepth]} />
      </mesh>

      {/* Garment Collar & Lapel Details */}
      <mesh
        position={[0, -0.04, garmentDepth / 2 + 0.005]}
        material={fabricMat}
      >
        <boxGeometry args={[0.16, 0.06, 0.01]} />
      </mesh>

      {/* Subtle bottom fold */}
      <mesh
        position={[0, -garmentHeight + 0.01, 0]}
        material={fabricMat}
      >
        <boxGeometry args={[garmentWidth * 0.96, 0.02, garmentDepth * 0.9]} />
      </mesh>
    </group>
  );
}

// Towel Stack / Folded Linen Mesh
export function FoldedTowels({
  color = "#DDB945",
  position = [0, 0, 0],
  count = 3,
}: {
  color?: string;
  position?: [number, number, number];
  count?: number;
}) {
  const towelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.01,
      }),
    [color]
  );

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[0, i * 0.038, 0]}
          material={towelMat}
          castShadow
        >
          <boxGeometry args={[0.24, 0.032, 0.32]} />
        </mesh>
      ))}
    </group>
  );
}

// Rolled Towel Cylinder (as seen in Reference 1 bottom cubbies)
export function RolledTowel({
  color = "#E0B738",
  position = [0, 0, 0],
}: {
  color?: string;
  position?: [number, number, number];
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.01,
      }),
    [color]
  );

  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 0.28, 16]} />
      </mesh>
    </group>
  );
}

// Luxury Storage Box with Lid & Handle (as seen in Reference 1 top shelves)
export function StorageBox({
  color = "#7A2E38", // Burgundy/wine red or Cognac
  position = [0, 0, 0],
  width = 0.38,
  height = 0.22,
  depth = 0.42,
}: {
  color?: string;
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}) {
  const boxMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.65,
        metalness: 0.05,
      }),
    [color]
  );

  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C5A059",
        roughness: 0.3,
        metalness: 0.85,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Box Base */}
      <mesh position={[0, height / 2, 0]} material={boxMat} castShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Lid Rim */}
      <mesh position={[0, height + 0.01, 0]} material={boxMat}>
        <boxGeometry args={[width + 0.015, 0.025, depth + 0.015]} />
      </mesh>

      {/* Front Leather/Brass Pull Tab */}
      <mesh position={[0, height / 2, depth / 2 + 0.008]} material={metalMat}>
        <boxGeometry args={[0.08, 0.02, 0.008]} />
      </mesh>
    </group>
  );
}

// Chrome Wire Basket (as seen in Reference 1 below drawers)
export function WireBasket({
  position = [0, 0, 0],
  width = 0.78,
  height = 0.16,
  depth = 0.46,
}: {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}) {
  const chromeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#BFC5CB",
        roughness: 0.2,
        metalness: 0.95,
      }),
    []
  );

  const linenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F3EDE2",
        roughness: 0.9,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Top Rim Wire */}
      <mesh position={[0, height, 0]} material={chromeMat}>
        <boxGeometry args={[width, 0.008, depth]} />
      </mesh>

      {/* Bottom Rim */}
      <mesh position={[0, 0.004, 0]} material={chromeMat}>
        <boxGeometry args={[width, 0.006, depth]} />
      </mesh>

      {/* Vertical wire rungs along front */}
      {[-0.32, -0.16, 0, 0.16, 0.32].map((x, i) => (
        <mesh
          key={i}
          position={[x, height / 2, depth / 2]}
          material={chromeMat}
        >
          <cylinderGeometry args={[0.003, 0.003, height, 8]} />
        </mesh>
      ))}

      {/* Folded white linens inside */}
      <mesh position={[0, height / 2, 0]} material={linenMat} castShadow>
        <boxGeometry args={[width * 0.88, height * 0.75, depth * 0.85]} />
      </mesh>
    </group>
  );
}

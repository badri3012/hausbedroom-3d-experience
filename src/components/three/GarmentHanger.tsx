"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface GarmentProps {
  type: "shirt" | "suit" | "dress" | "coat";
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Realistic 3D Garment on Wooden Hanger
 * Features contoured shoulders, collar/lapels, sleeve volumes, and fabric drapes.
 */
export function GarmentHanger({
  type,
  color = "#2A2A2A",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: GarmentProps) {
  // Natural polished beech wood hanger
  const hangerWoodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C29A64",
        roughness: 0.42,
        metalness: 0.04,
      }),
    []
  );

  // Chrome hook material
  const hookMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D8DCE0",
        roughness: 0.18,
        metalness: 0.92,
      }),
    []
  );

  // Garment fabric material with realistic weave roughness
  const fabricMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
        metalness: 0.02,
      }),
    [color]
  );

  // Accent material for collar / lining / details
  const accentMat = useMemo(() => {
    const col = new THREE.Color(color);
    col.offsetHSL(0, 0, -0.06);
    return new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.85,
      metalness: 0.02,
    });
  }, [color]);

  const garmentHeight = type === "dress" ? 0.76 : type === "coat" ? 0.68 : type === "suit" ? 0.62 : 0.56;
  const garmentWidth = type === "dress" ? 0.34 : 0.38;
  const garmentDepth = type === "coat" ? 0.15 : type === "suit" ? 0.13 : 0.10;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. CHROME WIRE HOOK */}
      <mesh position={[0, 0.048, 0]} material={hookMat}>
        <torusGeometry args={[0.024, 0.0028, 8, 20, Math.PI * 1.25]} />
      </mesh>
      <mesh position={[0, 0.026, 0]} material={hookMat}>
        <cylinderGeometry args={[0.0028, 0.0028, 0.02, 8]} />
      </mesh>

      {/* 2. CONTOURED WOODEN HANGER YOKE */}
      <group position={[0, 0.016, 0]}>
        {/* Left shoulder arm */}
        <mesh position={[-0.105, -0.012, 0]} rotation={[0, 0, 0.14]} material={hangerWoodMat}>
          <boxGeometry args={[0.22, 0.014, 0.022]} />
        </mesh>
        {/* Right shoulder arm */}
        <mesh position={[0.105, -0.012, 0]} rotation={[0, 0, -0.14]} material={hangerWoodMat}>
          <boxGeometry args={[0.22, 0.014, 0.022]} />
        </mesh>
        {/* Lower crossbar for pants/straps */}
        <mesh position={[0, -0.038, 0]} rotation={[0, 0, Math.PI / 2]} material={hangerWoodMat}>
          <cylinderGeometry args={[0.004, 0.004, 0.36, 12]} />
        </mesh>
      </group>

      {/* 3. CLOTHING BODY GEOMETRY PER TYPE */}
      {type === "dress" && (
        <group position={[0, 0, 0]}>
          {/* Fitted Bodice */}
          <mesh position={[0, -0.16, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[0.28, 0.24, garmentDepth]} />
          </mesh>
          {/* V-neck / Collar Band */}
          <mesh position={[0, -0.045, garmentDepth / 2 + 0.004]} material={accentMat}>
            <boxGeometry args={[0.16, 0.035, 0.008]} />
          </mesh>
          {/* Cinched Waistband */}
          <mesh position={[0, -0.28, 0]} material={accentMat} castShadow>
            <boxGeometry args={[0.26, 0.035, garmentDepth + 0.006]} />
          </mesh>
          {/* Flared A-Line Pleated Skirt */}
          <mesh position={[0, -0.52, 0]} material={fabricMat} castShadow>
            <cylinderGeometry args={[0.13, 0.18, 0.44, 16, 1, false]} />
          </mesh>
          {/* Left / Right Short Sleeves */}
          <mesh position={[-0.17, -0.07, 0]} rotation={[0, 0, 0.35]} material={fabricMat}>
            <boxGeometry args={[0.07, 0.12, 0.09]} />
          </mesh>
          <mesh position={[0.17, -0.07, 0]} rotation={[0, 0, -0.35]} material={fabricMat}>
            <boxGeometry args={[0.07, 0.12, 0.09]} />
          </mesh>
        </group>
      )}

      {type === "suit" && (
        <group position={[0, 0, 0]}>
          {/* Structured Padded Shoulder Yoke */}
          <mesh position={[0, -0.04, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[garmentWidth + 0.02, 0.08, garmentDepth + 0.01]} />
          </mesh>
          {/* Main Jacket Torso */}
          <mesh position={[0, -0.32, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[garmentWidth, garmentHeight - 0.08, garmentDepth]} />
          </mesh>
          {/* Folded Notch Lapels */}
          <mesh position={[-0.055, -0.16, garmentDepth / 2 + 0.006]} rotation={[0, 0, -0.12]} material={accentMat}>
            <boxGeometry args={[0.065, 0.22, 0.01]} />
          </mesh>
          <mesh position={[0.055, -0.16, garmentDepth / 2 + 0.006]} rotation={[0, 0, 0.12]} material={accentMat}>
            <boxGeometry args={[0.065, 0.22, 0.01]} />
          </mesh>
          {/* Jacket Left & Right Sleeves */}
          <mesh position={[-0.20, -0.28, 0]} rotation={[0, 0, 0.08]} material={fabricMat} castShadow>
            <boxGeometry args={[0.065, garmentHeight * 0.78, 0.11]} />
          </mesh>
          <mesh position={[0.20, -0.28, 0]} rotation={[0, 0, -0.08]} material={fabricMat} castShadow>
            <boxGeometry args={[0.065, garmentHeight * 0.78, 0.11]} />
          </mesh>
          {/* Buttons on Front Closure */}
          <mesh position={[0, -0.28, garmentDepth / 2 + 0.007]} material={hookMat}>
            <cylinderGeometry args={[0.005, 0.005, 0.004, 12]} />
          </mesh>
          <mesh position={[0, -0.36, garmentDepth / 2 + 0.007]} material={hookMat}>
            <cylinderGeometry args={[0.005, 0.005, 0.004, 12]} />
          </mesh>
        </group>
      )}

      {type === "shirt" && (
        <group position={[0, 0, 0]}>
          {/* Turn-down Collar */}
          <mesh position={[0, -0.018, 0]} material={accentMat}>
            <boxGeometry args={[0.18, 0.038, 0.11]} />
          </mesh>
          {/* Front Center Placket */}
          <mesh position={[0, -0.26, garmentDepth / 2 + 0.004]} material={accentMat}>
            <boxGeometry args={[0.035, garmentHeight - 0.04, 0.006]} />
          </mesh>
          {/* Main Shirt Body */}
          <mesh position={[0, -0.26, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[garmentWidth, garmentHeight - 0.04, garmentDepth]} />
          </mesh>
          {/* Left & Right Sleeves */}
          <mesh position={[-0.19, -0.24, 0]} rotation={[0, 0, 0.06]} material={fabricMat} castShadow>
            <boxGeometry args={[0.055, garmentHeight * 0.72, 0.09]} />
          </mesh>
          <mesh position={[0.19, -0.24, 0]} rotation={[0, 0, -0.06]} material={fabricMat} castShadow>
            <boxGeometry args={[0.055, garmentHeight * 0.72, 0.09]} />
          </mesh>
        </group>
      )}

      {type === "coat" && (
        <group position={[0, 0, 0]}>
          {/* Heavy Shoulder Yoke */}
          <mesh position={[0, -0.04, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[garmentWidth + 0.04, 0.09, garmentDepth + 0.02]} />
          </mesh>
          {/* Broad Shawl/Trench Collar */}
          <mesh position={[0, -0.14, garmentDepth / 2 + 0.008]} material={accentMat}>
            <boxGeometry args={[0.22, 0.18, 0.014]} />
          </mesh>
          {/* Heavy Long Coat Body */}
          <mesh position={[0, -0.36, 0]} material={fabricMat} castShadow>
            <boxGeometry args={[garmentWidth + 0.02, garmentHeight - 0.06, garmentDepth]} />
          </mesh>
          {/* Heavy Draped Sleeves */}
          <mesh position={[-0.22, -0.32, 0]} rotation={[0, 0, 0.07]} material={fabricMat} castShadow>
            <boxGeometry args={[0.075, garmentHeight * 0.82, 0.13]} />
          </mesh>
          <mesh position={[0.22, -0.32, 0]} rotation={[0, 0, -0.07]} material={fabricMat} castShadow>
            <boxGeometry args={[0.075, garmentHeight * 0.82, 0.13]} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Realistic Multi-Layer Folded Linen Stacks with Rounded Bullnose Creases
 */
export function FoldedTowels({
  color = "#E0AA24",
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
        roughness: 0.92,
        metalness: 0.01,
      }),
    [color]
  );

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i} position={[0, i * 0.042, 0]}>
          {/* Main flat folded body */}
          <mesh position={[0, 0, -0.01]} material={towelMat} castShadow>
            <boxGeometry args={[0.25, 0.034, 0.30]} />
          </mesh>
          {/* Rounded front bullnose fold */}
          <mesh position={[0, 0, 0.14]} rotation={[0, 0, Math.PI / 2]} material={towelMat}>
            <cylinderGeometry args={[0.017, 0.017, 0.25, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Realistic Rolled Luxury Towel with Spiral Wrap and Indented Core
 */
export function RolledTowel({
  color = "#E0AA24",
  position = [0, 0, 0],
}: {
  color?: string;
  position?: [number, number, number];
}) {
  const towelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.94,
        metalness: 0.01,
      }),
    [color]
  );

  const coreMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#9A7312",
        roughness: 0.9,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Outer rolled towel cylinder with soft rounded profile */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={towelMat} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.28, 20]} />
      </mesh>
      {/* Spiral outer fold ridge seam */}
      <mesh position={[0.038, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={towelMat}>
        <boxGeometry args={[0.014, 0.28, 0.012]} />
      </mesh>
      {/* Hollow center core indentation (front & rear) */}
      <mesh position={[0, 0, 0.141]} material={coreMat}>
        <circleGeometry args={[0.014, 16]} />
      </mesh>
      <mesh position={[0, 0, -0.141]} rotation={[0, Math.PI, 0]} material={coreMat}>
        <circleGeometry args={[0.014, 16]} />
      </mesh>
    </group>
  );
}

/**
 * Luxury Leather Storage Chest with Stitched Lid and Brass Pull Tab (Reference 1)
 */
export function StorageBox({
  color = "#8A252E", // Signature Burgundy red as in Ref 1
  position = [0, 0, 0],
  width = 0.40,
  height = 0.23,
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
        roughness: 0.62,
        metalness: 0.06,
      }),
    [color]
  );

  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#C5A059",
        roughness: 0.28,
        metalness: 0.88,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Box Main Body */}
      <mesh position={[0, height / 2, 0]} material={boxMat} castShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Overhanging Stitched Lid */}
      <mesh position={[0, height + 0.012, 0]} material={boxMat}>
        <boxGeometry args={[width + 0.018, 0.024, depth + 0.018]} />
      </mesh>

      {/* Front Brass/Leather Pull Tab with Ring */}
      <mesh position={[0, height / 2, depth / 2 + 0.009]} material={metalMat}>
        <boxGeometry args={[0.075, 0.024, 0.008]} />
      </mesh>
    </group>
  );
}

/**
 * Chrome Wire Laundry Basket Drawer with Folded Linens (Reference 1 Under-Drawer Unit)
 */
export function WireBasket({
  position = [0, 0, 0],
  width = 0.74,
  height = 0.17,
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
        color: "#C8CED4",
        roughness: 0.18,
        metalness: 0.94,
      }),
    []
  );

  const linenMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#F6F2EA",
        roughness: 0.92,
      }),
    []
  );

  return (
    <group position={position}>
      {/* Top Rim Wire */}
      <mesh position={[0, height, 0]} material={chromeMat}>
        <boxGeometry args={[width, 0.008, depth]} />
      </mesh>

      {/* Bottom Rim Wire */}
      <mesh position={[0, 0.004, 0]} material={chromeMat}>
        <boxGeometry args={[width, 0.006, depth]} />
      </mesh>

      {/* Vertical Front Wire Rungs */}
      {[-0.30, -0.15, 0, 0.15, 0.30].map((x, i) => (
        <mesh
          key={i}
          position={[x, height / 2, depth / 2]}
          material={chromeMat}
        >
          <cylinderGeometry args={[0.003, 0.003, height, 8]} />
        </mesh>
      ))}

      {/* Folded Clean Linens Inside */}
      <mesh position={[0, height * 0.48, 0]} material={linenMat} castShadow>
        <boxGeometry args={[width * 0.90, height * 0.72, depth * 0.88]} />
      </mesh>
    </group>
  );
}

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { createParquetFloorTexture } from "@/lib/materials";

interface ShowroomEnvironmentProps {
  activeVariant?: string;
  widthMeters?: number;
  heightMeters?: number;
  shape?: "straight" | "lshape";
  legBMeters?: number;
}

export function ShowroomEnvironment({
  activeVariant,
  widthMeters = 2.74,
  heightMeters = 2.60,
  shape = "straight",
  legBMeters = 2.0,
}: ShowroomEnvironmentProps) {
  // Determine alcove wall spread & ceiling height dynamically from physical wardrobe dimensions
  const halfW = widthMeters / 2;
  const pilasterX = Math.max(halfW + 0.44, activeVariant === "full-modular" ? 2.50 : 1.75);
  const ceilingY = Math.max(2.20, heightMeters + 0.006);
  const rearWallZ = shape === "lshape" ? -legBMeters / 2 - 0.015 : -0.32;

  // Parquet hardwood floor texture
  const parquetTexture = useMemo(() => {
    return createParquetFloorTexture();
  }, []);

  const floorMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#6E5038",
      map: parquetTexture,
      roughness: 0.42,
      metalness: 0.08,
      envMapIntensity: 0.7,
    });
  }, [parquetTexture]);

  const wallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ECE7DE",
      roughness: 0.9,
      metalness: 0.01,
    });
  }, []);

  const skirtingMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#DFD9CD",
      roughness: 0.6,
      metalness: 0.05,
    });
  }, []);

  const ceilingMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#F6F4EE",
      roughness: 0.95,
    });
  }, []);

  const switchPlateMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#FAF8F5",
      roughness: 0.35,
      metalness: 0.05,
    });
  }, []);

  return (
    <group>
      {/* 1. WARM PARQUET HARDWOOD FLOOR */}
      <mesh
        position={[0, -0.005, 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={floorMat}
      >
        <planeGeometry args={[18, 14]} />
      </mesh>

      {/* 2. REAR ARCHITECTURAL WALL */}
      <mesh position={[0, ceilingY / 2, rearWallZ]} receiveShadow material={wallMat}>
        <planeGeometry args={[18, ceilingY + 0.4]} />
      </mesh>

      {shape === "straight" ? (
        <>
          {/* 3. ALCOVE RETURN WALLS FRAMING THE STRAIGHT WARDROBE */}
          <mesh position={[-pilasterX, ceilingY / 2, 0.05]} receiveShadow material={wallMat}>
            <boxGeometry args={[0.46, ceilingY, 0.72]} />
          </mesh>
          <mesh position={[pilasterX, ceilingY / 2, 0.05]} receiveShadow material={wallMat}>
            <boxGeometry args={[0.46, ceilingY, 0.72]} />
          </mesh>

          {/* 4. LIGHT SWITCH ON LEFT WALL */}
          <group position={[-pilasterX + 0.23, 1.25, 0.28]}>
            <mesh material={switchPlateMat}>
              <boxGeometry args={[0.012, 0.12, 0.08]} />
            </mesh>
            <mesh position={[0.006, 0, 0]} material={switchPlateMat}>
              <boxGeometry args={[0.004, 0.04, 0.03]} />
            </mesh>
          </group>
        </>
      ) : (
        /* L-Shape Left Return Wall Behind Leg B */
        <mesh
          position={[-halfW - 0.015, ceilingY / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
          material={wallMat}
        >
          <planeGeometry args={[14, ceilingY + 0.4]} />
        </mesh>
      )}

      {/* 5. BASEBOARD SKIRTING TRIM */}
      <mesh position={[0, 0.045, rearWallZ + 0.005]} material={skirtingMat}>
        <boxGeometry args={[18, 0.09, 0.02]} />
      </mesh>

      {/* 6. CEILING SOFFIT / RECESS */}
      <mesh position={[0, ceilingY, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}>
        <planeGeometry args={[18, 14]} />
      </mesh>
    </group>
  );
}

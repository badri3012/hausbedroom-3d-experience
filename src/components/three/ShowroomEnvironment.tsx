"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { createParquetFloorTexture } from "@/lib/materials";

export function ShowroomEnvironment() {
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
      {/* 1. WARM PARQUET HARDWOOD FLOOR (Reference Image 3) */}
      <mesh
        position={[0, -0.005, 0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        material={floorMat}
      >
        <planeGeometry args={[14, 10]} />
      </mesh>

      {/* 2. REAR ARCHITECTURAL WALL */}
      <mesh position={[0, 2.2, -0.32]} receiveShadow material={wallMat}>
        <planeGeometry args={[14, 5.0]} />
      </mesh>

      {/* 3. ALCOVE RETURN WALLS FRAMING THE WARDROBE (Reference Image 3) */}
      {/* Left alcove drywall return pilaster with clean outward travel clearance */}
      <mesh position={[-2.05, 1.25, 0.05]} receiveShadow material={wallMat}>
        <boxGeometry args={[0.46, 2.50, 0.72]} />
      </mesh>
      {/* Right alcove drywall return pilaster with clean outward travel clearance */}
      <mesh position={[2.05, 1.25, 0.05]} receiveShadow material={wallMat}>
        <boxGeometry args={[0.46, 2.50, 0.72]} />
      </mesh>

      {/* 4. LIGHT SWITCH ON LEFT WALL (Authentic Reference 3 Detail) */}
      <group position={[-1.82, 1.30, 0.28]}>
        {/* Switch faceplate */}
        <mesh material={switchPlateMat}>
          <boxGeometry args={[0.012, 0.12, 0.08]} />
        </mesh>
        {/* Rocker button */}
        <mesh position={[0.006, 0, 0]} material={switchPlateMat}>
          <boxGeometry args={[0.004, 0.04, 0.03]} />
        </mesh>
      </group>

      {/* 5. BASEBOARD SKIRTING TRIM */}
      <mesh position={[0, 0.045, -0.315]} material={skirtingMat}>
        <boxGeometry args={[14, 0.09, 0.02]} />
      </mesh>

      {/* 6. CEILING SOFFIT / RECESS */}
      <mesh position={[0, 2.65, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}>
        <planeGeometry args={[14, 10]} />
      </mesh>
    </group>
  );
}

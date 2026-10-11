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

      {/* 3. BASEBOARD SKIRTING TRIM */}
      <mesh position={[0, 0.045, -0.315]} material={skirtingMat}>
        <boxGeometry args={[14, 0.09, 0.02]} />
      </mesh>

      {/* 4. CEILING SOFFIT / RECESS */}
      <mesh position={[0, 2.7, 0.4]} rotation={[Math.PI / 2, 0, 0]} material={ceilingMat}>
        <planeGeometry args={[14, 10]} />
      </mesh>
    </group>
  );
}

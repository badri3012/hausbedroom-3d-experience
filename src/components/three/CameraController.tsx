"use client";

import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { CameraPreset } from "@/types/wardrobe";

interface CameraControllerProps {
  preset: CameraPreset;
  interiorViewActive: boolean;
  autoRotate: boolean;
}

// Camera presets with comfortable luxury framing margins for 3.0m - 3.6m models
const PRESET_CONFIGS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  default: {
    pos: [2.6, 1.45, 4.4],
    target: [0, 1.18, 0],
  },
  front: {
    pos: [0, 1.20, 4.6],
    target: [0, 1.20, 0],
  },
  interior: {
    pos: [0, 0.95, 2.3],
    target: [0, 0.85, 0],
  },
  side: {
    pos: [3.8, 1.40, 3.4],
    target: [0, 1.18, 0],
  },
  top: {
    pos: [1.2, 3.4, 4.2],
    target: [0, 1.10, 0],
  },
};

export function CameraController({
  preset,
  interiorViewActive,
  autoRotate,
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const targetPosRef = useRef(new THREE.Vector3(...PRESET_CONFIGS.default.pos));
  const targetLookAtRef = useRef(new THREE.Vector3(...PRESET_CONFIGS.default.target));
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const activePreset = interiorViewActive ? "interior" : preset;
    const config = PRESET_CONFIGS[activePreset] || PRESET_CONFIGS.default;
    targetPosRef.current.set(...config.pos);
    targetLookAtRef.current.set(...config.target);
    isTransitioningRef.current = true;
  }, [preset, interiorViewActive]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioningRef.current) {
      const lerpSpeed = Math.min(1, delta * 3.8);

      camera.position.lerp(targetPosRef.current, lerpSpeed);
      controlsRef.current.target.lerp(targetLookAtRef.current, lerpSpeed);
      controlsRef.current.update();

      const distPos = camera.position.distanceTo(targetPosRef.current);
      const distTarget = controlsRef.current.target.distanceTo(targetLookAtRef.current);

      if (distPos < 0.02 && distTarget < 0.02) {
        camera.position.copy(targetPosRef.current);
        controlsRef.current.target.copy(targetLookAtRef.current);
        controlsRef.current.update();
        isTransitioningRef.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
      minDistance={1.5}
      maxDistance={7.5}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.04} // Clamped right above floor level
      enableDamping
      dampingFactor={0.06}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}

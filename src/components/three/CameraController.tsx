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
    pos: [0.3, 1.25, 4.35],
    target: [0, 1.20, 0],
  },
  front: {
    pos: [0, 1.22, 4.35],
    target: [0, 1.20, 0],
  },
  interior: {
    pos: [0, 1.18, 3.7],
    target: [0, 1.18, 0],
  },
  side: {
    pos: [3.4, 1.35, 3.2],
    target: [0, 1.20, 0],
  },
  top: {
    pos: [0.8, 3.4, 3.8],
    target: [0, 1.10, 0],
  },
};

export function CameraController({
  preset,
  interiorViewActive,
  autoRotate,
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();

  const targetPosRef = useRef(new THREE.Vector3(...PRESET_CONFIGS.default.pos));
  const targetLookAtRef = useRef(new THREE.Vector3(...PRESET_CONFIGS.default.target));
  const isTransitioningRef = useRef(false);

  // Bucket the aspect ratio so tiny resizes do not restart the camera transition
  const aspectBucket = Math.round((size.width / Math.max(1, size.height)) * 10) / 10;

  useEffect(() => {
    const activePreset = interiorViewActive ? "interior" : preset;
    const config = PRESET_CONFIGS[activePreset] || PRESET_CONFIGS.default;
    const target = new THREE.Vector3(...config.target);
    const pos = new THREE.Vector3(...config.pos);

    // Fit the whole wardrobe (3.0 m wide, 2.4 m tall + margins) for this aspect
    // ratio by pulling back along the preset's own view direction only if needed.
    if (activePreset !== "interior") {
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 38;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const FIT_HALF_W = 1.95; // 1.5 m half-width + ~0.45 m margin
      const FIT_HALF_H = 1.45; // 1.2 m half-height + ~0.25 m margin (floor + header)
      const dH = FIT_HALF_W / (tanHalf * aspectBucket);
      const dV = FIT_HALF_H / tanHalf;
      const fitDist = Math.max(dH, dV) + 0.35; // + door-plane / perspective allowance
      const offset = pos.clone().sub(target);
      const scale = Math.max(1, fitDist / offset.length());
      pos.copy(target).add(offset.multiplyScalar(scale));
    }

    targetPosRef.current.copy(pos);
    targetLookAtRef.current.copy(target);
    isTransitioningRef.current = true;
  }, [preset, interiorViewActive, aspectBucket, camera]);

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
      maxDistance={12}
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

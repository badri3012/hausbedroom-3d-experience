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
  activeVariant?: string;
  widthMeters?: number;
  heightMeters?: number;
  shape?: "straight" | "lshape";
  legBMeters?: number;
}

// Camera presets with comfortable luxury framing margins
const PRESET_CONFIGS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  default: {
    pos: [0.22, 1.30, 4.35],
    target: [0, 1.25, 0],
  },
  front: {
    pos: [0, 1.28, 4.35],
    target: [0, 1.25, 0],
  },
  interior: {
    pos: [0, 1.25, 3.6],
    target: [0, 1.25, 0],
  },
  side: {
    pos: [3.2, 1.35, 3.2],
    target: [0, 1.25, 0],
  },
  top: {
    pos: [0.7, 3.3, 3.8],
    target: [0, 1.15, 0],
  },
};

export function CameraController({
  preset,
  interiorViewActive,
  autoRotate,
  activeVariant,
  widthMeters = 2.74,
  heightMeters = 2.60,
  shape = "straight",
  legBMeters = 2.0,
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
    const centerY = heightMeters * 0.48;
    const target = new THREE.Vector3(0, centerY, shape === "lshape" ? -0.15 : 0);
    const pos = new THREE.Vector3(...config.pos);
    pos.y = centerY + (config.pos[1] - config.target[1]);

    if (shape === "lshape" && (activePreset === "default" || activePreset === "front")) {
      // Angle camera slightly to showcase both Leg A and 90° Return Leg B
      pos.x = Math.max(0.85, widthMeters * 0.32);
    }

    // Automatically frame the complete wardrobe based on actual physical dimensions
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 38;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const effectiveHalfW =
      shape === "lshape"
        ? Math.max(widthMeters, legBMeters) * 0.58 + 0.35
        : widthMeters * 0.50 + 0.32;
    const effectiveHalfH = heightMeters * 0.50 + 0.38; // Extra vertical padding so top/bottom HUD bars never overlap wardrobe

    const dH = effectiveHalfW / (tanHalf * Math.max(0.55, aspectBucket));
    const dV = effectiveHalfH / tanHalf;
    const baseFitDist = Math.max(dH, dV) + (shape === "lshape" ? legBMeters * 0.38 : 0.42);
    const fitDist = activePreset === "interior" ? baseFitDist * 0.82 : baseFitDist;

    const offset = pos.clone().sub(target);
    const scale = fitDist / Math.max(0.1, offset.length());
    pos.copy(target).add(offset.multiplyScalar(scale));

    targetPosRef.current.copy(pos);
    targetLookAtRef.current.copy(target);
    isTransitioningRef.current = true;
  }, [
    preset,
    interiorViewActive,
    aspectBucket,
    camera,
    activeVariant,
    widthMeters,
    heightMeters,
    shape,
    legBMeters,
  ]);

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

"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DoorPanelOption, FrameFinishOption } from "@/types/wardrobe";

interface SlidingDoorProps {
  id: string;
  name: string;
  width: number;       // in meters, e.g. 1.14
  height: number;      // in meters, e.g. 2.34
  thickness?: number;  // in meters, e.g. 0.028
  closedX: number;     // initial parked X position (-0.93 or +0.93)
  openOffset: number;  // slide delta to center (+0.93 or -0.93)
  trackZ: number;      // track depth offset (0.316 or 0.276)
  isOpen: boolean;
  onToggle: () => void;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  hasBands?: boolean;  // Reference 3 top & bottom opaque bands
  handleSide?: "left" | "right";
}

export function SlidingDoor({
  id,
  name,
  width,
  height,
  thickness = 0.028,
  closedX,
  openOffset,
  trackZ,
  isOpen,
  onToggle,
  frameMaterial,
  doorPanelMaterial,
  hasBands = true,
  handleSide = "right",
}: SlidingDoorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Materials
  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.1,
    });
  }, [frameMaterial]);

  // Main glass/panel material: Realistic frosted glass matching Reference 3
  const pbrPanelMat = useMemo(() => {
    if (doorPanelMaterial.isGlass) {
      if (doorPanelMaterial.id === "frosted-glass") {
        // Satin acid-etched privacy glass (diffuse scattering, soft milky frosted look)
        return new THREE.MeshStandardMaterial({
          color: doorPanelMaterial.color,
          roughness: doorPanelMaterial.roughness,
          metalness: doorPanelMaterial.metalness,
          transparent: true,
          opacity: doorPanelMaterial.opacity,
          depthWrite: true,
          roughnessMap: null,
        });
      } else {
        // Smoked tinted glass
        return new THREE.MeshPhysicalMaterial({
          color: doorPanelMaterial.color,
          roughness: doorPanelMaterial.roughness,
          metalness: doorPanelMaterial.metalness,
          transmission: doorPanelMaterial.transmission,
          ior: doorPanelMaterial.ior,
          transparent: true,
          opacity: doorPanelMaterial.opacity,
          thickness: 0.06,
        });
      }
    } else {
      return new THREE.MeshStandardMaterial({
        color: doorPanelMaterial.color,
        roughness: doorPanelMaterial.roughness,
        metalness: doorPanelMaterial.metalness,
      });
    }
  }, [doorPanelMaterial]);

  // Architectural solid band material (Off-white / pale alabaster as in Reference 3)
  const bandMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ECEAE4",
      roughness: 0.78,
      metalness: 0.02,
    });
  }, []);

  // Frame divider / mullion material
  const mullionMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
    });
  }, [frameMaterial]);

  // Smooth sliding animation along horizontal track
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetX = isOpen ? closedX + openOffset : closedX;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      delta * 6.5
    );
  });

  // Slim contemporary aluminium profile dimensions matching Reference 3
  const frameBorderWidth = 0.026; // Slim 26mm profile
  // Exact vertical ratios from Reference 3 photograph:
  // Top band: 0.42m (~18%), Center frosted: 1.46m (~62%), Bottom band: 0.42m (~18%)
  const topBandHeight = hasBands ? 0.42 : 0;
  const bottomBandHeight = hasBands ? 0.42 : 0;
  const glassHeight = height - topBandHeight - bottomBandHeight - frameBorderWidth * 2 - 0.024;

  return (
    <group
      ref={groupRef}
      position={[closedX, 0, trackZ]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "auto";
        }
      }}
    >
      {/* Visual Hover Feedback Subtle Frame Highlight */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width + 0.015, height + 0.015, thickness + 0.008]} />
          <meshBasicMaterial
            color="#C5A059"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* ========================================================= */}
      {/* 1. SLIM ARCHITECTURAL BLACK ALUMINIUM DOOR PROFILE        */}
      {/* ========================================================= */}

      {/* Top frame horizontal rail */}
      <mesh
        position={[0, height / 2 - frameBorderWidth / 2, 0]}
        material={pbrFrameMat}
        castShadow
      >
        <boxGeometry args={[width, frameBorderWidth, thickness]} />
      </mesh>
      {/* Bottom frame horizontal rail */}
      <mesh
        position={[0, -height / 2 + frameBorderWidth / 2, 0]}
        material={pbrFrameMat}
        castShadow
      >
        <boxGeometry args={[width, frameBorderWidth, thickness]} />
      </mesh>
      {/* Left frame vertical stile */}
      <mesh
        position={[-width / 2 + frameBorderWidth / 2, 0, 0]}
        material={pbrFrameMat}
        castShadow
      >
        <boxGeometry args={[frameBorderWidth, height, thickness]} />
      </mesh>
      {/* Right frame vertical stile */}
      <mesh
        position={[width / 2 - frameBorderWidth / 2, 0, 0]}
        material={pbrFrameMat}
        castShadow
      >
        <boxGeometry args={[frameBorderWidth, height, thickness]} />
      </mesh>

      {/* 2. RECESSED VERTICAL HANDLE GRIP PROFILE (ON INNER STILE) */}
      <mesh
        position={[
          handleSide === "right"
            ? width / 2 - frameBorderWidth / 2
            : -width / 2 + frameBorderWidth / 2,
          0,
          thickness / 2 + 0.003,
        ]}
        material={pbrFrameMat}
      >
        <boxGeometry args={[0.012, 0.42, 0.008]} />
      </mesh>

      {/* 3. DOOR INFILL PANELS (Reference Image 3 Proportion) */}
      {hasBands ? (
        <>
          {/* Top Solid Architectural Band (Pale Alabaster Panel) */}
          <mesh
            position={[
              0,
              height / 2 - frameBorderWidth - topBandHeight / 2,
              0,
            ]}
            material={bandMat}
            castShadow
          >
            <boxGeometry
              args={[
                width - frameBorderWidth * 2,
                topBandHeight,
                thickness * 0.45,
              ]}
            />
          </mesh>

          {/* Top Horizontal Dividing Mullion (Slim Black Bar) */}
          <mesh
            position={[
              0,
              height / 2 - frameBorderWidth - topBandHeight - 0.006,
              0,
            ]}
            material={mullionMat}
          >
            <boxGeometry
              args={[width - frameBorderWidth * 2, 0.012, thickness]}
            />
          </mesh>

          {/* Center Main Frosted Privacy Glass Panel */}
          <mesh
            position={[
              0,
              (bottomBandHeight - topBandHeight) / 2,
              0,
            ]}
            material={pbrPanelMat}
            castShadow
          >
            <boxGeometry
              args={[
                width - frameBorderWidth * 2,
                glassHeight,
                0.008,
              ]}
            />
          </mesh>

          {/* Bottom Horizontal Dividing Mullion */}
          <mesh
            position={[
              0,
              -height / 2 + frameBorderWidth + bottomBandHeight + 0.006,
              0,
            ]}
            material={mullionMat}
          >
            <boxGeometry
              args={[width - frameBorderWidth * 2, 0.012, thickness]}
            />
          </mesh>

          {/* Bottom Solid Architectural Band */}
          <mesh
            position={[
              0,
              -height / 2 + frameBorderWidth + bottomBandHeight / 2,
              0,
            ]}
            material={bandMat}
            castShadow
          >
            <boxGeometry
              args={[
                width - frameBorderWidth * 2,
                bottomBandHeight,
                thickness * 0.45,
              ]}
            />
          </mesh>
        </>
      ) : (
        /* Full Single Infill Panel */
        <mesh position={[0, 0, 0]} material={pbrPanelMat} castShadow>
          <boxGeometry
            args={[
              width - frameBorderWidth * 2,
              height - frameBorderWidth * 2,
              0.008,
            ]}
          />
        </mesh>
      )}

      {/* Top track roller carriage mounts */}
      <mesh
        position={[-width * 0.32, height / 2 + 0.012, 0]}
        material={pbrFrameMat}
      >
        <boxGeometry args={[0.07, 0.018, thickness * 0.8]} />
      </mesh>
      <mesh
        position={[width * 0.32, height / 2 + 0.012, 0]}
        material={pbrFrameMat}
      >
        <boxGeometry args={[0.07, 0.018, thickness * 0.8]} />
      </mesh>
    </group>
  );
}

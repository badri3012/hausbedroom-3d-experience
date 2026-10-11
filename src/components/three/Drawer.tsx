"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WoodFinishOption, FrameFinishOption } from "@/types/wardrobe";

interface DrawerProps {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  isOpen: boolean;
  onToggle: () => void;
  woodMaterial: WoodFinishOption;
  frameMaterial: FrameFinishOption;
  woodTexture?: THREE.CanvasTexture | null;
  frontType?: "wood" | "smoked-glass";
  handleStyle?: "horizontal-bar" | "recessed-lip";
  maxSlide?: number;
}

export function Drawer({
  id,
  name,
  width,
  height,
  depth,
  position,
  isOpen,
  onToggle,
  woodMaterial,
  frameMaterial,
  woodTexture,
  frontType = "wood",
  handleStyle = "horizontal-bar",
  maxSlide = 0.38,
}: DrawerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Materials
  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.85,
    });
  }, [woodMaterial, woodTexture]);

  const pbrInteriorMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#E2DAD0",
      roughness: 0.82,
      metalness: 0.02,
    });
  }, []);

  const pbrHandleMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.1,
    });
  }, [frameMaterial]);

  const pbrGlassFrontMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#18181A",
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.65,
      ior: 1.5,
      transparent: true,
      opacity: 0.92,
    });
  }, []);

  const pbrDividerMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#7E6E5C", // Luxury velvet watch/jewelry tray liner
      roughness: 0.92,
    });
  }, []);

  // Smooth slide animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetZ = isOpen ? position[2] + maxSlide : position[2];
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      delta * 7
    );
  });

  const wallThickness = 0.016;
  const shadowReveal = 0.003; // Realistic 3mm shadow reveal around drawer front

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
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
      {/* Visual Hover Feedback */}
      {hovered && (
        <mesh position={[0, 0, depth / 2]}>
          <boxGeometry args={[width, height, 0.02]} />
          <meshBasicMaterial
            color="#C5A059"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* 1. FRONT DRAWER FACE WITH REALISTIC SHADOW REVEAL */}
      {frontType === "smoked-glass" ? (
        <group position={[0, 0, depth / 2]}>
          <mesh material={pbrGlassFrontMat} castShadow>
            <boxGeometry args={[width - shadowReveal * 2, height - shadowReveal * 2, 0.012]} />
          </mesh>
          <mesh material={pbrHandleMat}>
            <boxGeometry args={[width, height, 0.014]} />
          </mesh>
        </group>
      ) : (
        /* Solid Wood Front Face */
        <group position={[0, 0, depth / 2]}>
          <mesh
            material={pbrWoodMat}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[width - shadowReveal * 2, height - shadowReveal * 2, 0.018]} />
          </mesh>
        </group>
      )}

      {/* 2. DRAWER PULL HANDLE (Matching Reference Image 3) */}
      {handleStyle === "horizontal-bar" ? (
        <group position={[0, 0, depth / 2 + 0.014]}>
          {/* Horizontal sleek bar */}
          <mesh material={pbrHandleMat} castShadow>
            <boxGeometry args={[0.24, 0.010, 0.012]} />
          </mesh>
          {/* Stand-off posts */}
          <mesh position={[-0.09, 0, -0.005]} material={pbrHandleMat}>
            <boxGeometry args={[0.008, 0.008, 0.010]} />
          </mesh>
          <mesh position={[0.09, 0, -0.005]} material={pbrHandleMat}>
            <boxGeometry args={[0.008, 0.008, 0.010]} />
          </mesh>
        </group>
      ) : (
        /* Recessed continuous top lip handle */
        <mesh
          position={[0, height / 2 - 0.008, depth / 2 + 0.008]}
          material={pbrHandleMat}
        >
          <boxGeometry args={[width * 0.45, 0.012, 0.012]} />
        </mesh>
      )}

      {/* 3. INTERNAL DRAWER BOX */}
      {/* Bottom Panel */}
      <mesh
        position={[0, -height / 2 + wallThickness / 2, 0]}
        material={pbrInteriorMat}
        receiveShadow
      >
        <boxGeometry
          args={[
            width - wallThickness * 2,
            wallThickness,
            depth - wallThickness,
          ]}
        />
      </mesh>

      {/* Back Wall */}
      <mesh
        position={[0, 0, -depth / 2 + wallThickness / 2]}
        material={pbrInteriorMat}
      >
        <boxGeometry
          args={[
            width - wallThickness * 2,
            height - wallThickness,
            wallThickness,
          ]}
        />
      </mesh>

      {/* Left Wall */}
      <mesh
        position={[-width / 2 + wallThickness / 2, 0, 0]}
        material={pbrInteriorMat}
      >
        <boxGeometry
          args={[wallThickness, height - wallThickness, depth - wallThickness]}
        />
      </mesh>

      {/* Right Wall */}
      <mesh
        position={[width / 2 - wallThickness / 2, 0, 0]}
        material={pbrInteriorMat}
      >
        <boxGeometry
          args={[wallThickness, height - wallThickness, depth - wallThickness]}
        />
      </mesh>

      {/* 4. INTERNAL ORGANIZER TRAY (Revealed when open) */}
      <group position={[0, -height / 4, 0]}>
        <mesh material={pbrDividerMat}>
          <boxGeometry args={[0.006, 0.055, depth * 0.7]} />
        </mesh>
        <mesh position={[0, 0, -depth * 0.18]} material={pbrDividerMat}>
          <boxGeometry args={[width * 0.72, 0.055, 0.006]} />
        </mesh>
        <mesh position={[0, 0, depth * 0.18]} material={pbrDividerMat}>
          <boxGeometry args={[width * 0.72, 0.055, 0.006]} />
        </mesh>
      </group>

      {/* 5. SOFT-CLOSE CONCEALED UNDER-MOUNT RUNNERS */}
      <mesh
        position={[-width / 2 + 0.012, -height / 2 - 0.005, 0]}
        material={pbrHandleMat}
      >
        <boxGeometry args={[0.010, 0.010, depth * 0.9]} />
      </mesh>
      <mesh
        position={[width / 2 - 0.012, -height / 2 - 0.005, 0]}
        material={pbrHandleMat}
      >
        <boxGeometry args={[0.010, 0.010, depth * 0.9]} />
      </mesh>
    </group>
  );
}

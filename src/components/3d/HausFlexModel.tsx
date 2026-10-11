"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MaterialOption } from "@/types/showroom";

interface HausFlexModelProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isExploded: boolean;
  doorsOpen: boolean;
  drawersOpen: boolean;
  frameMaterial: MaterialOption;
  woodMaterial: MaterialOption;
  glassMaterial: MaterialOption;
}

export default function HausFlexModel({
  selectedComponentId,
  onSelectComponent,
  isExploded,
  doorsOpen,
  drawersOpen,
  frameMaterial,
  woodMaterial,
  glassMaterial,
}: HausFlexModelProps) {
  // Animation state references
  const animRef = useRef({
    explodeProgress: 0,
    doorAngle: 0,
    drawerSlide: 0,
  });

  // Mesh refs for animated sub-assemblies
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const topDrawerRef = useRef<THREE.Group>(null);
  const bottomDrawerRef = useRef<THREE.Group>(null);
  const leftFrameRef = useRef<THREE.Group>(null);
  const rightFrameRef = useRef<THREE.Group>(null);
  const topShelfRef = useRef<THREE.Group>(null);
  const midShelfRef = useRef<THREE.Group>(null);
  const railRef = useRef<THREE.Group>(null);
  const trouserRackRef = useRef<THREE.Group>(null);

  // Dynamic PBR Materials
  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.2,
    });
  }, [frameMaterial]);

  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.8,
    });
  }, [woodMaterial]);

  const pbrGlassMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: glassMaterial.color,
      roughness: glassMaterial.roughness,
      metalness: glassMaterial.metalness,
      transmission: glassMaterial.transmission ?? 0.85,
      ior: glassMaterial.ior ?? 1.5,
      transparent: true,
      opacity: 0.7,
      thickness: 0.5,
    });
  }, [glassMaterial]);

  const pbrEmissiveLedMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#FFF5E0",
      emissive: "#FFE6B3",
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
  }, []);

  // Selection highlight material helper
  const getMaterialFor = (meshId: string, baseMat: THREE.Material) => {
    if (selectedComponentId === meshId) {
      const clone = baseMat.clone() as THREE.MeshStandardMaterial;
      clone.emissive = new THREE.Color("#C5A059");
      clone.emissiveIntensity = 0.45;
      return clone;
    }
    return baseMat;
  };

  useFrame((_, delta) => {
    const lerpSpeed = delta * 6;

    // Explode Interpolation (0 to 1)
    const targetExplode = isExploded ? 1 : 0;
    animRef.current.explodeProgress = THREE.MathUtils.lerp(
      animRef.current.explodeProgress,
      targetExplode,
      lerpSpeed
    );

    // Door Angle Interpolation (0 to 95 degrees in rad)
    const targetDoor = doorsOpen ? Math.PI * 0.55 : 0;
    animRef.current.doorAngle = THREE.MathUtils.lerp(
      animRef.current.doorAngle,
      targetDoor,
      lerpSpeed
    );

    // Drawer Slide Interpolation (0 to 0.42m)
    const targetDrawer = drawersOpen ? 0.42 : 0;
    animRef.current.drawerSlide = THREE.MathUtils.lerp(
      animRef.current.drawerSlide,
      targetDrawer,
      lerpSpeed
    );

    const exp = animRef.current.explodeProgress;

    // Apply Exploded View Translations
    if (leftFrameRef.current) leftFrameRef.current.position.x = -0.6 - exp * 0.35;
    if (rightFrameRef.current) rightFrameRef.current.position.x = 0.6 + exp * 0.35;
    if (topShelfRef.current) topShelfRef.current.position.y = 0.9 + exp * 0.25;
    if (midShelfRef.current) midShelfRef.current.position.y = 0.2 + exp * 0.15;
    if (railRef.current) railRef.current.position.z = exp * 0.3;
    if (trouserRackRef.current) trouserRackRef.current.position.y = -0.3 - exp * 0.15;

    // Apply Door Hinged Rotation + Explode Offset
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = animRef.current.doorAngle;
      leftDoorRef.current.position.z = 0.26 + exp * 0.4;
      leftDoorRef.current.position.x = -0.58 - exp * 0.2;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = -animRef.current.doorAngle;
      rightDoorRef.current.position.z = 0.26 + exp * 0.4;
      rightDoorRef.current.position.x = 0.58 + exp * 0.2;
    }

    // Apply Drawer Slide Translation + Explode Offset
    if (topDrawerRef.current) {
      topDrawerRef.current.position.z = animRef.current.drawerSlide + exp * 0.25;
      topDrawerRef.current.position.y = -0.55 - exp * 0.1;
    }
    if (bottomDrawerRef.current) {
      bottomDrawerRef.current.position.z = animRef.current.drawerSlide * 0.95 + exp * 0.35;
      bottomDrawerRef.current.position.y = -0.9 - exp * 0.2;
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    let current = e.object;
    while (current && !current.name) {
      current = current.parent;
    }
    if (current && current.name) {
      onSelectComponent(current.name);
    }
  };

  return (
    <group onPointerDown={handlePointerDown} position={[0, 0, 0]}>
      {/* 1. STRUCTURAL FRAMEWORK */}
      {/* Left Support Column */}
      <group ref={leftFrameRef} name="hausflex.frame.left" position={[-0.6, 0, 0]}>
        <mesh
          material={getMaterialFor("hausflex.frame.left", pbrFrameMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.04, 2.3, 0.5]} />
        </mesh>
      </group>

      {/* Right Support Column */}
      <group ref={rightFrameRef} name="hausflex.frame.right" position={[0.6, 0, 0]}>
        <mesh
          material={getMaterialFor("hausflex.frame.right", pbrFrameMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.04, 2.3, 0.5]} />
        </mesh>
      </group>

      {/* Upper Structural Frame Header */}
      <group name="hausflex.frame.top" position={[0, 1.13, 0]}>
        <mesh
          material={getMaterialFor("hausflex.frame.top", pbrFrameMat)}
          castShadow
        >
          <boxGeometry args={[1.22, 0.04, 0.5]} />
        </mesh>
      </group>

      {/* Recessed Vertical LED Strip */}
      <group name="hausflex.lighting.led" position={[-0.57, 0, 0.23]}>
        <mesh material={getMaterialFor("hausflex.lighting.led", pbrEmissiveLedMat)}>
          <boxGeometry args={[0.01, 2.2, 0.015]} />
        </mesh>
      </group>

      {/* 2. STORAGE SHELVES */}
      {/* Upper Storage Shelf */}
      <group ref={topShelfRef} name="hausflex.shelf.top" position={[0, 0.9, 0]}>
        <mesh
          material={getMaterialFor("hausflex.shelf.top", pbrWoodMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.16, 0.025, 0.48]} />
        </mesh>
      </group>

      {/* Mid Display Shelf */}
      <group ref={midShelfRef} name="hausflex.shelf.middle" position={[0, 0.2, 0]}>
        <mesh
          material={getMaterialFor("hausflex.shelf.middle", pbrWoodMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.16, 0.025, 0.48]} />
        </mesh>
      </group>

      {/* 3. GARMENT HANGING RAIL */}
      <group ref={railRef} name="hausflex.rail.main" position={[0, 0.8, 0]}>
        {/* Rail Tube */}
        <mesh
          rotation={[0, 0, Math.PI / 2]}
          material={getMaterialFor("hausflex.rail.main", pbrFrameMat)}
          castShadow
        >
          <cylinderGeometry args={[0.015, 0.015, 1.16, 16]} />
        </mesh>

        {/* Hangers Sim Silhouette */}
        <group position={[-0.3, -0.22, 0]}>
          {[-0.3, -0.15, 0, 0.15, 0.3].map((xOffset, idx) => (
            <group key={idx} position={[xOffset, 0, 0]}>
              {/* Hanger Hook */}
              <mesh material={pbrFrameMat}>
                <torusGeometry args={[0.03, 0.003, 8, 16, Math.PI]} />
              </mesh>
              {/* Garment Body */}
              <mesh position={[0, -0.15, 0]} material={pbrWoodMat}>
                <boxGeometry args={[0.04, 0.3, 0.35]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 4. ACCESSORIES */}
      {/* Trouser Rack */}
      <group ref={trouserRackRef} name="hausflex.accessory.trouser" position={[0, -0.3, 0]}>
        <mesh
          material={getMaterialFor("hausflex.accessory.trouser", pbrFrameMat)}
          castShadow
        >
          <boxGeometry args={[1.16, 0.04, 0.45]} />
        </mesh>
        {/* Trouser Rungs */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((rx, i) => (
          <mesh key={i} position={[rx, -0.02, 0]} material={pbrFrameMat}>
            <boxGeometry args={[0.012, 0.012, 0.42]} />
          </mesh>
        ))}
      </group>

      {/* 5. DRAWERS */}
      {/* Top Primary Soft-Close Drawer */}
      <group ref={topDrawerRef} name="hausflex.drawer.top" position={[0, -0.55, 0]}>
        <mesh
          material={getMaterialFor("hausflex.drawer.top", pbrWoodMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.16, 0.22, 0.48]} />
        </mesh>
        {/* Lip Handle */}
        <mesh position={[0, 0, 0.245]} material={pbrFrameMat}>
          <boxGeometry args={[0.3, 0.015, 0.015]} />
        </mesh>
      </group>

      {/* Bottom Deep Base Drawer */}
      <group ref={bottomDrawerRef} name="hausflex.drawer.bottom" position={[0, -0.9, 0]}>
        <mesh
          material={getMaterialFor("hausflex.drawer.bottom", pbrWoodMat)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.16, 0.32, 0.48]} />
        </mesh>
        {/* Lip Handle */}
        <mesh position={[0, 0, 0.245]} material={pbrFrameMat}>
          <boxGeometry args={[0.3, 0.015, 0.015]} />
        </mesh>
      </group>

      {/* 6. HINGED GLASS DOORS */}
      {/* Left Glass Door */}
      <group ref={leftDoorRef} name="hausflex.doors.left" position={[-0.58, 0, 0.26]}>
        {/* Pivot Hinge Offset */}
        <group position={[0.29, 0, 0]}>
          {/* Glass Panel */}
          <mesh material={getMaterialFor("hausflex.doors.left", pbrGlassMat)} castShadow>
            <boxGeometry args={[0.57, 2.22, 0.015]} />
          </mesh>
          {/* Outer Alloy Door Frame Border */}
          <mesh material={pbrFrameMat}>
            <boxGeometry args={[0.58, 2.24, 0.02]} />
          </mesh>
          {/* Door Handle Bar */}
          <mesh position={[0.24, 0, 0.02]} material={pbrFrameMat}>
            <boxGeometry args={[0.015, 0.4, 0.02]} />
          </mesh>
        </group>
      </group>

      {/* Right Glass Door */}
      <group ref={rightDoorRef} name="hausflex.doors.right" position={[0.58, 0, 0.26]}>
        {/* Pivot Hinge Offset */}
        <group position={[-0.29, 0, 0]}>
          {/* Glass Panel */}
          <mesh material={getMaterialFor("hausflex.doors.right", pbrGlassMat)} castShadow>
            <boxGeometry args={[0.57, 2.22, 0.015]} />
          </mesh>
          {/* Outer Alloy Door Frame Border */}
          <mesh material={pbrFrameMat}>
            <boxGeometry args={[0.58, 2.24, 0.02]} />
          </mesh>
          {/* Door Handle Bar */}
          <mesh position={[-0.24, 0, 0.02]} material={pbrFrameMat}>
            <boxGeometry args={[0.015, 0.4, 0.02]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

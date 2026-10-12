"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DoorPanelOption, FrameFinishOption, WoodFinishOption } from "@/types/wardrobe";

interface ParametricDoorsProps {
  openingWidth: number;   // meters (e.g. 2.58)
  openingHeight: number;  // meters (e.g. 2.40)
  ceilingHeight: number;  // meters (e.g. 2.60)
  doorType: "sliding" | "wooden" | "aluminum" | "none";
  doorSubtype?: "sliding" | "bifold" | "swing";
  panelCount: number;
  panelWidth: number;     // meters
  pelmetHeight: number;   // meters
  isOpen: boolean;
  onToggle: () => void;
  frameMaterial: FrameFinishOption;
  doorPanelMaterial: DoorPanelOption;
  woodMaterial: WoodFinishOption;
  woodTexture?: THREE.CanvasTexture | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  depthOffset?: number;   // meters, default front face
}

export function ParametricDoors({
  openingWidth,
  openingHeight,
  ceilingHeight,
  doorType,
  doorSubtype = "sliding",
  panelCount = 2,
  panelWidth,
  pelmetHeight,
  isOpen,
  onToggle,
  frameMaterial,
  doorPanelMaterial,
  woodMaterial,
  woodTexture,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  depthOffset = 0.30,
}: ParametricDoorsProps) {
  if (doorType === "none" || panelCount <= 0) {
    return null;
  }

  // Materials
  const pbrFrameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: frameMaterial.color,
      roughness: frameMaterial.roughness,
      metalness: frameMaterial.metalness,
      envMapIntensity: 1.1,
    });
  }, [frameMaterial]);

  const pbrTrackMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#222222",
      roughness: 0.35,
      metalness: 0.9,
    });
  }, []);

  const pbrWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      envMapIntensity: 0.85,
    });
  }, [woodMaterial, woodTexture]);

  const pbrPanelMat = useMemo(() => {
    if (doorType === "wooden") {
      return pbrWoodMat;
    }
    if (doorPanelMaterial.isGlass) {
      if (doorPanelMaterial.id === "frosted-glass") {
        return new THREE.MeshStandardMaterial({
          color: doorPanelMaterial.color,
          roughness: doorPanelMaterial.roughness,
          metalness: doorPanelMaterial.metalness,
          transparent: true,
          opacity: doorPanelMaterial.opacity,
          depthWrite: true,
        });
      } else {
        return new THREE.MeshPhysicalMaterial({
          color: doorPanelMaterial.color,
          roughness: doorPanelMaterial.roughness,
          metalness: doorPanelMaterial.metalness,
          transmission: doorPanelMaterial.transmission,
          ior: doorPanelMaterial.ior,
          transparent: true,
          opacity: doorPanelMaterial.opacity,
          roughnessMap: null,
          depthWrite: false,
        });
      }
    }
    return new THREE.MeshStandardMaterial({
      color: doorPanelMaterial.color,
      roughness: doorPanelMaterial.roughness,
      metalness: doorPanelMaterial.metalness,
    });
  }, [doorType, doorPanelMaterial, pbrWoodMat]);

  const pbrPelmetMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: woodMaterial.color,
      map: woodTexture || null,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
    });
  }, [woodMaterial, woodTexture]);

  const isBifold = doorSubtype === "bifold" || doorType === "wooden";
  const isSwing = doorSubtype === "swing";

  return (
    <group position={position} rotation={rotation}>
      {/* Top Track Header */}
      <mesh position={[0, openingHeight - 0.015, depthOffset]} castShadow receiveShadow>
        <boxGeometry args={[openingWidth, 0.03, 0.06]} />
        <primitive object={pbrTrackMat} attach="material" />
      </mesh>

      {/* Bottom Floor Guide Track */}
      <mesh position={[0, 0.006, depthOffset]} receiveShadow>
        <boxGeometry args={[openingWidth, 0.012, 0.05]} />
        <primitive object={pbrTrackMat} attach="material" />
      </mesh>

      {/* Pelmet Infill (Above Door up to Ceiling) */}
      {pelmetHeight > 0.02 && (
        <group position={[0, openingHeight + pelmetHeight / 2, depthOffset - 0.02]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[openingWidth, pelmetHeight, 0.04]} />
            <primitive object={pbrPelmetMat} attach="material" />
          </mesh>
          {/* Subtle bottom shadow bead on pelmet */}
          <mesh position={[0, -pelmetHeight / 2 + 0.005, 0.022]}>
            <boxGeometry args={[openingWidth, 0.01, 0.005]} />
            <primitive object={pbrFrameMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* Door Panels Generation */}
      {doorType === "sliding" || (!isBifold && !isSwing) ? (
        <SlidingDoorAssembly
          openingWidth={openingWidth}
          doorHeight={openingHeight - 0.02}
          panelCount={panelCount}
          panelWidth={panelWidth}
          depthOffset={depthOffset}
          isOpen={isOpen}
          onToggle={onToggle}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
        />
      ) : isBifold ? (
        <BifoldDoorAssembly
          openingWidth={openingWidth}
          doorHeight={openingHeight - 0.02}
          panelCount={panelCount}
          depthOffset={depthOffset}
          isOpen={isOpen}
          onToggle={onToggle}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
        />
      ) : (
        <SwingDoorAssembly
          openingWidth={openingWidth}
          doorHeight={openingHeight - 0.02}
          panelCount={panelCount}
          depthOffset={depthOffset}
          isOpen={isOpen}
          onToggle={onToggle}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
        />
      )}
    </group>
  );
}

// =========================================================================
// Sliding Door Assembly (Outward Smooth Sliding Kinematics)
// =========================================================================
interface SlidingAssemblyProps {
  openingWidth: number;
  doorHeight: number;
  panelCount: number;
  panelWidth: number;
  depthOffset: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
}

function SlidingDoorAssembly({
  openingWidth,
  doorHeight,
  panelCount,
  panelWidth,
  depthOffset,
  isOpen,
  onToggle,
  pbrFrameMat,
  pbrPanelMat,
}: SlidingAssemblyProps) {
  // Ensure actual physical panel width has realistic overlap (25mm)
  const actualPanelWidth = Math.max(panelWidth, openingWidth / panelCount + 0.025);

  if (panelCount === 2) {
    // 2 Panels: Left slides LEFT, Right slides RIGHT (Outward Kinematics)
    const closedLeftX = -openingWidth / 4;
    const closedRightX = openingWidth / 4;

    const openLeftX = -openingWidth / 2 + actualPanelWidth / 2 + 0.01;
    const openRightX = openingWidth / 2 - actualPanelWidth / 2 - 0.01;

    return (
      <>
        <SingleSlidingDoorPanel
          id="door-left"
          width={actualPanelWidth}
          height={doorHeight}
          closedX={closedLeftX}
          targetX={isOpen ? openLeftX : closedLeftX}
          trackZ={depthOffset + 0.016}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          handleSide="right"
          onToggle={onToggle}
        />
        <SingleSlidingDoorPanel
          id="door-right"
          width={actualPanelWidth}
          height={doorHeight}
          closedX={closedRightX}
          targetX={isOpen ? openRightX : closedRightX}
          trackZ={depthOffset - 0.016}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          handleSide="left"
          onToggle={onToggle}
        />
      </>
    );
  }

  if (panelCount === 3) {
    // 3 Panels: Left (-W/3), Center (0), Right (+W/3)
    const seg = openingWidth / 3;
    const closedLeftX = -seg;
    const closedCenterX = 0;
    const closedRightX = seg;

    const openLeftX = -openingWidth / 2 + actualPanelWidth / 2 + 0.01;
    const openRightX = openingWidth / 2 - actualPanelWidth / 2 - 0.01;
    const openCenterX = 0; // Remains center or stacks behind left

    return (
      <>
        <SingleSlidingDoorPanel
          id="door-left"
          width={actualPanelWidth}
          height={doorHeight}
          closedX={closedLeftX}
          targetX={isOpen ? openLeftX : closedLeftX}
          trackZ={depthOffset + 0.022}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          handleSide="right"
          onToggle={onToggle}
        />
        <SingleSlidingDoorPanel
          id="door-center"
          width={actualPanelWidth}
          height={doorHeight}
          closedX={closedCenterX}
          targetX={isOpen ? openLeftX + 0.04 : closedCenterX}
          trackZ={depthOffset}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          handleSide="right"
          onToggle={onToggle}
        />
        <SingleSlidingDoorPanel
          id="door-right"
          width={actualPanelWidth}
          height={doorHeight}
          closedX={closedRightX}
          targetX={isOpen ? openRightX : closedRightX}
          trackZ={depthOffset - 0.022}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          handleSide="left"
          onToggle={onToggle}
        />
      </>
    );
  }

  // 4 Panels (2 bi-parting pairs sliding outward)
  const seg4 = openingWidth / 4;
  const closedX1 = -seg4 * 1.5;
  const closedX2 = -seg4 * 0.5;
  const closedX3 = seg4 * 0.5;
  const closedX4 = seg4 * 1.5;

  const openX1 = -openingWidth / 2 + actualPanelWidth / 2 + 0.01;
  const openX2 = openX1 + 0.03;
  const openX4 = openingWidth / 2 - actualPanelWidth / 2 - 0.01;
  const openX3 = openX4 - 0.03;

  return (
    <>
      <SingleSlidingDoorPanel
        id="door-1"
        width={actualPanelWidth}
        height={doorHeight}
        closedX={closedX1}
        targetX={isOpen ? openX1 : closedX1}
        trackZ={depthOffset + 0.018}
        pbrFrameMat={pbrFrameMat}
        pbrPanelMat={pbrPanelMat}
        handleSide="right"
        onToggle={onToggle}
      />
      <SingleSlidingDoorPanel
        id="door-2"
        width={actualPanelWidth}
        height={doorHeight}
        closedX={closedX2}
        targetX={isOpen ? openX2 : closedX2}
        trackZ={depthOffset - 0.018}
        pbrFrameMat={pbrFrameMat}
        pbrPanelMat={pbrPanelMat}
        handleSide="right"
        onToggle={onToggle}
      />
      <SingleSlidingDoorPanel
        id="door-3"
        width={actualPanelWidth}
        height={doorHeight}
        closedX={closedX3}
        targetX={isOpen ? openX3 : closedX3}
        trackZ={depthOffset - 0.018}
        pbrFrameMat={pbrFrameMat}
        pbrPanelMat={pbrPanelMat}
        handleSide="left"
        onToggle={onToggle}
      />
      <SingleSlidingDoorPanel
        id="door-4"
        width={actualPanelWidth}
        height={doorHeight}
        closedX={closedX4}
        targetX={isOpen ? openX4 : closedX4}
        trackZ={depthOffset + 0.018}
        pbrFrameMat={pbrFrameMat}
        pbrPanelMat={pbrPanelMat}
        handleSide="left"
        onToggle={onToggle}
      />
    </>
  );
}

// Single Sliding Door Panel with Lerp Animation and Frame Detailing
interface SingleSlidingProps {
  id: string;
  width: number;
  height: number;
  closedX: number;
  targetX: number;
  trackZ: number;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
  handleSide: "left" | "right";
  onToggle: () => void;
}

function SingleSlidingDoorPanel({
  id,
  width,
  height,
  closedX,
  targetX,
  trackZ,
  pbrFrameMat,
  pbrPanelMat,
  handleSide,
  onToggle,
}: SingleSlidingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = 7.0;
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      speed,
      delta
    );
  });

  const frameThickness = 0.024;
  const frameBorder = 0.035;
  const innerW = width - frameBorder * 2;
  const innerH = height - frameBorder * 2;
  const handleX = handleSide === "right" ? width / 2 - 0.028 : -width / 2 + 0.028;

  return (
    <group
      ref={groupRef}
      position={[closedX, height / 2 + 0.008, trackZ]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Outer Aluminum Frame: Left, Right, Top, Bottom */}
      {/* Left Stile */}
      <mesh position={[-width / 2 + frameBorder / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameBorder, height, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      {/* Right Stile */}
      <mesh position={[width / 2 - frameBorder / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameBorder, height, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      {/* Top Rail */}
      <mesh position={[0, height / 2 - frameBorder / 2, 0]} castShadow>
        <boxGeometry args={[innerW, frameBorder, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      {/* Bottom Rail */}
      <mesh position={[0, -height / 2 + frameBorder / 2, 0]} castShadow>
        <boxGeometry args={[innerW, frameBorder, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Main Glass / Wooden Panel Insert */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, innerH, 0.008]} />
        <primitive object={pbrPanelMat} attach="material" />
      </mesh>

      {/* Vertical Slim Aluminum Grip Handle (Reference Image 3) */}
      <mesh position={[handleX, 0, frameThickness / 2 + 0.008]} castShadow>
        <boxGeometry args={[0.012, 0.90, 0.018]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Subtle Hover Selection Glow Indicator */}
      {hovered && (
        <mesh position={[0, 0, frameThickness / 2 + 0.001]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
      )}
    </group>
  );
}

// =========================================================================
// Bifold Door Assembly (Folding Accordion Pairs)
// =========================================================================
interface BifoldAssemblyProps {
  openingWidth: number;
  doorHeight: number;
  panelCount: number;
  depthOffset: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
}

function BifoldDoorAssembly({
  openingWidth,
  doorHeight,
  panelCount,
  depthOffset,
  isOpen,
  onToggle,
  pbrFrameMat,
  pbrPanelMat,
}: BifoldAssemblyProps) {
  const pairs = Math.max(1, Math.floor(panelCount / 2));
  const pairWidth = openingWidth / pairs;
  const leafWidth = pairWidth / 2;

  return (
    <>
      {Array.from({ length: pairs }).map((_, i) => {
        const pairStartX = -openingWidth / 2 + i * pairWidth;
        return (
          <BifoldLeafPair
            key={`bifold-pair-${i}`}
            pairStartX={pairStartX}
            leafWidth={leafWidth}
            doorHeight={doorHeight}
            depthOffset={depthOffset}
            isOpen={isOpen}
            onToggle={onToggle}
            pbrFrameMat={pbrFrameMat}
            pbrPanelMat={pbrPanelMat}
          />
        );
      })}
    </>
  );
}

function BifoldLeafPair({
  pairStartX,
  leafWidth,
  doorHeight,
  depthOffset,
  isOpen,
  onToggle,
  pbrFrameMat,
  pbrPanelMat,
}: {
  pairStartX: number;
  leafWidth: number;
  doorHeight: number;
  depthOffset: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const secondLeafRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rootRef.current || !secondLeafRef.current) return;
    const targetAngle = isOpen ? -Math.PI / 2.5 : 0;
    const targetSecondAngle = isOpen ? Math.PI / 1.3 : 0;

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      targetAngle,
      6.0,
      delta
    );
    secondLeafRef.current.rotation.y = THREE.MathUtils.damp(
      secondLeafRef.current.rotation.y,
      targetSecondAngle,
      6.0,
      delta
    );
  });

  return (
    <group
      position={[pairStartX, doorHeight / 2 + 0.008, depthOffset]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <group ref={rootRef}>
        {/* First Leaf */}
        <mesh position={[leafWidth / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[leafWidth - 0.006, doorHeight, 0.022]} />
          <primitive object={pbrPanelMat} attach="material" />
        </mesh>
        {/* Leaf 1 Frame Border */}
        <mesh position={[leafWidth / 2, 0, 0]}>
          <boxGeometry args={[leafWidth, doorHeight, 0.024]} />
          <primitive object={pbrFrameMat} attach="material" />
        </mesh>

        {/* Second Leaf Hinged at End of Leaf 1 */}
        <group ref={secondLeafRef} position={[leafWidth, 0, 0]}>
          <mesh position={[leafWidth / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[leafWidth - 0.006, doorHeight, 0.022]} />
            <primitive object={pbrPanelMat} attach="material" />
          </mesh>
          <mesh position={[leafWidth / 2, 0, 0]}>
            <boxGeometry args={[leafWidth, doorHeight, 0.024]} />
            <primitive object={pbrFrameMat} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// Swing Door Assembly (Individual Hinged Swinging Doors)
// =========================================================================
interface SwingAssemblyProps {
  openingWidth: number;
  doorHeight: number;
  panelCount: number;
  depthOffset: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
}

function SwingDoorAssembly({
  openingWidth,
  doorHeight,
  panelCount,
  depthOffset,
  isOpen,
  onToggle,
  pbrFrameMat,
  pbrPanelMat,
}: SwingAssemblyProps) {
  const count = Math.max(1, panelCount);
  const leafWidth = openingWidth / count;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const hingeX = -openingWidth / 2 + i * leafWidth;
        const swingDir = i % 2 === 0 ? -1 : 1;
        return (
          <SwingLeaf
            key={`swing-leaf-${i}`}
            hingeX={hingeX}
            leafWidth={leafWidth}
            doorHeight={doorHeight}
            depthOffset={depthOffset}
            swingDir={swingDir}
            isOpen={isOpen}
            onToggle={onToggle}
            pbrFrameMat={pbrFrameMat}
            pbrPanelMat={pbrPanelMat}
          />
        );
      })}
    </>
  );
}

function SwingLeaf({
  hingeX,
  leafWidth,
  doorHeight,
  depthOffset,
  swingDir,
  isOpen,
  onToggle,
  pbrFrameMat,
  pbrPanelMat,
}: {
  hingeX: number;
  leafWidth: number;
  doorHeight: number;
  depthOffset: number;
  swingDir: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
}) {
  const hingeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!hingeRef.current) return;
    const targetAngle = isOpen ? (Math.PI / 2.2) * swingDir : 0;
    hingeRef.current.rotation.y = THREE.MathUtils.damp(
      hingeRef.current.rotation.y,
      targetAngle,
      6.0,
      delta
    );
  });

  return (
    <group
      position={[hingeX, doorHeight / 2 + 0.008, depthOffset]}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <group ref={hingeRef}>
        <mesh position={[leafWidth / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[leafWidth - 0.006, doorHeight, 0.022]} />
          <primitive object={pbrPanelMat} attach="material" />
        </mesh>
        <mesh position={[leafWidth / 2, 0, 0]}>
          <boxGeometry args={[leafWidth, doorHeight, 0.024]} />
          <primitive object={pbrFrameMat} attach="material" />
        </mesh>
        {/* Handle */}
        <mesh position={[leafWidth - 0.03, 0, 0.016]}>
          <boxGeometry args={[0.012, 0.30, 0.015]} />
          <primitive object={pbrFrameMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

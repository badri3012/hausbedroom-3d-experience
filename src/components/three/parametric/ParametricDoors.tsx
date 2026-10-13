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
      return new THREE.MeshStandardMaterial({
        color: doorPanelMaterial.color,
        roughness: doorPanelMaterial.roughness,
        metalness: doorPanelMaterial.metalness,
        transparent: true,
        opacity: doorPanelMaterial.opacity,
        depthWrite: false,
        envMapIntensity: 1.6,
        side: THREE.DoubleSide,
      });
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
  const isGlassPanel = doorType !== "wooden" && doorPanelMaterial.isGlass;

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
          isGlassPanel={isGlassPanel}
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
          isGlassPanel={isGlassPanel}
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
          isGlassPanel={isGlassPanel}
        />
      )}
    </group>
  );
}

// =========================================================================
// Sliding Door Assembly (Supports 2..10 Panels with Smooth Kinematics)
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
  isGlassPanel: boolean;
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
  isGlassPanel,
}: SlidingAssemblyProps) {
  const count = Math.max(2, panelCount);
  const seg = openingWidth / count;
  const actualPanelWidth = Math.max(panelWidth || seg, seg + 0.024);

  const panels = Array.from({ length: count }).map((_, i) => {
    const closedX = -openingWidth / 2 + seg * (i + 0.5);
    const isLeftHalf = i < count / 2;
    let openX = closedX;

    if (count === 2) {
      // Left panel slides along the front track over the right panel within the track bounds,
      // fully exposing the left drawer/storage bay without intersecting side partitions or L-shape corners
      openX = i === 0
        ? openingWidth / 2 - actualPanelWidth / 2 - 0.02
        : closedX;
    } else {
      // Multi-panel stacking toward outer left and right edges within track bounds
      const edgeLeft = -openingWidth / 2 + actualPanelWidth / 2 + 0.01;
      const edgeRight = openingWidth / 2 - actualPanelWidth / 2 - 0.01;
      openX = isLeftHalf
        ? edgeLeft + i * 0.025
        : edgeRight - (count - 1 - i) * 0.025;
    }

    const trackZ = depthOffset + (i % 2 === 0 ? 0.016 : -0.016);
    const handleSide: "left" | "right" = isLeftHalf ? "right" : "left";

    return {
      id: `sliding-door-${i}`,
      closedX,
      openX,
      trackZ,
      handleSide,
    };
  });

  return (
    <>
      {panels.map((p) => (
        <SingleSlidingDoorPanel
          key={p.id}
          id={p.id}
          width={actualPanelWidth}
          height={doorHeight}
          closedX={p.closedX}
          targetX={isOpen ? p.openX : p.closedX}
          trackZ={p.trackZ}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          isGlassPanel={isGlassPanel}
          handleSide={p.handleSide}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

// Single Sliding Door Panel with Lerp Animation and Architectural Frame Detailing
interface SingleSlidingProps {
  id: string;
  width: number;
  height: number;
  closedX: number;
  targetX: number;
  trackZ: number;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
  isGlassPanel: boolean;
  handleSide: "left" | "right";
  onToggle: () => void;
}

function SingleSlidingDoorPanel({
  width,
  height,
  closedX,
  targetX,
  trackZ,
  pbrFrameMat,
  pbrPanelMat,
  isGlassPanel,
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
  const frameBorder = 0.028;
  const innerW = Math.max(0.1, width - frameBorder * 2);
  const innerH = Math.max(0.1, height - frameBorder * 2);
  const handleX = handleSide === "right" ? width / 2 - 0.022 : -width / 2 + 0.022;

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
      <mesh position={[-width / 2 + frameBorder / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameBorder, height, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[width / 2 - frameBorder / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameBorder, height, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, height / 2 - frameBorder / 2, 0]} castShadow>
        <boxGeometry args={[innerW, frameBorder, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, -height / 2 + frameBorder / 2, 0]} castShadow>
        <boxGeometry args={[innerW, frameBorder, frameThickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Architectural Horizontal Transom Bars (Muntins) */}
      <mesh position={[0, height * 0.165, 0]} castShadow>
        <boxGeometry args={[innerW, 0.014, frameThickness * 0.85]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, -height * 0.165, 0]} castShadow>
        <boxGeometry args={[innerW, 0.014, frameThickness * 0.85]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Main Glass / Wooden Panel Insert — Glass does NOT cast solid shadows onto interior */}
      <mesh position={[0, 0, 0]} castShadow={!isGlassPanel} receiveShadow={!isGlassPanel} renderOrder={2}>
        <boxGeometry args={[innerW, innerH, 0.006]} />
        <primitive object={pbrPanelMat} attach="material" />
      </mesh>

      {/* Vertical Slim Aluminum Grip Handle */}
      <mesh position={[handleX, 0, frameThickness / 2 + 0.008]} castShadow>
        <boxGeometry args={[0.012, 0.85, 0.016]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>

      {/* Subtle Hover Selection Glow Indicator */}
      {hovered && (
        <mesh position={[0, 0, frameThickness / 2 + 0.002]} renderOrder={3}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} />
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
  isGlassPanel: boolean;
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
  isGlassPanel,
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
            isGlassPanel={isGlassPanel}
          />
        );
      })}
    </>
  );
}

function FramedDoorLeaf({
  leafWidth,
  doorHeight,
  pbrFrameMat,
  pbrPanelMat,
  isGlassPanel,
}: {
  leafWidth: number;
  doorHeight: number;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
  isGlassPanel: boolean;
}) {
  const border = 0.024;
  const thickness = 0.022;
  const innerW = Math.max(0.05, leafWidth - border * 2);
  const innerH = Math.max(0.1, doorHeight - border * 2);

  return (
    <group position={[leafWidth / 2, 0, 0]}>
      {/* Perimeter Frame */}
      <mesh position={[-leafWidth / 2 + border / 2, 0, 0]} castShadow>
        <boxGeometry args={[border, doorHeight, thickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[leafWidth / 2 - border / 2, 0, 0]} castShadow>
        <boxGeometry args={[border, doorHeight, thickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, doorHeight / 2 - border / 2, 0]} castShadow>
        <boxGeometry args={[innerW, border, thickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, -doorHeight / 2 + border / 2, 0]} castShadow>
        <boxGeometry args={[innerW, border, thickness]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      {/* Mid Transom Bars */}
      <mesh position={[0, doorHeight * 0.16, 0]} castShadow>
        <boxGeometry args={[innerW, 0.012, thickness * 0.85]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      <mesh position={[0, -doorHeight * 0.16, 0]} castShadow>
        <boxGeometry args={[innerW, 0.012, thickness * 0.85]} />
        <primitive object={pbrFrameMat} attach="material" />
      </mesh>
      {/* Insert Panel */}
      <mesh castShadow={!isGlassPanel} receiveShadow={!isGlassPanel} renderOrder={2}>
        <boxGeometry args={[innerW, innerH, 0.008]} />
        <primitive object={pbrPanelMat} attach="material" />
      </mesh>
    </group>
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
  isGlassPanel,
}: {
  pairStartX: number;
  leafWidth: number;
  doorHeight: number;
  depthOffset: number;
  isOpen: boolean;
  onToggle: () => void;
  pbrFrameMat: THREE.Material;
  pbrPanelMat: THREE.Material;
  isGlassPanel: boolean;
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
        <FramedDoorLeaf
          leafWidth={leafWidth}
          doorHeight={doorHeight}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          isGlassPanel={isGlassPanel}
        />

        {/* Second Leaf Hinged at End of Leaf 1 */}
        <group ref={secondLeafRef} position={[leafWidth, 0, 0]}>
          <FramedDoorLeaf
            leafWidth={leafWidth}
            doorHeight={doorHeight}
            pbrFrameMat={pbrFrameMat}
            pbrPanelMat={pbrPanelMat}
            isGlassPanel={isGlassPanel}
          />
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
  isGlassPanel: boolean;
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
  isGlassPanel,
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
            isGlassPanel={isGlassPanel}
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
  isGlassPanel,
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
  isGlassPanel: boolean;
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
        <FramedDoorLeaf
          leafWidth={leafWidth}
          doorHeight={doorHeight}
          pbrFrameMat={pbrFrameMat}
          pbrPanelMat={pbrPanelMat}
          isGlassPanel={isGlassPanel}
        />
        {/* Handle */}
        <mesh position={[leafWidth - 0.03, 0, 0.016]} castShadow>
          <boxGeometry args={[0.012, 0.30, 0.015]} />
          <primitive object={pbrFrameMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

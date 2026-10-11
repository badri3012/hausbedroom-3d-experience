"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Html } from "@react-three/drei";
import HausFlexModel from "./HausFlexModel";
import { MaterialOption } from "@/types/showroom";

interface StudioCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isExploded: boolean;
  doorsOpen: boolean;
  drawersOpen: boolean;
  autoRotate: boolean;
  frameMaterial: MaterialOption;
  woodMaterial: MaterialOption;
  glassMaterial: MaterialOption;
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#242421]/90 text-[#F6F3EE] backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-serif-editorial tracking-widest uppercase text-[#D8D0C5]">
          Initializing WebGL 3D Studio Engine...
        </span>
      </div>
    </Html>
  );
}

export default function StudioCanvas({
  selectedComponentId,
  onSelectComponent,
  isExploded,
  doorsOpen,
  drawersOpen,
  autoRotate,
  frameMaterial,
  woodMaterial,
  glassMaterial,
}: StudioCanvasProps) {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#1C1C19] via-[#242421] to-[#141412] overflow-hidden select-none">
      <Canvas
        shadows
        camera={{ position: [2.8, 1.4, 3.6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting Rig */}
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={2048}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-4, 5, -3]} intensity={0.5} color="#D8D0C5" />
          <spotLight position={[0, 6, 2]} intensity={0.8} angle={0.6} penumbra={0.8} color="#FFE6B3" />

          {/* HDR Environment Reflections */}
          <Environment preset="city" />

          {/* Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.16, 0]}
            opacity={0.6}
            scale={6}
            blur={2}
            far={4}
          />

          {/* HausFlex 3D Interactive Model */}
          <HausFlexModel
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            isExploded={isExploded}
            doorsOpen={doorsOpen}
            drawersOpen={drawersOpen}
            frameMaterial={frameMaterial}
            woodMaterial={woodMaterial}
            glassMaterial={glassMaterial}
          />

          {/* Orbit Controls */}
          <OrbitControls
            makeDefault
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.02}
            minDistance={1.2}
            maxDistance={6.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

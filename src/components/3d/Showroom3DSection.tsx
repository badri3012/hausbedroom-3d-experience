"use client";

import React, { useState } from "react";
import StudioCanvas from "./StudioCanvas";
import ShowroomUI from "./ShowroomUI";
import {
  FRAME_FINISHES,
  WOOD_FINISHES,
  GLASS_FINISHES,
  MaterialOption,
} from "@/types/showroom";

export default function Showroom3DSection() {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [drawersOpen, setDrawersOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  const [frameMaterial, setFrameMaterial] = useState<MaterialOption>(FRAME_FINISHES[0]);
  const [woodMaterial, setWoodMaterial] = useState<MaterialOption>(WOOD_FINISHES[0]);
  const [glassMaterial, setGlassMaterial] = useState<MaterialOption>(GLASS_FINISHES[0]);

  const [activeProductId, setActiveProductId] = useState("hausflex");

  return (
    <section id="showroom3d" className="relative w-full h-screen min-h-[650px] bg-[#1C1C19] overflow-hidden">
      {/* 3D WebGL Viewport Canvas */}
      <StudioCanvas
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        isExploded={isExploded}
        doorsOpen={doorsOpen}
        drawersOpen={drawersOpen}
        autoRotate={autoRotate}
        frameMaterial={frameMaterial}
        woodMaterial={woodMaterial}
        glassMaterial={glassMaterial}
      />

      {/* Interactive Controls Overlay & Side Inspection Panel */}
      <ShowroomUI
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        isExploded={isExploded}
        onToggleExploded={() => setIsExploded(!isExploded)}
        doorsOpen={doorsOpen}
        onToggleDoors={() => setDoorsOpen(!doorsOpen)}
        drawersOpen={drawersOpen}
        onToggleDrawers={() => setDrawersOpen(!drawersOpen)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        frameMaterial={frameMaterial}
        onSelectFrameMaterial={setFrameMaterial}
        woodMaterial={woodMaterial}
        onSelectWoodMaterial={setWoodMaterial}
        glassMaterial={glassMaterial}
        onSelectGlassMaterial={setGlassMaterial}
        activeProductId={activeProductId}
        onSelectProduct={setActiveProductId}
      />
    </section>
  );
}

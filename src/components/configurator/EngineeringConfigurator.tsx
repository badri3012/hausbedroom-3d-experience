"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { REFERENCE_BODY_HTML } from "./engineering-html";
import { Scene } from "@/components/three/Scene";
import { WardrobeInteractionState } from "@/types/wardrobe";
import { PoleState, FlexState, PoleDesignResult, PoleLShapeDesign, FlexDesignResult, FlexLShapeDesign } from "@/lib/engineering/types";

declare global {
  interface Window {
    PoleApp?: { render: () => void; resizeCanvas: () => void };
    FlexApp?: { render: () => void; resizeCanvas: () => void };
    onHausBedroomStateUpdate?: (payload: any) => void;
  }
}

export function EngineeringConfigurator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [activeProduct, setActiveProduct] = useState<"pole" | "flex">("pole");
  const [activeShape, setActiveShape] = useState<"straight" | "lshape">("straight");
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // Synchronized 3D state
  const [sceneState, setSceneState] = useState<WardrobeInteractionState>({
    activeVariant: "contemporary-sliding",
    woodFinish: "natural-oak",
    frameFinish: "matte-black",
    doorPanel: "frosted-glass",
    leftDoorOpen: false,
    rightDoorOpen: false,
    bothDoorsOpen: false,
    topDrawerOpen: false,
    bottomDrawerOpen: false,
    drawersOpen: false,
    cameraPreset: "default",
    interiorViewActive: false,
    autoRotate: false,
    lightingMode: "showroom-spots",
    showDimensions: true,
    showSpotlights: true,
    shelfLedsOn: true,
    hoveredComponent: null,
    selectedComponent: null,
  });

  const [syncedPoleState, setSyncedPoleState] = useState<PoleState | undefined>(undefined);
  const [syncedPoleDesign, setSyncedPoleDesign] = useState<PoleDesignResult | undefined>(undefined);
  const [syncedPoleLSDesign, setSyncedPoleLSDesign] = useState<PoleLShapeDesign | undefined>(undefined);

  const [syncedFlexState, setSyncedFlexState] = useState<FlexState | undefined>(undefined);
  const [syncedFlexDesign, setSyncedFlexDesign] = useState<FlexDesignResult | undefined>(undefined);
  const [syncedFlexLSDesign, setSyncedFlexLSDesign] = useState<FlexLShapeDesign | undefined>(undefined);

  // 1. Mount Reference HTML and load engine scripts
  useEffect(() => {
    // Inject CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/engine/reference_styles.css";
    document.head.appendChild(link);

    // Setup live state bridge
    window.onHausBedroomStateUpdate = (payload: any) => {
      if (payload.product === "pole") {
        setActiveProduct("pole");
        const s = payload.state;
        setActiveShape(s.shape || "straight");
        setSyncedPoleState(s);
        setSyncedPoleDesign(payload.straightDesign);
        setSyncedPoleLSDesign(payload.lshapeDesign);
      } else if (payload.product === "flex") {
        setActiveProduct("flex");
        const s = payload.state;
        setActiveShape(s.shape || "straight");
        setSyncedFlexState(s);
        setSyncedFlexDesign(payload.flexStraightDesign);
        setSyncedFlexLSDesign(payload.flexLshapeDesign);
      }
    };

    // Load scripts sequentially
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    };

    let isMounted = true;

    async function initEngine() {
      try {
        await loadScript("/engine/poleApp.js");
        await loadScript("/engine/flexApp.js");
        await loadScript("/engine/shellApp.js");
        if (isMounted) {
          setEngineReady(true);
        }
      } catch (err) {
        console.error("Failed to load engine scripts:", err);
      }
    }

    initEngine();

    return () => {
      isMounted = false;
      if (link.parentNode) link.parentNode.removeChild(link);
      window.onHausBedroomStateUpdate = undefined;
    };
  }, []);

  // 2. Track active 3D view tab portal target
  useEffect(() => {
    if (!engineReady) return;

    const checkPortalTarget = () => {
      const pStraight = document.getElementById("threeDViewContainer");
      const pLShape = document.getElementById("threeDViewContainerLS");
      const fStraight = document.getElementById("flexThreeDViewContainer");
      const fLShape = document.getElementById("flexLsThreeDViewContainer");

      if (pStraight && pStraight.style.display !== "none") {
        setPortalTarget(pStraight);
      } else if (pLShape && pLShape.style.display !== "none") {
        setPortalTarget(pLShape);
      } else if (fStraight && fStraight.style.display !== "none") {
        setPortalTarget(fStraight);
      } else if (fLShape && fLShape.style.display !== "none") {
        setPortalTarget(fLShape);
      } else {
        setPortalTarget(null);
      }
    };

    const interval = setInterval(checkPortalTarget, 200);
    return () => clearInterval(interval);
  }, [engineReady]);

  const handleUpdateSceneState = (updates: Partial<WardrobeInteractionState>) => {
    setSceneState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="w-full min-h-screen bg-[#1B1F26] text-[#EDE9DE]">
      {/* 100% Exact Reference HTML DOM from HausBedroom_Configurator_3.html */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: REFERENCE_BODY_HTML }}
      />

      {/* Interactive 3D Showroom View Portaled into Active 3D Tab Container */}
      {portalTarget &&
        createPortal(
          <div className="w-full h-full relative">
            <Scene
              state={sceneState}
              onUpdateState={handleUpdateSceneState}
              productSystem={activeProduct}
              shape={activeShape}
              poleState={syncedPoleState}
              poleDesign={syncedPoleDesign}
              poleLShapeDesign={syncedPoleLSDesign}
              flexState={syncedFlexState}
              flexDesign={syncedFlexDesign}
              flexLShapeDesign={syncedFlexLSDesign}
            />

            {/* Quick 3D HUD overlay controls */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <button
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-white transition-all"
                onClick={() =>
                  handleUpdateSceneState({
                    bothDoorsOpen: !sceneState.bothDoorsOpen,
                    leftDoorOpen: !sceneState.leftDoorOpen,
                    rightDoorOpen: !sceneState.rightDoorOpen,
                  })
                }
              >
                {sceneState.bothDoorsOpen ? "Close Doors" : "Slide Doors"}
              </button>
              <button
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-white transition-all"
                onClick={() =>
                  handleUpdateSceneState({
                    drawersOpen: !sceneState.drawersOpen,
                    topDrawerOpen: !sceneState.drawersOpen,
                    bottomDrawerOpen: !sceneState.drawersOpen,
                  })
                }
              >
                {sceneState.drawersOpen ? "Close Drawers" : "Open Drawers"}
              </button>
              <button
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded font-medium text-white transition-all"
                onClick={() =>
                  handleUpdateSceneState({
                    cameraPreset: sceneState.cameraPreset === "front" ? "default" : "front",
                  })
                }
              >
                {sceneState.cameraPreset === "front" ? "3/4 View" : "Front View"}
              </button>
            </div>
          </div>,
          portalTarget
        )}
    </div>
  );
}

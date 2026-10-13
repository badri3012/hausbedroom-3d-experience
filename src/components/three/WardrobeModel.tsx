"use client";

import React, { useMemo } from "react";
import { ContemporarySlidingWardrobe } from "./ContemporarySlidingWardrobe";
import { FullModularWardrobe } from "./FullModularWardrobe";
import { OpenModularWardrobe } from "./OpenModularWardrobe";
import {
  ParametricPoleWardrobe,
  ParametricFlexWardrobe,
  ParametricLShapeAssembly,
} from "./parametric";
import {
  WardrobeInteractionState,
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
} from "@/types/wardrobe";
import {
  WOOD_FINISH_OPTIONS,
  FRAME_FINISH_OPTIONS,
  DOOR_PANEL_OPTIONS,
  createProceduralWoodTexture,
} from "@/lib/materials";
import {
  PoleState,
  PoleDesignResult,
  PoleLShapeDesign,
  FlexState,
  FlexDesignResult,
  FlexLShapeDesign,
} from "@/lib/engineering/types";

export interface WardrobeModelProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
  // Engineering Configuration Props
  productSystem?: "pole" | "flex" | "showroom";
  shape?: "straight" | "lshape";
  poleState?: PoleState;
  poleDesign?: PoleDesignResult;
  poleLShapeDesign?: PoleLShapeDesign;
  flexState?: FlexState;
  flexDesign?: FlexDesignResult;
  flexLShapeDesign?: FlexLShapeDesign;
}

export function WardrobeModel({
  state,
  onUpdateState,
  productSystem = "pole",
  shape = "straight",
  poleState,
  poleDesign,
  poleLShapeDesign,
  flexState,
  flexDesign,
  flexLShapeDesign,
}: WardrobeModelProps) {
  // Resolve active finish options
  const woodMaterial: WoodFinishOption = useMemo(() => {
    return (
      WOOD_FINISH_OPTIONS.find((w) => w.id === state.woodFinish) ||
      WOOD_FINISH_OPTIONS[0]
    );
  }, [state.woodFinish]);

  const frameMaterial: FrameFinishOption = useMemo(() => {
    return (
      FRAME_FINISH_OPTIONS.find((f) => f.id === state.frameFinish) ||
      FRAME_FINISH_OPTIONS[0]
    );
  }, [state.frameFinish]);

  const doorPanelMaterial: DoorPanelOption = useMemo(() => {
    return (
      DOOR_PANEL_OPTIONS.find((d) => d.id === state.doorPanel) ||
      DOOR_PANEL_OPTIONS[0]
    );
  }, [state.doorPanel]);

  // Procedural wood canvas texture for natural grain realism
  const woodTexture = useMemo(() => {
    return createProceduralWoodTexture(state.woodFinish);
  }, [state.woodFinish]);

  // =========================================================================
  // 1. PARAMETRIC ENGINEERING SYSTEMS (HAUSPOLE & HAUSFLEX)
  // =========================================================================
  if (productSystem === "pole" && poleState && poleDesign) {
    if (shape === "lshape") {
      return (
        <ParametricLShapeAssembly
          productSystem="pole"
          poleState={poleState}
          poleLShapeDesign={poleLShapeDesign}
          flexState={flexState as FlexState}
          flexLShapeDesign={flexLShapeDesign}
          interactionState={state}
          onUpdateState={onUpdateState}
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          doorPanelMaterial={doorPanelMaterial}
          woodTexture={woodTexture}
        />
      );
    }

    return (
      <ParametricPoleWardrobe
        poleState={poleState}
        poleDesign={poleDesign}
        interactionState={state}
        onUpdateState={onUpdateState}
        woodMaterial={woodMaterial}
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        woodTexture={woodTexture}
      />
    );
  }

  if (productSystem === "flex" && flexState && flexDesign) {
    if (shape === "lshape") {
      return (
        <ParametricLShapeAssembly
          productSystem="flex"
          poleState={poleState as PoleState}
          flexState={flexState}
          flexDesign={flexDesign}
          flexLShapeDesign={flexLShapeDesign}
          interactionState={state}
          onUpdateState={onUpdateState}
          woodMaterial={woodMaterial}
          frameMaterial={frameMaterial}
          doorPanelMaterial={doorPanelMaterial}
          woodTexture={woodTexture}
        />
      );
    }

    return (
      <ParametricFlexWardrobe
        flexState={flexState}
        flexDesign={flexDesign}
        interactionState={state}
        onUpdateState={onUpdateState}
        woodMaterial={woodMaterial}
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        woodTexture={woodTexture}
      />
    );
  }

  // =========================================================================
  // 2. SHOWROOM PRESET MODELS (LEGACY & EXHIBITION VIEW)
  // =========================================================================
  if (state.activeVariant === "full-modular") {
    return (
      <FullModularWardrobe
        state={state}
        onUpdateState={onUpdateState}
        woodMaterial={woodMaterial}
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        woodTexture={woodTexture}
      />
    );
  }

  if (state.activeVariant === "open-modular") {
    return (
      <OpenModularWardrobe
        state={state}
        onUpdateState={onUpdateState}
        woodMaterial={woodMaterial}
        frameMaterial={frameMaterial}
        doorPanelMaterial={doorPanelMaterial}
        woodTexture={woodTexture}
      />
    );
  }

  // Primary Default Model: Contemporary Sliding Wardrobe (Reference 3)
  return (
    <ContemporarySlidingWardrobe
      state={state}
      onUpdateState={onUpdateState}
      woodMaterial={woodMaterial}
      frameMaterial={frameMaterial}
      doorPanelMaterial={doorPanelMaterial}
      woodTexture={woodTexture}
    />
  );
}

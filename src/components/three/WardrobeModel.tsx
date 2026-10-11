"use client";

import React, { useMemo } from "react";
import { ContemporarySlidingWardrobe } from "./ContemporarySlidingWardrobe";
import { FullModularWardrobe } from "./FullModularWardrobe";
import { OpenModularWardrobe } from "./OpenModularWardrobe";
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

interface WardrobeModelProps {
  state: WardrobeInteractionState;
  onUpdateState: (updates: Partial<WardrobeInteractionState>) => void;
}

export function WardrobeModel({ state, onUpdateState }: WardrobeModelProps) {
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

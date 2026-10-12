"use client";

import { useState, useMemo } from "react";
import {
  PoleState,
  FlexState,
  PoleDesignResult,
  PoleLShapeDesign,
  FlexDesignResult,
  PolePriceResult,
  PoleLShapePriceResult,
  AddonPriceResult,
  FlexPriceResult,
} from "@/lib/engineering/types";
import {
  computePoleDesign,
  computePoleLShapeDesign,
  computePolePrice,
  computePoleLShapePrice,
  computePoleAddonPrice,
} from "@/lib/engineering/pole-engine";
import {
  computeFlexDesign,
  computeFlexLShape,
  computeFlexPriceStraight,
  computeFlexPriceLShape,
} from "@/lib/engineering/flex-engine";
import {
  generatePoleQuoteText,
  generateFlexQuoteText,
} from "@/lib/engineering/quotation-engine";

export type ProductSystemType = "pole" | "flex";
export type WardrobeShapeType = "straight" | "lshape";

export const DEFAULT_POLE_STATE: PoleState = {
  shape: "straight",
  length: 2700,
  ceiling: 2600,
  depth: 600,
  left: { type: "none", beamWidth: 130 },
  right: { type: "none", beamWidth: 130 },
  doorRequired: true,
  doorTypePref: "auto",
  doorType: "sliding",
  doorAutoMaterial: false,
  doorForcedSwing: false,
  doorHeightUpgrade: false,
  hangingRod: true,
  internalHeightUpgrade: false,
  mirrorQty: 0,
  laminateQty: 0,
  addonExtraDrawers: 0,
  addonSecretDrawer: 0,
  addonDrawerHead: 0,
  poleFinish: "silver",
  dismantle: false,
  addonRelocatePoint: 0,
  addonNewSwitch: 0,
  led: false,
  addonLedLength: 1.5,
  addonSensor: 0,
  addonWireBasket: 0,
  addonTrouserHolder: 0,
  addonDoubleTrouser: 0,
  addonPulloutTrouser: 0,
  addonFullMirror: 0,
  addonBoxMirror: 0,
  addonFlipMirror: 0,
  ls: {
    ceiling: 2600,
    depth: 600,
    doorRequired: true,
    doorTypePref: "auto",
    legALength: 1900,
    legBLength: 1250,
    legAWall: "none",
    legBWall: "none",
    legABeamWidth: 130,
    legBBeamWidth: 130,
    legADoorType: "auto",
    legBDoorType: "auto",
    legAOuter: { type: "none", beamWidth: 130 },
    legBOuter: { type: "none", beamWidth: 130 },
    doorHeightUpgrade: false,
    internalHeightUpgrade: false,
    doorTypeA: "sliding",
    doorTypeB: "sliding",
  },
};

export const DEFAULT_FLEX_STATE: FlexState = {
  shape: "straight",
  length: 3200,
  ceiling: 2600,
  depth: 600,
  left: { type: "none", beamWidth: 130 },
  right: { type: "none", beamWidth: 130 },
  doorRequired: true,
  proposal: "A",
  flexDoorTypePref: "auto",
  doorHeightUpgrade: false,
  internalHeightUpgrade: false,
  flexMirrorQty: 0,
  flexLaminateQty: 0,
  flexWireBasketQty: 2,
  wireBasketTouched: true,
  flexTrouserHangerQty: 0,
  flexPulloutMirrorQty: 0,
  flexDismantle: false,
  flexAddonRelocatePoint: 0,
  flexAddonNewSwitch: 0,
  flexLed: false,
  flexAddonLedLength: 1.5,
  flexAddonSensor: 0,
  ls: {
    ceiling: 2600,
    doorRequired: true,
    doorTypePref: "auto",
    legA: { length: 2000, outer: { type: "none", beamWidth: 130 } },
    legB: { length: 1250, outer: { type: "none", beamWidth: 130 } },
    doorHeightUpgrade: false,
    internalHeightUpgrade: false,
  },
};

export function useConfiguratorEngineering() {
  const [productSystem, setProductSystem] = useState<ProductSystemType>("pole");
  const [shape, setShape] = useState<WardrobeShapeType>("straight");

  const [poleState, setPoleState] = useState<PoleState>(DEFAULT_POLE_STATE);
  const [flexState, setFlexState] = useState<FlexState>(DEFAULT_FLEX_STATE);

  // Sync shape change into states
  const handleSetShape = (newShape: WardrobeShapeType) => {
    setShape(newShape);
    setPoleState((prev) => ({ ...prev, shape: newShape }));
    setFlexState((prev) => ({ ...prev, shape: newShape }));
  };

  const updatePoleState = (updates: Partial<PoleState>) => {
    setPoleState((prev) => ({ ...prev, ...updates }));
  };

  const updateFlexState = (updates: Partial<FlexState>) => {
    setFlexState((prev) => ({ ...prev, ...updates }));
  };

  // Calculations for Pole
  const poleDesign: PoleDesignResult = useMemo(() => {
    return computePoleDesign(poleState);
  }, [poleState]);

  const poleLShapeDesign: PoleLShapeDesign = useMemo(() => {
    return computePoleLShapeDesign(poleState);
  }, [poleState]);

  const poleStraightPrice: PolePriceResult = useMemo(() => {
    return computePolePrice(poleState, poleDesign);
  }, [poleState, poleDesign]);

  const poleLSPrice: PoleLShapePriceResult = useMemo(() => {
    return computePoleLShapePrice(poleState, poleLShapeDesign);
  }, [poleState, poleLShapeDesign]);

  const poleAddons: AddonPriceResult = useMemo(() => {
    const base = shape === "lshape" ? poleLSPrice.total : poleStraightPrice.total;
    return computePoleAddonPrice(poleState, base);
  }, [poleState, shape, poleLSPrice.total, poleStraightPrice.total]);

  // Calculations for Flex
  const flexDesign: FlexDesignResult = useMemo(() => {
    return computeFlexDesign(flexState);
  }, [flexState]);

  const flexLShapeDesign = useMemo(() => {
    return computeFlexLShape(flexState);
  }, [flexState]);

  const activeFlexProposal = useMemo(() => {
    return flexState.proposal === "B" && flexDesign.proposalB
      ? flexDesign.proposalB
      : flexDesign.proposalA;
  }, [flexState.proposal, flexDesign]);

  const flexPrice: FlexPriceResult = useMemo(() => {
    if (shape === "lshape") {
      return computeFlexPriceLShape(flexState, flexLShapeDesign);
    }
    const prop = activeFlexProposal || flexDesign.proposalA;
    return computeFlexPriceStraight(flexState, flexDesign, prop);
  }, [shape, flexState, flexDesign, activeFlexProposal, flexLShapeDesign]);

  // Overall active quotation text
  const quotationText = useMemo(() => {
    if (productSystem === "pole") {
      return generatePoleQuoteText(
        poleState,
        poleDesign,
        poleDesign.internalLayout,
        shape === "lshape" ? (poleLSPrice as any) : poleStraightPrice,
        poleAddons,
        shape === "lshape" ? poleLShapeDesign : undefined
      );
    } else {
      const prop = activeFlexProposal || flexDesign.proposalA;
      return generateFlexQuoteText(
        flexState,
        flexDesign,
        prop,
        flexPrice,
        flexLShapeDesign
      );
    }
  }, [
    productSystem,
    shape,
    poleState,
    poleDesign,
    poleStraightPrice,
    poleLSPrice,
    poleAddons,
    poleLShapeDesign,
    flexState,
    flexDesign,
    activeFlexProposal,
    flexPrice,
    flexLShapeDesign,
  ]);

  return {
    productSystem,
    setProductSystem,
    shape,
    setShape: handleSetShape,
    poleState,
    updatePoleState,
    poleDesign,
    poleLShapeDesign,
    poleStraightPrice,
    poleLSPrice,
    poleAddons,
    flexState,
    updateFlexState,
    flexDesign,
    activeFlexProposal,
    flexPrice,
    quotationText,
  };
}

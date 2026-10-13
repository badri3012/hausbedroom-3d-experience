/**
 * HAUSBEDROOM QUOTATION ENGINE
 * Verbatim port of PoleApp.generateQuoteText & FlexApp.renderQuoteStraight / renderQuoteLShape
 * from HausBedroom_Configurator_3.html
 */

import type {
  PoleState,
  PoleDesignResult,
  PoleInternalLayout,
  PolePriceResult,
  PoleLShapePriceResult,
  AddonPriceResult,
  PoleLShapeDesign,
  FlexState,
  FlexDesignResult,
  FlexProposal,
} from "./types.ts";
import { computeFlexPriceStraight, computeFlexPriceLShape } from "./flex-engine.ts";

export function formatDateDDMMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mmm = months[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${dd}/${mmm}/${yyyy}`;
}

export function getQuoteDate(): Date {
  if (typeof window === "undefined") {
    return new Date("2026-10-12T00:00:00Z");
  }
  return new Date();
}

export function generatePoleQuoteText(
  s: PoleState,
  d: PoleDesignResult | null,
  internal: PoleInternalLayout | null,
  p: PolePriceResult | PoleLShapePriceResult,
  ap: AddonPriceResult,
  ls?: PoleLShapeDesign
): string {
  const lines: string[] = [];
  lines.push("*HausPole Wardrobe Quotation*");
  const today = getQuoteDate();
  lines.push("Date: " + formatDateDDMMMYYYY(today));
  lines.push("");

  if (ls) {
    const hasDoorLs = ls.doorA.type !== "none" || ls.doorB.type !== "none";
    const internalHeightLs = s.ls.internalHeightUpgrade ? 2400 : 2080;
    lines.push(
      "Shape: L-Shaped — Leg A " +
        s.ls.legALength +
        "mm × Leg B " +
        s.ls.legBLength +
        "mm × " +
        s.ls.depth +
        "mm depth, ceiling " +
        s.ls.ceiling +
        "mm"
    );
    const legDoorSummary = (leg: string, door: any) =>
      leg +
      ": " +
      (door.type === "none"
        ? "no door"
        : door.panelCount +
          "-panel " +
          (door.type === "sliding"
            ? "sliding (glass)"
            : door.type + (door.panelCount === 1 ? " single swing" : " bifold")));
    lines.push("Doors: " + legDoorSummary("Leg A", ls.doorA) + " · " + legDoorSummary("Leg B", ls.doorB));
    lines.push("Drawers: " + ls.drawerCount + " unit(s)");
    lines.push("");
    lines.push("Unless otherwise stated, this HausPole system is constructed with:");
    lines.push(
      "- Use of 18mm thick E0/E1 grade board with PVC laminate (for shelves, side panels, and drawer components)"
    );
    const poleFinishNameLs =
      s.poleFinish === "champagne" ? "champagne" : s.poleFinish === "black" ? "black" : "silver";
    lines.push(
      "- Free internal configuration up to " +
        internalHeightLs +
        "mm height (hanging bars, adjustable shelving, pigeon holes, " +
        poleFinishNameLs +
        " aluminum poles)"
    );
    if (hasDoorLs) {
      const partitionPelmetHeightLs = s.ls.ceiling;
      lines.push(
        "- Partition wall & pelmet built up to " + partitionPelmetHeightLs + "mm height and finished in white paint"
      );
    }
    lines.push("- " + ls.drawerCount + " drawer(s) equipped with soft-close runners");
    const lsDoorHeightRaw = s.ls.doorHeightUpgrade
      ? Math.min(s.ls.ceiling - 50, 2800)
      : Math.min(2400, s.ls.ceiling - 50);
    const lsDoorHeightForQuote = Math.round(lsDoorHeightRaw);
    const legDoorSystemLine = (door: any) => {
      if (door.type === "sliding")
        return "Top and Bottom track sliding door " + lsDoorHeightForQuote + "mm height with glass";
      if (door.type === "wooden")
        return (
          "Wooden hinged/bifold door system at " +
          lsDoorHeightForQuote +
          "mm height in laminated plywood" +
          (door.autoMaterial ? " (material assumed — confirm with customer)" : "")
        );
      if (door.type === "aluminum")
        return "Aluminium-framed hinged/bifold door system at " + lsDoorHeightForQuote + "mm height in glass";
      return null;
    };
    if (ls.doorA.type !== "none") lines.push("- Leg A door: " + legDoorSystemLine(ls.doorA));
    if (ls.doorB.type !== "none") lines.push("- Leg B door: " + legDoorSystemLine(ls.doorB));
  } else if (d) {
    const internalHeight = s.internalHeightUpgrade ? 2400 : 2080;
    lines.push("Dimensions: " + s.length + " x " + s.ceiling + " x " + Math.round(d.depth) + "mm");

    let doorSummary: string;
    let doorSystemLine: string | null;
    if (s.doorType === "none") {
      doorSummary = "No door (open wardrobe)";
      doorSystemLine = null;
    } else if (s.doorType === "sliding") {
      doorSummary = d.panelCount + "-panel sliding (glass)";
      doorSystemLine = "Top and Bottom track sliding door " + Math.round(d.doorHeight) + "mm height with glass";
    } else if (s.doorType === "wooden") {
      doorSummary = d.panelCount + "-panel wooden hinged/bifold";
      if (d.splitInfo && d.splitInfo.type === "split") {
        doorSystemLine =
          "Top and bottom wooden hinged/bifold door system up to " +
          Math.round(d.doorHeight) +
          "mm height in laminated plywood";
      } else {
        doorSystemLine =
          "Wooden hinged/bifold door system at " + Math.round(d.doorHeight) + "mm height in laminated plywood";
      }
    } else {
      doorSummary = d.panelCount + "-panel aluminum bifold";
      doorSystemLine =
        "Aluminium-framed hinged/bifold door system at " + Math.round(d.doorHeight) + "mm height in glass";
    }
    lines.push("Door: " + doorSummary);
    lines.push("Drawers: " + d.drawerCount + " unit(s)");
    lines.push("");
    lines.push("Unless otherwise stated, this HausPole system is constructed with:");
    lines.push(
      "- Use of 18mm thick E0/E1 grade board with PVC laminate (for shelves, side panels, and drawer components)"
    );
    const poleFinishName = s.poleFinish === "champagne" ? "champagne" : s.poleFinish === "black" ? "black" : "silver";
    lines.push(
      "- Free internal configuration up to " +
        internalHeight +
        "mm height (hanging bars, adjustable shelving, pigeon holes, " +
        poleFinishName +
        " aluminum poles)"
    );
    if (s.doorType !== "none") {
      const partitionPelmetHeight = s.ceiling;
      lines.push(
        "- Partition wall & pelmet built up to " + partitionPelmetHeight + "mm height and finished in white paint"
      );
    }
    lines.push("- " + d.drawerCount + " drawer(s) equipped with soft-close runners");
    if (doorSystemLine) lines.push("- " + doorSystemLine);
  }

  // Additional inclusions from selected add-ons
  const inclusionLines: string[] = [];
  if (s.internalHeightUpgrade) inclusionLines.push("Internal height upgraded to 2400mm");
  if (s.poleFinish && s.poleFinish !== "silver")
    inclusionLines.push("Pole finish: " + (s.poleFinish === "champagne" ? "Champagne" : "Black"));
  if (s.mirrorQty > 0) inclusionLines.push(s.mirrorQty + " full mirror door panel(s)");
  if (s.laminateQty > 0) inclusionLines.push(s.laminateQty + " laminate finish piece(s)");
  if (s.addonExtraDrawers > 0)
    inclusionLines.push(s.addonExtraDrawers + " additional drawer(s) beyond base count");
  if (s.addonSecretDrawer > 0) inclusionLines.push(s.addonSecretDrawer + " secret drawer top-up");
  if (s.addonDrawerHead > 0)
    inclusionLines.push(s.addonDrawerHead + " drawer head(s) upgraded to mirror + aluminium frame");
  if (s.dismantle) inclusionLines.push("Dismantle & disposal of existing wardrobe/fixtures");
  if (s.addonRelocatePoint > 0)
    inclusionLines.push(s.addonRelocatePoint + " relocated switch/power point(s)");
  if (s.addonNewSwitch > 0) inclusionLines.push(s.addonNewSwitch + " new light switch(es)");
  if (s.led) inclusionLines.push("LED lighting (" + (s.addonLedLength || 0).toFixed(1) + "m)");
  if (s.addonSensor > 0) inclusionLines.push(s.addonSensor + " wired sensor(s)");
  if (s.addonWireBasket > 0) inclusionLines.push(s.addonWireBasket + " pull-out wire basket(s)");
  if (s.addonTrouserHolder > 0) inclusionLines.push(s.addonTrouserHolder + " trouser holder(s)");
  if (s.addonDoubleTrouser > 0) inclusionLines.push(s.addonDoubleTrouser + " double trouser hanger(s)");
  if (s.addonPulloutTrouser > 0)
    inclusionLines.push(s.addonPulloutTrouser + " pull-out trouser hanger(s)");
  if (s.addonFullMirror > 0)
    inclusionLines.push(s.addonFullMirror + " full-length pull-out mirror(s)");
  if (s.addonBoxMirror > 0) inclusionLines.push(s.addonBoxMirror + " box-up mirror(s)");
  if (s.addonFlipMirror > 0) inclusionLines.push(s.addonFlipMirror + " flip mirror(s)");

  if (inclusionLines.length) {
    lines.push("");
    lines.push("_Additional inclusions for this quote:_");
    inclusionLines.forEach((l) => lines.push("- " + l));
  }

  // Exclusions — dynamically drop items that were actually selected as paid add-ons
  lines.push("");
  lines.push("Excludes (unless quoted separately):");
  const electricalCovered = s.addonRelocatePoint > 0 || s.addonNewSwitch > 0;
  if (electricalCovered) {
    lines.push(
      "- Electrical works — aircon/ceiling fan shifting not included unless specified separately (switch/plug relocation and new points for this job are included above)"
    );
  } else {
    lines.push(
      "- Electrical works (e.g. switch/plug relocation, new electrical points, aircon/ceiling fan shifting)"
    );
  }
  if (!s.dismantle) {
    lines.push("- General works (dismantle/disposal of existing cabinetry/fixtures)");
  }
  lines.push(
    "- Floor & Wall works (e.g. paint touch up or full repainting, floor polish/repair/leveling)"
  );

  lines.push("");
  if (p.outOfTier) {
    lines.push("*Total: Quote pending — ceiling exceeds standard pricing tiers*");
  } else {
    const grand = ap.grandTotal !== null ? ap.grandTotal : 0;
    lines.push("*Total (before GST): $" + grand.toFixed(2) + "*");
    const validUntil = new Date(today);
    validUntil.setMonth(validUntil.getMonth() + 1);
    lines.push("_This quote is valid until " + formatDateDDMMMYYYY(validUntil) + "._");
  }

  return lines.join("\n");
}

/* ============ HausFlex quote helpers (Ref HTML L3969-4091) ============ */
export function flexDoorSystemLine(door: any, material: string | null, doorHeight: number): string {
  if (door.type === "none") return "No door — internal-only configuration";
  if (door.type === "sliding")
    return (
      door.panelCount +
      "-panel sliding door system: height " +
      Math.round(doorHeight) +
      "mm, aluminium frame with glass/tinted glass"
    );
  const matLabel = material === "wooden" ? "wooden hinged/bifold" : "aluminium hinged/bifold";
  const panelWord = door.panelCount === 1 ? "single swing" : "bifold";
  return door.panelCount + "-panel " + matLabel + " door system (" + panelWord + "): height " + Math.round(doorHeight) + "mm";
}

export function flexDoorSummaryShort(door: any, material: string | null): string {
  if (door.type === "none") return "No door";
  if (door.type === "sliding")
    return door.panelCount + "-panel sliding (aluminium frame, glass/tinted glass)";
  const matLabel = material === "wooden" ? "wooden" : "aluminium";
  return door.panelCount + "-panel " + matLabel + " " + (door.panelCount === 1 ? "single swing" : "hinged/bifold");
}

export function suggestedBasketQty(prop: FlexProposal | null | undefined): number {
  if (!prop) return 0;
  return prop.basketActualQty || 0;
}

export function internalHeightMm(upgrade: boolean): number {
  return upgrade ? 2400 : 2100;
}

export function HAUSFLEX_CONSTRUCTION_NOTE(internalH: number, basketQty: number): string {
  return [
    "Unless otherwise stated, all HausFlex systems quoted herein are constructed with:",
    "- SPCC-grade metal framework with powder coating",
    "- Modular track-based structure (white color), top-hung and wall-mounted, adjustable",
    "- Free internal configuration up to " +
      internalH +
      " mm height (includes hanging bars, shelving, and wire basket)",
    "- " + basketQty + "x of wire basket will be specified further in quotation",
  ].join("\n");
}

export function flexInclusionLines(s: FlexState): string[] {
  const inclusionLines: string[] = [];
  if (s.internalHeightUpgrade || s.ls.internalHeightUpgrade)
    inclusionLines.push("Internal height upgraded to 2400mm");
  if (s.flexMirrorQty > 0) inclusionLines.push(s.flexMirrorQty + " full mirror door panel(s)");
  if (s.flexLaminateQty > 0) inclusionLines.push(s.flexLaminateQty + " laminate finish piece(s)");
  if (s.flexTrouserHangerQty > 0) inclusionLines.push(s.flexTrouserHangerQty + " trouser hanger(s)");
  if (s.flexPulloutMirrorQty > 0)
    inclusionLines.push(s.flexPulloutMirrorQty + " full-length pull-out mirror(s)");
  if (s.flexDismantle) inclusionLines.push("Dismantle & disposal of existing wardrobe/fixtures");
  if (s.flexAddonRelocatePoint > 0)
    inclusionLines.push(s.flexAddonRelocatePoint + " relocated switch/power point(s)");
  if (s.flexAddonNewSwitch > 0) inclusionLines.push(s.flexAddonNewSwitch + " new light switch(es)");
  if (s.flexLed) inclusionLines.push("LED lighting (" + (s.flexAddonLedLength || 0).toFixed(1) + "m)");
  if (s.flexAddonSensor > 0) inclusionLines.push(s.flexAddonSensor + " wired sensor(s)");
  return inclusionLines;
}

export function flexExcludesLines(s: FlexState): string {
  const lines = ["Exclude (unless quoted separately):"];
  const electricalCovered = s.flexAddonRelocatePoint > 0 || s.flexAddonNewSwitch > 0;
  if (electricalCovered) {
    lines.push(
      "- Electrical works — aircon/ceiling fan shifting not included unless specified separately (switch/plug relocation and new points for this job are included above)"
    );
  } else {
    lines.push(
      "- Electrical works (e.g. switch/plug relocation, new electrical points, aircon/ceiling fan shifting)"
    );
  }
  if (!s.flexDismantle) {
    lines.push("- General works (dismantle/disposal of existing cabinetry/fixtures)");
  }
  lines.push(
    "- Floor & Wall works (e.g. paint touch up or full repainting, floor polish/repair/leveling)"
  );
  return lines.join("\n");
}

export function generateFlexQuoteStraight(
  s: FlexState,
  d: FlexDesignResult,
  prop: FlexProposal | null
): string {
  if (!prop) return "No valid proposal available.";
  const p = computeFlexPriceStraight(s, d, prop);
  const basketQty = s.flexWireBasketQty || suggestedBasketQty(prop);
  const internalH = internalHeightMm(s.internalHeightUpgrade);
  const today = getQuoteDate();
  const validUntil = new Date(today);
  validUntil.setMonth(validUntil.getMonth() + 1);
  const lines: string[] = [];
  lines.push("*HausFlex Wardrobe Quotation*");
  lines.push("Date: " + formatDateDDMMMYYYY(today));
  lines.push("Dimensions: " + Math.round(prop.actualLength) + " x " + s.ceiling + " x 600mm");
  lines.push("Door: " + flexDoorSummaryShort(d.door, d.door.material));
  lines.push("Wire baskets: " + basketQty + " unit(s)");
  lines.push("");
  lines.push(HAUSFLEX_CONSTRUCTION_NOTE(internalH, basketQty));
  if (d.door.type !== "none") {
    lines.push("- " + flexDoorSystemLine(d.door, d.door.material, d.doorHeight));
    lines.push(
      "- Track/partition framework built up to " + s.ceiling + "mm height, finished in white powder coat"
    );
  }
  const inclusionLines = flexInclusionLines(s);
  if (inclusionLines.length) {
    lines.push("");
    lines.push("_Additional inclusions for this quote:_");
    inclusionLines.forEach((l) => lines.push("- " + l));
  }
  lines.push("");
  lines.push(flexExcludesLines(s));
  lines.push("");
  lines.push("*Total (before GST): $" + p.total.toFixed(2) + "*");
  lines.push("_This quote is valid until " + formatDateDDMMMYYYY(validUntil) + "._");
  return lines.join("\n");
}

export function generateFlexQuoteLShape(s: FlexState, lsd: any): string {
  if (!lsd.valid) return "No valid L-shape configuration for these inputs.";
  const p = computeFlexPriceLShape(s, lsd);
  const basketQty =
    s.flexWireBasketQty || suggestedBasketQty(lsd.propA) + suggestedBasketQty(lsd.propB);
  const internalH = internalHeightMm(s.ls.internalHeightUpgrade);
  const today = getQuoteDate();
  const validUntil = new Date(today);
  validUntil.setMonth(validUntil.getMonth() + 1);
  const lines: string[] = [];
  lines.push("*HausFlex L-Shaped Wardrobe Quotation*");
  lines.push("Date: " + formatDateDDMMMYYYY(today));
  lines.push(
    "Dimensions: Leg A " +
      Math.round(lsd.propA.actualLength) +
      "mm x Leg B " +
      Math.round(lsd.propB.actualLength) +
      "mm x " +
      s.ls.ceiling +
      " x 600mm"
  );
  lines.push("Door — Leg A: " + flexDoorSummaryShort(lsd.legA.door, lsd.legA.door.material));
  lines.push("Door — Leg B: " + flexDoorSummaryShort(lsd.legB.door, lsd.legB.door.material));
  lines.push("Wire baskets: " + basketQty + " unit(s)");
  lines.push("");
  lines.push(HAUSFLEX_CONSTRUCTION_NOTE(internalH, basketQty));
  if (lsd.legA.door.type !== "none")
    lines.push("- Leg A: " + flexDoorSystemLine(lsd.legA.door, lsd.legA.door.material, lsd.doorHeight));
  if (lsd.legB.door.type !== "none")
    lines.push("- Leg B: " + flexDoorSystemLine(lsd.legB.door, lsd.legB.door.material, lsd.doorHeight));
  lines.push(
    "- Track/partition framework built up to " + s.ls.ceiling + "mm height, finished in white powder coat"
  );
  const inclusionLines = flexInclusionLines(s);
  if (inclusionLines.length) {
    lines.push("");
    lines.push("_Additional inclusions for this quote:_");
    inclusionLines.forEach((l) => lines.push("- " + l));
  }
  lines.push("");
  lines.push(flexExcludesLines(s));
  lines.push("");
  lines.push("*Total (before GST): $" + p.total.toFixed(2) + "*");
  lines.push("_This quote is valid until " + formatDateDDMMMYYYY(validUntil) + "._");
  return lines.join("\n");
}

export function generateFlexQuoteText(
  s: FlexState,
  d: FlexDesignResult,
  prop: FlexProposal | null,
  price?: any,
  lsd?: any
): string {
  if (s.shape === "lshape") {
    return generateFlexQuoteLShape(s, lsd || d);
  }
  return generateFlexQuoteStraight(s, d, prop);
}

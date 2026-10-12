/**
 * HAUSFLEX ENGINEERING CALCULATION ENGINE
 * Direct port of window.FlexApp from HausBedroom_Configurator_3.html
 */

import type {
  FlexState,
  SideCondition,
  SideElementResult,
  MinBillingResult,
  FlexDoorResolution,
  ModuleCombo,
  FlexTemplate,
  FlexProposal,
  FlexDesignResult,
  DoorPreference,
  FlexPriceResult,
} from "./types.ts";
import { roundFeet, applyMinBilling } from "./pole-engine.ts";

export { roundFeet, applyMinBilling };

/* ============ Section 3.1 — side elements (incl. beam) ============ */
export function flexSideElement(side: SideCondition): SideElementResult {
  if (side.type === "none") {
    return { doorW: 60, internalW: 60, kind: "partition", desc: "60mm partition (open side)" };
  }
  if (side.type === "wall") {
    return { doorW: 50, internalW: 0, kind: "pillar", desc: "50mm wall pillar (door-only deduction)" };
  }
  const w = (side.beamWidth || 130) + 30;
  return {
    doorW: w,
    internalW: 0,
    kind: "beampillar",
    desc: `${w}mm beam pillar (${side.beamWidth || 130}mm beam + 30mm, door-only deduction)`,
  };
}

/* ============ door resolution: sliding -> bifold -> single swing ============ */
export function trySliding(opening: number): { type: "sliding"; panelCount: number; panelWidth: number } | null {
  let n = 2;
  while (n <= 10) {
    const w = opening / n;
    if (w + 20 <= 1100 && w >= 600) return { type: "sliding", panelCount: n, panelWidth: w };
    n++;
  }
  return null;
}

export function tryBifold(opening: number): {
  type: "bifold" | "swing";
  panelCount: number;
  panelWidth: number;
  bifoldPairs: number;
  swingCount: number;
} | null {
  let n = 1;
  while (n <= 16) {
    const w = opening / n;
    if (w <= 600) break;
    n++;
  }
  let w2 = opening / n;
  if (w2 < 350) return null;

  // Even-count preference (Methodology 1.1 / HausPole Section 4): prefer all-bifold-pairs
  // over pairs-plus-a-trailing-swing-panel. Only bump if the narrower even count still clears 350mm.
  if (n > 1 && n % 2 === 1) {
    const nEven = n + 1;
    const wEven = opening / nEven;
    if (wEven >= 350) {
      n = nEven;
      w2 = wEven;
    }
  }
  const bifoldPairs = Math.floor(n / 2);
  const swingCount = n % 2;
  return { type: n === 1 ? "swing" : "bifold", panelCount: n, panelWidth: w2, bifoldPairs, swingCount };
}

export function resolveFlexDoor(opening: number, preferredType: DoorPreference = "auto"): FlexDoorResolution {
  if (opening <= 0) return { type: "none", panelCount: 0, panelWidth: 0, material: null };

  if (preferredType === "sliding") {
    const r = trySliding(opening);
    if (r) return { ...r, material: null };
    return { type: "infeasible", requested: "sliding", panelCount: 0, panelWidth: 0, material: null };
  }
  if (preferredType === "wooden" || preferredType === "aluminum") {
    const r = tryBifold(opening);
    if (r) return { ...r, material: preferredType };
    return { type: "infeasible", requested: preferredType, panelCount: 0, panelWidth: 0, material: null };
  }
  if (preferredType === "swing") {
    if (opening < 350) return { type: "infeasible", requested: "swing", panelCount: 0, panelWidth: 0, material: null };
    return { type: "swing", panelCount: 1, panelWidth: opening, material: "wooden", manual: true };
  }

  // auto: sliding -> bifold -> single swing fallback hierarchy, wooden material assumed on any hinged fallback
  const s = trySliding(opening);
  if (s) return { ...s, material: null };
  const b = tryBifold(opening);
  if (b) return { ...b, material: "wooden", autoMaterial: true };
  return { type: "swing", panelCount: 1, panelWidth: opening, material: "wooden", forced: true, autoMaterial: true };
}

export function placementValid(k: number, doorType: string): boolean {
  if (doorType === "bifold") return k % 2 === 1 || k === 1;
  return true;
}

/* ============ Section 3.2 — module fill search (550, 609, 762mm) ============ */
export function searchCombos(budget: number, doorType: string): { under: ModuleCombo | null; over: ModuleCombo | null } {
  const combos: ModuleCombo[] = [];
  for (let a = 0; a <= 8; a++) {
    for (let b = 1; b <= 8; b++) {
      for (let c = 0; c <= 8; c++) {
        const k = a + b + c;
        if (k < 1 || k > 8) continue;
        const total = 550 * a + 609 * b + 762 * c;
        combos.push({ a, b, c, k, total, deviation: total - budget });
      }
    }
  }
  const under = combos.filter((x) => x.total <= budget && placementValid(x.k, doorType)).sort((x, y) => y.total - x.total)[0] || null;
  const over = combos.filter((x) => x.total > budget && placementValid(x.k, doorType)).sort((x, y) => x.total - y.total)[0] || null;
  return { under, over };
}

export function searchCombosRaw(budget: number): { under: ModuleCombo | null; over: ModuleCombo | null } {
  const combos: ModuleCombo[] = [];
  for (let a = 0; a <= 8; a++) {
    for (let b = 0; b <= 8; b++) {
      for (let c = 0; c <= 8; c++) {
        const k = a + b + c;
        if (k < 1 || k > 8) continue;
        const total = 550 * a + 609 * b + 762 * c;
        combos.push({ a, b, c, k, total, deviation: total - budget });
      }
    }
  }
  const under = combos.filter((x) => x.total <= budget).sort((x, y) => y.total - x.total)[0] || null;
  const over = combos.filter((x) => x.total > budget).sort((x, y) => x.total - y.total)[0] || null;
  return { under, over };
}

export function hasEligible609(widths: number[], cornerRole: string | null): boolean {
  const idxs = widths.map((w, i) => (w === 609 ? i : -1)).filter((i) => i >= 0);
  if (cornerRole === "owning" || cornerRole === "losing") return idxs.some((i) => i !== 0);
  return idxs.length > 0;
}

export function searchCombosCornerEligible(
  budget: number,
  doorType: string,
  cornerRole: string | null
): { under: ModuleCombo | null; over: ModuleCombo | null } {
  const combos: ModuleCombo[] = [];
  for (let a = 0; a <= 8; a++) {
    for (let b = 1; b <= 8; b++) {
      for (let c = 0; c <= 8; c++) {
        const k = a + b + c;
        if (k < 1 || k > 8) continue;
        const total = 550 * a + 609 * b + 762 * c;
        combos.push({ a, b, c, k, total, deviation: total - budget });
      }
    }
  }
  function passes(x: ModuleCombo): boolean {
    if (!placementValid(x.k, doorType)) return false;
    const widths = comboToSections(x);
    return hasEligible609(widths, cornerRole);
  }
  const under = combos.filter((x) => x.total <= budget && passes(x)).sort((x, y) => y.total - x.total)[0] || null;
  const over = combos.filter((x) => x.total > budget && passes(x)).sort((x, y) => x.total - y.total)[0] || null;
  return { under, over };
}

export function comboToSections(combo: ModuleCombo): number[] {
  const arr: number[] = [];
  for (let i = 0; i < combo.a; i++) arr.push(550);
  for (let i = 0; i < combo.b; i++) arr.push(609);
  for (let i = 0; i < combo.c; i++) arr.push(762);
  arr.sort((x, y) => y - x);
  return arr;
}

export function computePanelSlots(doorOpeningStart: number, doorOpening: number, panelCount: number): [number, number][] {
  const panelWidth = doorOpening / panelCount;
  const slots: [number, number][] = [];
  for (let i = 0; i < panelCount; i++) {
    slots.push([doorOpeningStart + i * panelWidth, doorOpeningStart + (i + 1) * panelWidth]);
  }
  return slots;
}

export function computeSectionPositions(widths: number[], sectionsStart: number): [number, number][] {
  const pos: [number, number][] = [];
  let x = sectionsStart;
  widths.forEach((w) => {
    pos.push([x, x + w]);
    x += w;
  });
  return pos;
}

export function evaluateSlotFit(
  secStart: number,
  secEnd: number,
  slots: [number, number][],
  marginMm: number
): { status: "straddle" | "pass" | "nearmiss"; margin: number | null } {
  let best: { margin: number } | null = null;
  for (const [s0, s1] of slots) {
    if (secStart >= s0 && secEnd <= s1) {
      const margin = s1 - secEnd;
      if (!best || margin > best.margin) best = { margin };
    }
  }
  if (!best) return { status: "straddle", margin: null };
  return { status: best.margin >= marginMm ? "pass" : "nearmiss", margin: best.margin };
}

export function allocateBaskets(
  widths: number[],
  doorType: string,
  cornerRole: string | null,
  leftKind: string,
  rightKind: string,
  desiredQty: number | null,
  slidingCtx: { doorOpeningStart: number; doorOpening: number; panelCount: number; sectionsStart: number } | null
) {
  const perSectionMax = 4;
  const lastIdx = widths.length - 1;
  let candidates = widths.map((w, i) => (w === 609 ? i : -1)).filter((i) => i >= 0);
  if (cornerRole === "losing" || cornerRole === "owning") candidates = candidates.filter((i) => i !== 0);
  if (leftKind === "pillar" || leftKind === "beampillar") candidates = candidates.filter((i) => i !== 0);
  if (rightKind === "pillar" || rightKind === "beampillar") candidates = candidates.filter((i) => i !== lastIdx);

  const positionInvalid: number[] = [];
  const nearMiss: { index: number; margin: number }[] = [];

  if (doorType === "sliding" && slidingCtx) {
    const slots = computePanelSlots(slidingCtx.doorOpeningStart, slidingCtx.doorOpening, slidingCtx.panelCount);
    const positions = computeSectionPositions(widths, slidingCtx.sectionsStart);
    candidates = candidates.filter((i) => {
      const [s0, s1] = positions[i];
      const fit = evaluateSlotFit(s0, s1, slots, 25);
      if (fit.status === "straddle") {
        positionInvalid.push(i);
        return false;
      }
      if (fit.status === "nearmiss" && fit.margin !== null) {
        nearMiss.push({ index: i, margin: fit.margin });
      }
      return true;
    });
  }

  const targetQty = desiredQty == null ? candidates.length * perSectionMax : Math.max(0, desiredQty);
  const neededSections = desiredQty == null ? candidates.length : Math.ceil(targetQty / perSectionMax);

  let orderedCandidates = candidates;
  if (doorType === "bifold") {
    const mid = Math.floor((widths.length - 1) / 2);
    orderedCandidates = candidates.slice().sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    orderedCandidates = orderedCandidates.slice(0, 1); // bifold capped at 1 basket section
  }

  const usedIndices: number[] = [];
  for (const i of orderedCandidates) {
    if (usedIndices.length >= neededSections) break;
    const adjacent = usedIndices.some((j) => Math.abs(j - i) === 1);
    if (!adjacent) usedIndices.push(i);
  }
  usedIndices.sort((a, b) => a - b);

  const basketCounts: Record<number, number> = {};
  let remaining = targetQty;
  usedIndices.forEach((i) => {
    const count = Math.min(perSectionMax, remaining);
    basketCounts[i] = count;
    remaining = Math.max(0, remaining - count);
  });
  const basketIndices = usedIndices.filter((i) => (basketCounts[i] || 0) > 0);

  const tmpl: (FlexTemplate | null)[] = new Array(widths.length).fill(null);
  if (cornerRole === "owning") tmpl[0] = "F1";
  basketIndices.forEach((i) => (tmpl[i] = "F3"));
  let alt: FlexTemplate = "F1";
  for (let i = 0; i < widths.length; i++) {
    if (tmpl[i]) continue;
    tmpl[i] = alt;
    alt = alt === "F1" ? "F2" : "F1";
  }
  if (widths.length >= 3) {
    if (tmpl[lastIdx] !== "F3" && tmpl[lastIdx] !== "F1") tmpl[lastIdx] = "F4";
  }
  const actualQty = basketIndices.reduce((sum, i) => sum + (basketCounts[i] || 0), 0);
  const capped = desiredQty != null && actualQty < desiredQty;
  return {
    templates: tmpl,
    basketIndices,
    basketCounts,
    actualQty,
    capped,
    neededSections,
    positionInvalid,
    nearMiss,
  };
}

export const TEMPLATE_INFO: Record<FlexTemplate, { name: string; desc: string }> = {
  F1: { name: "Double hang", desc: "Top shelf @2100 + rod @2050 + rod @1050" },
  F2: { name: "Long hang", desc: "Top shelf @2100 + rod @2050" },
  F3: { name: "Basket stack", desc: "Top shelf @2100 + rod @2050 + up to 4 baskets (~200–900mm)" },
  F4: { name: "Shelf column", desc: "Top shelf @2100 + 4–5 wire shelves @~350mm spacing" },
};

export function basketTableCount(feet: number): number {
  if (feet < 5) return 2;
  if (feet <= 8) return 3;
  if (feet <= 12) return 4;
  if (feet < 15) return 6;
  return 8;
}

export function computeGeometry(
  combo: ModuleCombo,
  dir: "under" | "over",
  budget: number,
  leftInternalW: number,
  rightInternalW: number,
  cornerExtraMm: number = 0
): { actualLength: number; bareWallMm: number; note: string } {
  const extra = cornerExtraMm || 0;
  let actualLength: number;
  let bareWallMm = 0;
  let note: string;

  if (dir === "under") {
    const leftover = budget - combo.total;
    if (leftover < 30) {
      actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra + leftover;
      note = `Leftover (${leftover.toFixed(0)}mm) absorbed into allowances — built to stated length, no visible gap.`;
    } else {
      actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra;
      bareWallMm = leftover;
      note = `Leftover (${leftover.toFixed(0)}mm) ≥30mm — not padded. Built shorter; remaining wall stays bare.`;
    }
  } else {
    const excess = combo.total - budget;
    actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra;
    note = `Exceeds target by ${excess.toFixed(0)}mm — "next size up". No ceiling on overage; designer confirms room fit on site.`;
  }
  return { actualLength, bareWallMm, note };
}

export function buildProposal(
  combo: ModuleCombo | null,
  dir: "under" | "over",
  budget: number,
  leftInternalW: number,
  rightInternalW: number,
  doorType: string,
  cornerRole: string | null,
  cornerExtraMm: number,
  leftKind: string,
  rightKind: string,
  desiredBasketQty: number | null,
  slidingCtx: { doorOpeningStart: number; doorOpening: number; panelCount: number; sectionsStart: number } | null = null
): FlexProposal | null {
  if (!combo) return null;
  const widths = comboToSections(combo);
  const geo = computeGeometry(combo, dir, budget, leftInternalW, rightInternalW, cornerExtraMm);
  const tableQty = basketTableCount(roundFeet(geo.actualLength));
  const effectiveDesired = desiredBasketQty == null ? tableQty : desiredBasketQty;
  const alloc = allocateBaskets(widths, doorType, cornerRole, leftKind, rightKind, effectiveDesired, slidingCtx);
  return {
    combo,
    widths,
    basketIndices: alloc.basketIndices,
    basketCounts: alloc.basketCounts,
    basketIdx: alloc.basketIndices[0] ?? -1,
    basketActualQty: alloc.actualQty,
    basketCapped: alloc.capped,
    basketNeededSections: alloc.neededSections,
    basketPositionInvalid: alloc.positionInvalid,
    basketNearMiss: alloc.nearMiss,
    basketTableQty: tableQty,
    basketExtra: Math.max(0, alloc.actualQty - tableQty),
    templates: alloc.templates,
    actualLength: geo.actualLength,
    bareWallMm: geo.bareWallMm,
    note: geo.note,
    dir,
  };
}

export function computeDoorHeightAndPelmet(
  doorType: string,
  material: string | null,
  flexCeilingInput: number,
  doorHeightUpgrade: boolean
): {
  ceiling: number;
  doorHeight: number;
  pelmetHeight: number;
  split: { bottom: number; top: number } | null;
  midRail: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let ceiling = flexCeilingInput;
  if (ceiling > 3300) {
    warnings.push(
      `Overall system height capped at 3300mm regardless of ceiling (Methodology 1.1) — excess (${
        ceiling - 3300
      }mm) stays as bare wall above the pelmet.`
    );
    ceiling = 3300;
  }
  const ceilingGap = 50;
  const maxBudget = ceiling - ceilingGap;
  const upgradeAvailable = ceiling > 2450;
  const useUpgrade = upgradeAvailable && doorHeightUpgrade;
  let doorHeight = 0;
  let pelmetHeight = 0;
  let split: { bottom: number; top: number } | null = null;
  let midRail = false;

  if (doorType !== "none" && doorType !== "infeasible") {
    doorHeight = useUpgrade ? Math.min(maxBudget, 2800) : Math.min(2400, maxBudget);
    if ((doorType === "bifold" || doorType === "swing") && doorHeight > 2400) {
      if (material === "wooden") {
        const top = Math.max(600, doorHeight - 2080);
        split = { bottom: 2080, top };
        doorHeight = Math.min(2080 + top, maxBudget);
      } else {
        midRail = true; // aluminum bifold >2400mm: structural mid-rail
      }
    }
    pelmetHeight = ceiling - doorHeight;
    if (pelmetHeight < 50) {
      doorHeight -= 50 - pelmetHeight;
      pelmetHeight = 50;
    }
  }
  return { ceiling, doorHeight, pelmetHeight, split, midRail, warnings };
}

export function computeAnchorPillars(door: FlexDoorResolution): { hingeUnits: number; interiorPillars: number } {
  if (door.type !== "bifold" && door.type !== "swing") return { hingeUnits: 0, interiorPillars: 0 };
  const hingeUnits = (door.bifoldPairs || 0) + (door.swingCount || (door.type === "swing" ? 1 : 0));
  const interiorPillars = Math.max(0, Math.ceil((hingeUnits - 2) / 2));
  return { hingeUnits, interiorPillars };
}

export function computeFlexDesign(s: FlexState): FlexDesignResult {
  const warnings: string[] = [];
  const left = flexSideElement(s.left);
  const right = flexSideElement(s.right);
  const leftDoorW = left.doorW || 60;
  const rightDoorW = right.doorW || 60;
  const leftInternalW = left.internalW || 0;
  const rightInternalW = right.internalW || 0;

  const doorOpening = s.length - leftDoorW - rightDoorW;
  const internalWidth = s.length - leftInternalW - rightInternalW;
  const moduleBudget = internalWidth - 65;

  if (doorOpening < 300) warnings.push(`Door opening (${Math.round(doorOpening)}mm) is very narrow — check inputs.`);

  const door = s.doorRequired ? resolveFlexDoor(doorOpening, s.flexDoorTypePref) : { type: "none" as const, panelCount: 0, panelWidth: 0, material: null };
  if (door.forced) warnings.push("Opening too narrow for sliding/bifold minimums — forced to single swing regardless of width.");
  if (door.type === "infeasible") {
    warnings.push(`Requested door type "${door.requested}" cannot fit this opening (${Math.round(doorOpening)}mm) — its minimum panel width requirement isn't met. Switch to Auto or a different door type.`);
  }

  const { under, over } = searchCombos(moduleBudget, door.type === "infeasible" ? "none" : door.type);
  if (!under && !over) warnings.push("No valid section combination found for this opening/door combination.");

  const desiredQty = s.wireBasketTouched ? s.flexWireBasketQty : null;
  const slidingCtx =
    door.type === "sliding"
      ? {
          doorOpeningStart: leftDoorW,
          doorOpening,
          panelCount: door.panelCount,
          sectionsStart: leftInternalW + 20,
        }
      : null;

  const proposalA = buildProposal(under, "under", moduleBudget, leftInternalW, rightInternalW, door.type, null, 0, left.kind, right.kind, desiredQty, slidingCtx);
  const proposalB = buildProposal(over, "over", moduleBudget, leftInternalW, rightInternalW, door.type, null, 0, left.kind, right.kind, desiredQty, slidingCtx);

  [proposalA, proposalB].forEach((p) => {
    if (!p) return;
    if (p.basketPositionInvalid && p.basketPositionInvalid.length) {
      warnings.push(
        `Proposal ${p.dir === "under" ? "A" : "B"}: section(s) ${p.basketPositionInvalid
          .map((i) => i + 1)
          .join(", ")} excluded from basket eligibility — they straddle a sliding door panel boundary (Section 5.1 positional check).`
      );
    }
    if (p.basketNearMiss && p.basketNearMiss.length) {
      p.basketNearMiss.forEach((nm) => {
        warnings.push(
          `⚑ FLAG — MANUAL CONFIRMATION REQUIRED: Proposal ${p.dir === "under" ? "A" : "B"} section ${
            nm.index + 1
          } has only ${nm.margin.toFixed(
            0
          )}mm basket clearance margin (below the 25mm target, but the basket does physically fit — Section 5.1 near-miss rule). Included by default; confirm with designer/installer before finalizing.`
        );
      });
    }
    if (p.basketIndices.length === 0) {
      warnings.push(`Proposal ${p.dir === "under" ? "A" : "B"}: no section qualifies as the mandatory basket-capable 609mm slot given placement and panel-position rules.`);
    }
    if (p.basketCapped) {
      warnings.push(
        `Proposal ${p.dir === "under" ? "A" : "B"}: requested ${
          desiredQty == null ? p.basketTableQty : desiredQty
        } baskets, but only ${p.basketActualQty} fit given eligible, non-adjacent, panel-aligned 609mm sections — allocation capped (Methodology 3.4/5.1).`
      );
    }
  });

  const heightCalc = computeDoorHeightAndPelmet(door.type, door.material, s.ceiling, s.doorHeightUpgrade);
  warnings.push(...heightCalc.warnings);
  const anchor = computeAnchorPillars(door);

  let mirrorValid = false;
  let mirrorSide: "left" | "right" | null = null;
  if (s.flexPulloutMirrorQty > 0) {
    if (left.kind === "partition") {
      mirrorValid = true;
      mirrorSide = "left";
    } else if (right.kind === "partition") {
      mirrorValid = true;
      mirrorSide = "right";
    } else {
      warnings.push("Pull-out mirror requested but neither side is an open-end partition (both are wall/beam pillars) — mirror needs a partition side to mount on (Section 6.1). Not included.");
    }
  }

  return {
    left,
    right,
    sideL: left,
    sideR: right,
    doorOpening,
    internalWidth,
    moduleBudget,
    door,
    proposalA,
    proposalB,
    doorHeight: heightCalc.doorHeight,
    pelmetHeight: heightCalc.pelmetHeight,
    doorSplit: heightCalc.split,
    doorMidRail: heightCalc.midRail,
    anchor,
    mirrorValid,
    mirrorSide,
    warnings,
  };
}

/* ============ Section 9 — L-Shape Module Calculation ============ */
export function computeLegOptions(
  legLength: number,
  outerSide: SideCondition,
  doorRequired: boolean,
  isLosing: boolean,
  cornerRole: string,
  doorTypePref: DoorPreference
) {
  const outer = flexSideElement(outerSide);
  const outerDoorW = outer.doorW || 60;
  const outerInternalW = outer.internalW || 0;
  const doorOpening = legLength - outerDoorW - 600;
  const door = doorRequired ? resolveFlexDoor(doorOpening, doorTypePref || "auto") : { type: "none" as const, panelCount: 0, panelWidth: 0, material: null };
  const internalBase = legLength - outerInternalW;
  const budget = internalBase - 65 - (isLosing ? 600 : 0);
  const dt = door.type === "infeasible" ? "none" : door.type;
  const free = searchCombosRaw(budget);
  const eligible = searchCombosCornerEligible(budget, dt, cornerRole);
  return { outer, doorOpening, door, budget, free, eligible };
}

export function legBest(leg: { under: ModuleCombo | null; over: ModuleCombo | null }): { combo: ModuleCombo; dir: "under" | "over"; dev: number } | null {
  const cands: { combo: ModuleCombo; dir: "under" | "over"; dev: number }[] = [];
  if (leg.under) cands.push({ combo: leg.under, dir: "under", dev: Math.abs(leg.under.deviation) });
  if (leg.over) cands.push({ combo: leg.over, dir: "over", dev: Math.abs(leg.over.deviation) });
  if (!cands.length) return null;
  cands.sort((x, y) => x.dev - y.dev);
  return cands[0];
}

export function computeFlexLShape(s: FlexState) {
  const warnings: string[] = [];
  const ls = s.ls;
  const cases = [{ ownerA: true }, { ownerA: false }];
  let best: any = null;
  let bestDimensionOnly: any = null;

  cases.forEach((c) => {
    const roleA = c.ownerA ? "owning" : "losing";
    const roleB = c.ownerA ? "losing" : "owning";
    const legA = computeLegOptions(ls.legA.length, ls.legA.outer, ls.doorRequired, !c.ownerA, roleA, ls.doorTypePref);
    const legB = computeLegOptions(ls.legB.length, ls.legB.outer, ls.doorRequired, c.ownerA, roleB, ls.doorTypePref);
    const freeBestA = legBest(legA.free);
    const freeBestB = legBest(legB.free);
    if (!freeBestA || !freeBestB) return;

    const widthsFreeA = comboToSections(freeBestA.combo);
    const widthsFreeB = comboToSections(freeBestB.combo);
    const okA = hasEligible609(widthsFreeA, roleA);
    const okB = hasEligible609(widthsFreeB, roleB);

    let chosenA = freeBestA;
    let chosenB = freeBestB;
    let concededLeg: string | null = null;
    let basketPossible = okA || okB;

    if (!okA && !okB) {
      const eligA = legBest(legA.eligible);
      const eligB = legBest(legB.eligible);
      if (eligA || eligB) {
        const costA = eligA ? eligA.dev - freeBestA.dev : Infinity;
        const costB = eligB ? eligB.dev - freeBestB.dev : Infinity;
        if (costA <= costB && eligA) {
          chosenA = eligA;
          concededLeg = "A";
        } else if (eligB) {
          chosenB = eligB;
          concededLeg = "B";
        }
        basketPossible = true;
      }
    }
    const totalDev = chosenA.dev + chosenB.dev;
    const candidate = { case: c, legA, legB, roleA, roleB, chosenA, chosenB, totalDev, concededLeg, basketPossible };
    if (!bestDimensionOnly || totalDev < bestDimensionOnly.totalDev) bestDimensionOnly = candidate;
    if (basketPossible && (!best || totalDev < best.totalDev)) best = candidate;
  });

  if (!best && !bestDimensionOnly) {
    warnings.push("No viable corner-ownership assignment found — both legs fail to fit even a minimal section combination. Consider HausPole instead.");
    return { warnings, valid: false };
  }
  if (!best) {
    warnings.push("Neither corner-ownership assignment can satisfy the mandatory 609-with-basket rule anywhere in the shape (Section 9.3).");
    best = bestDimensionOnly;
  }

  const { legA, legB, roleA, roleB, chosenA: bA, chosenB: bB, concededLeg, case: winCase } = best;
  if (concededLeg) warnings.push(`Leg ${concededLeg} used a less-close section combination specifically to provide the mandatory basket-capable section.`);
  if (legA.door.type === "infeasible") warnings.push(`Leg A: requested door type "${legA.door.requested}" cannot fit this leg's opening.`);
  if (legB.door.type === "infeasible") warnings.push(`Leg B: requested door type "${legB.door.requested}" cannot fit this leg's opening.`);

  const geoA = computeGeometry(bA.combo, bA.dir, legA.budget, 0, legA.outer.internalW || 0, roleA === "losing" ? 600 : 0);
  const geoB = computeGeometry(bB.combo, bB.dir, legB.budget, 0, legB.outer.internalW || 0, roleB === "losing" ? 600 : 0);
  const combinedFeet = roundFeet(geoA.actualLength + geoB.actualLength);
  const tableQty = basketTableCount(combinedFeet);

  const touched = s.wireBasketTouched;
  const totalDesired = touched ? s.flexWireBasketQty : tableQty;
  const propA = buildProposal(bA.combo, bA.dir, legA.budget, 0, legA.outer.internalW || 0, legA.door.type, roleA, roleA === "losing" ? 600 : 0, "partition", legA.outer.kind, totalDesired);
  const qtyB = Math.max(0, totalDesired - (propA?.basketActualQty || 0));
  const propB = buildProposal(bB.combo, bB.dir, legB.budget, 0, legB.outer.internalW || 0, legB.door.type, roleB, roleB === "losing" ? 600 : 0, "partition", legB.outer.kind, qtyB);

  const combinedBasketActual = (propA?.basketActualQty || 0) + (propB?.basketActualQty || 0);
  const combinedBasketExtra = Math.max(0, combinedBasketActual - tableQty);

  const heightCalc = computeDoorHeightAndPelmet(legA.door.type, legA.door.material, s.ls.ceiling, s.ls.doorHeightUpgrade);

  return {
    valid: true,
    warnings,
    legA,
    legB,
    roleA,
    roleB,
    propA,
    propB,
    doorHeight: heightCalc.doorHeight,
    pelmetHeight: heightCalc.pelmetHeight,
    winCase,
    basketTableQty: tableQty,
    basketExtra: combinedBasketExtra,
    basketActualTotal: combinedBasketActual,
  };
}

/* ============ pricing ============ */
export function materialLabel(m: string | null): string {
  return m === "wooden" ? "wooden" : "aluminium";
}

export function ceilingTierRate(ceiling: number, doorPresent: boolean, doorHeightUpgrade: boolean, internalHeightUpgrade: boolean): number {
  if (!doorPresent) return internalHeightUpgrade ? 30 : 0;
  if (ceiling <= 2600) return 0;
  if (ceiling <= 3000) return doorHeightUpgrade || internalHeightUpgrade ? 60 : 30;
  return 100;
}

export function hingeCost(door: FlexDoorResolution, material: string | null): { units: number; cost: number; panels: number } {
  if (door.type !== "bifold" && door.type !== "swing") return { units: 0, cost: 0, panels: 0 };
  const units = (door.bifoldPairs || 0) + (door.swingCount || (door.type === "swing" ? 1 : 0));
  const panels = (door.bifoldPairs || 0) * 2 + (door.swingCount || (door.type === "swing" ? 1 : 0));
  return { units, cost: units * 150, panels };
}

export function computeFlexPriceStraight(s: FlexState, d: FlexDesignResult, prop: FlexProposal | null): FlexPriceResult {
  if (!prop) {
    return {
      lines: [],
      total: 0,
      feet: 0,
    };
  }
  const lines: { label: string; amt: number }[] = [];
  const doorPresent = d.door.type !== "none";
  const baseRateOnly = doorPresent ? 320 : 190;
  const tierTop = ceilingTierRate(s.ceiling, doorPresent, s.doorHeightUpgrade, s.internalHeightUpgrade);
  const rate = baseRateOnly + tierTop;
  const feet = roundFeet(prop.actualLength);
  const billing = applyMinBilling(feet);
  const baseCost = billing.billFeet * rate;

  lines.push({ label: `Base rate (${billing.billFeet.toFixed(1)}ft × $${baseRateOnly}/pftrun)`, amt: billing.billFeet * baseRateOnly });
  if (tierTop > 0) lines.push({ label: `Ceiling-height top-up (${billing.billFeet.toFixed(1)}ft × $${tierTop}/pftrun)`, amt: billing.billFeet * tierTop });
  let total = baseCost;
  if (billing.surcharge) {
    lines.push({ label: "Small-order surcharge", amt: billing.surcharge });
    total += billing.surcharge;
  }
  const h = hingeCost(d.door, d.door.material);
  if (h.units) {
    lines.push({ label: `${h.units}× hinge unit (${materialLabel(d.door.material)}) × $150 (structural)`, amt: h.cost });
    total += h.cost;
  }
  if (d.door.material === "wooden" && h.panels > 0) {
    const laminatePieces = Math.ceil(h.panels / 2);
    const laminateCost = laminatePieces * 80;
    lines.push({ label: `${laminatePieces}× laminate piece (pooled, ${h.panels} panels ÷ 2) × $80`, amt: laminateCost });
    total += laminateCost;
  }
  if (prop.basketExtra > 0) {
    const c = prop.basketExtra * 120;
    lines.push({ label: `${prop.basketExtra}× additional wire basket (beyond ${prop.basketTableQty} standard)`, amt: c });
    total += c;
  }
  if (s.flexMirrorQty > 0) {
    const c = s.flexMirrorQty * 150;
    lines.push({ label: `${s.flexMirrorQty}× full mirror panel`, amt: c });
    total += c;
  }
  if (s.flexLaminateQty > 0 && d.door.material !== "wooden") {
    const c = s.flexLaminateQty * 80;
    lines.push({ label: `${s.flexLaminateQty}× laminate piece (optional)`, amt: c });
    total += c;
  }
  if (s.flexTrouserHangerQty > 0) {
    const c = s.flexTrouserHangerQty * 120;
    lines.push({ label: `${s.flexTrouserHangerQty}× trouser hanger`, amt: c });
    total += c;
  }
  if (s.flexPulloutMirrorQty > 0) {
    const c = s.flexPulloutMirrorQty * 200;
    lines.push({ label: `${s.flexPulloutMirrorQty}× full-length pull-out mirror`, amt: c });
    total += c;
  }
  if (s.flexDismantle) {
    const c = Math.max(200, feet * 40);
    lines.push({ label: `Dismantle & disposal (${feet.toFixed(1)}ft × $40, min $200)`, amt: c });
    total += c;
  }
  if (s.flexAddonRelocatePoint > 0) {
    const c = s.flexAddonRelocatePoint * 80;
    lines.push({ label: `${s.flexAddonRelocatePoint}× relocated switch/power point`, amt: c });
    total += c;
  }
  if (s.flexAddonNewSwitch > 0) {
    const c = s.flexAddonNewSwitch * 100;
    lines.push({ label: `${s.flexAddonNewSwitch}× new light switch`, amt: c });
    total += c;
  }
  if (s.flexLed) {
    const len = Math.max(0, s.flexAddonLedLength || 0);
    const excess = Math.max(0, len - 1.5);
    const c = 180 + excess * 120;
    lines.push({ label: `LED lighting (${len.toFixed(1)}m, min $180 incl. first 1.5m${excess > 0 ? ` + ${excess.toFixed(1)}m excess × $120` : ""})`, amt: c });
    total += c;
  }
  if (s.flexAddonSensor > 0) {
    const c = s.flexAddonSensor * 80;
    lines.push({ label: `${s.flexAddonSensor}× wired sensor`, amt: c });
    total += c;
  }
  return { lines, total, feet };
}

export function computeFlexPriceLShape(s: FlexState, lsd: any): FlexPriceResult {
  const lines: { label: string; amt: number }[] = [];
  const doorPresent = lsd.legA.door.type !== "none" || lsd.legB.door.type !== "none";
  const baseRateOnly = doorPresent ? 320 : 190;
  const tierTop = ceilingTierRate(s.ls.ceiling, doorPresent, s.ls.doorHeightUpgrade, s.ls.internalHeightUpgrade);
  const rate = baseRateOnly + tierTop;
  const combinedMm = (lsd.propA?.actualLength || 0) + (lsd.propB?.actualLength || 0) - 304.8;
  const feet = roundFeet(combinedMm);
  const billing = applyMinBilling(feet);
  const baseCost = billing.billFeet * rate;

  lines.push({ label: `Base rate, combined (${billing.billFeet.toFixed(1)}ft × $${baseRateOnly}/pftrun, 1ft corner deduction)`, amt: billing.billFeet * baseRateOnly });
  if (tierTop > 0) lines.push({ label: `Ceiling-height top-up (${billing.billFeet.toFixed(1)}ft × $${tierTop}/pftrun)`, amt: billing.billFeet * tierTop });
  let total = baseCost;
  if (billing.surcharge) {
    lines.push({ label: "Small-order surcharge", amt: billing.surcharge });
    total += billing.surcharge;
  }
  const hA = hingeCost(lsd.legA.door, lsd.legA.door.material);
  const hB = hingeCost(lsd.legB.door, lsd.legB.door.material);
  if (hA.units) {
    lines.push({ label: `Leg A: ${hA.units}× hinge unit (${materialLabel(lsd.legA.door.material)}) × $150 (structural)`, amt: hA.cost });
    total += hA.cost;
  }
  if (hB.units) {
    lines.push({ label: `Leg B: ${hB.units}× hinge unit (${materialLabel(lsd.legB.door.material)}) × $150 (structural)`, amt: hB.cost });
    total += hB.cost;
  }
  const woodenPanels = (lsd.legA.door.material === "wooden" ? hA.panels : 0) + (lsd.legB.door.material === "wooden" ? hB.panels : 0);
  if (woodenPanels > 0) {
    const laminatePieces = Math.ceil(woodenPanels / 2);
    const laminateCost = laminatePieces * 80;
    lines.push({ label: `${laminatePieces}× laminate piece (pooled across both legs, ${woodenPanels} panels ÷ 2) × $80`, amt: laminateCost });
    total += laminateCost;
  }
  if (lsd.basketExtra > 0) {
    const c = lsd.basketExtra * 120;
    lines.push({ label: `${lsd.basketExtra}× additional wire basket (beyond ${lsd.basketTableQty} standard, combined)`, amt: c });
    total += c;
  }
  if (s.flexMirrorQty > 0) {
    const c = s.flexMirrorQty * 150;
    lines.push({ label: `${s.flexMirrorQty}× full mirror panel`, amt: c });
    total += c;
  }
  const anyWoodenLeg = lsd.legA.door.material === "wooden" || lsd.legB.door.material === "wooden";
  if (s.flexLaminateQty > 0 && !anyWoodenLeg) {
    const c = s.flexLaminateQty * 80;
    lines.push({ label: `${s.flexLaminateQty}× laminate piece (optional)`, amt: c });
    total += c;
  }
  if (s.flexTrouserHangerQty > 0) {
    const c = s.flexTrouserHangerQty * 120;
    lines.push({ label: `${s.flexTrouserHangerQty}× trouser hanger`, amt: c });
    total += c;
  }
  if (s.flexPulloutMirrorQty > 0) {
    const c = s.flexPulloutMirrorQty * 200;
    lines.push({ label: `${s.flexPulloutMirrorQty}× full-length pull-out mirror`, amt: c });
    total += c;
  }
  if (s.flexDismantle) {
    const c = Math.max(200, feet * 40);
    lines.push({ label: `Dismantle & disposal (${feet.toFixed(1)}ft × $40, min $200)`, amt: c });
    total += c;
  }
  if (s.flexAddonRelocatePoint > 0) {
    const c = s.flexAddonRelocatePoint * 80;
    lines.push({ label: `${s.flexAddonRelocatePoint}× relocated switch/power point`, amt: c });
    total += c;
  }
  if (s.flexAddonNewSwitch > 0) {
    const c = s.flexAddonNewSwitch * 100;
    lines.push({ label: `${s.flexAddonNewSwitch}× new light switch`, amt: c });
    total += c;
  }
  if (s.flexLed) {
    const len = Math.max(0, s.flexAddonLedLength || 0);
    const excess = Math.max(0, len - 1.5);
    const c = 180 + excess * 120;
    lines.push({ label: `LED lighting (${len.toFixed(1)}m, min $180 incl. first 1.5m${excess > 0 ? ` + ${excess.toFixed(1)}m excess × $120` : ""})`, amt: c });
    total += c;
  }
  if (s.flexAddonSensor > 0) {
    const c = s.flexAddonSensor * 80;
    lines.push({ label: `${s.flexAddonSensor}× wired sensor`, amt: c });
    total += c;
  }
  return { lines, total, feet };
}

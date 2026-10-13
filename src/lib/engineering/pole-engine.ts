/**
 * HAUSPOLE ENGINEERING CALCULATION ENGINE
 * Direct port of window.PoleApp from HausBedroom_Configurator_3.html
 */

import type {
  PoleState,
  SideCondition,
  SideElementResult,
  MinBillingResult,
  PoleDoorResolution,
  PoleDesignResult,
  PoleInternalLayout,
  PoleSegment,
  PoleLegDoor,
  PoleLShapeDesign,
  PolePriceResult,
  PoleLShapePriceResult,
  AddonPriceResult,
  DoorPreference,
  PoleSplitInfo,
} from "./types";

export function roundFeet(mm: number): number {
  return Math.round((mm / 304.8) * 10) / 10;
}

/**
 * Small-order billing rule (Pricing Guideline Section 7):
 * - Under 4.5ft: $150 labor/transport surcharge on top of actual footage
 * - 4.5ft - 5ft: Billed at a flat 5ft minimum (no surcharge)
 * - Above 5ft: Bill actual footage
 */
export function applyMinBilling(feet: number): MinBillingResult {
  if (feet < 4.5) {
    return {
      billFeet: feet,
      surcharge: 150,
      note: "Order under 4.5ft — $150 labor/transport surcharge applies (Pricing Guideline Section 7).",
    };
  }
  if (feet <= 5) {
    return {
      billFeet: 5,
      surcharge: 0,
      note: "Order between 4.5–5ft — billed at 5ft minimum.",
    };
  }
  return { billFeet: feet, surcharge: 0, note: null };
}

export function sideElement(side: SideCondition): SideElementResult {
  if (side.type === "none") {
    return { width: 60, kind: "partition", desc: "60mm partition (open side)" };
  }
  if (side.type === "wall") {
    return { width: 50, kind: "pillar", desc: "50mm wall pillar" };
  }
  // beam
  const width = (side.beamWidth || 130) + 30;
  return {
    width,
    kind: "beampillar",
    desc: `${width}mm beam pillar (${side.beamWidth || 130}mm beam + 30mm)`,
  };
}

/**
 * Door type resolution: auto sliding -> bifold -> swing fallback, or forced preference
 */
export function resolvePoleDoorType(
  opening: number,
  doorRequired: boolean,
  pref: DoorPreference
): PoleDoorResolution {
  if (!doorRequired || opening <= 0) {
    return { doorType: "none", infeasible: false, autoMaterial: false, forcedSwing: false };
  }

  function fitSliding(): boolean {
    let n = 2;
    while (n <= 10) {
      const w = opening / n;
      if (w + 20 <= 1100 && w >= 600) return true;
      n++;
    }
    return false;
  }

  function fitBifold(forceSingle: boolean): boolean {
    if (forceSingle) return opening >= 350;
    let n = 1;
    while (n <= 16) {
      const w = opening / n;
      if (w <= 600) break;
      n++;
    }
    return opening / n >= 350;
  }

  if (pref === "sliding") {
    return { doorType: "sliding", infeasible: !fitSliding(), autoMaterial: false, forcedSwing: false };
  }
  if (pref === "wooden") {
    return { doorType: "wooden", infeasible: !fitBifold(false), autoMaterial: false, forcedSwing: false };
  }
  if (pref === "aluminum") {
    return { doorType: "aluminum", infeasible: !fitBifold(false), autoMaterial: false, forcedSwing: false };
  }
  if (pref === "swing") {
    return { doorType: "wooden", infeasible: !fitBifold(true), autoMaterial: false, forcedSwing: true };
  }

  // auto: sliding -> bifold -> single swing fallback, wooden assumed on any hinged fallback
  if (fitSliding()) {
    return { doorType: "sliding", infeasible: false, autoMaterial: false, forcedSwing: false };
  }
  if (fitBifold(false)) {
    return { doorType: "wooden", infeasible: false, autoMaterial: true, forcedSwing: false };
  }
  return { doorType: "wooden", infeasible: false, autoMaterial: true, forcedSwing: true };
}

export function computePoleDesign(s: PoleState): PoleDesignResult {
  const warnings: string[] = [];
  const notes: string[] = [];

  const left = sideElement(s.left);
  const right = sideElement(s.right);
  const depth = Math.min(s.depth, 750);

  const leftW = left.width || 60;
  const rightW = right.width || 60;
  const doorOpening = s.length - leftW - rightW;

  if (doorOpening < 300) {
    warnings.push(
      `Door opening (${Math.round(doorOpening)}mm) is very narrow after partitions/pillars — check inputs.`
    );
  }

  const doorResolution = resolvePoleDoorType(doorOpening, s.doorRequired, s.doorTypePref);
  s.doorType = doorResolution.infeasible ? "none" : doorResolution.doorType;
  s.doorAutoMaterial = doorResolution.autoMaterial;
  s.doorForcedSwing = doorResolution.forcedSwing;

  if (doorResolution.infeasible) {
    const prefLabel = s.doorTypePref === "swing" ? "single swing" : s.doorTypePref;
    warnings.push(
      `Requested door type ("${prefLabel}") does not fit this opening (${Math.round(
        doorOpening
      )}mm) — no door drawn. Switch to Auto or a different requested type.`
    );
  }
  if (doorResolution.autoMaterial && s.doorType !== "none") {
    notes.push(
      `Door type auto-resolved to ${s.doorType} hinged/bifold — material assumed, confirm with customer.`
    );
  }

  const shelfDepth = Math.min(430, depth - 100);
  if (s.hangingRod && depth < 550) {
    warnings.push(
      `Hanging rod needs depth ≥550mm to avoid slanted hanging — current depth ${depth}mm. Increase depth or remove hanging rod.`
    );
  }

  const ceilingGap = 50;
  const maxBudget = s.ceiling - ceilingGap;
  const upgradeAvailable = s.ceiling > 2450;
  const useUpgrade = upgradeAvailable && s.doorHeightUpgrade;

  let doorHeight = 0;
  let pelmetHeight = 0;
  let splitInfo: PoleSplitInfo | null = null;

  if (s.doorType !== "none") {
    if (!useUpgrade) {
      doorHeight = Math.min(2400, maxBudget);
      if (s.ceiling <= 2450) {
        notes.push(
          `Ceiling (${s.ceiling}mm) is at or below 2450mm — door height set to ${Math.round(
            doorHeight
          )}mm (2400mm standard not fully available); no upgrade option at this ceiling height.`
        );
      } else {
        notes.push(
          `Standard door height 2400mm used. Ceiling budget allows up to ${maxBudget}mm — enable the height upgrade to use more (additional cost).`
        );
      }
    } else if (s.doorType === "sliding" || s.doorType === "aluminum") {
      const cap = 2800;
      doorHeight = Math.min(maxBudget, cap);
      if (s.doorType === "aluminum" && doorHeight > 2400) {
        splitInfo = { type: "midrail", at: 2400 };
      }
      if (maxBudget > cap) {
        notes.push(
          `Height budget (${maxBudget}mm) exceeds the ${cap}mm door-type max — door capped at ${cap}mm, remainder becomes pelmet.`
        );
      }
    } else if (s.doorType === "wooden") {
      const single = 2400;
      if (maxBudget <= single) {
        doorHeight = maxBudget;
      } else if (maxBudget >= 2680) {
        doorHeight = maxBudget;
        splitInfo = { type: "split", bottom: 2080, top: doorHeight - 2080 };
      } else {
        doorHeight = single;
        warnings.push(
          `Height budget (${maxBudget}mm) falls between 2400mm (single-panel max) and 2680mm (minimum valid split: 2080+600mm) — wooden doors can't use either option cleanly here. Door capped at 2400mm; consider aluminum bifold instead if you want to use the full height.`
        );
      }
    }
    pelmetHeight = s.ceiling - doorHeight;
    if (pelmetHeight < 50) {
      doorHeight -= 50 - pelmetHeight;
      pelmetHeight = 50;
      notes.push("Door height trimmed to preserve the 50mm minimum pelmet band.");
    }
  }

  let panelCount = 0;
  let panelWidth = 0;
  let hingeUnits = 0;
  let bifoldPairs = 0;
  let swingCount = 0;
  let interiorPillars = 0;

  if (s.doorType === "sliding") {
    let n = 2; // minimum 2 panels to slide
    while (n <= 10) {
      const w = doorOpening / n;
      if (w + 20 <= 1100 && w >= 600) break;
      n++;
    }
    panelCount = n;
    panelWidth = doorOpening / n;
    if (panelWidth + 20 > 1100 || panelWidth < 600) {
      warnings.push(
        `Sliding panel width (${panelWidth.toFixed(
          0
        )}mm) could not be resolved within the 600–1100mm bound (minimum 2 panels) — check opening width, or consider bifold/swing per the fallback hierarchy.`
      );
    }
  } else if (s.doorType === "wooden" || s.doorType === "aluminum") {
    let n = 1;
    if (!s.doorForcedSwing) {
      while (n <= 16) {
        const w = doorOpening / n;
        if (w <= 600) break;
        n++;
      }
    }
    panelWidth = doorOpening / n;
    panelCount = n;
    if (panelWidth < 350) {
      warnings.push(
        `Panel width (${panelWidth.toFixed(
          0
        )}mm) is below the 350mm minimum — opening may be too narrow for hinged/bifold on this run.`
      );
    }
    bifoldPairs = Math.floor(n / 2);
    swingCount = n % 2;
    hingeUnits = bifoldPairs + swingCount;
    interiorPillars = Math.max(0, Math.ceil((hingeUnits - 2) / 2));
  }

  const feet = roundFeet(s.length);
  let drawerCount: number;
  if (feet < 5) drawerCount = 2;
  else if (feet <= 8) drawerCount = 3;
  else if (feet <= 12) drawerCount = 4;
  else if (feet < 15) drawerCount = 6;
  else drawerCount = 8;

  const leftConstrained = left.kind !== "partition";
  const rightConstrained = right.kind !== "partition";
  let drawerPlacement = "";
  if (!leftConstrained && !rightConstrained) {
    drawerPlacement = "Both sides open — drawers can sit anywhere along the run.";
  } else {
    const sides = [leftConstrained ? "left" : null, rightConstrained ? "right" : null]
      .filter(Boolean)
      .join(" and ");
    drawerPlacement = `Drawers must clear the ${sides} side by an 80mm minimum buffer.`;
  }
  if (s.doorType === "sliding") {
    drawerPlacement +=
      " Sliding doors: drawer front must also end 400mm before the edge of the door panel opening.";
  }

  const leftIsOpen = s.left.type === "none";
  const rightIsOpen = s.right.type === "none";
  const internalWidth = s.length - (leftIsOpen ? 60 : 0) - (rightIsOpen ? 60 : 0);
  const internalHeight = s.internalHeightUpgrade ? 2400 : 2080;

  const res = {
    left,
    right,
    sideL: left,
    sideR: right,
    depth,
    notes,
    doorOpening,
    shelfDepth,
    doorHeight,
    pelmetHeight,
    splitInfo,
    panelCount,
    panelWidth,
    hingeUnits,
    bifoldPairs,
    swingCount,
    interiorPillars,
    drawerCount,
    drawerPlacement,
    warnings,
    maxBudget,
    internalWidth,
    internalHeight,
    door: {
      type: s.doorRequired ? s.doorType : "none",
      panelCount,
      panelWidth,
      height: doorHeight,
      bifoldPairs,
      swingCount,
      infeasible: s.doorType === "sliding" ? (panelWidth + 20 > 1100 || panelWidth < 600) : panelWidth < 350,
    },
  };

  const internalLayout = computePoleInternalLayout(s, res as any);
  return {
    ...res,
    internalLayout,
  };
}

// Internal configuration constants (HausPole Design Methodology v1, Section 6)
export const POLE = 26;
export const SET_BUFFER = 10;
export const MAX_COL = 950;
export const MIN_USEFUL = 300;
export const STD_DRAWER_WIDTHS = [800, 610, 500];

export function largestFitting(maxAvail: number): number | null {
  for (const w of STD_DRAWER_WIDTHS) {
    if (w <= maxAvail) return w;
  }
  return null;
}

export function computePoleInternalLayout(
  s: PoleState,
  d: PoleDesignResult
): PoleInternalLayout {
  const notes: string[] = [];
  const warnings: string[] = [];
  const leftIsOpen = s.left.type === "none";
  const rightIsOpen = s.right.type === "none";
  const internalWidth = s.length - (leftIsOpen ? 60 : 0) - (rightIsOpen ? 60 : 0);

  let drawerWidth: number | null = null;
  let bufferSeg: number | null = null;
  let drawerSide: "left" | "right" | "middle" = "left";

  if (s.doorType === "none") {
    if (!leftIsOpen && !rightIsOpen) {
      bufferSeg = 210;
      drawerSide = "left";
      drawerWidth = largestFitting(internalWidth - bufferSeg - 3 * POLE - SET_BUFFER);
    } else if (leftIsOpen) {
      drawerSide = "left";
      drawerWidth = largestFitting(internalWidth - 2 * POLE - SET_BUFFER);
    } else {
      drawerSide = "right";
      drawerWidth = largestFitting(internalWidth - 2 * POLE - SET_BUFFER);
    }
  } else if (s.doorType === "sliding") {
    const manufactured = d.panelWidth + 20;
    const effectiveOpening = d.doorOpening - manufactured;
    if (leftIsOpen && rightIsOpen) {
      drawerSide = "left";
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else if (leftIsOpen && !rightIsOpen) {
      drawerSide = "left";
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else if (!leftIsOpen && rightIsOpen) {
      drawerSide = "right";
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else {
      // both wall — forced buffer segment before drawer
      bufferSeg = 210;
      drawerSide = "left";
      const pushedIn = bufferSeg + 2 * POLE;
      drawerWidth = largestFitting(effectiveOpening - pushedIn - 25);
      notes.push(
        `Both sides walled: a ${bufferSeg}mm buffer (plain shelving) is required before the drawer, since a drawer can't sit directly against a wall pillar.`
      );
    }
    if (!drawerWidth) {
      warnings.push("No standard drawer width fits the effective sliding-door clearance — check dimensions manually.");
    }
  } else {
    // wooden / aluminum bifold — drawer defaults to the middle (free-edge boundary)
    drawerSide = "middle";
    drawerWidth = 800;
    notes.push(
      "Bifold/hinged: drawer placed at the middle free-edge boundary (no fold clearance penalty there), defaulting to the largest standard width."
    );
  }

  if (!drawerWidth) {
    warnings.push("Could not fit any standard drawer width — internal layout needs manual design.");
    return { internalWidth, notes, warnings, segments: [], bays: [], drawerBayIndex: 0 };
  }

  const fixedWidth = drawerWidth + (bufferSeg || 0);
  const rawRemaining = internalWidth - fixedWidth;

  let flexCount = 2;
  let totalColumns = 0;
  let poles = 0;
  let deduction = 0;
  let remainingForFlex = 0;

  function tryCount(n: number): number {
    totalColumns = (bufferSeg ? 1 : 0) + 1 + n;
    poles = totalColumns + 1;
    deduction = poles * POLE + SET_BUFFER;
    remainingForFlex = rawRemaining - deduction;
    return remainingForFlex;
  }

  const rem2 = tryCount(2);
  if (rem2 / 2 >= MIN_USEFUL && rem2 / 2 <= MAX_COL) {
    flexCount = 2;
  } else if (rem2 / 2 > MAX_COL) {
    flexCount = Math.max(3, Math.ceil(rem2 / MAX_COL));
    tryCount(flexCount);
  } else {
    flexCount = 1;
    tryCount(1);
  }

  if (remainingForFlex < 0) {
    warnings.push(
      "Internal layout does not fit — drawer and structural allowances exceed available width. Reduce length constraints or revisit door type."
    );
    return { internalWidth, notes, warnings, segments: [], bays: [], drawerBayIndex: 0 };
  }

  const rawEach = remainingForFlex / flexCount;
  const evenEach = Math.floor(rawEach / 2) * 2;
  const totalEven = evenEach * flexCount;
  const installBuffer = remainingForFlex - totalEven;

  if (installBuffer > 8 || installBuffer < 0) {
    notes.push(
      `Install buffer landed at ${installBuffer.toFixed(
        1
      )}mm (outside the usual 5–8mm range) — check rounding manually.`
    );
  }

  const flexTypes: string[] = [];
  if (flexCount === 1) {
    flexTypes.push("Type 4 (long hang)");
  } else if (flexCount === 2) {
    flexTypes.push("Type 1 (double hanging)", "Type 4 (long hang)");
  } else {
    const cycle = ["Type 4 (long hang)", "Type 1 (double hanging)", "Type 3 (shelves)"];
    for (let i = 0; i < flexCount; i++) {
      flexTypes.push(cycle[i === 0 ? 0 : ((i - 1) % 2) + 1]);
    }
  }

  const segments: PoleSegment[] = [];
  const drawerSeg: PoleSegment = {
    label: "Drawer bank",
    width: drawerWidth,
    type: `${d.drawerCount}× M drawers + half-hang above`,
  };

  if (drawerSide === "middle") {
    const half = Math.floor(flexCount / 2);
    for (let i = 0; i < half; i++) segments.push({ label: "Column", width: evenEach, type: flexTypes[i] });
    segments.push({ ...drawerSeg, label: "Drawer bank (middle)" });
    for (let i = half; i < flexCount; i++) segments.push({ label: "Column", width: evenEach, type: flexTypes[i] });
  } else if (drawerSide === "right") {
    for (let i = 0; i < flexCount; i++) segments.push({ label: "Column", width: evenEach, type: flexTypes[i] });
    segments.push(drawerSeg);
  } else {
    if (bufferSeg) segments.push({ label: "Shelf buffer (forced)", width: bufferSeg, type: "Plain shelving" });
    segments.push(drawerSeg);
    for (let i = 0; i < flexCount; i++) segments.push({ label: "Column", width: evenEach, type: flexTypes[i] });
  }

  let currentX = 0;
  let drawerBayIndex = 0;
  const bays = segments.map((seg, idx) => {
    const isDrawer = seg.type === "Drawers + hanging";
    if (isDrawer) drawerBayIndex = idx;
    const xStart = currentX;
    const xEnd = currentX + seg.width;
    currentX = xEnd;
    return {
      width: seg.width,
      xStart,
      xEnd,
      isDrawerBay: isDrawer,
    };
  });

  return { internalWidth, notes, warnings, segments, poles, drawerWidth, bufferSeg, installBuffer, bays, drawerBayIndex };
}

// ---------------------------------------------------------------------------
// HAUSPOLE L-SHAPE LOGIC
// ---------------------------------------------------------------------------

export const LS_POLE = 26;
export const LS_SETBUF = 10;
export const LS_CORNER = 600;
export const LS_MIN_USEFUL = 300;

export function lsSlidingFit(opening: number): { panelCount: number; panelWidth: number; valid: boolean } {
  let n = 2;
  while (n <= 10) {
    const w = opening / n;
    if (w + 20 <= 1100 && w >= 600) return { panelCount: n, panelWidth: w, valid: true };
    n++;
  }
  return { panelCount: 0, panelWidth: 0, valid: false };
}

export function lsBifoldFit(
  opening: number,
  forceSingle: boolean
): { panelCount: number; panelWidth: number; valid: boolean; bifoldPairs: number; swingCount: number } {
  if (forceSingle) {
    if (opening < 350) return { panelCount: 0, panelWidth: 0, valid: false, bifoldPairs: 0, swingCount: 0 };
    return { panelCount: 1, panelWidth: opening, valid: true, bifoldPairs: 0, swingCount: 1 };
  }
  let n = 1;
  while (n <= 16) {
    const w = opening / n;
    if (w <= 600) break;
    n++;
  }
  const w = opening / n;
  if (w < 350) return { panelCount: 0, panelWidth: 0, valid: false, bifoldPairs: 0, swingCount: 0 };
  return { panelCount: n, panelWidth: w, valid: true, bifoldPairs: Math.floor(n / 2), swingCount: n % 2 };
}

export function lsOuterEnd(wallType: string, beamWidth: number): number {
  if (wallType === "none") return 60;
  if (wallType === "beam") return (beamWidth || 130) + 30;
  return 50;
}

export function computeLegDoor(
  legLength: number,
  wallType: string,
  doorTypePref: DoorPreference,
  beamWidth: number
): PoleLegDoor {
  const outerEnd = lsOuterEnd(wallType, beamWidth);
  const opening = legLength - outerEnd - LS_CORNER;
  const result: PoleLegDoor = { outerEnd, opening, type: "none", material: null, valid: opening > 0 || doorTypePref === "none" };

  if (doorTypePref === "none" || opening <= 0) {
    return result;
  }
  if (doorTypePref === "auto") {
    const s = lsSlidingFit(opening);
    if (s.valid) return { ...result, type: "sliding", material: null, ...s };
    const b = lsBifoldFit(opening, false);
    if (b.valid) {
      return {
        ...result,
        type: "wooden",
        material: "wooden",
        autoMaterial: true,
        ...b,
        note: "Sliding did not fit this opening — fell back to bifold per the fallback hierarchy (wooden material assumed, confirm with customer).",
      };
    }
    const sw = lsBifoldFit(opening, true);
    if (sw.valid) {
      return {
        ...result,
        type: "wooden",
        material: "wooden",
        autoMaterial: true,
        ...sw,
        note: "Opening too narrow for sliding or bifold minimums — forced to a single swing door (wooden material assumed, confirm with customer).",
      };
    }
    return { ...result, type: "none", valid: false, note: "No standard door configuration fits this opening — needs manual design." };
  }
  if (doorTypePref === "sliding") {
    const s = lsSlidingFit(opening);
    if (s.valid) return { ...result, type: "sliding", material: null, ...s };
    return { ...result, type: "none", valid: false, note: `Requested sliding door does not fit this opening (${Math.round(opening)}mm) — needs Auto or a different requested type.` };
  }
  if (doorTypePref === "wooden" || doorTypePref === "aluminum") {
    const b = lsBifoldFit(opening, false);
    if (b.valid) return { ...result, type: doorTypePref, material: doorTypePref, ...b };
    return { ...result, type: "none", valid: false, note: `Requested ${doorTypePref} bifold does not fit this opening (${Math.round(opening)}mm) — needs Auto or a different requested type.` };
  }
  // swing
  const sw = lsBifoldFit(opening, true);
  if (sw.valid) return { ...result, type: "wooden", material: "wooden", ...sw };
  return { ...result, type: "none", valid: false, note: `Requested single swing door does not fit this opening (${Math.round(opening)}mm) — needs Auto or a different requested type.` };
}

export function lsDrawerCeiling(leg: { door: PoleLegDoor }): number {
  if (!leg.door || leg.door.type === "none") return 800;
  if (leg.door.type === "sliding") {
    const manuf = (leg.door.panelWidth || 0) + 20;
    const eff = leg.door.opening - manuf;
    return Math.max(0, eff - LS_POLE - 25);
  }
  return Math.max(0, (leg.door.panelWidth || 0) - 150);
}

export function lsDrawerStackCheck(count: number): { fits: boolean; mode?: string; topEdge?: number; maxFit?: number } {
  if (count === 2) return { fits: true, mode: "top-down", topEdge: 1100 };
  const maxFit = Math.floor((1100 - 150) / 190); // = 5
  if (count <= maxFit) return { fits: true, mode: "bottom-up", topEdge: 150 + count * 190 };
  return { fits: false, maxFit };
}

export function computePoleLShape(s: PoleState): PoleLShapeDesign {
  const warnings: string[] = [];
  const notes: string[] = [];
  const legAWallType = s.ls.legAWall;
  const legBWallType = s.ls.legBWall;
  const doorA = computeLegDoor(s.ls.legALength, legAWallType, s.ls.legADoorType || "auto", s.ls.legABeamWidth);
  const doorB = computeLegDoor(s.ls.legBLength, legBWallType, s.ls.legBDoorType || "auto", s.ls.legBBeamWidth);

  if (doorA.note) notes.push(`Leg A: ${doorA.note}`);
  if (doorB.note) notes.push(`Leg B: ${doorB.note}`);
  if (doorA.valid === false) warnings.push("Leg A door does not fit — check dimensions.");
  if (doorB.valid === false) warnings.push("Leg B door does not fit — check dimensions.");

  const longIsA = s.ls.legALength >= s.ls.legBLength;
  const longLeg = {
    name: longIsA ? "A" : "B",
    length: longIsA ? s.ls.legALength : s.ls.legBLength,
    wallType: longIsA ? legAWallType : legBWallType,
    door: longIsA ? doorA : doorB,
  };
  const shortLeg = {
    name: longIsA ? "B" : "A",
    length: longIsA ? s.ls.legBLength : s.ls.legALength,
    wallType: longIsA ? legBWallType : legAWallType,
    door: longIsA ? doorB : doorA,
  };

  function outerDeduct(wallType: string): number {
    return wallType === "none" ? 60 : 0;
  }
  const longFurnWidth = longLeg.length - outerDeduct(longLeg.wallType);
  const shortFurnWidth = shortLeg.length - outerDeduct(shortLeg.wallType) - LS_CORNER;

  if (shortFurnWidth <= 0) {
    warnings.push(
      `Short leg (${shortLeg.name}) has zero or negative internal width after the 600mm corner deduction — this leg is too short to support furniture on its own.`
    );
  }

  const feet = roundFeet(s.ls.legALength + s.ls.legBLength);
  let drawerCount: number;
  if (feet < 5) drawerCount = 2;
  else if (feet <= 8) drawerCount = 3;
  else if (feet <= 12) drawerCount = 4;
  else if (feet < 15) drawerCount = 6;
  else drawerCount = 8;

  const stack = lsDrawerStackCheck(drawerCount);

  function attemptDrawer(leg: { door: PoleLegDoor }, availAfterCornerAndPoles: number): number | null {
    if (availAfterCornerAndPoles <= 0) return null;
    const ceiling = lsDrawerCeiling(leg);
    const opts = [800, 610, 500];
    for (const w of opts) {
      if (w <= ceiling && w <= availAfterCornerAndPoles && availAfterCornerAndPoles - w >= LS_MIN_USEFUL) return w;
    }
    for (const w of opts) {
      if (w <= ceiling && w <= availAfterCornerAndPoles) return w;
    }
    return null;
  }

  const longPolesBuf = 4 * LS_POLE + LS_SETBUF;
  const longAvailAfterCorner = longFurnWidth - LS_CORNER - longPolesBuf;

  const shortPolesBufTwoCol = 3 * LS_POLE + LS_SETBUF;
  const shortCanSplit = shortFurnWidth >= LS_CORNER + shortPolesBufTwoCol + LS_MIN_USEFUL;
  const shortAvailAfterCorner = shortCanSplit ? shortFurnWidth - LS_CORNER - shortPolesBufTwoCol : null;
  const shortSingleColWidth = shortCanSplit ? null : Math.max(0, shortFurnWidth - 2 * LS_POLE);

  if (!shortCanSplit) {
    notes.push(
      `Short leg (${shortLeg.name}) is too short to afford a fixed 600mm corner column plus a second column — collapsed to a single ${Math.round(
        shortSingleColWidth || 0
      )}mm hang column spanning the whole leg. No drawer possible on this leg.`
    );
  }

  let drawerLeg: "long" | "short" | "split" | null = null;
  let drawerWidth: number | null = null;
  let drawerWidthShort: number | null = null;
  let longFlexWidth: number | null = null;
  let shortFlexWidth: number | null = null;
  let drawerCountLong: number | null = null;
  let drawerCountShort: number | null = null;

  if (stack.fits) {
    drawerWidth = attemptDrawer(longLeg, longAvailAfterCorner);
    if (drawerWidth) {
      drawerLeg = "long";
      longFlexWidth = longAvailAfterCorner - drawerWidth;
      shortFlexWidth = shortCanSplit ? shortAvailAfterCorner : shortSingleColWidth;
    } else if (shortCanSplit && shortAvailAfterCorner !== null) {
      drawerWidth = attemptDrawer(shortLeg, shortAvailAfterCorner);
      if (drawerWidth) {
        drawerLeg = "short";
        shortFlexWidth = null;
        longFlexWidth = longAvailAfterCorner;
      } else {
        warnings.push("Drawer bank does not fit cleanly on either leg at this size — consolidation-first placement failed. Needs manual design.");
        longFlexWidth = longAvailAfterCorner;
        shortFlexWidth = shortAvailAfterCorner;
      }
    } else {
      warnings.push("Drawer bank does not fit on the long leg, and the short leg is too small to host a drawer at all (collapsed to a single corner column) — needs manual design.");
      longFlexWidth = longAvailAfterCorner;
      shortFlexWidth = shortSingleColWidth;
    }
  } else {
    // Combined drawer count exceeds the 5-drawer single-column ergonomic limit — split the bank
    // across both legs (one half-stack per leg) instead of dropping it entirely. (Ref HTML L1248-1271)
    const halfLong = Math.ceil(drawerCount / 2);
    const halfShort = Math.floor(drawerCount / 2);
    const dwLong = attemptDrawer(longLeg, longAvailAfterCorner);
    const dwShort = shortCanSplit && shortAvailAfterCorner !== null ? attemptDrawer(shortLeg, shortAvailAfterCorner) : null;
    if (dwLong && dwShort && lsDrawerStackCheck(halfLong).fits && lsDrawerStackCheck(halfShort).fits) {
      drawerLeg = "split";
      drawerWidth = dwLong;
      drawerWidthShort = dwShort;
      drawerCountLong = halfLong;
      drawerCountShort = halfShort;
      longFlexWidth = longAvailAfterCorner - dwLong;
      shortFlexWidth = null;
      notes.push(
        `${drawerCount} drawers exceeds the single-column limit (max 5), so the bank was split across both legs — ${halfLong} on Leg ${longLeg.name} (long), ${halfShort} on Leg ${shortLeg.name} (short) — instead of dropping it.`
      );
    } else {
      const reason = !shortCanSplit
        ? "the short leg is too small to afford a second column to host its half"
        : !dwLong
        ? "no standard drawer width fits the long leg's available space"
        : "no standard drawer width fits the short leg's available space";
      warnings.push(
        `${drawerCount} drawers exceeds the single-column ergonomic limit, and splitting across both legs isn't possible here (${reason}) — drawer bank dropped entirely. Needs manual design.`
      );
      longFlexWidth = longAvailAfterCorner;
      shortFlexWidth = shortCanSplit ? shortAvailAfterCorner : shortSingleColWidth;
    }
  }

  return {
    warnings,
    notes,
    doorA,
    doorB,
    longLeg,
    shortLeg,
    longFurnWidth,
    shortFurnWidth,
    drawerCount,
    stackFits: stack.fits,
    drawerLeg,
    drawerWidth,
    drawerWidthShort,
    drawerCountLong,
    drawerCountShort,
    longFlexWidth,
    shortFlexWidth,
    shortCanSplit,
    shortSingleColWidth,
  };
}

// ---------------------------------------------------------------------------
// HAUSPOLE PRICING LOGIC (HausPole Pricing Guideline v1)
// ---------------------------------------------------------------------------

export function computePolePrice(s: PoleState, d: PoleDesignResult): PolePriceResult {
  const feet = roundFeet(s.length);
  const hasDoor = s.doorType !== "none";
  const baseRate = hasDoor ? 380 : 270;
  let topUp = 0;
  let tierLabel = "";
  let outOfTier = false;

  if (!hasDoor) {
    if (s.internalHeightUpgrade) {
      topUp = 30;
      tierLabel = "No door · internal upgraded to 2400mm";
    } else {
      tierLabel = "No door · standard internal 2080mm";
    }
  } else if (s.ceiling < 2650) {
    tierLabel = "Standard tier (ceiling <2650mm) · internal 2080mm · door 2400mm";
  } else if (s.ceiling <= 3000) {
    const anyUpgrade = s.doorHeightUpgrade || s.internalHeightUpgrade;
    if (!anyUpgrade) {
      topUp = 30;
      tierLabel = "Ceiling ≤3000mm · door stays 2400mm · internal 2080mm";
    } else {
      topUp = 60;
      const doorNote = s.doorHeightUpgrade ? "upgraded" : "stays 2400mm";
      const internalNote = s.internalHeightUpgrade ? "2400mm" : "2080mm (unchanged)";
      tierLabel = `Ceiling ≤3000mm · door ${doorNote} · internal ${internalNote}`;
    }
  } else if (s.ceiling <= 3600) {
    topUp = 100;
    tierLabel = "Ceiling 3000–3600mm · internal 2400mm · door ~2800mm";
  } else {
    outOfTier = true;
    tierLabel = "Ceiling exceeds 3600mm — outside standard pricing tiers, quote manually";
  }

  const rate = baseRate + topUp;
  const minBill = applyMinBilling(feet);
  const baseCost = outOfTier ? null : Math.round(minBill.billFeet * rate * 100) / 100;

  const finishLines: string[] = [];
  let finishCost = 0;
  const hingeLines: string[] = [];
  let hingeCost = 0;

  if (!outOfTier && minBill.surcharge > 0) {
    hingeLines.push(`Small-order surcharge (labor/transport, under 4.5ft) — flat $${minBill.surcharge}`);
    hingeCost += minBill.surcharge;
  }

  if (hasDoor) {
    if (s.mirrorQty > 0) {
      const c = s.mirrorQty * 150;
      finishCost += c;
      finishLines.push(`${s.mirrorQty} panel(s) full mirror upgrade`);
    }
    if (s.doorType === "sliding" && s.laminateQty > 0) {
      const c = s.laminateQty * 80;
      finishCost += c;
      finishLines.push(`${s.laminateQty} laminate piece(s)`);
    }
    if (s.doorType === "aluminum") {
      hingeCost += d.hingeUnits * 150;
      if (d.hingeUnits) hingeLines.push(`${d.hingeUnits} aluminum hinge unit(s) × $150`);
      if (s.laminateQty > 0) {
        const c = s.laminateQty * 80;
        finishCost += c;
        finishLines.push(`${s.laminateQty} laminate piece(s) (optional, aluminum)`);
      }
    } else if (s.doorType === "wooden") {
      const structuralCost = (d.bifoldPairs + d.swingCount) * 150;
      const totalWoodenPanels = d.bifoldPairs * 2 + d.swingCount;
      const laminatePieces = Math.ceil(totalWoodenPanels / 2);
      const woodenLaminateCost = laminatePieces * 80;
      hingeCost += structuralCost + woodenLaminateCost;
      if (d.hingeUnits) {
        const materialNote = s.doorAutoMaterial ? " (structural, wooden assumed — confirm with customer)" : " (structural)";
        if (d.bifoldPairs) hingeLines.push(`${d.bifoldPairs} wooden bifold pair(s) × $150${materialNote}`);
        if (d.swingCount) hingeLines.push(`${d.swingCount} wooden swing unit(s) × $150${materialNote}`);
      }
      if (totalWoodenPanels > 0) {
        hingeLines.push(`${laminatePieces} laminate piece(s) (${totalWoodenPanels} panels ÷ 2) × $80`);
      }
    }
  }

  const total = outOfTier ? null : Math.round(((baseCost || 0) + finishCost + hingeCost) * 100) / 100;
  return { feet, baseRate, topUp, rate, tierLabel, outOfTier, baseCost, finishLines, finishCost, hingeLines, hingeCost, total };
}

export function computePoleLShapePrice(s: PoleState, ls: PoleLShapeDesign): PoleLShapePriceResult {
  const combinedMm = s.ls.legALength + s.ls.legBLength;
  const feet = roundFeet(combinedMm - 304.8); // deduct 1ft at corner
  const hasDoor = ls.doorA.type !== "none" || ls.doorB.type !== "none";
  const baseRate = hasDoor ? 380 : 270;

  let topUp = 0;
  let tierLabel = "";
  let outOfTier = false;
  const ceiling = s.ls.ceiling;

  if (!hasDoor) {
    if (s.ls.internalHeightUpgrade) {
      topUp = 30;
      tierLabel = "No door · internal upgraded to 2400mm";
    } else {
      tierLabel = "No door · standard internal 2080mm";
    }
  } else if (ceiling < 2650) {
    tierLabel = "Standard tier (ceiling <2650mm) · internal 2080mm · door 2400mm";
  } else if (ceiling <= 3000) {
    const anyUpgrade = s.ls.doorHeightUpgrade || s.ls.internalHeightUpgrade;
    if (!anyUpgrade) {
      topUp = 30;
      tierLabel = "Ceiling ≤3000mm · door stays 2400mm · internal 2080mm";
    } else {
      topUp = 60;
      tierLabel = `Ceiling ≤3000mm · door ${s.ls.doorHeightUpgrade ? "upgraded" : "stays 2400mm"} · internal ${s.ls.internalHeightUpgrade ? "2400mm" : "2080mm (unchanged)"}`;
    }
  } else if (ceiling <= 3600) {
    topUp = 100;
    tierLabel = "Ceiling 3000–3600mm · internal 2400mm · door ~2800mm";
  } else {
    outOfTier = true;
    tierLabel = "Ceiling exceeds 3600mm — outside standard pricing tiers, quote manually";
  }

  const rate = baseRate + topUp;
  const minBill = applyMinBilling(feet);
  const baseCost = outOfTier ? null : Math.round(minBill.billFeet * rate * 100) / 100;

  const hingeLines: string[] = [];
  let hingeCost = 0;

  if (!outOfTier && minBill.surcharge > 0) {
    hingeLines.push(`Small-order surcharge (labor/transport, under 4.5ft) — flat $${minBill.surcharge}`);
    hingeCost += minBill.surcharge;
  }

  function legStructuralCost(name: string, door: PoleLegDoor): number {
    if (door.type === "wooden" || door.type === "aluminum") {
      const bifoldPairs = door.bifoldPairs || 0;
      const swingCount = door.swingCount || 0;
      const cost = (bifoldPairs + swingCount) * 150;
      const materialNote = door.autoMaterial ? " (structural, wooden assumed — confirm material with customer)" : " (structural)";
      if (bifoldPairs) hingeLines.push(`${name}: ${bifoldPairs} ${door.type} bifold pair(s) × $150${materialNote}`);
      if (swingCount) hingeLines.push(`${name}: ${swingCount} ${door.type} swing unit(s) × $150${materialNote}`);
      return cost;
    }
    return 0;
  }

  hingeCost += legStructuralCost("Leg A", ls.doorA);
  hingeCost += legStructuralCost("Leg B", ls.doorB);

  function legWoodenPanels(door: PoleLegDoor): number {
    if (door.type === "wooden") return (door.bifoldPairs || 0) * 2 + (door.swingCount || 0);
    return 0;
  }
  const totalWoodenPanels = legWoodenPanels(ls.doorA) + legWoodenPanels(ls.doorB);
  if (totalWoodenPanels > 0) {
    const laminatePieces = Math.ceil(totalWoodenPanels / 2);
    hingeCost += laminatePieces * 80;
    hingeLines.push(`${laminatePieces} laminate piece(s) (pooled across both legs, ${totalWoodenPanels} panels ÷ 2) × $80`);
  }

  const total = outOfTier ? null : Math.round(((baseCost || 0) + hingeCost) * 100) / 100;
  return { feet, baseRate, topUp, rate, tierLabel, outOfTier, baseCost, hingeLines, hingeCost, total };
}

export function computePoleAddonPrice(s: PoleState, basePrice: number | null): AddonPriceResult {
  const lines: { label: string; cost: number }[] = [];
  let total = 0;
  const feet = s.shape === "lshape" ? roundFeet(s.ls.legALength + s.ls.legBLength - 304.8) : roundFeet(s.length);

  function add(label: string, cost: number) {
    if (cost > 0) {
      lines.push({ label, cost });
      total += cost;
    }
  }

  add(`${s.addonExtraDrawers} additional drawer(s) × $80`, s.addonExtraDrawers * 80);
  add(`${s.addonSecretDrawer} secret drawer top-up × $100`, s.addonSecretDrawer * 100);
  add(`${s.addonDrawerHead} drawer head(s) → mirror + aluminium frame × $60`, s.addonDrawerHead * 60);

  if (s.poleFinish && s.poleFinish !== "silver") {
    const finishName = s.poleFinish === "champagne" ? "Champagne" : "Black";
    add(`${finishName} pole finish (${feet.toFixed(1)}ft × $30)`, feet * 30);
  }

  if (s.dismantle) {
    const cost = Math.max(200, feet * 40);
    add(`Dismantle & disposal (${feet.toFixed(1)}ft × $40, min $200)`, cost);
  }

  add(`${s.addonRelocatePoint} relocated switch/power point(s) × $80`, s.addonRelocatePoint * 80);
  add(`${s.addonNewSwitch} new light switch(es) × $100`, s.addonNewSwitch * 100);

  if (s.led) {
    const len = Math.max(0, s.addonLedLength || 0);
    const excess = Math.max(0, len - 1.5);
    const cost = 180 + excess * 120;
    add(
      `LED lighting (${len.toFixed(1)}m, min $180 incl. first 1.5m${
        excess > 0 ? ` + ${excess.toFixed(1)}m excess × $120` : ""
      })`,
      cost
    );
  }

  add(`${s.addonSensor} wired sensor(s) × $80`, s.addonSensor * 80);
  add(`${s.addonWireBasket} pull-out wire basket(s) 600mm × $180`, s.addonWireBasket * 180);
  add(`${s.addonTrouserHolder} trouser holder(s) × $80`, s.addonTrouserHolder * 80);
  add(`${s.addonDoubleTrouser} double trouser hanger(s) 630 × $200`, s.addonDoubleTrouser * 200);
  add(`${s.addonPulloutTrouser} pull-out trouser hanger(s) 610/800mm × $120`, s.addonPulloutTrouser * 120);
  add(`${s.addonFullMirror} full-length pull-out mirror(s) × $200`, s.addonFullMirror * 200);
  add(`${s.addonBoxMirror} box-up mirror(s) × $150`, s.addonBoxMirror * 150);
  add(`${s.addonFlipMirror} flip mirror(s) × $160`, s.addonFlipMirror * 160);

  const grandTotal = basePrice === null ? null : basePrice + total;
  return { lines, total, basePrice, grandTotal };
}

export { computePoleLShape as computePoleLShapeDesign };

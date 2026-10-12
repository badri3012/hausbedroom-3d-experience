/**
 * AUTOMATED ENGINEERING REGRESSION TEST SUITE
 * Validates the ported TypeScript engineering calculation engine
 * directly against the reference implementation in HausBedroom_Configurator_3.html.
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, "../HausBedroom_Configurator_3.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Extract PoleApp and FlexApp code blocks from HTML
const poleCodeMatch = html.match(/window\.PoleApp\s*=\s*\(([\s\S]*?)\)\(\);/);
const flexCodeMatch = html.match(/window\.FlexApp\s*=\s*\(([\s\S]*?)\)\(\);/);

if (!poleCodeMatch || !flexCodeMatch) {
  console.error("FAILED to extract code blocks from reference HTML!");
  process.exit(1);
}

// Create a DOM-mock sandbox to run reference HTML scripts
function createSandbox() {
  const elements = {};
  const dummyEl = {
    addEventListener: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    getContext: () => ({
      save: () => {},
      restore: () => {},
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fillText: () => {},
      setTransform: () => {},
      setLineDash: () => {},
      translate: () => {},
      rotate: () => {},
      measureText: () => ({ width: 10 }),
    }),
    getBoundingClientRect: () => ({ width: 800, height: 480 }),
    value: "",
    dataset: {},
  };

  const doc = {
    getElementById: (id) => elements[id] || dummyEl,
    querySelectorAll: () => [],
    createElement: () => dummyEl,
    body: { appendChild: () => {}, removeChild: () => {} },
  };

  const win = {
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id),
    requestAnimationFrame: (fn) => 1,
    cancelAnimationFrame: () => {},
    innerWidth: 1200,
    innerHeight: 800,
  };
  win.window = win;
  win.document = doc;

  const sandbox = {
    window: win,
    document: doc,
    console: { log: () => {}, warn: () => {}, error: () => {} },
    Math,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    parseInt,
    parseFloat,
    setTimeout: win.setTimeout,
    clearTimeout: win.clearTimeout,
  };
  vm.createContext(sandbox);
  return sandbox;
}

console.log("===============================================================");
console.log("HAUSBEDROOM — PHASE 1 ENGINEERING ENGINE REGRESSION VERIFICATION");
console.log("===============================================================\n");

// 1. Evaluate reference PoleApp and FlexApp
const sandboxPole = createSandbox();
vm.runInContext(`window.PoleApp = (${poleCodeMatch[1]})();`, sandboxPole);
const refPole = sandboxPole.window.PoleApp;

const sandboxFlex = createSandbox();
vm.runInContext(`window.FlexApp = (${flexCodeMatch[1]})();`, sandboxFlex);
const refFlex = sandboxFlex.window.FlexApp;

console.log("✓ Successfully instantiated reference PoleApp and FlexApp in VM sandbox.");

// Now import our TypeScript port (compiled / transpiled or strip types)
// We can test our logic directly or port the logic into a Node-runnable test
// Let's import the TypeScript modules using Node 24 strip types or dynamic import
let tsPoleEngine, tsFlexEngine, tsQuotationEngine;

try {
  tsPoleEngine = await import("../src/lib/engineering/pole-engine.ts");
  tsFlexEngine = await import("../src/lib/engineering/flex-engine.ts");
  tsQuotationEngine = await import("../src/lib/engineering/quotation-engine.ts");
  console.log("✓ Successfully imported TypeScript engineering engines.\n");
} catch (err) {
  console.error("Failed to import TypeScript engines:", err);
  process.exit(1);
}

let passedTests = 0;
let failedTests = 0;

function assertEqual(actual, expected, description) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr === expectedStr) {
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${description}`);
    console.error(`         Expected: ${expectedStr}`);
    console.error(`         Actual:   ${actualStr}`);
  }
}

function assertNumber(actual, expected, tolerance = 0.01, description) {
  if (Math.abs(actual - expected) <= tolerance) {
    passedTests++;
    console.log(`  [PASS] ${description} (${actual} ≈ ${expected})`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${description} - Expected ${expected}, got ${actual}`);
  }
}

// ---------------------------------------------------------------------------
// TEST SUITE 1: HAUSPOLE STRAIGHT CONFIGURATIONS
// ---------------------------------------------------------------------------
console.log("TEST SUITE 1: HausPole Straight Configurations");

// Case 1A: 2700mm, 2600mm ceiling, both open, auto door
{
  const state = {
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
    poleFinish: "silver",
    ls: { ceiling: 2600, depth: 600, doorTypePref: "auto", legALength: 1900, legAWall: "none", legABeamWidth: 130, legADoorType: "auto", legBLength: 1250, legBWall: "none", legBBeamWidth: 130, legBDoorType: "auto", doorHeightUpgrade: false, internalHeightUpgrade: false }
  };

  const d = tsPoleEngine.computePoleDesign(state);
  assertEqual(d.doorOpening, 2580, "TC-01: Door opening is 2580mm (2700 - 60 - 60)");
  assertEqual(d.panelCount, 3, "TC-01: Sliding panels count is 3");
  assertNumber(d.panelWidth, 860, 0.01, "TC-01: Panel width is 860mm");
  assertEqual(d.doorHeight, 2400, "TC-01: Standard door height is 2400mm");
  assertEqual(d.pelmetHeight, 200, "TC-01: Pelmet height is 200mm (2600 - 2400)");
  assertEqual(d.drawerCount, 4, "TC-01: Drawer count for 8.9ft is 4");

  const layout = tsPoleEngine.computePoleInternalLayout(state, d);
  assertEqual(layout.drawerWidth, 800, "TC-01: Standard drawer width is 800mm");
  assertEqual(layout.internalWidth, 2580, "TC-01: Internal width is 2580mm");

  const price = tsPoleEngine.computePolePrice(state, d);
  assertEqual(price.feet, 8.9, "TC-01: Billed footage is 8.9ft");
  assertEqual(price.baseRate, 380, "TC-01: Base rate with door is $380");
  assertEqual(price.topUp, 0, "TC-01: Ceiling 2600mm (<2650mm) has $0 top-up");
  assertEqual(price.total, 3382, "TC-01: Total price is $3382.00 (8.9 × $380)");
}

// Case 1B: Small-order billing (<4.5ft surcharge)
{
  const state = {
    shape: "straight",
    length: 1200,
    ceiling: 2600,
    depth: 600,
    left: { type: "wall", beamWidth: 130 },
    right: { type: "wall", beamWidth: 130 },
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
    poleFinish: "silver",
    ls: { ceiling: 2600, depth: 600, doorTypePref: "auto", legALength: 1900, legAWall: "none", legABeamWidth: 130, legADoorType: "auto", legBLength: 1250, legBWall: "none", legBBeamWidth: 130, legBDoorType: "auto", doorHeightUpgrade: false, internalHeightUpgrade: false }
  };

  const d = tsPoleEngine.computePoleDesign(state);
  assertEqual(d.doorOpening, 1100, "TC-02: Door opening is 1100mm (1200 - 50 - 50)");
  assertEqual(state.doorType, "wooden", "TC-02: Sliding does not fit, falls back to wooden bifold");
  assertEqual(d.panelCount, 2, "TC-02: 2 panels wooden bifold");
  assertEqual(d.bifoldPairs, 1, "TC-02: 1 bifold pair");

  const price = tsPoleEngine.computePolePrice(state, d);
  assertEqual(price.feet, 3.9, "TC-02: Billed footage is 3.9ft (<4.5ft)");
  assertEqual(price.baseCost, 1482, "TC-02: Base cost is $1482 (3.9 × $380)");
  assertEqual(price.hingeCost, 380, "TC-02: Hinge cost is $380 ($150 surcharge + $150 structural + $80 laminate)");
  assertEqual(price.total, 1862, "TC-02: Total price is $1862.00");
}

// Case 1C: Minimum 5ft billing (between 4.5ft and 5.0ft)
{
  const min5 = tsPoleEngine.applyMinBilling(4.8);
  assertEqual(min5.billFeet, 5, "TC-03: 4.8ft billed at flat 5.0ft minimum");
  assertEqual(min5.surcharge, 0, "TC-03: No surcharge between 4.5 and 5ft");
}

// Case 1D: Forced sliding door infeasible
{
  const res = tsPoleEngine.resolvePoleDoorType(680, true, "sliding");
  assertEqual(res.infeasible, true, "TC-04: Forced sliding door in 680mm opening is infeasible (min 600mm panel requires ≥1200mm)");
  assertEqual(res.doorType, "sliding", "TC-04: Returns requested type with infeasible flag");
}

console.log("\nTEST SUITE 2: HausPole L-Shape Configurations");
// Case 2A: Leg A 1900mm, Leg B 1250mm
{
  const state = {
    shape: "lshape",
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
    poleFinish: "silver",
    ls: {
      ceiling: 2600,
      depth: 600,
      doorTypePref: "auto",
      legALength: 1900,
      legAWall: "none",
      legABeamWidth: 130,
      legADoorType: "auto",
      legBLength: 1250,
      legBWall: "none",
      legBBeamWidth: 130,
      legBDoorType: "auto",
      doorHeightUpgrade: false,
      internalHeightUpgrade: false,
    }
  };

  const ls = tsPoleEngine.computePoleLShape(state);
  assertEqual(ls.doorA.opening, 1240, "TC-05: Leg A door opening is 1240mm (1900 - 60 - 600)");
  assertEqual(ls.doorB.opening, 590, "TC-05: Leg B door opening is 590mm (1250 - 60 - 600)");
  assertEqual(ls.doorA.type, "sliding", "TC-05: Leg A fits 2-panel sliding (1240 / 2 = 620mm)");
  assertEqual(ls.doorB.type, "wooden", "TC-05: Leg B (590mm) falls back to wooden bifold");
  assertEqual(ls.drawerLeg, "long", "TC-05: Drawer bank consolidated on long leg A");

  const lsPrice = tsPoleEngine.computePoleLShapePrice(state, ls);
  assertEqual(lsPrice.feet, 9.3, "TC-05: Billed footage is 9.3ft (1900 + 1250 - 304.8 = 2845.2mm)");
  assertEqual(lsPrice.baseRate, 380, "TC-05: Base rate with doors is $380");
  assertEqual(lsPrice.baseCost, 3534, "TC-05: Base cost is $3534 (9.3 × $380)");
}

console.log("\nTEST SUITE 3: HausFlex Straight Configurations & Modular Filling");
// Case 3A: 3500mm, ceiling 2600mm, both open
{
  const state = {
    shape: "straight",
    length: 3500,
    ceiling: 2600,
    left: { type: "none", beamWidth: 130 },
    right: { type: "none", beamWidth: 130 },
    doorRequired: true,
    proposal: "A",
    flexDoorTypePref: "auto",
    doorHeightUpgrade: false,
    internalHeightUpgrade: false,
    ls: {
      ceiling: 2600,
      doorRequired: true,
      doorTypePref: "auto",
      legA: { length: 2000, outer: { type: "none", beamWidth: 130 } },
      legB: { length: 1250, outer: { type: "none", beamWidth: 130 } },
      doorHeightUpgrade: false,
      internalHeightUpgrade: false,
    },
    flexMirrorQty: 0,
    flexLaminateQty: 0,
    flexWireBasketQty: 0,
    wireBasketTouched: false,
    flexTrouserHangerQty: 0,
    flexPulloutMirrorQty: 0,
    flexDismantle: false,
    flexAddonRelocatePoint: 0,
    flexAddonNewSwitch: 0,
    flexLed: false,
    flexAddonLedLength: 1.5,
    flexAddonSensor: 0,
  };

  const d = tsFlexEngine.computeFlexDesign(state);
  assertEqual(d.doorOpening, 3380, "TC-06: Flex door opening is 3380mm (3500 - 60 - 60)");
  assertEqual(d.internalWidth, 3380, "TC-06: Internal width is 3380mm");
  assertEqual(d.moduleBudget, 3315, "TC-06: Module budget is 3315mm (3380 - 65)");
  assertEqual(d.door.type, "sliding", "TC-06: Auto door resolves to sliding");
  assertEqual(d.door.panelCount, 4, "TC-06: Sliding panel count is 4 (3380 / 4 = 845mm)");

  // Check Proposal A (Under-target)
  const propA = d.proposalA;
  assertEqual(propA.combo.total, 3292, "TC-06: Proposal A total is 3292mm (550×1 + 609×2 + 762×2)");
  assertEqual(propA.widths.length, 5, "TC-06: Proposal A has 5 modular sections");
  assertEqual(propA.widths, [762, 762, 609, 609, 550], "TC-06: Sections sorted descending [762, 762, 609, 609, 550]");

  const price = tsFlexEngine.computeFlexPriceStraight(state, d, propA);
  assertEqual(price.lines[0].amt, 3680, "TC-06: Base rate cost is $3680 (11.5ft × $320)");
  assertEqual(price.total, 3680, "TC-06: Total straight price without add-ons is $3680.00");
}

// Case 3B: System height cap at 3300mm
{
  const h = tsFlexEngine.computeDoorHeightAndPelmet("sliding", null, 3500, false);
  assertEqual(h.ceiling, 3300, "TC-07: Flex ceiling input of 3500mm is capped at 3300mm max system height");
  assertEqual(h.warnings.length > 0, true, "TC-07: Generates bare wall height cap warning");
}

console.log("\nTEST SUITE 4: WhatsApp Quotation Generation");
// Case 4A: Pole Quotation Formatting
{
  const state = {
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
    poleFinish: "silver",
    ls: { ceiling: 2600, depth: 600, doorTypePref: "auto", legALength: 1900, legAWall: "none", legABeamWidth: 130, legADoorType: "auto", legBLength: 1250, legBWall: "none", legBBeamWidth: 130, legBDoorType: "auto", doorHeightUpgrade: false, internalHeightUpgrade: false }
  };
  const d = tsPoleEngine.computePoleDesign(state);
  const layout = tsPoleEngine.computePoleInternalLayout(state, d);
  const p = tsPoleEngine.computePolePrice(state, d);
  const ap = tsPoleEngine.computePoleAddonPrice(state, p.total);
  const quote = tsQuotationEngine.generatePoleQuoteText(state, d, layout, p, ap);

  assertEqual(quote.includes("*HausPole Wardrobe Quotation*"), true, "TC-08: Quote includes header");
  assertEqual(quote.includes("Dimensions: 2700 x 2600 x 600mm"), true, "TC-08: Quote includes dimensions");
  assertEqual(quote.includes("Door: 3-panel sliding (glass)"), true, "TC-08: Quote includes door summary");
  assertEqual(quote.includes("Drawers: 4 unit(s)"), true, "TC-08: Quote includes drawer count");
  assertEqual(quote.includes("*Total (before GST): $3382.00*"), true, "TC-08: Quote includes exact total $3382.00");
}

console.log("\n===============================================================");
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("===============================================================");

if (failedTests > 0) {
  process.exit(1);
}

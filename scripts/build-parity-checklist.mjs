import fs from "fs";

const html = fs.readFileSync("HausBedroom_Configurator_3.html", "utf8");
const lines = html.split("\n");

function findLine(pattern) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) return i + 1;
  }
  return -1;
}

const features = [
  // --- Header & Navigation ---
  {
    category: "Header & Navigation",
    feature: "Brand Title & Suffix (HausPole / HausFlex Configurator)",
    htmlId: "brandSuffix",
    line: findLine('id="brandSuffix"'),
  },
  {
    category: "Header & Navigation",
    feature: "Product Switcher (HausPole / HausFlex segmented buttons)",
    htmlId: "productToggle",
    line: findLine('id="productToggle"'),
  },
  {
    category: "Header & Navigation",
    feature: "Clear All / New Quote reset button with confirmation",
    htmlId: "resetAllBtn",
    line: findLine('id="resetAllBtn"'),
  },
  {
    category: "Header & Navigation",
    feature: "Methodology v1 engineering subtitle tag",
    htmlId: "header.tag",
    line: findLine('Methodology v1 — engineering check tool'),
  },
  {
    category: "Header & Navigation",
    feature: "Three-Page Navigation Bar (Configurator, Add-ons & Pricing, Quote Output)",
    htmlId: "page-nav-tabs",
    line: findLine('class="page-nav-tabs"'),
  },

  // --- Page 1: HausPole Straight Controls ---
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Wardrobe Shape Toggle (Straight / L-Shaped)",
    htmlId: "shapeToggle",
    line: findLine('id="shapeToggle"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Door Required Toggle (Yes / No)",
    htmlId: "doorRequiredToggle",
    line: findLine('id="doorRequiredToggle"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Wall / Run Length Input (mm) [min 600, max 6000, step 10, default 2700]",
    htmlId: "lengthInput",
    line: findLine('id="lengthInput"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Ceiling Height Input (mm) [min 1800, max 3400, step 10, default 2600]",
    htmlId: "ceilingInput",
    line: findLine('id="ceilingInput"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Desired Depth Input (mm) [min 350, max 750, step 10, default 600]",
    htmlId: "depthInput",
    line: findLine('id="depthInput"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Door Type Preference Dropdown (Auto, Sliding, Wooden, Aluminum, Swing)",
    htmlId: "doorTypePref",
    line: findLine('id="doorTypePref"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Upgrade Door Height beyond 2400mm Toggle (+cost, conditional on ceiling > 2450mm)",
    htmlId: "chkUpgrade",
    line: findLine('id="chkUpgrade"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Left Side Condition Select (No wall / Wall no beam / Wall with beam)",
    htmlId: "leftType",
    line: findLine('id="leftType"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Left Beam Width Input (mm) [min 20, max 600, default 130]",
    htmlId: "leftBeamWidth",
    line: findLine('id="leftBeamWidth"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Right Side Condition Select (No wall / Wall no beam / Wall with beam)",
    htmlId: "rightType",
    line: findLine('id="rightType"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Right Beam Width Input (mm) [min 20, max 600, default 130]",
    htmlId: "rightBeamWidth",
    line: findLine('id="rightBeamWidth"'),
  },
  {
    category: "Page 1: HausPole Straight Controls",
    feature: "Upgrade Internal Height to 2400mm Toggle (+cost)",
    htmlId: "chkInternalUpgrade",
    line: findLine('id="chkInternalUpgrade"'),
  },

  // --- Page 1: HausPole L-Shaped Controls ---
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Door Required Toggle (Yes / No, applies to both legs)",
    htmlId: "lsDoorRequiredToggle",
    line: findLine('id="lsDoorRequiredToggle"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Door Type Preference Dropdown (shared, both legs)",
    htmlId: "lsDoorTypePref",
    line: findLine('id="lsDoorTypePref"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Ceiling Height Input (mm) [min 1800, max 3400]",
    htmlId: "lsCeilingInput",
    line: findLine('id="lsCeilingInput"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Depth per Leg Input (mm) [min 350, max 750]",
    htmlId: "lsDepthInput",
    line: findLine('id="lsDepthInput"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg A Length Input (mm) [min 600, max 4000, default 1900]",
    htmlId: "legALength",
    line: findLine('id="legALength"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg A Outer End Condition Select (none / wall / beam)",
    htmlId: "legAWall",
    line: findLine('id="legAWall"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg A Beam Width Input (mm)",
    htmlId: "legABeamWidth",
    line: findLine('id="legABeamWidth"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg B Length Input (mm) [min 600, max 4000, default 1250]",
    htmlId: "legBLength",
    line: findLine('id="legBLength"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg B Outer End Condition Select (none / wall / beam)",
    htmlId: "legBWall",
    line: findLine('id="legBWall"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "Leg B Beam Width Input (mm)",
    htmlId: "legBBeamWidth",
    line: findLine('id="legBBeamWidth"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Upgrade Door Height Toggle (+cost)",
    htmlId: "lsChkDoorUpgrade",
    line: findLine('id="lsChkDoorUpgrade"'),
  },
  {
    category: "Page 1: HausPole L-Shaped Controls",
    feature: "L-Shape Upgrade Internal Height Toggle (+cost)",
    htmlId: "lsChkInternalUpgrade",
    line: findLine('id="lsChkInternalUpgrade"'),
  },

  // --- Page 1: HausFlex Straight Controls ---
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Door Required Toggle (Yes / No)",
    htmlId: "flexDoorRequiredToggle",
    line: findLine('id="flexDoorRequiredToggle"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Door Type Preference Dropdown",
    htmlId: "flexDoorTypePref",
    line: findLine('id="flexDoorTypePref"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Wall / Run Length Input (mm) [min 600, max 8000, default 3500]",
    htmlId: "flexLengthInput",
    line: findLine('id="flexLengthInput"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Ceiling Height Input (mm) [min 1800, max 3400, default 2600]",
    htmlId: "flexCeilingInput",
    line: findLine('id="flexCeilingInput"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Left Condition (none 60mm partition / wall 50mm pillar / beam)",
    htmlId: "flexLeftType",
    line: findLine('id="flexLeftType"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Left Beam Width Input (mm)",
    htmlId: "flexLeftBeamWidth",
    line: findLine('id="flexLeftBeamWidth"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Right Condition (none 60mm partition / wall 50mm pillar / beam)",
    htmlId: "flexRightType",
    line: findLine('id="flexRightType"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Right Beam Width Input (mm)",
    htmlId: "flexRightBeamWidth",
    line: findLine('id="flexRightBeamWidth"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Proposal Toggle [A — Under / B — Over]",
    htmlId: "flexProposalToggle",
    line: findLine('id="flexProposalToggle"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Door Height Upgrade Toggle (+cost)",
    htmlId: "flexChkDoorHeightUpgrade",
    line: findLine('id="flexChkDoorHeightUpgrade"'),
  },
  {
    category: "Page 1: HausFlex Straight Controls",
    feature: "HausFlex Internal Height Upgrade Toggle (+cost, extra shelf @2400mm)",
    htmlId: "flexChkInternalHeightUpgrade",
    line: findLine('id="flexChkInternalHeightUpgrade"'),
  },

  // --- Page 1: HausFlex L-Shaped Controls ---
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex L-Shape Door Required Toggle (Yes / No)",
    htmlId: "flexLsDoorRequiredToggle",
    line: findLine('id="flexLsDoorRequiredToggle"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex L-Shape Door Type Preference Dropdown",
    htmlId: "flexLsDoorTypePref",
    line: findLine('id="flexLsDoorTypePref"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex L-Shape Ceiling Height Input (mm)",
    htmlId: "flexLsCeilingInput",
    line: findLine('id="flexLsCeilingInput"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg A Length Input (mm) [min 600, max 5000, default 2000]",
    htmlId: "flexLegALength",
    line: findLine('id="flexLegALength"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg A Outer End Condition Select",
    htmlId: "flexLegAType",
    line: findLine('id="flexLegAType"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg A Beam Width Input (mm)",
    htmlId: "flexLegABeamWidth",
    line: findLine('id="flexLegABeamWidth"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg B Length Input (mm) [min 600, max 5000, default 1250]",
    htmlId: "flexLegBLength",
    line: findLine('id="flexLegBLength"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg B Outer End Condition Select",
    htmlId: "flexLegBType",
    line: findLine('id="flexLegBType"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex Leg B Beam Width Input (mm)",
    htmlId: "flexLegBBeamWidth",
    line: findLine('id="flexLegBBeamWidth"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex L-Shape Door Height Upgrade Toggle",
    htmlId: "flexLsChkDoorHeightUpgrade",
    line: findLine('id="flexLsChkDoorHeightUpgrade"'),
  },
  {
    category: "Page 1: HausFlex L-Shaped Controls",
    feature: "HausFlex L-Shape Internal Height Upgrade Toggle",
    htmlId: "flexLsChkInternalHeightUpgrade",
    line: findLine('id="flexLsChkInternalHeightUpgrade"'),
  },

  // --- Technical Drawings: 12 Canvases ---
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole Straight: External Elevation Canvas",
    htmlId: "elevCanvas",
    line: findLine('id="elevCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole Straight: Internal Elevation Canvas",
    htmlId: "internalElevCanvas",
    line: findLine('id="internalElevCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole Straight: Top View Canvas",
    htmlId: "topViewCanvas",
    line: findLine('id="topViewCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole L-Shape: External Elevation Canvas",
    htmlId: "lshapeExtCanvas",
    line: findLine('id="lshapeExtCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole L-Shape: Internal Elevation Canvas",
    htmlId: "lshapeIntCanvas",
    line: findLine('id="lshapeIntCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausPole L-Shape: Top View Canvas",
    htmlId: "lshapeTopViewCanvas",
    line: findLine('id="lshapeTopViewCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex Straight: External Elevation Canvas",
    htmlId: "flexElevCanvas",
    line: findLine('id="flexElevCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex Straight: Internal Elevation Canvas",
    htmlId: "flexInternalElevCanvas",
    line: findLine('id="flexInternalElevCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex Straight: Top View Canvas",
    htmlId: "flexTopViewCanvas",
    line: findLine('id="flexTopViewCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex L-Shape: External Elevation Canvas",
    htmlId: "flexLsExtCanvas",
    line: findLine('id="flexLsExtCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex L-Shape: Internal Elevation Canvas",
    htmlId: "flexLsIntCanvas",
    line: findLine('id="flexLsIntCanvas"'),
  },
  {
    category: "Technical Drawings (2D Canvas)",
    feature: "HausFlex L-Shape: Top View Canvas",
    htmlId: "flexLsTopCanvas",
    line: findLine('id="flexLsTopCanvas"'),
  },

  // --- Specification Sheets ---
  {
    category: "Engineering Specification Sheets",
    feature: "HausPole Straight: Structure & Door Specification Sheet",
    htmlId: "specSheet",
    line: findLine('id="specSheet"'),
  },
  {
    category: "Engineering Specification Sheets",
    feature: "HausPole Straight: Internal Configuration & Column Layout Table",
    htmlId: "internalSheet",
    line: findLine('id="internalSheet"'),
  },
  {
    category: "Engineering Specification Sheets",
    feature: "HausPole L-Shape: Corner Tower, Leg A/B & Price Breakdown Sheet",
    htmlId: "lshapeSpecSheet",
    line: findLine('id="lshapeSpecSheet"'),
  },
  {
    category: "Engineering Specification Sheets",
    feature: "HausFlex Straight: Module Fill, Section Templates & Warnings Sheet",
    htmlId: "flexSpecSheet",
    line: findLine('id="flexSpecSheet"'),
  },
  {
    category: "Engineering Specification Sheets",
    feature: "HausFlex L-Shape: Corner Ownership & Section Breakdown Sheet",
    htmlId: "flexLsSpecSheet",
    line: findLine('id="flexLsSpecSheet"'),
  },

  // --- Page 2: Add-ons & Pricing ---
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Full Mirror Door Panels Input (+ $150 each)",
    htmlId: "mirrorQty",
    line: findLine('id="mirrorQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Laminate Pieces Input (+ $80 each)",
    htmlId: "laminateQty",
    line: findLine('id="laminateQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Pole Finish Select (Silver / Champagne +$30/ft / Black +$30/ft)",
    htmlId: "poleFinish",
    line: findLine('id="poleFinish"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Additional Drawers Beyond Base Count (+ $80 each)",
    htmlId: "addonExtraDrawers",
    line: findLine('id="addonExtraDrawers"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Secret Drawer Top-up (+ $100 each)",
    htmlId: "addonSecretDrawer",
    line: findLine('id="addonSecretDrawer"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Drawer Head Mirror + Aluminium Frame (+ $60/drawer)",
    htmlId: "addonDrawerHead",
    line: findLine('id="addonDrawerHead"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Dismantle & Disposal Toggle ($40/ft run, min $200)",
    htmlId: "chkDismantle",
    line: findLine('id="chkDismantle"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Relocate Switch / Power Point (+ $80/point)",
    htmlId: "addonRelocatePoint",
    line: findLine('id="addonRelocatePoint"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "New Light Switch (+ $100/point)",
    htmlId: "addonNewSwitch",
    line: findLine('id="addonNewSwitch"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "LED Lighting Toggle (min $180, incl first 1.5m)",
    htmlId: "chkLed",
    line: findLine('id="chkLed"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Total LED Run Length Input (m) (excess at $120/m)",
    htmlId: "addonLedLength",
    line: findLine('id="addonLedLength"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Wired Sensor — Touch / Door Inductive (+ $80/ea)",
    htmlId: "addonSensor",
    line: findLine('id="addonSensor"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Pull-out Wire Basket 600mm (+ $180/unit)",
    htmlId: "addonWireBasket",
    line: findLine('id="addonWireBasket"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Trouser Holder (+ $80/ea)",
    htmlId: "addonTrouserHolder",
    line: findLine('id="addonTrouserHolder"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Double Trouser Hanger 630 (+ $200/ea)",
    htmlId: "addonDoubleTrouser",
    line: findLine('id="addonDoubleTrouser"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Pull-out Trouser Hanger 610/800mm (+ $120/ea)",
    htmlId: "addonPulloutTrouser",
    line: findLine('id="addonPulloutTrouser"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Full-Length Pull-out Mirror (+ $200/ea)",
    htmlId: "addonFullMirror",
    line: findLine('id="addonFullMirror"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Box-up Mirror (+ $150/ea)",
    htmlId: "addonBoxMirror",
    line: findLine('id="addonBoxMirror"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Flip Mirror (+ $160/ea)",
    htmlId: "addonFlipMirror",
    line: findLine('id="addonFlipMirror"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Base Config Summary Sheet Container",
    htmlId: "baseConfigSummary",
    line: findLine('id="baseConfigSummary"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Pole)",
    feature: "Addon Price Sheet Itemized Table Container",
    htmlId: "addonPriceSheet",
    line: findLine('id="addonPriceSheet"'),
  },

  // --- Page 2: Add-ons & Pricing (Flex) ---
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Full Mirror Door Panels (+ $150 each)",
    htmlId: "flexMirrorQty",
    line: findLine('id="flexMirrorQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Laminate Pieces (+ $80 each)",
    htmlId: "flexLaminateQty",
    line: findLine('id="flexLaminateQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Dismantle & Disposal Toggle",
    htmlId: "flexChkDismantle",
    line: findLine('id="flexChkDismantle"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Relocate Switch / Power Point",
    htmlId: "flexAddonRelocatePoint",
    line: findLine('id="flexAddonRelocatePoint"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex New Light Switch",
    htmlId: "flexAddonNewSwitch",
    line: findLine('id="flexAddonNewSwitch"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex LED Lighting Toggle",
    htmlId: "flexChkLed",
    line: findLine('id="flexChkLed"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex LED Run Length Input",
    htmlId: "flexAddonLedLength",
    line: findLine('id="flexAddonLedLength"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Wired Sensor",
    htmlId: "flexAddonSensor",
    line: findLine('id="flexAddonSensor"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Wire Baskets Qty (tiered default + paid excess at $120/unit)",
    htmlId: "flexWireBasketQty",
    line: findLine('id="flexWireBasketQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Trouser Hangers (+ $120/unit)",
    htmlId: "flexTrouserHangerQty",
    line: findLine('id="flexTrouserHangerQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Full-Length Pull-out Mirror (+ $200/ea)",
    htmlId: "flexPulloutMirrorQty",
    line: findLine('id="flexPulloutMirrorQty"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Base Config Summary Sheet",
    htmlId: "flexBaseConfigSummary",
    line: findLine('id="flexBaseConfigSummary"'),
  },
  {
    category: "Page 2: Add-ons & Pricing (Flex)",
    feature: "HausFlex Addon Price Sheet Container",
    htmlId: "flexAddonPriceSheet",
    line: findLine('id="flexAddonPriceSheet"'),
  },

  // --- Page 3: Quote Output ---
  {
    category: "Page 3: Quote Output",
    feature: "Copy Quote Button with 'Copied!' toast feedback",
    htmlId: "copyQuoteBtn",
    line: findLine('id="copyQuoteBtn"'),
  },
  {
    category: "Page 3: Quote Output",
    feature: "WhatsApp Formatted Quotation Preview (<pre id='quotePreview'>)",
    htmlId: "quotePreview",
    line: findLine('id="quotePreview"'),
  },

  // --- Additional Feature: 3D Visualization ---
  {
    category: "Additional Feature: 3D Visualization",
    feature: "Interactive 3D Showroom View Tab with OrbitControls & dynamic parametric model",
    htmlId: "threeDViewContainer",
    line: -1,
  }
];

fs.writeFileSync("scripts/parity-checklist.json", JSON.stringify(features, null, 2));
console.log(`Generated ${features.length} feature items in scripts/parity-checklist.json`);

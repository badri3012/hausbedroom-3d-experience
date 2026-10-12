/**
 * HAUSBEDROOM ENGINEERING TYPES
 * Exact architectural & calculation types extracted from HausBedroom_Configurator_3.html
 */

export type ProductSystem = "pole" | "flex";
export type WardrobeShape = "straight" | "lshape";
export type SideWallType = "none" | "wall" | "beam";
export type DoorPreference = "auto" | "sliding" | "wooden" | "aluminum" | "swing" | "none";
export type PoleDoorType = "sliding" | "wooden" | "aluminum" | "none";
export type FlexDoorType = "sliding" | "bifold" | "swing" | "none" | "infeasible";
export type PoleFinish = "silver" | "black" | "champagne";

export interface SideCondition {
  type: SideWallType;
  beamWidth: number; // mm
}

export interface SideElementResult {
  width?: number; // PoleApp uses width
  doorW?: number;  // FlexApp uses doorW
  internalW?: number; // FlexApp uses internalW
  kind: "partition" | "pillar" | "beampillar";
  desc: string;
}

export interface MinBillingResult {
  billFeet: number;
  surcharge: number;
  note: string | null;
}

// ---------------------------------------------------------------------------
// HAUSPOLE TYPES
// ---------------------------------------------------------------------------

export interface PoleDoorResolution {
  doorType: PoleDoorType;
  infeasible: boolean;
  autoMaterial: boolean;
  forcedSwing: boolean;
}

export interface PoleSplitInfo {
  type: "midrail" | "split";
  at?: number;
  bottom?: number;
  top?: number;
}

export interface PoleDesignResult {
  left: SideElementResult;
  right: SideElementResult;
  sideL: SideElementResult;
  sideR: SideElementResult;
  depth: number;
  notes: string[];
  doorOpening: number;
  shelfDepth: number;
  doorHeight: number;
  pelmetHeight: number;
  splitInfo: PoleSplitInfo | null;
  panelCount: number;
  panelWidth: number;
  hingeUnits: number;
  bifoldPairs: number;
  swingCount: number;
  interiorPillars: number;
  drawerCount: number;
  drawerPlacement: string;
  warnings: string[];
  maxBudget: number;
  internalWidth: number;
  internalHeight: number;
  door: {
    type: PoleDoorType;
    panelCount: number;
    panelWidth: number;
    height: number;
    bifoldPairs: number;
    swingCount: number;
    infeasible?: boolean;
  };
  internalLayout: PoleInternalLayout;
}

export interface PoleSegment {
  label: string;
  width: number;
  type: string;
}

export interface PoleInternalLayout {
  internalWidth: number;
  notes: string[];
  warnings: string[];
  segments: PoleSegment[];
  poles?: number;
  drawerWidth?: number | null;
  bufferSeg?: number | null;
  installBuffer?: number;
  bays: { width: number; xStart: number; xEnd: number; isDrawerBay?: boolean }[];
  drawerBayIndex: number;
}

export interface PoleLegDoor {
  outerEnd: number;
  opening: number;
  type: PoleDoorType;
  material: string | null;
  autoMaterial?: boolean;
  valid: boolean;
  panelCount?: number;
  panelWidth?: number;
  bifoldPairs?: number;
  swingCount?: number;
  note?: string;
}

export interface PoleLShapeDesign {
  warnings: string[];
  notes: string[];
  doorA: PoleLegDoor;
  doorB: PoleLegDoor;
  longLeg: { name: string; length: number; wallType: SideWallType; door: PoleLegDoor };
  shortLeg: { name: string; length: number; wallType: SideWallType; door: PoleLegDoor };
  longFurnWidth: number;
  shortFurnWidth: number;
  drawerCount: number;
  stackFits: boolean;
  drawerLeg: "long" | "short" | null;
  drawerWidth: number | null;
  drawerWidthShort: number | null;
  drawerCountLong: number | null;
  drawerCountShort: number | null;
  longFlexWidth: number | null;
  shortFlexWidth: number | null;
  shortCanSplit: boolean;
  shortSingleColWidth: number | null;
}

export interface PolePriceResult {
  feet: number;
  baseRate: number;
  topUp: number;
  rate: number;
  tierLabel: string;
  outOfTier: boolean;
  baseCost: number | null;
  finishLines: string[];
  finishCost: number;
  hingeLines: string[];
  hingeCost: number;
  total: number | null;
}

export interface PoleLShapePriceResult {
  feet: number;
  baseRate: number;
  topUp: number;
  rate: number;
  tierLabel: string;
  outOfTier: boolean;
  baseCost: number | null;
  hingeLines: string[];
  hingeCost: number;
  total: number | null;
}

export interface AddonLine {
  label: string;
  cost: number;
}

export interface AddonPriceResult {
  lines: AddonLine[];
  total: number;
  basePrice: number | null;
  grandTotal: number | null;
}

export interface PoleState {
  shape: WardrobeShape;
  length: number;
  ceiling: number;
  depth: number;
  left: SideCondition;
  right: SideCondition;
  doorRequired: boolean;
  doorTypePref: DoorPreference;
  doorType: PoleDoorType;
  doorAutoMaterial: boolean;
  doorForcedSwing: boolean;
  doorHeightUpgrade: boolean;
  hangingRod: boolean;
  internalHeightUpgrade: boolean;
  ls: {
    ceiling: number;
    depth: number;
    doorRequired?: boolean;
    doorTypePref: DoorPreference;
    legALength: number;
    legAWall: SideWallType;
    legABeamWidth: number;
    legADoorType?: DoorPreference;
    legBLength: number;
    legBWall: SideWallType;
    legBBeamWidth: number;
    legBDoorType?: DoorPreference;
    doorHeightUpgrade: boolean;
    internalHeightUpgrade: boolean;
    legAOuter?: SideCondition;
    legBOuter?: SideCondition;
    doorTypeA?: PoleDoorType;
    doorTypeB?: PoleDoorType;
  };
  mirrorQty: number;
  laminateQty: number;
  addonExtraDrawers: number;
  addonSecretDrawer: number;
  addonDrawerHead: number;
  dismantle: boolean;
  addonRelocatePoint: number;
  addonNewSwitch: number;
  led: boolean;
  addonLedLength: number;
  addonSensor: number;
  addonWireBasket: number;
  addonTrouserHolder: number;
  addonDoubleTrouser: number;
  addonPulloutTrouser: number;
  addonFullMirror: number;
  addonBoxMirror: number;
  addonFlipMirror: number;
  poleFinish: PoleFinish;
}

// ---------------------------------------------------------------------------
// HAUSFLEX TYPES
// ---------------------------------------------------------------------------

export interface FlexDoorResolution {
  type: FlexDoorType;
  panelCount: number;
  panelWidth: number;
  material: "wooden" | "aluminum" | null;
  autoMaterial?: boolean;
  forced?: boolean;
  manual?: boolean;
  requested?: string;
  bifoldPairs?: number;
  swingCount?: number;
}

export interface ModuleCombo {
  a: number; // 550mm
  b: number; // 609mm
  c: number; // 762mm
  k: number;
  total: number;
  deviation: number;
}

export type FlexTemplate = "F1" | "F2" | "F3" | "F4";

export interface FlexProposal {
  combo: ModuleCombo;
  widths: number[];
  basketIndices: number[];
  basketCounts: Record<number, number>;
  basketIdx: number;
  basketActualQty: number;
  basketCapped: boolean;
  basketNeededSections: number;
  basketPositionInvalid: number[];
  basketNearMiss: { index: number; margin: number }[];
  basketTableQty: number;
  basketExtra: number;
  templates: (FlexTemplate | null)[];
  actualLength: number;
  bareWallMm: number;
  note: string;
  dir: "under" | "over";
  clearance?: { applicable: boolean; results?: { index: number; margin: number; pass: boolean }[]; pass?: boolean };
}

export interface FlexDesignResult {
  left: SideElementResult;
  right: SideElementResult;
  sideL: SideElementResult;
  sideR: SideElementResult;
  doorOpening: number;
  internalWidth: number;
  moduleBudget: number;
  door: FlexDoorResolution;
  proposalA: FlexProposal | null;
  proposalB: FlexProposal | null;
  doorHeight: number;
  pelmetHeight: number;
  doorSplit: { bottom: number; top: number } | null;
  doorMidRail: boolean;
  anchor: { hingeUnits: number; interiorPillars: number };
  mirrorValid: boolean;
  mirrorSide: "left" | "right" | null;
  warnings: string[];
}

export interface FlexState {
  shape: WardrobeShape;
  length: number;
  ceiling: number;
  left: SideCondition;
  right: SideCondition;
  doorRequired: boolean;
  proposal: "A" | "B";
  flexDoorTypePref: DoorPreference;
  doorHeightUpgrade: boolean;
  internalHeightUpgrade: boolean;
  ls: {
    ceiling: number;
    doorRequired: boolean;
    doorTypePref: DoorPreference;
    legA: { length: number; outer: SideCondition };
    legB: { length: number; outer: SideCondition };
    doorHeightUpgrade: boolean;
    internalHeightUpgrade: boolean;
  };
  flexMirrorQty: number;
  flexLaminateQty: number;
  flexWireBasketQty: number;
  wireBasketTouched: boolean;
  flexTrouserHangerQty: number;
  flexPulloutMirrorQty: number;
  flexDismantle: boolean;
  flexAddonRelocatePoint: number;
  flexAddonNewSwitch: number;
  flexLed: boolean;
  flexAddonLedLength: number;
  flexAddonSensor: number;
  depth?: number;
}

export interface FlexPriceResult {
  lines: { label: string; desc?: string; amt: number }[];
  total: number;
  feet: number;
  warnings?: string[];
}

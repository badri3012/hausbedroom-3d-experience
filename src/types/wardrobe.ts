export type WardrobeVariantId = "contemporary-sliding" | "full-modular" | "open-modular";

export type WoodFinishId = "natural-oak" | "walnut" | "light-ash" | "dark-wood";
export type FrameFinishId = "matte-black" | "brushed-silver" | "champagne";
export type DoorPanelId = "frosted-glass" | "smoked-glass" | "light-neutral";

export type CameraPreset = "default" | "front" | "interior" | "side" | "top";

export type ConfiguratorTab = "overview" | "materials" | "doors" | "interior" | "dimensions" | "enquire";

export interface WoodFinishOption {
  id: WoodFinishId;
  name: string;
  subtitle: string;
  color: string;
  roughness: number;
  metalness: number;
  description: string;
}

export interface FrameFinishOption {
  id: FrameFinishId;
  name: string;
  subtitle: string;
  color: string;
  roughness: number;
  metalness: number;
  description: string;
}

export interface DoorPanelOption {
  id: DoorPanelId;
  name: string;
  subtitle: string;
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  opacity: number;
  isGlass: boolean;
  description: string;
}

export interface WardrobeDimensions {
  width: number;  // mm
  height: number; // mm
  depth: number;  // mm
  label: string;
  baysCount: number;
  doorType: "sliding" | "open";
}

export interface WardrobeVariant {
  id: WardrobeVariantId;
  title: string;
  referenceName: string;
  referenceTag: string;
  tagline: string;
  description: string;
  highlights: string[];
  dimensions: WardrobeDimensions;
  defaultWood: WoodFinishId;
  defaultFrame: FrameFinishId;
  defaultDoorPanel: DoorPanelId;
}

export interface WardrobeInteractionState {
  activeVariant: WardrobeVariantId;
  woodFinish: WoodFinishId;
  frameFinish: FrameFinishId;
  doorPanel: DoorPanelId;
  
  // Door states
  leftDoorOpen: boolean;
  rightDoorOpen: boolean;
  bothDoorsOpen: boolean;
  
  // Drawer states
  topDrawerOpen: boolean;
  bottomDrawerOpen: boolean;
  drawersOpen: boolean;
  
  // Camera & view mode
  cameraPreset: CameraPreset;
  interiorViewActive: boolean;
  autoRotate: boolean;
  
  // Scene lighting & environment
  lightingMode: "showroom-spots" | "daylight" | "evening";
  showDimensions: boolean;
  showSpotlights: boolean;
  shelfLedsOn: boolean;
  
  // Interactive inspection
  hoveredComponent: string | null;
  selectedComponent: string | null;
}

export interface CustomerEnquiry {
  fullName: string;
  email: string;
  phone: string;
  housingType: string;
  estimatedTimeline: string;
  approxWidth: string;
  approxHeight: string;
  customRequirements: string;
}

export type SourceStatus = "VERIFIED" | "CONCEPTUAL" | "UNAVAILABLE";

export interface ComponentMetadata {
  id: string;
  name: string;
  meshName: string;
  category: "Framework" | "Storage" | "Accessory" | "Door System" | "Lighting";
  description: string;
  function: string;
  verifiedMaterial: string;
  dimensions: string;
  sourceStatus: SourceStatus;
  sourceReference: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  transmission?: number;
  ior?: number;
  category: "frame" | "wood" | "glass";
  status: SourceStatus;
}

export interface Product3DInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: SourceStatus;
  has3DModel: boolean;
}

export const HAUSFLEX_COMPONENTS: Record<string, ComponentMetadata> = {
  "hausflex.frame.left": {
    id: "hausflex.frame.left",
    name: "Left Aluminium Support Column",
    meshName: "hausflex.frame.left",
    category: "Framework",
    description: "Extruded structural aluminium alloy vertical support post with integrated modular bracket slots.",
    function: "Primary vertical load-bearing frame.",
    verifiedMaterial: "Anodized Architectural Aluminium Alloy",
    dimensions: "W 40mm × D 50mm × H 2400mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Official Modular Wardrobe Specification 2026",
  },
  "hausflex.frame.right": {
    id: "hausflex.frame.right",
    name: "Right Aluminium Support Column",
    meshName: "hausflex.frame.right",
    category: "Framework",
    description: "Extruded structural aluminium alloy vertical support post with integrated modular bracket slots.",
    function: "Primary vertical load-bearing frame.",
    verifiedMaterial: "Anodized Architectural Aluminium Alloy",
    dimensions: "W 40mm × D 50mm × H 2400mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Official Modular Wardrobe Specification 2026",
  },
  "hausflex.frame.top": {
    id: "hausflex.frame.top",
    name: "Upper Structural Frame Header",
    meshName: "hausflex.frame.top",
    category: "Framework",
    description: "Transverse top stabilizer bar connecting the main vertical support columns.",
    function: "Horizontal frame rigidity and ceiling anchor clearance.",
    verifiedMaterial: "High-Tensile Extruded Aluminium",
    dimensions: "W 1200mm × D 50mm × H 40mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Technical Catalog",
  },
  "hausflex.shelf.top": {
    id: "hausflex.shelf.top",
    name: "Upper Storage Shelf",
    meshName: "hausflex.shelf.top",
    category: "Storage",
    description: "Heavy-duty top compartment shelf for seasonal bedding and luggage storage.",
    function: "High-capacity upper horizontal storage.",
    verifiedMaterial: "E0 Grade Moisture-Resistant Melamine Board with ABS Edging",
    dimensions: "W 1120mm × D 500mm × H 25mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausBedroom Wardrobe Components Guide",
  },
  "hausflex.shelf.middle": {
    id: "hausflex.shelf.middle",
    name: "Mid Display & Folded Garment Shelf",
    meshName: "hausflex.shelf.middle",
    category: "Storage",
    description: "Adjustable height shelf with integrated concealed mounting brackets.",
    function: "Folded clothing & everyday accessory storage.",
    verifiedMaterial: "E0 Moisture-Resistant Engineered Wood",
    dimensions: "W 1120mm × D 500mm × H 25mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausBedroom Wardrobe Components Guide",
  },
  "hausflex.rail.main": {
    id: "hausflex.rail.main",
    name: "Anodized Garment Hanging Rail",
    meshName: "hausflex.rail.main",
    category: "Storage",
    description: "Oval profile aluminium hanging rod with anti-slip rubber top gasket.",
    function: "Full-length suit and dress hanging bar.",
    verifiedMaterial: "Extruded Aluminium Alloy (Matte Anodized)",
    dimensions: "W 1110mm × Diameter 30mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Modular Systems Spec",
  },
  "hausflex.drawer.top": {
    id: "hausflex.drawer.top",
    name: "Primary Soft-Close Storage Drawer",
    meshName: "hausflex.drawer.top",
    category: "Storage",
    description: "Full-extension under-mount soft-close drawer with concealed German runners.",
    function: "Enclosed dust-free garment & underwear storage.",
    verifiedMaterial: "E0 Moisture-Resistant Board with Soft-Close Hardware",
    dimensions: "W 1120mm × D 480mm × H 200mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Hardware Assembly Manual",
  },
  "hausflex.drawer.bottom": {
    id: "hausflex.drawer.bottom",
    name: "Deep Base Storage Drawer",
    meshName: "hausflex.drawer.bottom",
    category: "Storage",
    description: "Deep bottom drawer module with integrated concealed lip handle.",
    function: "Heavy sweater & bulky garment storage.",
    verifiedMaterial: "E0 Moisture-Resistant Board",
    dimensions: "W 1120mm × D 480mm × H 280mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Hardware Assembly Manual",
  },
  "hausflex.accessory.trouser": {
    id: "hausflex.accessory.trouser",
    name: "Slide-Out Trouser Rack",
    meshName: "hausflex.accessory.trouser",
    category: "Accessory",
    description: "Pull-out aluminium trouser organizer with anti-slip cushioned rungs.",
    function: "Crease-free trouser & slack suspension.",
    verifiedMaterial: "Anodized Aluminium & Anti-Slip Silicone",
    dimensions: "W 1120mm × D 460mm × H 60mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausFlex Accessory Catalog",
  },
  "hausflex.doors.left": {
    id: "hausflex.doors.left",
    name: "Left Tempered Glass Door Panel",
    meshName: "hausflex.doors.left",
    category: "Door System",
    description: "Framed 4mm tempered safety glass hinged door panel with 110° soft-close hinges.",
    function: "Dust protection with refined visual transparency.",
    verifiedMaterial: "Tempered Safety Glass & Slim Profile Frame",
    dimensions: "W 560mm × D 20mm × H 2300mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausGlide / HausFlex Door Option Spec",
  },
  "hausflex.doors.right": {
    id: "hausflex.doors.right",
    name: "Right Tempered Glass Door Panel",
    meshName: "hausflex.doors.right",
    category: "Door System",
    description: "Framed 4mm tempered safety glass hinged door panel with 110° soft-close hinges.",
    function: "Dust protection with refined visual transparency.",
    verifiedMaterial: "Tempered Safety Glass & Slim Profile Frame",
    dimensions: "W 560mm × D 20mm × H 2300mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausGlide / HausFlex Door Option Spec",
  },
  "hausflex.lighting.led": {
    id: "hausflex.lighting.led",
    name: "Recessed Vertical LED Profile",
    meshName: "hausflex.lighting.led",
    category: "Lighting",
    description: "Concealed full-height warm 3000K LED channel strip with proximity sensor.",
    function: "Ambient interior illumination & luxury visibility.",
    verifiedMaterial: "Aluminium Diffuser & Low-Voltage COB LED Strip",
    dimensions: "W 15mm × D 10mm × H 2350mm",
    sourceStatus: "VERIFIED",
    sourceReference: "HausBedroom Electrical Integration Guide",
  },
};

export const FRAME_FINISHES: MaterialOption[] = [
  { id: "black", name: "Matte Anodized Black", color: "#1C1C19", roughness: 0.35, metalness: 0.85, category: "frame", status: "VERIFIED" },
  { id: "silver", name: "Satin Brushed Silver", color: "#C4C4C4", roughness: 0.25, metalness: 0.9, category: "frame", status: "VERIFIED" },
  { id: "bronze", name: "Champagne Bronze", color: "#9E8155", roughness: 0.3, metalness: 0.88, category: "frame", status: "VERIFIED" },
];

export const WOOD_FINISHES: MaterialOption[] = [
  { id: "natural-oak", name: "Natural Blonde Oak", color: "#D4B48A", roughness: 0.65, metalness: 0.05, category: "wood", status: "VERIFIED" },
  { id: "smoky-walnut", name: "Smoky Espresso Walnut", color: "#453428", roughness: 0.6, metalness: 0.05, category: "wood", status: "VERIFIED" },
  { id: "matte-slate", name: "Matte Charcoal Slate", color: "#2B2D31", roughness: 0.7, metalness: 0.1, category: "wood", status: "VERIFIED" },
  { id: "warm-ivory", name: "Warm Alabaster Ivory", color: "#ECE6DC", roughness: 0.75, metalness: 0.02, category: "wood", status: "VERIFIED" },
];

export const GLASS_FINISHES: MaterialOption[] = [
  { id: "tinted-glass", name: "Smoky Tinted Glass", color: "#222222", roughness: 0.1, metalness: 0.1, transmission: 0.82, ior: 1.5, category: "glass", status: "VERIFIED" },
  { id: "clear-glass", name: "Ultra-Clear Glass", color: "#FFFFFF", roughness: 0.05, metalness: 0.05, transmission: 0.95, ior: 1.5, category: "glass", status: "VERIFIED" },
  { id: "bronze-glass", name: "Amber Bronze Glass", color: "#594532", roughness: 0.12, metalness: 0.15, transmission: 0.75, ior: 1.52, category: "glass", status: "VERIFIED" },
];

export const CATALOG_PRODUCTS: Product3DInfo[] = [
  {
    id: "hausflex",
    name: "HausFlex Modular Wardrobe",
    tagline: "Signature full-metal relocatable modular storage system.",
    description: "Fully interactive 3D WebGL model with real-time component raycasting, exploded view, door/drawer mechanisms & PBR customisation.",
    status: "VERIFIED",
    has3DModel: true,
  },
  {
    id: "hauspole",
    name: "HausPole Open System",
    tagline: "Minimalist floor-to-ceiling pole suspended storage architecture.",
    description: "Floor-to-ceiling modular aluminium tension posts with adjustable cantilever shelves.",
    status: "CONCEPTUAL",
    has3DModel: false,
  },
  {
    id: "hausglide",
    name: "HausGlide Sliding Door System",
    tagline: "Ultra-smooth damped sliding glass & panel door system.",
    description: "Zero swing clearance heavy-duty top hung sliding door architecture.",
    status: "CONCEPTUAL",
    has3DModel: false,
  },
];

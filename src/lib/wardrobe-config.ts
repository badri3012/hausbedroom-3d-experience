import { WardrobeVariant } from "@/types/wardrobe";

export const WARDROBE_VARIANTS: WardrobeVariant[] = [
  {
    id: "contemporary-sliding",
    title: "Contemporary Sliding Wardrobe",
    referenceName: "Reference 3 — Master Suite Installation",
    referenceTag: "Primary Demonstration",
    tagline: "Architectural sliding glass doors with central showcase cubbies & dual solid wood drawers.",
    description:
      "Crafted specifically from Reference Image 3, featuring full-height matte black aluminium framing, frosted satin privacy glass panels with balanced architectural dividing rails, and a central display cubby tower with integrated soft-close drawers.",
    highlights: [
      "Dual-track whisper-quiet horizontal sliding door system",
      "Central 6-tier display cubby module with dual lower storage drawers",
      "Twin lateral hanging bays for formal garments and long coats",
      "Recessed ceiling spotlight track illumination with floor parquet integration",
      "Provisional demonstration dimensions: 3000 mm × 2400 mm × 600 mm",
    ],
    dimensions: {
      width: 3000,
      height: 2400,
      depth: 600,
      label: "W 3000 × H 2400 × D 600 mm (Demo Assumptions)",
      baysCount: 3,
      doorType: "sliding",
    },
    defaultWood: "natural-oak",
    defaultFrame: "matte-black",
    defaultDoorPanel: "frosted-glass",
  },
  {
    id: "full-modular",
    title: "Full Modular Built-in Wardrobe",
    referenceName: "Reference 1 — Multi-Bay Modular System",
    referenceTag: "Variant 1",
    tagline: "Expansive 4-bay wardrobe system with multiple hanging rails, dual drawer chests, and wire baskets.",
    description:
      "Directly inspired by Reference Image 1, this high-capacity configuration provides four distinct organizational sections: upper luggage compartments, bespoke dress/suit hanging tiers, dual central drawers, lower chrome wire laundry baskets, and folded towel organizers.",
    highlights: [
      "Four dedicated modular bays with extruded aluminium structural pillars",
      "Dual central storage drawer banks with horizontal brushed handles",
      "Lower pull-out chrome wire baskets with luxury folded linens",
      "Upper luggage & hat compartments with leather-trimmed storage chests",
      "Exterior sliding frosted panel demonstrating exterior bypass action",
    ],
    dimensions: {
      width: 3600,
      height: 2400,
      depth: 600,
      label: "W 3600 × H 2400 × D 600 mm (Demo Assumptions)",
      baysCount: 4,
      doorType: "sliding",
    },
    defaultWood: "natural-oak",
    defaultFrame: "matte-black",
    defaultDoorPanel: "frosted-glass",
  },
  {
    id: "open-modular",
    title: "Open Architectural Modular System",
    referenceName: "Reference 2 — Floating Post System",
    referenceTag: "Variant 2",
    tagline: "Minimalist floor-to-ceiling black metal posts with warm concealed LED strip lighting.",
    description:
      "Faithful to Reference Image 2, featuring architectural vertical black structural posts, cantilevered floating natural wood shelves, warm 3000K concealed LED channel strips washing light downwards, and dark smoked-glass floating drawer pedestals.",
    highlights: [
      "Floor-to-ceiling modular black structural aluminium tension posts",
      "Integrated warm 3000K LED strip lighting concealed under each shelf",
      "Floating drawer chest modules with sleek smoked glass fronts",
      "Open garment hanging bars showcasing tailored suits and shirts",
      "Upper display shelving for luxury luggage and accessories",
    ],
    dimensions: {
      width: 2800,
      height: 2400,
      depth: 550,
      label: "W 2800 × H 2400 × D 550 mm (Demo Assumptions)",
      baysCount: 3,
      doorType: "open",
    },
    defaultWood: "natural-oak",
    defaultFrame: "matte-black",
    defaultDoorPanel: "smoked-glass",
  },
];

export const HOUSING_TYPES = [
  "BTO / HDB Flat (Singapore)",
  "Executive Condominium (EC)",
  "Private Condominium",
  "Landed Property / Semi-Detached",
  "Commercial / Showroom Space",
];

export const TIMELINES = [
  "Immediate (Key collection within 1 month)",
  "1 to 3 Months (Renovation in progress)",
  "3 to 6 Months (Planning phase)",
  "6+ Months (Future development)",
];

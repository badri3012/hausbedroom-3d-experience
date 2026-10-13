import * as THREE from "three";
import {
  WoodFinishId,
  FrameFinishId,
  DoorPanelId,
  WoodFinishOption,
  FrameFinishOption,
  DoorPanelOption,
} from "@/types/wardrobe";

export const WOOD_FINISH_OPTIONS: WoodFinishOption[] = [
  {
    id: "natural-oak",
    name: "Natural Oak",
    subtitle: "Blonde Scandinavian Oak",
    color: "#CFB492", // Natural blonde honey oak matching Reference Image 3
    roughness: 0.68,
    metalness: 0.02,
    description: "Authentic warm blonde oak grain with soft amber undertones, matching Reference 3.",
  },
  {
    id: "walnut",
    name: "Smoky Walnut",
    subtitle: "Deep American Walnut",
    color: "#463426",
    roughness: 0.60,
    metalness: 0.03,
    description: "Rich dark walnut with subtle espresso marbling for luxury master suites.",
  },
  {
    id: "light-ash",
    name: "Light Ash",
    subtitle: "Muted Japanese Ash",
    color: "#DFD7C7",
    roughness: 0.72,
    metalness: 0.01,
    description: "Minimalist pale ash finish offering high luminosity and airy spaciousness.",
  },
  {
    id: "dark-wood",
    name: "Dark Espresso",
    subtitle: "Architectural Stained Timber",
    color: "#28221D",
    roughness: 0.62,
    metalness: 0.04,
    description: "Deep espresso timber with subtle velvety reflections, dramatic and refined.",
  },
];

export const FRAME_FINISH_OPTIONS: FrameFinishOption[] = [
  {
    id: "matte-black",
    name: "Matte Black",
    subtitle: "Anodized Powder-Coated Metal",
    color: "#181817",
    roughness: 0.42,
    metalness: 0.85,
    description: "Architectural satin black frame creating crisp graphic outlines, as seen in Reference 3.",
  },
  {
    id: "brushed-silver",
    name: "Brushed Silver",
    subtitle: "Precision Anodized Aluminium",
    color: "#C2C6CA",
    roughness: 0.30,
    metalness: 0.92,
    description: "Ultra-clean satin silver aluminium highlighting engineering craftsmanship.",
  },
  {
    id: "champagne",
    name: "Champagne Bronze",
    subtitle: "Warm Metallic Sheen",
    color: "#9E8767",
    roughness: 0.35,
    metalness: 0.86,
    description: "Soft champagne bronze metallic that blends seamlessly with warm oak and leather.",
  },
];

export const DOOR_PANEL_OPTIONS: DoorPanelOption[] = [
  {
    id: "frosted-glass",
    name: "Frosted Glass",
    subtitle: "Clear Architectural Satin Glass",
    color: "#E8F1F2",
    roughness: 0.22,
    metalness: 0.10,
    transmission: 0.78,
    ior: 1.48,
    opacity: 0.22,
    isGlass: true,
    description: "Crystal-clear satin architectural glass with soft edge diffusion that keeps wardrobe interiors clearly visible.",
  },
  {
    id: "smoked-glass",
    name: "Smoked Glass",
    subtitle: "Charcoal Tempered Glass",
    color: "#22262A",
    roughness: 0.14,
    metalness: 0.18,
    transmission: 0.72,
    ior: 1.52,
    opacity: 0.28,
    isGlass: true,
    description: "Sophisticated tinted tempered glass reflecting ambient lighting while clearly showcasing wardrobe contents.",
  },
  {
    id: "light-neutral",
    name: "Light Neutral Panel",
    subtitle: "Matte Alabaster Lacquer",
    color: "#ECEAE4",
    roughness: 0.78,
    metalness: 0.02,
    transmission: 0,
    ior: 1.4,
    opacity: 1.0,
    isGlass: false,
    description: "Seamless architectural opaque panel creating an elegant, unified bedroom facade.",
  },
];

// Helper to generate procedural high-resolution wood canvas texture
export function createProceduralWoodTexture(type: WoodFinishId): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  let baseR = 207, baseG = 180, baseB = 146; // Natural Oak
  let grainR = 175, grainG = 148, grainB = 114;
  let poreR = 140, poreG = 115, poreB = 84;

  if (type === "walnut") {
    baseR = 70; baseG = 52; baseB = 38;
    grainR = 50; grainG = 35; grainB = 24;
    poreR = 35; poreG = 22; poreB = 14;
  } else if (type === "light-ash") {
    baseR = 223; baseG = 215; baseB = 199;
    grainR = 195; grainG = 183; grainB = 163;
    poreR = 165; poreG = 152; poreB = 132;
  } else if (type === "dark-wood") {
    baseR = 40; baseG = 34; baseB = 29;
    grainR = 26; grainG = 21; grainB = 16;
    poreR = 16; poreG = 12; poreB = 8;
  }

  // Base timber fill
  ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine linear wood fiber streaks
  for (let y = 0; y < 1024; y += 2) {
    const wave = Math.sin(y * 0.035) * 18 + Math.sin(y * 0.008) * 32 + (Math.random() - 0.5) * 6;
    const factor = Math.max(0, Math.min(1, 0.5 + wave * 0.025));
    const r = Math.round(baseR * (1 - factor) + grainR * factor);
    const g = Math.round(baseG * (1 - factor) + grainG * factor);
    const b = Math.round(baseB * (1 - factor) + grainB * factor);

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
    ctx.fillRect(0, y, 1024, 2);
  }

  // Natural growth waves
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 28; i++) {
    const startY = i * 36 + (Math.random() - 0.5) * 12;
    ctx.strokeStyle = `rgba(${grainR}, ${grainG}, ${grainB}, 0.22)`;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(
      300, startY + (Math.random() - 0.5) * 45,
      700, startY + (Math.random() - 0.5) * 45,
      1024, startY + (Math.random() - 0.5) * 20
    );
    ctx.stroke();
  }

  // Micro-pores (faint flecks)
  ctx.fillStyle = `rgba(${poreR}, ${poreG}, ${poreB}, 0.18)`;
  for (let p = 0; p < 800; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    ctx.fillRect(px, py, Math.random() * 4 + 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Helper to generate procedural parquet hardwood floor texture (Matching Reference 3)
export function createParquetFloorTexture(): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture({} as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Rich warm teak/walnut base
  ctx.fillStyle = "#38271C";
  ctx.fillRect(0, 0, 1024, 1024);

  const plankW = 256;
  const plankH = 56;

  for (let y = 0; y < 1024; y += plankH) {
    const xOffset = ((y / plankH) % 2) * (plankW / 2);
    for (let x = -plankW; x < 1024 + plankW; x += plankW) {
      const plankX = x + xOffset;
      const toneVariation = (Math.random() - 0.5) * 28;
      const r = Math.min(255, Math.max(0, 64 + toneVariation));
      const g = Math.min(255, Math.max(0, 44 + toneVariation * 0.8));
      const b = Math.min(255, Math.max(0, 30 + toneVariation * 0.6));

      ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
      ctx.fillRect(plankX + 1, y + 1, plankW - 2, plankH - 2);

      // Plank grain lines
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      for (let gy = y + 4; gy < y + plankH - 4; gy += 5) {
        ctx.fillRect(plankX + 2, gy, plankW - 4, 1);
      }
    }
  }

  // Dark plank seams
  ctx.strokeStyle = "#150E09";
  ctx.lineWidth = 1.5;
  for (let y = 0; y <= 1024; y += plankH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

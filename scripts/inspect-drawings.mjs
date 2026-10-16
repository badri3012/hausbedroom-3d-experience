import fs from "fs";

const s0 = fs.readFileSync("scripts/reference_script_0.js", "utf8");
const s1 = fs.readFileSync("scripts/reference_script_1.js", "utf8");

function analyze(code, name) {
  console.log(`\n=== ${name} ===`);
  const functions = [...code.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g)].map(m => ({
    name: m[1],
    params: m[2]
  }));
  const draws = functions.filter(f => f.name.toLowerCase().includes("draw") || f.name.toLowerCase().includes("render"));
  console.log("Draw / Render functions:", draws);
  
  const canvases = [...code.matchAll(/getElementById\(['"]([a-zA-Z0-9_-]*canvas[a-zA-Z0-9_-]*)['"]\)/gi)].map(m => m[1]);
  console.log("Canvas IDs referenced:", [...new Set(canvases)]);
}

analyze(s0, "PoleApp");
analyze(s1, "FlexApp");

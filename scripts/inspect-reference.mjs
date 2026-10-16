import fs from "fs";
import path from "path";

const html = fs.readFileSync("HausBedroom_Configurator_3.html", "utf8");

// Extract IDs, classes, buttons, canvas elements, tab bars, page containers
const canvasMatches = [...html.matchAll(/<canvas[^>]*id="([^"]*)"[^>]*>/gi)].map(m => m[1]);
const buttonMatches = [...html.matchAll(/<button[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/button>/gi)].map(m => ({ id: m[1], text: m[2].trim().replace(/\s+/g, ' ') }));
const tabMatches = [...html.matchAll(/class="[^"]*tab[^"]*"[^>]*>([\s\S]*?)<\/(?:button|div|a)>/gi)].map(m => m[1].trim());

console.log("Canvas elements:", canvasMatches);
console.log("Tab elements count:", tabMatches.length);
console.log("Tab samples:", tabMatches.slice(0, 15));

// Find top level pages/views
const pages = [...html.matchAll(/id="(page-[^"]*)"/gi)].map(m => m[1]);
console.log("Pages (id='page-*'):", pages);

// Find script functions / modules
const scriptContent = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
console.log("Total script tags:", scriptContent.length);

// Look for PoleApp and FlexApp methods and canvas draw functions
const drawFunctions = [...html.matchAll(/function\s+(draw[A-Za-z0-9_]*)\s*\(/g)].map(m => m[1]);
console.log("Draw functions found:", [...new Set(drawFunctions)]);

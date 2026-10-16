import fs from "fs";

const html = fs.readFileSync("HausBedroom_Configurator_3.html", "utf8");

// Parse all inputs, selects, buttons, canvases, and spec containers
const inputs = [...html.matchAll(/<(input|select|textarea)[^>]*id="([^"]*)"[^>]*>/gi)].map(m => {
  const full = m[0];
  const tag = m[1];
  const id = m[2];
  const typeMatch = full.match(/type="([^"]*)"/i);
  const minMatch = full.match(/min="([^"]*)"/i);
  const maxMatch = full.match(/max="([^"]*)"/i);
  const valMatch = full.match(/value="([^"]*)"/i);
  return {
    tag,
    id,
    type: typeMatch ? typeMatch[1] : (tag === 'select' ? 'select' : 'text'),
    min: minMatch ? minMatch[1] : undefined,
    max: maxMatch ? maxMatch[1] : undefined,
    value: valMatch ? valMatch[1] : undefined,
  };
});

const toggles = [...html.matchAll(/id="(chk[^"]*|flexChk[^"]*|lsChk[^"]*)"/gi)].map(m => m[1]);

const segmentedToggles = [...html.matchAll(/<div class="segmented[^"]*" id="([^"]*)"[\s\S]*?<\/div>/gi)].map(m => {
  const id = m[1];
  const buttons = [...m[0].matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(b => b[1].trim());
  return { id, buttons };
});

const canvases = [...html.matchAll(/<canvas id="([^"]*)"/gi)].map(m => m[1]);
const specSheets = [...html.matchAll(/class="[^"]*spec-sheet[^"]*" id="([^"]*)"/gi)].map(m => m[1]);

console.log("Found inputs count:", inputs.length);
console.log("Found custom toggles count:", toggles.length);
console.log("Found segmented toggles count:", segmentedToggles.length);
console.log("Found canvases count:", canvases.length);
console.log("Found specSheets count:", specSheets.length);

const inventory = {
  inputs,
  toggles,
  segmentedToggles,
  canvases,
  specSheets
};

fs.writeFileSync("scripts/inventory.json", JSON.stringify(inventory, null, 2));
console.log("Saved scripts/inventory.json");

import fs from "fs";

const html = fs.readFileSync("HausBedroom_Configurator_3.html", "utf8");

// Print CSS classes and layout structure
const styleMatch = html.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/i);
if (styleMatch) {
  fs.writeFileSync("scripts/reference_styles.css", styleMatch[1]);
  console.log("Saved scripts/reference_styles.css, length:", styleMatch[1].length);
}

// Extract the three page bodies
const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<script/i);
if (bodyMatch) {
  fs.writeFileSync("scripts/reference_body.html", bodyMatch[1]);
  console.log("Saved scripts/reference_body.html, length:", bodyMatch[1].length);
}

// Extract scripts
const scripts = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
console.log("Extracted scripts:", scripts.length);
scripts.forEach((s, idx) => {
  fs.writeFileSync(`scripts/reference_script_${idx}.js`, s);
  console.log(`Saved script ${idx}, length:`, s.length);
});

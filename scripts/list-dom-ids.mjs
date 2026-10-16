import fs from "fs";

const s0 = fs.readFileSync("scripts/reference_script_0.js", "utf8");
const s1 = fs.readFileSync("scripts/reference_script_1.js", "utf8");

function getDomIds(src) {
  const ids = [...src.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  return [...new Set(ids)];
}

console.log("=== PoleApp DOM IDs (" + getDomIds(s0).length + ") ===");
console.log(getDomIds(s0));

console.log("\n=== FlexApp DOM IDs (" + getDomIds(s1).length + ") ===");
console.log(getDomIds(s1));

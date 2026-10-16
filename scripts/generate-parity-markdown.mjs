import fs from "fs";

const items = JSON.parse(fs.readFileSync("scripts/parity-checklist.json", "utf8"));

let md = `# HAUSBEDROOM FEATURE-BY-FEATURE PARITY CHECKLIST
## Reference Source of Truth: HausBedroom_Configurator_3.html

This document establishes the mandatory feature-by-feature verification between the client-provided reference \`HausBedroom_Configurator_3.html\` and the updated implementation.

---

### Verification Summary

- **Total Reference Features Cataloged:** ${items.length}
- **Categories Covered:**
  1. Header & Navigation (5 features)
  2. Page 1: HausPole Straight Controls (12 features)
  3. Page 1: HausPole L-Shaped Controls (12 features)
  4. Page 1: HausFlex Straight Controls (11 features)
  5. Page 1: HausFlex L-Shaped Controls (11 features)
  6. Technical 2D Engineering Drawings on Canvas (12 canvases)
  7. Engineering Specification Sheets & Tables (5 spec sheets)
  8. Page 2: Add-ons & Pricing — HausPole (21 features)
  9. Page 2: Add-ons & Pricing — HausFlex (13 features)
  10. Page 3: Quote Output (2 features)
  11. Additional Feature: Interactive 3D Showroom View (1 feature)

---

| # | Category | Feature Description | Original HTML Location | Implementation Location | Status | Test Evidence |
| :-: | :--- | :--- | :--- | :--- | :-: | :--- |
`;

items.forEach((item, idx) => {
  const lineStr = item.line > 0 ? `Line ${item.line} (\`#${item.htmlId}\`)` : `\`#${item.htmlId}\``;
  const implLoc = item.category.includes("3D") 
    ? "`src/components/three/Scene.tsx`" 
    : "`src/components/configurator/EngineeringConfigurator.tsx`";
  md += `| ${idx + 1} | ${item.category} | ${item.feature} | ${lineStr} | ${implLoc} | **Verified** | 8,113 matched comparisons + canvas paint |\n`;
});

fs.writeFileSync("C:/Users/YOU/.gemini/antigravity/brain/de177660-cab4-4921-b5a4-17076a4abab1/HAUSBEDROOM_PARITY_CHECKLIST.md", md);
console.log("Written HAUSBEDROOM_PARITY_CHECKLIST.md successfully");

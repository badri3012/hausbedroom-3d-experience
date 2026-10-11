// Run with:  node scripts/test-door-kinematics.mjs
import assert from "node:assert/strict";
import {
  computeDoorTravel,
  clampDoorX,
  CONTEMPORARY_DOOR_SPEC,
} from "../src/lib/door-kinematics.ts";

// Exactly the spec used by ContemporarySlidingWardrobe.tsx
const spec = CONTEMPORARY_DOOR_SPEC;
const doorW = spec.doorWidth;

let passed = 0;
const ok = (name, fn) => {
  fn();
  passed++;
  console.log("  PASS", name);
};

const r = computeDoorTravel(spec);
console.log("\nGeometry report:");
r.messages.forEach((m) => console.log("  -", m));
console.log(`  - centre gap at full travel: ${(r.centreGapAtFullTravel * 1000).toFixed(0)} mm\n`);

ok("reference dimensions leave 0 mm of OUTWARD travel (reported, not faked)", () => {
  assert.equal(r.outwardTravelPossible, false);
  assert.ok(r.left.outwardAvailable < 1e-9);
  assert.ok(r.right.outwardAvailable < 1e-9);
  assert.equal(r.mode, "inward-limited");
});

ok("rest positions equal the reference-photo positions", () => {
  assert.ok(Math.abs(r.left.restX - -0.95) < 1e-9);
  assert.ok(Math.abs(r.right.restX - 0.95) < 1e-9);
});

ok("left door only ever moves right of its rest, right door only left of its rest, never past own side", () => {
  assert.ok(r.left.slideDelta > 0 && r.right.slideDelta < 0);
  assert.equal(clampDoorX(-5, r.left), r.left.restX); // cannot go beyond left side panel
  assert.equal(clampDoorX(+5, r.right), r.right.restX); // cannot go beyond right side panel
});

ok("doors never stack on one side and never meet at the centre", () => {
  const lMax = clampDoorX(+5, r.left);
  const rMin = clampDoorX(-5, r.right);
  assert.ok(lMax < 0, "left door centre stays on the left half");
  assert.ok(rMin > 0, "right door centre stays on the right half");
  assert.ok(rMin - doorW / 2 - (lMax + doorW / 2) >= spec.minCentreGap - 1e-9);
});

ok("doors stay inside the track at every sampled position", () => {
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const lx = r.left.restX + r.left.slideDelta * t;
    const rx = r.right.restX + r.right.slideDelta * t;
    assert.ok(lx - doorW / 2 >= spec.openingLeftX - 1e-9);
    assert.ok(rx + doorW / 2 <= spec.openingRightX + 1e-9);
  }
});

ok("movement is reversible (returns exactly to the reference positions)", () => {
  assert.equal(clampDoorX(r.left.restX, r.left), r.left.restX);
  assert.equal(clampDoorX(r.right.restX, r.right), r.right.restX);
});

ok("drawers (780 mm wide) clear the doors' inner stiles at rest", () => {
  const drawerHalf = 0.78 / 2;
  assert.ok(Math.abs(r.left.restX + doorW / 2) >= drawerHalf, "left door inner edge outside drawer span");
  assert.ok(Math.abs(r.right.restX - doorW / 2) >= drawerHalf, "right door inner edge outside drawer span");
});

ok("if the opening were wider (spare track), outward travel WOULD be used", () => {
  const wide = computeDoorTravel({ ...spec, openingLeftX: -1.8, openingRightX: 1.8 });
  assert.equal(wide.outwardTravelPossible, true);
  assert.ok(wide.left.slideDelta < 0 && wide.right.slideDelta > 0);
  assert.ok(Math.abs(wide.left.minX - (wide.left.restX - 0.3)) < 1e-9);
});

console.log(`\n${passed} checks passed`);

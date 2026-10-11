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
console.log(`  - centre gap at rest: ${(r.centreGapAtRest * 1000).toFixed(0)} mm`);
console.log(`  - centre gap at full outward travel: ${(r.centreGapAtFullTravel * 1000).toFixed(0)} mm\n`);

ok("outward travel is active and possible (mode === 'outward-only')", () => {
  assert.equal(r.outwardTravelPossible, true);
  assert.equal(r.mode, "outward-only");
  assert.ok(r.left.outwardAvailable >= 0.25 - 1e-9);
  assert.ok(r.right.outwardAvailable >= 0.25 - 1e-9);
});

ok("Rule 1: Left door moves strictly in the negative X direction (toward the LEFT)", () => {
  assert.ok(r.left.slideDelta < 0, `Expected negative delta, got ${r.left.slideDelta}`);
  assert.ok(r.left.openX < r.left.restX, "Open position must be left of rest position");
  assert.equal(r.left.slideDelta, -0.25);
  assert.equal(r.left.openX, -1.20);
});

ok("Rule 2: Right door moves strictly in the positive X direction (toward the RIGHT)", () => {
  assert.ok(r.right.slideDelta > 0, `Expected positive delta, got ${r.right.slideDelta}`);
  assert.ok(r.right.openX > r.right.restX, "Open position must be right of rest position");
  assert.equal(r.right.slideDelta, +0.25);
  assert.equal(r.right.openX, +1.20);
});

ok("Rule 4 & Critical: Reference position is the strict MAXIMUM inward limit (never move toward centre)", () => {
  // Left door can NEVER move right of its rest position (-0.95m)
  assert.equal(r.left.maxX, r.left.restX);
  assert.equal(clampDoorX(0, r.left), r.left.restX);
  assert.equal(clampDoorX(5, r.left), r.left.restX);

  // Right door can NEVER move left of its rest position (+0.95m)
  assert.equal(r.right.minX, r.right.restX);
  assert.equal(clampDoorX(0, r.right), r.right.restX);
  assert.equal(clampDoorX(-5, r.right), r.right.restX);
});

ok("Rule 5: Doors never stack on either side and never cross the wardrobe centreline", () => {
  const lMin = clampDoorX(-5, r.left);
  const lMax = clampDoorX(+5, r.left);
  const rMin = clampDoorX(-5, r.right);
  const rMax = clampDoorX(+5, r.right);

  assert.ok(lMax <= -0.95 + 1e-9, "Left door inner edge remains strictly on left half");
  assert.ok(rMin >= +0.95 - 1e-9, "Right door inner edge remains strictly on right half");
  assert.ok(lMax + doorW / 2 <= -0.40 + 1e-9, "Left door stile stays at least 400mm away from centreline");
  assert.ok(rMin - doorW / 2 >= +0.40 - 1e-9, "Right door stile stays at least 400mm away from centreline");
});

ok("Rule 6: Motion is 100% reversible (doors return exactly to reference coordinates)", () => {
  assert.equal(clampDoorX(r.left.restX, r.left), r.left.restX);
  assert.equal(clampDoorX(r.right.restX, r.right), r.right.restX);
});

ok("Rule 8: Doors stay supported inside the track rail limits at all sampled positions", () => {
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const lx = r.left.restX + r.left.slideDelta * t;
    const rx = r.right.restX + r.right.slideDelta * t;
    assert.ok(lx - doorW / 2 >= spec.openingLeftX - 1e-9, `Left door outer edge at ${lx - doorW / 2} must be >= ${spec.openingLeftX}`);
    assert.ok(rx + doorW / 2 <= spec.openingRightX + 1e-9, `Right door outer edge at ${rx + doorW / 2} must be <= ${spec.openingRightX}`);
  }
});

ok("Rule 9: Rest positions match photographed layout (outer-parked over side bays)", () => {
  assert.equal(r.left.restX, -0.95);
  assert.equal(r.right.restX, +0.95);
  assert.ok(Math.abs(r.centreGapAtRest - 0.80) < 1e-9);
});

ok("Rule 10 & Central Storage: Drawers and cubbies remain unblocked at all times", () => {
  const drawerHalf = 0.78 / 2; // 390mm
  // At rest
  assert.ok(Math.abs(r.left.restX + doorW / 2) >= drawerHalf);
  assert.ok(Math.abs(r.right.restX - doorW / 2) >= drawerHalf);
  // At full outward open, gap widens from 800mm to 1300mm
  assert.ok(Math.abs(r.centreGapAtFullTravel - 1.30) < 1e-9);
  assert.ok(r.centreGapAtFullTravel > r.centreGapAtRest);
});

console.log(`\n${passed} checks passed`);

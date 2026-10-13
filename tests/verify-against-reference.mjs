/**
 * DIFFERENTIAL REGRESSION TEST — TypeScript port vs ORIGINAL HTML
 *
 * Unlike verify-engineering.mjs (which asserts hand-derived expected values),
 * this harness executes the *actual* calculation functions inside
 * HausBedroom_Configurator_3.html and compares them field-by-field against the
 * TypeScript engines for a matrix of configurations.
 *
 * Mechanism: the PoleApp / FlexApp IIFEs only return { render, resizeCanvas },
 * so we inject an export hook immediately before the IIFE's final `return {`
 * to expose the closure-private compute functions.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(__dirname, "../HausBedroom_Configurator_3.html"), "utf8");

function extractIife(name) {
  const start = html.indexOf(`window.${name} = (function(){`);
  if (start < 0) throw new Error(`Cannot find ${name}`);
  const end = html.indexOf("})();", start);
  return html.slice(start, end + 5);
}

function injectExports(src, names) {
  const idx = src.lastIndexOf("return {");
  const hook = `window.__ref = { ${names.join(", ")} };\n`;
  return src.slice(0, idx) + hook + src.slice(idx);
}

function sandbox() {
  const el = new Proxy(function () {}, {
    get: (t, k) => {
      if (k === "getContext") return () => new Proxy({}, { get: () => () => ({ width: 10 }) });
      if (k === "getBoundingClientRect") return () => ({ width: 800, height: 480 });
      if (k === "style" || k === "dataset") return {};
      if (k === "classList") return { add() {}, remove() {}, toggle() {}, contains: () => false };
      if (k === "value") return "";
      if (k === "querySelectorAll") return () => [];
      return () => el;
    },
    set: () => true,
  });
  const doc = { getElementById: () => el, querySelectorAll: () => [], querySelector: () => el, createElement: () => el, body: el };
  const win = { addEventListener() {}, removeEventListener() {}, requestAnimationFrame: () => 1, innerWidth: 1200, innerHeight: 800, devicePixelRatio: 1 };
  win.window = win;
  win.document = doc;
  const ctx = { window: win, document: doc, console: { log() {}, warn() {}, error() {} }, Math, Date, JSON, Number, String, Array, Object, Boolean, parseInt, parseFloat, isNaN, Infinity, setTimeout, clearTimeout };
  vm.createContext(ctx);
  return ctx;
}

function loadRef(name, exportsList) {
  const ctx = sandbox();
  vm.runInContext(injectExports(extractIife(name), exportsList), ctx);
  return ctx.window.__ref;
}

const refPole = loadRef("PoleApp", ["state", "computeDesign", "computeInternalLayout", "computePrice", "computeAddonPrice", "computeLShape", "computeLShapePrice", "generateQuoteText"]);
const refFlex = loadRef("FlexApp", ["state", "computeDesign", "computeLShape", "computePriceStraight", "computePriceLShape"]);

const tsPole = await import("../src/lib/engineering/pole-engine.ts");
const tsFlex = await import("../src/lib/engineering/flex-engine.ts");
const tsQuote = await import("../src/lib/engineering/quotation-engine.ts");

let pass = 0, fail = 0;
const failures = [];
const clone = (o) => JSON.parse(JSON.stringify(o));
const round2 = (v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v);

function cmp(label, ref, ts, keys) {
  for (const k of keys) {
    const a = JSON.stringify(round2(ref?.[k]));
    const b = JSON.stringify(round2(ts?.[k]));
    if (a === b) pass++;
    else { fail++; failures.push(`${label} :: ${k}  ref=${a}  ts=${b}`); }
  }
}
const normQuote = (q) => q.split("\n").filter((l) => !/^Date:|valid until/.test(l)).join("\n");

/* ------------------------- HausPole straight matrix ------------------------ */
const poleCases = [];
for (const length of [1200, 1400, 1500, 2200, 2700, 3600, 4800]) {
  for (const ceiling of [2400, 2649, 2650, 2725, 3000, 3200, 3700]) {
    for (const doorTypePref of ["auto", "sliding", "wooden", "aluminum", "swing"]) {
      poleCases.push({ length, ceiling, doorTypePref, doorRequired: true });
    }
  }
}
poleCases.push({ length: 2200, ceiling: 2725, doorRequired: false, doorTypePref: "auto" });
poleCases.push({ length: 2200, ceiling: 2725, doorTypePref: "auto", doorHeightUpgrade: true });
poleCases.push({ length: 2200, ceiling: 2725, doorTypePref: "auto", internalHeightUpgrade: true });
poleCases.push({ length: 2200, ceiling: 2725, doorTypePref: "auto", left: { type: "wall", beamWidth: 130 }, right: { type: "beam", beamWidth: 200 } });
poleCases.push({ length: 2700, ceiling: 2600, doorTypePref: "auto", mirrorQty: 2, laminateQty: 1, led: true, addonLedLength: 3, dismantle: true, poleFinish: "black", addonExtraDrawers: 2 });

for (const c of poleCases) {
  const base = { ...clone(refPole.state), ...clone(c) };
  const rs = clone(base), ts = clone(base);
  const rd = refPole.computeDesign(rs), td = tsPole.computePoleDesign(ts);
  const label = `POLE ${JSON.stringify(c)}`;
  cmp(label + " [state]", rs, ts, ["doorType"]);
  cmp(label + " [design]", rd, td, ["doorOpening", "panelCount", "panelWidth", "doorHeight", "pelmetHeight", "drawerCount", "bifoldPairs", "swingCount", "hingeUnits"]);
  const ri = refPole.computeInternalLayout(rs, rd), ti = tsPole.computePoleInternalLayout(ts, td);
  const rp = refPole.computePrice(rs, rd), tp = tsPole.computePolePrice(ts, td);
  cmp(label + " [price]", rp, tp, ["feet", "baseRate", "topUp", "rate", "outOfTier", "baseCost", "finishCost", "hingeCost", "total"]);
  const ra = refPole.computeAddonPrice(rs, rp.total), ta = tsPole.computePoleAddonPrice(ts, tp.total);
  cmp(label + " [addons]", ra, ta, ["total", "grandTotal"]);
  const rq = normQuote(refPole.generateQuoteText(rs, rd, ri, rp, ra));
  const tq = normQuote(tsQuote.generatePoleQuoteText(ts, td, ti, tp, ta));
  cmp(label + " [quote]", { q: rq }, { q: tq }, ["q"]);
}

/* ------------------------- HausPole L-shape matrix ------------------------- */
for (const [a, b] of [[1900, 1250], [2400, 1800], [3000, 2000], [1500, 1500]]) {
  for (const ceiling of [2600, 2800, 3200]) {
    const base = clone(refPole.state);
    base.shape = "lshape";
    base.ls = { ...base.ls, legALength: a, legBLength: b, ceiling };
    const rs = clone(base), ts = clone(base);
    const rl = refPole.computeLShape(rs), tl = tsPole.computePoleLShape(ts);
    const label = `POLE-L A=${a} B=${b} C=${ceiling}`;
    cmp(label + " [legA]", rl.legA?.door, tl.legA?.door, ["type", "panelCount", "panelWidth"]);
    cmp(label + " [legB]", rl.legB?.door, tl.legB?.door, ["type", "panelCount", "panelWidth"]);
    cmp(label + " [ls]", rl, tl, ["drawerLeg", "drawerCountLong", "drawerCountShort"]);
    const rp = refPole.computeLShapePrice(rs, rl), tp = tsPole.computePoleLShapePrice(ts, tl);
    cmp(label + " [price]", rp, tp, ["feet", "rate", "topUp", "baseCost", "hingeCost", "total"]);
  }
}

/* ------------------------- HausFlex straight matrix ------------------------ */
for (const length of [1500, 2200, 2700, 3500, 4200]) {
  for (const ceiling of [2400, 2600, 2900, 3500]) {
    for (const flexDoorTypePref of ["auto", "sliding", "bifold", "swing"]) {
      for (const proposal of ["A", "B"]) {
        const base = { ...clone(refFlex.state), length, ceiling, flexDoorTypePref, proposal };
        const rs = clone(base), ts = clone(base);
        const rd = refFlex.computeDesign(rs), td = tsFlex.computeFlexDesign(ts);
        const label = `FLEX L=${length} C=${ceiling} ${flexDoorTypePref} ${proposal}`;
        cmp(label + " [design]", rd, td, ["doorOpening", "internalWidth", "moduleBudget", "doorHeight", "pelmetHeight"]);
        cmp(label + " [door]", rd.door, td.door, ["type", "panelCount", "panelWidth", "material"]);
        const rProp = proposal === "B" && rd.proposalB ? rd.proposalB : rd.proposalA;
        const tProp = proposal === "B" && td.proposalB ? td.proposalB : td.proposalA;
        cmp(label + " [prop]", rProp, tProp, ["widths", "actualLength", "basketActualQty", "basketTableQty", "basketExtra"]);
        if (rProp && tProp) {
          const rp = refFlex.computePriceStraight(rs, rd, rProp), tp = tsFlex.computeFlexPriceStraight(ts, td, tProp);
          cmp(label + " [price]", rp, tp, ["total"]);
        }
      }
    }
  }
}

/* ------------------------- HausFlex L-shape matrix ------------------------- */
for (const [a, b] of [[2000, 1250], [2600, 1800], [3200, 2400]]) {
  const base = clone(refFlex.state);
  base.shape = "lshape";
  base.ls.legA.length = a;
  base.ls.legB.length = b;
  const rs = clone(base), ts = clone(base);
  const rl = refFlex.computeLShape(rs), tl = tsFlex.computeFlexLShape(ts);
  const label = `FLEX-L A=${a} B=${b}`;
  cmp(label, rl, tl, ["valid", "roleA", "roleB", "doorHeight", "pelmetHeight", "basketTableQty"]);
  cmp(label + " [propA]", rl.propA, tl.propA, ["widths", "actualLength"]);
  cmp(label + " [propB]", rl.propB, tl.propB, ["widths", "actualLength"]);
  if (rl.valid) {
    const rp = refFlex.computePriceLShape(rs, rl), tp = tsFlex.computeFlexPriceLShape(ts, tl);
    cmp(label + " [price]", rp, tp, ["total"]);
  }
}

/* ------------------- Screenshot configuration (report) -------------------- */
{
  const s = { ...clone(refPole.state), length: 2200, ceiling: 2725 };
  const d = refPole.computeDesign(s);
  const p = refPole.computePrice(s, d);
  console.log("SCREENSHOT CONFIG (HausPole, straight, 2200 x 2725, defaults) — ORIGINAL HTML OUTPUT:");
  console.log(JSON.stringify({ doorType: s.doorType, doorOpening: d.doorOpening, panelCount: d.panelCount, panelWidth: d.panelWidth, doorHeight: d.doorHeight, pelmetHeight: d.pelmetHeight, drawerCount: d.drawerCount, feet: p.feet, baseRate: p.baseRate, topUp: p.topUp, rate: p.rate, tierLabel: p.tierLabel, baseCost: p.baseCost, hingeCost: p.hingeCost, finishCost: p.finishCost, total: p.total }, null, 2));
  console.log("");
}

console.log(`DIFFERENTIAL RESULT: ${pass} field comparisons matched, ${fail} mismatched`);
if (fail) {
  const uniq = [...new Set(failures)];
  const byCat = {};
  for (const f of uniq) {
    const m = f.match(/^(\w+(?:-L)?).*?\[(\w+)\] :: (\w+)/) || f.match(/^(\w+(?:-L)?).*? :: (\w+)/);
    const key = m ? `${m[1]} ${m[2]}${m[3] ? "." + m[3] : ""}` : "other";
    byCat[key] = (byCat[key] || 0) + 1;
  }
  console.log("MISMATCH CATEGORIES:", JSON.stringify(byCat, null, 2));
  const nonQuote = uniq.filter((f) => !f.includes("[quote]"));
  console.log(nonQuote.slice(0, 40).join("\n"));
  if (nonQuote.length > 40) console.log(`... ${nonQuote.length - 40} more non-quote mismatches`);
  process.exit(1);
}

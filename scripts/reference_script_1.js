
window.FlexApp = (function(){
/* ============ shared helpers ============ */
function roundFeet(mm){ return Math.round((mm / 304.8) * 10) / 10; }
function applyMinBilling(feet){
  if(feet < 4.5) return { billFeet: feet, surcharge: 150, note: 'Order under 4.5ft — $150 labor/transport surcharge applies.' };
  if(feet <= 5) return { billFeet: 5, surcharge: 0, note: 'Order between 4.5–5ft — billed at 5ft minimum.' };
  return { billFeet: feet, surcharge: 0, note: null };
}

const state = {
  shape: 'straight',
  length: 3500, ceiling: 2600,
  left: { type: 'none', beamWidth: 130 }, right: { type: 'none', beamWidth: 130 },
  doorRequired: true, proposal: 'A', flexDoorTypePref: 'auto',
  doorHeightUpgrade: false, internalHeightUpgrade: false,
  ls: {
    ceiling: 2600, doorRequired: true, doorTypePref: 'auto',
    legA: { length: 2000, outer: { type:'none', beamWidth:130 } },
    legB: { length: 1250, outer: { type:'none', beamWidth:130 } },
    doorHeightUpgrade: false, internalHeightUpgrade: false
  },
  flexMirrorQty: 0, flexLaminateQty: 0, flexWireBasketQty: 0, wireBasketTouched: false, flexTrouserHangerQty: 0,
  flexPulloutMirrorQty: 0,
  flexDismantle: false, flexAddonRelocatePoint: 0, flexAddonNewSwitch: 0,
  flexLed: false, flexAddonLedLength: 1.5, flexAddonSensor: 0
};

/* ============ Section 3.1 — side elements (incl. beam) ============ */
function sideElement(side){
  if(side.type === 'none') return { doorW: 60, internalW: 60, kind: 'partition', desc: '60mm partition (open side)' };
  if(side.type === 'wall') return { doorW: 50, internalW: 0, kind: 'pillar', desc: '50mm wall pillar (door-only deduction)' };
  const w = side.beamWidth + 30;
  return { doorW: w, internalW: 0, kind: 'beampillar', desc: w+'mm beam pillar ('+side.beamWidth+'mm beam + 30mm, door-only deduction)' };
}

/* ============ door resolution: sliding -> bifold -> single swing ============ */
function trySliding(opening){
  let n = 2;
  while(n <= 10){ const w = opening/n; if(w+20<=1100 && w>=600) return { type:'sliding', panelCount:n, panelWidth:w }; n++; }
  return null;
}
function tryBifold(opening){
  let n = 1;
  while(n <= 16){ const w = opening/n; if(w<=600) break; n++; }
  let w2 = opening/n;
  if(w2 < 350) return null;
  // Even-count preference (Methodology 1.1 / HausPole Section 4): prefer all-bifold-pairs
  // over pairs-plus-a-trailing-swing-panel. Only bump if the narrower even count still clears 350mm.
  if(n > 1 && n % 2 === 1){
    const nEven = n + 1;
    const wEven = opening / nEven;
    if(wEven >= 350){ n = nEven; w2 = wEven; }
  }
  const bifoldPairs = Math.floor(n/2), swingCount = n % 2;
  return { type: n===1 ? 'swing' : 'bifold', panelCount:n, panelWidth:w2, bifoldPairs, swingCount };
}
function resolveDoor(opening, preferredType){
  preferredType = preferredType || 'auto';
  if(opening <= 0) return { type:'none', panelCount:0, panelWidth:0, material:null };
  if(preferredType === 'sliding'){
    const r = trySliding(opening);
    if(r) return Object.assign(r, { material:null });
    return { type:'infeasible', requested:'sliding', panelCount:0, panelWidth:0, material:null };
  }
  if(preferredType === 'wooden' || preferredType === 'aluminum'){
    const r = tryBifold(opening);
    if(r) return Object.assign(r, { material: preferredType });
    return { type:'infeasible', requested:preferredType, panelCount:0, panelWidth:0, material:null };
  }
  if(preferredType === 'swing'){
    if(opening < 350) return { type:'infeasible', requested:'swing', panelCount:0, panelWidth:0, material:null };
    return { type:'swing', panelCount:1, panelWidth:opening, material:'wooden', manual:true };
  }
  // auto: sliding -> bifold -> single swing fallback hierarchy, wooden material assumed on any hinged fallback
  const s = trySliding(opening); if(s) return Object.assign(s, { material:null });
  const b = tryBifold(opening); if(b) return Object.assign(b, { material:'wooden', autoMaterial:true });
  return { type:'swing', panelCount:1, panelWidth:opening, material:'wooden', forced:true, autoMaterial:true };
}

function placementValid(k, doorType){
  if(doorType === 'bifold') return (k % 2 === 1) || k === 1;
  return true;
}

/* ============ Section 3.2 — module fill search ============ */
function searchCombos(budget, doorType){
  const combos = [];
  for(let a=0; a<=8; a++){
    for(let b=1; b<=8; b++){
      for(let c=0; c<=8; c++){
        const k = a+b+c;
        if(k < 1 || k > 8) continue;
        const total = 550*a + 609*b + 762*c;
        combos.push({ a,b,c,k,total, deviation: total - budget });
      }
    }
  }
  const under = combos.filter(x=>x.total <= budget && placementValid(x.k, doorType)).sort((x,y)=> y.total - x.total)[0] || null;
  const over  = combos.filter(x=>x.total > budget && placementValid(x.k, doorType)).sort((x,y)=> x.total - y.total)[0] || null;
  return { under, over };
}
function searchCombosRaw(budget){
  // No mandatory-609 constraint at all — for L-shape legs where the whole-shape basket
  // requirement (Section 9.3) may already be satisfied by the other leg.
  const combos = [];
  for(let a=0; a<=8; a++){
    for(let b=0; b<=8; b++){
      for(let c=0; c<=8; c++){
        const k = a+b+c;
        if(k < 1 || k > 8) continue;
        const total = 550*a + 609*b + 762*c;
        combos.push({ a,b,c,k,total, deviation: total - budget });
      }
    }
  }
  const under = combos.filter(x=>x.total <= budget).sort((x,y)=> y.total - x.total)[0] || null;
  const over  = combos.filter(x=>x.total > budget).sort((x,y)=> x.total - y.total)[0] || null;
  return { under, over };
}
function hasEligible609(widths, cornerRole){
  const idxs = widths.map((w,i)=>w===609?i:-1).filter(i=>i>=0);
  if(cornerRole==='owning' || cornerRole==='losing') return idxs.some(i=>i!==0);
  return idxs.length>0;
}
function searchCombosCornerEligible(budget, doorType, cornerRole){
  // Like searchCombos, but additionally requires a 609 section that survives the corner exclusion
  // (i.e. a genuinely basket-eligible position, not just "any 609 present").
  const combos = [];
  for(let a=0; a<=8; a++){
    for(let b=1; b<=8; b++){
      for(let c=0; c<=8; c++){
        const k = a+b+c;
        if(k < 1 || k > 8) continue;
        const total = 550*a + 609*b + 762*c;
        combos.push({ a,b,c,k,total, deviation: total - budget });
      }
    }
  }
  function passes(x){
    if(!placementValid(x.k, doorType)) return false;
    const widths = comboToSections(x);
    return hasEligible609(widths, cornerRole);
  }
  const under = combos.filter(x=>x.total <= budget && passes(x)).sort((x,y)=> y.total - x.total)[0] || null;
  const over  = combos.filter(x=>x.total > budget && passes(x)).sort((x,y)=> x.total - y.total)[0] || null;
  return { under, over };
}
function comboToSections(combo){
  const arr = [];
  for(let i=0;i<combo.a;i++) arr.push(550);
  for(let i=0;i<combo.b;i++) arr.push(609);
  for(let i=0;i<combo.c;i++) arr.push(762);
  arr.sort((x,y)=>y-x);
  return arr;
}
function computePanelSlots(doorOpeningStart, doorOpening, panelCount){
  const panelWidth = doorOpening / panelCount;
  const slots = [];
  for(let i=0;i<panelCount;i++) slots.push([doorOpeningStart + i*panelWidth, doorOpeningStart + (i+1)*panelWidth]);
  return slots;
}
function computeSectionPositions(widths, sectionsStart){
  const pos = [];
  let x = sectionsStart;
  widths.forEach(w=>{ pos.push([x, x+w]); x += w; });
  return pos;
}
function evaluateSlotFit(secStart, secEnd, slots, marginMm){
  let best = null;
  for(const [s0,s1] of slots){
    if(secStart >= s0 && secEnd <= s1){
      const margin = s1 - secEnd;
      if(!best || margin > best.margin) best = { margin };
    }
  }
  if(!best) return { status:'straddle', margin:null };
  return { status: best.margin >= marginMm ? 'pass' : 'nearmiss', margin: best.margin };
}

function allocateBaskets(widths, doorType, cornerRole, leftKind, rightKind, desiredQty, slidingCtx){
  const perSectionMax = 4;
  const lastIdx = widths.length - 1;
  let candidates = widths.map((w,i)=>w===609?i:-1).filter(i=>i>=0);
  if(cornerRole==='losing' || cornerRole==='owning') candidates = candidates.filter(i=>i!==0);
  if(leftKind==='pillar' || leftKind==='beampillar') candidates = candidates.filter(i=>i!==0);
  if(rightKind==='pillar' || rightKind==='beampillar') candidates = candidates.filter(i=>i!==lastIdx);

  let positionInvalid = [];
  let nearMiss = [];
  if(doorType==='sliding' && slidingCtx){
    const slots = computePanelSlots(slidingCtx.doorOpeningStart, slidingCtx.doorOpening, slidingCtx.panelCount);
    const positions = computeSectionPositions(widths, slidingCtx.sectionsStart);
    candidates = candidates.filter(i=>{
      const [s0,s1] = positions[i];
      const fit = evaluateSlotFit(s0, s1, slots, 25);
      if(fit.status === 'straddle'){ positionInvalid.push(i); return false; }
      if(fit.status === 'nearmiss'){ nearMiss.push({ index:i, margin:fit.margin }); }
      return true; // pass and nearmiss both remain valid candidates
    });
  }

  const targetQty = (desiredQty==null) ? candidates.length * perSectionMax : Math.max(0, desiredQty);
  const neededSections = (desiredQty==null) ? candidates.length : Math.ceil(targetQty / perSectionMax);

  let orderedCandidates = candidates;
  if(doorType==='bifold'){
    const mid = Math.floor((widths.length-1)/2);
    orderedCandidates = candidates.slice().sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid));
    orderedCandidates = orderedCandidates.slice(0,1); // bifold capped at 1 basket section (Methodology 3.4)
  }

  // Split basket sections apart: never choose two adjacent indices (per confirmed rule — no clustering,
  // since adjacent basket sections can jointly straddle a sliding panel boundary even if each alone fits).
  const usedIndices = [];
  for(const i of orderedCandidates){
    if(usedIndices.length >= neededSections) break;
    const adjacent = usedIndices.some(j => Math.abs(j-i)===1);
    if(!adjacent) usedIndices.push(i);
  }
  usedIndices.sort((a,b)=>a-b);

  // distribute actual counts: fill each used section up to perSectionMax, in order, until targetQty is met
  const basketCounts = {};
  let remaining = targetQty;
  usedIndices.forEach(i=>{
    const count = Math.min(perSectionMax, remaining);
    basketCounts[i] = count;
    remaining = Math.max(0, remaining - count);
  });
  const basketIndices = usedIndices.filter(i=>basketCounts[i] > 0);

  const tmpl = new Array(widths.length).fill(null);
  if(cornerRole==='owning') tmpl[0] = 'F1';
  basketIndices.forEach(i=> tmpl[i] = 'F3');
  let alt = 'F1';
  for(let i=0;i<widths.length;i++){
    if(tmpl[i]) continue;
    tmpl[i] = alt; alt = (alt==='F1') ? 'F2' : 'F1';
  }
  if(widths.length>=3){
    if(tmpl[lastIdx]!=='F3' && tmpl[lastIdx]!=='F1') tmpl[lastIdx] = 'F4';
  }
  const actualQty = basketIndices.reduce((sum,i)=>sum+basketCounts[i], 0);
  const capped = desiredQty!=null && actualQty < desiredQty;
  return { templates: tmpl, basketIndices, basketCounts, actualQty, capped, neededSections, positionInvalid, nearMiss };
}
const TEMPLATE_INFO = {
  F1: { name:'Double hang', desc:'Top shelf @2100 + rod @2050 + rod @1050' },
  F2: { name:'Long hang', desc:'Top shelf @2100 + rod @2050' },
  F3: { name:'Basket stack', desc:'Top shelf @2100 + rod @2050 + up to 4 baskets (~200–900mm)' },
  F4: { name:'Shelf column', desc:'Top shelf @2100 + 4–5 wire shelves @~350mm spacing' }
};

function basketTableCount(feet){
  if(feet < 5) return 2;
  if(feet <= 8) return 3;
  if(feet <= 12) return 4;
  if(feet < 15) return 6;
  return 8;
}

function computeGeometry(combo, dir, budget, leftInternalW, rightInternalW, cornerExtraMm){
  const extra = (cornerExtraMm||0);
  let actualLength, bareWallMm = 0, note;
  if(dir === 'under'){
    const leftover = budget - combo.total;
    if(leftover < 30){
      actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra + leftover;
      note = 'Leftover ('+leftover.toFixed(0)+'mm) absorbed into allowances — built to stated length, no visible gap.';
    } else {
      actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra;
      bareWallMm = leftover;
      note = 'Leftover ('+leftover.toFixed(0)+'mm) ≥30mm — not padded. Built shorter; remaining wall stays bare.';
    }
  } else {
    const excess = combo.total - budget;
    actualLength = combo.total + 65 + leftInternalW + rightInternalW + extra;
    note = 'Exceeds target by '+excess.toFixed(0)+'mm — "next size up". No ceiling on overage; designer confirms room fit on site.';
  }
  return { actualLength, bareWallMm, note };
}

function buildProposal(combo, dir, budget, leftInternalW, rightInternalW, doorType, cornerRole, cornerExtraMm, leftKind, rightKind, desiredBasketQty, slidingCtx){
  if(!combo) return null;
  const widths = comboToSections(combo);
  const geo = computeGeometry(combo, dir, budget, leftInternalW, rightInternalW, cornerExtraMm);
  const tableQty = basketTableCount(roundFeet(geo.actualLength));
  const effectiveDesired = (desiredBasketQty==null) ? tableQty : desiredBasketQty;
  const alloc = allocateBaskets(widths, doorType, cornerRole, leftKind, rightKind, effectiveDesired, slidingCtx);
  return { combo, widths, basketIndices: alloc.basketIndices, basketCounts: alloc.basketCounts, basketIdx: alloc.basketIndices[0]??-1, basketActualQty: alloc.actualQty, basketCapped: alloc.capped, basketNeededSections: alloc.neededSections, basketPositionInvalid: alloc.positionInvalid, basketNearMiss: alloc.nearMiss, basketTableQty: tableQty, basketExtra: Math.max(0, alloc.actualQty - tableQty), templates: alloc.templates, actualLength: geo.actualLength, bareWallMm: geo.bareWallMm, note: geo.note, dir };
}

/* ============ STRAIGHT RUN compute ============ */
function computeDesign(s){
  const warnings = [];
  const left = sideElement(s.left), right = sideElement(s.right);
  const doorOpening = s.length - left.doorW - right.doorW;
  const internalWidth = s.length - left.internalW - right.internalW;
  const moduleBudget = internalWidth - 65;
  if(doorOpening < 300) warnings.push('Door opening ('+Math.round(doorOpening)+'mm) is very narrow — check inputs.');
  const door = s.doorRequired ? resolveDoor(doorOpening, s.flexDoorTypePref) : { type:'none', panelCount:0, panelWidth:0 };
  if(door.forced) warnings.push('Opening too narrow for sliding/bifold minimums — forced to single swing regardless of width.');
  if(door.type==='infeasible') warnings.push('Requested door type "'+door.requested+'" cannot fit this opening ('+Math.round(doorOpening)+'mm) — its minimum panel width requirement isn\'t met. Switch to Auto or a different door type.');
  const { under, over } = searchCombos(moduleBudget, door.type==='infeasible' ? 'none' : door.type);
  if(!under && !over) warnings.push('No valid section combination found for this opening/door combination.');
  const desiredQty = s.wireBasketTouched ? s.flexWireBasketQty : null;
  const slidingCtx = (door.type==='sliding') ? {
    doorOpeningStart: left.doorW,
    doorOpening: doorOpening,
    panelCount: door.panelCount,
    sectionsStart: left.internalW + 20
  } : null;
  const proposalA = buildProposal(under, 'under', moduleBudget, left.internalW, right.internalW, door.type, null, 0, left.kind, right.kind, desiredQty, slidingCtx);
  const proposalB = buildProposal(over, 'over', moduleBudget, left.internalW, right.internalW, door.type, null, 0, left.kind, right.kind, desiredQty, slidingCtx);
  [proposalA, proposalB].forEach(p=>{
    if(!p) return;
    if(p.basketPositionInvalid && p.basketPositionInvalid.length){
      warnings.push('Proposal '+(p.dir==='under'?'A':'B')+': section(s) '+p.basketPositionInvalid.map(i=>i+1).join(', ')+' excluded from basket eligibility — they straddle a sliding door panel boundary (Section 5.1 positional check).');
    }
    if(p.basketNearMiss && p.basketNearMiss.length){
      p.basketNearMiss.forEach(nm=>{
        warnings.push('⚑ FLAG — MANUAL CONFIRMATION REQUIRED: Proposal '+(p.dir==='under'?'A':'B')+' section '+(nm.index+1)+' has only '+nm.margin.toFixed(0)+'mm basket clearance margin (below the 25mm target, but the basket does physically fit — Section 5.1 near-miss rule). Included by default; confirm with designer/installer before finalizing.');
      });
    }
    if(p.basketIndices.length===0) warnings.push('Proposal '+(p.dir==='under'?'A':'B')+': no section qualifies as the mandatory basket-capable 609mm slot given placement and panel-position rules.');
    if(p.basketCapped) warnings.push('Proposal '+(p.dir==='under'?'A':'B')+': requested '+(desiredQty==null?p.basketTableQty:desiredQty)+' baskets, but only '+p.basketActualQty+' fit given eligible, non-adjacent, panel-aligned 609mm sections — allocation capped (Methodology 3.4/5.1).');
  });
  const heightCalc = computeDoorHeightAndPelmet(door.type, door.material, s.ceiling, s.doorHeightUpgrade);
  warnings.push(...heightCalc.warnings);
  const anchor = computeAnchorPillars(door);
  let effectiveDoorHeight = heightCalc.doorHeight, effectivePelmet = heightCalc.pelmetHeight;
  let mirrorValid = false, mirrorSide = null;
  if(s.flexPulloutMirrorQty > 0){
    if(left.kind==='partition'){ mirrorValid = true; mirrorSide = 'left'; }
    else if(right.kind==='partition'){ mirrorValid = true; mirrorSide = 'right'; }
    else warnings.push('Pull-out mirror requested but neither side is an open-end partition (both are wall/beam pillars) — mirror needs a partition side to mount on (Section 6.1). Not included.');
  }
  return { left, right, doorOpening, internalWidth, moduleBudget, door, proposalA, proposalB, doorHeight: effectiveDoorHeight, pelmetHeight: effectivePelmet, doorSplit: heightCalc.split, doorMidRail: heightCalc.midRail, anchor, mirrorValid, mirrorSide, warnings };
}

/* ============ Section 1.1 — door height/material, 3300mm cap, anchor pillars ============ */
function computeDoorHeightAndPelmet(doorType, material, flexCeilingInput, doorHeightUpgrade){
  const warnings = [];
  let ceiling = flexCeilingInput;
  if(ceiling > 3300){
    warnings.push('Overall system height capped at 3300mm regardless of ceiling (Methodology 1.1) — excess ('+(ceiling-3300)+'mm) stays as bare wall above the pelmet.');
    ceiling = 3300;
  }
  const ceilingGap = 50;
  const maxBudget = ceiling - ceilingGap;
  const upgradeAvailable = ceiling > 2450;
  const useUpgrade = upgradeAvailable && doorHeightUpgrade;
  let doorHeight = 0, pelmetHeight = 0, split = null, midRail = false;
  if(doorType !== 'none' && doorType !== 'infeasible'){
    doorHeight = useUpgrade ? Math.min(maxBudget, 2800) : Math.min(2400, maxBudget);
    if((doorType==='bifold' || doorType==='swing') && doorHeight > 2400){
      if(material === 'wooden'){
        const top = Math.max(600, doorHeight - 2080);
        split = { bottom: 2080, top };
        doorHeight = Math.min(2080 + top, maxBudget);
      } else {
        midRail = true; // aluminum bifold >2400mm: structural mid-rail, no height split needed
      }
    }
    pelmetHeight = ceiling - doorHeight;
    if(pelmetHeight < 50){ doorHeight -= (50 - pelmetHeight); pelmetHeight = 50; }
  }
  return { ceiling, doorHeight, pelmetHeight, split, midRail, warnings };
}


function computeAnchorPillars(door){
  if(door.type !== 'bifold' && door.type !== 'swing') return { hingeUnits: 0, interiorPillars: 0 };
  const hingeUnits = (door.bifoldPairs||0) + (door.swingCount || (door.type==='swing'?1:0));
  const interiorPillars = Math.max(0, Math.ceil((hingeUnits - 2) / 2));
  return { hingeUnits, interiorPillars };
}
function computeLeg(legLength, outerSide, doorRequired, isLosing, flexDoorTypePref){
  const outer = sideElement(outerSide);
  const doorOpening = legLength - outer.doorW - 600; // corner deduction, shared shell rule (9.2)
  const door = doorRequired ? resolveDoor(doorOpening, flexDoorTypePref) : { type:'none', panelCount:0, panelWidth:0 };
  const internalBase = legLength - outer.internalW;
  const budget = internalBase - 65 - (isLosing ? 600 : 0);
  const { under, over } = searchCombos(budget, door.type==='infeasible' ? 'none' : door.type);
  return { outer, doorOpening, door, budget, under, over };
}
function computeLegOptions(legLength, outerSide, doorRequired, isLosing, cornerRole, doorTypePref){
  const outer = sideElement(outerSide);
  const doorOpening = legLength - outer.doorW - 600;
  const door = doorRequired ? resolveDoor(doorOpening, doorTypePref || 'auto') : { type:'none', panelCount:0, panelWidth:0, material:null };
  const internalBase = legLength - outer.internalW;
  const budget = internalBase - 65 - (isLosing ? 600 : 0);
  const dt = door.type==='infeasible' ? 'none' : door.type;
  const free = searchCombosRaw(budget);
  const eligible = searchCombosCornerEligible(budget, dt, cornerRole);
  return { outer, doorOpening, door, budget, free, eligible };
}
function legBest(leg){
  const cands = [];
  if(leg.under) cands.push({ combo: leg.under, dir:'under', dev: Math.abs(leg.under.deviation) });
  if(leg.over)  cands.push({ combo: leg.over,  dir:'over',  dev: Math.abs(leg.over.deviation) });
  if(!cands.length) return null;
  cands.sort((x,y)=>x.dev-y.dev);
  return cands[0];
}

function computeLShape(s){
  const warnings = [];
  const ls = s.ls;
  const cases = [ { ownerA: true }, { ownerA: false } ];
  let best = null, bestDimensionOnly = null;
  cases.forEach(c=>{
    const roleA = c.ownerA ? 'owning' : 'losing';
    const roleB = c.ownerA ? 'losing' : 'owning';
    const legA = computeLegOptions(ls.legA.length, ls.legA.outer, ls.doorRequired, !c.ownerA, roleA, ls.doorTypePref);
    const legB = computeLegOptions(ls.legB.length, ls.legB.outer, ls.doorRequired, c.ownerA, roleB, ls.doorTypePref);
    const freeBestA = legBest(legA.free), freeBestB = legBest(legB.free);
    if(!freeBestA || !freeBestB) return; // one leg can't fit even a minimal combo — case disqualified outright

    const widthsFreeA = comboToSections(freeBestA.combo), widthsFreeB = comboToSections(freeBestB.combo);
    const okA = hasEligible609(widthsFreeA, roleA), okB = hasEligible609(widthsFreeB, roleB);

    let chosenA = freeBestA, chosenB = freeBestB, concededLeg = null, basketPossible = okA || okB;
    if(!okA && !okB){
      const eligA = legBest(legA.eligible), eligB = legBest(legB.eligible);
      if(eligA || eligB){
        const costA = eligA ? (eligA.dev - freeBestA.dev) : Infinity;
        const costB = eligB ? (eligB.dev - freeBestB.dev) : Infinity;
        if(costA <= costB){ chosenA = eligA; concededLeg = 'A'; }
        else { chosenB = eligB; concededLeg = 'B'; }
        basketPossible = true;
      }
    }
    const totalDev = chosenA.dev + chosenB.dev;
    const candidate = { case:c, legA, legB, roleA, roleB, chosenA, chosenB, totalDev, concededLeg, basketPossible };
    if(!bestDimensionOnly || totalDev < bestDimensionOnly.totalDev) bestDimensionOnly = candidate;
    if(basketPossible && (!best || totalDev < best.totalDev)) best = candidate;
  });
  if(!best && !bestDimensionOnly){
    warnings.push('No viable corner-ownership assignment found — both legs, in both directions, fail to fit even a minimal section combination. Consider HausPole instead for this footprint.');
    return { warnings, valid:false };
  }
  if(!best){
    warnings.push('Neither corner-ownership assignment can satisfy the mandatory 609-with-basket rule anywhere in the shape (Section 9.3) — proceeding with the best dimensional fit, but no basket-capable section exists. Flag to design lead; likely resolution is reconsidering door type or footprint, not dropping the requirement.');
    best = bestDimensionOnly;
  }
  const { legA, legB, roleA, roleB, chosenA: bA, chosenB: bB, concededLeg, case:winCase } = best;
  if(concededLeg) warnings.push('Leg '+concededLeg+' used a less-close section combination (instead of its true closest fit) specifically to provide the mandatory basket-capable section — the other leg\'s combo alone couldn\'t satisfy Section 9.3\'s whole-shape requirement.');
  if(legA.door.type==='infeasible') warnings.push('Leg A: requested door type "'+legA.door.requested+'" cannot fit this leg\'s opening ('+Math.round(legA.doorOpening)+'mm).');
  if(legB.door.type==='infeasible') warnings.push('Leg B: requested door type "'+legB.door.requested+'" cannot fit this leg\'s opening ('+Math.round(legB.doorOpening)+'mm).');

  // Geometry-only pass (no baskets yet) to get actual lengths for the combined-length table lookup
  const geoA = computeGeometry(bA.combo, bA.dir, legA.budget, 0, legA.outer.internalW, roleA==='losing'?600:0);
  const geoB = computeGeometry(bB.combo, bB.dir, legB.budget, 0, legB.outer.internalW, roleB==='losing'?600:0);
  const combinedFeet = roundFeet(geoA.actualLength + geoB.actualLength); // HausPole 7.4: summed leg lengths, no corner/billing deduction
  const tableQty = basketTableCount(combinedFeet);

  const touched = s.wireBasketTouched;
  const totalDesired = touched ? s.flexWireBasketQty : tableQty;
  // Consolidation preference (HausPole 6.2/7.4): fill Leg A first, spill remainder to Leg B only if needed
  const propA = buildProposal(bA.combo, bA.dir, legA.budget, 0, legA.outer.internalW, legA.door.type, roleA, roleA==='losing'?600:0, 'partition', legA.outer.kind, totalDesired);
  const qtyB = Math.max(0, totalDesired - propA.basketActualQty);
  const propB = buildProposal(bB.combo, bB.dir, legB.budget, 0, legB.outer.internalW, legB.door.type, roleB, roleB==='losing'?600:0, 'partition', legB.outer.kind, qtyB);
  propA.basketTableQty = tableQty; propB.basketTableQty = 0; // table total is a whole-shape figure, attributed to Leg A's line for display; see combinedBasketExtra below
  const combinedBasketActual = propA.basketActualQty + propB.basketActualQty;
  const combinedBasketExtra = Math.max(0, combinedBasketActual - tableQty);

  function clearance(prop, leg){
    if(!prop) return { applicable:false };
    if(!prop.basketIndices.length || leg.door.type !== 'sliding') return { applicable:false };
    const panelSpan = leg.doorOpening / leg.door.panelCount;
    const results = prop.basketIndices.map(i=>{
      const basketWidth = prop.widths[i];
      const margin = panelSpan - basketWidth;
      return { index:i, panelSpan, basketWidth, margin, pass: margin>=25 };
    });
    return { applicable:true, results, pass: results.every(r=>r.pass) };
  }
  propA.clearance = clearance(propA, legA);
  propB.clearance = clearance(propB, legB);
  if(propA.clearance.applicable && !propA.clearance.pass){
    propA.clearance.results.filter(r=>!r.pass).forEach(r=> warnings.push('Leg A: basket clearance margin ('+r.margin.toFixed(0)+'mm) below 25mm minimum on section '+(r.index+1)+'.'));
  }
  if(propB.clearance.applicable && !propB.clearance.pass){
    propB.clearance.results.filter(r=>!r.pass).forEach(r=> warnings.push('Leg B: basket clearance margin ('+r.margin.toFixed(0)+'mm) below 25mm minimum on section '+(r.index+1)+'.'));
  }
  if(propA.basketCapped || propB.basketCapped){
    warnings.push('Requested basket total not fully achievable across both legs given eligible 609mm sections — allocation capped (Methodology 3.4). Leg A: '+propA.basketActualQty+', Leg B: '+propB.basketActualQty+'.');
  }

  const wholeShapeBasketOk = propA.basketIndices.length>0 || propB.basketIndices.length>0;
  if(!wholeShapeBasketOk) warnings.push('Neither leg has a valid basket-capable position — mandatory 609-with-basket rule fails across the whole L-shape (Section 9.3).');

  const materialForHeightCalc = legA.door.material || legB.door.material || 'wooden';
  const heightCalc = computeDoorHeightAndPelmet(
    (legA.door.type!=='none' || legB.door.type!=='none') ? 'sliding' : 'none', // generic pass just for shared ceiling/pelmet math — material split is resolved per leg below
    materialForHeightCalc, ls.ceiling, ls.doorHeightUpgrade
  );
  warnings.push(...heightCalc.warnings);
  function legDoorDetail(door){
    if((door.type!=='bifold' && door.type!=='swing') || heightCalc.doorHeight<=2400) return { split:null, midRail:false };
    if(door.material==='wooden'){
      const top = Math.max(600, heightCalc.doorHeight-2080);
      return { split:{bottom:2080, top}, midRail:false };
    }
    return { split:null, midRail:true };
  }
  const detailA = legDoorDetail(legA.door), detailB = legDoorDetail(legB.door);
  const anchorA = computeAnchorPillars(legA.door), anchorB = computeAnchorPillars(legB.door);
  return { valid:true, warnings, legA, legB, roleA, roleB, propA, propB, doorHeight: heightCalc.doorHeight, pelmetHeight: heightCalc.pelmetHeight, doorDetailA: detailA, doorDetailB: detailB, anchorA, anchorB, winCase, basketTableQty: tableQty, basketExtra: combinedBasketExtra, basketActualTotal: combinedBasketActual };
}

/* ============ pricing ============ */
function materialLabel(m){ return m==='wooden' ? 'wooden' : 'aluminium'; }
function ceilingTierRate(ceiling, doorPresent, doorHeightUpgrade, internalHeightUpgrade){
  if(!doorPresent) return internalHeightUpgrade ? 30 : 0;
  if(ceiling <= 2600) return 0;
  if(ceiling <= 3000) return (doorHeightUpgrade || internalHeightUpgrade) ? 60 : 30;
  return 100;
}
function hingeCost(door, material){
  if(door.type !== 'bifold' && door.type !== 'swing') return { units:0, cost:0, panels:0 };
  const units = (door.bifoldPairs||0) + (door.swingCount || (door.type==='swing'?1:0));
  const panels = (door.bifoldPairs||0)*2 + (door.swingCount || (door.type==='swing'?1:0));
  return { units, cost: units*150, panels };
}
function computePriceStraight(s, d, prop){
  const lines = [];
  const doorPresent = d.door.type !== 'none';
  const baseRateOnly = doorPresent ? 320 : 190;
  const tierTop = ceilingTierRate(s.ceiling, doorPresent, s.doorHeightUpgrade, s.internalHeightUpgrade);
  const rate = baseRateOnly + tierTop;
  const feet = roundFeet(prop.actualLength);
  const billing = applyMinBilling(feet);
  const baseCost = billing.billFeet * rate;
  lines.push({ label:'Base rate ('+billing.billFeet.toFixed(1)+'ft × $'+baseRateOnly+'/pftrun)', amt: billing.billFeet*baseRateOnly });
  if(tierTop > 0) lines.push({ label:'Ceiling-height top-up ('+billing.billFeet.toFixed(1)+'ft × $'+tierTop+'/pftrun)', amt: billing.billFeet*tierTop });
  let total = baseCost;
  if(billing.surcharge){ lines.push({label:'Small-order surcharge', amt:billing.surcharge}); total+=billing.surcharge; }
  const h = hingeCost(d.door, d.door.material);
  if(h.units) lines.push({label:h.units+'× hinge unit ('+materialLabel(d.door.material)+') × $150 (structural)', amt:h.cost}), total+=h.cost;
  if(d.door.material==='wooden' && h.panels>0){
    const laminatePieces = Math.ceil(h.panels/2);
    const laminateCost = laminatePieces*80;
    lines.push({label:laminatePieces+'× laminate piece (pooled, '+h.panels+' panels ÷ 2) × $80', amt:laminateCost});
    total += laminateCost;
  }
  if(prop.basketExtra>0){ const c=prop.basketExtra*120; lines.push({label:prop.basketExtra+'× additional wire basket (beyond '+prop.basketTableQty+' standard)', amt:c}); total+=c; }
  if(s.flexMirrorQty>0){ const c=s.flexMirrorQty*150; lines.push({label:s.flexMirrorQty+'× full mirror panel', amt:c}); total+=c; }
  if(s.flexLaminateQty>0 && d.door.material!=='wooden'){ const c=s.flexLaminateQty*80; lines.push({label:s.flexLaminateQty+'× laminate piece (optional)', amt:c}); total+=c; }
  if(s.flexTrouserHangerQty>0){ const c=s.flexTrouserHangerQty*120; lines.push({label:s.flexTrouserHangerQty+'× trouser hanger', amt:c}); total+=c; }
  if(s.flexPulloutMirrorQty>0){ const c=s.flexPulloutMirrorQty*200; lines.push({label:s.flexPulloutMirrorQty+'× full-length pull-out mirror', amt:c}); total+=c; }
  if(s.flexDismantle){ const c=Math.max(200, feet*40); lines.push({label:'Dismantle & disposal ('+feet.toFixed(1)+'ft × $40, min $200)', amt:c}); total+=c; }
  if(s.flexAddonRelocatePoint>0){ const c=s.flexAddonRelocatePoint*80; lines.push({label:s.flexAddonRelocatePoint+'× relocated switch/power point', amt:c}); total+=c; }
  if(s.flexAddonNewSwitch>0){ const c=s.flexAddonNewSwitch*100; lines.push({label:s.flexAddonNewSwitch+'× new light switch', amt:c}); total+=c; }
  if(s.flexLed){ const len=Math.max(0,s.flexAddonLedLength||0); const excess=Math.max(0,len-1.5); const c=180+excess*120; lines.push({label:'LED lighting ('+len.toFixed(1)+'m, min $180 incl. first 1.5m'+(excess>0?' + '+excess.toFixed(1)+'m excess × $120':'')+')', amt:c}); total+=c; }
  if(s.flexAddonSensor>0){ const c=s.flexAddonSensor*80; lines.push({label:s.flexAddonSensor+'× wired sensor', amt:c}); total+=c; }
  return { lines, total };
}
function computePriceLShape(s, lsd){
  const lines = [];
  const doorPresent = lsd.legA.door.type!=='none' || lsd.legB.door.type!=='none';
  const baseRateOnly = doorPresent ? 320 : 190;
  const tierTop = ceilingTierRate(s.ls.ceiling, doorPresent, s.ls.doorHeightUpgrade, s.ls.internalHeightUpgrade);
  const rate = baseRateOnly + tierTop;
  const combinedMm = lsd.propA.actualLength + lsd.propB.actualLength - 304.8;
  const feet = roundFeet(combinedMm);
  const billing = applyMinBilling(feet);
  const baseCost = billing.billFeet * rate;
  lines.push({ label:'Base rate, combined ('+billing.billFeet.toFixed(1)+'ft × $'+baseRateOnly+'/pftrun, 1ft corner deduction)', amt: billing.billFeet*baseRateOnly });
  if(tierTop > 0) lines.push({ label:'Ceiling-height top-up ('+billing.billFeet.toFixed(1)+'ft × $'+tierTop+'/pftrun)', amt: billing.billFeet*tierTop });
  let total = baseCost;
  if(billing.surcharge){ lines.push({label:'Small-order surcharge', amt:billing.surcharge}); total+=billing.surcharge; }
  const hA = hingeCost(lsd.legA.door, lsd.legA.door.material);
  const hB = hingeCost(lsd.legB.door, lsd.legB.door.material);
  if(hA.units) lines.push({label:'Leg A: '+hA.units+'× hinge unit ('+materialLabel(lsd.legA.door.material)+') × $150 (structural)', amt:hA.cost}), total+=hA.cost;
  if(hB.units) lines.push({label:'Leg B: '+hB.units+'× hinge unit ('+materialLabel(lsd.legB.door.material)+') × $150 (structural)', amt:hB.cost}), total+=hB.cost;
  const woodenPanels = (lsd.legA.door.material==='wooden' ? hA.panels : 0) + (lsd.legB.door.material==='wooden' ? hB.panels : 0);
  if(woodenPanels > 0){
    const laminatePieces = Math.ceil(woodenPanels/2);
    const laminateCost = laminatePieces*80;
    lines.push({label:laminatePieces+'× laminate piece (pooled across both legs, '+woodenPanels+' panels ÷ 2) × $80', amt:laminateCost});
    total += laminateCost;
  }
  if(lsd.basketExtra>0){ const c=lsd.basketExtra*120; lines.push({label:lsd.basketExtra+'× additional wire basket (beyond '+lsd.basketTableQty+' standard, combined)', amt:c}); total+=c; }
  if(s.flexMirrorQty>0){ const c=s.flexMirrorQty*150; lines.push({label:s.flexMirrorQty+'× full mirror panel', amt:c}); total+=c; }
  const anyWoodenLeg = lsd.legA.door.material==='wooden' || lsd.legB.door.material==='wooden';
  if(s.flexLaminateQty>0 && !anyWoodenLeg){ const c=s.flexLaminateQty*80; lines.push({label:s.flexLaminateQty+'× laminate piece (optional)', amt:c}); total+=c; }
  if(s.flexTrouserHangerQty>0){ const c=s.flexTrouserHangerQty*120; lines.push({label:s.flexTrouserHangerQty+'× trouser hanger', amt:c}); total+=c; }
  if(s.flexPulloutMirrorQty>0){ const c=s.flexPulloutMirrorQty*200; lines.push({label:s.flexPulloutMirrorQty+'× full-length pull-out mirror', amt:c}); total+=c; }
  if(s.flexDismantle){ const c=Math.max(200, feet*40); lines.push({label:'Dismantle & disposal ('+feet.toFixed(1)+'ft × $40, min $200)', amt:c}); total+=c; }
  if(s.flexAddonRelocatePoint>0){ const c=s.flexAddonRelocatePoint*80; lines.push({label:s.flexAddonRelocatePoint+'× relocated switch/power point', amt:c}); total+=c; }
  if(s.flexAddonNewSwitch>0){ const c=s.flexAddonNewSwitch*100; lines.push({label:s.flexAddonNewSwitch+'× new light switch', amt:c}); total+=c; }
  if(s.flexLed){ const len=Math.max(0,s.flexAddonLedLength||0); const excess=Math.max(0,len-1.5); const c=180+excess*120; lines.push({label:'LED lighting ('+len.toFixed(1)+'m, min $180 incl. first 1.5m'+(excess>0?' + '+excess.toFixed(1)+'m excess × $120':'')+')', amt:c}); total+=c; }
  if(s.flexAddonSensor>0){ const c=s.flexAddonSensor*80; lines.push({label:s.flexAddonSensor+'× wired sensor', amt:c}); total+=c; }
  return { lines, total };
}

/* ============ canvas setup ============ */
const canvas = document.getElementById('flexElevCanvas'), ctx = canvas.getContext('2d');
const internalCanvas = document.getElementById('flexInternalElevCanvas'), ictx = internalCanvas.getContext('2d');
const topCanvas = document.getElementById('flexTopViewCanvas'), tctx = topCanvas.getContext('2d');
const flexLsExtCanvas = document.getElementById('flexLsExtCanvas'), lsExtCtx = flexLsExtCanvas.getContext('2d');
const flexLsIntCanvas = document.getElementById('flexLsIntCanvas'), lsIntCtx = flexLsIntCanvas.getContext('2d');
const flexLsTopCanvas = document.getElementById('flexLsTopCanvas'), lsTopCtx = flexLsTopCanvas.getContext('2d');

function resizeCanvasEl(cv, cx){
  const rect = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = rect.width * dpr; cv.height = rect.height * dpr;
  cx.setTransform(dpr,0,0,dpr,0,0);
}
function resizeCanvas(){
  render(); // apply current shape's show/hide state first, so the measurement below sees visible (correctly sized) canvases
  [[canvas,ctx],[internalCanvas,ictx],[topCanvas,tctx],[flexLsExtCanvas,lsExtCtx],[flexLsIntCanvas,lsIntCtx],[flexLsTopCanvas,lsTopCtx]]
    .forEach(([cv,cx])=>resizeCanvasEl(cv,cx));
  render();
}
function drawDim(cx, x1,y1,x2,y2,label,offset,vertical){
  cx.save(); cx.strokeStyle='#6A93AF'; cx.fillStyle='#3E6B8A'; cx.lineWidth=1; cx.font='11px -apple-system,sans-serif';
  if(vertical){
    cx.beginPath(); cx.moveTo(x1+offset,y1); cx.lineTo(x1+offset,y2); cx.stroke();
    cx.save(); cx.translate(x1+offset-6,(y1+y2)/2); cx.rotate(-Math.PI/2); cx.textAlign='center'; cx.fillText(label,0,0); cx.restore();
  } else {
    cx.beginPath(); cx.moveTo(x1,y1+offset); cx.lineTo(x2,y1+offset); cx.stroke();
    cx.textAlign='center'; cx.fillText(label,(x1+x2)/2,y1+offset-5);
  }
  cx.restore();
}
function wrapText(cx, text, x, y, maxW, lh){
  const words=text.split(' '); let line='', yy=y;
  for(const wd of words){
    const test=line+wd+' ';
    if(cx.measureText(test).width>maxW && line){ cx.fillText(line,x,yy); line=wd+' '; yy+=lh; }
    else line=test;
  }
  cx.fillText(line,x,yy);
}

function drawElevation(cx, cv, ceiling, length, leftEl, rightEl, door, pelmetHeight){
  cx.clearRect(0,0,cv.width,cv.height);
  const rect = cv.getBoundingClientRect(); const W=rect.width, H=rect.height;
  cx.fillStyle='#F4F1E9'; cx.fillRect(0,0,W,H);
  const margin=50, baseY=H-60, totalH=ceiling;
  const hScale = Math.min(1.4,(H-110)/totalH);
  const scale = (W-margin*2)/length;
  const ox=margin, oy=baseY-totalH*hScale;
  cx.strokeStyle='#1B1F26'; cx.lineWidth=2; cx.strokeRect(ox,oy,length*scale,totalH*hScale);
  cx.fillStyle='#C9C4B6';
  cx.fillRect(ox,oy,leftEl.doorW*scale,totalH*hScale);
  cx.fillRect(ox+(length-rightEl.doorW)*scale,oy,rightEl.doorW*scale,totalH*hScale);
  if(door.type!=='none'){
    cx.fillStyle='#8A8577'; cx.fillRect(ox,oy,length*scale,pelmetHeight*hScale);
    const dX0=ox+leftEl.doorW*scale, dX1=ox+(length-rightEl.doorW)*scale;
    const dY0=oy+pelmetHeight*hScale, dY1=oy+totalH*hScale;
    const pw=(dX1-dX0)/door.panelCount;
    for(let i=0;i<door.panelCount;i++){
      cx.fillStyle = i%2===0?'#E8E3D6':'#DCD6C6';
      cx.fillRect(dX0+i*pw,dY0,pw-2,dY1-dY0);
      cx.strokeStyle='#1B1F26'; cx.strokeRect(dX0+i*pw,dY0,pw-2,dY1-dY0);
    }
  }
  drawDim(cx, ox,oy,ox+length*scale,oy,Math.round(length)+'mm',-14,false);
  drawDim(cx, ox,oy,ox,oy+totalH*hScale,ceiling+'mm',-30,true);
}

function drawInternal(cx, cv, prop, cornerRole, internalUpgrade){
  cx.clearRect(0,0,cv.width,cv.height);
  const rect=cv.getBoundingClientRect(); const W=rect.width, H=rect.height;
  cx.fillStyle='#F4F1E9'; cx.fillRect(0,0,W,H);
  if(!prop){ cx.fillStyle='#B5533C'; cx.font='13px sans-serif'; cx.fillText('No valid proposal.',16,26); return; }
  const margin=40, baseY=H-56, topY=36, totalMm= internalUpgrade ? 2600 : 2300;
  const scaleY=(baseY-topY)/totalMm;
  const totalW = prop.widths.reduce((a,b)=>a+b,0);
  const scaleX=(W-margin*2)/totalW;
  const colors={F1:'#6A93AF',F2:'#8FA9BE',F3:'#C08A3E',F4:'#8A8577'};
  let x=margin;
  prop.widths.forEach((w,i)=>{
    const t=prop.templates[i], info=TEMPLATE_INFO[t];
    const colW=w*scaleX;
    cx.strokeStyle='#1B1F26'; cx.lineWidth=1; cx.strokeRect(x,topY,colW,baseY-topY);
    if(cornerRole && i===0){
      cx.fillStyle='#C08A3E22'; cx.fillRect(x,topY,colW,baseY-topY);
      cx.fillStyle='#C08A3E'; cx.font='9px sans-serif'; cx.textAlign='center';
      cx.fillText('CORNER ('+cornerRole+')', x+colW/2, baseY+30);
    }
    const shelfY=baseY-2100*scaleY;
    cx.strokeStyle=colors[t]; cx.lineWidth=2;
    cx.beginPath(); cx.moveTo(x+4,shelfY); cx.lineTo(x+colW-4,shelfY); cx.stroke();
    if(t==='F1'){ [2050,1050].forEach(h=>{ const y=baseY-h*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }); }
    else if(t==='F2'){ const y=baseY-2050*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }
    else if(t==='F3'){
      const y=baseY-2050*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke();
      const basketCount = (prop.basketCounts && prop.basketCounts[i]) || 4;
      let by=baseY-200*scaleY;
      for(let b=0;b<basketCount;b++){ const bh=60*scaleY; cx.strokeStyle='#C08A3E'; cx.strokeRect(x+6,by-bh,colW-12,bh); by-=bh+3; }
      cx.fillStyle='#C08A3E'; cx.font='8px sans-serif'; cx.textAlign='center';
      cx.fillText(basketCount+' basket'+(basketCount===1?'':'s'), x+colW/2, by-4);
    } else if(t==='F4'){
      for(let h=350; h<2100; h+=350){ const y=baseY-h*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }
    }
    if(internalUpgrade){
      const y2400=baseY-2400*scaleY;
      cx.strokeStyle='#B5533C'; cx.lineWidth=2.5;
      cx.beginPath(); cx.moveTo(x+2,y2400); cx.lineTo(x+colW-2,y2400); cx.stroke();
    }
    cx.fillStyle='#1B1F26'; cx.font='10px sans-serif'; cx.textAlign='center'; cx.fillText(w+'mm', x+colW/2, baseY+14);
    cx.fillStyle=colors[t]; cx.font='bold 10px sans-serif'; cx.fillText(t, x+colW/2, topY-6);
    cx.font='8px sans-serif'; cx.fillStyle='#3E6B8A'; wrapText(cx, info.name, x+colW/2, topY+12, colW-6, 10);
    x+=colW;
  });
}

/* ---- combined single-canvas L-shape drawing (two side-by-side panels, one per leg) ---- */
function clearFillCanvas(cx, cv){
  const rect = cv.getBoundingClientRect(); const W=rect.width, H=rect.height;
  cx.clearRect(0,0,cv.width,cv.height);
  cx.fillStyle='#F4F1E9'; cx.fillRect(0,0,W,H);
  return { W, H };
}
function drawElevationRegion(cx, x0, regionW, H, ceiling, length, leftEl, rightEl, door, pelmetHeight, label){
  const margin=20, baseY=H-60, totalH=ceiling;
  const hScale = Math.min(1.4,(H-110)/totalH);
  const scale = (regionW-margin*2)/length;
  const ox=x0+margin, oy=baseY-totalH*hScale;
  cx.fillStyle='#1B1F26'; cx.font='11px monospace'; cx.textAlign='left';
  cx.fillText(label, ox, oy-10);
  cx.strokeStyle='#1B1F26'; cx.lineWidth=2; cx.strokeRect(ox,oy,length*scale,totalH*hScale);
  cx.fillStyle='#C9C4B6';
  cx.fillRect(ox,oy,leftEl.doorW*scale,totalH*hScale);
  cx.fillRect(ox+(length-rightEl.doorW)*scale,oy,rightEl.doorW*scale,totalH*hScale);
  if(door.type!=='none'){
    cx.fillStyle='#8A8577'; cx.fillRect(ox,oy,length*scale,pelmetHeight*hScale);
    const dX0=ox+leftEl.doorW*scale, dX1=ox+(length-rightEl.doorW)*scale;
    const dY0=oy+pelmetHeight*hScale, dY1=oy+totalH*hScale;
    const pw=(dX1-dX0)/door.panelCount;
    for(let i=0;i<door.panelCount;i++){
      cx.fillStyle = i%2===0?'#E8E3D6':'#DCD6C6';
      cx.fillRect(dX0+i*pw,dY0,pw-2,dY1-dY0);
      cx.strokeStyle='#1B1F26'; cx.strokeRect(dX0+i*pw,dY0,pw-2,dY1-dY0);
    }
  }
  drawDim(cx, ox,oy,ox+length*scale,oy,Math.round(length)+'mm',-14,false);
  drawDim(cx, ox,oy,ox,oy+totalH*hScale,ceiling+'mm',-30,true);
}
function drawInternalRegion(cx, x0, regionW, H, prop, cornerRole, internalUpgrade, label){
  const margin=20, baseY=H-56, topY=36, totalMm = internalUpgrade ? 2600 : 2300;
  cx.fillStyle='#1B1F26'; cx.font='11px monospace'; cx.textAlign='left';
  cx.fillText(label, x0+margin, topY-16);
  if(!prop){ cx.fillStyle='#B5533C'; cx.font='13px sans-serif'; cx.fillText('No valid proposal.', x0+margin, topY+20); return; }
  const scaleY=(baseY-topY)/totalMm;
  const totalW = prop.widths.reduce((a,b)=>a+b,0);
  const scaleX=(regionW-margin*2)/totalW;
  const colors={F1:'#6A93AF',F2:'#8FA9BE',F3:'#C08A3E',F4:'#8A8577'};
  let x=x0+margin;
  prop.widths.forEach((w,i)=>{
    const t=prop.templates[i], info=TEMPLATE_INFO[t];
    const colW=w*scaleX;
    cx.strokeStyle='#1B1F26'; cx.lineWidth=1; cx.strokeRect(x,topY,colW,baseY-topY);
    if(cornerRole && i===0){
      cx.fillStyle='#C08A3E22'; cx.fillRect(x,topY,colW,baseY-topY);
      cx.fillStyle='#C08A3E'; cx.font='9px sans-serif'; cx.textAlign='center';
      cx.fillText('CORNER ('+cornerRole+')', x+colW/2, baseY+30);
    }
    const shelfY=baseY-2100*scaleY;
    cx.strokeStyle=colors[t]; cx.lineWidth=2;
    cx.beginPath(); cx.moveTo(x+4,shelfY); cx.lineTo(x+colW-4,shelfY); cx.stroke();
    if(t==='F1'){ [2050,1050].forEach(h=>{ const y=baseY-h*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }); }
    else if(t==='F2'){ const y=baseY-2050*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }
    else if(t==='F3'){
      const y=baseY-2050*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke();
      const basketCount = (prop.basketCounts && prop.basketCounts[i]) || 4;
      let by=baseY-200*scaleY;
      for(let b=0;b<basketCount;b++){ const bh=60*scaleY; cx.strokeStyle='#C08A3E'; cx.strokeRect(x+6,by-bh,colW-12,bh); by-=bh+3; }
      cx.fillStyle='#C08A3E'; cx.font='8px sans-serif'; cx.textAlign='center';
      cx.fillText(basketCount+' basket'+(basketCount===1?'':'s'), x+colW/2, by-4);
    } else if(t==='F4'){
      for(let h=350; h<2100; h+=350){ const y=baseY-h*scaleY; cx.beginPath(); cx.moveTo(x+8,y); cx.lineTo(x+colW-8,y); cx.stroke(); }
    }
    if(internalUpgrade){
      const y2400=baseY-2400*scaleY;
      cx.strokeStyle='#B5533C'; cx.lineWidth=2.5;
      cx.beginPath(); cx.moveTo(x+2,y2400); cx.lineTo(x+colW-2,y2400); cx.stroke();
    }
    cx.fillStyle='#1B1F26'; cx.font='10px sans-serif'; cx.textAlign='center'; cx.fillText(w+'mm', x+colW/2, baseY+14);
    cx.fillStyle=colors[t]; cx.font='bold 10px sans-serif'; cx.fillText(t, x+colW/2, topY-6);
    cx.font='8px sans-serif'; cx.fillStyle='#3E6B8A'; wrapText(cx, info.name, x+colW/2, topY+12, colW-6, 10);
    x+=colW;
  });
}

function currentProposal(d){ return state.proposal==='A' ? d.proposalA : d.proposalB; }

function render(){
  try{
    renderInner();
  } catch(err){
    const msg = '<div class="warn-box"><div class="w-title">Render error</div><ul><li>' +
      String(err && err.message || err).replace(/</g,'&lt;') +
      '</li></ul><div style="margin-top:8px; font-size:0.72rem; color:#8A8577;">This is a bug — please screenshot this box and the steps that led here.</div></div>';
    const specEl = document.getElementById(state.shape==='straight' ? 'flexSpecSheet' : 'flexLsSpecSheet');
    if(specEl) specEl.innerHTML = msg;
    const priceEl = document.getElementById('flexAddonPriceSheet');
    if(priceEl) priceEl.innerHTML = msg;
    if(window.console && console.error) console.error('HausFlex render error:', err);
  }
}
function renderInner(){
  if(state.shape === 'straight'){
    document.getElementById('flexStraightFields').style.display='block';
    document.getElementById('flexLshapeFields').style.display='none';
    document.getElementById('flexStraightOutput').style.display='block';
    document.getElementById('flexLshapeOutput').style.display='none';
    const d = computeDesign(state);
    const prop = currentProposal(d);
    if(!state.wireBasketTouched){
      state.flexWireBasketQty = suggestedBasketQty(prop);
      document.getElementById('flexWireBasketQty').value = state.flexWireBasketQty;
    }
    const activeView = (document.querySelector('.flex-tab-btn.active') || document.querySelector('.flex-tab-btn')).dataset.view;
    if(activeView==='ext') drawElevation(ctx,canvas,state.ceiling, prop?prop.actualLength:state.length, d.left,d.right,d.door,d.pelmetHeight);
    if(activeView==='int') drawInternal(ictx,internalCanvas, prop, null, state.internalHeightUpgrade);
    if(activeView==='top') drawTopStraight(d, prop);
    renderSpecSheetStraight(d);
    renderAddonsStraight(d);
    renderQuoteStraight(d);
  } else {
    document.getElementById('flexStraightFields').style.display='none';
    document.getElementById('flexLshapeFields').style.display='block';
    document.getElementById('flexStraightOutput').style.display='none';
    document.getElementById('flexLshapeOutput').style.display='block';
    const lsd = computeLShape(state);
    if(!state.wireBasketTouched && lsd.valid){
      state.flexWireBasketQty = suggestedBasketQty(lsd.propA) + suggestedBasketQty(lsd.propB);
      document.getElementById('flexWireBasketQty').value = state.flexWireBasketQty;
    }
    const activeView = (document.querySelector('.flex-ls-tab-btn.active') || document.querySelector('.flex-ls-tab-btn')).dataset.lsview;
    flexLsExtCanvas.style.display = activeView==='ext' ? 'block':'none';
    flexLsIntCanvas.style.display = activeView==='int' ? 'block':'none';
    flexLsTopCanvas.style.display = activeView==='top' ? 'block':'none';
    if(lsd.valid){
      if(activeView==='ext'){
        const {W,H} = clearFillCanvas(lsExtCtx, flexLsExtCanvas);
        const gap=30, halfW=(W-gap)/2;
        drawElevationRegion(lsExtCtx, 0, halfW, H, state.ls.ceiling, lsd.propA.actualLength, {doorW:600,internalW:0}, lsd.legA.outer, lsd.legA.door, lsd.pelmetHeight, 'Leg A external elevation');
        drawElevationRegion(lsExtCtx, halfW+gap, halfW, H, state.ls.ceiling, lsd.propB.actualLength, {doorW:600,internalW:0}, lsd.legB.outer, lsd.legB.door, lsd.pelmetHeight, 'Leg B external elevation');
      }
      if(activeView==='int'){
        const {W,H} = clearFillCanvas(lsIntCtx, flexLsIntCanvas);
        const gap=30, halfW=(W-gap)/2;
        drawInternalRegion(lsIntCtx, 0, halfW, H, lsd.propA, lsd.roleA, state.ls.internalHeightUpgrade, 'Leg A internal');
        drawInternalRegion(lsIntCtx, halfW+gap, halfW, H, lsd.propB, lsd.roleB, state.ls.internalHeightUpgrade, 'Leg B internal');
      }
      if(activeView==='top') drawTopLShape(lsd);
    }
    renderSpecSheetLShape(lsd);
    renderAddonsLShape(lsd);
    renderQuoteLShape(lsd);
  }
}

function drawTopStraight(d, prop){
  tctx.clearRect(0,0,topCanvas.width,topCanvas.height);
  const rect=topCanvas.getBoundingClientRect(); const W=rect.width,H=rect.height;
  tctx.fillStyle='#F4F1E9'; tctx.fillRect(0,0,W,H);
  if(!prop) return;
  const margin=50, wallY=60, depthPx=110;
  const totalW=prop.actualLength;
  const scale=(W-margin*2)/totalW;
  tctx.strokeStyle='#1B1F26'; tctx.lineWidth=3;
  tctx.beginPath(); tctx.moveTo(margin,wallY); tctx.lineTo(margin+totalW*scale,wallY); tctx.stroke();
  const bracketPx=depthPx*(450/600);
  tctx.strokeStyle='#6A93AF'; tctx.lineWidth=1; tctx.strokeRect(margin,wallY,totalW*scale,bracketPx);
  tctx.strokeStyle='#C9C4B6'; tctx.setLineDash([4,3]); tctx.strokeRect(margin,wallY,totalW*scale,depthPx); tctx.setLineDash([]);
  let x=margin+d.left.internalW*scale;
  tctx.fillStyle='#1B1F26'; tctx.font='10px sans-serif'; tctx.textAlign='center';
  prop.widths.forEach((w,i)=>{
    const colW=w*scale;
    tctx.strokeStyle='#8A8577'; tctx.beginPath(); tctx.moveTo(x,wallY); tctx.lineTo(x,wallY+bracketPx); tctx.stroke();
    tctx.fillText(w+'mm', x+colW/2, wallY+bracketPx+16);
    if(prop.templates[i]==='F3'){ tctx.fillStyle='#C08A3E'; tctx.fillText('('+((prop.basketCounts&&prop.basketCounts[i])||4)+' basket)', x+colW/2, wallY+bracketPx+28); tctx.fillStyle='#1B1F26'; }
    x+=colW;
  });
  tctx.fillStyle='#3E6B8A'; tctx.font='11px sans-serif'; tctx.textAlign='left';
  tctx.fillText('600mm shell depth (dashed) · 450mm bracket depth (solid)', margin, wallY-12);
}

function drawTopLShape(lsd){
  lsTopCtx.clearRect(0,0,flexLsTopCanvas.width,flexLsTopCanvas.height);
  const rect=flexLsTopCanvas.getBoundingClientRect(); const W=rect.width,H=rect.height;
  lsTopCtx.fillStyle='#F4F1E9'; lsTopCtx.fillRect(0,0,W,H);
  const margin=70;
  const lenA=lsd.propA.actualLength, lenB=lsd.propB.actualLength;
  // fit both legs (plus their 600mm shell depth) inside the canvas using one consistent scale
  const scale = Math.min( (W-margin*2-140) / lenA, (H-margin*2-140) / lenB );
  const depthPx = 600*scale;   // full 600mm shell depth, to scale
  const bracketPx = 450*scale; // 450mm bracket depth, to scale
  const cornerX=margin, cornerY=margin;

  // shell outlines (600mm depth)
  lsTopCtx.strokeStyle='#C9C4B6'; lsTopCtx.setLineDash([4,3]); lsTopCtx.lineWidth=1;
  lsTopCtx.strokeRect(cornerX,cornerY,lenA*scale,depthPx);
  lsTopCtx.strokeRect(cornerX,cornerY,depthPx,lenB*scale);
  lsTopCtx.setLineDash([]);

  // bracket depth (450mm, solid)
  lsTopCtx.strokeStyle='#6A93AF'; lsTopCtx.lineWidth=1.5;
  lsTopCtx.strokeRect(cornerX,cornerY,lenA*scale,bracketPx);
  lsTopCtx.strokeRect(cornerX,cornerY,bracketPx,lenB*scale);

  // wall lines (thick, at the back)
  lsTopCtx.strokeStyle='#1B1F26'; lsTopCtx.lineWidth=3;
  lsTopCtx.beginPath(); lsTopCtx.moveTo(cornerX,cornerY); lsTopCtx.lineTo(cornerX+lenA*scale,cornerY); lsTopCtx.stroke();
  lsTopCtx.beginPath(); lsTopCtx.moveTo(cornerX,cornerY); lsTopCtx.lineTo(cornerX,cornerY+lenB*scale); lsTopCtx.stroke();

  // shade the losing leg's 600mm corner-clearance zone
  lsTopCtx.fillStyle = '#B5533C22';
  if(lsd.roleA==='losing') lsTopCtx.fillRect(cornerX,cornerY,600*scale,bracketPx);
  if(lsd.roleB==='losing') lsTopCtx.fillRect(cornerX,cornerY,bracketPx,600*scale);

  // corner marker
  lsTopCtx.fillStyle='#C08A3E'; lsTopCtx.beginPath(); lsTopCtx.arc(cornerX,cornerY,4,0,Math.PI*2); lsTopCtx.fill();
  lsTopCtx.font='11px sans-serif'; lsTopCtx.fillStyle='#C08A3E'; lsTopCtx.textAlign='left';
  lsTopCtx.fillText('Corner — '+(lsd.winCase.ownerA?'Leg A owns':'Leg B owns'), cornerX+8, cornerY-14);

  // Leg A section dividers + labels (horizontal, along the wall at y=cornerY)
  let x = cornerX + (lsd.roleA==='losing'?600*scale:0);
  lsTopCtx.strokeStyle='#8A8577'; lsTopCtx.font='10px sans-serif'; lsTopCtx.fillStyle='#1B1F26'; lsTopCtx.textAlign='center';
  lsd.propA.widths.forEach((w,i)=>{
    const colW=w*scale;
    lsTopCtx.beginPath(); lsTopCtx.moveTo(x,cornerY); lsTopCtx.lineTo(x,cornerY+bracketPx); lsTopCtx.stroke();
    lsTopCtx.fillText(w+'mm', x+colW/2, cornerY+bracketPx+16);
    if(lsd.propA.templates[i]==='F3'){ lsTopCtx.fillStyle='#C08A3E'; lsTopCtx.fillText('('+((lsd.propA.basketCounts&&lsd.propA.basketCounts[i])||4)+' basket)', x+colW/2, cornerY+bracketPx+30); lsTopCtx.fillStyle='#1B1F26'; }
    x+=colW;
  });
  lsTopCtx.textAlign='left'; lsTopCtx.fillStyle='#3E6B8A';
  lsTopCtx.fillText('Leg A — '+Math.round(lenA)+'mm', cornerX, cornerY+bracketPx+48);

  // Leg B section dividers + labels (vertical, along the wall at x=cornerX)
  let y = cornerY + (lsd.roleB==='losing'?600*scale:0);
  lsTopCtx.strokeStyle='#8A8577';
  lsd.propB.widths.forEach((w,i)=>{
    const colW=w*scale;
    lsTopCtx.beginPath(); lsTopCtx.moveTo(cornerX,y); lsTopCtx.lineTo(cornerX+bracketPx,y); lsTopCtx.stroke();
    lsTopCtx.save(); lsTopCtx.translate(cornerX+bracketPx+16, y+colW/2); lsTopCtx.rotate(Math.PI/2); lsTopCtx.textAlign='center'; lsTopCtx.fillStyle='#1B1F26';
    lsTopCtx.fillText(w+'mm'+(lsd.propB.templates[i]==='F3'?' ('+((lsd.propB.basketCounts&&lsd.propB.basketCounts[i])||4)+' basket)':''), 0,0);
    lsTopCtx.restore();
    y+=colW;
  });
  lsTopCtx.save(); lsTopCtx.translate(cornerX-14, cornerY+lenB*scale*0.5); lsTopCtx.rotate(-Math.PI/2);
  lsTopCtx.textAlign='center'; lsTopCtx.fillStyle='#3E6B8A'; lsTopCtx.fillText('Leg B — '+Math.round(lenB)+'mm',0,0);
  lsTopCtx.restore();

  // legend
  lsTopCtx.fillStyle='#3E6B8A'; lsTopCtx.font='10px sans-serif'; lsTopCtx.textAlign='left';
  lsTopCtx.fillText('Dashed = 600mm shell depth · Solid blue = 450mm bracket depth · Red tint = corner clearance zone (no shelving)', margin, H-16);
}

function renderSpecSheetStraight(d){
  const prop = currentProposal(d);
  let html = '<h3>Shell</h3><div class="spec-grid">';
  html += '<div><span class="k">Door opening:</span> '+Math.round(d.doorOpening)+'mm</div>';
  html += '<div><span class="k">Left:</span> '+d.left.desc+'</div>';
  html += '<div><span class="k">Right:</span> '+d.right.desc+'</div>';
  html += '<div><span class="k">Internal width:</span> '+Math.round(d.internalWidth)+'mm</div>';
  html += '<div><span class="k">Module budget:</span> '+Math.round(d.moduleBudget)+'mm</div></div>';

  html += '<h3>Door</h3><div class="spec-grid">';
  if(d.door.type==='none'){
    html += '<div><span class="k">Door:</span> None</div>';
  } else if(d.door.type==='infeasible'){
    html += '<div><span class="k">Door:</span> Infeasible — see warnings</div>';
  } else {
    html += '<div><span class="k">Door height:</span> '+Math.round(d.doorHeight)+'mm</div>';
    html += '<div><span class="k">Pelmet height:</span> '+Math.round(d.pelmetHeight)+'mm</div>';
    html += '<div><span class="k">Panels:</span> '+d.door.panelCount+' '+d.door.type+'</div>';
    const overlapNote = d.door.type==='sliding' ? ' (+20mm overlap)' : '';
    html += '<div><span class="k">Panel width:</span> '+Math.round(d.door.panelWidth)+'mm'+overlapNote+'</div>';
    if(d.door.type==='bifold' || d.door.type==='swing'){
      html += '<div><span class="k">Bifold pairs:</span> '+(d.door.bifoldPairs||0)+'</div>';
      html += '<div><span class="k">Swing panel:</span> '+(d.door.swingCount||0)+'</div>';
    }
  }
  html += '</div>';
  if(d.doorSplit){
    html += '<div class="ok-note">Wooden door split (Section 1.1): '+d.doorSplit.bottom+'mm bottom panel + '+Math.round(d.doorSplit.top)+'mm top panel.</div>';
  }
  if(d.doorMidRail){
    html += '<div class="ok-note">Aluminum bifold >2400mm: structural mid-rail added across the leaf (Section 1.1).</div>';
  }
  if(d.anchor && d.anchor.hingeUnits>0){
    html += '<div class="ok-note">Anchor points: '+d.anchor.hingeUnits+' hinge unit(s) → '+d.anchor.interiorPillars+' interior pillar(s) needed beyond the 2 end anchors (Section 1.1). Informational — no confirmed separate rate; assumed bundled into hinge unit pricing.</div>';
  }
  if(d.mirrorValid){
    html += '<div class="ok-note">Full-length pull-out mirror: mounted on the '+d.mirrorSide+' side (75mm clearance).</div>';
  }
  html += '<h3>Module Fill — Proposal '+state.proposal+'</h3>';
  if(!prop){ html += '<div style="color:var(--warn);">No valid proposal in this direction.</div>'; }
  else {
    html += '<div class="spec-grid"><div><span class="k">Sections:</span> '+prop.widths.join(' + ')+'mm</div>';
    html += '<div><span class="k">Actual built length:</span> '+Math.round(prop.actualLength)+'mm</div>';
    if(prop.bareWallMm) html += '<div><span class="k">Bare wall:</span> '+prop.bareWallMm.toFixed(0)+'mm</div>';
    html += '</div><div class="ok-note">'+prop.note+'</div>';
    if(prop.basketIndices.length>0){
      html += '<div class="ok-note" style="margin-top:8px;">Basket sections (Sec '+prop.basketIndices.map(i=>i+1).join(', ')+') verified against actual sliding panel boundaries (Section 5.1) — non-adjacent, each fits cleanly within one panel with ≥25mm clearance.</div>';
    }
    html += '<h3>Section Templates</h3>';
    prop.widths.forEach((w,i)=>{ const t=prop.templates[i], info=TEMPLATE_INFO[t]; const upgNote = state.internalHeightUpgrade ? ' + additional shelf @2400mm (height upgrade, applies to every section)' : ''; const basketNote = (t==='F3' && prop.basketCounts) ? ' — '+prop.basketCounts[i]+' basket(s) in this section' : ''; html += '<div style="margin-bottom:6px;"><b>'+(i+1)+'. '+w+'mm — '+t+' ('+info.name+')</b>'+basketNote+'<br><span class="k">'+info.desc+upgNote+'</span></div>'; });
  }
  if(d.warnings.length) html += '<div class="warn-box"><div class="w-title">Warnings</div><ul>'+d.warnings.map(w=>'<li>'+w+'</li>').join('')+'</ul></div>';
  document.getElementById('flexSpecSheet').innerHTML = html;
}

function renderSpecSheetLShape(lsd){
  let html = '';
  if(!lsd.valid){
    html = '<div class="warn-box"><div class="w-title">Invalid</div><ul>'+lsd.warnings.map(w=>'<li>'+w+'</li>').join('')+'</ul></div>';
    document.getElementById('flexLsSpecSheet').innerHTML = html; return;
  }
  html += '<h3>Corner Assignment</h3><div class="ok-note">'+(lsd.winCase.ownerA?'Leg A owns the corner (no extra deduction); Leg B loses it (−600mm).':'Leg B owns the corner; Leg A loses it (−600mm).')+' Chosen by minimizing combined deviation across both legs (Section 9.3).</div>';
  function legHtml(name, leg, prop, role, doorDetail, anchor){
    let h = '<h3>'+name+' ('+role+' corner)</h3><div class="spec-grid">';
    h += '<div><span class="k">Door opening:</span> '+Math.round(leg.doorOpening)+'mm</div>';
    h += '<div><span class="k">Module budget:</span> '+Math.round(leg.budget)+'mm</div>';
    h += '<div><span class="k">Sections:</span> '+prop.widths.join(' + ')+'mm</div>';
    h += '<div><span class="k">Actual built length:</span> '+Math.round(prop.actualLength)+'mm</div>';
    if(prop.bareWallMm) h += '<div><span class="k">Bare wall:</span> '+prop.bareWallMm.toFixed(0)+'mm</div>';
    h += '</div>';
    h += '<h3 style="margin-top:10px;">'+name+' Door</h3><div class="spec-grid">';
    if(leg.door.type==='none'){
      h += '<div><span class="k">Door:</span> None</div>';
    } else if(leg.door.type==='infeasible'){
      h += '<div><span class="k">Door:</span> Infeasible — see warnings</div>';
    } else {
      h += '<div><span class="k">Panels:</span> '+leg.door.panelCount+' '+leg.door.type+'</div>';
      const overlapNote = leg.door.type==='sliding' ? ' (+20mm overlap)' : '';
      h += '<div><span class="k">Panel width:</span> '+Math.round(leg.door.panelWidth)+'mm'+overlapNote+'</div>';
      if(leg.door.type==='bifold' || leg.door.type==='swing'){
        h += '<div><span class="k">Bifold pairs:</span> '+(leg.door.bifoldPairs||0)+'</div>';
        h += '<div><span class="k">Swing panel:</span> '+(leg.door.swingCount||0)+'</div>';
      }
    }
    h += '</div>';
    if(doorDetail && doorDetail.split) h += '<div class="ok-note">Wooden door split: '+doorDetail.split.bottom+'mm bottom + '+Math.round(doorDetail.split.top)+'mm top panel.</div>';
    if(doorDetail && doorDetail.midRail) h += '<div class="ok-note">Aluminum bifold >2400mm: structural mid-rail added.</div>';
    if(anchor && anchor.hingeUnits>0) h += '<div class="ok-note">Anchor points: '+anchor.hingeUnits+' hinge unit(s) → '+anchor.interiorPillars+' interior pillar(s) beyond the 2 end anchors.</div>';
    h += '<div class="ok-note">'+prop.note+'</div>';
    if(prop.clearance.applicable) h += '<div class="'+(prop.clearance.pass?'ok-note':'warn-box')+'" style="margin-top:8px;">Basket clearance: '+prop.clearance.results.map(r=>'Sec '+(r.index+1)+' — '+r.margin.toFixed(0)+'mm margin ('+(r.pass?'passes':'FAILS')+')').join('; ')+'</div>';
    prop.widths.forEach((w,i)=>{ const t=prop.templates[i], info=TEMPLATE_INFO[t]; const upgNote = state.ls.internalHeightUpgrade ? ' + additional shelf @2400mm (height upgrade, applies to every section)' : ''; const basketNote = (t==='F3' && prop.basketCounts) ? ' — '+prop.basketCounts[i]+' basket(s) in this section' : ''; h += '<div style="margin:6px 0;"><b>'+(i+1)+'. '+w+'mm — '+t+' ('+info.name+')</b>'+(i===0?' <span class="k">[corner]</span>':'')+basketNote+'<br><span class="k">'+info.desc+upgNote+'</span></div>'; });
    return h;
  }
  html += '<h3>Shared</h3><div class="spec-grid"><div><span class="k">Door height:</span> '+Math.round(lsd.doorHeight)+'mm</div><div><span class="k">Pelmet height:</span> '+Math.round(lsd.pelmetHeight)+'mm</div></div>';
  html += legHtml('Leg A', lsd.legA, lsd.propA, lsd.roleA, lsd.doorDetailA, lsd.anchorA);
  html += legHtml('Leg B', lsd.legB, lsd.propB, lsd.roleB, lsd.doorDetailB, lsd.anchorB);
  if(lsd.warnings.length) html += '<div class="warn-box"><div class="w-title">Warnings</div><ul>'+lsd.warnings.map(w=>'<li>'+w+'</li>').join('')+'</ul></div>';
  document.getElementById('flexLsSpecSheet').innerHTML = html;
}

function syncFlexLaminateControl(isWooden){
  const field = document.getElementById('flexLaminateField');
  const input = document.getElementById('flexLaminateQty');
  const hint = document.getElementById('flexLaminateHint');
  if(!field || !input || !hint) return;
  input.disabled = isWooden;
  field.style.opacity = isWooden ? '0.55' : '1';
  hint.textContent = isWooden
    ? 'Laminate is included by default for wooden doors (+$80/panel, already pooled into the hinge-unit cost above) — not entered separately here.'
    : 'Optional upgrade for sliding/aluminum doors — enter the number of pieces needed.';
}
function renderAddonsStraight(d){
  const prop = currentProposal(d);
  syncFlexLaminateControl(d.door.material==='wooden');
  let html='<h3>Base Configuration</h3><div class="spec-grid">';
  html += '<div><span class="k">Length:</span> '+state.length+'mm target</div>';
  html += '<div><span class="k">Actual (Prop '+state.proposal+'):</span> '+(prop?Math.round(prop.actualLength):'—')+'mm</div>';
  html += '<div><span class="k">Door:</span> '+d.door.type+(d.door.material?' ('+materialLabel(d.door.material)+')':'')+(d.door.autoMaterial?' — material assumed':'')+'</div>';
  html += '<div><span class="k">Sections:</span> '+(prop?prop.widths.join('+')+'mm':'—')+'</div></div>';
  document.getElementById('flexBaseConfigSummary').innerHTML = html;
  if(!prop){ document.getElementById('flexAddonPriceSheet').innerHTML='<h3>Pricing</h3><div>No valid proposal to price.</div>'; return; }
  const p = computePriceStraight(state, d, prop);
  let ph='<h3>Pricing</h3>';
  p.lines.forEach(l=> ph += '<div class="price-line"><span>'+l.label+'</span><span class="amt">$'+l.amt.toFixed(2)+'</span></div>');
  ph += '<div class="price-total"><span class="label">Total (excl. GST)</span><span class="amount">$'+p.total.toFixed(2)+'</span></div>';
  document.getElementById('flexAddonPriceSheet').innerHTML = ph;
}
function renderAddonsLShape(lsd){
  syncFlexLaminateControl(lsd.valid && (lsd.legA.door.material==='wooden' || lsd.legB.door.material==='wooden'));
  let html='<h3>Base Configuration — L-Shape</h3>';
  if(!lsd.valid){ document.getElementById('flexBaseConfigSummary').innerHTML=html+'<div>Invalid configuration.</div>'; document.getElementById('flexAddonPriceSheet').innerHTML=''; return; }
  html += '<div class="spec-grid">';
  html += '<div><span class="k">Leg A actual:</span> '+Math.round(lsd.propA.actualLength)+'mm ('+lsd.roleA+')</div>';
  html += '<div><span class="k">Leg B actual:</span> '+Math.round(lsd.propB.actualLength)+'mm ('+lsd.roleB+')</div>';
  html += '<div><span class="k">Leg A door:</span> '+lsd.legA.door.type+'</div>';
  html += '<div><span class="k">Leg B door:</span> '+lsd.legB.door.type+'</div></div>';
  document.getElementById('flexBaseConfigSummary').innerHTML = html;
  const p = computePriceLShape(state, lsd);
  let ph='<h3>Pricing</h3>';
  p.lines.forEach(l=> ph += '<div class="price-line"><span>'+l.label+'</span><span class="amt">$'+l.amt.toFixed(2)+'</span></div>');
  ph += '<div class="price-total"><span class="label">Total (excl. GST)</span><span class="amount">$'+p.total.toFixed(2)+'</span></div>';
  document.getElementById('flexAddonPriceSheet').innerHTML = ph;
}
/* ============ quote helpers ============ */
function formatDateDDMMMYYYY(date){
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return String(date.getDate()).padStart(2,'0')+'/'+months[date.getMonth()]+'/'+date.getFullYear();
}
function doorSystemLine(door, material, doorHeight){
  if(door.type==='none') return 'No door — internal-only configuration';
  if(door.type==='sliding') return door.panelCount+'-panel sliding door system: height '+Math.round(doorHeight)+'mm, aluminium frame with glass/tinted glass';
  const matLabel = material==='wooden' ? 'wooden hinged/bifold' : 'aluminium hinged/bifold';
  const panelWord = door.panelCount===1 ? 'single swing' : 'bifold';
  return door.panelCount+'-panel '+matLabel+' door system ('+panelWord+'): height '+Math.round(doorHeight)+'mm';
}
function doorSummaryShort(door, material){
  if(door.type==='none') return 'No door';
  if(door.type==='sliding') return door.panelCount+'-panel sliding (aluminium frame, glass/tinted glass)';
  const matLabel = material==='wooden' ? 'wooden' : 'aluminium';
  return door.panelCount+'-panel '+matLabel+' '+(door.panelCount===1?'single swing':'hinged/bifold');
}
function suggestedBasketQty(prop){
  if(!prop) return 0;
  return prop.basketActualQty || 0;
}
function internalHeightMm(upgrade){ return upgrade ? 2400 : 2100; }

const HAUSFLEX_CONSTRUCTION_NOTE = function(internalH, basketQty){
  return [
    'Unless otherwise stated, all HausFlex systems quoted herein are constructed with:',
    '- SPCC-grade metal framework with powder coating',
    '- Modular track-based structure (white color), top-hung and wall-mounted, adjustable',
    '- Free internal configuration up to '+internalH+' mm height (includes hanging bars, shelving, and wire basket)',
    '- '+basketQty+'x of wire basket will be specified further in quotation'
  ].join('\n');
};

function flexInclusionLines(s){
  const inclusionLines = [];
  if(s.internalHeightUpgrade || s.ls.internalHeightUpgrade) inclusionLines.push('Internal height upgraded to 2400mm');
  if(s.flexMirrorQty > 0) inclusionLines.push(s.flexMirrorQty + ' full mirror door panel(s)');
  if(s.flexLaminateQty > 0) inclusionLines.push(s.flexLaminateQty + ' laminate finish piece(s)');
  if(s.flexTrouserHangerQty > 0) inclusionLines.push(s.flexTrouserHangerQty + ' trouser hanger(s)');
  if(s.flexPulloutMirrorQty > 0) inclusionLines.push(s.flexPulloutMirrorQty + ' full-length pull-out mirror(s)');
  if(s.flexDismantle) inclusionLines.push('Dismantle & disposal of existing wardrobe/fixtures');
  if(s.flexAddonRelocatePoint > 0) inclusionLines.push(s.flexAddonRelocatePoint + ' relocated switch/power point(s)');
  if(s.flexAddonNewSwitch > 0) inclusionLines.push(s.flexAddonNewSwitch + ' new light switch(es)');
  if(s.flexLed) inclusionLines.push('LED lighting (' + (s.flexAddonLedLength||0).toFixed(1) + 'm)');
  if(s.flexAddonSensor > 0) inclusionLines.push(s.flexAddonSensor + ' wired sensor(s)');
  return inclusionLines;
}
function flexExcludesLines(s){
  const lines = ['Exclude (unless quoted separately):'];
  const electricalCovered = s.flexAddonRelocatePoint > 0 || s.flexAddonNewSwitch > 0;
  if(electricalCovered){
    lines.push('- Electrical works — aircon/ceiling fan shifting not included unless specified separately (switch/plug relocation and new points for this job are included above)');
  } else {
    lines.push('- Electrical works (e.g. switch/plug relocation, new electrical points, aircon/ceiling fan shifting)');
  }
  if(!s.flexDismantle){
    lines.push('- General works (dismantle/disposal of existing cabinetry/fixtures)');
  }
  lines.push('- Floor & Wall works (e.g. paint touch up or full repainting, floor polish/repair/leveling)');
  return lines.join('\n');
}

function renderQuoteStraight(d){
  const prop = currentProposal(d);
  if(!prop){ document.getElementById('quotePreview').textContent='No valid proposal available.'; return; }
  const p = computePriceStraight(state, d, prop);
  const basketQty = state.flexWireBasketQty || suggestedBasketQty(prop);
  const internalH = internalHeightMm(state.internalHeightUpgrade);
  const today = new Date();
  const validUntil = new Date(today); validUntil.setMonth(validUntil.getMonth()+1);
  let lines=[];
  lines.push('*HausFlex Wardrobe Quotation*');
  lines.push('Date: '+formatDateDDMMMYYYY(today));
  lines.push('Dimensions: '+Math.round(prop.actualLength)+' x '+state.ceiling+' x 600mm');
  lines.push('Door: '+doorSummaryShort(d.door, d.door.material));
  lines.push('Wire baskets: '+basketQty+' unit(s)');
  lines.push('');
  lines.push(HAUSFLEX_CONSTRUCTION_NOTE(internalH, basketQty));
  if(d.door.type!=='none'){
    lines.push('- '+doorSystemLine(d.door, d.door.material, d.doorHeight));
    lines.push('- Track/partition framework built up to '+state.ceiling+'mm height, finished in white powder coat');
  }
  const inclusionLines = flexInclusionLines(state);
  if(inclusionLines.length){
    lines.push('');
    lines.push('_Additional inclusions for this quote:_');
    inclusionLines.forEach(l => lines.push('- ' + l));
  }
  lines.push('');
  lines.push(flexExcludesLines(state));
  lines.push('');
  lines.push('*Total (before GST): $'+p.total.toFixed(2)+'*');
  lines.push('_This quote is valid until '+formatDateDDMMMYYYY(validUntil)+'._');
  document.getElementById('quotePreview').textContent = lines.join('\n');
}
function renderQuoteLShape(lsd){
  if(!lsd.valid){ document.getElementById('quotePreview').textContent='No valid L-shape configuration for these inputs.'; return; }
  const p = computePriceLShape(state, lsd);
  const basketQty = state.flexWireBasketQty || (suggestedBasketQty(lsd.propA) + suggestedBasketQty(lsd.propB));
  const internalH = internalHeightMm(state.ls.internalHeightUpgrade);
  const today = new Date();
  const validUntil = new Date(today); validUntil.setMonth(validUntil.getMonth()+1);
  let lines=[];
  lines.push('*HausFlex L-Shaped Wardrobe Quotation*');
  lines.push('Date: '+formatDateDDMMMYYYY(today));
  lines.push('Dimensions: Leg A '+Math.round(lsd.propA.actualLength)+'mm x Leg B '+Math.round(lsd.propB.actualLength)+'mm x '+state.ls.ceiling+' x 600mm');
  lines.push('Door — Leg A: '+doorSummaryShort(lsd.legA.door, lsd.legA.door.material));
  lines.push('Door — Leg B: '+doorSummaryShort(lsd.legB.door, lsd.legB.door.material));
  lines.push('Wire baskets: '+basketQty+' unit(s)');
  lines.push('');
  lines.push(HAUSFLEX_CONSTRUCTION_NOTE(internalH, basketQty));
  if(lsd.legA.door.type!=='none') lines.push('- Leg A: '+doorSystemLine(lsd.legA.door, lsd.legA.door.material, lsd.doorHeight));
  if(lsd.legB.door.type!=='none') lines.push('- Leg B: '+doorSystemLine(lsd.legB.door, lsd.legB.door.material, lsd.doorHeight));
  lines.push('- Track/partition framework built up to '+state.ls.ceiling+'mm height, finished in white powder coat');
  const inclusionLines = flexInclusionLines(state);
  if(inclusionLines.length){
    lines.push('');
    lines.push('_Additional inclusions for this quote:_');
    inclusionLines.forEach(l => lines.push('- ' + l));
  }
  lines.push('');
  lines.push(flexExcludesLines(state));
  lines.push('');
  lines.push('*Total (before GST): $'+p.total.toFixed(2)+'*');
  lines.push('_This quote is valid until '+formatDateDDMMMYYYY(validUntil)+'._');
  document.getElementById('quotePreview').textContent = lines.join('\n');
}
/* ============ wiring ============ */
document.getElementById('flexLengthInput').addEventListener('input', e=>{ state.length=Number(e.target.value)||0; render(); });
document.getElementById('flexCeilingInput').addEventListener('input', e=>{ state.ceiling=Number(e.target.value)||2600; render(); });

function wireSide(prefix, obj){
  const typeSel = document.getElementById(prefix+'Type');
  const beamFields = document.getElementById(prefix+'BeamFields');
  typeSel.addEventListener('change', ()=>{
    obj.type = typeSel.value;
    beamFields.classList.toggle('show', typeSel.value==='beam');
    render();
  });
  const bw = document.getElementById(prefix+'BeamWidth');
  bw.addEventListener('input', ()=>{ obj.beamWidth = Number(bw.value)||0; render(); });
}
wireSide('flexLeft', state.left);
wireSide('flexRight', state.right);
wireSide('flexLegA', state.ls.legA.outer);
wireSide('flexLegB', state.ls.legB.outer);

document.getElementById('flexLegALength').addEventListener('input', e=>{ state.ls.legA.length=Number(e.target.value)||0; render(); });
document.getElementById('flexLegBLength').addEventListener('input', e=>{ state.ls.legB.length=Number(e.target.value)||0; render(); });
document.getElementById('flexLsCeilingInput').addEventListener('input', e=>{ state.ls.ceiling=Number(e.target.value)||2600; render(); });

document.querySelectorAll('#flexShapeToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#flexShapeToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.shape = btn.dataset.shape;
    resizeCanvas();
  });
});
document.querySelectorAll('#flexDoorRequiredToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#flexDoorRequiredToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.doorRequired = btn.dataset.required==='yes'; render();
  });
});
document.querySelectorAll('#flexLsDoorRequiredToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#flexLsDoorRequiredToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.ls.doorRequired = btn.dataset.required==='yes'; render();
  });
});
document.getElementById('flexDoorTypePref').addEventListener('change', e=>{ state.flexDoorTypePref = e.target.value; render(); });
document.getElementById('flexLsDoorTypePref').addEventListener('change', e=>{ state.ls.doorTypePref = e.target.value; render(); });
document.querySelectorAll('#flexProposalToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#flexProposalToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.proposal = btn.dataset.prop; render();
  });
});
document.getElementById('flexChkDoorHeightUpgrade').addEventListener('click', function(){ state.doorHeightUpgrade=!state.doorHeightUpgrade; this.classList.toggle('on',state.doorHeightUpgrade); render(); });
document.getElementById('flexChkInternalHeightUpgrade').addEventListener('click', function(){ state.internalHeightUpgrade=!state.internalHeightUpgrade; this.classList.toggle('on',state.internalHeightUpgrade); render(); });
document.getElementById('flexPulloutMirrorQty').addEventListener('input', e=>{ state.flexPulloutMirrorQty=Number(e.target.value)||0; render(); });
document.getElementById('flexLsChkDoorHeightUpgrade').addEventListener('click', function(){ state.ls.doorHeightUpgrade=!state.ls.doorHeightUpgrade; this.classList.toggle('on',state.ls.doorHeightUpgrade); render(); });
document.getElementById('flexLsChkInternalHeightUpgrade').addEventListener('click', function(){ state.ls.internalHeightUpgrade=!state.ls.internalHeightUpgrade; this.classList.toggle('on',state.ls.internalHeightUpgrade); render(); });

document.getElementById('flexMirrorQty').addEventListener('input', e=>{ state.flexMirrorQty=Number(e.target.value)||0; render(); });
document.getElementById('flexLaminateQty').addEventListener('input', e=>{ state.flexLaminateQty=Number(e.target.value)||0; render(); });
document.getElementById('flexWireBasketQty').addEventListener('input', e=>{ state.flexWireBasketQty=Number(e.target.value)||0; state.wireBasketTouched=true; render(); });
document.getElementById('flexTrouserHangerQty').addEventListener('input', e=>{ state.flexTrouserHangerQty=Number(e.target.value)||0; render(); });

const flexChkDismantle = document.getElementById('flexChkDismantle');
flexChkDismantle.addEventListener('click', ()=>{ state.flexDismantle=!state.flexDismantle; flexChkDismantle.classList.toggle('on', state.flexDismantle); render(); });
document.getElementById('flexAddonRelocatePoint').addEventListener('input', e=>{ state.flexAddonRelocatePoint=Number(e.target.value)||0; render(); });
document.getElementById('flexAddonNewSwitch').addEventListener('input', e=>{ state.flexAddonNewSwitch=Number(e.target.value)||0; render(); });
const flexChkLed = document.getElementById('flexChkLed');
const flexLedLengthField = document.getElementById('flexLedLengthField');
flexChkLed.addEventListener('click', ()=>{
  state.flexLed=!state.flexLed; flexChkLed.classList.toggle('on', state.flexLed);
  flexLedLengthField.style.display = state.flexLed ? 'block' : 'none';
  render();
});
document.getElementById('flexAddonLedLength').addEventListener('input', e=>{ state.flexAddonLedLength=Math.max(0, Number(e.target.value)||0); render(); });
document.getElementById('flexAddonSensor').addEventListener('input', e=>{ state.flexAddonSensor=Number(e.target.value)||0; render(); });

document.querySelectorAll('.flex-tab-btn:not(.flex-ls-tab-btn)').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.flex-tab-btn:not(.flex-ls-tab-btn)').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view=btn.dataset.view;
    canvas.style.display = view==='ext'?'block':'none';
    internalCanvas.style.display = view==='int'?'block':'none';
    topCanvas.style.display = view==='top'?'block':'none';
    resizeCanvas();
  });
});
document.querySelectorAll('.flex-ls-tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.flex-ls-tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    resizeCanvas();
  });
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

return { render: render, resizeCanvas: resizeCanvas };
})();

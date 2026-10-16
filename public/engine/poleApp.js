
window.PoleApp = (function(){

function roundFeet(mm){ return Math.round((mm / 304.8) * 10) / 10; }

// Small-order billing rule: under 4.5ft gets a $150 labor/transport surcharge on top of actual footage;
// 4.5-5ft is billed at a flat 5ft minimum (no surcharge); above 5ft, bill actual footage.
function applyMinBilling(feet){
  if(feet < 4.5) return { billFeet: feet, surcharge: 150, note: 'Order under 4.5ft — $150 labor/transport surcharge applies (Pricing Guideline Section 7).' };
  if(feet <= 5) return { billFeet: 5, surcharge: 0, note: 'Order between 4.5–5ft — billed at 5ft minimum.' };
  return { billFeet: feet, surcharge: 0, note: null };
}

const state = {
  shape: 'straight',
  length: 2700, ceiling: 2600, depth: 600,
  left: { type: 'none', beamWidth: 130 },
  right: { type: 'none', beamWidth: 130 },
  doorRequired: true,
  doorTypePref: 'auto',
  doorType: 'sliding',
  doorAutoMaterial: false,
  doorForcedSwing: false,
  doorHeightUpgrade: false,
  hangingRod: true,
  ls: {
    ceiling: 2600, depth: 600, doorTypePref: 'auto',
    legALength: 1900, legAWall: 'none', legABeamWidth: 130, legADoorType: 'auto',
    legBLength: 1250, legBWall: 'none', legBBeamWidth: 130, legBDoorType: 'auto',
    doorHeightUpgrade: false, internalHeightUpgrade: false
  },
  internalHeightUpgrade: false,
  mirrorQty: 0,
  laminateQty: 0,
  addonExtraDrawers: 0,
  addonSecretDrawer: 0,
  addonDrawerHead: 0,
  dismantle: false,
  addonRelocatePoint: 0,
  addonNewSwitch: 0,
  led: false,
  addonLedLength: 1.5,
  addonSensor: 0,
  addonWireBasket: 0,
  addonTrouserHolder: 0,
  addonDoubleTrouser: 0,
  addonPulloutTrouser: 0,
  addonFullMirror: 0,
  addonBoxMirror: 0,
  addonFlipMirror: 0,
  poleFinish: 'silver'
};

function sideElement(side){
  if(side.type === 'none') return { width: 60, kind: 'partition', desc: '60mm partition (open side)' };
  if(side.type === 'wall') return { width: 50, kind: 'pillar', desc: '50mm wall pillar' };
  // beam
  const width = side.beamWidth + 30;
  return { width, kind: 'beampillar', desc: width + 'mm beam pillar (' + side.beamWidth + 'mm beam + 30mm)' };
}

/* ---------- door type resolution (auto sliding->bifold->swing fallback, or forced preference) ---------- */
function resolvePoleDoorType(opening, doorRequired, pref){
  if(!doorRequired || opening <= 0) return { doorType: 'none', infeasible: false, autoMaterial: false, forcedSwing: false };
  function fitSliding(){
    let n = 2;
    while(n <= 10){ const w = opening / n; if(w + 20 <= 1100 && w >= 600) return true; n++; }
    return false;
  }
  function fitBifold(forceSingle){
    if(forceSingle) return opening >= 350;
    let n = 1;
    while(n <= 16){ const w = opening / n; if(w <= 600) break; n++; }
    return (opening / n) >= 350;
  }
  if(pref === 'sliding') return { doorType: 'sliding', infeasible: !fitSliding(), autoMaterial: false, forcedSwing: false };
  if(pref === 'wooden')  return { doorType: 'wooden',  infeasible: !fitBifold(false), autoMaterial: false, forcedSwing: false };
  if(pref === 'aluminum')return { doorType: 'aluminum',infeasible: !fitBifold(false), autoMaterial: false, forcedSwing: false };
  if(pref === 'swing')   return { doorType: 'wooden',  infeasible: !fitBifold(true),  autoMaterial: false, forcedSwing: true };
  // auto: sliding -> bifold -> single swing fallback, wooden assumed on any hinged fallback
  if(fitSliding()) return { doorType: 'sliding', infeasible: false, autoMaterial: false, forcedSwing: false };
  if(fitBifold(false)) return { doorType: 'wooden', infeasible: false, autoMaterial: true, forcedSwing: false };
  return { doorType: 'wooden', infeasible: false, autoMaterial: true, forcedSwing: true };
}

function computeDesign(s){
  const warnings = [];
  const notes = [];

  const leftRaw = sideElement(s.left);
  const rightRaw = sideElement(s.right);
  const depth = Math.min(s.depth, 750);

  const left = leftRaw, right = rightRaw;
  const doorOpening = s.length - left.width - right.width;
  if(doorOpening < 300) warnings.push('Door opening (' + Math.round(doorOpening) + 'mm) is very narrow after partitions/pillars — check inputs.');

  const doorResolution = resolvePoleDoorType(doorOpening, s.doorRequired, s.doorTypePref);
  s.doorType = doorResolution.infeasible ? 'none' : doorResolution.doorType;
  s.doorAutoMaterial = doorResolution.autoMaterial;
  s.doorForcedSwing = doorResolution.forcedSwing;
  if(doorResolution.infeasible){
    const prefLabel = s.doorTypePref === 'swing' ? 'single swing' : s.doorTypePref;
    warnings.push('Requested door type ("' + prefLabel + '") does not fit this opening (' + Math.round(doorOpening) + 'mm) — no door drawn. Switch to Auto or a different requested type.');
  }
  if(doorResolution.autoMaterial && s.doorType !== 'none'){
    notes.push('Door type auto-resolved to ' + s.doorType + ' hinged/bifold — material assumed, confirm with customer.');
  }

  const shelfDepth = Math.min(430, depth - 100);
  if(s.hangingRod && depth < 550){
    warnings.push('Hanging rod needs depth ≥550mm to avoid slanted hanging — current depth ' + depth + 'mm. Increase depth or remove hanging rod.');
  }

  const ceilingGap = 50;
  const maxBudget = s.ceiling - ceilingGap;
  const upgradeAvailable = s.ceiling > 2450;
  const useUpgrade = upgradeAvailable && s.doorHeightUpgrade;

  let doorHeight = 0, pelmetHeight = 0, splitInfo = null;
  if(s.doorType !== 'none'){
    if(!useUpgrade){
      // Default: 2400mm door, rest is pelmet. If ceiling too low for 2400+50 pelmet, shrink to fit.
      doorHeight = Math.min(2400, maxBudget);
      if(s.ceiling <= 2450){
        notes.push('Ceiling (' + s.ceiling + 'mm) is at or below 2450mm — door height set to ' + Math.round(doorHeight) + 'mm (2400mm standard not fully available); no upgrade option at this ceiling height.');
      } else {
        notes.push('Standard door height 2400mm used. Ceiling budget allows up to ' + maxBudget + 'mm — enable the height upgrade to use more (additional cost).');
      }
    } else if(s.doorType === 'sliding' || s.doorType === 'aluminum'){
      const cap = 2800;
      doorHeight = Math.min(maxBudget, cap);
      if(s.doorType === 'aluminum' && doorHeight > 2400){
        splitInfo = { type: 'midrail', at: 2400 };
      }
      if(maxBudget > cap) notes.push('Height budget (' + maxBudget + 'mm) exceeds the ' + cap + 'mm door-type max — door capped at ' + cap + 'mm, remainder becomes pelmet.');
    } else if(s.doorType === 'wooden'){
      const single = 2400;
      if(maxBudget <= single){
        doorHeight = maxBudget;
      } else if(maxBudget >= 2680){
        doorHeight = maxBudget;
        splitInfo = { type: 'split', bottom: 2080, top: doorHeight - 2080 };
      } else {
        doorHeight = single;
        warnings.push('Height budget (' + maxBudget + 'mm) falls between 2400mm (single-panel max) and 2680mm (minimum valid split: 2080+600mm) — wooden doors can\'t use either option cleanly here. Door capped at 2400mm; consider aluminum bifold instead if you want to use the full height.');
      }
    }
    pelmetHeight = s.ceiling - doorHeight;
    if(pelmetHeight < 50){
      doorHeight -= (50 - pelmetHeight);
      pelmetHeight = 50;
      notes.push('Door height trimmed to preserve the 50mm minimum pelmet band.');
    }
  }

  let panelCount = 0, panelWidth = 0, hingeUnits = 0, bifoldPairs = 0, swingCount = 0, interiorPillars = 0;
  if(s.doorType === 'sliding'){
    let n = 2; // sliding always needs at least 2 panels to actually slide — n=1 is never valid
    while(n <= 10){
      const w = doorOpening / n;
      if(w + 20 <= 1100 && w >= 600) break;
      n++;
    }
    panelCount = n; panelWidth = doorOpening / n;
    if(panelWidth + 20 > 1100 || panelWidth < 600) warnings.push('Sliding panel width (' + panelWidth.toFixed(0) + 'mm) could not be resolved within the 600–1100mm bound (minimum 2 panels) — check opening width, or consider bifold/swing per the fallback hierarchy.');
  } else if(s.doorType === 'wooden' || s.doorType === 'aluminum'){
    let n = 1;
    if(!s.doorForcedSwing){
      while(n <= 16){
        const w = doorOpening / n;
        if(w <= 600) break;
        n++;
      }
    }
    panelWidth = doorOpening / n;
    panelCount = n;
    if(panelWidth < 350) warnings.push('Panel width (' + panelWidth.toFixed(0) + 'mm) is below the 350mm minimum — opening may be too narrow for hinged/bifold on this run.');
    bifoldPairs = Math.floor(n / 2);
    swingCount = n % 2;
    hingeUnits = bifoldPairs + swingCount;
    interiorPillars = Math.max(0, Math.ceil((hingeUnits - 2) / 2));
  }

  const feet = roundFeet(s.length);
  let drawerCount;
  if(feet < 5) drawerCount = 2;
  else if(feet <= 8) drawerCount = 3;
  else if(feet <= 12) drawerCount = 4;
  else if(feet < 15) drawerCount = 6;
  else drawerCount = 8;

  const leftConstrained = left.kind !== 'partition';
  const rightConstrained = right.kind !== 'partition';
  let drawerPlacement;
  if(!leftConstrained && !rightConstrained){
    drawerPlacement = 'Both sides open — drawers can sit anywhere along the run.';
  } else {
    const sides = [leftConstrained ? 'left' : null, rightConstrained ? 'right' : null].filter(Boolean).join(' and ');
    drawerPlacement = 'Drawers must clear the ' + sides + ' side by an 80mm minimum buffer.';
  }
  if(s.doorType === 'sliding') drawerPlacement += ' Sliding doors: drawer front must also end 400mm before the edge of the door panel opening.';

  return { left, right, depth, notes, doorOpening, shelfDepth, doorHeight, pelmetHeight, splitInfo,
           panelCount, panelWidth, hingeUnits, bifoldPairs, swingCount, interiorPillars,
           drawerCount, drawerPlacement, warnings, maxBudget };
}

/* ---------- internal configuration (HausPole Design Methodology v1, Section 6) ---------- */
const POLE = 26, SET_BUFFER = 10, MAX_COL = 950, MIN_USEFUL = 300;
const STD_DRAWER_WIDTHS = [800, 610, 500];

function largestFitting(maxAvail){
  for(const w of STD_DRAWER_WIDTHS) if(w <= maxAvail) return w;
  return null;
}

function computeInternalLayout(s, d){
  const notes = [], warnings = [];
  const leftIsOpen = s.left.type === 'none';
  const rightIsOpen = s.right.type === 'none';
  // Internal structural width: open sides subtract their 60mm partition; wall sides (pillar or beam pillar) don't subtract — real wall backs them.
  const internalWidth = s.length - (leftIsOpen ? 60 : 0) - (rightIsOpen ? 60 : 0);

  let drawerWidth = null, bufferSeg = null, drawerSide = 'left';

  if(s.doorType === 'none'){
    // No door: general 80mm wall-buffer logic, no door-specific constraint. Default largest drawer.
    if(!leftIsOpen && !rightIsOpen){
      bufferSeg = 210; drawerSide = 'left';
      drawerWidth = largestFitting(internalWidth - bufferSeg - 3*POLE - SET_BUFFER);
    } else if(leftIsOpen){
      drawerSide = 'left';
      drawerWidth = largestFitting(internalWidth - 2*POLE - SET_BUFFER);
    } else {
      drawerSide = 'right';
      drawerWidth = largestFitting(internalWidth - 2*POLE - SET_BUFFER);
    }
  } else if(s.doorType === 'sliding'){
    const manufactured = d.panelWidth + 20;
    const effectiveOpening = d.doorOpening - manufactured;
    if(leftIsOpen && rightIsOpen){
      drawerSide = 'left';
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else if(leftIsOpen && !rightIsOpen){
      drawerSide = 'left';
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else if(!leftIsOpen && rightIsOpen){
      drawerSide = 'right';
      drawerWidth = largestFitting(effectiveOpening - POLE - 25);
    } else {
      // both wall — forced buffer segment before drawer
      bufferSeg = 210; drawerSide = 'left';
      const pushedIn = bufferSeg + 2*POLE;
      drawerWidth = largestFitting(effectiveOpening - pushedIn - 25);
      notes.push('Both sides walled: a ' + bufferSeg + 'mm buffer (plain shelving) is required before the drawer, since a drawer can\'t sit directly against a wall pillar.');
    }
    if(!drawerWidth) warnings.push('No standard drawer width fits the effective sliding-door clearance — check dimensions manually.');
  } else {
    // wooden / aluminum bifold — drawer defaults to the middle (free-edge boundary), no fold or wall-pillar penalty
    drawerSide = 'middle';
    drawerWidth = 800;
    notes.push('Bifold/hinged: drawer placed at the middle free-edge boundary (no fold clearance penalty there), defaulting to the largest standard width.');
  }

  if(!drawerWidth){
    warnings.push('Could not fit any standard drawer width — internal layout needs manual design.');
    return { internalWidth, notes, warnings, segments: [] };
  }

  const fixedWidth = drawerWidth + (bufferSeg || 0);
  const rawRemaining = internalWidth - fixedWidth;

  // Determine flex column count: prefer 2 (Type1 + Type4 variety) whenever each would stay usable; fall back to 1 if too tight, or cycle 3+ if remaining is too wide for 2.
  let flexCount, totalColumns, poles, deduction, remainingForFlex;
  function tryCount(n){
    totalColumns = (bufferSeg ? 1 : 0) + 1 + n;
    poles = totalColumns + 1;
    deduction = poles * POLE + SET_BUFFER;
    remainingForFlex = rawRemaining - deduction;
    return remainingForFlex;
  }

  let rem2 = tryCount(2);
  if(rem2 / 2 >= MIN_USEFUL && rem2 / 2 <= MAX_COL){
    flexCount = 2;
  } else if(rem2 / 2 > MAX_COL){
    // too wide even split two ways — use 3+ cycling pattern instead (approximate, then re-test)
    flexCount = Math.max(3, Math.ceil(rem2 / MAX_COL));
    tryCount(flexCount);
  } else {
    // too tight for 2 useful columns — fall back to 1
    flexCount = 1;
    tryCount(1);
  }

  if(remainingForFlex < 0){
    warnings.push('Internal layout does not fit — drawer and structural allowances exceed available width. Reduce length constraints or revisit door type.');
    return { internalWidth, notes, warnings, segments: [] };
  }

  const rawEach = remainingForFlex / flexCount;
  const evenEach = Math.floor(rawEach / 2) * 2;
  const totalEven = evenEach * flexCount;
  const installBuffer = remainingForFlex - totalEven;
  if(installBuffer > 8 || installBuffer < 0) notes.push('Install buffer landed at ' + installBuffer.toFixed(1) + 'mm (outside the usual 5–8mm range) — check rounding manually.');

  // Assign zone types
  const flexTypes = [];
  if(flexCount === 1){
    flexTypes.push('Type 4 (long hang)');
  } else if(flexCount === 2){
    flexTypes.push('Type 1 (double hanging)', 'Type 4 (long hang)');
  } else {
    const cycle = ['Type 4 (long hang)', 'Type 1 (double hanging)', 'Type 3 (shelves)'];
    for(let i = 0; i < flexCount; i++) flexTypes.push(cycle[i === 0 ? 0 : ((i - 1) % 2) + 1]);
  }

  // Build segment list left-to-right
  const segments = [];
  const drawerSeg = { label: 'Drawer bank', width: drawerWidth, type: d.drawerCount + '× M drawers + half-hang above' };

  if(drawerSide === 'middle'){
    const half = Math.floor(flexCount / 2);
    for(let i = 0; i < half; i++) segments.push({ label: 'Column', width: evenEach, type: flexTypes[i] });
    segments.push(Object.assign({}, drawerSeg, { label: 'Drawer bank (middle)' }));
    for(let i = half; i < flexCount; i++) segments.push({ label: 'Column', width: evenEach, type: flexTypes[i] });
  } else if(drawerSide === 'right'){
    for(let i = 0; i < flexCount; i++) segments.push({ label: 'Column', width: evenEach, type: flexTypes[i] });
    segments.push(drawerSeg);
  } else {
    // left (default and only case that can carry a forced buffer segment)
    if(bufferSeg) segments.push({ label: 'Shelf buffer (forced)', width: bufferSeg, type: 'Plain shelving' });
    segments.push(drawerSeg);
    for(let i = 0; i < flexCount; i++) segments.push({ label: 'Column', width: evenEach, type: flexTypes[i] });
  }

  return { internalWidth, notes, warnings, segments, poles, drawerWidth, bufferSeg, installBuffer };
}

/* ---------- L-shape (Methodology v1, Section 7) ---------- */
const LS_POLE = 26, LS_SETBUF = 10, LS_CORNER = 600, LS_MIN_USEFUL = 300;

function lsSlidingFit(opening){
  let n = 2; // sliding always needs at least 2 panels — n=1 never valid
  while(n <= 10){
    const w = opening / n;
    if(w + 20 <= 1100 && w >= 600) return { panelCount: n, panelWidth: w, valid: true };
    n++;
  }
  return { valid: false };
}

function lsBifoldFit(opening, forceSingle){
  if(forceSingle){
    if(opening < 350) return { valid: false };
    return { panelCount: 1, panelWidth: opening, valid: true, bifoldPairs: 0, swingCount: 1 };
  }
  let n = 1;
  while(n <= 16){
    const w = opening / n;
    if(w <= 600) break;
    n++;
  }
  const w = opening / n;
  if(w < 350) return { valid: false };
  return { panelCount: n, panelWidth: w, valid: true, bifoldPairs: Math.floor(n / 2), swingCount: n % 2 };
}

function lsOuterEnd(wallType, beamWidth){
  if(wallType === 'none') return 60;
  if(wallType === 'beam') return (beamWidth || 130) + 30;
  return 50;
}

// doorTypePref: 'none' (door not required) | 'auto' | 'sliding' | 'wooden' | 'aluminum' | 'swing'
function computeLegDoor(legLength, wallType, doorTypePref, beamWidth){
  const outerEnd = lsOuterEnd(wallType, beamWidth);
  const opening = legLength - outerEnd - LS_CORNER;
  const result = { outerEnd, opening };
  if(doorTypePref === 'none' || opening <= 0){
    return Object.assign(result, { type: 'none', material: null, valid: opening > 0 || doorTypePref === 'none' });
  }
  if(doorTypePref === 'auto'){
    const s = lsSlidingFit(opening);
    if(s.valid) return Object.assign(result, { type: 'sliding', material: null }, s);
    const b = lsBifoldFit(opening, false);
    if(b.valid) return Object.assign(result, { type: 'wooden', material: 'wooden', autoMaterial: true }, b,
      { note: 'Sliding did not fit this opening — fell back to bifold per the fallback hierarchy (wooden material assumed, confirm with customer).' });
    const sw = lsBifoldFit(opening, true);
    if(sw.valid) return Object.assign(result, { type: 'wooden', material: 'wooden', autoMaterial: true }, sw,
      { note: 'Opening too narrow for sliding or bifold minimums — forced to a single swing door (wooden material assumed, confirm with customer).' });
    return Object.assign(result, { type: 'none', valid: false, note: 'No standard door configuration fits this opening — needs manual design.' });
  }
  if(doorTypePref === 'sliding'){
    const s = lsSlidingFit(opening);
    if(s.valid) return Object.assign(result, { type: 'sliding', material: null }, s);
    return Object.assign(result, { type: 'none', valid: false, note: 'Requested sliding door does not fit this opening (' + Math.round(opening) + 'mm) — needs Auto or a different requested type.' });
  }
  if(doorTypePref === 'wooden' || doorTypePref === 'aluminum'){
    const b = lsBifoldFit(opening, false);
    if(b.valid) return Object.assign(result, { type: doorTypePref, material: doorTypePref }, b);
    return Object.assign(result, { type: 'none', valid: false, note: 'Requested ' + doorTypePref + ' bifold does not fit this opening (' + Math.round(opening) + 'mm) — needs Auto or a different requested type.' });
  }
  // doorTypePref === 'swing'
  const sw = lsBifoldFit(opening, true);
  if(sw.valid) return Object.assign(result, { type: 'wooden', material: 'wooden' }, sw);
  return Object.assign(result, { type: 'none', valid: false, note: 'Requested single swing door does not fit this opening (' + Math.round(opening) + 'mm) — needs Auto or a different requested type.' });
}

function lsDrawerCeiling(leg){
  if(!leg.door || leg.door.type === 'none') return 800;
  if(leg.door.type === 'sliding'){
    const manuf = leg.door.panelWidth + 20;
    const eff = leg.door.opening - manuf;
    return Math.max(0, eff - LS_POLE - 25);
  }
  // bifold / wooden / aluminum / swing — use per-panel width minus 150mm fold clearance
  return Math.max(0, leg.door.panelWidth - 150);
}

function lsDrawerStackCheck(count){
  if(count === 2) return { fits: true, mode: 'top-down', topEdge: 1100 };
  const maxFit = Math.floor((1100 - 150) / 190); // = 5
  if(count <= maxFit) return { fits: true, mode: 'bottom-up', topEdge: 150 + count * 190 };
  return { fits: false, maxFit };
}

function computeLShape(s){
  const warnings = [], notes = [];
  const legAWallType = s.ls.legAWall, legBWallType = s.ls.legBWall;
  const doorA = computeLegDoor(s.ls.legALength, legAWallType, s.ls.legADoorType, s.ls.legABeamWidth);
  const doorB = computeLegDoor(s.ls.legBLength, legBWallType, s.ls.legBDoorType, s.ls.legBBeamWidth);
  if(doorA.note) notes.push('Leg A: ' + doorA.note);
  if(doorB.note) notes.push('Leg B: ' + doorB.note);
  if(doorA.valid === false) warnings.push('Leg A door does not fit — check dimensions.');
  if(doorB.valid === false) warnings.push('Leg B door does not fit — check dimensions.');

  const longIsA = s.ls.legALength >= s.ls.legBLength;
  const longLeg = { name: longIsA ? 'A' : 'B', length: longIsA ? s.ls.legALength : s.ls.legBLength, wallType: longIsA ? legAWallType : legBWallType, door: longIsA ? doorA : doorB };
  const shortLeg = { name: longIsA ? 'B' : 'A', length: longIsA ? s.ls.legBLength : s.ls.legALength, wallType: longIsA ? legBWallType : legAWallType, door: longIsA ? doorB : doorA };

  function outerDeduct(wallType){ return wallType === 'none' ? 60 : 0; }
  const longFurnWidth = longLeg.length - outerDeduct(longLeg.wallType);
  const shortFurnWidth = shortLeg.length - outerDeduct(shortLeg.wallType) - LS_CORNER;
  if(shortFurnWidth <= 0) warnings.push('Short leg (' + shortLeg.name + ') has zero or negative internal width after the 600mm corner deduction — this leg is too short to support furniture on its own.');

  const feet = roundFeet(s.ls.legALength + s.ls.legBLength);
  let drawerCount;
  if(feet < 5) drawerCount = 2;
  else if(feet <= 8) drawerCount = 3;
  else if(feet <= 12) drawerCount = 4;
  else if(feet < 15) drawerCount = 6;
  else drawerCount = 8;

  const stack = lsDrawerStackCheck(drawerCount);
  // Note: whether this actually needs manual placement is now resolved below (split across legs if possible,
  // otherwise a specific warning is raised there) — no blanket warning here anymore.

  function attemptDrawer(leg, availAfterCornerAndPoles){
    if(availAfterCornerAndPoles <= 0) return null;
    const ceiling = lsDrawerCeiling(leg);
    const opts = [800, 610, 500];
    for(const w of opts){
      if(w <= ceiling && w <= availAfterCornerAndPoles && (availAfterCornerAndPoles - w) >= LS_MIN_USEFUL) return w;
    }
    for(const w of opts){ if(w <= ceiling && w <= availAfterCornerAndPoles) return w; }
    return null;
  }

  // Long leg: 3 columns total = corner(fixed 600) + [drawer?] + 1 flex. Poles = 4.
  const longPolesBuf = 4 * LS_POLE + LS_SETBUF;
  const longAvailAfterCorner = longFurnWidth - LS_CORNER - longPolesBuf;

  // Short leg: only split into corner(fixed 600) + 1 more column if there's actually room for both.
  // Otherwise collapse to a SINGLE column using whatever width remains (it's corner-most by definition — no drawer possible there).
  const shortPolesBufTwoCol = 3 * LS_POLE + LS_SETBUF; // 2 columns = 3 poles
  const shortCanSplit = shortFurnWidth >= (LS_CORNER + shortPolesBufTwoCol + LS_MIN_USEFUL);
  const shortAvailAfterCorner = shortCanSplit ? (shortFurnWidth - LS_CORNER - shortPolesBufTwoCol) : null;
  const shortSingleColWidth = shortCanSplit ? null : Math.max(0, shortFurnWidth - 2 * LS_POLE); // 1 column = 2 poles
  if(!shortCanSplit) notes.push('Short leg (' + shortLeg.name + ') is too short to afford a fixed 600mm corner column plus a second column — collapsed to a single ' + Math.round(shortSingleColWidth) + 'mm hang column spanning the whole leg. No drawer possible on this leg.');

  let drawerLeg = null, drawerWidth = null, drawerWidthShort = null, longFlexWidth = null, shortFlexWidth = null;
  let drawerCountLong = null, drawerCountShort = null;

  if(stack.fits){
    drawerWidth = attemptDrawer(longLeg, longAvailAfterCorner);
    if(drawerWidth){
      drawerLeg = 'long';
      longFlexWidth = longAvailAfterCorner - drawerWidth;
      shortFlexWidth = shortCanSplit ? shortAvailAfterCorner : shortSingleColWidth;
    } else if(shortCanSplit){
      drawerWidth = attemptDrawer(shortLeg, shortAvailAfterCorner);
      if(drawerWidth){
        drawerLeg = 'short';
        shortFlexWidth = null; // drawer occupies the short leg's only non-corner slot
        longFlexWidth = longAvailAfterCorner;
      } else {
        warnings.push('Drawer bank does not fit cleanly on either leg at this size — consolidation-first placement failed. Needs manual design.');
        longFlexWidth = longAvailAfterCorner;
        shortFlexWidth = shortAvailAfterCorner;
      }
    } else {
      warnings.push('Drawer bank does not fit on the long leg, and the short leg is too small to host a drawer at all (collapsed to a single corner column) — needs manual design.');
      longFlexWidth = longAvailAfterCorner;
      shortFlexWidth = shortSingleColWidth;
    }
  } else {
    // Combined drawer count exceeds the 5-drawer single-column ergonomic limit — split the bank
    // across both legs (one half-stack per leg) instead of dropping it entirely.
    const halfLong = Math.ceil(drawerCount / 2), halfShort = Math.floor(drawerCount / 2);
    const dwLong = attemptDrawer(longLeg, longAvailAfterCorner);
    const dwShort = shortCanSplit ? attemptDrawer(shortLeg, shortAvailAfterCorner) : null;
    if(dwLong && dwShort && lsDrawerStackCheck(halfLong).fits && lsDrawerStackCheck(halfShort).fits){
      drawerLeg = 'split';
      drawerWidth = dwLong;
      drawerWidthShort = dwShort;
      drawerCountLong = halfLong;
      drawerCountShort = halfShort;
      longFlexWidth = longAvailAfterCorner - dwLong;
      shortFlexWidth = null;
      notes.push(drawerCount + ' drawers exceeds the single-column limit (max 5), so the bank was split across both legs — ' + halfLong + ' on Leg ' + longLeg.name + ' (long), ' + halfShort + ' on Leg ' + shortLeg.name + ' (short) — instead of dropping it.');
    } else {
      const reason = !shortCanSplit
        ? 'the short leg is too small to afford a second column to host its half'
        : (!dwLong ? 'no standard drawer width fits the long leg\'s available space' : 'no standard drawer width fits the short leg\'s available space');
      warnings.push(drawerCount + ' drawers exceeds the single-column ergonomic limit, and splitting across both legs isn\'t possible here (' + reason + ') — drawer bank dropped entirely. Needs manual design.');
      longFlexWidth = longAvailAfterCorner;
      shortFlexWidth = shortCanSplit ? shortAvailAfterCorner : shortSingleColWidth;
    }
  }

  return {
    doorA, doorB, longLeg, shortLeg, drawerCount, stack, shortCanSplit,
    drawerLeg, drawerWidth, drawerWidthShort, drawerCountLong, drawerCountShort, longFlexWidth, shortFlexWidth,
    longFurnWidth, shortFurnWidth, warnings, notes
  };
}

function computeLShapePrice(s, ls){
  const combinedMm = s.ls.legALength + s.ls.legBLength;
  const feet = roundFeet(combinedMm - 304.8); // add both walls, deduct 1ft at the corner, then round
  const hasDoor = ls.doorA.type !== 'none' || ls.doorB.type !== 'none';
  const baseRate = hasDoor ? 380 : 270;

  let topUp = 0, tierLabel = '', outOfTier = false;
  const ceiling = s.ls.ceiling;
  if(!hasDoor){
    if(s.ls.internalHeightUpgrade){ topUp = 30; tierLabel = 'No door · internal upgraded to 2400mm'; }
    else tierLabel = 'No door · standard internal 2080mm';
  } else if(ceiling < 2650){
    tierLabel = 'Standard tier (ceiling <2650mm) · internal 2080mm · door 2400mm';
  } else if(ceiling <= 3000){
    const anyUpgrade = s.ls.doorHeightUpgrade || s.ls.internalHeightUpgrade;
    if(!anyUpgrade){
      topUp = 30;
      tierLabel = 'Ceiling ≤3000mm · door stays 2400mm · internal 2080mm';
    } else {
      topUp = 60;
      tierLabel = 'Ceiling ≤3000mm · door ' + (s.ls.doorHeightUpgrade ? 'upgraded' : 'stays 2400mm') + ' · internal ' + (s.ls.internalHeightUpgrade ? '2400mm' : '2080mm (unchanged)');
    }
  } else if(ceiling <= 3600){
    topUp = 100;
    tierLabel = 'Ceiling 3000–3600mm · internal 2400mm · door ~2800mm';
  } else {
    outOfTier = true;
    tierLabel = 'Ceiling exceeds 3600mm — outside standard pricing tiers, quote manually';
  }

  const rate = baseRate + topUp;
  const minBill = applyMinBilling(feet);
  const baseCost = outOfTier ? null : minBill.billFeet * rate;

  // Door config charges follow the same straight-wardrobe hinge-unit formulas, summed per leg.
  // No manual wooden/aluminum choice anymore — a fallback-to-bifold/swing door defaults to wooden pricing (most common), flagged explicitly.
  const hingeLines = [];
  let hingeCost = 0;
  if(!outOfTier && minBill.surcharge > 0){
    hingeLines.push('Small-order surcharge (labor/transport, under 4.5ft) — flat $' + minBill.surcharge);
    hingeCost += minBill.surcharge;
  }
  function legStructuralCost(name, door){
    if(door.type === 'wooden' || door.type === 'aluminum'){
      const cost = (door.bifoldPairs + door.swingCount) * 150;
      const materialNote = door.autoMaterial ? ' (structural, wooden assumed — confirm material with customer)' : ' (structural)';
      if(door.bifoldPairs) hingeLines.push(name + ': ' + door.bifoldPairs + ' ' + door.type + ' bifold pair(s) × $150' + materialNote);
      if(door.swingCount) hingeLines.push(name + ': ' + door.swingCount + ' ' + door.type + ' swing unit(s) × $150' + materialNote);
      return cost;
    }
    return 0;
  }
  hingeCost += legStructuralCost('Leg A', ls.doorA);
  hingeCost += legStructuralCost('Leg B', ls.doorB);

  // Laminate pools across BOTH legs' wooden panels together, not per leg (Pricing Guideline Section 4). Aluminum doors don't get auto-pooled laminate (optional add-on only, same as straight shape).
  function legWoodenPanels(door){
    if(door.type === 'wooden') return door.bifoldPairs * 2 + door.swingCount;
    return 0;
  }
  const totalWoodenPanels = legWoodenPanels(ls.doorA) + legWoodenPanels(ls.doorB);
  if(totalWoodenPanels > 0){
    const laminatePieces = Math.ceil(totalWoodenPanels / 2);
    hingeCost += laminatePieces * 80;
    hingeLines.push(laminatePieces + ' laminate piece(s) (pooled across both legs, ' + totalWoodenPanels + ' panels ÷ 2) × $80');
  }

  const total = outOfTier ? null : baseCost + hingeCost;
  return { feet, baseRate, topUp, rate, tierLabel, outOfTier, baseCost, hingeLines, hingeCost, total };
}

/* ---------- pricing (HausPole Pricing Guideline v1) ---------- */
function computePrice(s, d){
  const feet = roundFeet(s.length);
  const hasDoor = s.doorType !== 'none';
  const baseRate = hasDoor ? 380 : 270;
  let topUp = 0, tierLabel = '', outOfTier = false;

  if(!hasDoor){
    if(s.internalHeightUpgrade){ topUp = 30; tierLabel = 'No door · internal upgraded to 2400mm'; }
    else tierLabel = 'No door · standard internal 2080mm';
  } else if(s.ceiling < 2650){
    tierLabel = 'Standard tier (ceiling <2650mm) · internal 2080mm · door 2400mm';
  } else if(s.ceiling <= 3000){
    const anyUpgrade = s.doorHeightUpgrade || s.internalHeightUpgrade;
    if(!anyUpgrade){
      topUp = 30;
      tierLabel = 'Ceiling ≤3000mm · door stays 2400mm · internal 2080mm';
    } else {
      topUp = 60;
      const doorNote = s.doorHeightUpgrade ? 'upgraded' : 'stays 2400mm';
      const internalNote = s.internalHeightUpgrade ? '2400mm' : '2080mm (unchanged)';
      tierLabel = 'Ceiling ≤3000mm · door ' + doorNote + ' · internal ' + internalNote;
    }
  } else if(s.ceiling <= 3600){
    topUp = 100;
    tierLabel = 'Ceiling 3000–3600mm · internal 2400mm · door ~2800mm';
  } else {
    outOfTier = true;
    tierLabel = 'Ceiling exceeds 3600mm — outside standard pricing tiers, quote manually';
  }

  const rate = baseRate + topUp;
  const minBill = applyMinBilling(feet);
  const baseCost = outOfTier ? null : minBill.billFeet * rate;

  const finishLines = [];
  let finishCost = 0;
  const hingeLines = [];
  let hingeCost = 0;

  if(!outOfTier && minBill.surcharge > 0){
    hingeLines.push('Small-order surcharge (labor/transport, under 4.5ft) — flat $' + minBill.surcharge);
    hingeCost += minBill.surcharge;
  }

  if(hasDoor){
    if(s.mirrorQty > 0){
      const c = s.mirrorQty * 150;
      finishCost += c;
      finishLines.push(s.mirrorQty + ' panel(s) full mirror upgrade');
    }
    if(s.doorType === 'sliding' && s.laminateQty > 0){
      const c = s.laminateQty * 80;
      finishCost += c;
      finishLines.push(s.laminateQty + ' laminate piece(s)');
    }
    if(s.doorType === 'aluminum'){
      hingeCost += d.hingeUnits * 150;
      if(d.hingeUnits) hingeLines.push(d.hingeUnits + ' aluminum hinge unit(s) × $150');
      if(s.laminateQty > 0){
        const c = s.laminateQty * 80;
        finishCost += c;
        finishLines.push(s.laminateQty + ' laminate piece(s) (optional, aluminum)');
      }
    } else if(s.doorType === 'wooden'){
      const structuralCost = (d.bifoldPairs + d.swingCount) * 150;
      const totalWoodenPanels = d.bifoldPairs * 2 + d.swingCount;
      const laminatePieces = Math.ceil(totalWoodenPanels / 2);
      const woodenLaminateCost = laminatePieces * 80;
      hingeCost += structuralCost + woodenLaminateCost;
      if(d.bifoldPairs) hingeLines.push(d.bifoldPairs + ' wooden bifold pair(s) × $150 (structural)');
      if(d.swingCount) hingeLines.push(d.swingCount + ' wooden swing unit(s) × $150 (structural)');
      hingeLines.push(laminatePieces + ' laminate piece(s) (pooled, ' + totalWoodenPanels + ' panels ÷ 2) × $80');
    }
  }

  const total = outOfTier ? null : baseCost + finishCost + hingeCost;

  return { feet, baseRate, topUp, rate, tierLabel, outOfTier, baseCost, finishLines, finishCost, hingeLines, hingeCost, total };
}

/* ---------- add-ons pricing (page 2, layered on top of base price) ---------- */
function computeAddonPrice(s, basePrice){
  const lines = [];
  let total = 0;
  const feet = s.shape === 'lshape' ? roundFeet(s.ls.legALength + s.ls.legBLength - 304.8) : roundFeet(s.length);
  function add(label, cost){
    if(cost > 0){ lines.push({ label, cost }); total += cost; }
  }

  add(s.addonExtraDrawers + ' additional drawer(s) × $80', s.addonExtraDrawers * 80);
  add(s.addonSecretDrawer + ' secret drawer top-up × $100', s.addonSecretDrawer * 100);
  add(s.addonDrawerHead + ' drawer head(s) → mirror + aluminium frame × $60', s.addonDrawerHead * 60);

  if(s.poleFinish && s.poleFinish !== 'silver'){
    const finishName = s.poleFinish === 'champagne' ? 'Champagne' : 'Black';
    add(finishName + ' pole finish (' + feet.toFixed(1) + 'ft × $30)', feet * 30);
  }

  if(s.dismantle){
    const cost = Math.max(200, feet * 40);
    add('Dismantle & disposal (' + feet.toFixed(1) + 'ft × $40, min $200)', cost);
  }
  add(s.addonRelocatePoint + ' relocated switch/power point(s) × $80', s.addonRelocatePoint * 80);
  add(s.addonNewSwitch + ' new light switch(es) × $100', s.addonNewSwitch * 100);

  if(s.led){
    const len = Math.max(0, s.addonLedLength || 0);
    const excess = Math.max(0, len - 1.5);
    const cost = 180 + excess * 120;
    add('LED lighting (' + len.toFixed(1) + 'm, min $180 incl. first 1.5m' + (excess > 0 ? ' + ' + excess.toFixed(1) + 'm excess × $120' : '') + ')', cost);
  }
  add(s.addonSensor + ' wired sensor(s) × $80', s.addonSensor * 80);

  add(s.addonWireBasket + ' pull-out wire basket(s) 600mm × $180', s.addonWireBasket * 180);
  add(s.addonTrouserHolder + ' trouser holder(s) × $80', s.addonTrouserHolder * 80);
  add(s.addonDoubleTrouser + ' double trouser hanger(s) 630 × $200', s.addonDoubleTrouser * 200);
  add(s.addonPulloutTrouser + ' pull-out trouser hanger(s) 610/800mm × $120', s.addonPulloutTrouser * 120);
  add(s.addonFullMirror + ' full-length pull-out mirror(s) × $200', s.addonFullMirror * 200);
  add(s.addonBoxMirror + ' box-up mirror(s) × $150', s.addonBoxMirror * 150);
  add(s.addonFlipMirror + ' flip mirror(s) × $160', s.addonFlipMirror * 160);

  const grandTotal = (basePrice === null ? null : basePrice + total);
  return { lines, total, basePrice, grandTotal };
}
const canvas = document.getElementById('elevCanvas');
const ctx = canvas.getContext('2d');
const internalCanvas = document.getElementById('internalElevCanvas');
const internalCtx = internalCanvas.getContext('2d');
const topCanvas = document.getElementById('topViewCanvas');
const topCtx = topCanvas.getContext('2d');
const lsCanvas = document.getElementById('lshapeTopViewCanvas');
const lsCtx = lsCanvas.getContext('2d');
const lsExtCanvas = document.getElementById('lshapeExtCanvas');
const lsExtCtx = lsExtCanvas.getContext('2d');
const lsIntCanvas = document.getElementById('lshapeIntCanvas');
const lsIntCtx = lsIntCanvas.getContext('2d');

function resizeCanvasEl(cv, cx){
  const rect = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resizeCanvas(){
  render();
  resizeCanvasEl(canvas, ctx);
  resizeCanvasEl(internalCanvas, internalCtx);
  resizeCanvasEl(topCanvas, topCtx);
  resizeCanvasEl(lsCanvas, lsCtx);
  resizeCanvasEl(lsExtCanvas, lsExtCtx);
  resizeCanvasEl(lsIntCanvas, lsIntCtx);
  render();
}

function drawDimOn(cx, x1,y1,x2,y2,label,offset,vertical){
  cx.save();
  cx.strokeStyle = '#3E6B8A'; cx.fillStyle = '#3E6B8A'; cx.lineWidth = 1;
  cx.font = '10px "SFMono-Regular",Consolas,monospace';
  cx.beginPath(); cx.moveTo(x1,y1); cx.lineTo(x2,y2); cx.stroke();
  const t=5;
  cx.beginPath();
  if(vertical){ cx.moveTo(x1-t,y1); cx.lineTo(x1+t,y1); cx.moveTo(x2-t,y2); cx.lineTo(x2+t,y2); }
  else { cx.moveTo(x1,y1-t); cx.lineTo(x1,y1+t); cx.moveTo(x2,y2-t); cx.lineTo(x2,y2+t); }
  cx.stroke();
  cx.save();
  if(vertical){ cx.translate(x1+offset,(y1+y2)/2); cx.rotate(-Math.PI/2); cx.textAlign='center'; cx.fillText(label,0,0); }
  else { cx.textAlign='center'; cx.fillText(label,(x1+x2)/2,y1+offset); }
  cx.restore(); cx.restore();
}

function drawDim(x1,y1,x2,y2,label,offset,vertical){
  drawDimOn(ctx, x1,y1,x2,y2,label,offset,vertical);
}

function lsLegDoorHeight(){
  const ceiling = state.ls.ceiling;
  if(state.ls.doorHeightUpgrade) return Math.min(ceiling - 50, 2800);
  return Math.min(2400, ceiling - 50);
}

function drawLsDoorPanels(cx, ox, oy, w, h, door){
  if(door.type === 'none'){
    cx.strokeStyle = '#8A8577'; cx.setLineDash([4,3]); cx.lineWidth = 1;
    cx.strokeRect(ox, oy, w, h);
    cx.setLineDash([]);
    cx.fillStyle = '#8A8577'; cx.font = '11px monospace'; cx.textAlign = 'center';
    cx.fillText('No door', ox + w/2, oy + h/2);
    return;
  }
  const n = door.panelCount;
  const pw = w / n;
  if(door.type === 'sliding'){
    for(let i = 0; i < n; i++){
      const x = ox + i*pw;
      cx.strokeStyle = '#2B4C7E'; cx.lineWidth = 1.5;
      cx.strokeRect(x+2, oy, pw-4, h);
      const midY = oy + h*0.4;
      const dir = i % 2 === 0 ? 1 : -1;
      cx.strokeStyle = '#1B1F26'; cx.lineWidth = 1;
      cx.beginPath();
      cx.moveTo(x+pw/2-14*dir, midY); cx.lineTo(x+pw/2+14*dir, midY); cx.lineTo(x+pw/2+8*dir, midY-5);
      cx.stroke();
    }
  } else {
    const unitsSeq = [];
    for(let i = 0; i < door.bifoldPairs; i++) unitsSeq.push(2);
    if(door.swingCount) unitsSeq.push(1);
    let x = ox;
    unitsSeq.forEach((panelsInUnit, u) => {
      const unitW = pw * panelsInUnit;
      for(let p = 0; p < panelsInUnit; p++){
        cx.strokeStyle = '#2B4C7E'; cx.lineWidth = 1.5;
        cx.strokeRect(x + p*pw + 1, oy, pw - 2, h);
      }
      const hingeLeft = u % 2 === 0;
      cx.fillStyle = '#1B1F26';
      cx.fillRect((hingeLeft ? x+3 : x+unitW-7), oy + h*0.42, 4, 34);
      x += unitW;
    });
  }
}

function renderLShapeExternalElevation(ls){
  const rect = lsExtCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  lsExtCtx.clearRect(0,0,W,H);
  lsExtCtx.fillStyle = '#F4F1E9'; lsExtCtx.fillRect(0,0,W,H);
  lsExtCtx.strokeStyle = '#E2D9C2'; lsExtCtx.lineWidth = 1;
  for(let gx=0; gx<W; gx+=24){ lsExtCtx.beginPath(); lsExtCtx.moveTo(gx,0); lsExtCtx.lineTo(gx,H); lsExtCtx.stroke(); }
  for(let gy=0; gy<H; gy+=24){ lsExtCtx.beginPath(); lsExtCtx.moveTo(0,gy); lsExtCtx.lineTo(W,gy); lsExtCtx.stroke(); }

  const ceiling = state.ls.ceiling;
  const doorHeight = lsLegDoorHeight();
  const pelmetHeight = ceiling - doorHeight;
  const margin = 40, gap = 50, topMargin = 50, botMargin = 40;
  const halfW = (W - 2*margin - gap) / 2;
  const availH = H - topMargin - botMargin;
  const scale = availH / ceiling;
  const drawH = ceiling * scale;
  const doorH = doorHeight * scale;
  const pelmetH = pelmetHeight * scale;

  [{leg:'A', door: ls.doorA, x: margin, w: Math.min(halfW, ls.doorA.opening*scale + 40)},
   {leg:'B', door: ls.doorB, x: margin+halfW+gap, w: Math.min(halfW, ls.doorB.opening*scale + 40)}].forEach(cfg=>{
    const ox = cfg.x, oy = topMargin;
    const w = Math.min(halfW, Math.max(cfg.door.opening*scale, 80));
    lsExtCtx.fillStyle = '#1B1F26'; lsExtCtx.font = '11px monospace'; lsExtCtx.textAlign = 'left';
    lsExtCtx.fillText('Leg ' + cfg.leg + ' external elevation', ox, oy - 10);
    lsExtCtx.strokeStyle = '#3E6B8A'; lsExtCtx.lineWidth = 1.5;
    lsExtCtx.strokeRect(ox, oy, w, drawH);
    lsExtCtx.fillStyle = '#EDE4CC';
    lsExtCtx.fillRect(ox, oy, w, pelmetH);
    lsExtCtx.strokeStyle = '#3E6B8A'; lsExtCtx.lineWidth = 1;
    lsExtCtx.beginPath(); lsExtCtx.moveTo(ox, oy+pelmetH); lsExtCtx.lineTo(ox+w, oy+pelmetH); lsExtCtx.stroke();
    lsExtCtx.fillStyle = '#1B1F26'; lsExtCtx.font = '9px monospace'; lsExtCtx.textAlign = 'left';
    lsExtCtx.fillText('pelmet ' + Math.round(pelmetHeight) + 'mm', ox+4, oy+Math.max(11, pelmetH/2));
    drawLsDoorPanels(lsExtCtx, ox, oy+pelmetH, w, doorH, cfg.door);
    lsExtCtx.fillStyle = '#1B1F26'; lsExtCtx.font = '9px monospace'; lsExtCtx.textAlign = 'center';
    lsExtCtx.fillText(Math.round(cfg.door.opening) + 'mm opening · ' + Math.round(doorHeight) + 'mm door', ox+w/2, oy+drawH+16);
  });
}

function renderLShapeInternalElevation(ls){
  const rect = lsIntCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  lsIntCtx.clearRect(0,0,W,H);
  lsIntCtx.fillStyle = '#F4F1E9'; lsIntCtx.fillRect(0,0,W,H);
  lsIntCtx.strokeStyle = '#E2D9C2'; lsIntCtx.lineWidth = 1;
  for(let gx=0; gx<W; gx+=24){ lsIntCtx.beginPath(); lsIntCtx.moveTo(gx,0); lsIntCtx.lineTo(gx,H); lsIntCtx.stroke(); }
  for(let gy=0; gy<H; gy+=24){ lsIntCtx.beginPath(); lsIntCtx.moveTo(0,gy); lsIntCtx.lineTo(W,gy); lsIntCtx.stroke(); }

  const internalHeightMm = state.ls.internalHeightUpgrade ? 2400 : 2080;
  const margin = 40, gap = 50, topMargin = 40, botMargin = 40;
  const halfW = (W - 2*margin - gap) / 2;
  const availH = H - topMargin - botMargin;
  const scale = availH / internalHeightMm;
  const drawH = internalHeightMm * scale;

  function buildSegments(isLong, flexWidth, drawerCount, drawerW, collapsed){
    const segs = [];
    if(collapsed){
      segs.push({ label: 'Type 1 (collapsed)', width: flexWidth, type: 'Type 1' });
      return segs;
    }
    segs.push({ label: 'Corner', width: LS_CORNER, type: 'Type 1' });
    if(drawerCount) segs.push({ label: 'Drawer', width: drawerW, type: 'Drawer', count: drawerCount });
    if(flexWidth) segs.push({ label: 'Type 4', width: flexWidth, type: 'Type 4' });
    return segs;
  }

  const longDrawerCount = ls.drawerLeg === 'split' ? ls.drawerCountLong : (ls.drawerLeg === 'long' ? ls.drawerCount : 0);
  const shortDrawerCount = ls.drawerLeg === 'split' ? ls.drawerCountShort : (ls.drawerLeg === 'short' ? ls.drawerCount : 0);
  const longDrawerW = ls.drawerWidth;
  const shortDrawerW = ls.drawerLeg === 'split' ? ls.drawerWidthShort : ls.drawerWidth;

  const aIsLong = ls.longLeg.name === 'A';
  const legAsegs = aIsLong
    ? buildSegments(true, ls.longFlexWidth, longDrawerCount, longDrawerW, false)
    : (ls.shortCanSplit ? buildSegments(false, ls.shortFlexWidth, shortDrawerCount, shortDrawerW, false) : buildSegments(false, ls.shortFlexWidth, 0, null, true));
  const legBsegs = !aIsLong
    ? buildSegments(true, ls.longFlexWidth, longDrawerCount, longDrawerW, false)
    : (ls.shortCanSplit ? buildSegments(false, ls.shortFlexWidth, shortDrawerCount, shortDrawerW, false) : buildSegments(false, ls.shortFlexWidth, 0, null, true));

  function drawLegColumns(segs, xStart, label){
    const totalMm = segs.reduce((a,s)=>a+s.width,0);
    const wscale = Math.min(halfW/totalMm, scale*3); // cap width scale reasonably
    const drawW = totalMm*wscale;
    const ox = xStart, oy = topMargin;
    lsIntCtx.fillStyle = '#1B1F26'; lsIntCtx.font = '11px monospace'; lsIntCtx.textAlign = 'left';
    lsIntCtx.fillText(label, ox, oy-10);
    let x = ox;
    segs.forEach(seg=>{
      const w = seg.width*wscale;
      lsIntCtx.strokeStyle = '#1B1F26'; lsIntCtx.lineWidth = 2;
      lsIntCtx.beginPath(); lsIntCtx.moveTo(x,oy); lsIntCtx.lineTo(x,oy+drawH); lsIntCtx.stroke();
      const toY = mm => oy+drawH-mm*scale;
      if(seg.type === 'Drawer'){
        const count = seg.count;
        lsIntCtx.strokeStyle = '#4E7A5A'; lsIntCtx.lineWidth = 1;
        let y0 = 150;
        for(let i=0;i<Math.min(count,5);i++){
          if(y0+190>1100) break;
          lsIntCtx.strokeRect(x+4, toY(y0+190), w-8, toY(y0)-toY(y0+190));
          y0 += 190;
        }
        lsIntCtx.setLineDash([3,3]); lsIntCtx.strokeStyle = '#8A8577';
        lsIntCtx.beginPath(); lsIntCtx.moveTo(x+w/2, toY(Math.min(150+count*190,1100))); lsIntCtx.lineTo(x+w/2, oy+8); lsIntCtx.stroke();
        lsIntCtx.setLineDash([]);
      } else if(seg.type === 'Type 4'){
        [2080,1680].forEach(y=>{
          if(y<=internalHeightMm){
            lsIntCtx.strokeStyle = '#C08A3E';
            lsIntCtx.beginPath(); lsIntCtx.moveTo(x+4,toY(y)); lsIntCtx.lineTo(x+w-4,toY(y)); lsIntCtx.stroke();
          }
        });
        lsIntCtx.beginPath(); lsIntCtx.moveTo(x+8,toY(Math.min(1620,internalHeightMm-50))); lsIntCtx.lineTo(x+w-8,toY(Math.min(1620,internalHeightMm-50))); lsIntCtx.stroke();
      } else {
        lsIntCtx.strokeStyle = '#3E6B8A';
        [internalHeightMm-40, internalHeightMm/2-20].forEach(rodY=>{
          lsIntCtx.beginPath(); lsIntCtx.moveTo(x+8,toY(rodY)); lsIntCtx.lineTo(x+w-8,toY(rodY)); lsIntCtx.stroke();
        });
      }

      // Section 6.5a — universal additional shelf at 2400mm when internal height is upgraded, on top of every zone type
      if(state.ls.internalHeightUpgrade){
        lsIntCtx.strokeStyle='#B5533C'; lsIntCtx.lineWidth=1.5; lsIntCtx.setLineDash([]);
        lsIntCtx.beginPath(); lsIntCtx.moveTo(x+4, toY(2400)); lsIntCtx.lineTo(x+w-4, toY(2400)); lsIntCtx.stroke();
      }

      lsIntCtx.fillStyle='#1B1F26'; lsIntCtx.font='8px monospace'; lsIntCtx.textAlign='center';
      lsIntCtx.fillText(Math.round(seg.width)+'mm '+seg.type, x+w/2, oy+drawH+14);
      x += w;
    });
    lsIntCtx.strokeStyle = '#1B1F26'; lsIntCtx.lineWidth = 2;
    lsIntCtx.beginPath(); lsIntCtx.moveTo(x,oy); lsIntCtx.lineTo(x,oy+drawH); lsIntCtx.stroke();
  }

  drawLegColumns(legAsegs, margin, 'Leg A internal');
  drawLegColumns(legBsegs, margin+halfW+gap, 'Leg B internal');
}

function renderLShapeTopView(ls){
  const rect = lsCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  lsCtx.clearRect(0,0,W,H);
  lsCtx.fillStyle = '#F4F1E9'; lsCtx.fillRect(0,0,W,H);
  lsCtx.strokeStyle = '#E2D9C2'; lsCtx.lineWidth = 1;
  for(let gx=0; gx<W; gx+=24){ lsCtx.beginPath(); lsCtx.moveTo(gx,0); lsCtx.lineTo(gx,H); lsCtx.stroke(); }
  for(let gy=0; gy<H; gy+=24){ lsCtx.beginPath(); lsCtx.moveTo(0,gy); lsCtx.lineTo(W,gy); lsCtx.stroke(); }

  const legA = state.ls.legALength, legB = state.ls.legBLength;
  const marginL = 130, marginT = 90;
  const availW = W - marginL - 60, availH = H - marginT - 60;
  const scale = Math.min(availW / legB, availH / legA, 0.32);
  const ox = marginL, oy = marginT;

  lsCtx.fillStyle = '#1B1F26'; lsCtx.font = '11px monospace'; lsCtx.textAlign = 'center';
  lsCtx.fillText('L-shape top view — Leg A ' + legA + 'mm × Leg B ' + legB + 'mm', ox + (legB*scale)/2, 30);

  // walls
  lsCtx.strokeStyle = '#2B4C7E'; lsCtx.lineWidth = 3;
  lsCtx.beginPath(); lsCtx.moveTo(ox, oy); lsCtx.lineTo(ox + legB*scale, oy); lsCtx.stroke();
  lsCtx.beginPath(); lsCtx.moveTo(ox, oy); lsCtx.lineTo(ox, oy + legA*scale); lsCtx.stroke();

  const depthPx = state.ls.depth * scale;
  const longIsA = legA >= legB;

  // Leg A: vertical, down the left wall
  lsCtx.strokeStyle = '#8A8577'; lsCtx.lineWidth = 1; lsCtx.setLineDash([3,3]);
  lsCtx.strokeRect(ox, oy, depthPx, legA*scale);
  lsCtx.setLineDash([]);
  // Leg B: horizontal, along top wall, starting after Leg A's depth
  lsCtx.strokeRect(ox+depthPx, oy, legB*scale - depthPx, depthPx);
  lsCtx.setLineDash([]);

  function segColor(seg){
    if(seg==='corner') return '#3E6B8A';
    if(seg==='drawer') return '#4E7A5A';
    return '#C08A3E';
  }

  // draw Leg A columns (vertical, top=corner)
  let yA = oy;
  const legAObj = longIsA ? ls.longLeg : ls.shortLeg;
  const legBObj = longIsA ? ls.shortLeg : ls.longLeg;
  const aIsLong = longIsA;

  function drawVerticalCol(label, widthMm, color, yStart){
    const h = widthMm * scale;
    lsCtx.strokeStyle = color; lsCtx.lineWidth = 1.5;
    lsCtx.strokeRect(ox, yStart, depthPx, h);
    lsCtx.fillStyle = color; lsCtx.font = '9px monospace'; lsCtx.textAlign = 'center';
    lsCtx.save(); lsCtx.translate(ox + depthPx/2, yStart + h/2); lsCtx.rotate(-Math.PI/2);
    lsCtx.fillText(label + ' ' + Math.round(widthMm) + 'mm', 0, 0);
    lsCtx.restore();
    return yStart + h;
  }
  function drawHorizCol(label, widthMm, color, xStart){
    const w = widthMm * scale;
    lsCtx.strokeStyle = color; lsCtx.lineWidth = 1.5;
    lsCtx.strokeRect(xStart, oy, w, depthPx);
    lsCtx.fillStyle = color; lsCtx.font = '9px monospace'; lsCtx.textAlign = 'center';
    lsCtx.fillText(label + ' ' + Math.round(widthMm) + 'mm', xStart + w/2, oy + depthPx/2);
    return xStart + w;
  }

  // Leg A segments (corner at top)
  let yCursor = oy;
  if(aIsLong){
    yCursor = drawVerticalCol('Corner', LS_CORNER, '#3E6B8A', yCursor);
    if(ls.drawerLeg === 'long' || ls.drawerLeg === 'split') yCursor = drawVerticalCol('Drawer', ls.drawerWidth, '#4E7A5A', yCursor);
    if(ls.longFlexWidth) yCursor = drawVerticalCol('Type 4', ls.longFlexWidth, '#C08A3E', yCursor);
  } else if(ls.shortCanSplit){
    yCursor = drawVerticalCol('Corner', LS_CORNER, '#3E6B8A', yCursor);
    if(ls.drawerLeg === 'short' || ls.drawerLeg === 'split') yCursor = drawVerticalCol('Drawer', ls.drawerLeg==='split' ? ls.drawerWidthShort : ls.drawerWidth, '#4E7A5A', yCursor);
    if(ls.shortFlexWidth) yCursor = drawVerticalCol('Type 4', ls.shortFlexWidth, '#C08A3E', yCursor);
  } else {
    yCursor = drawVerticalCol('Type 1 (collapsed)', ls.shortFlexWidth, '#3E6B8A', yCursor);
  }

  // Leg B segments (corner at left, right after Leg A's depth)
  let xCursor = ox + depthPx;
  if(!aIsLong){
    xCursor = drawHorizCol('Corner', LS_CORNER, '#3E6B8A', xCursor);
    if(ls.drawerLeg === 'long' || ls.drawerLeg === 'split') xCursor = drawHorizCol('Drawer', ls.drawerWidth, '#4E7A5A', xCursor);
    if(ls.longFlexWidth) xCursor = drawHorizCol('Type 4', ls.longFlexWidth, '#C08A3E', xCursor);
  } else if(ls.shortCanSplit){
    xCursor = drawHorizCol('Corner', LS_CORNER, '#3E6B8A', xCursor);
    if(ls.drawerLeg === 'short' || ls.drawerLeg === 'split') xCursor = drawHorizCol('Drawer', ls.drawerLeg==='split' ? ls.drawerWidthShort : ls.drawerWidth, '#4E7A5A', xCursor);
    if(ls.shortFlexWidth) xCursor = drawHorizCol('Type 4', ls.shortFlexWidth, '#C08A3E', xCursor);
  } else {
    xCursor = drawHorizCol('Type 1 (collapsed)', ls.shortFlexWidth, '#3E6B8A', xCursor);
  }

  // door lines
  lsCtx.strokeStyle = '#2B4C7E'; lsCtx.lineWidth = 1; lsCtx.setLineDash([2,2]);
  lsCtx.beginPath(); lsCtx.moveTo(ox+depthPx, oy); lsCtx.lineTo(ox+depthPx, oy+legA*scale); lsCtx.stroke();
  lsCtx.beginPath(); lsCtx.moveTo(ox, oy+depthPx); lsCtx.lineTo(ox+legB*scale, oy+depthPx); lsCtx.stroke();
  lsCtx.setLineDash([]);

  lsCtx.fillStyle = '#2B4C7E'; lsCtx.font = '9px monospace'; lsCtx.textAlign = 'left';
  lsCtx.fillText('Leg A door: ' + (ls.doorA.type==='none' ? 'none' : ls.doorA.panelCount + '× ' + ls.doorA.type), 10, H-30);
  lsCtx.fillText('Leg B door: ' + (ls.doorB.type==='none' ? 'none' : ls.doorB.panelCount + '× ' + ls.doorB.type), 10, H-14);
}

function renderLShapeSpecSheet(ls, lp){
  const el = document.getElementById('lshapeSpecSheet');
  function doorLine(name, door){
    if(door.type === 'none') return name + ': no door (opening ' + Math.round(door.opening) + 'mm)';
    const panelWord = door.type === 'sliding' ? 'sliding' : (door.type + (door.panelCount === 1 ? ' single swing' : ' bifold'));
    let line = name + ': ' + door.panelCount + '× ' + panelWord + ' @ ' + door.panelWidth.toFixed(0) + 'mm (opening ' + Math.round(door.opening) + 'mm)';
    if(door.autoMaterial) line += ' — auto-resolved, material assumed';
    return line;
  }

  let html = '<h3>Doors (Section 7.2 — 600mm corner deduction on both legs)</h3><div class="spec-grid">';
  html += '<div>' + doorLine('Leg A', ls.doorA) + '</div>';
  html += '<div>' + doorLine('Leg B', ls.doorB) + '</div>';
  html += '</div>';

  html += '<h3>Structure</h3><div class="spec-grid">';
  html += '<div><span class="k">Long leg (3 columns):</span> Leg ' + ls.longLeg.name + ' (' + ls.longLeg.length + 'mm)</div>';
  html += '<div><span class="k">Short leg (2 columns):</span> Leg ' + ls.shortLeg.name + ' (' + ls.shortLeg.length + 'mm)</div>';
  html += '<div><span class="k">Drawer count:</span> ' + ls.drawerCount + ' (combined length)</div>';
  let drawerPlacementText;
  if(ls.drawerLeg === 'split') drawerPlacementText = 'split — ' + ls.drawerCountLong + ' on Leg ' + ls.longLeg.name + ' (' + ls.drawerWidth + 'mm), ' + ls.drawerCountShort + ' on Leg ' + ls.shortLeg.name + ' (' + ls.drawerWidthShort + 'mm)';
  else if(ls.drawerLeg) drawerPlacementText = ls.drawerLeg + ' leg, ' + ls.drawerWidth + 'mm';
  else drawerPlacementText = 'not placed — see warnings';
  html += '<div><span class="k">Drawer placement:</span> ' + drawerPlacementText + '</div>';
  html += '</div>';

  html += '<h3>Column layout</h3>';
  const longDrawerLabel = (ls.drawerLeg==='long' || ls.drawerLeg==='split') ? (' → Drawer (' + (ls.drawerLeg==='split' ? ls.drawerCountLong : ls.drawerCount) + ') ' + ls.drawerWidth + 'mm') : '';
  html += '<div class="price-line"><span>Leg ' + ls.longLeg.name + ' (long)</span><span class="amt">Corner 600mm' + longDrawerLabel + (ls.longFlexWidth ? ' → Type 4 ' + Math.round(ls.longFlexWidth) + 'mm' : '') + '</span></div>';
  const shortDrawerLabel = (ls.drawerLeg==='short' || ls.drawerLeg==='split') ? (' → Drawer (' + (ls.drawerLeg==='split' ? ls.drawerCountShort : ls.drawerCount) + ') ' + (ls.drawerLeg==='split' ? ls.drawerWidthShort : ls.drawerWidth) + 'mm') : '';
  const shortLayout = ls.shortCanSplit
    ? ('Corner 600mm' + shortDrawerLabel + (ls.shortFlexWidth ? ' → Type 4 ' + Math.round(ls.shortFlexWidth) + 'mm' : ''))
    : ('Single Type 1 column, ' + Math.round(ls.shortFlexWidth) + 'mm (too short for a separate fixed corner column — see notes)');
  html += '<div class="price-line"><span>Leg ' + ls.shortLeg.name + ' (short)</span><span class="amt">' + shortLayout + '</span></div>';

  if(state.ls.internalHeightUpgrade){
    html += '<div class="ok-note"><strong>Section 6.5a:</strong> internal height upgrade active — every section on both legs gets one additional shelf at the 2400mm line, on top of its normal template content.</div>';
  }

  html += '<h3>Estimated Cost</h3>';
  html += '<div class="price-tier-label">' + lp.tierLabel + '</div>';
  if(lp.outOfTier){
    html += '<div class="warn-box"><div class="w-title">Outside standard pricing</div><ul><li>Ceiling exceeds 3600mm — quote manually.</li></ul></div>';
  } else {
    html += '<div class="price-line"><span>Combined length (both legs − 1ft at corner)</span><span class="amt">' + lp.feet.toFixed(1) + ' ft</span></div>';
    html += '<div class="price-line"><span>Base rate</span><span class="amt">$' + lp.baseRate + '/pftrun</span></div>';
    if(lp.topUp > 0) html += '<div class="price-line"><span>Ceiling-height top-up</span><span class="amt">+$' + lp.topUp + '/pftrun</span></div>';
    html += '<div class="price-line"><span>Base cost (' + lp.feet.toFixed(1) + 'ft × $' + lp.rate + ')</span><span class="amt">$' + lp.baseCost.toFixed(2) + '</span></div>';
    if(lp.hingeLines.length){
      html += '<h3>Hinge units (per leg, straight-wardrobe formulas)</h3>';
      lp.hingeLines.forEach(l => html += '<div class="price-line"><span>' + l + '</span></div>');
      html += '<div class="price-line"><span>Hinge unit subtotal</span><span class="amt">$' + lp.hingeCost.toFixed(2) + '</span></div>';
    }
    html += '<div class="price-total"><span class="label">Estimated total (before GST)</span><span class="amount">$' + lp.total.toFixed(2) + '</span></div>';
  }

  el.innerHTML = html;

  if(ls.notes.length){
    el.innerHTML += '<div class="ok-note"><strong>Notes:</strong><br>' + ls.notes.map(n=>'· '+n).join('<br>') + '</div>';
  }
  if(ls.warnings.length){
    el.innerHTML += '<div class="warn-box"><div class="w-title">Needs review</div><ul>' + ls.warnings.map(w=>'<li>'+w+'</li>').join('') + '</ul></div>';
  }
  el.innerHTML += '<div class="hint" style="margin-top:14px;">Base price + door hinge-unit costs are calculated above. Accessory Add-ons and Quote Output pages don\'t yet support L-shape — only the Configurator page\'s pricing applies here.</div>';
}

function render(){
  try{
    renderInner();
  } catch(err){
    const msg = '<div class="warn-box"><div class="w-title">Render error</div><ul><li>' +
      String(err && err.message || err).replace(/</g,'&lt;') +
      '</li></ul><div style="margin-top:8px; font-size:0.72rem; color:#8A8577;">This is a bug — please screenshot this box and the steps that led here.</div></div>';
    const specEl = document.getElementById(state.shape==='lshape' ? 'lshapeSpecSheet' : 'specSheet');
    if(specEl) specEl.innerHTML = msg;
    const priceEl = document.getElementById('addonPriceSheet');
    if(priceEl) priceEl.innerHTML = msg;
    if(window.console && console.error) console.error('HausPole render error:', err);
  }
}
function renderInner(){
  if(state.shape === 'lshape'){
    const ls = computeLShape(state);
    const lsPrice = computeLShapePrice(state, ls);
    const addonPrice = computeAddonPrice(state, lsPrice.outOfTier ? null : lsPrice.total);
    renderLShapeExternalElevation(ls);
    renderLShapeInternalElevation(ls);
    renderLShapeTopView(ls);
    renderLShapeSpecSheet(ls, lsPrice);
    renderAddonsPage(null, lsPrice, addonPrice, ls);
    renderQuotePage(state, null, null, lsPrice, addonPrice, ls);
    return;
  }
  const design = computeDesign(state);
  const internal = computeInternalLayout(state, design);
  const price = computePrice(state, design);
  const addonPrice = computeAddonPrice(state, price.total);
  renderElevation(design);
  renderInternalElevation(design, internal);
  renderTopView(design, internal);
  renderSpecSheet(design);
  renderInternalSheet(internal);
  renderAddonsPage(design, price, addonPrice);
  renderQuotePage(state, design, internal, price, addonPrice);
}

function renderElevation(d){
  const rect = canvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = '#F4F1E9'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#E2D9C2'; ctx.lineWidth = 1;
  for(let gx=0; gx<W; gx+=24){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
  for(let gy=0; gy<H; gy+=24){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

  const marginL=70, marginR=40, marginT=45, marginB=40;
  const availW=W-marginL-marginR, availH=H-marginT-marginB;
  const scale=Math.min(availW/state.length, availH/state.ceiling);
  const drawW=state.length*scale, drawH=state.ceiling*scale;
  const ox=marginL+(availW-drawW)/2, oy=marginT+(availH-drawH)/2;

  drawDim(ox,oy-18,ox+drawW,oy-18,state.length+'mm',-6,false);
  drawDim(ox-18,oy,ox-18,oy+drawH,state.ceiling+'mm (ceiling)',-6,true);

  ctx.strokeStyle='#3E6B8A'; ctx.lineWidth=1.5;
  ctx.strokeRect(ox,oy,drawW,drawH);

  const toY = mmFromFloor => oy+drawH-mmFromFloor*scale;

  // left/right elements
  const lw = d.left.width*scale, rw = d.right.width*scale;
  ctx.fillStyle = d.left.kind==='beampillar' ? '#C08A3E33' : '#3E6B8A22';
  ctx.fillRect(ox,oy,lw,drawH);
  ctx.fillStyle = d.right.kind==='beampillar' ? '#C08A3E33' : '#3E6B8A22';
  ctx.fillRect(ox+drawW-rw,oy,rw,drawH);
  ctx.strokeStyle='#3E6B8A'; ctx.lineWidth=1;
  ctx.strokeRect(ox,oy,lw,drawH);
  ctx.strokeRect(ox+drawW-rw,oy,rw,drawH);
  ctx.fillStyle='#1B1F26'; ctx.font='10px "SFMono-Regular",Consolas,monospace'; ctx.textAlign='center';
  ctx.save(); ctx.translate(ox+lw/2, oy+drawH/2); ctx.rotate(-Math.PI/2); ctx.fillText(Math.round(d.left.width)+'mm',0,0); ctx.restore();
  ctx.save(); ctx.translate(ox+drawW-rw/2, oy+drawH/2); ctx.rotate(-Math.PI/2); ctx.fillText(Math.round(d.right.width)+'mm',0,0); ctx.restore();

  const doorX0 = ox+lw, doorX1 = ox+drawW-rw;

  if(state.doorType !== 'none'){
    const doorTopY = oy + drawH - d.doorHeight*scale;
    const floorY = oy+drawH;

    // pelmet
    ctx.fillStyle = '#EDE4CC';
    ctx.fillRect(doorX0, oy, doorX1-doorX0, d.pelmetHeight*scale);
    ctx.strokeStyle = '#3E6B8A'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(doorX0, oy+d.pelmetHeight*scale); ctx.lineTo(doorX1, oy+d.pelmetHeight*scale); ctx.stroke();
    ctx.fillStyle='#1B1F26'; ctx.font='9px monospace'; ctx.textAlign='left';
    ctx.fillText('pelmet '+Math.round(d.pelmetHeight)+'mm', doorX0+4, oy+Math.max(11,d.pelmetHeight*scale/2));

    if(state.doorType === 'sliding'){
      // 2-track markers
      ctx.fillStyle='#3E6B8A';
      ctx.fillRect(doorX0, doorTopY-4, doorX1-doorX0, 3);
      ctx.fillRect(doorX0, floorY+1, doorX1-doorX0, 3);
      let x=doorX0;
      const pw=(doorX1-doorX0)/d.panelCount;
      for(let i=0;i<d.panelCount;i++){
        ctx.strokeStyle='#3E6B8A'; ctx.lineWidth=1.2;
        ctx.strokeRect(x-2, doorTopY, pw+4, floorY-doorTopY);
        ctx.fillStyle='#1B1F26'; ctx.beginPath();
        const midY=doorTopY+(floorY-doorTopY)*0.4;
        const dir = i%2===0?1:-1;
        ctx.moveTo(x+pw/2-14*dir, midY); ctx.lineTo(x+pw/2+14*dir, midY); ctx.lineTo(x+pw/2+8*dir, midY-5);
        ctx.strokeStyle='#1B1F26'; ctx.stroke();
        x+=pw;
      }
    } else {
      // hinged / bifold
      const pw=(doorX1-doorX0)/d.panelCount;
      let x=doorX0;
      let panelsPlaced=0;
      let unitIndex=0;
      const unitsSeq = [];
      for(let i=0;i<d.bifoldPairs;i++) unitsSeq.push(2);
      if(d.swingCount) unitsSeq.push(1);

      for(let u=0; u<unitsSeq.length; u++){
        const panelsInUnit = unitsSeq[u];
        const unitW = pw*panelsInUnit;
        let splitY = null;
        if(d.splitInfo && d.splitInfo.type==='split'){
          splitY = floorY - d.splitInfo.bottom*scale;
        }
        // panel outline(s)
        for(let p=0;p<panelsInUnit;p++){
          const px = x+p*pw;
          ctx.strokeStyle='#3E6B8A'; ctx.lineWidth=1.2;
          ctx.strokeRect(px, doorTopY, pw, floorY-doorTopY);
          if(splitY){ ctx.beginPath(); ctx.moveTo(px,splitY); ctx.lineTo(px+pw,splitY); ctx.stroke(); }
          if(d.splitInfo && d.splitInfo.type==='midrail'){
            const railY = floorY - d.splitInfo.at*scale;
            ctx.beginPath(); ctx.moveTo(px,railY); ctx.lineTo(px+pw,railY); ctx.stroke();
          }
        }
        // hinge/fold indicator
        ctx.fillStyle='#1B1F26';
        if(panelsInUnit===2){
          ctx.fillRect(x+pw-2, doorTopY+ (floorY-doorTopY)*0.42, 4, 34); // fold hinge between panels
          const hingeLeft = u%2===0;
          ctx.fillRect(hingeLeft? x+3 : x+unitW-7, doorTopY+(floorY-doorTopY)*0.42, 4, 34);
        } else {
          const hingeLeft = u%2===0;
          ctx.fillRect(hingeLeft? x+3 : x+unitW-7, doorTopY+(floorY-doorTopY)*0.42, 4, 34);
        }
        x += unitW;
        panelsPlaced += panelsInUnit;
      }

      // interior pillar markers (recessed, dashed, no width)
      if(d.interiorPillars>0){
        ctx.setLineDash([3,3]); ctx.strokeStyle='#C08A3E'; ctx.lineWidth=1.5;
        let cum=0, placed=0;
        for(let u=0; u<unitsSeq.length && placed<d.interiorPillars; u++){
          cum += unitsSeq[u];
          if((u+1)%2===0 && u+1<unitsSeq.length){
            const xPos = doorX0 + cum*pw;
            ctx.beginPath(); ctx.moveTo(xPos, doorTopY); ctx.lineTo(xPos, floorY); ctx.stroke();
            placed++;
          }
        }
        ctx.setLineDash([]);
      }
    }
  } else {
    ctx.strokeStyle='#8A8577'; ctx.setLineDash([4,3]); ctx.lineWidth=1;
    ctx.strokeRect(doorX0, oy, doorX1-doorX0, drawH);
    ctx.setLineDash([]);
    ctx.fillStyle='#8A8577'; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText('No door — open front', (doorX0+doorX1)/2, oy+drawH/2);
  }
}

function renderInternalElevation(d, internal){
  const rect = internalCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  internalCtx.clearRect(0,0,W,H);
  internalCtx.fillStyle = '#F4F1E9'; internalCtx.fillRect(0,0,W,H);
  internalCtx.strokeStyle='#E2D9C2'; internalCtx.lineWidth=1;
  for(let gx=0;gx<W;gx+=24){ internalCtx.beginPath(); internalCtx.moveTo(gx,0); internalCtx.lineTo(gx,H); internalCtx.stroke(); }
  for(let gy=0;gy<H;gy+=24){ internalCtx.beginPath(); internalCtx.moveTo(0,gy); internalCtx.lineTo(W,gy); internalCtx.stroke(); }

  if(!internal.segments || !internal.segments.length){
    internalCtx.fillStyle='#8A8577'; internalCtx.font='12px monospace'; internalCtx.textAlign='center';
    internalCtx.fillText('Internal layout unavailable — see notes below', W/2, H/2);
    return;
  }

  const internalHeightMm = state.internalHeightUpgrade ? 2400 : 2080;
  const marginL=60, marginR=30, marginT=40, marginB=30;
  const availW=W-marginL-marginR, availH=H-marginT-marginB;
  const totalWidthMm = internal.segments.reduce((a,s)=>a+s.width,0);
  const scale = Math.min(availW/totalWidthMm, availH/internalHeightMm);
  const drawW = totalWidthMm*scale, drawH = internalHeightMm*scale;
  const ox = marginL+(availW-drawW)/2, oy=marginT+(availH-drawH)/2;
  const floorY = oy+drawH;
  const toY = mm => floorY - mm*scale;

  drawDimOn(internalCtx, ox, oy-18, ox+drawW, oy-18, Math.round(totalWidthMm)+'mm internal', -6, false);
  internalCtx.strokeStyle='#3E6B8A'; internalCtx.lineWidth=1.5;
  internalCtx.strokeRect(ox,oy,drawW,drawH);

  let x = ox;
  internal.segments.forEach(seg=>{
    const w = seg.width*scale;
    internalCtx.strokeStyle='#1B1F26'; internalCtx.lineWidth=2;
    internalCtx.beginPath(); internalCtx.moveTo(x,oy); internalCtx.lineTo(x,floorY); internalCtx.stroke();
    internalCtx.fillStyle='#1B1F26'; internalCtx.font='9px monospace'; internalCtx.textAlign='center';
    internalCtx.fillText(Math.round(seg.width)+'mm', x+w/2, floorY+14);

    if(seg.label.indexOf('Drawer')>=0){
      const count = d.drawerCount;
      internalCtx.strokeStyle='#4E7A5A'; internalCtx.lineWidth=1; internalCtx.setLineDash([]);
      let stackTopMm;
      if(count>2){
        let y0=150;
        for(let i=0;i<count;i++){
          if(y0+190>1100) break;
          internalCtx.strokeRect(x+4,toY(y0+190),w-8,toY(y0)-toY(y0+190));
          y0+=190;
        }
        stackTopMm = Math.min(150+count*190,1100);
      } else {
        let yEdge=1100;
        for(let i=0;i<count;i++){
          internalCtx.strokeRect(x+4,toY(yEdge),w-8,toY(yEdge-190)-toY(yEdge));
          yEdge-=190;
        }
        stackTopMm=1100;
        internalCtx.beginPath(); internalCtx.moveTo(x+4,toY(150)); internalCtx.lineTo(x+w-4,toY(150)); internalCtx.stroke();
      }
      internalCtx.setLineDash([3,3]); internalCtx.strokeStyle='#8A8577';
      internalCtx.beginPath(); internalCtx.moveTo(x+w/2,toY(stackTopMm)); internalCtx.lineTo(x+w/2,oy+10); internalCtx.stroke();
      internalCtx.setLineDash([]);
      internalCtx.fillStyle='#4E7A5A'; internalCtx.font='9px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('drawers', x+w/2, toY(stackTopMm/2));
    } else if(seg.type.indexOf('Type 1')>=0){
      [internalHeightMm-40, internalHeightMm/2-20].forEach(rodY=>{
        internalCtx.strokeStyle='#3E6B8A';
        internalCtx.beginPath(); internalCtx.moveTo(x+8,toY(rodY)); internalCtx.lineTo(x+w-8,toY(rodY)); internalCtx.stroke();
      });
      internalCtx.fillStyle='#3E6B8A'; internalCtx.font='9px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('Type 1', x+w/2, toY(internalHeightMm/2+60));
    } else if(seg.type.indexOf('Type 4')>=0){
      [2080,1680].forEach(y=>{
        internalCtx.strokeStyle='#3E6B8A';
        internalCtx.beginPath(); internalCtx.moveTo(x+4,toY(Math.min(y,internalHeightMm))); internalCtx.lineTo(x+w-4,toY(Math.min(y,internalHeightMm))); internalCtx.stroke();
      });
      internalCtx.beginPath(); internalCtx.moveTo(x+8,toY(1620)); internalCtx.lineTo(x+w-8,toY(1620)); internalCtx.stroke();
      internalCtx.fillStyle='#3E6B8A'; internalCtx.font='9px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('Type 4', x+w/2, toY(900));
    } else if(seg.type.indexOf('Type 3')>=0){
      const n=6;
      for(let i=1;i<=n;i++){
        const y = internalHeightMm*i/(n+1);
        internalCtx.strokeStyle='#C08A3E';
        internalCtx.beginPath(); internalCtx.moveTo(x+4,toY(y)); internalCtx.lineTo(x+w-4,toY(y)); internalCtx.stroke();
      }
      internalCtx.fillStyle='#C08A3E'; internalCtx.font='9px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('Type 3', x+w/2, toY(internalHeightMm/2));
    } else {
      const n=3;
      for(let i=1;i<=n;i++){
        const y = internalHeightMm*i/(n+1);
        internalCtx.strokeStyle='#8A8577';
        internalCtx.beginPath(); internalCtx.moveTo(x+4,toY(y)); internalCtx.lineTo(x+w-4,toY(y)); internalCtx.stroke();
      }
      internalCtx.fillStyle='#8A8577'; internalCtx.font='8px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('shelf', x+w/2, toY(internalHeightMm/2));
    }

    // Section 6.5a — universal additional shelf at 2400mm when internal height is upgraded, on top of every zone type regardless of template
    if(state.internalHeightUpgrade){
      internalCtx.strokeStyle='#B5533C'; internalCtx.lineWidth=1.5; internalCtx.setLineDash([]);
      internalCtx.beginPath(); internalCtx.moveTo(x+4, toY(2400)); internalCtx.lineTo(x+w-4, toY(2400)); internalCtx.stroke();
      internalCtx.fillStyle='#B5533C'; internalCtx.font='7px monospace'; internalCtx.textAlign='center';
      internalCtx.fillText('+shelf 2400', x+w/2, toY(2400)-3);
    }

    x += w;
  });
  internalCtx.strokeStyle='#1B1F26'; internalCtx.lineWidth=2;
  internalCtx.beginPath(); internalCtx.moveTo(x,oy); internalCtx.lineTo(x,floorY); internalCtx.stroke();
}

function renderTopView(d, internal){
  const rect = topCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  topCtx.clearRect(0,0,W,H);
  topCtx.fillStyle='#F4F1E9'; topCtx.fillRect(0,0,W,H);
  topCtx.strokeStyle='#E2D9C2'; topCtx.lineWidth=1;
  for(let gx=0;gx<W;gx+=24){ topCtx.beginPath(); topCtx.moveTo(gx,0); topCtx.lineTo(gx,H); topCtx.stroke(); }
  for(let gy=0;gy<H;gy+=24){ topCtx.beginPath(); topCtx.moveTo(0,gy); topCtx.lineTo(W,gy); topCtx.stroke(); }

  const marginL=60, marginR=60, marginT=50;
  const availW=W-marginL-marginR;
  const totalLenMm = state.length;
  const scaleX = availW/totalLenMm;
  const depthBandPx = 150;
  const scaleY = depthBandPx/d.depth;
  const ox = marginL;
  const wallY = marginT+24;
  const doorLineY = wallY+depthBandPx;

  topCtx.fillStyle='#1B1F26'; topCtx.font='11px monospace'; topCtx.textAlign='center';
  topCtx.fillText('Top view (plan) — '+totalLenMm+'mm run, '+Math.round(d.depth)+'mm depth', ox+totalLenMm*scaleX/2, marginT-4);

  // wall line
  topCtx.strokeStyle='#2B4C7E'; topCtx.lineWidth=3;
  topCtx.beginPath(); topCtx.moveTo(ox,wallY); topCtx.lineTo(ox+totalLenMm*scaleX,wallY); topCtx.stroke();
  topCtx.fillStyle='#2B4C7E'; topCtx.font='9px monospace'; topCtx.textAlign='left';
  topCtx.fillText('wall', ox, wallY-6);

  const leftW = d.left.width, rightW = d.right.width;
  const leftIsOpen = state.left.type === 'none';
  const rightIsOpen = state.right.type === 'none';

  // shelf depth line
  const shelfY = wallY + Math.min(d.shelfDepth, d.depth) * scaleY;
  topCtx.strokeStyle='#8A8577'; topCtx.setLineDash([4,3]); topCtx.lineWidth=1;
  topCtx.beginPath(); topCtx.moveTo(ox,shelfY); topCtx.lineTo(ox+totalLenMm*scaleX,shelfY); topCtx.stroke();
  topCtx.setLineDash([]);
  topCtx.fillStyle='#8A8577'; topCtx.font='9px monospace'; topCtx.textAlign='left';
  topCtx.fillText('shelf depth '+Math.round(d.shelfDepth)+'mm', ox+4, shelfY-4);

  // door line
  topCtx.strokeStyle='#2B4C7E'; topCtx.lineWidth=1.5; topCtx.setLineDash([2,2]);
  topCtx.beginPath(); topCtx.moveTo(ox,doorLineY); topCtx.lineTo(ox+totalLenMm*scaleX,doorLineY); topCtx.stroke();
  topCtx.setLineDash([]);
  topCtx.fillStyle='#2B4C7E'; topCtx.font='9px monospace'; topCtx.textAlign='left';
  topCtx.fillText('door line ('+Math.round(d.depth)+'mm from wall)', ox+4, doorLineY+14);

  // end elements: open partitions run full depth; wall/beam pillars are only 80mm deep, flush with the door line
  function drawEndEl(xStart, widthMm, isOpen, isBeam){
    const w = widthMm*scaleX;
    topCtx.globalAlpha=0.8;
    if(isOpen){
      topCtx.fillStyle='#4E7A5A';
      topCtx.fillRect(xStart, wallY, w, doorLineY-wallY);
    } else {
      const zoneTop = doorLineY - 80*scaleY;
      topCtx.fillStyle = isBeam ? '#C08A3E' : '#2B4C7E';
      topCtx.fillRect(xStart, zoneTop, w, doorLineY-zoneTop);
    }
    topCtx.globalAlpha=1;
  }
  drawEndEl(ox, leftW, leftIsOpen, state.left.type==='beam');
  drawEndEl(ox+(totalLenMm-rightW)*scaleX, rightW, rightIsOpen, state.right.type==='beam');

  topCtx.fillStyle='#1B1F26'; topCtx.font='9px monospace'; topCtx.textAlign='center';
  topCtx.fillText(Math.round(leftW)+'mm', ox+leftW*scaleX/2, doorLineY+28);
  topCtx.fillText(Math.round(rightW)+'mm', ox+(totalLenMm-rightW/2)*scaleX, doorLineY+28);

  // internal column poles: 26mm wide, 80mm deep, positioned 225-305mm from wall (NOT full depth)
  const poleZoneTop = wallY + 225*scaleY, poleZoneBot = wallY + 305*scaleY;
  function drawPole(xPos){
    const pw = Math.max(3, 26*scaleX);
    topCtx.fillStyle = '#1B1F26';
    topCtx.fillRect(xPos - pw/2, poleZoneTop, pw, poleZoneBot-poleZoneTop);
  }

  let internalStartMm = 0, internalEndMm = totalLenMm;
  const widthLabels = [];
  if(internal.segments && internal.segments.length){
    internalStartMm = leftIsOpen ? leftW : 0;
    internalEndMm = totalLenMm - (rightIsOpen ? rightW : 0);
    let x = ox + internalStartMm*scaleX;
    drawPole(x);
    internal.segments.forEach(seg=>{
      const w = seg.width*scaleX;
      const isDrawer = seg.label.indexOf('Drawer')>=0;
      topCtx.strokeStyle = isDrawer ? '#4E7A5A' : '#3E6B8A';
      topCtx.lineWidth=1.2;
      if(isDrawer) topCtx.setLineDash([4,2]);
      // carcass box always spans full depth to the door line — shelf depth is an internal reference, not the box boundary
      topCtx.strokeRect(x, wallY, w, doorLineY-wallY);
      topCtx.setLineDash([]);
      widthLabels.push({ x: x+w/2, text: Math.round(seg.width)+'mm' });
      x += w;
      drawPole(x);
    });
  }
  topCtx.fillStyle='#1B1F26'; topCtx.font='8px monospace'; topCtx.textAlign='center';
  widthLabels.forEach(l => topCtx.fillText(l.text, l.x, doorLineY+42));

  // door panel indicators at the door line
  if(state.doorType !== 'none'){
    const openX0 = ox+internalStartMm*scaleX, openX1 = ox+internalEndMm*scaleX;
    if(state.doorType === 'sliding'){
      const pw = (openX1-openX0)/d.panelCount;
      for(let i=1;i<d.panelCount;i++){
        const xPos = openX0+i*pw;
        topCtx.strokeStyle='#2B4C7E'; topCtx.lineWidth=1;
        topCtx.beginPath(); topCtx.moveTo(xPos,doorLineY-8); topCtx.lineTo(xPos,doorLineY+8); topCtx.stroke();
      }
      for(let i=0;i<d.panelCount;i++){
        const midX = openX0 + pw*(i+0.5);
        const dir = i%2===0 ? 1 : -1;
        topCtx.strokeStyle='#1B1F26'; topCtx.lineWidth=1;
        topCtx.beginPath();
        topCtx.moveTo(midX-10*dir, doorLineY+18); topCtx.lineTo(midX+10*dir, doorLineY+18);
        topCtx.lineTo(midX+5*dir, doorLineY+14);
        topCtx.stroke();
      }
    } else {
      const pw = (openX1-openX0)/d.panelCount;
      const unitsSeq = [];
      for(let i=0;i<d.bifoldPairs;i++) unitsSeq.push(2);
      if(d.swingCount) unitsSeq.push(1);
      let x = openX0;
      unitsSeq.forEach((panelsInUnit, u) => {
        const unitW = pw*panelsInUnit;
        for(let p=1;p<panelsInUnit;p++){
          const xPos = x+p*pw;
          topCtx.strokeStyle='#8A8577'; topCtx.lineWidth=1;
          topCtx.beginPath(); topCtx.moveTo(xPos,doorLineY-5); topCtx.lineTo(xPos,doorLineY+5); topCtx.stroke();
        }
        const hingeLeft = u%2===0;
        const hingeX = hingeLeft ? x+3 : x+unitW-3;
        topCtx.fillStyle='#1B1F26';
        topCtx.beginPath(); topCtx.arc(hingeX, doorLineY, 3, 0, Math.PI*2); topCtx.fill();
        x += unitW;
      });
      // interior pillars: same 50x80mm footprint as end pillars, recessed 18mm further back from the door line
      if(d.interiorPillars>0){
        const pillarZoneBot = doorLineY - 18*scaleY;
        const pillarZoneTop = pillarZoneBot - 80*scaleY;
        let cum=0, placed=0;
        for(let u=0;u<unitsSeq.length && placed<d.interiorPillars;u++){
          cum += unitsSeq[u];
          if((u+1)%2===0 && u+1<unitsSeq.length){
            const xPos = openX0 + cum*pw;
            const pw2 = Math.max(3, 50*scaleX);
            topCtx.fillStyle='#C08A3E';
            topCtx.fillRect(xPos-pw2/2, pillarZoneTop, pw2, pillarZoneBot-pillarZoneTop);
            placed++;
          }
        }
      }
    }
  }
}

function renderSpecSheet(d){
  const el = document.getElementById('specSheet');
  let html = '<h3>Structure</h3><div class="spec-grid">';
  html += '<div><span class="k">Left side:</span> '+d.left.desc+'</div>';
  html += '<div><span class="k">Right side:</span> '+d.right.desc+'</div>';
  html += '<div><span class="k">Effective depth:</span> '+Math.round(d.depth)+'mm</div>';
  html += '<div><span class="k">Door opening width:</span> '+Math.round(d.doorOpening)+'mm</div>';
  html += '<div><span class="k">Shelf depth:</span> '+Math.round(d.shelfDepth)+'mm</div>';
  html += '<div><span class="k">Drawer count:</span> '+d.drawerCount+' (per set)</div>';
  html += '</div>';

  if(state.doorType !== 'none'){
    html += '<h3>Door</h3><div class="spec-grid">';
    html += '<div><span class="k">Door height:</span> '+Math.round(d.doorHeight)+'mm</div>';
    html += '<div><span class="k">Pelmet height:</span> '+Math.round(d.pelmetHeight)+'mm</div>';
    if(state.doorType==='sliding'){
      html += '<div><span class="k">Panels:</span> '+d.panelCount+' sliding</div>';
      html += '<div><span class="k">Panel width:</span> '+d.panelWidth.toFixed(0)+'mm (+20mm overlap)</div>';
    } else {
      html += '<div><span class="k">Panels:</span> '+d.panelCount+' ('+d.bifoldPairs+' bifold pair(s)'+(d.swingCount?' + 1 swing':'')+')</div>';
      html += '<div><span class="k">Panel width:</span> '+d.panelWidth.toFixed(0)+'mm</div>';
      html += '<div><span class="k">Hinge units:</span> '+d.hingeUnits+'</div>';
      html += '<div><span class="k">Interior pillars:</span> '+d.interiorPillars+' (recessed 18mm, +2 end anchors)</div>';
      if(d.splitInfo && d.splitInfo.type==='split') html += '<div><span class="k">Height split:</span> bottom 2080mm + top '+Math.round(d.splitInfo.top)+'mm</div>';
      if(d.splitInfo && d.splitInfo.type==='midrail') html += '<div><span class="k">Mid-rail:</span> structural rail at 2400mm (no panel split)</div>';
    }
    html += '</div>';
  }

  html += '<h3>Drawer placement</h3><div class="spec-grid"><div style="grid-column:1/3;">'+d.drawerPlacement+'</div></div>';

  el.innerHTML = html;

  if(d.notes.length){
    el.innerHTML += '<div class="ok-note"><strong>Notes:</strong><br>' + d.notes.map(n=>'· '+n).join('<br>') + '</div>';
  }
  if(d.warnings.length){
    el.innerHTML += '<div class="warn-box"><div class="w-title">Needs review</div><ul>' + d.warnings.map(w=>'<li>'+w+'</li>').join('') + '</ul></div>';
  }
}

function renderInternalSheet(i){
  const el = document.getElementById('internalSheet');
  let html = '<h3>Internal Configuration (Section 6)</h3>';
  html += '<div class="spec-grid"><div><span class="k">Internal structural width:</span> ' + Math.round(i.internalWidth) + 'mm</div>';
  if(i.poles) html += '<div><span class="k">Poles:</span> ' + i.poles + ' × 26mm</div>';
  html += '</div>';

  if(i.segments && i.segments.length){
    html += '<h3>Column layout (left → right)</h3>';
    html += '<div class="price-line" style="font-weight:600;border-bottom:1px solid #34394480;padding-bottom:6px;margin-bottom:4px;"><span>Segment</span><span class="amt">Width / Zone</span></div>';
    i.segments.forEach(seg => {
      html += '<div class="price-line"><span>' + seg.label + '</span><span class="amt">' + Math.round(seg.width) + 'mm — ' + seg.type + '</span></div>';
    });
    if(typeof i.installBuffer === 'number') html += '<div class="price-line"><span style="color:#8A8577;">Install buffer (rounding leftover)</span><span class="amt">' + i.installBuffer.toFixed(1) + 'mm</span></div>';
  }

  el.innerHTML = html;

  if(state.internalHeightUpgrade){
    el.innerHTML += '<div class="ok-note"><strong>Section 6.5a:</strong> internal height upgrade active — every section above gets one additional shelf at the 2400mm line, on top of its normal template content (rods/drawers/shelves unchanged).</div>';
  }
  if(i.notes && i.notes.length){
    el.innerHTML += '<div class="ok-note"><strong>Notes:</strong><br>' + i.notes.map(n=>'· '+n).join('<br>') + '</div>';
  }
  if(i.warnings && i.warnings.length){
    el.innerHTML += '<div class="warn-box"><div class="w-title">Needs review</div><ul>' + i.warnings.map(w=>'<li>'+w+'</li>').join('') + '</ul></div>';
  }
}

function renderPriceSheet(p, d){
  const el = document.getElementById('priceSheet');
  let html = '<h3>Estimated Cost</h3>';
  html += '<div class="price-tier-label">' + p.tierLabel + '</div>';

  if(p.outOfTier){
    html += '<div class="warn-box"><div class="w-title">Outside standard pricing</div><ul><li>Ceiling height exceeds 3600mm — this configuration falls outside the standard pricing tiers. Quote manually.</li></ul></div>';
    el.innerHTML = html;
    return;
  }

  html += '<div class="price-line"><span>Base rate</span><span class="amt">$' + p.baseRate + '/pftrun</span></div>';
  if(p.topUp > 0) html += '<div class="price-line"><span>Ceiling-height top-up</span><span class="amt">+$' + p.topUp + '/pftrun</span></div>';
  html += '<div class="price-line"><span>Run length</span><span class="amt">' + p.feet.toFixed(1) + ' ft</span></div>';
  html += '<div class="price-line"><span>Base cost (' + p.feet.toFixed(1) + 'ft × $' + p.rate + ')</span><span class="amt">$' + p.baseCost.toFixed(2) + '</span></div>';

  if(p.hingeLines.length){
    html += '<h3>Hinge units</h3>';
    p.hingeLines.forEach(l => html += '<div class="price-line"><span>' + l + '</span></div>');
    html += '<div class="price-line"><span>Hinge unit subtotal</span><span class="amt">$' + p.hingeCost.toFixed(2) + '</span></div>';
  }

  if(p.finishLines.length){
    html += '<h3>Finish upgrades</h3>';
    p.finishLines.forEach(l => html += '<div class="price-line"><span>' + l + '</span></div>');
    html += '<div class="price-line"><span>Finish subtotal</span><span class="amt">$' + p.finishCost.toFixed(2) + '</span></div>';
  }

  html += '<div class="price-total"><span class="label">Estimated total (before GST)</span><span class="amount">$' + p.total.toFixed(2) + '</span></div>';

  el.innerHTML = html;
}

function renderAddonsPage(d, p, ap, ls){
  const summaryEl = document.getElementById('baseConfigSummary');
  let sHtml = '<h3>Base Configuration (from Configurator page)</h3><div class="spec-grid">';

  if(ls){
    sHtml += '<div><span class="k">Shape:</span> L-Shaped — Leg A ' + state.ls.legALength + 'mm, Leg B ' + state.ls.legBLength + 'mm</div>';
    sHtml += '<div><span class="k">Combined:</span> ' + p.feet.toFixed(1) + 'ft (incl. 1ft corner deduction)</div>';
    sHtml += '<div><span class="k">Doors:</span> Leg A ' + (ls.doorA.type==='none'?'none':ls.doorA.panelCount+'× '+ls.doorA.type) + ' · Leg B ' + (ls.doorB.type==='none'?'none':ls.doorB.panelCount+'× '+ls.doorB.type) + '</div>';
    sHtml += '<div><span class="k">Drawers included in base:</span> ' + ls.drawerCount + ' (combined length)</div>';
    sHtml += '<div><span class="k">Internal height:</span> ' + (state.ls.internalHeightUpgrade ? '2400mm (upgraded)' : '2080mm (standard)') + '</div>';
  } else {
    sHtml += '<div><span class="k">Length:</span> ' + state.length + 'mm (' + p.feet.toFixed(1) + 'ft)</div>';
    sHtml += '<div><span class="k">Door type:</span> ' + state.doorType + '</div>';
    sHtml += '<div><span class="k">Drawers included in base:</span> ' + d.drawerCount + ' (standard, from length formula)</div>';
    sHtml += '<div><span class="k">Internal height:</span> ' + (state.internalHeightUpgrade ? '2400mm (upgraded)' : '2080mm (standard)') + '</div>';
  }
  sHtml += '</div>';

  if(!p.outOfTier){
    sHtml += '<h3>Base price breakdown</h3>';
    sHtml += '<div class="price-line"><span>' + (ls ? 'Base rate (' : 'Standard rate — 2080mm internal, 2400mm door (') + p.feet.toFixed(1) + 'ft × $' + p.baseRate + ')</span><span class="amt">$' + (p.baseRate * p.feet).toFixed(2) + '</span></div>';
    if(p.topUp > 0){
      sHtml += '<div class="price-line"><span>Height upgrade top-up — ' + p.tierLabel.replace(/^[^·]+·\s*/, '') + ' (' + p.feet.toFixed(1) + 'ft × $' + p.topUp + ')</span><span class="amt">$' + (p.topUp * p.feet).toFixed(2) + '</span></div>';
    } else {
      sHtml += '<div class="price-line"><span style="color:#8A8577;">No height upgrade — standard config</span></div>';
    }
    if(p.hingeLines.length){
      p.hingeLines.forEach(l => sHtml += '<div class="price-line"><span>' + l + '</span></div>');
    }
    if(p.finishLines && p.finishLines.length){
      p.finishLines.forEach(l => sHtml += '<div class="price-line"><span>' + l + '</span></div>');
    }
    sHtml += '<div class="price-line" style="border-top:1px solid #34394480;padding-top:8px;margin-top:6px;"><span style="font-weight:600;">Base price total</span><span class="amt" style="font-weight:600;">$' + p.total.toFixed(2) + '</span></div>';
  } else {
    sHtml += '<div class="warn-box"><div class="w-title">Outside standard pricing</div><ul><li>Ceiling exceeds 3600mm — quote manually on the Configurator page.</li></ul></div>';
  }
  summaryEl.innerHTML = sHtml;

  const el = document.getElementById('addonPriceSheet');
  let html = '<h3>Add-ons &amp; Accessories</h3>';

  if(ap.lines.length === 0){
    html += '<div class="price-line"><span style="color:#8A8577;">No add-ons selected yet.</span></div>';
  } else {
    ap.lines.forEach(l => {
      html += '<div class="price-line"><span>' + l.label + '</span><span class="amt">$' + l.cost.toFixed(2) + '</span></div>';
    });
    html += '<div class="price-line" style="border-top:1px solid #4A3A2280;padding-top:8px;margin-top:6px;"><span>Add-ons subtotal</span><span class="amt">$' + ap.total.toFixed(2) + '</span></div>';
  }

  if(p.outOfTier){
    html += '<div class="warn-box"><div class="w-title">Base price unavailable</div><ul><li>Base configuration is outside standard pricing tiers — grand total can\'t be computed until that\'s resolved on the Configurator page.</li></ul></div>';
  } else {
    html += '<div class="price-total"><span class="label">Grand total (base + add-ons, before GST)</span><span class="amount">$' + ap.grandTotal.toFixed(2) + '</span></div>';
  }

  el.innerHTML = html;
}

/* ---------- quote output (page 3) ---------- */
function formatDateDDMMMYYYY(date){
  const dd = String(date.getDate()).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mmm = months[date.getMonth()];
  const yyyy = date.getFullYear();
  return dd + '/' + mmm + '/' + yyyy;
}

function generateQuoteText(s, d, internal, p, ap, ls){
  const lines = [];
  lines.push('*HausPole Wardrobe Quotation*');
  const today = new Date();
  lines.push('Date: ' + formatDateDDMMMYYYY(today));
  lines.push('');

  let drawerCountForQuote;
  if(ls){
    const hasDoorLs = ls.doorA.type !== 'none' || ls.doorB.type !== 'none';
    const internalHeightLs = s.ls.internalHeightUpgrade ? 2400 : 2080;
    lines.push('Shape: L-Shaped — Leg A ' + s.ls.legALength + 'mm × Leg B ' + s.ls.legBLength + 'mm × ' + s.ls.depth + 'mm depth, ceiling ' + s.ls.ceiling + 'mm');
    const legDoorSummary = (leg, door) => leg + ': ' + (door.type === 'none' ? 'no door' : door.panelCount + '-panel ' + (door.type === 'sliding' ? 'sliding (glass)' : (door.type + (door.panelCount === 1 ? ' single swing' : ' bifold'))));
    lines.push('Doors: ' + legDoorSummary('Leg A', ls.doorA) + ' · ' + legDoorSummary('Leg B', ls.doorB));
    lines.push('Drawers: ' + ls.drawerCount + ' unit(s)');
    lines.push('');
    lines.push('Unless otherwise stated, this HausPole system is constructed with:');
    lines.push('- Use of 18mm thick E0/E1 grade board with PVC laminate (for shelves, side panels, and drawer components)');
    const poleFinishNameLs = s.poleFinish === 'champagne' ? 'champagne' : (s.poleFinish === 'black' ? 'black' : 'silver');
    lines.push('- Free internal configuration up to ' + internalHeightLs + 'mm height (hanging bars, adjustable shelving, pigeon holes, ' + poleFinishNameLs + ' aluminum poles)');
    if(hasDoorLs){
      const partitionPelmetHeightLs = s.ls.ceiling;
      lines.push('- Partition wall & pelmet built up to ' + partitionPelmetHeightLs + 'mm height and finished in white paint');
    }
    lines.push('- ' + ls.drawerCount + ' drawer(s) equipped with soft-close runners');
    const lsDoorHeightForQuote = Math.round(lsLegDoorHeight());
    function legDoorSystemLine(door){
      if(door.type === 'sliding') return 'Top and Bottom track sliding door ' + lsDoorHeightForQuote + 'mm height with glass';
      if(door.type === 'wooden') return 'Wooden hinged/bifold door system at ' + lsDoorHeightForQuote + 'mm height in laminated plywood' + (door.autoMaterial ? ' (material assumed — confirm with customer)' : '');
      if(door.type === 'aluminum') return 'Aluminium-framed hinged/bifold door system at ' + lsDoorHeightForQuote + 'mm height in glass';
      return null;
    }
    if(ls.doorA.type !== 'none') lines.push('- Leg A door: ' + legDoorSystemLine(ls.doorA));
    if(ls.doorB.type !== 'none') lines.push('- Leg B door: ' + legDoorSystemLine(ls.doorB));
    drawerCountForQuote = ls.drawerCount;
  } else {
    const internalHeight = s.internalHeightUpgrade ? 2400 : 2080;
    lines.push('Dimensions: ' + s.length + ' x ' + s.ceiling + ' x ' + Math.round(d.depth) + 'mm');

    let doorSummary, doorSystemLine;
    if(s.doorType === 'none'){
      doorSummary = 'No door (open wardrobe)';
      doorSystemLine = null;
    } else if(s.doorType === 'sliding'){
      doorSummary = d.panelCount + '-panel sliding (glass)';
      doorSystemLine = 'Top and Bottom track sliding door ' + Math.round(d.doorHeight) + 'mm height with glass';
    } else if(s.doorType === 'wooden'){
      doorSummary = d.panelCount + '-panel wooden hinged/bifold';
      if(d.splitInfo && d.splitInfo.type === 'split'){
        doorSystemLine = 'Top and bottom wooden hinged/bifold door system up to ' + Math.round(d.doorHeight) + 'mm height in laminated plywood';
      } else {
        doorSystemLine = 'Wooden hinged/bifold door system at ' + Math.round(d.doorHeight) + 'mm height in laminated plywood';
      }
    } else {
      doorSummary = d.panelCount + '-panel aluminum bifold';
      doorSystemLine = 'Aluminium-framed hinged/bifold door system at ' + Math.round(d.doorHeight) + 'mm height in glass';
    }
    lines.push('Door: ' + doorSummary);
    lines.push('Drawers: ' + d.drawerCount + ' unit(s)');
    lines.push('');
    lines.push('Unless otherwise stated, this HausPole system is constructed with:');
    lines.push('- Use of 18mm thick E0/E1 grade board with PVC laminate (for shelves, side panels, and drawer components)');
    const poleFinishName = s.poleFinish === 'champagne' ? 'champagne' : (s.poleFinish === 'black' ? 'black' : 'silver');
    lines.push('- Free internal configuration up to ' + internalHeight + 'mm height (hanging bars, adjustable shelving, pigeon holes, ' + poleFinishName + ' aluminum poles)');
    if(s.doorType !== 'none'){
      const partitionPelmetHeight = s.ceiling;
      lines.push('- Partition wall & pelmet built up to ' + partitionPelmetHeight + 'mm height and finished in white paint');
    }
    lines.push('- ' + d.drawerCount + ' drawer(s) equipped with soft-close runners');
    if(doorSystemLine) lines.push('- ' + doorSystemLine);
    drawerCountForQuote = d.drawerCount;
  }

  // Additional inclusions from selected add-ons
  const inclusionLines = [];
  if(s.internalHeightUpgrade) inclusionLines.push('Internal height upgraded to 2400mm');
  if(s.poleFinish && s.poleFinish !== 'silver') inclusionLines.push('Pole finish: ' + (s.poleFinish === 'champagne' ? 'Champagne' : 'Black'));
  if(s.mirrorQty > 0) inclusionLines.push(s.mirrorQty + ' full mirror door panel(s)');
  if(s.laminateQty > 0) inclusionLines.push(s.laminateQty + ' laminate finish piece(s)');
  if(s.addonExtraDrawers > 0) inclusionLines.push(s.addonExtraDrawers + ' additional drawer(s) beyond base count');
  if(s.addonSecretDrawer > 0) inclusionLines.push(s.addonSecretDrawer + ' secret drawer top-up');
  if(s.addonDrawerHead > 0) inclusionLines.push(s.addonDrawerHead + ' drawer head(s) upgraded to mirror + aluminium frame');
  if(s.dismantle) inclusionLines.push('Dismantle & disposal of existing wardrobe/fixtures');
  if(s.addonRelocatePoint > 0) inclusionLines.push(s.addonRelocatePoint + ' relocated switch/power point(s)');
  if(s.addonNewSwitch > 0) inclusionLines.push(s.addonNewSwitch + ' new light switch(es)');
  if(s.led) inclusionLines.push('LED lighting (' + (s.addonLedLength||0).toFixed(1) + 'm)');
  if(s.addonSensor > 0) inclusionLines.push(s.addonSensor + ' wired sensor(s)');
  if(s.addonWireBasket > 0) inclusionLines.push(s.addonWireBasket + ' pull-out wire basket(s)');
  if(s.addonTrouserHolder > 0) inclusionLines.push(s.addonTrouserHolder + ' trouser holder(s)');
  if(s.addonDoubleTrouser > 0) inclusionLines.push(s.addonDoubleTrouser + ' double trouser hanger(s)');
  if(s.addonPulloutTrouser > 0) inclusionLines.push(s.addonPulloutTrouser + ' pull-out trouser hanger(s)');
  if(s.addonFullMirror > 0) inclusionLines.push(s.addonFullMirror + ' full-length pull-out mirror(s)');
  if(s.addonBoxMirror > 0) inclusionLines.push(s.addonBoxMirror + ' box-up mirror(s)');
  if(s.addonFlipMirror > 0) inclusionLines.push(s.addonFlipMirror + ' flip mirror(s)');

  if(inclusionLines.length){
    lines.push('');
    lines.push('_Additional inclusions for this quote:_');
    inclusionLines.forEach(l => lines.push('- ' + l));
  }

  // Exclusions — dynamically drop items that were actually selected as paid add-ons
  lines.push('');
  lines.push('Excludes (unless quoted separately):');
  const electricalCovered = s.addonRelocatePoint > 0 || s.addonNewSwitch > 0;
  if(electricalCovered){
    lines.push('- Electrical works — aircon/ceiling fan shifting not included unless specified separately (switch/plug relocation and new points for this job are included above)');
  } else {
    lines.push('- Electrical works (e.g. switch/plug relocation, new electrical points, aircon/ceiling fan shifting)');
  }
  if(!s.dismantle){
    lines.push('- General works (dismantle/disposal of existing cabinetry/fixtures)');
  }
  lines.push('- Floor & Wall works (e.g. paint touch up or full repainting, floor polish/repair/leveling)');

  lines.push('');
  if(p.outOfTier){
    lines.push('*Total: Quote pending — ceiling exceeds standard pricing tiers*');
  } else {
    lines.push('*Total (before GST): $' + ap.grandTotal.toFixed(2) + '*');
    const validUntil = new Date(today);
    validUntil.setMonth(validUntil.getMonth() + 1);
    lines.push('_This quote is valid until ' + formatDateDDMMMYYYY(validUntil) + '._');
  }

  return lines.join('\n');
}

function renderQuotePage(s, d, internal, p, ap, ls){
  const el = document.getElementById('quotePreview');
  el.textContent = generateQuoteText(s, d, internal, p, ap, ls);
}
document.getElementById('lengthInput').addEventListener('input', e=>{ state.length=Number(e.target.value)||0; render(); });
document.getElementById('ceilingInput').addEventListener('input', e=>{ state.ceiling=Number(e.target.value)||2600; syncUpgradeVisibility(); render(); });
document.getElementById('depthInput').addEventListener('input', e=>{ state.depth=Number(e.target.value)||600; render(); });

function wireSide(prefix, key){
  const typeSel = document.getElementById(prefix+'Type');
  const beamFields = document.getElementById(prefix+'BeamFields');
  const bw = document.getElementById(prefix+'BeamWidth');
  typeSel.addEventListener('change', ()=>{
    state[key].type = typeSel.value;
    beamFields.classList.toggle('show', typeSel.value==='beam');
    render();
  });
  bw.addEventListener('input', ()=>{ state[key].beamWidth=Number(bw.value)||0; render(); });
}
wireSide('left','left');
wireSide('right','right');

const doorTypeFieldWrap = document.getElementById('doorTypeFieldWrap');
const doorTypeNA = document.getElementById('doorTypeNA');
document.getElementById('doorTypePref').addEventListener('change', e=>{ state.doorTypePref = e.target.value; syncLaminateControl(); syncUpgradeVisibility(); render(); });
document.querySelectorAll('#doorRequiredToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#doorRequiredToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.doorRequired = btn.dataset.required === 'yes';
    doorTypeFieldWrap.style.display = state.doorRequired ? 'block' : 'none';
    doorTypeNA.style.display = state.doorRequired ? 'none' : 'block';
    syncLaminateControl();
    syncUpgradeVisibility();
    render();
  });
});

const chkUpgrade = document.getElementById('chkUpgrade');
const upgradeField = document.getElementById('upgradeField');
chkUpgrade.addEventListener('click', ()=>{
  state.doorHeightUpgrade = !state.doorHeightUpgrade;
  chkUpgrade.classList.toggle('on', state.doorHeightUpgrade);
  render();
});
function syncUpgradeVisibility(){
  const available = state.ceiling > 2450 && state.doorType !== 'none';
  upgradeField.style.display = available ? 'block' : 'none';
  if(!available && state.doorHeightUpgrade){
    state.doorHeightUpgrade = false;
    chkUpgrade.classList.remove('on');
  }
}

const chkInternalUpgrade = document.getElementById('chkInternalUpgrade');
chkInternalUpgrade.addEventListener('click', ()=>{
  state.internalHeightUpgrade = !state.internalHeightUpgrade;
  chkInternalUpgrade.classList.toggle('on', state.internalHeightUpgrade);
  render();
});

const mirrorQtyInput = document.getElementById('mirrorQty');
mirrorQtyInput.addEventListener('input', ()=>{
  state.mirrorQty = Math.max(0, Number(mirrorQtyInput.value) || 0);
  render();
});

const laminateQtyInput = document.getElementById('laminateQty');
const laminateField = document.getElementById('laminateField');
const laminateHint = document.getElementById('laminateHint');
laminateQtyInput.addEventListener('input', ()=>{
  state.laminateQty = Math.max(0, Number(laminateQtyInput.value) || 0);
  render();
});

const poleFinishSelect = document.getElementById('poleFinish');
poleFinishSelect.addEventListener('change', ()=>{
  state.poleFinish = poleFinishSelect.value;
  render();
});
function syncLaminateControl(){
  if(state.doorType === 'wooden'){
    laminateQtyInput.disabled = true;
    laminateField.style.opacity = '0.55';
    laminateHint.textContent = 'Laminate is included by default for wooden doors (+$80/panel, already priced into hinge unit cost above) — not entered separately here.';
  } else {
    laminateQtyInput.disabled = false;
    laminateField.style.opacity = '1';
    laminateHint.textContent = 'Optional upgrade for sliding/aluminum doors — enter the number of pieces needed.';
  }
}

document.querySelectorAll('#shapeToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#shapeToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.shape = btn.dataset.shape;
    document.getElementById('straightFields').style.display = state.shape==='straight' ? 'block' : 'none';
    document.getElementById('lshapeFields').style.display = state.shape==='lshape' ? 'block' : 'none';
    document.getElementById('straightOutput').style.display = state.shape==='straight' ? 'block' : 'none';
    document.getElementById('lshapeOutput').style.display = state.shape==='lshape' ? 'block' : 'none';
    resizeCanvas();
  });
});

function wireLsNumber(id, key){
  document.getElementById(id).addEventListener('input', e=>{
    state.ls[key] = Math.max(0, Number(e.target.value) || 0);
    render();
  });
}
function wireLsSelect(id, key, beamFieldsId){
  const sel = document.getElementById(id);
  const beamFields = beamFieldsId ? document.getElementById(beamFieldsId) : null;
  sel.addEventListener('change', e=>{
    state.ls[key] = e.target.value;
    if(beamFields) beamFields.classList.toggle('show', e.target.value === 'beam');
    render();
  });
}
wireLsNumber('lsCeilingInput', 'ceiling');
wireLsNumber('lsDepthInput', 'depth');
wireLsNumber('legALength', 'legALength');
wireLsSelect('legAWall', 'legAWall', 'legABeamFields');
wireLsNumber('legABeamWidth', 'legABeamWidth');
wireLsNumber('legBLength', 'legBLength');
wireLsSelect('legBWall', 'legBWall', 'legBBeamFields');
wireLsNumber('legBBeamWidth', 'legBBeamWidth');

let lsLastDoorRequired = true;
document.querySelectorAll('#lsDoorRequiredToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#lsDoorRequiredToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    lsLastDoorRequired = btn.dataset.required === 'yes';
    state.ls.legADoorType = lsLastDoorRequired ? state.ls.doorTypePref : 'none';
    state.ls.legBDoorType = lsLastDoorRequired ? state.ls.doorTypePref : 'none';
    render();
  });
});
document.getElementById('lsDoorTypePref').addEventListener('change', e=>{
  state.ls.doorTypePref = e.target.value;
  if(lsLastDoorRequired){
    state.ls.legADoorType = state.ls.doorTypePref;
    state.ls.legBDoorType = state.ls.doorTypePref;
  }
  render();
});

const lsChkDoorUpgrade = document.getElementById('lsChkDoorUpgrade');
lsChkDoorUpgrade.addEventListener('click', ()=>{
  state.ls.doorHeightUpgrade = !state.ls.doorHeightUpgrade;
  lsChkDoorUpgrade.classList.toggle('on', state.ls.doorHeightUpgrade);
  render();
});
const lsChkInternalUpgrade = document.getElementById('lsChkInternalUpgrade');
lsChkInternalUpgrade.addEventListener('click', ()=>{
  state.ls.internalHeightUpgrade = !state.ls.internalHeightUpgrade;
  lsChkInternalUpgrade.classList.toggle('on', state.ls.internalHeightUpgrade);
  render();
});

function wireNumberInput(id, key, parse){
  const el = document.getElementById(id);
  el.addEventListener('input', ()=>{
    state[key] = parse ? parse(el.value) : Math.max(0, Number(el.value) || 0);
    render();
  });
}
wireNumberInput('addonExtraDrawers', 'addonExtraDrawers');
wireNumberInput('addonSecretDrawer', 'addonSecretDrawer');
wireNumberInput('addonDrawerHead', 'addonDrawerHead');
wireNumberInput('addonRelocatePoint', 'addonRelocatePoint');
wireNumberInput('addonNewSwitch', 'addonNewSwitch');
wireNumberInput('addonLedLength', 'addonLedLength', v => Math.max(0, Number(v) || 0));
wireNumberInput('addonSensor', 'addonSensor');
wireNumberInput('addonWireBasket', 'addonWireBasket');
wireNumberInput('addonTrouserHolder', 'addonTrouserHolder');
wireNumberInput('addonDoubleTrouser', 'addonDoubleTrouser');
wireNumberInput('addonPulloutTrouser', 'addonPulloutTrouser');
wireNumberInput('addonFullMirror', 'addonFullMirror');
wireNumberInput('addonBoxMirror', 'addonBoxMirror');
wireNumberInput('addonFlipMirror', 'addonFlipMirror');

const chkDismantle = document.getElementById('chkDismantle');
chkDismantle.addEventListener('click', ()=>{
  state.dismantle = !state.dismantle;
  chkDismantle.classList.toggle('on', state.dismantle);
  render();
});

const chkLed = document.getElementById('chkLed');
const ledLengthField = document.getElementById('ledLengthField');
chkLed.addEventListener('click', ()=>{
  state.led = !state.led;
  chkLed.classList.toggle('on', state.led);
  ledLengthField.style.display = state.led ? 'block' : 'none';
  render();
});

document.querySelectorAll('.pole-tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.pole-tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    canvas.style.display = view==='ext' ? 'block' : 'none';
    internalCanvas.style.display = view==='int' ? 'block' : 'none';
    topCanvas.style.display = view==='top' ? 'block' : 'none';
    const threeD = document.getElementById('threeDViewContainer');
    if (threeD) threeD.style.display = view==='3d' ? 'block' : 'none';
    resizeCanvas();
  });
});

document.querySelectorAll('.pole-ls-tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.pole-ls-tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.lsview;
    lsExtCanvas.style.display = view==='ext' ? 'block' : 'none';
    lsIntCanvas.style.display = view==='int' ? 'block' : 'none';
    lsCanvas.style.display = view==='top' ? 'block' : 'none';
    const threeDLS = document.getElementById('threeDViewContainerLS');
    if (threeDLS) threeDLS.style.display = view==='3d' ? 'block' : 'none';
    resizeCanvas();
  });
});

window.addEventListener('resize', resizeCanvas);
syncUpgradeVisibility();
syncLaminateControl();
resizeCanvas();



return { render: render, resizeCanvas: resizeCanvas };
})();

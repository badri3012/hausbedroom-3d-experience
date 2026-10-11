/**
 * Outward-sliding door kinematics for the Contemporary Sliding Wardrobe.
 *
 * All values in metres, X axis, wardrobe centre = 0.
 * Pure functions only (no three.js / React) so they can be tested in Node.
 *
 * Mechanical Invariants:
 * 1. Left door moves strictly in the negative X direction (toward the LEFT).
 * 2. Right door moves strictly in the positive X direction (toward the RIGHT).
 * 3. Both doors have independent movement paths.
 * 4. Never animate both doors toward the centre.
 * 5. Never stack both doors on the same side.
 * 6. Never reverse the intended movement direction.
 * 7. Doors must not intersect the cabinet structure.
 * 8. Sliding movement respects the available tracks.
 * 9. Reference position matches the photographed layout (outer-parked, centre exposed).
 * 10. Reference position is the MAXIMUM INWARD position allowed for each door.
 */

export interface DoorTrackSpec {
  /** Left end of the track / mechanical bumper limit */
  openingLeftX: number;
  /** Right end of the track / mechanical bumper limit */
  openingRightX: number;
  doorWidth: number;
  /** Reference-photograph resting centre X of the left door (outer-parked) */
  restLeftX: number;
  /** Reference-photograph resting centre X of the right door (outer-parked) */
  restRightX: number;
  /** Outward slide stroke (metres) */
  outwardTravelDistance: number;
}

export interface SingleDoorTravel {
  restX: number;
  openX: number;
  /** Free track length OUTWARD from the rest position */
  outwardAvailable: number;
  /** Signed X delta applied when the door is "slid" (negative = left, positive = right) */
  slideDelta: number;
  /** Hard X limits for the door's centre (reference position is the absolute inward limit) */
  minX: number;
  maxX: number;
  direction: "outward";
}

export interface DoorTravelReport {
  outwardTravelPossible: boolean;
  mode: "outward-only";
  left: SingleDoorTravel;
  right: SingleDoorTravel;
  centreGapAtRest: number;
  centreGapAtFullTravel: number;
  messages: string[];
}

export function computeDoorTravel(spec: DoorTrackSpec): DoorTravelReport {
  const half = spec.doorWidth / 2;
  const messages: string[] = [];

  // --- Left door -------------------------------------------------------
  // At rest: outer stile = restLeftX - half, inner stile = restLeftX + half
  const leftOuterAtRest = spec.restLeftX - half;
  const leftOutwardAvailable = Math.max(0, leftOuterAtRest - spec.openingLeftX);
  const leftStroke = Math.min(spec.outwardTravelDistance, leftOutwardAvailable);

  // Left door moves in negative X direction (toward the left)
  const leftSlideDelta = -leftStroke;
  const leftOpenX = spec.restLeftX + leftSlideDelta;

  const left: SingleDoorTravel = {
    restX: spec.restLeftX,
    openX: leftOpenX,
    outwardAvailable: leftOutwardAvailable,
    slideDelta: leftSlideDelta,
    minX: leftOpenX, // full outward open limit
    maxX: spec.restLeftX, // reference position is the absolute maximum inward limit
    direction: "outward",
  };

  // --- Right door ------------------------------------------------------
  // At rest: outer stile = restRightX + half, inner stile = restRightX - half
  const rightOuterAtRest = spec.restRightX + half;
  const rightOutwardAvailable = Math.max(0, spec.openingRightX - rightOuterAtRest);
  const rightStroke = Math.min(spec.outwardTravelDistance, rightOutwardAvailable);

  // Right door moves in positive X direction (toward the right)
  const rightSlideDelta = +rightStroke;
  const rightOpenX = spec.restRightX + rightSlideDelta;

  const right: SingleDoorTravel = {
    restX: spec.restRightX,
    openX: rightOpenX,
    outwardAvailable: rightOutwardAvailable,
    slideDelta: rightSlideDelta,
    minX: spec.restRightX, // reference position is the absolute maximum inward limit
    maxX: rightOpenX, // full outward open limit
    direction: "outward",
  };

  const gapAtRest = spec.restRightX - half - (spec.restLeftX + half);
  const gapAtFull = right.openX - half - (left.openX + half);

  messages.push(
    `Outward sliding kinematics active: Left door moves LEFT (${(leftStroke * 1000).toFixed(0)} mm, negative X), Right door moves RIGHT (${(rightStroke * 1000).toFixed(0)} mm, positive X).`
  );
  messages.push(
    `Reference positions (X = ${spec.restLeftX.toFixed(2)} m and ${spec.restRightX.toFixed(2)} m) are the strict maximum inward boundaries.`
  );
  messages.push(
    `Central storage gap: ${(gapAtRest * 1000).toFixed(0)} mm at rest, widening to ${(gapAtFull * 1000).toFixed(0)} mm when doors open outward.`
  );

  return {
    outwardTravelPossible: leftStroke > 0 && rightStroke > 0,
    mode: "outward-only",
    left,
    right,
    centreGapAtRest: gapAtRest,
    centreGapAtFullTravel: gapAtFull,
    messages,
  };
}

/** Clamp a door-centre X into its physically allowed range. */
export function clampDoorX(x: number, travel: SingleDoorTravel): number {
  return Math.min(travel.maxX, Math.max(travel.minX, x));
}

/**
 * Single source of truth for the Contemporary Sliding Wardrobe door track
 * (demonstration dimensions, metres). Used by the 3D model, the UI and the tests.
 */
const CW_TOTAL_W = 3.0;
const CW_DOOR_W = 1.10;
const CW_OUTWARD_STROKE = 0.25; // 250mm outward sliding stroke
const CW_TRACK_EXTENSION = 0.25; // Track rails extend to +/-1.75m to support outward travel

export const CONTEMPORARY_DOOR_SPEC: DoorTrackSpec = {
  openingLeftX: -CW_TOTAL_W / 2 - CW_TRACK_EXTENSION, // -1.75m
  openingRightX: CW_TOTAL_W / 2 + CW_TRACK_EXTENSION, // +1.75m
  doorWidth: CW_DOOR_W,
  restLeftX: -CW_TOTAL_W / 2 + CW_DOOR_W / 2, // -0.95m
  restRightX: CW_TOTAL_W / 2 - CW_DOOR_W / 2, // +0.95m
  outwardTravelDistance: CW_OUTWARD_STROKE,
};

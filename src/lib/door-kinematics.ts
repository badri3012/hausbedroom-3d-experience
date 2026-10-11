/**
 * Sliding-door travel validation for the Contemporary Sliding Wardrobe.
 *
 * All values in metres, X axis, wardrobe centre = 0.
 * Pure functions only (no three.js / React) so they can be tested in Node.
 */

export interface DoorTrackSpec {
  /** Left end of the track / inside face of the left side panel */
  openingLeftX: number;
  /** Right end of the track / inside face of the right side panel */
  openingRightX: number;
  doorWidth: number;
  /** Reference-photograph resting centre X of the left door (outer-parked) */
  restLeftX: number;
  /** Reference-photograph resting centre X of the right door (outer-parked) */
  restRightX: number;
  /** Doors must always leave at least this clear gap at the centre (never meet) */
  minCentreGap: number;
  /** Largest slide we are willing to offer in the "inward" fallback */
  maxInwardTravel: number;
  /** Smallest outward travel that counts as a real, usable movement */
  minUsefulTravel?: number;
}

export interface SingleDoorTravel {
  restX: number;
  /** Free track length OUTWARD (towards own side panel) from the rest position */
  outwardAvailable: number;
  /** Free track length INWARD (towards centre) before the centre gap is violated */
  inwardAvailable: number;
  /** Signed X delta applied when the door is "slid" (negative = left) */
  slideDelta: number;
  /** Hard X limits for the door's centre */
  minX: number;
  maxX: number;
  direction: "outward" | "inward-limited" | "none";
}

export interface DoorTravelReport {
  outwardTravelPossible: boolean;
  mode: "outward" | "inward-limited";
  left: SingleDoorTravel;
  right: SingleDoorTravel;
  centreGapAtFullTravel: number;
  messages: string[];
}

export function computeDoorTravel(spec: DoorTrackSpec): DoorTravelReport {
  const half = spec.doorWidth / 2;
  const minUseful = spec.minUsefulTravel ?? 0.05;
  const messages: string[] = [];

  // --- Left door -------------------------------------------------------
  const leftOuterEdge = spec.restLeftX - half;
  const leftInnerEdge = spec.restLeftX + half;
  const leftOutward = Math.max(0, leftOuterEdge - spec.openingLeftX);
  const leftInward = Math.max(0, -spec.minCentreGap / 2 - leftInnerEdge);

  // --- Right door ------------------------------------------------------
  const rightOuterEdge = spec.restRightX + half;
  const rightInnerEdge = spec.restRightX - half;
  const rightOutward = Math.max(0, spec.openingRightX - rightOuterEdge);
  const rightInward = Math.max(0, rightInnerEdge - spec.minCentreGap / 2);

  const outwardPossible = leftOutward >= minUseful && rightOutward >= minUseful;

  let left: SingleDoorTravel;
  let right: SingleDoorTravel;

  if (outwardPossible) {
    messages.push(
      `Outward travel available: left ${(leftOutward * 1000).toFixed(0)} mm, right ${(rightOutward * 1000).toFixed(0)} mm.`
    );
    left = {
      restX: spec.restLeftX,
      outwardAvailable: leftOutward,
      inwardAvailable: leftInward,
      slideDelta: -leftOutward,
      minX: spec.restLeftX - leftOutward,
      maxX: spec.restLeftX + Math.min(leftInward, spec.maxInwardTravel),
      direction: "outward",
    };
    right = {
      restX: spec.restRightX,
      outwardAvailable: rightOutward,
      inwardAvailable: rightInward,
      slideDelta: rightOutward,
      minX: spec.restRightX - Math.min(rightInward, spec.maxInwardTravel),
      maxX: spec.restRightX + rightOutward,
      direction: "outward",
    };
  } else {
    messages.push(
      `Outward travel NOT possible: left door has ${(leftOutward * 1000).toFixed(0)} mm and right door has ${(rightOutward * 1000).toFixed(0)} mm of free track beyond the reference position (doors already sit flush against the side panels).`
    );
    const lIn = Math.min(leftInward, spec.maxInwardTravel);
    const rIn = Math.min(rightInward, spec.maxInwardTravel);
    messages.push(
      `Closest physically plausible movement: each door slides only inward by up to ${(Math.min(lIn, rIn) * 1000).toFixed(0)} mm and never closer than ${(spec.minCentreGap * 1000).toFixed(0)} mm to the other door.`
    );
    left = {
      restX: spec.restLeftX,
      outwardAvailable: leftOutward,
      inwardAvailable: leftInward,
      slideDelta: lIn,
      minX: spec.restLeftX - leftOutward, // == rest (no outward room)
      maxX: spec.restLeftX + lIn,
      direction: lIn > 0 ? "inward-limited" : "none",
    };
    right = {
      restX: spec.restRightX,
      outwardAvailable: rightOutward,
      inwardAvailable: rightInward,
      slideDelta: -rIn,
      minX: spec.restRightX - rIn,
      maxX: spec.restRightX + rightOutward, // == rest
      direction: rIn > 0 ? "inward-limited" : "none",
    };
  }

  const leftInnerAtFull = left.restX + left.slideDelta + half;
  const rightInnerAtFull = right.restX + right.slideDelta - half;

  return {
    outwardTravelPossible: outwardPossible,
    mode: outwardPossible ? "outward" : "inward-limited",
    left,
    right,
    centreGapAtFullTravel: rightInnerAtFull - leftInnerAtFull,
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
export const CONTEMPORARY_DOOR_SPEC: DoorTrackSpec = {
  openingLeftX: -CW_TOTAL_W / 2,
  openingRightX: CW_TOTAL_W / 2,
  doorWidth: CW_DOOR_W,
  restLeftX: -CW_TOTAL_W / 2 + CW_DOOR_W / 2,
  restRightX: CW_TOTAL_W / 2 - CW_DOOR_W / 2,
  minCentreGap: 0.3,
  maxInwardTravel: 0.25,
};

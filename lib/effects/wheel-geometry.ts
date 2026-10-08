/**
 * Geometry of the works wheel (components/effects/works-wheel.tsx): items sit in
 * a ring, then open into a vertical drum that turns one item at a time. Pure
 * functions, no DOM. Everything is driven by one number, `turn`:
 * 0 = the ring, 1 = the drum with item 0 at the front, and every whole number
 * after that is one more item turned past.
 */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (n: number) => n * n * (3 - 2 * n);
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Front card height as a share of the stage, and its width / height. */
const CARD_H = 0.38;
const CARD_RATIO = 1.45;
/** Degrees between neighbouring cards on the drum. */
export const STEP = 40;
/** Drum radius, ring radius, perspective distance and sideways bow, in card heights. */
const DRUM = 2.22;
const RING_R = 1.14;
const LENS = 2.7;
const BOW = 1.82;
/** Items either side of the front still worth drawing. Past this a card is edge-on. */
export const CULL = 1.6;

export type WheelMetrics = {
  cardW: number;
  cardH: number;
  ringR: number;
  /** Cards on the ring are drawn smaller so the circle reads as a closed loop. */
  ringScale: number;
  /** Scale of the whole wheel while it is a ring, so the ring fits a narrow stage. */
  ringFit: number;
  drumR: number;
  bow: number;
  /** Perspective distance in px. */
  depth: number;
  /** Type size for the ring label and the front-card caption. */
  title: number;
};

export function wheelMetrics(w: number, h: number, count: number): WheelMetrics {
  // A phone is narrow and tall: let the front card take most of the width.
  const maxW = w < 640 ? 0.72 : 0.34;
  const cardW = Math.max(1, Math.min(h * CARD_H * CARD_RATIO, w * maxW));
  const cardH = cardW / CARD_RATIO;
  const ringR = cardH * RING_R;
  const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / cardW, 0.16, 1) : 1;
  // The ring's reach from its centre: its radius plus half a (shrunk) card. It has to fit the
  // width, and the height with room left for the fixed site header (hence 0.78).
  const reach = ringR + (cardW * ringScale) / 2;
  const ringFit = clamp(Math.min(((w / 2) * 0.92) / reach, ((h / 2) * 0.78) / (ringR + (cardH * ringScale) / 2)), 0.2, 1);
  return {
    cardW,
    cardH,
    ringR,
    ringScale,
    ringFit,
    drumR: cardH * DRUM,
    bow: cardH * BOW,
    depth: cardH * LENS,
    title: cardH * 0.124,
  };
}

/** How far left the arc has carried something `drumDeg` off the front. Zero at the front. */
export const bowAt = (drumDeg: number, bow: number) => -bow * (1 - Math.cos(rad(drumDeg)));

/**
 * Both states in one chain (`m` is 0 for the ring, 1 for the drum): the ring
 * terms fall away as `m` reaches 1, the drum terms are still zero while the
 * ring is up. The bow is applied first, in the wheel's own plane.
 */
export function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

/**
 * Scroll progress (0..1) → turn (0..count). Each whole step eases in and out,
 * so the wheel dwells on an item (and on the opened ring) instead of drifting
 * between two. At p = k / count the turn is exactly k.
 */
export function turnAt(progress: number, count: number) {
  if (count <= 0) return 0;
  const t = clamp(progress, 0, 1) * count;
  const whole = Math.floor(t);
  return whole + smoothstep(t - whole);
}

/** The progress at which item `index` is exactly at the front. */
export const progressForItem = (index: number, count: number) => (index + 1) / count;

/** State of one card at `turn`. */
export function cardState(index: number, turn: number, count: number) {
  const m = clamp(turn, 0, 1);
  const pos = Math.max(0, turn - 1);
  const d = index - pos;
  return {
    m,
    d,
    ringDeg: d * (360 / count),
    drumDeg: d * STEP,
    /** Culled by distance, not angle: at a full turn the far side comes back round to face us. */
    hidden: m > 0.5 && Math.abs(d) > CULL,
    z: Math.round(100 - Math.abs(d) * 2),
  };
}

/** Index of the item at the front (the nearest one, once the ring has opened). */
export const activeItem = (turn: number, count: number) =>
  clamp(Math.round(Math.max(0, turn - 1)), 0, Math.max(count - 1, 0));

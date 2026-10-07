/**
 * Geometry for the LED dot field (components/effects/led-dot-field.tsx):
 * a photo drawn as a grid of round dots. Pure functions, no DOM.
 */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Source rectangle that shows `src` the way `object-fit: cover` shows it in `dst`. */
export function coverRect(srcW: number, srcH: number, dstW: number, dstH: number) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (srcRatio > dstRatio) {
    const sw = srcH * dstRatio;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / dstRatio;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

/** Square cells that tile `width` exactly and cover `height`. `target` is the wanted cell size in px. */
export function gridSpec(width: number, height: number, target: number) {
  const cols = Math.max(1, Math.round(width / target));
  const cell = width / cols;
  const rows = Math.max(1, Math.ceil(height / cell));
  return { cols, rows, cell };
}

/**
 * How lit a column is while the light sweeps left to right. `front` runs 0..1;
 * the lit edge is soft (a tail of 30% of the columns), 0 = dark, 1 = fully lit.
 */
export function sweepLevel(col: number, cols: number, front: number) {
  const tail = cols * 0.3;
  const position = -tail + clamp(front) * (cols + 2 * tail);
  return clamp((position - col) / tail);
}

/** Falloff 1 at the pointer, 0 at `radius` and beyond (quadratic). */
export function pointerBoost(dx: number, dy: number, radius: number) {
  const n = Math.hypot(dx, dy) / radius;
  return n >= 1 ? 0 : (1 - n) ** 2;
}

/**
 * A ring that leaves its origin: `dist` is the cell's distance from the tap,
 * `age` and `life` are in the same unit of time, `speed` is px per that unit.
 * Fades out over `life`.
 */
export function rippleBoost(dist: number, age: number, life: number, speed: number, width: number) {
  if (age < 0 || age >= life) return 0;
  const off = Math.abs(dist - age * speed);
  if (off >= width) return 0;
  return (1 - off / width) * (1 - age / life);
}

export function luma(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Dot radius for a cell. Bright pixels get bigger dots, an unlit cell keeps a
 * faint pin-prick, `boost` swells the dot, and `shrink` (0..1) closes it up as
 * the picture takes over.
 */
export function dotRadius(cell: number, brightness: number, lit: number, boost: number, shrink: number) {
  const unlit = cell * 0.07;
  const full = cell * (0.16 + 0.34 * clamp(brightness) ** 0.8) * (1 + 0.7 * clamp(boost));
  return (unlit + (full - unlit) * clamp(lit)) * (1 - clamp(shrink));
}

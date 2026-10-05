/*
 * Pure geometry for the About dot field: 1,500 dots, one per Hack Club, one red.
 * No DOM in here; DotField.tsx owns the canvas and the loop.
 */

export const DOT_COUNT = 1500;

export interface Field {
  x: Float32Array;
  y: Float32Array;
  /** index of the red dot (Hack Club NUST) */
  red: number;
}

export interface Shape {
  cols: number;
  rows: number;
}

/** Seeded PRNG so the field is identical on every render and resize. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 50 × 30 below 640px, 60 × 25 from 640px. Both are exactly 1,500. */
export function pickShape(isSm: boolean): Shape {
  return isSm ? { cols: 60, rows: 25 } : { cols: 50, rows: 30 };
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Lens radius, plain dot radius and red dot radius for a given pitch. */
export function lensParams(p: number): { R: number; r0: number; rr: number } {
  return {
    R: clamp(p * 7, 56, 96),
    r0: p * 0.17,
    rr: Math.max(p * 0.32, 2.4),
  };
}

/**
 * Dot positions: a jittered grid (a population, not graph paper) with 2p padding.
 * Jitter is a fraction of pitch, so the field has the same shape at every size.
 */
export function layoutField(cols: number, rows: number, p: number): Field {
  const n = cols * rows;
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const rand = mulberry32(2021);
  const j = 0.28 * p;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      x[i] = 2 * p + (col + 0.5) * p + (rand() * 2 - 1) * j;
      y[i] = 2 * p + (row + 0.5) * p + (rand() * 2 - 1) * j;
    }
  }
  const red = Math.round(0.33 * (rows - 1)) * cols + Math.round(0.64 * (cols - 1));
  return { x, y, red };
}

export type Side = 'left' | 'right';

export interface Leader {
  side: Side;
  elbow: { x: number; y: number };
  end: { x: number; y: number };
  labelStyle: {
    left: string;
    top: string;
    transform: string;
    textAlign: 'left' | 'right';
    whiteSpace: 'nowrap' | 'normal';
    maxWidth: string;
  };
}

/** The hairline leader from the red dot to its label, and where the label sits. */
export function leaderGeometry(rx: number, ry: number, cssW: number): Leader {
  const side: Side = rx + 36 + 240 <= cssW ? 'right' : 'left';
  const s = side === 'right' ? 1 : -1;
  return {
    side,
    elbow: { x: rx + s * 22, y: ry - 22 },
    end: { x: rx + s * 36, y: ry - 22 },
    labelStyle:
      side === 'right'
        ? {
            left: `${rx + 40}px`,
            top: `${ry - 22}px`,
            transform: 'translateY(-50%)',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            maxWidth: 'none',
          }
        : {
            left: `${rx - 40}px`,
            top: `${ry - 22}px`,
            transform: 'translate(-100%, -50%)',
            textAlign: 'right',
            whiteSpace: 'normal',
            maxWidth: `${Math.max(rx - 48, 0)}px`,
          },
  };
}

/** Canvas equivalent of EASE_INOUT for the sweep. */
export function easeInOutCubic(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

export function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

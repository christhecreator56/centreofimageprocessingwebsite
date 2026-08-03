/**
 * Deterministic decorative QR matrix used by the preloader.
 *
 * The same module list drives three layers, which is what makes the
 * loader -> hero handoff feel like one continuous object:
 *   1. the white QR you actually see while loading
 *   2. the SVG <mask> whose "on" modules are punched out of the curtain
 *   3. the flash layer that blooms outward at the moment of handoff
 *
 * Modules are expressed as [x, y, w, h, on] on a 29x29 grid.
 * `on` = 1 -> dark module (white in the decorative QR, a hole in the mask)
 * `on` = 0 -> light module (carves the rings inside finder patterns)
 */

export const QR_SIZE = 29;
/** Grid centre. The 1x1 core module sits exactly here, so the reveal
 *  opens from the middle of the QR's "eye" and never off-axis. */
export const QR_CENTER = QR_SIZE / 2;

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- *
 * Structural modules — always visible, never "decoded"
 * ---------------------------------------------------------------- */

const FINDERS = [
  [1, 1],
  [21, 1],
  [1, 21],
];

const structural = [];

FINDERS.forEach(([fx, fy]) => {
  structural.push([fx, fy, 7, 7, 1]);
  structural.push([fx + 1, fy + 1, 5, 5, 0]);
  structural.push([fx + 2, fy + 2, 3, 3, 1]);
});

/* Timing tracks — the alternating dashes of a real QR */
for (let x = 9; x <= 19; x += 2) structural.push([x, 7, 1, 1, 1]);
for (let y = 9; y <= 19; y += 2) structural.push([7, y, 1, 1, 1]);

export const QR_STRUCTURAL = structural;

/* ---------------------------------------------------------------- *
 * The central "eye" — this is the aperture the whole reveal grows from
 * ---------------------------------------------------------------- */

/* A solid block rather than a ring: it is the aperture the reveal grows
 * through, and a solid centre keeps the opening strictly monotonic —
 * a ring would let the curtain close back over the middle mid-zoom. */
export const QR_EYE = [[12, 12, 5, 5, 1]];

/* ---------------------------------------------------------------- *
 * Data modules — decoded progressively as the loader counts up
 * ---------------------------------------------------------------- */

function isReserved(x, y) {
  if (x < 1 || y < 1 || x > 27 || y > 27) return true; // quiet zone
  if (x <= 8 && y <= 8) return true; // top-left finder + separator
  if (x >= 20 && y <= 8) return true; // top-right finder + separator
  if (x <= 8 && y >= 20) return true; // bottom-left finder + separator
  if (x >= 11 && x <= 17 && y >= 11 && y <= 17) return true; // central eye + separator
  if (x === 7 || y === 7) return true; // timing tracks
  return false;
}

function buildData() {
  const rand = mulberry32(0x1a5eed);
  const cells = [];
  // Reading order, so the decode sweeps top-left to bottom-right and
  // reads as an actual scan rather than random confetti.
  for (let y = 1; y <= 27; y++) {
    for (let x = 1; x <= 27; x++) {
      if (isReserved(x, y)) continue;
      if (rand() > 0.54) cells.push([x, y, 1, 1, 1]);
    }
  }
  return cells;
}

export const QR_DATA = buildData();

/** Every module, in paint order. Used verbatim by the mask. */
export const QR_ALL = [...QR_STRUCTURAL, ...QR_DATA, ...QR_EYE];

/** Treatments for the two copies of the Cyber Hackathon key art. See specs/chapter.md §4, §8. */

/** "Lights off": a near-monochrome ghost. Nothing in it reads as red. */
export const DIM_FILTER = 'grayscale(0.92) brightness(0.38) contrast(1.08)';

/** The lit copy under the torch. */
export const LIT_FILTER = 'saturate(1.15) brightness(1.05)';

/**
 * Left-to-right scrim for the bleed variant. ≥ 0.93 across the text column (which ends at
 * 43%), opens to 0.10 over the figure and padlock, closes slightly at the far edge.
 * Deliberately not `bg-scrim-x`: its 0.82 fails 4.5:1 for fg-2 once the torch lights
 * full-colour terminal glow under the text.
 */
export const SCRIM_X =
  'linear-gradient(90deg, #0B0507 0%, #0B0507 20%, rgba(11,5,7,0.93) 44%, rgba(11,5,7,0.55) 62%, rgba(11,5,7,0.10) 80%, rgba(11,5,7,0.35) 100%)';

/** Bottom scrim inside the mobile/tablet frame, under the overlaid title. */
export const FRAME_SCRIM =
  'linear-gradient(0deg, #0B0507 0%, rgba(11,5,7,0.92) 24%, rgba(11,5,7,0) 60%)';

/** object-position per variant, as fractions (also fed to the torch's rest-point maths). */
export const OBJECT_POSITION = {
  bleed: { x: 0.5, y: 0.26 },
  frame: { x: 0.5, y: 0.5 },
} as const;

export const ART_ALT =
  'Key art for The Cyber Hackathon ’26: a hooded figure stands with their back to us before a wall of translucent red terminal windows showing hex dumps and a cracked padlock, smoke drifting over a circuit-board floor.';

/* Shared motion constants for the About section (DESIGN_SYSTEM.md §5). */
export const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
export const EASE_INOUT = [0.77, 0, 0.175, 1] as const;

/**
 * Entrance props for one of the section's two entrance groups.
 * Reduced motion: opacity only, 0.3s.
 */
export const fade = (reduce: boolean, delay: number) =>
  reduce
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.3 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.7, ease: EASE_OUT, delay },
      };

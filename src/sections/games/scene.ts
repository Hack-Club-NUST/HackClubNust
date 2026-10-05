/** Text size + tracking shared by the HUD row and plain footer rows inside a tube. */
export const HUD_TEXT = 'text-[10px] sm:text-[11px] uppercase tracking-[0.14em]';

/** Pick the active scene and its local time from a looping scene list. */
export function pickScene<S extends { durationMs: number }>(scenes: readonly S[], t: number): { scene: S; lt: number } {
  const total = scenes.reduce((sum, s) => sum + s.durationMs, 0);
  let lt = total > 0 ? t % total : 0;
  for (const scene of scenes) {
    if (lt < scene.durationMs) return { scene, lt };
    lt -= scene.durationMs;
  }
  return { scene: scenes[0], lt: 0 };
}

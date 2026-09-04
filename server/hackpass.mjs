import crypto from 'node:crypto';

/**
 * HackPass: a redeemable discount code, earned by clearing a high score bar in
 * BOTH games (best single run each, independently — not summed).
 *
 * Thresholds were set by simulating the real scoring code (see the scripts run
 * to calibrate this), not guessed:
 *
 *   AI vs Human  — true ceiling 11,050 (60k simulated perfect runs). A player who
 *                  answers every round correctly averages 8,700-9,200; 90%
 *                  accuracy averages ~6,163. The 7,500 bar sits between those,
 *                  so only a genuinely sharp, fast player clears it.
 *   Cipher Tunes — true ceiling is DETERMINISTIC at 5,050 (every run draws the
 *                  same word-length composition: 3,3,4,4,5,5,6). 7/7 correct
 *                  with zero hints averages ~4,570; with one hint, ~3,550. The
 *                  3,800 bar requires acing all seven words with almost no help.
 *
 * Both bars sit at roughly 70-75% of the true ceiling. Revisit these once real
 * stall data exists — right now there is one completed run in the database.
 */
export const WIN_THRESHOLDS = {
  'ai-human': 7500,
  'cipher-tunes': 3800,
};

/**
 * Hard sanity ceiling per game. The API rejects any submitted score above this —
 * it is mathematically impossible to reach with real play, so a request that
 * exceeds it did not come from the game.
 *
 * This is NOT full anti-cheat: the server still trusts the shape of a legitimate
 * run (score, correct, total) as reported by the client, because neither game
 * re-derives round outcomes server-side. It only blocks blatant forgery, not a
 * plausible fabricated number under the ceiling. See README for the honest
 * writeup of this limitation and what closing it fully would require.
 */
export const SCORE_CEILING = {
  'ai-human': 11500, // true max 11,050 + margin for future sample additions
  'cipher-tunes': 5050, // exact, deterministic
};

export function scoreExceedsCeiling(game, score) {
  return score > (SCORE_CEILING[game] ?? Infinity);
}

export function meetsThreshold(game, score) {
  return score >= (WIN_THRESHOLDS[game] ?? Infinity);
}

/** No 0/O/1/I/L — the code gets read aloud and typed by a barista. */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateHackpassCode() {
  const bytes = crypto.randomBytes(6);
  let body = '';
  for (const b of bytes) body += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `HACK-${body}`;
}

/**
 * Cipher Tunes runs on seven recorded letter tunes supplied by the club.
 *
 * Each source recording is ~10 seconds. Concatenating those raw would make a
 * five-letter word 50 seconds long, so every letter is represented in play by a
 * 2.5s "signature" — the most distinctive window of its tune, chosen by scoring
 * every candidate window on how little it resembles the other six letters.
 * That cut halved average confusability (0.84 -> 0.67 chroma similarity).
 *
 * The signatures are also loudness-normalised to -16 LUFS. The raw files ranged
 * from -16 dB to -45 dB mean, so R was nearly inaudible next to O.
 */
export const LETTERS = ['A', 'G', 'H', 'L', 'M', 'O', 'R'] as const;
export type Letter = (typeof LETTERS)[number];

export const isLetter = (value: string): value is Letter =>
  (LETTERS as readonly string[]).includes(value);

/** The 2.5s signature used everywhere in play. */
export const signatureUrl = (letter: Letter) => `/game/tunes/${letter}.mp3`;

/** The full ~10s recording, offered on the practice screen only. */
export const fullTuneUrl = (letter: Letter) => `/game/tunes/${letter}-full.mp3`;

export const SIGNATURE_S = 2.5;
/** Silence between letters when a word is played, so boundaries are audible. */
export const LETTER_GAP_S = 0.35;

export const wordDurationS = (word: string) =>
  word.length * SIGNATURE_S + Math.max(0, word.length - 1) * LETTER_GAP_S;

/** Each letter gets a colour so the ear has something for the eye to hold onto. */
export const LETTER_COLOR: Record<Letter, string> = {
  A: '#F26251',
  G: '#EB4554',
  H: '#F59E0B',
  L: '#34D399',
  M: '#60A5FA',
  O: '#A78BFA',
  R: '#F472B6',
};

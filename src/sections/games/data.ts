import { WORDS } from '../../game/tunes/words';

export type GameId = 'ai-vs-human' | 'cipher-tunes';

export interface GameCard {
  id: GameId;
  title: string;
  tagline: string;
  desc: string;
  caption?: string;
  bezel: string;
}

export const GAMES: readonly [GameCard, GameCard] = [
  {
    id: 'ai-vs-human',
    title: 'AI vs Human',
    tagline: 'Detector',
    desc: 'Fifteen rounds of prose, code and images. Some hand you one artifact and ask who made it; some put two side by side and ask which one the machine made. Every call is answered with the tell you missed.',
    bezel: 'TEXT · CODE · IMAGE  ·  SINGLE + COMPARE  ·  CLUB LEADERBOARD',
  },
  {
    id: 'cipher-tunes',
    title: 'Cipher Tunes',
    tagline: 'Listen & Spell',
    desc: 'Seven letters, seven tunes, recorded by the club. Learn them on the practice board, then a word plays as one melody and you spell back what you heard. No notation, no theory — just ears.',
    caption: 'Preview is silent. The tunes play when you press Play Now.',
    bezel: '7 LETTER TUNES  ·  PRACTICE FIRST  ·  CLUB LEADERBOARD',
  },
];

export const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;
export const EASE_INOUT = [0.77, 0, 0.175, 1] as const;

/**
 * The screen palette (all aria-hidden): warm cream type lit by the hero's red,
 * so the screens read as the same room as the goggles, not a different one.
 */
export const PHOSPHOR = {
  primary: 'text-fg',
  secondary: 'text-fg-3',
  muted: 'text-fg/35',
  accent: 'text-brand',
  glow: '[text-shadow:0_0_12px_rgba(237,74,82,0.45)]',
} as const;

/** Text/code samples from src/game/data/samples.ts, in attract order. Images are never loaded here. */
export const AI_ATTRACT_IDS = ['t-hu-2', 't-ai-2', 'c-hu-2', 't-hu-4', 'c-ai-7', 't-ai-7'];

/** Words from the Cipher Tunes bank, in attract order. Filtered so a typo can never ship an unplayable word. */
const BANK = new Set(Object.values(WORDS).flat());
export const TUNE_ATTRACT_WORDS = ['LLAMA', 'HALO', 'ALARM', 'ROAM', 'GRAHAM', 'MORAL'].filter((w) => BANK.has(w));

/** Length of the crt-on unfold (animate-crt-on) and the stagger between the two cabinets. */
export const CRT_ON_MS = 450;
export const CRT_STAGGER_MS = 120;

// AI vs Human attract timing
export const TITLE_MS = 3200;
export const TITLE_CUT_MS = 160;
export const ROUND_MS = 7000;
export const REVEAL_AT = 3100;
export const TELL_AT = 3500;
export const ROUND_CUT_AT = 6800;
export const TYPE_CAP = 260;
export const CPS_TEXT = 14;
export const CPS_CODE = 8;

// Cipher Tunes attract timing
export const ALPHABET_MS = 2600;
export const SWEEP_STEP_MS = 300;
export const SWEEP_ON_MS = 260;
export const LETTER_MS = 660;
export const LETTER_ON_MS = 520;
export const GAP_MS = 400;
export const SPELL_MS = 300;
export const SPELL_FLASH_MS = 200;
export const CORRECT_AT_PAD = 500;
export const CORRECT_POP_MS = 300;
export const HOLD_MS = 1800;
export const CUT_MS = 200;

import { ALPHABET } from './cipher';
import { wordsOfLength } from './words';

export type CipherRoundKind = 'letter' | 'word';

export interface CipherRound {
  id: string;
  kind: CipherRoundKind;
  /** The letter to identify, or the word to spell. */
  answer: string;
}

export interface CipherRoundResult {
  roundId: string;
  kind: CipherRoundKind;
  answer: string;
  guess: string | null;
  correct: boolean;
  basePoints: number;
  speedBonus: number;
  earBonus: number;
  penalty: number;
  comboBonus: number;
  pointsEarned: number;
  replays: number;
  hints: number;
  earMode: boolean;
  msLeft: number;
  limitMs: number;
  comboAfter: number;
}

export const LETTER_BASE = 150;
export const PER_LETTER_BASE = 100;

/** Playing without the on-screen guide is the hard mode, and it pays. */
export const EAR_MODE_MULTIPLIER = 1.5;

export const FREE_REPLAYS = 2;
const REPLAY_PENALTY_RATE = 0.15;
const MAX_REPLAY_PENALTY_RATE = 0.6;
const HINT_PENALTY_RATE = 0.25;
export const MAX_HINTS = 2;

const MAX_SPEED_MULTIPLIER = 0.4;

export const COMBO_BONUS: Record<number, number> = {
  3: 100,
  5: 250,
  7: 500,
  10: 1000,
};

/** Decoding by ear is slower than looking, so these clocks are generous. */
export function limitFor(round: CipherRound): number {
  return round.kind === 'letter' ? 20_000 : 12_000 + round.answer.length * 6_000;
}

export function basePointsFor(round: CipherRound): number {
  return round.kind === 'letter' ? LETTER_BASE : PER_LETTER_BASE * round.answer.length;
}

export interface ScoreInput {
  round: CipherRound;
  guess: string | null;
  msLeft: number;
  replays: number;
  hints: number;
  earMode: boolean;
  comboBefore: number;
}

export function scoreCipherRound(input: ScoreInput): CipherRoundResult {
  const { round, guess, msLeft, replays, hints, earMode, comboBefore } = input;
  const limitMs = limitFor(round);
  const correct = guess !== null && guess.toUpperCase() === round.answer.toUpperCase();

  const shell = {
    roundId: round.id,
    kind: round.kind,
    answer: round.answer,
    guess,
    replays,
    hints,
    earMode,
    msLeft,
    limitMs,
  };

  if (!correct) {
    return {
      ...shell,
      correct: false,
      basePoints: 0,
      speedBonus: 0,
      earBonus: 0,
      penalty: 0,
      comboBonus: 0,
      pointsEarned: 0,
      comboAfter: 0,
    };
  }

  const comboAfter = comboBefore + 1;
  const basePoints = basePointsFor(round);
  const speedBonus = Math.round(
    basePoints * MAX_SPEED_MULTIPLIER * Math.max(0, Math.min(1, msLeft / limitMs))
  );

  const earned = basePoints + speedBonus;
  const earBonus = earMode ? Math.round(earned * (EAR_MODE_MULTIPLIER - 1)) : 0;

  const replayRate = Math.min(
    Math.max(0, replays - FREE_REPLAYS) * REPLAY_PENALTY_RATE,
    MAX_REPLAY_PENALTY_RATE
  );
  const penalty = Math.round(basePoints * (replayRate + hints * HINT_PENALTY_RATE));
  const comboBonus = COMBO_BONUS[comboAfter] ?? 0;

  return {
    ...shell,
    correct: true,
    basePoints,
    speedBonus,
    earBonus,
    penalty,
    comboBonus,
    pointsEarned: Math.max(0, earned + earBonus - penalty) + comboBonus,
    comboAfter,
  };
}

export interface CipherRank {
  title: string;
  blurb: string;
}

export function cipherRankFor(correct: number, total: number): CipherRank {
  const pct = total === 0 ? 0 : (correct / total) * 100;
  if (pct === 100) return { title: 'Perfect Pitch', blurb: 'Every motif, first time. Nothing slipped past your ear.' };
  if (pct >= 85) return { title: 'Golden Ear', blurb: 'You are reading the grid faster than you are reading this.' };
  if (pct >= 70) return { title: 'Tuned In', blurb: 'The melodies are becoming letters. Keep going.' };
  if (pct >= 55) return { title: 'Half a Melody', blurb: 'You have the rows. The columns are still winning.' };
  if (pct >= 40) return { title: 'Humming Along', blurb: 'Something is getting through, but mostly it is guesswork.' };
  return { title: 'Tone Deaf', blurb: 'Start with the ladder. Learn five pitches before you chase words.' };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Five letter drills to build the mapping, then words that get longer. */
const WORD_LENGTHS = [3, 3, 4, 4, 5, 5, 6];
export const ROUNDS_PER_RUN = 5 + WORD_LENGTHS.length;

export function buildCipherRun(): CipherRound[] {
  const letters = shuffle([...ALPHABET])
    .slice(0, 5)
    .map((letter, i) => ({ id: `l${i}-${letter}`, kind: 'letter' as const, answer: letter }));

  const used = new Set<string>();
  const words = WORD_LENGTHS.map((length, i) => {
    const pool = shuffle(wordsOfLength(length)).filter((w) => !used.has(w));
    const answer = pool[0] ?? wordsOfLength(length)[0];
    used.add(answer);
    return { id: `w${i}-${answer}`, kind: 'word' as const, answer };
  });

  return [...letters, ...words];
}

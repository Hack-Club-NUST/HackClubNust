import { wordDurationS } from './alphabet';
import { wordsOfLength } from './words';

export interface TuneRound {
  id: string;
  word: string;
}

export interface TuneRoundResult {
  roundId: string;
  word: string;
  guess: string | null;
  correct: boolean;
  basePoints: number;
  speedBonus: number;
  penalty: number;
  comboBonus: number;
  pointsEarned: number;
  replays: number;
  hints: number;
  msLeft: number;
  limitMs: number;
  comboAfter: number;
}

export const PER_LETTER_BASE = 100;
const MAX_SPEED_MULTIPLIER = 0.4;

export const FREE_REPLAYS = 2;
const REPLAY_PENALTY_RATE = 0.1;
const MAX_REPLAY_PENALTY_RATE = 0.4;
const HINT_PENALTY_RATE = 0.3;
/** Short words give away too much with two reveals, so they only get one. */
export function maxHintsFor(round: TuneRound): number {
  return round.word.length > 4 ? 2 : 1;
}

export const COMBO_BONUS: Record<number, number> = { 3: 100, 5: 250, 7: 500 };

/**
 * Deliberately generous. This is a stall game for people who have never heard the
 * alphabet before, and a tight clock would punish the listening the game exists to
 * teach. The clock also excludes the length of the melody itself.
 */
export function limitFor(round: TuneRound): number {
  return Math.round((25 + round.word.length * 8) * 1000);
}

export const basePointsFor = (round: TuneRound) => PER_LETTER_BASE * round.word.length;

export interface ScoreInput {
  round: TuneRound;
  guess: string | null;
  msLeft: number;
  replays: number;
  hints: number;
  comboBefore: number;
}

export function scoreRound(input: ScoreInput): TuneRoundResult {
  const { round, guess, msLeft, replays, hints, comboBefore } = input;
  const limitMs = limitFor(round);
  const correct = guess !== null && guess.toUpperCase() === round.word.toUpperCase();

  const shell = { roundId: round.id, word: round.word, guess, replays, hints, msLeft, limitMs };

  if (!correct) {
    return {
      ...shell,
      correct: false,
      basePoints: 0,
      speedBonus: 0,
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
    penalty,
    comboBonus,
    pointsEarned: Math.max(0, basePoints + speedBonus - penalty) + comboBonus,
    comboAfter,
  };
}

export interface TuneRank {
  title: string;
  blurb: string;
}

export function rankFor(correct: number, total: number): TuneRank {
  const pct = total === 0 ? 0 : (correct / total) * 100;
  if (pct === 100) return { title: 'Perfect Pitch', blurb: 'Every word, first listen. You hear in letters now.' };
  if (pct >= 85) return { title: 'Golden Ear', blurb: 'The melody stopped being music and started being spelling.' };
  if (pct >= 70) return { title: 'Tuned In', blurb: 'You have the alphabet. The long words are the last hurdle.' };
  if (pct >= 50) return { title: 'Getting It', blurb: 'Half the words landed — that is further than most get cold.' };
  if (pct >= 25) return { title: 'Warming Up', blurb: 'A few clicked. Go back to the practice board and listen again.' };
  return { title: 'All Ears', blurb: 'Seven tunes, one alphabet. Learn them and come back.' };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Words get longer as the run goes on, so the first one is always winnable. */
const RUN_LENGTHS = [3, 3, 4, 4, 5, 5, 6];
export const ROUNDS_PER_RUN = RUN_LENGTHS.length;

export function buildRun(): TuneRound[] {
  const used = new Set<string>();
  return RUN_LENGTHS.map((length, i) => {
    const pool = shuffle(wordsOfLength(length)).filter((w) => !used.has(w));
    const word = pool[0] ?? wordsOfLength(length)[0];
    used.add(word);
    return { id: `r${i}-${word}`, word };
  });
}

export { wordDurationS };

import type {
  AnswerValue,
  Difficulty,
  Question,
  RoundResult,
  Sample,
  SampleKind,
} from './types';

export const ROUNDS_PER_RUN = 15;

/** Reading time differs wildly by artifact, so the clock is per-question, not flat. */
const BASE_LIMIT_MS: Record<Difficulty, number> = {
  easy: 20_000,
  medium: 16_000,
  hard: 13_000,
};

const KIND_FACTOR: Record<SampleKind, number> = {
  text: 1,
  code: 1.15,
  image: 0.6,
};

/** Two artifacts to read instead of one. */
const COMPARE_FACTOR = 1.5;

export function limitFor(question: Question): number {
  const base = BASE_LIMIT_MS[question.difficulty] * KIND_FACTOR[question.kind];
  return Math.round(question.mode === 'compare' ? base * COMPARE_FACTOR : base);
}

export const BASE_POINTS: Record<Difficulty, number> = {
  easy: 100,
  medium: 200,
  hard: 300,
};

/** Compare rounds ask more of the player, so they pay more. */
const COMPARE_MULTIPLIER = 1.4;

export const COMBO_BONUS: Record<number, number> = {
  3: 100,
  5: 250,
  7: 500,
  10: 1000,
  15: 2000,
};

export const MAX_SPEED_MULTIPLIER = 0.5;

export function isCorrect(question: Question, answer: AnswerValue | null): boolean {
  if (answer === null) return false;
  if (question.mode === 'single') {
    return answer === (question.sample.isAI ? 'ai' : 'human');
  }
  return answer === question.aiIndex;
}

export function scoreRound(
  question: Question,
  answer: AnswerValue | null,
  msLeft: number,
  comboBefore: number
): RoundResult {
  const limitMs = limitFor(question);
  const correct = isCorrect(question, answer);

  const shell = {
    questionId: question.id,
    mode: question.mode,
    kind: question.kind,
    answer,
    msLeft,
    limitMs,
  };

  if (!correct) {
    return {
      ...shell,
      correct: false,
      basePoints: 0,
      speedBonus: 0,
      comboBonus: 0,
      pointsEarned: 0,
      comboAfter: 0,
    };
  }

  const comboAfter = comboBefore + 1;
  const basePoints = Math.round(
    BASE_POINTS[question.difficulty] * (question.mode === 'compare' ? COMPARE_MULTIPLIER : 1)
  );
  const speedBonus = Math.round(
    basePoints * MAX_SPEED_MULTIPLIER * Math.max(0, Math.min(1, msLeft / limitMs))
  );
  const comboBonus = COMBO_BONUS[comboAfter] ?? 0;

  return {
    ...shell,
    correct: true,
    basePoints,
    speedBonus,
    comboBonus,
    pointsEarned: basePoints + speedBonus + comboBonus,
    comboAfter,
  };
}

export interface Rank {
  title: string;
  blurb: string;
}

export function rankFor(correct: number, total: number): Rank {
  const pct = total === 0 ? 0 : (correct / total) * 100;
  if (pct === 100) return { title: 'Signal Reader', blurb: 'A clean sweep. Nothing got past you.' };
  if (pct >= 85) return { title: 'Sharp Eye', blurb: 'You read the tells faster than the room.' };
  if (pct >= 70) return { title: 'Calibrated', blurb: 'Solidly better than instinct. The hard ones still bit.' };
  if (pct >= 55) return { title: 'Suspicious', blurb: 'Right more than wrong, but the models got through.' };
  if (pct >= 40) return { title: 'Coin Flip', blurb: 'Statistically, guessing would have done this well.' };
  return { title: 'Model Food', blurb: 'The machines are writing better than you are reading.' };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** What one run is made of — mixed modes, mixed media, in fixed proportion. */
const RUN_PLAN: Array<{ mode: Question['mode']; kind: SampleKind; count: number }> = [
  { mode: 'single', kind: 'text', count: 4 },
  { mode: 'single', kind: 'code', count: 3 },
  { mode: 'single', kind: 'image', count: 3 },
  { mode: 'compare', kind: 'image', count: 3 },
  { mode: 'compare', kind: 'text', count: 1 },
  { mode: 'compare', kind: 'code', count: 1 },
];

/**
 * Draw a run with no sample repeated, singles balanced 50/50 AI vs human so the
 * split is never itself a tell, then shuffled so modes interleave.
 */
export function buildRun(bank: Sample[]): Question[] {
  const pools: Record<string, Sample[]> = {};
  const key = (kind: SampleKind, ai: boolean) => `${kind}:${ai}`;
  for (const kind of ['text', 'code', 'image'] as SampleKind[]) {
    for (const ai of [true, false]) {
      pools[key(kind, ai)] = shuffle(bank.filter((s) => s.kind === kind && s.isAI === ai));
    }
  }
  const take = (kind: SampleKind, ai: boolean): Sample | null =>
    pools[key(kind, ai)].pop() ?? pools[key(kind, !ai)].pop() ?? null;

  const singleSlots = RUN_PLAN.filter((p) => p.mode === 'single');
  const singleCount = singleSlots.reduce((n, p) => n + p.count, 0);
  const flags = shuffle([
    ...Array(Math.floor(singleCount / 2)).fill(true),
    ...Array(singleCount - Math.floor(singleCount / 2)).fill(false),
  ]) as boolean[];

  const questions: Question[] = [];
  let flagIndex = 0;

  for (const slot of RUN_PLAN) {
    for (let i = 0; i < slot.count; i++) {
      if (slot.mode === 'single') {
        const sample = take(slot.kind, flags[flagIndex++]);
        if (!sample) continue;
        questions.push({
          mode: 'single',
          id: `s-${sample.id}`,
          kind: slot.kind,
          difficulty: sample.difficulty,
          sample,
        });
      } else {
        const ai = take(slot.kind, true);
        const human = take(slot.kind, false);
        if (!ai || !human || ai.isAI === human.isAI) continue;
        const aiFirst = Math.random() < 0.5;
        questions.push({
          mode: 'compare',
          id: `c-${ai.id}-${human.id}`,
          kind: slot.kind,
          difficulty: ai.difficulty === 'hard' || human.difficulty === 'hard' ? 'hard' : ai.difficulty,
          options: aiFirst ? [ai, human] : [human, ai],
          aiIndex: aiFirst ? 0 : 1,
        });
      }
    }
  }

  return shuffle(questions);
}

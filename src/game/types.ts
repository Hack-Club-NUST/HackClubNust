export type Choice = 'ai' | 'human';

export type SampleKind = 'text' | 'code' | 'image';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Credit {
  license: string;
  author: string;
  source: string;
}

export interface Sample {
  id: string;
  kind: SampleKind;
  /** Language label shown above code samples. */
  lang?: string;
  difficulty: Difficulty;
  /** Ground truth: did this come out of a model? */
  isAI: boolean;
  /** Prose/code body, or an image path under /public for image samples. */
  content: string;
  /** Shown after the answer — the giveaway the player should have caught. */
  tell: string;
  /** Attribution for image samples. */
  credit?: Credit;
}

/** A single artifact: is this AI or human? */
export interface SingleQuestion {
  mode: 'single';
  id: string;
  kind: SampleKind;
  difficulty: Difficulty;
  sample: Sample;
}

/** Two artifacts side by side: which one is the model's? */
export interface CompareQuestion {
  mode: 'compare';
  id: string;
  kind: SampleKind;
  difficulty: Difficulty;
  options: [Sample, Sample];
  aiIndex: 0 | 1;
}

export type Question = SingleQuestion | CompareQuestion;

/** 'ai' | 'human' for single rounds; 0 | 1 for compare rounds. */
export type AnswerValue = Choice | 0 | 1;

export interface RoundResult {
  questionId: string;
  mode: Question['mode'];
  kind: SampleKind;
  answer: AnswerValue | null;
  correct: boolean;
  basePoints: number;
  speedBonus: number;
  comboBonus: number;
  pointsEarned: number;
  msLeft: number;
  limitMs: number;
  comboAfter: number;
}

export type Phase = 'gate' | 'intro' | 'playing' | 'feedback' | 'results';

export interface Player {
  /** MongoDB ObjectId, as a 24-character hex string. */
  id: string;
  name: string;
}

export interface Standing {
  position: number;
  of: number;
  best: number;
}

export interface LeaderboardEntry {
  player_id: string;
  name: string;
  score: number;
  correct: number;
  total: number;
  max_combo: number;
  rank_title: string;
  played_at: number;
  position: number;
}

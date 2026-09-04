/**
 * Mirrors server/hackpass.mjs — the client only needs these for display (the
 * server is the actual authority, since it validates against them).
 */
export const WIN_THRESHOLDS: Record<'ai-human' | 'cipher-tunes', number> = {
  'ai-human': 7500,
  'cipher-tunes': 3800,
};

export interface GameProgress {
  best: number;
  threshold: number;
  met: boolean;
}

export type HackPassProgress = Record<'ai-human' | 'cipher-tunes', GameProgress>;

export interface HackPassStatus {
  code: string;
  issuedAt: number;
  redeemed: boolean;
}

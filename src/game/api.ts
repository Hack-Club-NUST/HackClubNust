import type { LeaderboardEntry, Player, Standing } from './types';
import type { HackPassProgress, HackPassStatus } from './hackpass';

export type GameId = 'ai-human' | 'cipher-tunes';

export interface RunSubmission {
  playerId: string;
  game: GameId;
  score: number;
  correct: number;
  total: number;
  maxCombo: number;
  rankTitle: string;
}

export interface RunResponse {
  run: { id: string; score: number };
  standing: Standing | null;
  leaderboard: LeaderboardEntry[];
  personalBest: number;
  hackpassProgress: HackPassProgress;
  hackpass: HackPassStatus | null;
  hackpassJustIssued: boolean;
}

export interface SignInResponse {
  player: Player;
  standing: Standing | null;
  hackpassProgress: HackPassProgress;
  hackpass: HackPassStatus | null;
  hackpassJustIssued: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  champion: LeaderboardEntry | null;
  players: number;
  runs: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as T;
}

export function registerPlayer(name: string, email: string, game: GameId) {
  return request<SignInResponse>('/players', {
    method: 'POST',
    body: JSON.stringify({ name, email, game }),
  });
}

export function fetchMyHackpass(playerId: string) {
  return request<{ progress: HackPassProgress; hackpass: HackPassStatus | null }>(
    `/hackpass/mine?playerId=${encodeURIComponent(playerId)}`
  );
}

export interface HackpassLookup {
  valid: boolean;
  redeemed?: boolean;
  redeemedAt?: number | null;
  issuedAt?: number;
}

export function lookupHackpass(code: string) {
  return request<HackpassLookup>(`/hackpass/lookup/${encodeURIComponent(code)}`);
}

export async function redeemHackpass(code: string, staffKey: string) {
  const res = await fetch(`/api/hackpass/lookup/${encodeURIComponent(code)}/redeem`, {
    method: 'POST',
    headers: { 'x-staff-key': staffKey },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body as { redeemed: boolean; redeemedAt: number };
}

export function submitRun(payload: RunSubmission) {
  return request<RunResponse>('/runs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchLeaderboard(game: GameId, limit = 10) {
  return request<LeaderboardResponse>(`/leaderboard?game=${game}&limit=${limit}`);
}

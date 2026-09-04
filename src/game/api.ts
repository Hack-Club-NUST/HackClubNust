import type { LeaderboardEntry, Player, Standing } from './types';

export type GameId = 'ai-human';

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
  return request<{ player: Player; standing: Standing | null }>('/players', {
    method: 'POST',
    body: JSON.stringify({ name, email, game }),
  });
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

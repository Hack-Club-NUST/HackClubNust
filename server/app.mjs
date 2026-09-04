import express from 'express';
import { GAMES } from './db.mjs';
import {
  insertRun,
  isPlayerId,
  leaderboard,
  playerBest,
  playerExists,
  playerStanding,
  totals,
  upsertPlayer,
} from './repo.mjs';

/**
 * The Express app itself, with no listener attached — server/index.mjs binds a port
 * for local dev, api/index.mjs exports it as a Vercel function. One set of routes.
 */
export function createApp() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const bad = (res, message) => res.status(400).json({ error: message });

  /** Every leaderboard is per-game; unknown ids fall back to the original game. */
  const gameOf = (value) => (GAMES.includes(String(value)) ? String(value) : GAMES[0]);

  /** A database that is down should read as 503, not as a crash. */
  const guard = (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[game-api]', err);
      if (!res.headersSent) {
        res.status(503).json({ error: 'Database unavailable. Try again in a moment.' });
      }
    }
  };

  app.get(
    '/api/health',
    guard(async (_req, res) => {
      const games = {};
      for (const game of GAMES) games[game] = await totals(game);
      res.json({ ok: true, games });
    })
  );

  app.post(
    '/api/players',
    guard(async (req, res) => {
      const name = String(req.body?.name ?? '').trim();
      const email = String(req.body?.email ?? '').trim().toLowerCase();

      if (name.length < 2 || name.length > 40) return bad(res, 'Name must be 2–40 characters.');
      if (!EMAIL_RE.test(email) || email.length > 120)
        return bad(res, 'That email does not look right.');

      const game = gameOf(req.body?.game);
      const player = await upsertPlayer({ name, email });
      res.json({
        player: { id: player.id, name: player.name },
        standing: await playerStanding(player.id, game),
      });
    })
  );

  app.post(
    '/api/runs',
    guard(async (req, res) => {
      const b = req.body ?? {};
      const playerId = String(b.playerId ?? '');
      const score = Number(b.score);
      const correct = Number(b.correct);
      const total = Number(b.total);
      const maxCombo = Number(b.maxCombo);
      const rankTitle = String(b.rankTitle ?? '').slice(0, 40);
      const game = gameOf(b.game);

      if (!isPlayerId(playerId)) return bad(res, 'Malformed player id.');
      if ([score, correct, total, maxCombo].some((n) => !Number.isInteger(n) || n < 0))
        return bad(res, 'Malformed run payload.');
      if (total === 0 || total > 50 || correct > total)
        return bad(res, 'Run totals out of range.');
      if (!(await playerExists(playerId))) return bad(res, 'Unknown player.');

      const run = await insertRun({ playerId, game, score, correct, total, maxCombo, rankTitle });
      res.json({
        run: { id: run.id, score: run.score },
        standing: await playerStanding(playerId, game),
        leaderboard: await leaderboard(game, 10),
        personalBest: (await playerBest(playerId, game)) ?? run.score,
      });
    })
  );

  app.get(
    '/api/leaderboard',
    guard(async (req, res) => {
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
      const game = gameOf(req.query.game);
      const entries = await leaderboard(game, limit);
      res.json({ game, entries, champion: entries[0] ?? null, ...(await totals(game)) });
    })
  );

  return app;
}

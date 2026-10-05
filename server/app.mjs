import express from 'express';
import { GAMES } from './db.mjs';
import { WIN_THRESHOLDS, meetsThreshold, scoreExceedsCeiling } from './hackpass.mjs';
import { APPLICATION_STATUSES, PORTFOLIO_IDS } from './recruitment.mjs';
import {
  applicationCounts,
  listApplications,
  setApplicationStatus,
  getHackpassByCode,
  getHackpassForPlayer,
  insertRun,
  isPlayerId,
  issueHackpassIfNew,
  leaderboard,
  playerBest,
  playerExists,
  playerStanding,
  redeemHackpass,
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

  /**
   * Checks a player's best score in each game against WIN_THRESHOLDS and issues a
   * HackPass the moment both are cleared. Called after every run submission (in
   * either game) and on sign-in, so a returning player whose bests already
   * qualify — reached across separate sessions — gets caught up rather than
   * needing one more run to trigger it.
   */
  async function evaluateHackpass(playerId) {
    const [aiHumanScore, cipherTunesScore] = await Promise.all([
      playerBest(playerId, 'ai-human'),
      playerBest(playerId, 'cipher-tunes'),
    ]);
    const bests = { 'ai-human': aiHumanScore ?? 0, 'cipher-tunes': cipherTunesScore ?? 0 };

    const progress = {};
    for (const game of GAMES) {
      const best = bests[game] ?? 0;
      progress[game] = { best, threshold: WIN_THRESHOLDS[game], met: meetsThreshold(game, best) };
    }
    const qualifies = GAMES.every((g) => progress[g].met);

    let hackpass = await getHackpassForPlayer(playerId);
    let justIssued = false;
    if (qualifies && !hackpass) {
      const result = await issueHackpassIfNew(playerId, {
        aiHumanScore: bests['ai-human'],
        cipherTunesScore: bests['cipher-tunes'],
      });
      hackpass = result.hackpass;
      justIssued = result.justIssued;
    }

    return {
      progress,
      hackpass: hackpass
        ? { code: hackpass.code, issuedAt: hackpass.issuedAt, redeemed: hackpass.redeemed }
        : null,
      hackpassJustIssued: justIssued,
    };
  }

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
      const { progress, hackpass, hackpassJustIssued } = await evaluateHackpass(player.id);
      res.json({
        player: { id: player.id, name: player.name },
        standing: await playerStanding(player.id, game),
        hackpassProgress: progress,
        hackpass,
        hackpassJustIssued,
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
      if (scoreExceedsCeiling(game, score))
        return bad(res, 'That score is not reachable in this game.');
      if (!(await playerExists(playerId))) return bad(res, 'Unknown player.');

      const run = await insertRun({ playerId, game, score, correct, total, maxCombo, rankTitle });
      const { progress, hackpass, hackpassJustIssued } = await evaluateHackpass(playerId);

      res.json({
        run: { id: run.id, score: run.score },
        standing: await playerStanding(playerId, game),
        leaderboard: await leaderboard(game, 10),
        personalBest: (await playerBest(playerId, game)) ?? run.score,
        hackpassProgress: progress,
        hackpass,
        hackpassJustIssued,
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

  /** A player checking their own status — used on sign-in and on return visits. */
  app.get(
    '/api/hackpass/mine',
    guard(async (req, res) => {
      const playerId = String(req.query.playerId ?? '');
      if (!isPlayerId(playerId)) return bad(res, 'Malformed player id.');
      const { progress, hackpass } = await evaluateHackpass(playerId);
      res.json({ progress, hackpass });
    })
  );

  /**
   * Public lookup by code — no auth, because holding the code is itself the
   * proof (same trust model as a paper coupon). Never exposes the player's
   * email; the name is shown so staff can confirm identity at the counter.
   */
  app.get(
    '/api/hackpass/lookup/:code',
    guard(async (req, res) => {
      const pass = await getHackpassByCode(req.params.code);
      if (!pass) return res.status(404).json({ valid: false });
      res.json({
        valid: true,
        redeemed: pass.redeemed,
        redeemedAt: pass.redeemedAt,
        issuedAt: pass.issuedAt,
      });
    })
  );

  /**
   * Marking a pass redeemed spends real value, so it is gated behind a shared
   * staff key (HACKPASS_STAFF_KEY) rather than left open next to a public
   * lookup endpoint.
   */
  app.post(
    '/api/hackpass/lookup/:code/redeem',
    guard(async (req, res) => {
      if (!requireStaff(req, res)) return;

      const pass = await redeemHackpass(req.params.code);
      if (!pass) return res.status(409).json({ error: 'Unknown code, or already redeemed.' });
      res.json({ redeemed: true, redeemedAt: pass.redeemedAt });
    })
  );

  /* ------------------------- applications inbox ------------------------- */

  /**
   * The same shared key that gates HackPass redemption also gates the
   * applications inbox — one key for one team of exec staff. STAFF_KEY is the
   * name going forward; HACKPASS_STAFF_KEY still works so the deployed
   * environment keeps running unchanged.
   */
  const staffKey = () => process.env.STAFF_KEY ?? process.env.HACKPASS_STAFF_KEY ?? '';

  const requireStaff = (req, res) => {
    const key = staffKey();
    if (!key) {
      res.status(503).json({ error: 'Staff access is not configured yet.' });
      return false;
    }
    if (req.get('x-staff-key') !== key) {
      res.status(401).json({ error: 'Wrong staff key.' });
      return false;
    }
    return true;
  };

  /**
   * Recruitment is closed for this tenure: there is no route that accepts an
   * application any more, only these two for staff to work through the ones
   * already received. The inbox carries applicant contact details, so it is
   * staff-key gated.
   */
  app.get(
    '/api/applications',
    guard(async (req, res) => {
      if (!requireStaff(req, res)) return;

      const portfolio = PORTFOLIO_IDS.includes(String(req.query.portfolio))
        ? String(req.query.portfolio)
        : null;
      const status = APPLICATION_STATUSES.includes(String(req.query.status))
        ? String(req.query.status)
        : null;

      const entries = await listApplications({ portfolio, status, limit: 300 });
      res.json({ entries, counts: await applicationCounts() });
    })
  );

  app.post(
    '/api/applications/:id/status',
    guard(async (req, res) => {
      if (!requireStaff(req, res)) return;

      const status = String(req.body?.status ?? '');
      if (!APPLICATION_STATUSES.includes(status)) return bad(res, 'Unknown status.');

      const updated = await setApplicationStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: 'No such application.' });
      res.json(updated);
    })
  );

  return app;
}

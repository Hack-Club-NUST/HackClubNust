import { ObjectId } from 'mongodb';
import { collections } from './db.mjs';
import { generateHackpassCode } from './hackpass.mjs';

/**
 * The only module that talks to the database. Everything above it — the API, the
 * client, both games — sees plain objects and never learns which store is behind.
 */

const isId = (value) => typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
export const isPlayerId = isId;

export async function upsertPlayer({ name, email }) {
  const players = await collections.players();
  const lower = email.toLowerCase();

  await players.updateOne(
    { email: lower },
    { $set: { name }, $setOnInsert: { email: lower, createdAt: Date.now() } },
    { upsert: true }
  );

  const doc = await players.findOne({ email: lower });
  return { id: doc._id.toString(), name: doc.name, email: doc.email };
}

export async function insertRun(run) {
  const runs = await collections.runs();
  const doc = {
    playerId: new ObjectId(run.playerId),
    game: run.game,
    score: run.score,
    correct: run.correct,
    total: run.total,
    maxCombo: run.maxCombo,
    accuracy: run.total === 0 ? 0 : run.correct / run.total,
    rankTitle: run.rankTitle,
    playedAt: Date.now(),
  };
  const { insertedId } = await runs.insertOne(doc);
  return { id: insertedId.toString(), ...doc, playerId: run.playerId };
}

export async function playerExists(playerId) {
  if (!isId(playerId)) return false;
  const players = await collections.players();
  return (await players.countDocuments({ _id: new ObjectId(playerId) }, { limit: 1 })) > 0;
}

/**
 * One row per player — their single best run in one game — ranked.
 * Emails are never projected, so they cannot leak to the client.
 */
export async function leaderboard(game, limit = 10) {
  const runs = await collections.runs();
  const rows = await runs
    .aggregate([
      { $match: { game } },
      { $sort: { score: -1, playedAt: 1 } },
      { $group: { _id: '$playerId', best: { $first: '$$ROOT' } } },
      { $sort: { 'best.score': -1, 'best.playedAt': 1 } },
      { $limit: limit },
      { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
      { $unwind: '$player' },
      {
        $project: {
          _id: 0,
          player_id: { $toString: '$_id' },
          name: '$player.name',
          score: '$best.score',
          correct: '$best.correct',
          total: '$best.total',
          max_combo: '$best.maxCombo',
          rank_title: '$best.rankTitle',
          played_at: '$best.playedAt',
        },
      },
    ])
    .toArray();

  return rows.map((row, i) => ({ ...row, position: i + 1 }));
}

export async function playerStanding(playerId, game) {
  if (!isId(playerId)) return null;
  const rows = await leaderboard(game, 1000);
  const entry = rows.find((r) => r.player_id === playerId);
  return entry ? { position: entry.position, of: rows.length, best: entry.score } : null;
}

export async function playerBest(playerId, game) {
  if (!isId(playerId)) return null;
  const runs = await collections.runs();
  const best = await runs
    .find({ playerId: new ObjectId(playerId), game })
    .sort({ score: -1, playedAt: 1 })
    .limit(1)
    .toArray();
  return best[0]?.score ?? null;
}

export async function totals(game) {
  const runs = await collections.runs();
  const [count, distinct] = await Promise.all([
    runs.countDocuments({ game }),
    runs.distinct('playerId', { game }),
  ]);
  return { players: distinct.length, runs: count };
}


/* ------------------------------- hackpasses ------------------------------ */

export async function getHackpassForPlayer(playerId) {
  if (!isId(playerId)) return null;
  const col = await collections.hackpasses();
  return col.findOne({ playerId: new ObjectId(playerId) });
}

export async function getHackpassByCode(code) {
  const col = await collections.hackpasses();
  return col.findOne({ code: String(code).toUpperCase() });
}

/**
 * Issues a hackpass for a qualifying player, or returns their existing one.
 * Races (two run submissions clearing the bar at the same instant, or a
 * generated code colliding with an existing one) are resolved by the two
 * unique indexes rather than by locking: a duplicate-key error on `playerId`
 * means someone already has a pass, so we just fetch and return it; a
 * duplicate on `code` means bad luck on the random draw, so we retry with a
 * fresh one.
 */
export async function issueHackpassIfNew(playerId, snapshot) {
  const existing = await getHackpassForPlayer(playerId);
  if (existing) return { hackpass: existing, justIssued: false };

  const col = await collections.hackpasses();
  for (let attempt = 0; attempt < 6; attempt++) {
    const doc = {
      playerId: new ObjectId(playerId),
      code: generateHackpassCode(),
      issuedAt: Date.now(),
      aiHumanScore: snapshot.aiHumanScore,
      cipherTunesScore: snapshot.cipherTunesScore,
      redeemed: false,
      redeemedAt: null,
    };
    try {
      await col.insertOne(doc);
      return { hackpass: doc, justIssued: true };
    } catch (err) {
      if (err?.code !== 11000) throw err;
      const onPlayerId = JSON.stringify(err?.keyPattern ?? {}).includes('playerId');
      if (onPlayerId) {
        const raced = await getHackpassForPlayer(playerId);
        if (raced) return { hackpass: raced, justIssued: false };
      }
      // otherwise a code collision — loop and try a new random code
    }
  }
  throw new Error('Could not allocate a unique hackpass code.');
}

/** Atomic: fails silently (returns null) if the code is unknown or already used. */
export async function redeemHackpass(code) {
  const col = await collections.hackpasses();
  const result = await col.findOneAndUpdate(
    { code: String(code).toUpperCase(), redeemed: false },
    { $set: { redeemed: true, redeemedAt: Date.now() } },
    { returnDocument: 'after' }
  );
  return result?.value ?? result ?? null;
}

export async function hackpassStats() {
  const col = await collections.hackpasses();
  const [issued, redeemed] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ redeemed: true }),
  ]);
  return { issued, redeemed };
}


/* ------------------------------ applications ----------------------------- */

/* Recruitment is closed, so nothing writes a new application any more — these
   read and annotate the ones received while it was open. */

/** Staff-side listing. Newest first, optionally narrowed to one portfolio. */
export async function listApplications({ portfolio, status, limit = 200 } = {}) {
  const col = await collections.applications();
  const query = {};
  if (portfolio) query.portfolio = portfolio;
  if (status) query.status = status;

  const rows = await col.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
  return rows.map((row) => ({
    id: row._id.toString(),
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    school: row.school,
    year: row.year,
    portfolio: row.portfolio,
    link: row.link ?? '',
    why: row.why,
    experience: row.experience ?? '',
    status: row.status ?? 'new',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt,
  }));
}

export async function setApplicationStatus(id, status) {
  if (!isId(id)) return null;
  const col = await collections.applications();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, decidedAt: Date.now() } },
    { returnDocument: 'after' }
  );
  const doc = result?.value ?? result ?? null;
  return doc ? { id: doc._id.toString(), status: doc.status } : null;
}

/** Per-portfolio counts, for the inbox's filter chips. */
export async function applicationCounts() {
  const col = await collections.applications();
  const rows = await col.aggregate([{ $group: { _id: '$portfolio', n: { $sum: 1 } } }]).toArray();
  const byPortfolio = {};
  let total = 0;
  for (const row of rows) {
    byPortfolio[row._id] = row.n;
    total += row.n;
  }
  return { total, byPortfolio };
}

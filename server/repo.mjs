import { ObjectId } from 'mongodb';
import { collections } from './db.mjs';

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

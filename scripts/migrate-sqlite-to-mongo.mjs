/**
 * One-shot migration of the local SQLite leaderboard into MongoDB.
 *
 *   node scripts/migrate-sqlite-to-mongo.mjs [path/to/hackclub-game.db]
 *
 * Idempotent: players are matched on email, and a run is skipped if one already
 * exists for the same player, game, score and timestamp.
 */
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { ObjectId } from 'mongodb';
import { collections } from '../server/db.mjs';

const path = process.argv[2] ?? 'server/data/hackclub-game.db';
if (!existsSync(path)) {
  console.error(`No SQLite database at ${path} — nothing to migrate.`);
  process.exit(0);
}

const sqlite = new DatabaseSync(path, { readOnly: true });
const players = sqlite.prepare('SELECT * FROM players').all();
const runs = sqlite.prepare('SELECT * FROM runs').all();
console.log(`Found ${players.length} players and ${runs.length} runs in ${path}`);

const playersCol = await collections.players();
const runsCol = await collections.runs();
const idMap = new Map();

for (const p of players) {
  const email = String(p.email).toLowerCase();
  await playersCol.updateOne(
    { email },
    { $set: { name: p.name }, $setOnInsert: { email, createdAt: p.created_at ?? Date.now() } },
    { upsert: true }
  );
  const doc = await playersCol.findOne({ email });
  idMap.set(p.id, doc._id);
  console.log(`  player ${p.name} -> ${doc._id}`);
}

let inserted = 0;
for (const r of runs) {
  const playerId = idMap.get(r.player_id);
  if (!playerId) continue;
  const game = r.game ?? 'ai-human';
  const exists = await runsCol.countDocuments(
    { playerId, game, score: r.score, playedAt: r.played_at },
    { limit: 1 }
  );
  if (exists) continue;
  await runsCol.insertOne({
    playerId: new ObjectId(playerId),
    game,
    score: r.score,
    correct: r.correct,
    total: r.total,
    maxCombo: r.max_combo,
    accuracy: r.accuracy,
    rankTitle: r.rank_title,
    playedAt: r.played_at,
  });
  inserted += 1;
}

console.log(`Migrated ${inserted} run(s). Skipped ${runs.length - inserted} already present.`);
process.exit(0);

import { MongoClient } from 'mongodb';

/**
 * MongoDB connection, shared by the local Express server and the Vercel function.
 *
 * Serverless invocations reuse a warm container, so the client is cached on the
 * module scope and on globalThis — reconnecting per request would exhaust the
 * connection pool under any real traffic.
 */
export const GAMES = ['ai-human'];

const URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB ?? 'hackclub_nust';

const cache = globalThis.__hcnustMongo ?? { client: null, promise: null };
globalThis.__hcnustMongo = cache;

async function connect() {
  if (cache.client) return cache.client;
  if (!cache.promise) {
    cache.promise = new MongoClient(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
      .connect()
      .then(async (client) => {
        cache.client = client;
        await ensureIndexes(client.db(DB_NAME));
        return client;
      })
      .catch((err) => {
        cache.promise = null; // let the next request retry instead of caching a failure
        throw err;
      });
  }
  return cache.promise;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('players').createIndex({ email: 1 }, { unique: true }),
    db.collection('runs').createIndex({ game: 1, score: -1 }),
    db.collection('runs').createIndex({ playerId: 1 }),
  ]);
}

export async function getDb() {
  const client = await connect();
  return client.db(DB_NAME);
}

export const collections = {
  players: async () => (await getDb()).collection('players'),
  runs: async () => (await getDb()).collection('runs'),
};

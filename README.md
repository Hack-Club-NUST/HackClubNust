# Hack Club NUST

Single-page site for the Hack Club NUST games. Two of them, both playable:

- **AI vs Human** — 15 rounds of prose, code and images. Some rounds hand you one
  artifact and ask who made it; some put two side by side and ask which is the
  model's. Every call is answered with the tell you missed.
- **Cipher Tunes** — a Polybius square rendered as music. Every letter is two notes,
  and a word is a melody you decode by ear.

Both share one sign-in and write to per-game leaderboards in MongoDB.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS 3 · Framer Motion 12 · Express · MongoDB

## Run

```bash
npm install
docker run -d -p 27017:27017 --name mongo mongo:7   # MongoDB, or set MONGODB_URI
npm run dev      # API on :8787 + Vite on :5173 (both, via concurrently)
npm run build    # typecheck + production bundle
```

`npm run dev:api` and `npm run dev:web` run the halves separately.

## Design

- **Type:** Space Mono everywhere (Tailwind's `sans`, `serif` and `mono` keys are all
  overridden to it). Anton SC is used only for the hero watermark.
- **Palette:** sampled from the club banner — coral `#F26251` → crimson `#EB4554`,
  white text, on an `#0B0507` near-black base. The gradient is available as
  `bg-brand-grad` and the `brand.*` / `ink` Tailwind colors.
- **Icons:** Bootstrap Icons via CDN (Slack, socials, hourglass), plus lucide-react
  for the two game card glyphs.

## Structure

```
src/
  components/
    HackClubLogo.tsx    the club "</>" mark, stroked so it inherits currentColor
    Navbar.tsx          expanding glass pill menu + Join Slack CTA
    ScrambleIn.tsx      entrance reveal (0.5 chars/frame, 25ms)
    ScrambleText.tsx    hover scramble (4 frames/char, 25ms)
    SquashHamburger.tsx spring-animated 3-bar hamburger
  sections/
    Hero.tsx        mouse-scrubbed video, watermark, scramble headings
    Cinematic.tsx   scroll-driven 3D rotated paragraph
    Metrics.tsx     club numbers
    Features.tsx    "Two Games. One Arena." + feature grid
    Games.tsx       the two game cards  <-- game entry points live here
    Rounds.tsx      brand-gradient "how a run works"
    Footer.tsx      video panel + socials
  videos.ts         the five CloudFront background clips
```

## The AI vs Human game

Playable end to end. Click **Play Now** on the AI vs Human card.

### Sign-in

Players give a name and email before the first run. The email is the identity key
(case-insensitive upsert, so `BILAL@` and `bilal@` are one player) and is **never
returned to the browser** — the leaderboard carries names only. The identity is
remembered in `localStorage` so returning players see their details prefilled.

The gate talks to the API, so the game needs the API running. No API, no run.

### A run

**15 rounds**, mixed across three media and two modes:

| | |
|---|---|
| Media | prose · code · image |
| Single rounds | one artifact — person or model? (10 per run) |
| Compare rounds | two side by side — which one is the model's? (5 per run) |
| Composition | 4 text + 4 code + 2 image singles, 2 image + 2 text + 1 code compares |

Singles are drawn 50/50 model vs person so the split is never itself a tell, and no
sample repeats inside a run.

**The clock is per round**, not flat — `limitFor()` in `scoring.ts`:

```
limit = BASE[difficulty] × KIND_FACTOR[kind] × (compare ? 1.5 : 1)
BASE: easy 20s · medium 16s · hard 13s
KIND_FACTOR: text 1.0 · code 1.15 · image 0.6
```

So a hard image single gives ~8s and an easy code compare ~35s. Running out is a
miss and breaks the streak.

**Keys:** `A`/`H` on single rounds, `1`/`2` on compare rounds (arrows work for both),
`Enter` to advance, `Esc` to quit.

**Scoring:** base 100/200/300 by difficulty, ×1.4 on compare rounds; up to +50% of
base as a speed bonus scaled by the clock left; streak bonuses of +100/+250/+500/
+1000/+2000 at 3/5/7/10/15. Ranks run Signal Reader → Sharp Eye → Calibrated →
Suspicious → Coin Flip → Model Food.

After every call the game reveals the answer **and the tell** — the specific
giveaway in that sample. Image credits are deliberately hidden until after the
answer, since a "Public domain / DALL-E 2" byline would give the round away.

### The database

MongoDB, reached through a small Express API that runs beside Vite in dev and as a
single Vercel function in production.

```
server/
  db.mjs     connection + indexes (client cached for serverless reuse)
  repo.mjs   every database query in the project lives here
  app.mjs    routes + validation, with no listener attached
  index.mjs  binds a port for local dev
api/
  index.mjs  the same app, exported as a Vercel function
```

| Route | Does |
|---|---|
| `POST /api/players` | upsert by email, returns player + standing |
| `POST /api/runs` | records a run, returns standing + fresh leaderboard |
| `GET /api/leaderboard?game=&limit=` | best run per player, ranked, plus the champion |
| `GET /api/health` | liveness + per-game row counts |

Two collections. `players` is `{ name, email, createdAt }` with a unique index on a
lowercased email, so `BILAL@` and `bilal@` are one person. `runs` is
`{ playerId, game, score, correct, total, maxCombo, accuracy, rankTitle, playedAt }`
indexed on `{ game, score }`.

The leaderboard is one aggregation: match the game, sort by score, `$group` on
player taking `$first` as their best run, sort again, `$lookup` the name. **Emails
are never projected**, so they cannot reach the browser.

`repo.mjs` is the only module that touches the database — nothing above it knows
which store is behind. That is what made the SQLite-to-Mongo move a single-file job.

#### Connections and serverless

A serverless invocation reuses a warm container, so the Mongo client is cached on
`globalThis`. Reconnecting per request would exhaust the connection pool under any
real traffic. A failed connection clears the cache so the next request retries
rather than inheriting a poisoned promise, and every route is wrapped so a database
outage answers 503 instead of crashing the function.

#### Local setup

```bash
docker run -d -p 27017:27017 --name mongo mongo:7   # or use an Atlas URI
cp .env.example .env.local                           # then edit if needed
npm run dev
```

`.env.local` is gitignored and loaded by `--env-file-if-exists`, so the app still
starts without it (falling back to `mongodb://127.0.0.1:27017`).

#### Migrating the old SQLite data

The leaderboard used to be SQLite. `npm run migrate:mongo` copies
`server/data/hackclub-game.db` into MongoDB — idempotent, matching players on email
and skipping runs that are already there.

### Adding samples

`src/game/data/samples.ts` is a flat array of 48. Append and `buildRun()` picks it
up. Compare rounds are assembled at runtime by pairing one AI and one human sample
of the same kind, so adding a sample grows both modes at once.

```ts
{
  id: 'i-ai-6',
  kind: 'image',          // 'text' | 'code' | 'image'
  difficulty: 'hard',     // sets base points and the clock
  isAI: true,
  content: '/game/images/whatever.jpg',   // body, or a path under public/
  tell: '...',            // the giveaway, shown after the answer
  credit: { license, author, source },    // images only
}
```

**On provenance.** The prose and code samples are curated exemplars written to
demonstrate stylistic tells — including four deliberate traps that invert the
obvious heuristic (an AI sample that fakes a scrappy comment, a human one that
reads like model prose). They teach register, not forensics.

The **20 images are genuinely sourced**, all from Wikimedia with license and author
recorded in `public/game/images/CREDITS.json` and shown in-game after each answer:

| | |
|---|---|
| 10 AI | 5 photorealistic (StyleGAN portraits, a face swap, the Midjourney puffer-jacket Pope) + 5 stylized (Stable Diffusion landscapes, DALL-E, the Midjourney art-prize piece) |
| 10 human | photographs of Islamabad and Rawalpindi — streets, interchanges, parks, campus buildings |

The photorealistic tier is what makes image rounds hard: on a GAN portrait the face
is flawless, so the tell is always at the edges — smeared backgrounds, hair fusing
into shoulders, a crucifix chain that passes over then under then stops existing.

Sourcing note: `commons.wikimedia.org` is unreachable from this machine, and pulling
full-size originals gets you rate-limited fast. The route that works is the
`en.wikipedia.org` API with `iiurlwidth=900`, which returns server-side **thumbnail**
URLs — smaller, faster, and the access pattern Wikimedia actually asks for.

## Cipher Tunes

The second game. Click **Play Now** on the Cipher Tunes card.

### The cipher

A **Polybius square rendered as music**. Five pitches of a C major pentatonic scale
index a 5x5 grid; every letter is a two-note motif — first note names the row,
second names the column, and where they cross is the letter. I and J share a cell,
as in the paper cipher.

```
       C   D   E   G   A        row note plays LOW  (C3-A3)
   C   A   B   C   D   E        col note plays HIGH (C5-A5)
   D   F   G   H  I/J  K
   E   L   M   N   O   P        H = D then E
   G   Q   R   S   T   U        A = C then C
   A   V   W   X   Y   Z
```

Three properties make it playable rather than a hearing test:

- **Pentatonic** — no two notes in the set can clash, so any word comes out as music.
- **Split registers** — row notes are over an octave below column notes, so you can
  never lose track of which half of a motif you are hearing.
- **Whole-tone spacing** — the closest two pitches differ by 12.2%, roughly double
  the threshold where a listener can tell two notes apart.

### Why the audio is synthesised

There are no audio files. 25 letters would mean 25 pitch-accurate samples plus
licensing, megabytes of loading, and tuning that drifts between recordings. Two
oscillators and an envelope in `audio.ts` give an exact frequency, instant playback,
nothing to ship, and nothing to license. A soft C2 drone sits under word playback so
a tune reads as music instead of test tones.

Browsers block audio until a user gesture, so `unlock()` runs from the first click.

### A run

**12 rounds**: 5 single letters to build the mapping, then 7 words of increasing
length (3,3,4,4,5,5,6). Letter rounds are answered by clicking the grid — the key is
also the input. Word rounds are typed.

| | |
|---|---|
| Letter round | 150 base, 20s |
| Word round | 100 x length, 12s + 6s per letter |
| Speed | up to +40% of base, scaled by clock left |
| Ear mode | **x1.5 on everything** |
| Replays | 2 free, then −15% each (capped at −60%) |
| Reveal a letter | −25% each, 2 maximum |
| Streaks | +100/+250/+500/+1000 at 3/5/7/10 |

**The clock only starts when the tune finishes playing** — you are never punished for
the length of the audio, only for how long you take to think.

Ranks run Perfect Pitch → Golden Ear → Tuned In → Half a Melody → Humming Along →
Tone Deaf.

### Ear mode, and accessibility

By default a visual guide lights up **which of the five pitches is currently
sounding** — deliberately not which letter it resolves to, so guided play still
makes you do the decoding. Ear mode turns the lights off entirely and pays 1.5x.

The guide doubles as the accessibility path: a player who cannot use the audio can
still follow the pitch ladder visually and decode from it. The grid, the ladder and
the demo tune are all on screen before a run starts.

### Files

```
src/game/cipher/
  cipher.ts            grid, motifs, and the pure tune builder
  audio.ts             the synth — no assets
  words.ts             word bank (no J)
  scoring.ts           clocks, points, penalties, ranks, run building
  useCipherTunes.ts    phase machine, timer, replays, hints
  components/          intro, round view, results, grid, note ladder
```

`buildTune()` is pure and deterministic, so the music is unit-testable: the same
word always yields the same note events, and the test decodes them back to letters.

## Two games, one collection

Every run carries a `game` field (`ai-human` | `cipher-tunes`) and every query is
scoped to it, so the two boards are independent while players are shared — one
sign-in covers both games. An unrecognised game id falls back to `ai-human` rather
than erroring.

## Deploying to Vercel

`vercel.json` builds the Vite app to `dist` and rewrites `/api/*` to the single
function in `api/index.mjs`.

1. Create a MongoDB Atlas cluster (the free tier is plenty for a club).
2. In the Vercel project, set `MONGODB_URI` and `MONGODB_DB`. Never commit these —
   `.env*` is gitignored and `.env.example` holds only localhost defaults.
3. Allow Vercel's egress in Atlas. Serverless functions do not have fixed IPs, so
   either allow `0.0.0.0/0` with a strong password or put the cluster behind a
   Vercel integration.
4. `vercel --prod`, or connect the GitHub repo for automatic deploys.

The browser is same-origin with the API in both dev (Vite proxy) and production
(the rewrite), so there is no CORS layer anywhere.

## Notes

- The hero video never plays — it is **scrubbed** by horizontal pointer movement
  (sensitivity `0.8`, so a full-width sweep covers 80% of the clip). Seeks chain
  through the `seeked` event so fast movement queues one pending target instead of
  dropping frames. Touch-drag works the same way.
- Full-viewport sections use `.h-screen-dvh`, which declares `100vh` then `100dvh`
  so mobile browser chrome is handled with a real CSS fallback.

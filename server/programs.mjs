/**
 * Hack Club's global programs, read live from HQ's own events API.
 *
 * These are short, themed "You Ship, We Ship" campaigns that rotate constantly —
 * a hardcoded list on the club's front page would be wrong within a fortnight.
 * So the list is fetched rather than written down, and the club only maintains
 * the framing around it.
 *
 * The fetch happens on the server, not in the browser: hackclub.com sets no CORS
 * header we can rely on, and a warm serverless container can share one cached
 * response across every visitor instead of each of them hitting HQ directly.
 */

const SOURCE = 'https://hackclub.com/api/v1/events?per_page=100';
const TTL_MS = 60 * 60 * 1000; // an hour — these change on the order of days
const TIMEOUT_MS = 6000;

const cache = globalThis.__hcnustPrograms ?? { at: 0, programs: null, inflight: null };
globalThis.__hcnustPrograms = cache;

/**
 * Entries with no description are internal placeholders HQ has not written copy
 * for yet — rendering a card with a bare name and nothing else looks broken, so
 * they are dropped. Soonest deadline first, because that is the one worth
 * clicking; the open-ended ones sort to the end.
 */
function shape(raw) {
  const events = Array.isArray(raw) ? raw : (raw?.events ?? raw?.data ?? []);

  return events
    .filter((e) => e?.status === 'ongoing' && e?.url && e?.name && e?.description)
    .map((e) => ({
      name: e.name,
      blurb: String(e.description).trim(),
      href: e.url,
      endDate: e.endDate ?? null,
      projectTypes: Array.isArray(e.projectTypes) ? e.projectTypes.slice(0, 2) : [],
    }))
    .sort((a, b) => {
      if (!a.endDate && !b.endDate) return a.name.localeCompare(b.name);
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return a.endDate.localeCompare(b.endDate);
    });
}

/**
 * Never throws and never blocks a page render for long: on a timeout or an HQ
 * outage it serves the last good list however old, and only returns null when
 * there has never been one. The client has its own permanent fallback for that.
 */
export async function getPrograms() {
  const fresh = Date.now() - cache.at < TTL_MS;
  if (fresh && cache.programs) return { programs: cache.programs, fetchedAt: cache.at };

  if (!cache.inflight) {
    cache.inflight = (async () => {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(SOURCE, {
          headers: { accept: 'application/json' },
          signal: abort.signal,
        });
        if (!res.ok) throw new Error(`HQ responded ${res.status}`);
        const programs = shape(await res.json());
        if (programs.length === 0) throw new Error('HQ returned no usable programs');
        cache.programs = programs;
        cache.at = Date.now();
        return programs;
      } finally {
        clearTimeout(timer);
        cache.inflight = null;
      }
    })().catch((err) => {
      console.warn('[programs] falling back to cache:', err.message);
      return cache.programs; // may itself be null on a cold start
    });
  }

  const programs = await cache.inflight;
  return { programs, fetchedAt: cache.at };
}

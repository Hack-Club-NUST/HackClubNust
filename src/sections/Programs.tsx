import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VIDEOS } from '../videos';

/**
 * Hack Club's global side: the permanent infrastructure, then whatever HQ is
 * running this week.
 *
 * The rotating half is fetched from `/api/programs`, which proxies Hack Club's
 * own events API. Those campaigns start and end constantly — a list typed in
 * here would be wrong within a fortnight, and a club's front page carrying dead
 * links to HQ is worse than carrying none. The permanent half below is typed in
 * precisely because it does not move.
 */

interface LiveProgram {
  name: string;
  blurb: string;
  href: string;
  endDate: string | null;
  projectTypes: string[];
}

/** Standing infrastructure. Verified against hackclub.com; safe to hardcode. */
const ALWAYS = [
  {
    name: 'Hack Club Slack',
    blurb: 'Hang out, make friends, build projects. Tens of thousands of makers, awake at every hour.',
    href: 'https://slack.hackclub.com',
    icon: 'bi-slack',
  },
  {
    name: 'Jams',
    blurb: 'Ready-to-run workshops that take a beginner from nothing to a finished project in one sitting. We run these at meetings.',
    href: 'https://jams.hackclub.com',
    icon: 'bi-lightning-charge',
  },
  {
    name: 'Hackatime',
    blurb: 'The open-source coding time tracker. Open to all ages, and the thing that proves your hours.',
    href: 'https://hackatime.hackclub.com',
    icon: 'bi-stopwatch',
  },
  {
    name: 'HCB',
    blurb: 'Nonprofit fiscal sponsorship and banking for student-led teams. Open to all ages. Over 700 teams run on it.',
    href: 'https://hcb.hackclub.com',
    icon: 'bi-bank',
  },
  {
    name: 'Scrapbook',
    blurb: 'A daily diary of what people across Hack Club are learning and making. Post the ugly work-in-progress.',
    href: 'https://scrapbook.hackclub.com',
    icon: 'bi-journal-code',
  },
  {
    name: 'Hackathons',
    blurb: 'HQ keeps a directory of every high-school hackathon worldwide — 900-odd of them, across 26 countries.',
    href: 'https://hackathons.hackclub.com',
    icon: 'bi-flag',
  },
];

const deadline = (iso: string | null) => {
  if (!iso) return 'Always open';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Open now';
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return 'Closing today';
  if (days === 1) return '1 day left';
  if (days <= 45) return `${days} days left`;
  return `Until ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

export default function Programs() {
  const [live, setLive] = useState<LiveProgram[] | null>(null);

  useEffect(() => {
    fetch('/api/programs')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((body) => setLive(body.programs ?? []))
      .catch(() => setLive([])); // the permanent half above still carries the section
  }, []);

  return (
    <section id="programs" className="relative w-full overflow-hidden bg-ink">
      <video
        src={VIDEOS.games}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 bg-brand-grad opacity-20 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-ink/80" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/40">Beyond The Campus</p>
            <h2 className="mt-6 text-[clamp(28px,6vw,56px)] font-light leading-[1.05] tracking-[-0.02em] text-white">
              You ship,
              <br />
              they ship.
            </h2>
          </motion.div>

          <motion.p
            className="max-w-sm text-[14px] leading-relaxed text-white/45 sm:text-[15px] md:pb-2 md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            Hack Club runs on one mechanic: finish something, show it, get something back. Not a
            grade — a circuit board, a console, a plane ticket, ice cream. Here is the machinery
            behind that, and what it is handing out this week.
          </motion.p>
        </div>

        {/* ----------------------------- permanent ----------------------------- */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALWAYS.map((program, i) => (
            <motion.a
              key={program.name}
              href={program.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-sm transition-colors hover:border-brand/50 hover:bg-white/[0.05]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-brand-grad">
                  <i className={`bi ${program.icon} text-[16px] text-white`} aria-hidden="true" />
                </div>
                <i
                  className="bi bi-arrow-up-right text-[13px] text-white/20 transition-colors group-hover:text-brand"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 text-[19px] font-light leading-none tracking-[-0.01em] text-white">
                {program.name}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">{program.blurb}</p>
            </motion.a>
          ))}
        </div>

        {/* -------------------------- live from HQ's API ------------------------ */}
        {live !== null && live.length > 0 && (
          <div className="mt-20">
            <motion.div
              className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="flex items-center gap-2.5 text-[20px] font-light text-white sm:text-[24px]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                Running right now
              </h3>
              <p className="text-[12px] text-white/30">
                {live.length} open · live from hackclub.com
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {live.slice(0, 18).map((program, i) => (
                <motion.a
                  key={program.href}
                  href={program.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group border-t border-white/10 pt-5 transition-colors hover:border-brand/60"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[16px] text-white transition-colors group-hover:text-brand">
                      {program.name}
                    </span>
                    <span className="shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-white/25">
                      {deadline(program.endDate)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-white/40">{program.blurb}</p>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* The honest footnote. Most of HQ's prize programs are scoped to 13–18,
            and NUST is a university — saying otherwise would be a lie our own
            members would catch in a week. */}
        <motion.p
          className="mx-auto mt-16 max-w-2xl text-center text-[12.5px] leading-relaxed text-white/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
        >
          Straight answer on eligibility: Hack Club HQ scopes most ship-a-project programs to
          makers aged 13–18, and HCB and Hackatime to everyone. We are a university chapter, so we
          take the philosophy, the jams and the format, run our own hackathons on top, and point
          our under-18 members at the rest of it.
        </motion.p>

        <motion.a
          href="https://hackclub.com"
          target="_blank"
          rel="noreferrer"
          className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[13px] text-white/60 transition-colors hover:border-brand/60 hover:text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          See all of it on hackclub.com
          <i className="bi bi-arrow-up-right text-[12px]" aria-hidden="true" />
        </motion.a>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { VIDEOS } from '../videos';
import { ORIENTATION, PILLARS } from '../events';

/**
 * What the club runs. This replaced a section that listed Hack Club HQ's own
 * programs — those are HQ's, aimed mostly at 13–18-year-olds, and none of them
 * were things this chapter organises. This is the chapter's half instead.
 */

interface EventsProps {
  /** Null once orientation is over: the "up next" card goes with it. */
  onOpenOrientation: (() => void) | null;
}

export default function Events({ onOpenOrientation }: EventsProps) {
  return (
    <section id="events" className="relative w-full overflow-hidden bg-ink">
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
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/40">What We Run</p>
            <h2 className="mt-6 text-[clamp(28px,6vw,56px)] font-light leading-[1.05] tracking-[-0.02em] text-white">
              Hackathons,
              <br />
              workshops,
              <br />
              <span className="text-brand">tech &amp; cyber.</span>
            </h2>
          </motion.div>

          <motion.p
            className="max-w-sm text-[14px] leading-relaxed text-white/45 sm:text-[15px] md:pb-2 md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            Everything here is run by students at NUST, from the first poster to the closing
            ceremony. We host the events, find the partners, write the challenges, and hand out
            the prizes.
          </motion.p>
        </div>

        {/* ------------------------------ pillars ------------------------------ */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-7 backdrop-blur-sm"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-grad">
                <i className={`bi ${pillar.icon} text-[17px] text-white`} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-[21px] font-light leading-none tracking-[-0.01em] text-white">
                {pillar.title}
              </h3>
              <p className="mt-4 text-[13.5px] leading-relaxed text-white/50">{pillar.body}</p>
            </motion.div>
          ))}
        </div>

        {/* ------------------------------ up next ------------------------------ */}
        {onOpenOrientation && (
          <motion.button
            type="button"
            onClick={onOpenOrientation}
            className="group mt-6 flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-left transition-colors hover:border-brand/50 sm:flex-row"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[6/5] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-[300px]">
              <img
                src={ORIENTATION.poster}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>

            <div className="flex flex-1 flex-col justify-center gap-4 p-7 sm:p-9">
              <span className="flex items-center gap-2.5 text-[12px] uppercase tracking-[0.18em] text-brand">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                Up next
              </span>
              <h3 className="text-[clamp(22px,3.4vw,32px)] font-light leading-tight text-white">
                {ORIENTATION.name} {ORIENTATION.edition}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-white/50">
                {ORIENTATION.day}, {ORIENTATION.date} · {ORIENTATION.time} · {ORIENTATION.venue}
              </p>
              <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13px] text-white/75 transition-colors group-hover:border-brand/60 group-hover:text-white">
                See the details
                <i className="bi bi-arrow-right text-[12px]" aria-hidden="true" />
              </span>
            </div>
          </motion.button>
        )}
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { CYBER_HACKATHON, INSTAGRAM, RECORD } from '../events';

/**
 * What this chapter has actually run on campus. Keeps the brand-gradient panel
 * the old Rounds section used, so the page still breaks out of the near-black
 * once on the way down. The content lives in events.ts, where every claim has
 * a source.
 */
export default function Chapter() {
  const ch = CYBER_HACKATHON;

  return (
    <section className="relative w-full overflow-hidden bg-brand-grad">
      {/* dot grid + vignette so white type holds against the coral */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,5,7,0)_0%,rgba(11,5,7,0.45)_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-32">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9 }}
        >
          <p className="text-[13px] uppercase tracking-[0.2em] text-white/60">On This Campus</p>
          <h2 className="mt-6 text-[clamp(28px,6vw,56px)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            Already run
            <br />
            by this club.
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
            You do not need to know how to code to join, and you do not need permission to start
            something. Every event below began as a few members who wanted it to exist.
          </p>
        </motion.div>

        {/* ----------------------------- flagship ----------------------------- */}
        <motion.article
          className="mt-20 grid grid-cols-1 overflow-hidden rounded-2xl border border-white/25 bg-ink/35 backdrop-blur-sm md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={ch.poster}
            alt="A hacker in a hoodie facing a wall of glowing red terminal windows and a cracked padlock"
            loading="lazy"
            className="aspect-[3/4] h-full w-full object-cover md:aspect-auto"
          />

          <div className="flex flex-col gap-6 p-8 sm:p-10">
            <div>
              <span className="text-[12px] uppercase tracking-[0.15em] text-white/55">{ch.kicker}</span>
              <h3 className="mt-3 text-[clamp(24px,3.6vw,36px)] font-light leading-tight text-white">
                {ch.name}
              </h3>
            </div>

            <p className="text-[14px] leading-relaxed text-white/75 sm:text-[15px]">{ch.summary}</p>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/15 py-6 sm:grid-cols-4">
              {ch.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-white/50">{fact.label}</dt>
                  <dd className="mt-1.5 text-[15px] text-white">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-[13.5px] leading-relaxed text-white/65">{ch.closing}</p>

            <div className="flex flex-wrap gap-2">
              {ch.partners.map((partner) => (
                <span
                  key={partner}
                  className="rounded-full border border-white/25 px-3.5 py-1.5 text-[12px] text-white/80"
                >
                  {partner}
                </span>
              ))}
            </div>

            <a
              href={ch.post}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 text-[13px] text-white/70 transition-colors hover:text-white"
            >
              <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
              The closing ceremony on Instagram
              <i className="bi bi-arrow-up-right text-[11px]" aria-hidden="true" />
            </a>
          </div>
        </motion.article>

        {/* ---------------------------- the record ---------------------------- */}
        <motion.div
          className="mt-6 rounded-2xl border border-white/25 bg-white/[0.07] p-8 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-[22px] font-light text-white sm:text-[26px]">And before that</h3>
            <span className="text-[12px] uppercase tracking-[0.15em] text-white/50">Since 2021</span>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {RECORD.map((item) => (
              <li key={item.name} className="border-t border-white/20 pt-4">
                <h4 className="text-[15px] text-white">{item.name}</h4>
                {item.detail && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{item.detail}</p>
                )}
              </li>
            ))}
          </ul>

          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-[13px] text-white/70 transition-colors hover:text-white"
          >
            <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
            Every event, on @hackclub.nust
            <i className="bi bi-arrow-up-right text-[11px]" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { OFFICE_BEARERS } from '../team';

/** First letter of the first and last name: "Malik Usman" → "MU". */
const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/**
 * Who runs the club. Initials rather than photos, so the section never waits
 * on someone sending a headshot and never goes stale with an old one.
 */
export default function Team() {
  return (
    <section id="team" className="relative w-full overflow-hidden bg-ink px-6 py-32">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[360px] w-[680px] -translate-x-1/2 rounded-full bg-brand-grad opacity-[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/40">The Team</p>
            <h2 className="mt-6 text-[clamp(28px,6vw,56px)] font-light leading-[1.05] tracking-[-0.02em] text-white">
              Office
              <br />
              bearers.
            </h2>
          </motion.div>

          <motion.p
            className="max-w-sm text-[14px] leading-relaxed text-white/45 sm:text-[15px] md:pb-2 md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            The students who run Hack Club NUST: the events, the partners, the money, the posts,
            and this site.
          </motion.p>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICE_BEARERS.map((member, i) => (
            <motion.li
              key={member.name}
              className="group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-brand/40 hover:bg-white/[0.04]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
            >
              <span
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-grad font-display text-[22px] tracking-[0.04em] text-white shadow-[0_8px_24px_rgba(235,69,84,0.25)]"
              >
                {initials(member.name)}
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[17px] font-light leading-tight text-white">{member.name}</span>
                <span className="text-[11.5px] uppercase tracking-[0.14em] text-white/45 transition-colors group-hover:text-brand">
                  {member.role}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

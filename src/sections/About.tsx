import { motion } from 'framer-motion';
import HackClubLogo from '../components/HackClubLogo';

/**
 * What Hack Club is, and what this chapter is inside it. This is the first
 * thing after the hero because most visitors arrive knowing the NUST name and
 * not the Hack Club one.
 */

/* Figures as published by Hack Club. HQ quotes a few different numbers across
   its own pages; these are the ones on hackclub.com itself. */
const STATS = [
  { value: '2014', label: 'Founded' },
  { value: '100,000', label: 'Teens a year' },
  { value: '1,500+', label: 'Clubs worldwide' },
  { value: '501(c)(3)', label: 'Nonprofit' },
];

/* Hack Club's own stated beliefs, condensed. The carpentry line is theirs. */
const PRINCIPLES = [
  {
    icon: 'bi-lightning-charge',
    title: 'Coding is a superpower',
    body: 'It converts you from a consumer into a creator. The computer stops being a thing you use and starts being a thing you build with.',
  },
  {
    icon: 'bi-hammer',
    title: 'Start building',
    body: 'Most coding classes teach concepts instead of how to write real code. Hack Club calls that trying to learn carpentry without any wood.',
  },
  {
    icon: 'bi-arrow-repeat',
    title: 'Learn as you build',
    body: 'You will not understand how it works when you start. You build the understanding on the way. You get stuck, and somebody helps.',
  },
  {
    icon: 'bi-people-fill',
    title: 'Be part of a community',
    body: 'Artists, writers, engineers, tinkerers, filmmakers. We make things, we help one another, and we have fun doing it.',
  },
];

export default function About() {
  return (
    <section id="club" className="relative w-full overflow-hidden bg-ink px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/40">The Club</p>
            <h2 className="mt-6 text-[clamp(26px,4.4vw,44px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
              A worldwide network of student coding clubs.{' '}
              <span className="text-brand">This is the NUST one.</span>
            </h2>

            <div className="mt-8 flex items-center gap-3 text-white/30">
              <HackClubLogo size={20} />
              <span className="text-[13px]">hackclub.com</span>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-6 text-[14px] leading-relaxed text-white/50 sm:text-[15.5px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <p>
              Hack Club is a nonprofit network of coding clubs, started in 2014 by a
              sixteen-year-old and now run as The Hack Foundation, a registered US charity. It
              reaches around a hundred thousand teenagers a year across more than 1,500 clubs, and
              it is free, forever, for every one of them.
            </p>
            <p>
              It is not a course and not competition prep. The whole thing runs on one line —
              <span className="text-white/75"> we are at our best when we are making</span> — a
              Slack full of people shipping at odd hours, and a rotating stack of challenges that
              send you something real for finishing a project. Their words: for teens, by teens.
            </p>
            <p className="text-white/70">
              Hack Club NUST is the chapter at the National University of Sciences and Technology
              in Islamabad, running since 2021. We run the sessions, the workshops and the
              hackathons on this campus, and we build our own things in between — which is where
              the games further down came from.
            </p>
          </motion.div>
        </div>

        {/* ------------------------------- stats ------------------------------- */}
        <motion.div
          className="mt-20 grid grid-cols-2 gap-8 border-y border-white/8 py-10 md:grid-cols-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9 }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div className="text-[clamp(24px,4vw,38px)] font-light leading-none text-white">
                {stat.value}
              </div>
              <div className="mt-2 text-[12px] uppercase tracking-[0.12em] text-white/35">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ----------------------------- principles ---------------------------- */}
        <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
          {PRINCIPLES.map((principle, i) => (
            <motion.div
              key={principle.title}
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                <i className={`bi ${principle.icon} text-[15px] text-brand`} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[16px] font-normal text-white">{principle.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/40 sm:text-[14px]">
                  {principle.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

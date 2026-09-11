import { motion } from 'framer-motion';

/**
 * What this chapter actually runs on campus, as opposed to what Hack Club is
 * globally. Keeps the brand-gradient panel the old Rounds section used, so the
 * page still breaks out of the near-black once on the way down.
 */

const ACTIVITIES = [
  {
    n: '01',
    title: 'Weekly build sessions',
    body: 'Bring whatever you are working on. Two hours, one room, people who will look at your bug with you.',
  },
  {
    n: '02',
    title: 'Workshops',
    body: 'Short, hands-on, run by members. Web, embedded, design, game dev — you leave with the thing running.',
  },
  {
    n: '03',
    title: 'Hackathons',
    body: 'Our own on campus, plus the global Hack Club ones. Ship something in a weekend, demo it to a room.',
  },
  {
    n: '04',
    title: 'Stalls and demo days',
    body: 'We take club projects to a table in front of real students and watch them get played, and broken.',
  },
  {
    n: '05',
    title: 'Open source',
    body: 'Club projects live on GitHub from the first commit. This site is one of them.',
  },
  {
    n: '06',
    title: 'The community',
    body: 'A WhatsApp group that never sleeps, and the global Hack Club Slack behind it.',
  },
];

/**
 * Things the chapter has actually run. Kept separate from ACTIVITIES because
 * these are claims about the past — when a new event happens, add it here, and
 * when one of these stops being true, delete it rather than softening it.
 */
const TRACK_RECORD = [
  {
    title: 'The Cyber Hackathon',
    detail: 'A campus-wide security hackathon, closing with prize distribution at the SEECS seminar hall.',
  },
  {
    title: 'CTF with PKCERT',
    detail: 'A capture-the-flag run with PKCERT Pakistan and Digiinn360, on a prize pool north of Rs. 275,000.',
  },
  {
    title: 'NUST Olympiad hackathon',
    detail: '150+ students from across Pakistan, split across web development and AI tracks.',
  },
];

export default function Chapter() {
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
            What a semester
            <br />
            with us looks like.
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
            You do not need to know how to code to join, and you do not need permission to start
            something. Turn up, find two people who want the same thing to exist, and go.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((activity, i) => (
            <motion.div
              key={activity.n}
              className="border-t border-white/25 pt-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: (i % 3) * 0.1 }}
            >
              <span className="text-[12px] tracking-[0.15em] text-white/45">{activity.n}</span>
              <h3 className="mt-3 text-[19px] font-light leading-snug text-white sm:text-[21px]">
                {activity.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/65 sm:text-[14.5px]">
                {activity.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ---------------------------- track record --------------------------- */}
        <motion.div
          className="mt-24 rounded-2xl border border-white/25 bg-white/[0.07] p-8 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-[22px] font-light text-white sm:text-[26px]">
              Already run on this campus
            </h3>
            <span className="text-[12px] uppercase tracking-[0.15em] text-white/50">
              Since 2021
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {TRACK_RECORD.map((item) => (
              <div key={item.title}>
                <h4 className="text-[15px] text-white">{item.title}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-white/60">{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

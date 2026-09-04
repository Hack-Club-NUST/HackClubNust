import { motion } from 'framer-motion';

const ROUNDS = [
  { layer: 'Round 1', name: 'Detect' },
  { layer: 'Round 2', name: 'Decipher' },
  { layer: 'Round 3', name: 'Rank' },
];

export default function Rounds() {
  return (
    <section className="relative w-full min-h-screen-dvh overflow-hidden bg-brand-grad">
      {/* dot grid + darkening so white type holds against the coral */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,5,7,0)_0%,rgba(11,5,7,0.45)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen-dvh max-w-3xl flex-col justify-center px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.0 }}
        >
          <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/60 sm:text-[14px]">
            How A Run Works
          </p>
          <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Three rounds. Zero mercy.
          </h2>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[17px]">
            Round one puts generated work next to human work and asks you to choose. Round two
            hands you a cipher and takes away the clock you were counting on. Round three posts
            everything to the club leaderboard, where the whole campus can see it.
          </p>
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {ROUNDS.map((round) => (
            <div
              key={round.layer}
              className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/25 bg-white/[0.06] px-6 backdrop-blur-sm"
            >
              <span className="text-[12px] uppercase tracking-[0.15em] text-white/55">
                {round.layer}
              </span>
              <span className="text-[16px] font-light text-white sm:text-[18px]">{round.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

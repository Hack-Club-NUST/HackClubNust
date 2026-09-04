import { motion } from 'framer-motion';
import { VIDEOS } from '../videos';

const METRICS = [
  { value: '02', label: 'Games In Build' },
  { value: '48H', label: 'Hack Sprints' },
  { value: '300+', label: 'Members On Deck' },
];

export default function Metrics() {
  return (
    <section id="club" className="relative w-full min-h-screen-dvh overflow-hidden">
      <video
        src={VIDEOS.metrics}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-brand-grad opacity-25 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-ink/60" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-32">
        <motion.p
          className="mb-20 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          Club Signal
        </motion.p>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white">
                {metric.value}
              </div>
              <div className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

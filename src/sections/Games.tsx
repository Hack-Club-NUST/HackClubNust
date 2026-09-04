import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import AiHumanGame from '../game/components/AiHumanGame';

const GAMES = [
  {
    id: 'ai-vs-human',
    Icon: Brain,
    title: 'AI vs Human',
    tagline: 'Detector',
    desc: 'Fifteen rounds of prose, code and images. Some hand you one artifact and ask who made it; some put two side by side and ask which one the machine made. Every call is answered with the tell you missed.',
    meta: ['Text · Code · Image', 'Single + compare', 'Club leaderboard'],
    status: 'live' as const,
  },
  {
    id: 'freshers',
    Icon: Sparkles,
    title: 'Next Game',
    tagline: 'In Design',
    desc: 'A welcome game for freshers, built around the interest bands we hand out at the stall. Play it, earn your band, wear what you are into. Being designed now.',
    meta: ['Freshers stall', 'Earn your band', 'Coming soon'],
    status: 'soon' as const,
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <section id="games" className="relative w-full bg-ink px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.p
          className="mb-8 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0 }}
        >
          The Arena
        </motion.p>

        <motion.h2
          className="mb-20 text-center text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0 }}
        >
          Pick your fight.
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {GAMES.map((game, i) => (
            <motion.article
              key={game.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              whileHover={{ borderColor: 'rgba(237,74,82,0.45)' }}
            >
              {/* brand glow on hover */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-brand-grad opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-40" />

              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-grad">
                  <game.Icon size={22} strokeWidth={1.6} className="text-white" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                    game.status === 'live'
                      ? 'border border-brand/50 bg-brand/10 text-brand'
                      : 'border border-white/15 text-white/40'
                  }`}
                >
                  {game.status === 'live' ? 'Playable' : 'In Development'}
                </span>
              </div>

              <h3 className="relative mt-8 text-[28px] font-light leading-none tracking-[-0.02em] text-white sm:text-[34px]">
                {game.title}
              </h3>
              <p className="relative mt-2 text-[12px] uppercase tracking-[0.2em] text-brand">
                {game.tagline}
              </p>

              <p className="relative mt-6 text-[13px] leading-relaxed text-white/45 sm:text-[15px]">
                {game.desc}
              </p>

              <ul className="relative mt-8 flex flex-wrap gap-2">
                {game.meta.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-white/35 sm:text-[12px]"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex-1" />

              {game.status === 'live' ? (
                <button
                  type="button"
                  onClick={() => setActiveGame(game.id)}
                  className="relative mt-10 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-grad text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(235,69,84,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <i className="bi bi-play-fill text-[18px]" aria-hidden="true" />
                  Play Now
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="relative mt-10 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/15 text-[14px] font-bold text-white/35"
                >
                  <i className="bi bi-hourglass-split text-[14px]" aria-hidden="true" />
                  Coming Soon
                </button>
              )}
            </motion.article>
          ))}
        </div>
      </div>

      <AiHumanGame
        open={activeGame === 'ai-vs-human'}
        onClose={() => setActiveGame(null)}
      />
    </section>
  );
}

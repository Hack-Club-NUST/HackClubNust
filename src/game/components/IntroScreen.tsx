import { motion } from 'framer-motion';
import LeaderboardPanel from './LeaderboardPanel';
import { ROUNDS_PER_RUN } from '../scoring';
import type { LeaderboardEntry, Player, Standing } from '../types';

interface IntroScreenProps {
  player: Player | null;
  standing: Standing | null;
  board: LeaderboardEntry[];
  onStart: () => void;
}

const RULES: Array<[string, string]> = [
  ['01', `${ROUNDS_PER_RUN} rounds, mixed: prose, code and images, drawn 50/50 model vs person.`],
  ['02', 'Some rounds show one artifact. Some show two and ask which one the model made.'],
  ['03', 'The clock is per round — images are quick, code gets longer, hard rounds get less.'],
  ['04', 'Speed pays. Streaks at 3, 5, 7, 10 and 15 pay more. Running out of time is a miss.'],
  ['05', 'Every call is followed by the tell you should have caught.'],
];

export default function IntroScreen({ player, standing, board, onStart }: IntroScreenProps) {
  return (
    <motion.div
      className="mx-auto flex w-full max-w-2xl flex-col px-6 py-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-[12px] uppercase tracking-[0.2em] text-brand">
        {player ? `Ready, ${player.name.split(' ')[0]}` : 'Hack Club NUST'}
      </p>
      <h2 className="mt-3 text-[clamp(30px,6.5vw,52px)] font-light leading-[1.05] tracking-[-0.03em] text-white">
        AI vs Human
      </h2>
      <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-white/50 sm:text-[15px]">
        Prose, code, and pictures. Some rounds hand you one artifact and ask who made it; some put
        two side by side and ask which one is the machine's.
      </p>

      {standing && (
        <p className="mt-4 text-[13px] text-white/40">
          You sit <span className="text-brand">#{standing.position}</span> of {standing.of} with{' '}
          <span className="tabular-nums text-white/70">{standing.best}</span>.
        </p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {RULES.map(([num, rule]) => (
          <li key={num} className="flex gap-4">
            <span className="shrink-0 text-[12px] tracking-[0.15em] text-brand">{num}</span>
            <span className="text-[13px] leading-relaxed text-white/60 sm:text-[14px]">{rule}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onStart}
        autoFocus
        className="mt-9 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brand-grad text-[15px] font-bold text-white shadow-[0_8px_30px_rgba(235,69,84,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Start Run
        <span className="text-[12px] font-normal text-white/70">[Enter]</span>
      </button>

      <div className="mt-10">
        <LeaderboardPanel entries={board} player={player} limit={5} />
      </div>
    </motion.div>
  );
}

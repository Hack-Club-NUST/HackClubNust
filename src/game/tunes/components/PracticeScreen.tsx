import { motion } from 'framer-motion';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import AlphabetBoard from './AlphabetBoard';
import { ROUNDS_PER_RUN } from '../scoring';
import type { LeaderboardEntry, Player, Standing } from '../../types';
import type { Letter } from '../alphabet';

interface PracticeScreenProps {
  player: Player | null;
  standing: Standing | null;
  board: LeaderboardEntry[];
  previewLetter: Letter | null;
  audioError: string | null;
  onPlayLetter: (letter: Letter) => void;
  onPlayFull: (letter: Letter) => void;
  onStart: () => void;
}

export default function PracticeScreen({
  player, standing, board, previewLetter, audioError, onPlayLetter, onPlayFull, onStart,
}: PracticeScreenProps) {
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
        Cipher Tunes
      </h2>
      <p className="mt-4 text-[14px] leading-relaxed text-white/60 sm:text-[16px]">
        Seven letters. Each one has its own tune. Tap them and listen — that is the whole alphabet.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/35">
            Tap any letter to hear it
          </span>
          <span className="text-[11px] text-white/25">no timer here — take your time</span>
        </div>

        <AlphabetBoard onTap={onPlayLetter} activeLetter={previewLetter} onFullTune={onPlayFull} />

        {audioError && (
          <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-[12px] text-white/70">
            {audioError}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 p-5">
        <div className="mb-3 text-[11px] uppercase tracking-[0.15em] text-white/35">
          Then the game
        </div>
        <ol className="flex flex-col gap-2.5 text-[13px] leading-relaxed text-white/60 sm:text-[14px]">
          <li className="flex gap-3">
            <span className="text-brand">1</span>
            <span>A word plays as one melody — its letters, one after another.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand">2</span>
            <span>Tap letters to spell what you heard. Tapping also plays that letter, so you can compare.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand">3</span>
            <span>{ROUNDS_PER_RUN} words, getting longer. Replay as much as you need — the first two are free.</span>
          </li>
        </ol>
      </div>

      {standing && (
        <p className="mt-6 text-[13px] text-white/40">
          You sit <span className="text-brand">#{standing.position}</span> of {standing.of} with{' '}
          <span className="tabular-nums text-white/70">{standing.best}</span>.
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        autoFocus
        className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brand-grad text-[15px] font-bold text-white shadow-[0_8px_30px_rgba(235,69,84,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        I know the letters — start
      </button>

      <div className="mt-10">
        <LeaderboardPanel entries={board} player={player} limit={5} title="Cipher Tunes leaderboard" />
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import CipherGrid from './CipherGrid';
import NoteLadder from './NoteLadder';
import { buildTune, motifFor } from '../cipher';
import { ROUNDS_PER_RUN } from '../scoring';
import type { LeaderboardEntry, Player, Standing } from '../../types';
import type { ActiveNote } from '../useCipherTunes';

interface CipherIntroProps {
  player: Player | null;
  standing: Standing | null;
  board: LeaderboardEntry[];
  earMode: boolean;
  activeNote: ActiveNote | null;
  onToggleEar: (value: boolean) => void;
  onPlayNote: (hz: number) => void;
  onDemo: (word: string) => void;
  onStart: () => void;
}

export default function CipherIntro({
  player, standing, board, earMode, activeNote,
  onToggleEar, onPlayNote, onDemo, onStart,
}: CipherIntroProps) {
  const [demoWord] = useState('HACK');
  const demoMotifs = [...demoWord].map(motifFor);
  const demoLength = buildTune(demoWord).duration;

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
      <p className="mt-4 text-[13px] leading-relaxed text-white/50 sm:text-[15px]">
        Every letter is two notes. The first names its row, the second names its column, and where
        they cross is your letter. Learn five pitches and you can read a word out of a melody.
      </p>

      <div className="mt-8 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="mb-4 text-[11px] uppercase tracking-[0.15em] text-white/35">
          The five pitches — tap any to hear it
        </div>
        <NoteLadder activeNote={activeNote} onPlay={onPlayNote} guided={!earMode} />
        <p className="mt-4 text-[12px] leading-relaxed text-white/40">
          Row notes are low, column notes are high — over an octave apart, so you always know which
          half of a motif you are hearing.
        </p>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="self-start text-[11px] uppercase tracking-[0.15em] text-white/35">
          The grid
        </div>
        <CipherGrid />
        <div className="w-full">
          <button
            type="button"
            onClick={() => onDemo(demoWord)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-brand/50 bg-brand/[0.08] text-[13px] text-white transition-colors hover:bg-brand/20"
          >
            <i className="bi bi-play-fill text-[16px]" aria-hidden="true" />
            Hear {demoWord} ({demoLength.toFixed(1)}s)
          </button>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] text-white/40">
            {demoMotifs.map((m, i) =>
              m ? (
                <span key={i}>
                  <span className="text-white/70">{m.letter}</span> = {m.rowNote}
                  <span className="text-white/25">→</span>
                  {m.colNote}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-white/10 px-5 py-4">
        <span>
          <span className="block text-[14px] text-white">Ear mode</span>
          <span className="mt-1 block text-[12px] leading-relaxed text-white/40">
            No lights on the ladder while a tune plays. Pure listening — every point scores 1.5x.
          </span>
        </span>
        <input
          type="checkbox"
          checked={earMode}
          onChange={(e) => onToggleEar(e.target.checked)}
          className="h-5 w-5 shrink-0 accent-[#ED4A52]"
        />
      </label>

      <ul className="mt-6 flex flex-col gap-2 text-[13px] leading-relaxed text-white/55">
        <li>· {ROUNDS_PER_RUN} rounds — 5 single letters, then 7 words that get longer.</li>
        <li>· The clock only starts once the tune has finished playing.</li>
        <li>· Two replays are free. After that, and for revealed letters, you pay in points.</li>
      </ul>

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
        Start Run
        <span className="text-[12px] font-normal text-white/70">[Enter]</span>
      </button>

      <div className="mt-10">
        <LeaderboardPanel entries={board} player={player} limit={5} title="Cipher Tunes leaderboard" />
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import LeaderboardPanel from '../../components/LeaderboardPanel';
import { cipherRankFor, type CipherRoundResult } from '../scoring';
import type { LeaderboardEntry, Player, Standing } from '../../types';

interface CipherResultsProps {
  score: number;
  correct: number;
  total: number;
  maxCombo: number;
  results: CipherRoundResult[];
  board: LeaderboardEntry[];
  player: Player | null;
  standing: Standing | null;
  busy: boolean;
  error: string | null;
  onReplay: () => void;
  onClose: () => void;
}

export default function CipherResults({
  score, correct, total, maxCombo, results, board, player, standing, busy, error, onReplay, onClose,
}: CipherResultsProps) {
  const rank = cipherRankFor(correct, total);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  const isLeader = standing?.position === 1;
  const words = results.filter((r) => r.kind === 'word');
  const wordsRight = words.filter((r) => r.correct).length;

  return (
    <motion.div
      className="mx-auto flex w-full max-w-2xl flex-col px-6 py-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-[12px] uppercase tracking-[0.2em] text-brand">Run complete</p>
      <h2 className="mt-3 text-[clamp(30px,6vw,48px)] font-light leading-[1.05] tracking-[-0.03em] text-white">
        {rank.title}
      </h2>
      <p className="mt-3 text-[13px] leading-relaxed text-white/50 sm:text-[15px]">{rank.blurb}</p>

      {isLeader && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/50 bg-brand/[0.08] px-5 py-4">
          <i className="bi bi-trophy-fill text-[18px] text-brand" aria-hidden="true" />
          <span className="text-[14px] text-white">You are top of the Cipher Tunes board.</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { value: score, label: 'Score' },
          { value: `${accuracy}%`, label: `${correct}/${total} correct` },
          { value: `${wordsRight}/${words.length}`, label: 'Words decoded' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 px-4 py-5">
            <div className="text-[clamp(20px,4.5vw,32px)] font-light leading-none tabular-nums text-white">
              {stat.value}
            </div>
            <div className="mt-2 text-[11px] leading-tight text-white/35">{stat.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] text-white/40">
        Best streak <span className="text-white/70">{maxCombo}x</span>
        {standing && !isLeader && (
          <>
            {' · '}you sit <span className="text-brand">#{standing.position}</span> of {standing.of}
          </>
        )}
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-[12px] leading-relaxed text-white/70">
          Run not saved — {error}
        </p>
      )}

      <div className="mt-8">
        <div className="mb-3 text-[11px] uppercase tracking-[0.15em] text-white/35">Round by round</div>
        <div className="flex flex-col gap-1.5">
          {results.map((r, i) => (
            <div
              key={`${r.roundId}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-white/[0.07] px-3 py-2 text-[12px]"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] ${
                  r.correct ? 'bg-emerald-400/15 text-emerald-400' : 'bg-brand/15 text-brand'
                }`}
              >
                {r.correct ? '✓' : '✕'}
              </span>
              <span className="w-6 shrink-0 tabular-nums text-white/25">{i + 1}</span>
              <span className="w-16 shrink-0 tracking-[0.15em] text-white/70">{r.answer}</span>
              {!r.correct && r.guess && (
                <span className="truncate text-white/30">you said {r.guess}</span>
              )}
              {r.hints > 0 && <span className="text-amber-400/70">{r.hints} hint</span>}
              {r.earMode && <span className="text-brand/70">ear</span>}
              <span className="ml-auto shrink-0 tabular-nums text-white/40">
                {r.pointsEarned > 0 ? `+${r.pointsEarned}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <LeaderboardPanel entries={board} player={player} title="Cipher Tunes leaderboard" />
      </div>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          autoFocus
          disabled={busy}
          className="flex h-[52px] flex-1 items-center justify-center gap-3 rounded-full bg-brand-grad text-[14px] font-bold text-white shadow-[0_8px_30px_rgba(235,69,84,0.35)] disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Run it again'}
          <span className="text-[12px] font-normal text-white/70">[Enter]</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-[52px] items-center justify-center rounded-full border border-white/15 px-8 text-[14px] text-white/70 hover:border-white/40 hover:text-white"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

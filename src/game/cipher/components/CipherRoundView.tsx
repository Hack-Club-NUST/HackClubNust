import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TimerBar from '../../components/TimerBar';
import CipherGrid from './CipherGrid';
import NoteLadder from './NoteLadder';
import { FREE_REPLAYS, MAX_HINTS, type CipherRound, type CipherRoundResult } from '../scoring';
import type { ActiveNote } from '../useCipherTunes';

interface CipherRoundViewProps {
  round: CipherRound;
  index: number;
  total: number;
  score: number;
  combo: number;
  msLeft: number;
  limitMs: number;
  timerRunning: boolean;
  isPlaying: boolean;
  activeNote: ActiveNote | null;
  earMode: boolean;
  guess: string;
  replays: number;
  hints: number;
  slow: boolean;
  isFeedback: boolean;
  lastResult: CipherRoundResult | null;
  onGuessChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onReplay: (options?: { slower?: boolean }) => void;
  onHint: () => void;
  onNext: () => void;
  onPlayNote: (hz: number) => void;
}

export default function CipherRoundView(props: CipherRoundViewProps) {
  const {
    round, index, total, score, combo, msLeft, limitMs, timerRunning, isPlaying,
    activeNote, earMode, guess, replays, hints, slow, isFeedback, lastResult,
    onGuessChange, onSubmit, onReplay, onHint, onNext, onPlayNote,
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const isWord = round.kind === 'word';
  const isLast = index === total - 1;

  useEffect(() => {
    if (isWord && !isFeedback && timerRunning) inputRef.current?.focus();
  }, [isWord, isFeedback, timerRunning, index]);

  const slots = isWord ? round.answer.length : 1;
  const filled = guess.toUpperCase().padEnd(slots, ' ').slice(0, slots).split('');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-white/40">
        <span className="tabular-nums">
          Round {index + 1} / {total}
        </span>
        <div className="flex items-center gap-3">
          {combo >= 2 && <span className="text-brand">{combo}x</span>}
          <span className="tabular-nums text-white/70">{score} pts</span>
          <span className="rounded border border-white/10 px-2 py-0.5 uppercase tracking-[0.12em] text-white/30">
            {isWord ? `${round.answer.length} letters` : 'one letter'}
          </span>
          {earMode && (
            <span className="rounded border border-brand/40 px-2 py-0.5 uppercase tracking-[0.12em] text-brand">
              ear · 1.5x
            </span>
          )}
        </div>
      </div>

      <TimerBar msLeft={timerRunning || isFeedback ? msLeft : limitMs} limitMs={limitMs} />
      {!timerRunning && !isFeedback && (
        <p className="-mt-2 text-[11px] text-white/30">
          The clock starts when the tune finishes.
        </p>
      )}

      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] text-white/60 sm:text-[14px]">
            {isWord ? 'Decode the melody into a word.' : 'Which letter is this motif?'}
          </p>
          <span
            className={`flex items-center gap-2 text-[11px] ${isPlaying ? 'text-brand' : 'text-white/25'}`}
          >
            <i className={`bi ${isPlaying ? 'bi-soundwave' : 'bi-music-note-beamed'}`} aria-hidden="true" />
            {isPlaying ? 'playing' : 'idle'}
          </span>
        </div>

        <NoteLadder activeNote={activeNote} onPlay={onPlayNote} guided={!earMode} />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onReplay()}
            disabled={isFeedback}
            className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/70 transition-colors hover:border-brand hover:text-white disabled:opacity-40"
          >
            <i className="bi bi-arrow-clockwise" aria-hidden="true" />
            Replay
            <span className="text-[11px] text-white/30">
              {replays < FREE_REPLAYS ? `${FREE_REPLAYS - replays} free` : '−15%'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onReplay({ slower: true })}
            disabled={isFeedback || slow}
            className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/70 transition-colors hover:border-brand hover:text-white disabled:opacity-40"
          >
            <i className="bi bi-hourglass-split" aria-hidden="true" />
            {slow ? 'Slowed' : 'Slow it down'}
          </button>

          {isWord && (
            <button
              type="button"
              onClick={onHint}
              disabled={isFeedback || hints >= MAX_HINTS}
              className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/70 transition-colors hover:border-brand hover:text-white disabled:opacity-40"
            >
              <i className="bi bi-lightbulb" aria-hidden="true" />
              Reveal a letter
              <span className="text-[11px] text-white/30">−25% · {MAX_HINTS - hints} left</span>
            </button>
          )}
        </div>
      </div>

      {/* answer input */}
      {isWord ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isFeedback && guess.trim()) onSubmit(guess.trim().toUpperCase());
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex justify-center gap-1.5">
            {filled.map((ch, i) => (
              <div
                key={i}
                className={`flex h-12 w-10 items-center justify-center rounded-lg border text-[18px] ${
                  ch.trim() ? 'border-brand/50 bg-brand/[0.08] text-white' : 'border-white/15 text-white/20'
                }`}
              >
                {ch.trim() || '·'}
              </div>
            ))}
          </div>
          <input
            ref={inputRef}
            value={guess}
            onChange={(e) => onGuessChange(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, slots))}
            disabled={isFeedback}
            placeholder="type your answer"
            aria-label="Your answer"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 text-center text-[15px] tracking-[0.3em] text-white outline-none focus:border-brand disabled:opacity-50"
          />
          {!isFeedback && (
            <button
              type="submit"
              disabled={guess.trim().length !== slots}
              className="flex h-12 items-center justify-center gap-3 rounded-full bg-brand-grad text-[14px] font-bold text-white disabled:opacity-40"
            >
              Submit <span className="text-[12px] font-normal text-white/70">[Enter]</span>
            </button>
          )}
        </form>
      ) : (
        <div className="flex justify-center">
          <CipherGrid
            onPick={(letter) => !isFeedback && onSubmit(letter)}
            disabled={isFeedback}
            revealLetter={isFeedback ? round.answer : null}
            wrongLetter={isFeedback ? lastResult?.guess ?? null : null}
          />
        </div>
      )}

      {isWord && !isFeedback && (
        <div className="flex justify-center opacity-60">
          <CipherGrid />
        </div>
      )}

      {isFeedback && lastResult && (
        <motion.div
          className={`rounded-xl border p-5 ${
            lastResult.correct
              ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
              : 'border-brand/40 bg-brand/[0.06]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`text-[15px] font-bold sm:text-[17px] ${
                lastResult.correct ? 'text-emerald-400' : 'text-brand'
              }`}
            >
              {lastResult.correct ? 'Correct' : lastResult.guess === null ? 'Out of time' : 'Wrong'}
              <span className="ml-2 font-normal text-white/50">— it was {round.answer}</span>
            </span>
            {lastResult.correct && (
              <span className="text-[13px] tabular-nums text-white/60">
                +{lastResult.basePoints}
                {lastResult.speedBonus > 0 && (
                  <span className="text-white/35"> +{lastResult.speedBonus} speed</span>
                )}
                {lastResult.earBonus > 0 && (
                  <span className="text-brand"> +{lastResult.earBonus} ear</span>
                )}
                {lastResult.penalty > 0 && (
                  <span className="text-amber-400"> −{lastResult.penalty} help</span>
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onNext}
            autoFocus
            className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-[14px] font-bold text-ink"
          >
            {isLast ? 'See results' : 'Next round'}
            <span className="text-[12px] font-normal text-ink/50">[Enter]</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

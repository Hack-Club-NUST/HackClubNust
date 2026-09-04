import { motion } from 'framer-motion';
import TimerBar from '../../components/TimerBar';
import AlphabetBoard from './AlphabetBoard';
import WordSlots from './WordSlots';
import { wordDurationS } from '../alphabet';
import { FREE_REPLAYS, MAX_HINTS, type TuneRound, type TuneRoundResult } from '../scoring';
import type { Letter } from '../alphabet';

interface TuneRoundViewProps {
  round: TuneRound;
  index: number;
  total: number;
  score: number;
  combo: number;
  msLeft: number;
  limitMs: number;
  timerRunning: boolean;
  isPlaying: boolean;
  activeLetterIndex: number;
  previewLetter: Letter | null;
  guess: string;
  replays: number;
  hints: number;
  revealed: number[];
  isFeedback: boolean;
  lastResult: TuneRoundResult | null;
  onReplay: () => void;
  onTapLetter: (letter: Letter) => void;
  onBackspace: () => void;
  onClear: () => void;
  onHint: () => void;
  onSubmit: () => void;
  onNext: () => void;
  onHearAnswer: () => void;
}

export default function TuneRoundView(p: TuneRoundViewProps) {
  const { round, isFeedback, lastResult, guess, isPlaying } = p;
  const full = guess.length === round.word.length;
  const isLast = p.index === p.total - 1;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-white/40">
        <span className="tabular-nums">Word {p.index + 1} / {p.total}</span>
        <div className="flex items-center gap-3">
          {p.combo >= 2 && <span className="text-brand">{p.combo}x</span>}
          <span className="tabular-nums text-white/70">{p.score} pts</span>
          <span className="rounded border border-white/10 px-2 py-0.5 uppercase tracking-[0.12em] text-white/30">
            {round.word.length} letters
          </span>
        </div>
      </div>

      <TimerBar msLeft={p.timerRunning || isFeedback ? p.msLeft : p.limitMs} limitMs={p.limitMs} />
      {!p.timerRunning && !isFeedback && (
        <p className="-mt-2 text-[11px] text-white/30">The clock starts when the melody ends.</p>
      )}

      {/* the melody */}
      <button
        type="button"
        onClick={p.onReplay}
        disabled={isFeedback || isPlaying}
        className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-brand/50 bg-brand/[0.08] text-[15px] font-bold text-white transition-colors hover:bg-brand/20 disabled:opacity-70"
      >
        <i className={`bi ${isPlaying ? 'bi-soundwave' : 'bi-play-fill'} text-[22px]`} aria-hidden="true" />
        {isPlaying ? 'Playing…' : 'Play the word again'}
        <span className="text-[12px] font-normal text-white/50">
          {isPlaying ? `${wordDurationS(round.word).toFixed(0)}s` :
            p.replays < FREE_REPLAYS ? `${FREE_REPLAYS - p.replays} free` : '−10%'}
        </span>
      </button>

      <WordSlots
        length={round.word.length}
        guess={guess}
        activeIndex={p.activeLetterIndex}
        revealed={p.revealed}
        solution={isFeedback ? round.word : null}
        correct={lastResult?.correct}
      />

      {!isFeedback ? (
        <>
          <p className="text-center text-[13px] text-white/50">
            {isPlaying
              ? 'Spell along as it plays, or wait and tap to hear each letter.'
              : 'Tap a letter to hear it and place it.'}
          </p>

          {/* Deliberately enabled during playback: a player should be able to spell
              along with the melody instead of waiting out 17 seconds of audio. The
              per-letter tune is suppressed while the word plays so they never collide. */}
          <AlphabetBoard onTap={p.onTapLetter} activeLetter={p.previewLetter} size="compact" />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={p.onBackspace}
              disabled={!guess.length}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] text-white/70 hover:border-white/40 hover:text-white disabled:opacity-30"
            >
              <i className="bi bi-backspace" aria-hidden="true" /> Delete
            </button>
            <button
              type="button"
              onClick={p.onClear}
              disabled={!guess.length}
              className="flex h-11 items-center justify-center rounded-full border border-white/15 px-4 text-[13px] text-white/70 hover:border-white/40 hover:text-white disabled:opacity-30"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={p.onHint}
              disabled={p.hints >= MAX_HINTS}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/70 hover:border-amber-400/60 hover:text-white disabled:opacity-30"
            >
              <i className="bi bi-lightbulb" aria-hidden="true" />
              Hint
              <span className="text-[11px] text-white/30">{MAX_HINTS - p.hints} left</span>
            </button>
          </div>

          <button
            type="button"
            onClick={p.onSubmit}
            disabled={!full}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-brand-grad text-[15px] font-bold text-white disabled:opacity-30"
          >
            {full ? 'Check my answer' : `${round.word.length - guess.length} more to go`}
          </button>
        </>
      ) : (
        lastResult && (
          <motion.div
            className={`rounded-2xl border p-5 ${
              lastResult.correct
                ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                : 'border-brand/40 bg-brand/[0.06]'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`text-[16px] font-bold sm:text-[18px] ${lastResult.correct ? 'text-emerald-400' : 'text-brand'}`}>
                {lastResult.correct ? 'Correct!' : lastResult.guess === null ? 'Out of time' : 'Not quite'}
                <span className="ml-2 font-normal text-white/50">— it was {round.word}</span>
              </span>
              {lastResult.correct && (
                <span className="text-[13px] tabular-nums text-white/60">
                  +{lastResult.basePoints}
                  {lastResult.speedBonus > 0 && <span className="text-white/35"> +{lastResult.speedBonus} speed</span>}
                  {lastResult.penalty > 0 && <span className="text-amber-400"> −{lastResult.penalty} help</span>}
                  {lastResult.comboBonus > 0 && <span className="text-brand"> +{lastResult.comboBonus} streak</span>}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={p.onHearAnswer}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-[13px] text-white/70 hover:border-white/40 hover:text-white"
            >
              <i className="bi bi-play-fill text-[16px]" aria-hidden="true" />
              Hear {round.word} again, letter by letter
            </button>

            <button
              type="button"
              onClick={p.onNext}
              autoFocus
              className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-[14px] font-bold text-ink"
            >
              {isLast ? 'See results' : 'Next word'}
              <span className="text-[12px] font-normal text-ink/50">[Enter]</span>
            </button>
          </motion.div>
        )
      )}
    </div>
  );
}

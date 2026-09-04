import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from '../../components/GateScreen';
import LoadingScreen from './LoadingScreen';
import PracticeScreen from './PracticeScreen';
import TuneRoundView from './TuneRoundView';
import TunesResults from './TunesResults';
import { useCipherTunes } from '../useCipherTunes';

interface CipherTunesGameProps {
  open: boolean;
  onClose: () => void;
}

export default function CipherTunesGame({ open, onClose }: CipherTunesGameProps) {
  const g = useCipherTunes();
  const { phase, round, guess, startRun, next, reset } = g;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  /* A physical keyboard should work as well as the on-screen one. */
  useEffect(() => {
    if (!open || phase === 'gate') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;

      const key = e.key.toUpperCase();

      if (phase === 'playing' && round) {
        if (g.isLetter(key)) {
          e.preventDefault();
          g.appendLetter(key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          g.backspace();
        } else if (e.key === 'Enter' && guess.length === round.word.length) {
          e.preventDefault();
          g.submit(guess);
        } else if (e.key === ' ') {
          e.preventDefault();
          g.playWord(round.word, { countsAsReplay: true });
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'practice') startRun();
        else if (phase === 'feedback') next();
        else if (phase === 'results') startRun();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, phase, round, guess, g, startRun, next, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto bg-ink/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cipher Tunes game"
        >
          <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-grad opacity-[0.10] blur-[130px]" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close game"
            className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/60 transition-colors hover:border-white/40 hover:text-white sm:right-6 sm:top-6"
          >
            <i className="bi bi-x-lg text-[14px]" aria-hidden="true" />
          </button>

          <div className="relative flex min-h-full items-center justify-center">
            {phase === 'gate' && (
              <GateScreen
                champion={g.board[0] ?? null}
                playerCount={g.playerCount}
                busy={g.busy}
                error={g.apiError}
                onSubmit={g.signIn}
              />
            )}

            {phase === 'loading' && <LoadingScreen progress={g.loadProgress} />}

            {phase === 'practice' && (
              <PracticeScreen
                player={g.player}
                standing={g.standing}
                board={g.board}
                previewLetter={g.previewLetter}
                audioError={g.audioError}
                onPlayLetter={g.playLetter}
                onPlayFull={g.playFullTune}
                onStart={startRun}
              />
            )}

            {(phase === 'playing' || phase === 'feedback') && round && (
              <TuneRoundView
                round={round}
                index={g.index}
                total={g.run.length}
                score={g.score}
                combo={g.combo}
                msLeft={g.msLeft}
                limitMs={g.limitMs}
                timerRunning={g.timerRunning}
                isPlaying={g.isPlaying}
                activeLetterIndex={g.activeLetterIndex}
                previewLetter={g.previewLetter}
                guess={guess}
                replays={g.replays}
                hints={g.hints}
                revealed={g.revealed}
                isFeedback={phase === 'feedback'}
                lastResult={g.lastResult}
                onReplay={() => g.playWord(round.word, { countsAsReplay: true })}
                onTapLetter={(letter) => {
                  // While the word is sounding, place the letter silently so the
                  // two audio sources never fight; otherwise tap = hear + place.
                  if (!g.isPlaying) g.playLetter(letter);
                  g.appendLetter(letter);
                }}
                onBackspace={g.backspace}
                onClear={g.clearGuess}
                onHint={g.useHint}
                onSubmit={() => g.submit(guess)}
                onNext={next}
                onHearAnswer={() => g.playWord(round.word)}
              />
            )}

            {phase === 'results' && (
              <TunesResults
                score={g.score}
                correct={g.correct}
                total={g.run.length}
                maxCombo={g.maxCombo}
                results={g.results}
                board={g.board}
                player={g.player}
                standing={g.standing}
                busy={g.busy}
                error={g.apiError}
                onReplay={startRun}
                onPractice={g.backToPractice}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

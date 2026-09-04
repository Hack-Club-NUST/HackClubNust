import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from '../../components/GateScreen';
import CipherIntro from './CipherIntro';
import CipherResults from './CipherResults';
import CipherRoundView from './CipherRoundView';
import { useCipherTunes } from '../useCipherTunes';

interface CipherTunesGameProps {
  open: boolean;
  onClose: () => void;
}

export default function CipherTunesGame({ open, onClose }: CipherTunesGameProps) {
  const game = useCipherTunes();
  const { phase, round, start, next, reset } = game;

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

  /* Enter advances, Esc leaves. Letters are left alone — the word rounds need typing. */
  useEffect(() => {
    if (!open || phase === 'gate') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Enter') return;

      const inField = (e.target as HTMLElement | null)?.tagName === 'INPUT';
      if (phase === 'intro') {
        e.preventDefault();
        void start();
      } else if (phase === 'feedback') {
        e.preventDefault();
        next();
      } else if (phase === 'results' && !inField) {
        e.preventDefault();
        void start();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, phase, start, next, onClose]);

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
                champion={game.board[0] ?? null}
                playerCount={game.playerCount}
                busy={game.busy}
                error={game.apiError}
                onSubmit={game.signIn}
              />
            )}

            {phase === 'intro' && (
              <CipherIntro
                player={game.player}
                standing={game.standing}
                board={game.board}
                earMode={game.earMode}
                activeNote={game.activeNote}
                onToggleEar={game.setEarMode}
                onPlayNote={game.playNote}
                onDemo={game.demo}
                onStart={() => void start()}
              />
            )}

            {(phase === 'playing' || phase === 'feedback') && round && (
              <CipherRoundView
                round={round}
                index={game.index}
                total={game.run.length}
                score={game.score}
                combo={game.combo}
                msLeft={game.msLeft}
                limitMs={game.limitMs}
                timerRunning={game.timerRunning}
                isPlaying={game.isPlaying}
                activeNote={game.activeNote}
                earMode={game.earMode}
                guess={game.guess}
                replays={game.replays}
                hints={game.hints}
                slow={game.slow}
                isFeedback={phase === 'feedback'}
                lastResult={game.lastResult}
                onGuessChange={game.setGuess}
                onSubmit={game.submit}
                onReplay={game.replay}
                onHint={game.useHint}
                onNext={next}
                onPlayNote={game.playNote}
              />
            )}

            {phase === 'results' && (
              <CipherResults
                score={game.score}
                correct={game.correct}
                total={game.run.length}
                maxCombo={game.maxCombo}
                results={game.results}
                board={game.board}
                player={game.player}
                standing={game.standing}
                busy={game.busy}
                error={game.apiError}
                onReplay={() => void start()}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

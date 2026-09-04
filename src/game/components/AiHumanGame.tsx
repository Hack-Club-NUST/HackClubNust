import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GateScreen from './GateScreen';
import IntroScreen from './IntroScreen';
import ResultsScreen from './ResultsScreen';
import RoundScreen from './RoundScreen';
import { useAiHumanGame } from '../useAiHumanGame';

interface AiHumanGameProps {
  open: boolean;
  onClose: () => void;
}

export default function AiHumanGame({ open, onClose }: AiHumanGameProps) {
  const game = useAiHumanGame();
  const { phase, question, msLeft, start, answer, next, reset } = game;

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

  /* A/H for single rounds, 1/2 for compare, Enter to advance, Esc to leave.
     The gate is a form, so keys stay out of its way. */
  useEffect(() => {
    if (!open || phase === 'gate') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'escape') {
        onClose();
        return;
      }

      if (phase === 'playing' && question) {
        if (question.mode === 'single') {
          if (key === 'a' || key === 'arrowleft') {
            e.preventDefault();
            answer('ai', msLeft);
          } else if (key === 'h' || key === 'arrowright') {
            e.preventDefault();
            answer('human', msLeft);
          }
        } else {
          if (key === '1' || key === 'arrowleft') {
            e.preventDefault();
            answer(0, msLeft);
          } else if (key === '2' || key === 'arrowright') {
            e.preventDefault();
            answer(1, msLeft);
          }
        }
        return;
      }

      if (key === 'enter' || key === ' ') {
        e.preventDefault();
        if (phase === 'intro') start();
        else if (phase === 'feedback') next();
        else if (phase === 'results') start();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, phase, question, msLeft, answer, next, start, onClose]);

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
          aria-label="AI vs Human game"
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
              <IntroScreen
                player={game.player}
                standing={game.standing}
                board={game.board}
                hackpass={game.hackpass}
                onStart={start}
              />
            )}

            {(phase === 'playing' || phase === 'feedback') && question && (
              <RoundScreen
                question={question}
                index={game.index}
                total={game.run.length}
                score={game.score}
                combo={game.combo}
                msLeft={msLeft}
                limitMs={game.limitMs}
                isFeedback={phase === 'feedback'}
                lastResult={game.lastResult}
                onAnswer={(value) => answer(value, msLeft)}
                onNext={next}
              />
            )}

            {phase === 'results' && (
              <ResultsScreen
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
                hackpassProgress={game.hackpassProgress}
                hackpass={game.hackpass}
                hackpassJustIssued={game.hackpassJustIssued}
                onReplay={start}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

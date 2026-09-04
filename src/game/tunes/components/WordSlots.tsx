import { motion } from 'framer-motion';
import { LETTER_COLOR, type Letter } from '../alphabet';

interface WordSlotsProps {
  length: number;
  guess: string;
  /** Index currently sounding during playback, or -1. */
  activeIndex: number;
  revealed?: number[];
  /** After the answer: the true word, so slots can show what it was. */
  solution?: string | null;
  correct?: boolean;
}

export default function WordSlots({
  length,
  guess,
  activeIndex,
  revealed = [],
  solution = null,
  correct,
}: WordSlotsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length }).map((_, i) => {
        const shown = solution ? solution[i] : (guess[i] ?? '');
        const isActive = activeIndex === i;
        const isRevealed = revealed.includes(i);
        const wrongHere = Boolean(solution) && !correct && guess[i] !== solution?.[i];

        return (
          <motion.div
            key={i}
            animate={isActive ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={`relative flex h-16 w-12 items-center justify-center rounded-xl border text-[24px] font-bold sm:h-20 sm:w-16 sm:text-[30px] ${
              solution
                ? wrongHere
                  ? 'border-brand/60 bg-brand/10 text-brand'
                  : 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                : shown
                  ? 'border-white/40 text-white'
                  : 'border-white/15 text-white/20'
            }`}
            style={
              isActive && shown
                ? { backgroundColor: `${LETTER_COLOR[shown as Letter] ?? '#fff'}33` }
                : undefined
            }
          >
            {shown || '·'}
            {isRevealed && !solution && (
              <span className="absolute -top-1.5 right-1 text-[9px] text-amber-400">hint</span>
            )}
            {isActive && (
              <motion.span
                className="absolute inset-x-1 -bottom-1.5 h-0.5 rounded-full bg-white"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.5, ease: 'linear' }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

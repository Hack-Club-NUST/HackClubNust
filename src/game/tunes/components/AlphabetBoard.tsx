import { motion } from 'framer-motion';
import { LETTERS, LETTER_COLOR, type Letter } from '../alphabet';

interface AlphabetBoardProps {
  onTap: (letter: Letter) => void;
  /** Lit while its tune is sounding. */
  activeLetter?: Letter | null;
  size?: 'large' | 'compact';
  disabled?: boolean;
  /** Practice screen only: a second action for the full 10s recording. */
  onFullTune?: (letter: Letter) => void;
}

export default function AlphabetBoard({
  onTap,
  activeLetter = null,
  size = 'large',
  disabled = false,
  onFullTune,
}: AlphabetBoardProps) {
  const large = size === 'large';

  return (
    <div className={`grid grid-cols-4 gap-2 sm:grid-cols-7 ${large ? 'sm:gap-3' : ''}`}>
      {LETTERS.map((letter) => {
        const active = activeLetter === letter;
        return (
          <div key={letter} className="flex flex-col items-stretch gap-1">
            <motion.button
              type="button"
              disabled={disabled}
              onClick={() => onTap(letter)}
              aria-label={`Letter ${letter}`}
              className={`relative flex items-center justify-center overflow-hidden rounded-xl border font-bold transition-colors disabled:opacity-40 ${
                large ? 'h-20 text-[28px] sm:h-24 sm:text-[32px]' : 'h-14 text-[20px]'
              } ${active ? 'border-white/70 text-white' : 'border-white/15 text-white/80 hover:border-white/40'}`}
              style={{ backgroundColor: active ? `${LETTER_COLOR[letter]}33` : 'rgba(255,255,255,0.03)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className="absolute inset-x-0 bottom-0 h-1"
                style={{ backgroundColor: LETTER_COLOR[letter], opacity: active ? 1 : 0.45 }}
              />
              {letter}
              {active && (
                <motion.span
                  className="absolute inset-0"
                  style={{ backgroundColor: LETTER_COLOR[letter] }}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: 'linear' }}
                />
              )}
            </motion.button>

            {onFullTune && (
              <button
                type="button"
                onClick={() => onFullTune(letter)}
                className="text-[10px] text-white/30 transition-colors hover:text-white/70"
              >
                full tune
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

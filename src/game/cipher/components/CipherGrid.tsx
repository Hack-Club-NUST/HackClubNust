import { GRID, SCALE } from '../cipher';

interface CipherGridProps {
  /** Provided on letter rounds, where the grid is also the answer input. */
  onPick?: (letter: string) => void;
  disabled?: boolean;
  /** Highlighted after the answer, to show where the letter actually lived. */
  revealLetter?: string | null;
  wrongLetter?: string | null;
}

export default function CipherGrid({
  onPick,
  disabled = false,
  revealLetter = null,
  wrongLetter = null,
}: CipherGridProps) {
  return (
    <div className="inline-block rounded-xl border border-white/10 bg-black/30 p-2">
      <div className="grid grid-cols-6 gap-1">
        <div />
        {SCALE.map((note) => (
          <div key={`h-${note}`} className="pb-1 text-center text-[10px] text-white/30">
            {note}
          </div>
        ))}

        {GRID.map((row, r) => (
          <div key={`r-${r}`} className="contents">
            <div className="flex items-center justify-center text-[10px] text-white/30">
              {SCALE[r]}
            </div>
            {row.map((letter) => {
              const isAnswer = revealLetter === letter;
              const isWrong = wrongLetter === letter && wrongLetter !== revealLetter;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={disabled || !onPick}
                  onClick={() => onPick?.(letter)}
                  className={`h-8 w-8 rounded text-[12px] transition-colors sm:h-9 sm:w-9 sm:text-[13px] ${
                    isAnswer
                      ? 'bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/60'
                      : isWrong
                        ? 'bg-brand/20 text-brand ring-1 ring-brand/60'
                        : onPick && !disabled
                          ? 'bg-white/[0.04] text-white/70 hover:bg-brand/20 hover:text-white'
                          : 'bg-white/[0.02] text-white/40'
                  }`}
                >
                  {letter}
                  {letter === 'I' && <span className="text-[8px] text-white/30">/J</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

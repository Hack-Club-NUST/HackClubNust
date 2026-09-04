import { SCALE, colHz, rowHz, type ScaleNote } from '../cipher';
import type { ActiveNote } from '../useCipherTunes';

interface NoteLadderProps {
  activeNote: ActiveNote | null;
  onPlay: (hz: number) => void;
  /** In ear mode nothing lights up — you get the sound and nothing else. */
  guided: boolean;
}

const NOTE_COLOR: Record<ScaleNote, string> = {
  C: 'bg-brand-coral',
  D: 'bg-brand',
  E: 'bg-brand-crimson',
  G: 'bg-amber-400',
  A: 'bg-emerald-400',
};

export default function NoteLadder({ activeNote, onPlay, guided }: NoteLadderProps) {
  const rows: Array<{ part: 'row' | 'col'; label: string; hz: (n: ScaleNote) => number }> = [
    { part: 'row', label: 'Row · low', hz: rowHz },
    { part: 'col', label: 'Column · high', hz: colHz },
  ];

  return (
    <div className="flex flex-col gap-3">
      {rows.map((line) => (
        <div key={line.part} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.14em] text-white/30">
            {line.label}
          </span>
          <div className="flex flex-1 gap-1.5">
            {SCALE.map((note) => {
              const active = guided && activeNote?.part === line.part && activeNote.note === note;
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => onPlay(line.hz(note))}
                  className={`relative h-9 flex-1 rounded-lg border text-[12px] transition-all ${
                    active
                      ? 'scale-105 border-white/60 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                  }`}
                  aria-label={`Play ${note} in the ${line.part} register`}
                >
                  <span
                    className={`absolute inset-x-2 bottom-1 h-[3px] rounded-full ${NOTE_COLOR[note]} ${
                      active ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

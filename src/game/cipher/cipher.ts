/**
 * Cipher Tunes uses a Polybius square rendered as music.
 *
 * Five pitches of a C major pentatonic scale index a 5x5 grid. Every letter is a
 * two-note motif: the first note names the row, the second names the column.
 * Pentatonic means no pair of notes can clash, so any word comes out as a melody.
 *
 * The row note plays low and the column note plays high (over an octave apart), so
 * a listener who joins late can still tell which half of a motif they are hearing.
 * I and J share a cell, exactly as in the paper cipher.
 */

export const SCALE = ['C', 'D', 'E', 'G', 'A'] as const;
export type ScaleNote = (typeof SCALE)[number];

export const GRID: string[][] = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'K'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
];

/** Base frequencies (octave 4). */
const BASE_HZ: Record<ScaleNote, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  G: 392.0,
  A: 440.0,
};

export const rowHz = (note: ScaleNote) => BASE_HZ[note] / 2;
export const colHz = (note: ScaleNote) => BASE_HZ[note] * 2;

export const ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

/** J folds onto I so the 26-letter alphabet fits 25 cells. */
export function normalise(letter: string): string {
  const upper = letter.toUpperCase();
  return upper === 'J' ? 'I' : upper;
}

export function cellOf(letter: string): [number, number] | null {
  const target = normalise(letter);
  for (let r = 0; r < GRID.length; r++) {
    const c = GRID[r].indexOf(target);
    if (c >= 0) return [r, c];
  }
  return null;
}

export function letterAt(row: number, col: number): string {
  return GRID[row]?.[col] ?? '';
}

export interface Motif {
  letter: string;
  row: number;
  col: number;
  rowNote: ScaleNote;
  colNote: ScaleNote;
}

export function motifFor(letter: string): Motif | null {
  const cell = cellOf(letter);
  if (!cell) return null;
  const [row, col] = cell;
  return {
    letter: normalise(letter),
    row,
    col,
    rowNote: SCALE[row],
    colNote: SCALE[col],
  };
}

export function encode(word: string): Motif[] {
  return [...word].map(motifFor).filter((m): m is Motif => m !== null);
}

export function decode(motifs: Motif[]): string {
  return motifs.map((m) => letterAt(m.row, m.col)).join('');
}

/* ------------------------------ tune building ----------------------------- */

export interface NoteEvent {
  hz: number;
  /** Seconds from the start of the tune. */
  at: number;
  duration: number;
  letterIndex: number;
  /** Which half of the motif this note is. */
  part: 'row' | 'col';
  note: ScaleNote;
}

export interface Tune {
  events: NoteEvent[];
  /** Total length in seconds, including the tail of the final note. */
  duration: number;
  letters: Motif[];
}

export interface TuneOptions {
  /** 1 = normal. Above 1 stretches everything, used by the slow-down hint. */
  stretch?: number;
}

const NOTE_S = 0.34;
const WITHIN_LETTER_GAP_S = 0.04;
const BETWEEN_LETTER_GAP_S = 0.26;

/** Deterministic: the same word always produces the same tune. */
export function buildTune(word: string, options: TuneOptions = {}): Tune {
  const stretch = options.stretch ?? 1;
  const noteS = NOTE_S * stretch;
  const withinGap = WITHIN_LETTER_GAP_S * stretch;
  const betweenGap = BETWEEN_LETTER_GAP_S * stretch;

  const letters = encode(word);
  const events: NoteEvent[] = [];
  let cursor = 0;

  letters.forEach((motif, index) => {
    events.push({
      hz: rowHz(motif.rowNote),
      at: cursor,
      duration: noteS,
      letterIndex: index,
      part: 'row',
      note: motif.rowNote,
    });
    cursor += noteS + withinGap;

    events.push({
      hz: colHz(motif.colNote),
      at: cursor,
      duration: noteS,
      letterIndex: index,
      part: 'col',
      note: motif.colNote,
    });
    cursor += noteS + betweenGap;
  });

  return {
    events,
    duration: Math.max(0, cursor - betweenGap + noteS * 0.5),
    letters,
  };
}

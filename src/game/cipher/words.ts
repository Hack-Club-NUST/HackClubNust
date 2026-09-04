/**
 * Word bank for the decode rounds. No J (it shares a cell with I, which would make
 * a word ambiguous to spell back), and nothing that needs a letter outside the grid.
 * Club and computing vocabulary first, because the players are a hack club.
 */
export const WORDS: Record<number, string[]> = {
  3: ['BIT', 'RAM', 'KEY', 'WEB', 'BUG', 'LOG', 'NET', 'HUB', 'MAP', 'RUN', 'ZIP', 'API'],
  4: [
    'HACK', 'CLUB', 'NUST', 'CODE', 'LOOP', 'BYTE', 'DATA', 'PORT',
    'ECHO', 'WAVE', 'FORK', 'GRID', 'TUNE', 'NOTE', 'HASH', 'ROOT',
  ],
  5: [
    'DEBUG', 'PIXEL', 'CACHE', 'QUERY', 'STACK', 'TOKEN', 'ARRAY', 'LOGIC',
    'MODEM', 'ROBOT', 'SOUND', 'TEMPO', 'MACRO', 'PATCH', 'SHELL',
  ],
  6: [
    'CIPHER', 'DECODE', 'SIGNAL', 'BINARY', 'PACKET', 'SERVER',
    'MEMORY', 'KERNEL', 'SCRIPT', 'PYTHON', 'MELODY', 'RHYTHM',
  ],
};

export function wordsOfLength(length: number): string[] {
  return WORDS[length] ?? [];
}

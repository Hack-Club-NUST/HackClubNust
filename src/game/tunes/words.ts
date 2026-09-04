import { LETTERS } from './alphabet';

/**
 * Only these seven letters have tunes, so the whole bank is drawn from
 * {A,G,H,L,M,O,R}. The system dictionary yields 276 candidates, but most are
 * unusable at a stall (AAL, AHO, GRA), so this is hand-picked for words a
 * first-year student will actually recognise the moment they see them.
 */
export const WORDS: Record<number, string[]> = {
  3: ['ARM', 'HAM', 'RAM', 'LOG', 'HOG', 'GAL', 'LAG', 'HAG', 'MAR', 'RAG', 'ALL', 'GAG', 'OAR'],
  4: ['GOAL', 'HALO', 'HARM', 'ROAM', 'ROAR', 'GRAM', 'GLAM', 'HALL', 'MALL', 'GALA', 'LOAM', 'AMMO'],
  5: ['ALARM', 'AROMA', 'ARMOR', 'GLOOM', 'MOLAR', 'MORAL', 'LLAMA', 'ALAMO'],
  6: ['AMORAL', 'MAMMAL', 'HORROR', 'GRAHAM'],
};

/** Guard against a typo in the bank shipping a word we cannot play. */
export function unplayableWords(): string[] {
  const set = new Set<string>(LETTERS);
  return Object.values(WORDS)
    .flat()
    .filter((w) => [...w].some((ch) => !set.has(ch)));
}

export const wordsOfLength = (n: number): string[] => WORDS[n] ?? [];

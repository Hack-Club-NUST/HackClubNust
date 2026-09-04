/** Remembers who is at the keyboard so returning players skip retyping. */
const KEY = 'hcnust_player';

export interface StoredPlayer {
  id: string;
  name: string;
  email: string;
}

export function loadPlayer(): StoredPlayer | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p?.id === 'string' && typeof p?.email === 'string' ? p : null;
  } catch {
    return null;
  }
}

export function savePlayer(player: StoredPlayer): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(player));
  } catch {
    /* storage unavailable — identity just won't persist */
  }
}

export function clearPlayer(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

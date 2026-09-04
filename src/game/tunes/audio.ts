import { LETTERS, LETTER_GAP_S, SIGNATURE_S, fullTuneUrl, signatureUrl, type Letter } from './alphabet';

type Cancel = () => void;

/**
 * Loads the seven letter signatures once, decodes them, and schedules words on
 * the audio clock.
 *
 * Scheduling through Web Audio rather than firing <audio> elements matters here:
 * a word is a sequence with exact gaps, and HTMLAudioElement start latency would
 * smear the boundaries the player is listening for. Visual highlights ride on
 * setTimeout — if those jitter the melody is unaffected.
 */
export class TuneBank {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<Letter, AudioBuffer>();
  private sources: AudioBufferSourceNode[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private fullAudio: HTMLAudioElement | null = null;

  get ready(): boolean {
    return this.buffers.size === LETTERS.length;
  }

  /** Must be called from a user gesture — browsers block audio otherwise. */
  async unlock(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return false;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 1;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return this.ctx.state === 'running';
    } catch {
      return false;
    }
  }

  async loadAll(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (!this.ctx) await this.unlock();
    const ctx = this.ctx;
    if (!ctx) throw new Error('Audio is not available in this browser.');

    let done = 0;
    await Promise.all(
      LETTERS.map(async (letter) => {
        if (!this.buffers.has(letter)) {
          const res = await fetch(signatureUrl(letter));
          if (!res.ok) throw new Error(`Could not load the tune for ${letter}.`);
          this.buffers.set(letter, await ctx.decodeAudioData(await res.arrayBuffer()));
        }
        done += 1;
        onProgress?.(done, LETTERS.length);
      })
    );
  }

  private schedule(letter: Letter, at: number): void {
    const buffer = this.buffers.get(letter);
    if (!this.ctx || !this.master || !buffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.master);
    source.start(at);
    this.sources.push(source);
  }

  /** One letter on its own — the practice board and the reference strip. */
  playLetter(letter: Letter, onEnd?: () => void): Cancel {
    if (!this.ctx) return () => {};
    this.stop();
    this.schedule(letter, this.ctx.currentTime + 0.02);
    this.timers.push(setTimeout(() => onEnd?.(), SIGNATURE_S * 1000 + 60));
    return () => this.stop();
  }

  /**
   * Plays a word as one melody. onLetter fires as each letter begins so the UI
   * can light up the matching slot, which is how players learn the mapping.
   */
  playWord(
    word: string,
    handlers: { onLetter?: (index: number) => void; onEnd?: () => void } = {}
  ): Cancel {
    if (!this.ctx) return () => {};
    this.stop();

    const start = this.ctx.currentTime + 0.06;
    const step = SIGNATURE_S + LETTER_GAP_S;

    [...word].forEach((ch, i) => {
      const letter = ch as Letter;
      if (!this.buffers.has(letter)) return;
      this.schedule(letter, start + i * step);
      this.timers.push(setTimeout(() => handlers.onLetter?.(i), (0.06 + i * step) * 1000));
    });

    const total = word.length * SIGNATURE_S + Math.max(0, word.length - 1) * LETTER_GAP_S;
    this.timers.push(
      setTimeout(() => {
        handlers.onLetter?.(-1);
        handlers.onEnd?.();
      }, (total + 0.15) * 1000)
    );

    return () => this.stop();
  }

  /** The original ~10s recording, streamed rather than decoded — practice only. */
  playFull(letter: Letter, onEnd?: () => void): Cancel {
    this.stopFull();
    const audio = new Audio(fullTuneUrl(letter));
    this.fullAudio = audio;
    audio.addEventListener('ended', () => onEnd?.(), { once: true });
    void audio.play().catch(() => onEnd?.());
    return () => this.stopFull();
  }

  stopFull(): void {
    if (this.fullAudio) {
      this.fullAudio.pause();
      this.fullAudio.currentTime = 0;
      this.fullAudio = null;
    }
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already finished */
      }
    }
    this.sources = [];
    this.stopFull();
  }

  dispose(): void {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.buffers.clear();
  }
}

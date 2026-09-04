import type { Tune } from './cipher';

/**
 * Every sound in Cipher Tunes is synthesised at play time — no audio files.
 *
 * Sampled instruments would need 25 pitch-accurate letters plus licensing, would
 * add megabytes, and could drift out of tune with each other. Two oscillators and
 * an envelope give an exact frequency, instant playback, and nothing to ship.
 *
 * Browsers block audio until a user gesture, so unlock() must be called from a
 * click before anything will sound.
 */
export class TuneEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private voices: { osc: OscillatorNode[]; gain: GainNode }[] = [];

  /** Call from a click handler. Safe to call repeatedly. */
  async unlock(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return false;
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return this.ctx.state === 'running';
    } catch {
      return false;
    }
  }

  get available(): boolean {
    return this.ctx?.state === 'running';
  }

  /** A struck-bell voice: fundamental, an octave shimmer, and a triangle body. */
  private strike(hz: number, at: number, duration: number, level = 0.22): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;

    const gain = ctx.createGain();
    gain.connect(this.master);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(hz * 6, 7000);
    filter.connect(gain);

    const specs: Array<[OscillatorType, number, number]> = [
      ['sine', 1, 1],
      ['sine', 2, 0.28],
      ['triangle', 1, 0.18],
    ];

    const oscs = specs.map(([type, mult, amp]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = hz * mult;
      const g = ctx.createGain();
      g.gain.value = amp;
      osc.connect(g).connect(filter);
      osc.start(at);
      osc.stop(at + duration + 0.35);
      return osc;
    });

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration + 0.28);

    this.voices.push({ osc: oscs, gain });
  }

  /** Soft low drone under a word so it reads as music rather than test tones. */
  private pad(at: number, duration: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.connect(this.master);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 65.41; // C2
    osc.connect(gain);
    osc.start(at);
    osc.stop(at + duration + 0.6);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.05, at + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration + 0.5);

    this.voices.push({ osc: [osc], gain });
  }

  /** One note on its own, for the reference grid. */
  playNote(hz: number, duration = 0.5): void {
    if (!this.ctx) return;
    this.strike(hz, this.ctx.currentTime + 0.01, duration);
  }

  /**
   * Schedules a whole tune. onNote/onLetter fire in sync for the visual guide;
   * the returned function cancels playback.
   */
  playTune(
    tune: Tune,
    handlers: {
      onNote?: (letterIndex: number, part: 'row' | 'col') => void;
      onLetter?: (letterIndex: number) => void;
      onEnd?: () => void;
      withPad?: boolean;
    } = {}
  ): () => void {
    if (!this.ctx) return () => {};
    this.stop();

    const start = this.ctx.currentTime + 0.08;
    if (handlers.withPad !== false) this.pad(start, tune.duration);

    for (const event of tune.events) {
      this.strike(event.hz, start + event.at, event.duration);

      const delay = (event.at + 0.08) * 1000;
      this.timers.push(
        setTimeout(() => {
          handlers.onNote?.(event.letterIndex, event.part);
          if (event.part === 'row') handlers.onLetter?.(event.letterIndex);
        }, delay)
      );
    }

    this.timers.push(setTimeout(() => handlers.onEnd?.(), (tune.duration + 0.4) * 1000));
    return () => this.stop();
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    for (const voice of this.voices) {
      try {
        voice.gain.gain.cancelScheduledValues(this.ctx?.currentTime ?? 0);
        voice.gain.disconnect();
        voice.osc.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
      } catch {
        /* node already torn down */
      }
    }
    this.voices = [];
  }

  dispose(): void {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}

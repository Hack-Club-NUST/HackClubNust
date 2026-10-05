/**
 * The club soundtrack: a small synthwave loop played live by the Web Audio
 * API. No file to download — it is four chords, a bass, an arpeggio and a
 * half-time beat, scheduled a few milliseconds ahead of the audio clock.
 *
 * The hero scrubs its video with the mouse; the soundtrack listens to the same
 * hand. `setBrightness` (0–1, from the pointer's x) opens the pads' filter and
 * the arpeggio's, so moving across the page brightens the sound.
 *
 * Nothing is created until `play()` runs inside a click — browsers only allow
 * audio to start from a user gesture, and visitors who never press play never
 * pay for an AudioContext.
 */

const BPM = 90;
const EIGHTH = 60 / BPM / 2;
const STEPS_PER_CHORD = 16; // two bars of eighths
const LOOKAHEAD = 0.12; // seconds of audio scheduled ahead of the clock
const TICK_MS = 25;

/** A minor, synthwave-style: Am9 → Fmaj7 → Cmaj7 → Em7. MIDI note numbers. */
const CHORDS = [
  { bass: 45, pad: [57, 60, 64, 67, 71] },
  { bass: 41, pad: [53, 57, 60, 64] },
  { bass: 48, pad: [55, 60, 64, 71] },
  { bass: 40, pad: [52, 55, 59, 62] },
];

/** Which chord tone the arpeggio plays on each eighth, an octave up. */
const ARP = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

type Listener = () => void;

class Soundtrack {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private analyser!: AnalyserNode;
  private padFilter!: BiquadFilterNode;
  private arpFilter!: BiquadFilterNode;
  private reverbSend!: GainNode;
  private delaySend!: GainNode;
  private noise!: AudioBuffer;

  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private stopTimer: number | null = null;

  private playing = false;
  private listeners = new Set<Listener>();

  /* ------------------------------ public API ------------------------------ */

  isPlaying = () => this.playing;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  toggle = () => (this.playing ? this.pause() : this.play());

  play = () => {
    if (this.playing) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.stopTimer !== null) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    void ctx.resume();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.55, now + 1.6);
    // restart on a chord boundary so it never comes back mid-phrase
    this.step = Math.ceil(this.step / STEPS_PER_CHORD) * STEPS_PER_CHORD;
    this.nextTime = now + 0.08;
    if (this.timer === null) this.timer = window.setInterval(this.tick, TICK_MS);
    this.setPlaying(true);
  };

  pause = () => {
    if (!this.playing || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 1.2);
    this.setPlaying(false);
    // let the fade and the reverb tail finish, then stop scheduling and sleep
    this.stopTimer = window.setTimeout(() => {
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
      this.stopTimer = null;
      void ctx.suspend();
    }, 1400);
  };

  /** 0 = dark and muffled, 1 = open and bright. Smoothed on the audio clock. */
  setBrightness = (value: number) => {
    if (!this.ctx || !this.playing) return;
    const v = Math.min(Math.max(value, 0), 1);
    const t = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(500 + v * 2600, t, 0.25);
    this.arpFilter.frequency.setTargetAtTime(1200 + v * 4800, t, 0.25);
  };

  /** Fills `out` with the current spectrum (for the button's level bars). */
  levels = (out: Uint8Array<ArrayBuffer>) => {
    if (this.ctx) this.analyser.getByteFrequencyData(out);
    return out;
  };

  /* ------------------------------- internals ------------------------------ */

  private setPlaying(next: boolean) {
    this.playing = next;
    this.listeners.forEach((fn) => fn());
  }

  private ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    this.ctx = ctx;

    // master → gentle compressor → analyser → speakers
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);

    // a long, dark room
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.2, 2.6);
    const reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.42;
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(reverb).connect(reverbReturn).connect(this.master);

    // a dotted-eighth echo for the arpeggio, darkened on each repeat
    const delay = ctx.createDelay(2);
    delay.delayTime.value = EIGHTH * 1.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    this.delaySend = ctx.createGain();
    this.delaySend.connect(delay);
    delay.connect(tone).connect(feedback).connect(delay);
    tone.connect(this.master);
    tone.connect(this.reverbSend);

    // pad bus, with a slow breathing filter
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 1100;
    this.padFilter.Q.value = 0.8;
    this.padFilter.connect(this.master);
    this.padFilter.connect(this.reverbSend);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 260;
    lfo.connect(lfoDepth).connect(this.padFilter.frequency);
    lfo.start();

    this.arpFilter = ctx.createBiquadFilter();
    this.arpFilter.type = 'lowpass';
    this.arpFilter.frequency.value = 2600;
    this.arpFilter.connect(this.master);
    this.arpFilter.connect(this.delaySend);
    this.arpFilter.connect(this.reverbSend);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    // the hand that scrubs the hero video also opens the filter
    let frame = 0;
    let x = 0.5;
    window.addEventListener(
      'pointermove',
      (e) => {
        x = e.clientX / window.innerWidth;
        if (!frame)
          frame = requestAnimationFrame(() => {
            frame = 0;
            this.setBrightness(x);
          });
      },
      { passive: true }
    );

    // be polite in a background tab
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (this.playing) void this.ctx.resume();
    });

    return ctx;
  }

  private impulse(ctx: AudioContext, seconds: number, decay: number) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
    return buffer;
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      this.schedule(this.step, this.nextTime);
      this.nextTime += EIGHTH;
      this.step++;
    }
  };

  private schedule(step: number, t: number) {
    const inChord = step % STEPS_PER_CHORD;
    const chord = CHORDS[Math.floor(step / STEPS_PER_CHORD) % CHORDS.length];
    const inBar = step % 8;

    if (inChord === 0) {
      const length = STEPS_PER_CHORD * EIGHTH;
      chord.pad.forEach((n) => this.pad(hz(n), t, length));
      this.bass(hz(chord.bass), t, length);
    }

    const tone = chord.pad[ARP[inChord] % chord.pad.length];
    this.arp(hz(tone + 12), t, 0.75 + Math.random() * 0.25);

    if (inBar === 0) this.kick(t);
    if (inBar === 4) this.snare(t);
    this.hat(t, inBar % 2 === 1 ? 1 : 0.55);
  }

  private pad(freq: number, t: number, length: number) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.045, t + 1.4);
    env.gain.setValueAtTime(0.045, t + length - 0.2);
    env.gain.linearRampToValueAtTime(0, t + length + 1.8);
    env.connect(this.padFilter);
    for (const cents of [-8, 7]) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = cents;
      osc.connect(env);
      osc.start(t);
      osc.stop(t + length + 2);
    }
  }

  private bass(freq: number, t: number, length: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.2, t + 0.08);
    env.gain.setValueAtTime(0.2, t + length - 0.15);
    env.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }

  private arp(freq: number, t: number, velocity: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.06 * velocity, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(env).connect(this.arpFilter);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.32, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  private snare(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1700;
    band.Q.value = 0.7;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.11, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    src.connect(band).connect(env);
    env.connect(this.master);
    env.connect(this.reverbSend);
    src.start(t);
    src.stop(t + 0.25);
  }

  private hat(t: number, accent: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const high = ctx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 7500;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.028 * accent, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(high).connect(env).connect(this.master);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.06);
  }
}

/** One soundtrack for the whole page, so the hero button and the dock agree. */
export const soundtrack = new Soundtrack();

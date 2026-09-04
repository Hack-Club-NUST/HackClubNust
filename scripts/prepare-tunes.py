#!/usr/bin/env python3
"""
Turn raw letter recordings into the assets Cipher Tunes plays.

    python3 scripts/prepare-tunes.py <folder-of-recordings> [--dur 2.5]

Input:  one file per letter named like "Letter A.mp3" (case-insensitive).
Output: public/game/tunes/<L>.mp3       2.5s signature, loudness-normalised
        public/game/tunes/<L>-full.mp3  whole recording, same loudness
        public/game/tunes/SOURCE.json   which window was taken from each source

Why a signature instead of the whole recording: the club's takes are ~10s each,
so a five-letter word would be 50 seconds of audio per listen. The script scores
every candidate window on how little its pitch content resembles the OTHER
letters and keeps the most distinctive one, which is what stops letters blurring
together. On the first seven letters this halved average confusability.

Loudness matters as much: the raw takes ranged from -16 dB to -45 dB mean, so one
letter was inaudible beside another. Everything is normalised to -16 LUFS.

Requires: ffmpeg, ffprobe, numpy.
"""
import argparse, glob, json, os, re, subprocess, sys, wave
import numpy as np

SR = 22050

def decode(path):
    tmp = "/tmp/_tune_probe.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "quiet", "-i", path, "-ac", "1", "-ar", str(SR), tmp], check=True)
    with wave.open(tmp) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

def chroma(a):
    n, hop = 4096, 2048
    bins = np.fft.rfftfreq(n, 1 / SR)
    with np.errstate(divide="ignore"):
        midi = np.where(bins > 0, 69 + 12 * np.log2(np.maximum(bins, 1e-9) / 440), -1)
    pc = np.where(midi >= 24, np.mod(np.round(midi), 12), -1).astype(int)
    out = np.zeros(12)
    for i in range(0, max(1, len(a) - n), hop):
        mag = np.abs(np.fft.rfft(a[i:i + n] * np.hanning(n)))
        for k in range(12):
            m = pc == k
            if m.any():
                out[k] += mag[m].sum()
    s = out.sum()
    return out / s if s else out

def unit(v):
    n = np.linalg.norm(v)
    return v / n if n else v

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("--dur", type=float, default=2.5)
    ap.add_argument("--out", default="public/game/tunes")
    args = ap.parse_args()

    sources = {}
    for p in glob.glob(os.path.join(args.folder, "*.mp3")):
        m = re.search(r"letter\s*([a-z])", os.path.basename(p), re.I)
        if m:
            sources[m.group(1).upper()] = p
    if not sources:
        sys.exit(f"No files named like 'Letter A.mp3' found in {args.folder}")

    print(f"Found {len(sources)} letters: {' '.join(sorted(sources))}")
    audio = {L: decode(p) for L, p in sorted(sources.items())}
    full = {L: chroma(a) for L, a in audio.items()}

    os.makedirs(args.out, exist_ok=True)
    picks = {}
    for L, a in audio.items():
        others = [unit(full[o]) for o in audio if o != L]
        best = None
        for start in np.arange(0, max(0.01, len(a) / SR - args.dur) + 1e-9, 0.25):
            seg = a[int(start * SR):int((start + args.dur) * SR)]
            if len(seg) < args.dur * SR * 0.9:
                continue
            c = unit(chroma(seg))
            sim = max((float(c @ o) for o in others), default=0.0)
            rms = float(np.sqrt((seg ** 2).mean()))
            score = (1 - sim) + 0.35 * min(rms / 0.12, 1.0)
            if best is None or score > best[0]:
                best = (score, float(start), sim)
        picks[L] = {"start": round(best[1], 2), "dur": args.dur}
        print(f"  {L}: {best[1]:.2f}-{best[1]+args.dur:.2f}s  distinctiveness {1-best[2]:.3f}")

        src = sources[L]
        subprocess.run(["ffmpeg", "-y", "-v", "quiet", "-ss", str(best[1]), "-t", str(args.dur), "-i", src,
                        "-af", f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.02,"
                               f"afade=t=out:st={args.dur-0.06:.2f}:d=0.06",
                        "-ar", "44100", "-ac", "2", "-b:a", "128k", f"{args.out}/{L}.mp3"], check=True)
        subprocess.run(["ffmpeg", "-y", "-v", "quiet", "-i", src,
                        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ar", "44100", "-ac", "2", "-b:a", "96k", f"{args.out}/{L}-full.mp3"], check=True)

    json.dump(picks, open(f"{args.out}/SOURCE.json", "w"), indent=1)
    print(f"\nWrote {len(picks)*2} files to {args.out}")
    print("Now add the new letters to LETTERS in src/game/tunes/alphabet.ts,")
    print("give them colours in LETTER_COLOR, and extend the bank in words.ts.")

if __name__ == "__main__":
    main()

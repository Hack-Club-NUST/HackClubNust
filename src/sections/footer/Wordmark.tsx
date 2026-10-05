import { useEffect, useRef, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * The footer's toy: a full-bleed Anton SC `HACK CLUB NUST` signature cut by the
 * page's bottom edge. Letters within reach of the pointer turn to noise and decode
 * as the pointer moves on; a tap on a word (touch) runs a one-shot left-to-right
 * wave over it. Everything in the hot path is refs + direct DOM writes — no React
 * state — and the rAF loop only runs while the footer is on screen and something
 * is actually moving.
 */

type Letter = {
  el: HTMLSpanElement;
  node: Text;
  ch: string;
  word: number;
  cx: number;
  top: number;
  bottom: number;
  hot: boolean;
  settle: number;
  /** tick index at which a tap wave releases this letter; -1 = no wave */
  waveAt: number;
};

type WordBox = { left: number; right: number; top: number; bottom: number };

// Uppercase only: Anton SC is a small-caps face, lowercase would read as a size change.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_=+*';
const LIT = 'rgba(244,241,236,0.30)';
const SETTLE_TICKS = 3;
const WAVE_STEP = 4;
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const LETTER =
  'inline-block text-center text-fg/[0.08] transition-colors duration-[180ms] motion-reduce:hover:text-fg/30';

function Word({ text }: { text: string }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {text.split('').map((ch, i) => (
        <span key={i} data-letter="" className={LETTER}>
          {ch}
        </span>
      ))}
    </span>
  );
}

function Space({ className = '' }: { className?: string }) {
  return <span className={`inline-block w-[0.234em] ${className}`} />;
}

interface WordmarkProps {
  rootRef: RefObject<HTMLElement | null>;
  active: boolean;
  className?: string;
}

export default function Wordmark({ rootRef, active, className = '' }: WordmarkProps) {
  const reduce = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);

  // Imperative handles the effect below installs; kept in refs so the `active`
  // prop can start/stop the loop without re-running the setup.
  const startRef = useRef<() => void>(() => {});
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    activeRef.current = active;
    if (active) startRef.current();
    else stopRef.current();
  }, [active]);

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    const field = fieldRef.current;
    const block = blockRef.current;
    if (!root || !field || !block) return;

    const spans = Array.from(block.querySelectorAll<HTMLSpanElement>('[data-letter]'));
    const words = Array.from(block.children).filter((c) => c.querySelector('[data-letter]'));
    const letters: Letter[] = spans.map((el) => ({
      el,
      node: el.firstChild as Text,
      ch: el.textContent ?? '',
      word: words.findIndex((w) => w.contains(el)),
      cx: 0,
      top: 0,
      bottom: 0,
      hot: false,
      settle: 0,
      waveAt: -1,
    }));
    const wordBoxes: WordBox[] = words.map(() => ({ left: 0, right: 0, top: 0, bottom: 0 }));
    let em = 100;

    const pointer = { x: 0, y: 0, inside: false };
    let tap: { x: number; y: number; t: number } | null = null;
    let raf: number | null = null;
    let frame = 0;
    let tick = 0;

    const rest = (L: Letter) => {
      L.node.nodeValue = L.ch;
      L.el.style.color = '';
      L.hot = false;
      L.settle = 0;
      L.waveAt = -1;
    };
    const restoreAll = () => letters.forEach(rest);

    const measure = () => {
      restoreAll();
      em = parseFloat(getComputedStyle(block).fontSize) || em;
      for (const L of letters) L.el.style.width = '';
      const widths = letters.map((L) => L.el.getBoundingClientRect().width);
      // Width in em so the slot scales with the clamp()/vw font size between measures.
      letters.forEach((L, i) => {
        L.el.style.width = `${widths[i] / em}em`;
      });
      const rr = root.getBoundingClientRect();
      letters.forEach((L) => {
        const r = L.el.getBoundingClientRect();
        L.cx = r.left + r.width / 2 - rr.left;
        L.top = r.top - rr.top;
        L.bottom = r.bottom - rr.top;
      });
      words.forEach((w, i) => {
        const r = w.getBoundingClientRect();
        wordBoxes[i] = {
          left: r.left - rr.left,
          right: r.right - rr.left,
          top: r.top - rr.top,
          bottom: r.bottom - rr.top,
        };
      });
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      frame++;
      if (frame % 2) return; // every 2nd frame ≈ 33ms, ScrambleText's cadence

      const rr = root.getBoundingClientRect();
      const px = pointer.x - rr.left;
      const py = pointer.y - rr.top;
      const reachX = 0.6 * em;
      const reachY = 0.15 * em;
      let busy = pointer.inside;

      for (const L of letters) {
        const inWave = L.waveAt >= 0 && tick < L.waveAt;
        const near =
          pointer.inside &&
          Math.abs(px - L.cx) < reachX &&
          py > L.top - reachY &&
          py < L.bottom + reachY;
        if (near || inWave) {
          L.node.nodeValue = rnd();
          L.el.style.color = LIT;
          L.hot = true;
          L.settle = SETTLE_TICKS;
        } else if (L.hot) {
          if (--L.settle > 0) L.node.nodeValue = rnd();
          else rest(L);
        }
        if (L.hot) busy = true;
      }
      tick++;

      if (!busy) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const start = () => {
      if (raf === null && activeRef.current) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      restoreAll();
    };
    startRef.current = start;
    stopRef.current = stop;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      if (raf === null) start();
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    const onDown = (e: PointerEvent) => {
      tap = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') pointer.inside = false; // the finger is gone
      const t = tap;
      tap = null;
      if (!t || e.pointerType !== 'touch') return;
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) > 8 || performance.now() - t.t > 300) return;
      const rr = root.getBoundingClientRect();
      const px = e.clientX - rr.left;
      const py = e.clientY - rr.top;
      const w = wordBoxes.findIndex(
        (b) => px >= b.left && px <= b.right && py >= b.top && py <= b.bottom,
      );
      if (w < 0) return;
      letters
        .filter((L) => L.word === w)
        .forEach((L, i) => {
          L.waveAt = tick + WAVE_STEP * (i + 1);
        });
      start();
    };
    const onCancel = () => {
      tap = null;
      pointer.inside = false;
    };

    let alive = true;
    document.fonts.ready.then(() => {
      if (alive) measure();
    });
    // Field resizes on viewport / md line break; root resizes when the ledger above
    // reflows (which moves the wordmark inside the footer); a late webfont changes widths.
    const ro = new ResizeObserver(() => measure());
    ro.observe(field);
    ro.observe(root);
    document.fonts.addEventListener('loadingdone', measure);

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave, { passive: true });
    root.addEventListener('pointerdown', onDown, { passive: true });
    root.addEventListener('pointerup', onUp, { passive: true });
    root.addEventListener('pointercancel', onCancel, { passive: true });

    return () => {
      alive = false;
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
      ro.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      restoreAll();
      for (const L of letters) L.el.style.width = '';
      startRef.current = () => {};
      stopRef.current = () => {};
    };
  }, [reduce, rootRef]);

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      className={`${className} select-none overflow-visible px-4 text-left md:px-0 md:text-center`}
    >
      <div
        ref={blockRef}
        className="-mb-[0.26em] block font-display text-[22vw] uppercase leading-[0.9] tracking-[-0.02em] md:whitespace-nowrap md:text-[clamp(64px,13vw,210px)] md:leading-none"
      >
        <Word text="HACK" />
        <Space />
        <Word text="CLUB" />
        <Space className="hidden md:inline-block" />
        <br className="md:hidden" />
        <Word text="NUST" />
      </div>
    </div>
  );
}

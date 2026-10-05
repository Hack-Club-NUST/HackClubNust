import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  DOT_COUNT,
  clamp,
  easeInOutCubic,
  layoutField,
  leaderGeometry,
  lensParams,
  pickShape,
  smoothstep,
  type Field,
  type Leader,
} from './field';

/* Canvas colours, mirrored from the tokens (spec §5). */
const PAPER = '#F2EDE4'; // paper
const PEN = 'rgb(20,17,20)'; // pen, alpha via globalAlpha
const DOT_ALPHA = 0.42;
const LINE = 'rgba(20,17,20,0.32)'; // line-paper-strong
const RED = '#C9303F'; // brand.deep
const HALO = 'rgba(237,74,82,0.18)'; // shadow-led's outer ring

const TAU = Math.PI * 2;
const SWEEP_MS = 1400;
const PULSE_MS = 2400;

type Mode = 'wait' | 'sweep' | 'follow' | 'home';

/**
 * The About toy: 1,500 dots, one for each Hack Club, one of them red. The
 * pointer is a loupe: dots under the glass swell, darken and bulge outward.
 * On first view the glass sweeps in, finds the red dot and parks on it; when
 * the pointer leaves it glides home. Reduced motion: a flat, static field.
 */
export default function DotField() {
  const reduce = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!frame || !canvas || !label) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const mq = window.matchMedia('(min-width: 640px)');
    const lensed = new Int16Array(DOT_COUNT);

    let cssW = 0;
    let cssH = 0;
    let R = 0;
    let r0 = 0;
    let rr = 0;
    let field: Field | null = null;
    let leader: Leader | null = null;
    let rx = 0;
    let ry = 0;

    const lens = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let mode: Mode = 'wait';
    let sweepStart = 0;
    let swept = false;
    let hasPointer = false;
    let lastT = 0;
    let raf = 0;
    let active = false;
    let running = false;
    let lastNear = false;

    const startX = () => -R - 12;
    const startY = () => cssH * 0.55;

    /* ------------------------------ paint ------------------------------ */
    const paint = (t: number, withLens: boolean) => {
      if (!field || !leader) return;
      const { x, y, red } = field;
      const n = x.length;
      const R2 = R * R;
      const lx = lens.x;
      const ly = lens.y;

      ctx.globalAlpha = 1;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, cssW, cssH);

      // every plain dot in one path
      let m = 0;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (i === red) continue;
        const xi = x[i];
        const yi = y[i];
        if (withLens) {
          const dx = xi - lx;
          const dy = yi - ly;
          if (dx * dx + dy * dy < R2) {
            lensed[m++] = i;
            continue;
          }
        }
        ctx.moveTo(xi + r0, yi);
        ctx.arc(xi, yi, r0, 0, TAU);
      }
      ctx.fillStyle = PEN;
      ctx.globalAlpha = DOT_ALPHA;
      ctx.fill();

      // dots under the glass: swell, darken, bulge toward the rim
      for (let k = 0; k < m; k++) {
        const i = lensed[k];
        const dx = x[i] - lx;
        const dy = y[i] - ly;
        const d = Math.sqrt(dx * dx + dy * dy);
        const e = smoothstep(1 - d / R);
        let px = x[i];
        let py = y[i];
        if (d > 0) {
          const d2 = d + (R - d) * (d / R) * 0.45;
          px = lx + (dx / d) * d2;
          py = ly + (dy / d) * d2;
        }
        ctx.globalAlpha = DOT_ALPHA + 0.5 * e;
        ctx.beginPath();
        ctx.arc(px, py, r0 * (1 + 1.5 * e), 0, TAU);
        ctx.fill();
      }

      // the red dot: Hack Club NUST
      let prx = rx;
      let pry = ry;
      let redE = 0;
      if (withLens) {
        const dx = rx - lx;
        const dy = ry - ly;
        const dd = dx * dx + dy * dy;
        if (dd < R2) {
          const d = Math.sqrt(dd);
          redE = smoothstep(1 - d / R);
          if (d > 0) {
            const d2 = d + (R - d) * (d / R) * 0.45;
            prx = lx + (dx / d) * d2;
            pry = ly + (dy / d) * d2;
          }
        }
      }
      const ph = withLens ? 0.5 - 0.5 * Math.cos((TAU * (t % PULSE_MS)) / PULSE_MS) : 0;
      const rad = rr * (1 - 0.15 * ph) * (1 + 1.5 * redE);

      // leader: starts just outside the halo, diagonal to the elbow, then a short run
      const s = leader.side === 'right' ? 1 : -1;
      const off = (rad + 5) * Math.SQRT1_2;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(prx + s * off, pry - off);
      ctx.lineTo(leader.elbow.x, leader.elbow.y);
      ctx.lineTo(leader.end.x, leader.end.y);
      ctx.stroke();

      ctx.fillStyle = HALO;
      ctx.beginPath();
      ctx.arc(prx, pry, rad + 3, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1 - 0.45 * ph;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(prx, pry, rad, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (!withLens) return;

      // the glass: hairline ring + four viewfinder ticks
      ctx.beginPath();
      ctx.arc(lx, ly, R, 0, TAU);
      ctx.moveTo(lx + R + 4, ly);
      ctx.lineTo(lx + R + 10, ly);
      ctx.moveTo(lx - R - 4, ly);
      ctx.lineTo(lx - R - 10, ly);
      ctx.moveTo(lx, ly + R + 4);
      ctx.lineTo(lx, ly + R + 10);
      ctx.moveTo(lx, ly - R - 4);
      ctx.lineTo(lx, ly - R - 10);
      ctx.lineCap = 'butt';
      ctx.stroke();

      // label brightens while the glass is over NUST (DOM write only on change)
      const ndx = lx - rx;
      const ndy = ly - ry;
      const near = ndx * ndx + ndy * ndy < R2;
      if (near !== lastNear) {
        lastNear = near;
        label.dataset.near = String(near);
      }
    };

    /* ------------------------------ motion ----------------------------- */
    const step = (t: number) => {
      const dt = clamp(t - lastT, 0, 50);
      lastT = t;
      if (mode === 'wait') {
        lens.x = startX();
        lens.y = startY();
      } else if (mode === 'sweep') {
        const u = clamp((t - sweepStart) / SWEEP_MS, 0, 1);
        const e = easeInOutCubic(u);
        const sx = startX();
        const sy = startY();
        lens.x = sx + (rx - sx) * e;
        lens.y = sy + (ry - sy) * e + Math.sin(e * Math.PI) * (-0.12 * cssH);
        if (u >= 1) {
          mode = 'home';
          target.x = rx;
          target.y = ry;
        }
      } else {
        const base = mode === 'follow' ? 0.22 : 0.08;
        const k = 1 - Math.pow(1 - base, dt / 16.67);
        lens.x += (target.x - lens.x) * k;
        lens.y += (target.y - lens.y) * k;
      }
    };

    const dotFieldTick = (t: number) => {
      if (!active) {
        running = false;
        return;
      }
      step(t);
      paint(t, true);
      raf = requestAnimationFrame(dotFieldTick);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(dotFieldTick);
    };

    /* ------------------------------ layout ----------------------------- */
    const layout = () => {
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      if (!w || !h) return;
      cssW = w;
      cssH = h;
      const { cols, rows } = pickShape(mq.matches);
      const p = cssW / (cols + 4);
      ({ R, r0, rr } = lensParams(p));
      field = layoutField(cols, rows, p);
      rx = field.x[field.red];
      ry = field.y[field.red];

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      leader = leaderGeometry(rx, ry, cssW);
      Object.assign(label.style, leader.labelStyle);
      label.dataset.side = leader.side;

      if (mode === 'home') {
        target.x = rx;
        target.y = ry;
        lens.x = rx;
        lens.y = ry;
      } else if (mode === 'wait') {
        lens.x = startX();
        lens.y = startY();
      } else if (mode === 'follow') {
        lens.x = clamp(lens.x, 0, cssW);
        lens.y = clamp(lens.y, 0, cssH);
      }

      if (!running) paint(performance.now(), !reduce);
    };

    const ro = new ResizeObserver(layout);
    ro.observe(frame);
    layout();

    /* --------------------------- visibility ---------------------------- */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          active = entry.isIntersecting;
          if (!active && mode === 'sweep') {
            // scrolled away mid-sweep: on return, glide home from where it stopped
            mode = 'home';
            target.x = rx;
            target.y = ry;
          }
          if (!active || reduce) continue;
          start();
          if (!swept && entry.intersectionRatio >= 0.4) {
            swept = true;
            if (!hasPointer) {
              mode = 'sweep';
              sweepStart = performance.now();
            }
          }
        }
      },
      { threshold: [0, 0.4] },
    );
    io.observe(frame);

    if (reduce) {
      label.dataset.near = 'false';
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    /* ----------------------------- pointer ----------------------------- */
    const onMove = (e: PointerEvent) => {
      target.x = e.offsetX;
      target.y = e.offsetY;
      if (mode === 'wait') {
        // first contact before the sweep: the glass starts under the pointer
        lens.x = e.offsetX;
        lens.y = e.offsetY;
      }
      mode = 'follow';
      hasPointer = true;
      swept = true;
      if (active) start();
    };
    const goHome = () => {
      if (!field) return;
      target.x = rx;
      target.y = ry;
      mode = 'home';
    };
    const onLeave = (e: PointerEvent) => {
      // a finger "leaves" right after every tap; keep the glass where it was tapped
      if (e.pointerType === 'touch') return;
      goHome();
    };

    const opts: AddEventListenerOptions = { passive: true };
    frame.addEventListener('pointerdown', onMove, opts);
    frame.addEventListener('pointermove', onMove, opts);
    frame.addEventListener('pointerleave', onLeave, opts);
    frame.addEventListener('pointercancel', goHome, opts);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      active = false;
      ro.disconnect();
      io.disconnect();
      frame.removeEventListener('pointerdown', onMove);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointercancel', goHome);
    };
  }, [reduce]);

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label="A field of 1,500 dots, one for each Hack Club. One dot is red: Hack Club NUST, Islamabad, since 2021."
      className="card-ticks relative aspect-[54/34] w-full touch-pan-y rounded-[4px] border border-line-paper bg-paper text-pen sm:aspect-[64/29]"
    >
      <span className="card-ticks-alt" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full rounded-[3px]"
      />
      <span
        ref={labelRef}
        aria-hidden="true"
        data-near="false"
        className="group pointer-events-none absolute whitespace-nowrap rounded-[2px] bg-paper px-1 font-mono text-[11px] uppercase leading-[1.35] tracking-[0.14em] text-pen-3 transition-colors duration-200 data-[near=true]:text-pen"
      >
        <span className="group-data-[side=left]:block">NUST · Islamabad</span>
        <span className="group-data-[side=left]:hidden"> · </span>
        <span className="group-data-[side=left]:block">Since 2021</span>
      </span>
    </div>
  );
}

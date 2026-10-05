import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ORIENTATION } from '../../events';
import { formatTicketDate } from './format';
import { SPRING } from './motion';
import { useMediaQuery } from './useMediaQuery';

const MAX_TILT = 6; // degrees, each axis

/** A notch: a section-coloured disc that bites the ticket edge. Only the half inside the ticket shows. */
function Notch({ className, clip }: { className: string; clip: string }) {
  return (
    <span
      className={`absolute h-6 w-6 rounded-full border border-line bg-graphite ${className}`}
      style={{ clipPath: clip }}
    />
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-3">{label}</dt>
      <dd className="mt-1 font-mono text-[13px] uppercase tracking-[0.04em] text-fg">{value}</dd>
    </div>
  );
}

/** Orientation, "Up next": a ticket torn from the same graphite. Tilts toward a fine pointer. */
export default function Ticket({ onOpen }: { onOpen: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, SPRING);
  const rotateY = useSpring(ry, SPRING);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !finePointer) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const nx = ((last.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((last.clientY - r.top) / r.height - 0.5) * 2;
      ry.set(nx * MAX_TILT);
      rx.set(-ny * MAX_TILT);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rx.set(0);
      ry.set(0);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
      rx.set(0);
      ry.set(0);
    };
  }, [reduce, finePointer, rx, ry]);

  const credit = ORIENTATION.art.map((h) => `@${h}`).join(' · ');

  return (
    <div className="[perspective:1200px]">
      <motion.article
        ref={ref}
        aria-labelledby="events-ticket-title"
        className="card card-ticks relative !p-0 before:z-10 after:z-10"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', touchAction: 'pan-y' }}
      >
        <span className="card-ticks-alt before:z-10 after:z-10" aria-hidden="true" />

        <div className="grid rounded-[4px] lg:grid-cols-[minmax(0,1fr)_28px_minmax(0,1.4fr)]">
          {/* stub */}
          <div className="relative aspect-[6/5] overflow-hidden rounded-t-[3px] lg:aspect-auto lg:h-full lg:rounded-l-[3px] lg:rounded-tr-none">
            <img
              src={ORIENTATION.poster}
              alt="NHC Orientation 26–27 poster, Minecraft pixel art."
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* ADMIT ONE strip + seam (lg) */}
          <div
            aria-hidden="true"
            className="relative hidden items-center justify-center border-l border-dashed border-line-strong lg:flex"
          >
            <span className="rotate-180 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-fg-3 [writing-mode:vertical-rl]">
              Admit one · {ORIENTATION.date}
            </span>
            <Notch className="-top-[12.5px] left-[-0.5px] -translate-x-1/2" clip="inset(50% 0 0 0)" />
            <Notch className="-bottom-[12.5px] left-[-0.5px] -translate-x-1/2" clip="inset(0 0 50% 0)" />
          </div>

          {/* seam (below lg): horizontal */}
          <div aria-hidden="true" className="relative h-px border-t border-dashed border-line-strong lg:hidden">
            <Notch className="-left-[12.5px] top-1/2 -translate-y-1/2" clip="inset(0 0 0 50%)" />
            <Notch className="-right-[12.5px] top-1/2 -translate-y-1/2" clip="inset(0 50% 0 0)" />
          </div>

          {/* body */}
          <div className="flex min-w-0 flex-col gap-5 p-6 sm:p-8">
            <span className="tag tag-signal w-fit">Up next</span>
            <h3
              id="events-ticket-title"
              className="font-mono text-[clamp(22px,2.6vw,30px)] leading-tight tracking-[-0.02em] text-fg"
            >
              {ORIENTATION.name} {ORIENTATION.edition}
            </h3>
            <p className="max-w-[52ch] font-sans text-[16px] leading-[1.6] text-fg-2">{ORIENTATION.pitch}</p>

            <dl className="mt-1 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
              <Field label="Date" value={formatTicketDate(ORIENTATION.day, ORIENTATION.date)} />
              <Field label="Time" value={ORIENTATION.time} />
              <Field label="Venue" value={ORIENTATION.venue} />
              <Field label="Campus" value={ORIENTATION.campus} />
            </dl>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={onOpen} className="btn-secondary w-full sm:w-auto">
                See the details <i className="bi bi-arrow-right text-[12px]" aria-hidden="true" />
              </button>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-3">
                Poster art: {credit}
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

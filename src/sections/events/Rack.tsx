import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScrambleIn from '../../components/ScrambleIn';
import type { PILLARS } from '../../events';
import { DISPLAY_WORD } from './format';
import { EASE_INOUT } from './motion';
import { useMediaQuery } from './useMediaQuery';

type Pillar = (typeof PILLARS)[number];

const GAP = 8; // gap-2

/** Mounting holes on a 24px pitch, so they sit on the section's dot grid. */
const RAIL_STYLE = {
  backgroundImage: 'radial-gradient(circle, var(--tick) 1.5px, transparent 1.6px)',
  backgroundSize: '12px 24px',
  backgroundPosition: 'center 12px',
} as const;

/**
 * What the club runs, as a server rack of three blades. One is always open; on desktop
 * the open blade is four times as wide and its sideways spine becomes a headline.
 * WAI-APG accordion, single-expanded.
 */
export default function Rack({ pillars }: { pillars: typeof PILLARS }) {
  const [active, setActive] = useState(0);
  const [openWidth, setOpenWidth] = useState(0);
  const rackRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion() ?? false;

  const open = (i: number) => setActive(i);

  useEffect(() => {
    const el = rackRef.current;
    if (!el) return;
    const n = pillars.length;
    const measure = () => {
      const w = el.clientWidth;
      setOpenWidth(Math.floor(((w - (n - 1) * GAP) * 4) / (4 + (n - 1))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pillars.length]);

  function onHeaderKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const rack = rackRef.current;
    if (!rack) return;
    const buttons = Array.from(rack.querySelectorAll<HTMLButtonElement>('button[aria-controls]'));
    const idx = buttons.indexOf(e.currentTarget);
    const go = (n: number) => {
      e.preventDefault();
      buttons[(n + buttons.length) % buttons.length].focus();
    };
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        return go(idx + 1);
      case 'ArrowUp':
      case 'ArrowLeft':
        return go(idx - 1);
      case 'Home':
        return go(0);
      case 'End':
        return go(buttons.length - 1);
      case 'Enter':
      case ' ':
        e.preventDefault();
        open(idx);
        return;
    }
  }

  return (
    <div role="presentation" className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-5 bottom-0 top-0 hidden w-3 border-x border-line lg:block"
        style={RAIL_STYLE}
      />
      <span
        aria-hidden="true"
        className="absolute -right-5 bottom-0 top-0 hidden w-3 border-x border-line lg:block"
        style={RAIL_STYLE}
      />
      <div
        ref={rackRef}
        aria-label="What we run"
        className="flex flex-col gap-2 md:h-[480px] md:flex-row lg:h-[520px]"
        style={{ touchAction: 'pan-y' }}
      >
        {pillars.map((pillar, i) => (
          <RackUnit
            key={pillar.title}
            index={i}
            pillar={pillar}
            active={active === i}
            isDesktop={isDesktop}
            reduce={reduce}
            openWidth={openWidth}
            onOpen={() => open(i)}
            onHeaderKeyDown={onHeaderKeyDown}
          />
        ))}
      </div>
    </div>
  );
}

interface RackUnitProps {
  index: number;
  pillar: Pillar;
  active: boolean;
  isDesktop: boolean;
  reduce: boolean;
  openWidth: number;
  onOpen: () => void;
  onHeaderKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

function RackUnit({
  index: i,
  pillar,
  active,
  isDesktop,
  reduce,
  openWidth,
  onOpen,
  onHeaderKeyDown,
}: RackUnitProps) {
  const word = DISPLAY_WORD[pillar.title] ?? pillar.title.toUpperCase();
  const regionId = `events-pillar-${i}-region`;
  const btnId = `events-pillar-${i}-btn`;
  const stateTransition = reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_INOUT };

  return (
    <motion.div
      className="card card-ticks relative flex min-w-0 cursor-pointer flex-col !p-0 data-[active]:cursor-default"
      style={{ flexBasis: isDesktop ? 0 : 'auto', flexShrink: 1 }}
      initial={false}
      animate={{ flexGrow: isDesktop ? (active ? 4 : 1) : 0 }}
      transition={stateTransition}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') onOpen();
      }}
      onClick={onOpen}
      data-active={active || undefined}
    >
      <span className="card-ticks-alt" aria-hidden="true" />

      <h3 className="contents">
        <button
          type="button"
          id={btnId}
          aria-controls={regionId}
          aria-expanded={active}
          aria-disabled={active || undefined}
          aria-label={pillar.title}
          onKeyDown={onHeaderKeyDown}
          className="group flex h-16 w-full shrink-0 items-center justify-between px-5 text-left focus-visible:outline-offset-[-3px] md:absolute md:inset-x-0 md:top-0 md:z-10 md:h-14 md:px-6"
        >
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-fg-3">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="ml-4 flex-1 font-display text-[24px] uppercase leading-none tracking-[0.02em] text-fg md:sr-only">
            {word}
          </span>
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200 ${
              active ? 'bg-signal shadow-glow-signal' : 'bg-line-strong'
            }`}
          />
        </button>
      </h3>

      <div className="relative overflow-hidden rounded-b-[4px] md:absolute md:inset-0 md:rounded-[4px]">
        {isDesktop && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
            initial={false}
            animate={{ opacity: active ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          >
            <span className="font-display text-[clamp(28px,3.2vw,44px)] uppercase leading-none tracking-[0.04em] text-fg [writing-mode:vertical-rl]">
              {word}
            </span>
          </motion.span>
        )}

        <AnimatePresence initial={false}>
          {active &&
            (isDesktop ? (
              <motion.div
                key="region-desktop"
                id={regionId}
                role="region"
                aria-labelledby={btnId}
                className="absolute inset-0 flex flex-col justify-end p-6 pt-20 sm:p-8 sm:pt-20"
                style={{ width: openWidth || undefined }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: reduce ? 0 : 0.25, delay: reduce ? 0 : 0.2 },
                }}
                exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
              >
                <p
                  aria-hidden="true"
                  className="font-display text-[clamp(40px,5vw,72px)] uppercase leading-[0.9] tracking-[-0.01em] text-fg"
                >
                  {reduce ? word : <ScrambleIn text={word} delay={120} triggered />}
                </p>
                <p className="mt-6 max-w-[56ch] font-sans text-[16px] leading-[1.6] text-fg-2">
                  {pillar.body}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="region-mobile"
                id={regionId}
                role="region"
                aria-labelledby={btnId}
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={stateTransition}
              >
                <div className="px-5 pb-6">
                  <p className="max-w-prose font-sans text-[16px] leading-[1.6] text-fg-2">
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

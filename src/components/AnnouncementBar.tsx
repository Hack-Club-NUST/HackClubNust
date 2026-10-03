import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ORIENTATION_STARTS_AT } from '../orientation';

/* The slot shows one of these at a time. Keep the longest first: an invisible
   copy of it is what holds the slot's width while the others flip through. */
const MESSAGES = ['Orientation 26–27', '6 October 2026'];
const FLIP_EVERY = 2500;

const EASE = [0.215, 0.61, 0.355, 1.0] as const;

// the navbar's pill spring, so the hover pop bounces like the menu does
const popSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One digit that rolls: the old value leaves upward as the new one arrives
 * from below. An invisible copy keeps the box the width of a digit.
 */
function RollingDigit({ digit, roll }: { digit: string; roll: boolean }) {
  return (
    <span className="relative inline-block overflow-hidden">
      <span className="invisible">{digit}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={digit}
          className="absolute inset-0"
          initial={roll ? { y: '100%' } : { opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={roll ? { y: '-100%' } : { opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface AnnouncementBarProps {
  entranceComplete: boolean;
}

/**
 * The orientation headline: one solid red bar carrying what, when, and a live
 * countdown — nothing else. The headline and the date share a slot and flip
 * over like a departure board, the countdown's digits roll, a glow breathes
 * under the bar, and hovering pops the whole thing out. Display only. Sits
 * above the navbar (z-50) and below the game overlays (z-100), which cover it.
 */
export default function AnnouncementBar({ entranceComplete }: AnnouncementBarProps) {
  const [now, setNow] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const moving = !useReducedMotion();

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const flip = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), FLIP_EVERY);
    return () => {
      clearInterval(tick);
      clearInterval(flip);
    };
  }, []);

  const left = Math.max(ORIENTATION_STARTS_AT - now, 0);
  const parts = [
    { value: Math.floor(left / 86_400_000), unit: 'D' },
    { value: Math.floor(left / 3_600_000) % 24, unit: 'H' },
    { value: Math.floor(left / 60_000) % 60, unit: 'M' },
    { value: Math.floor(left / 1000) % 60, unit: 'S' },
  ];

  const headlineClass = 'font-display text-[22px] uppercase leading-none tracking-[0.04em] md:text-[30px]';

  return (
    <motion.aside
      aria-label="Announcement"
      className="fixed inset-x-0 top-0 z-[60] text-white"
      initial={{ y: -96 }}
      animate={{ y: entranceComplete ? 0 : -96 }}
      transition={{ duration: 0.8, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* the flipping text is noise to a screen reader; this is what it reads */}
      <p className="sr-only">Hack Club NUST Orientation 26–27 is on 6 October 2026.</p>

      <motion.div
        className="relative flex justify-center overflow-hidden bg-brand-grad px-4"
        animate={{ paddingTop: hovered ? 6 : 0, paddingBottom: hovered ? 6 : 0 }}
        transition={popSpring}
      >
        {/* a sheen crossing the red every few seconds */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/25 to-transparent motion-reduce:hidden"
        />

        <motion.div
          aria-hidden="true"
          className="relative flex h-14 items-center gap-4 md:h-16 md:gap-12"
          animate={{ scale: hovered ? 1.1 : 1 }}
          transition={popSpring}
        >
          {/* ---------------------------- flip slot ---------------------------- */}
          <div className="flex items-center gap-3.5">
            <span className="relative hidden h-2.5 w-2.5 md:block">
              <span className="absolute inset-0 animate-ping rounded-full bg-white motion-reduce:hidden" />
              <span className="absolute inset-0 rounded-full bg-white" />
            </span>

            <div className={`relative ${headlineClass}`} style={{ perspective: 600 }}>
              <span className="invisible whitespace-nowrap">{MESSAGES[0]}</span>
              <AnimatePresence initial={false}>
                <motion.span
                  key={index}
                  className="absolute inset-0 flex items-center whitespace-nowrap md:justify-center"
                  initial={moving ? { rotateX: -90, y: '45%', opacity: 0 } : { opacity: 0 }}
                  animate={{ rotateX: 0, y: 0, opacity: 1 }}
                  exit={moving ? { rotateX: 90, y: '-45%', opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {MESSAGES[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* ---------------------------- countdown ---------------------------- */}
          {left > 0 ? (
            <div className="flex items-center gap-2 text-[14px] font-bold tabular-nums md:gap-3.5 md:text-[20px]">
              {parts.map((part) => (
                // the narrowest phones lose the seconds so the row still fits
                <span
                  key={part.unit}
                  className={part.unit === 'S' ? 'hidden items-center min-[360px]:flex' : 'flex items-center'}
                >
                  {pad(part.value)
                    .split('')
                    .map((digit, i) => (
                      <RollingDigit key={i} digit={digit} roll={moving} />
                    ))}
                  <span className="text-white/60">{part.unit}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className={headlineClass}>Today</span>
          )}
        </motion.div>
      </motion.div>

      {/* the glow under the bar: it breathes on its own, and swells on hover */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-6 origin-top md:h-8"
        animate={{ scaleY: hovered ? 1.8 : 1, opacity: hovered ? 1 : 0.75 }}
        transition={popSpring}
      >
        <div className="h-full w-full animate-glow bg-gradient-to-b from-brand-crimson/70 to-transparent motion-reduce:animate-none" />
      </motion.div>
    </motion.aside>
  );
}

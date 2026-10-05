import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import { FollowCard, ReelCard } from './social/ReelCard';
import { EASE_OUT, HANDLE, INSTAGRAM, REELS } from './social/data';

// distance from the viewport edge to the wrap's content box (max-w-6xl, px-4 sm:px-6)
const GUTTER_PAD =
  'px-[max(1rem,calc((100vw-72rem)/2+1rem))] sm:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]';
const GUTTER_SNAP =
  'scroll-pl-[max(1rem,calc((100vw-72rem)/2+1rem))] sm:scroll-pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]';

/**
 * 06 — The club on Instagram. The latest reels as a row of phone-shaped cards,
 * dressed in Instagram's own reel chrome, each playing silently while it is on
 * screen. Every card — and the follow card at the end — opens the profile.
 */
export default function Social() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const h2InView = useInView(h2Ref, { once: true, amount: 0.6 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);

  // arrows: enabled only while there is somewhere to go
  const [edges, setEdges] = useState({ start: true, end: false });
  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setEdges({
      start: row.scrollLeft <= 4,
      end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 4,
    });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const row = rowRef.current;
    const card = row?.querySelector('a');
    if (!row || !card) return;
    row.scrollBy({ left: dir * (card.clientWidth + 16) * 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  const entrance = reduce
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.3 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  const arrow =
    'grid h-11 w-11 place-items-center rounded-full border border-pen/25 text-pen transition-colors duration-200 hover:border-pen hover:bg-pen hover:text-paper disabled:pointer-events-none disabled:opacity-30';

  return (
    <section
      id="social"
      ref={sectionRef}
      data-surface="paper"
      aria-labelledby="social-heading"
      className="section surface-paper [touch-action:pan-y]"
    >
      <div className="grid-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <motion.div
        aria-hidden="true"
        style={{ y: watermarkY }}
        className="pointer-events-none absolute right-[-0.03em] top-10 select-none font-display text-[clamp(72px,14vw,220px)] uppercase leading-[0.9] tracking-[-0.02em] text-pen opacity-[0.06] md:top-8"
      >
        REELS
      </motion.div>

      <div className="wrap relative">
        {/* header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p className="kicker-paper" {...entrance}>
              06 / On Instagram
            </motion.p>
            <h2
              id="social-heading"
              ref={h2Ref}
              className="mt-6 font-mono text-[clamp(32px,5.5vw,64px)] font-normal leading-[1.0] tracking-[-0.03em] text-pen"
            >
              <span className="sr-only">Straight from the feed.</span>
              <span aria-hidden="true" className="block">
                {reduce ? 'Straight from' : <ScrambleIn text="Straight from" delay={0} triggered={h2InView} />}
              </span>
              <span aria-hidden="true" className="block">
                {reduce ? 'the feed.' : <ScrambleIn text="the feed." delay={250} triggered={h2InView} />}
              </span>
            </h2>
          </div>

          <motion.div className="flex flex-col gap-5 md:max-w-sm md:items-end md:pb-1" {...entrance}>
            <p className="font-sans text-[17px] leading-[1.55] text-pen-2 sm:text-[19px] md:text-right">
              The hackathons, the events and the people, as the club posts them. Tap any reel to
              watch it with sound on Instagram.
            </p>
            <div className="flex items-center gap-3">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="btn-primary">
                <i className="bi bi-instagram text-[15px]" aria-hidden="true" />
                Follow @{HANDLE}
              </a>
              <div className="hidden items-center gap-2 md:flex">
                <button type="button" aria-label="Previous reels" className={arrow} disabled={edges.start} onClick={() => step(-1)}>
                  <i className="bi bi-arrow-left text-[15px]" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next reels" className={arrow} disabled={edges.end} onClick={() => step(1)}>
                  <i className="bi bi-arrow-right text-[15px]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* the row: full-bleed, snapping, gutters aligned with the wrap */}
        <motion.div className="mt-14 md:mt-16" {...entrance}>
          <div
            ref={rowRef}
            onScroll={measure}
            className={`-mx-[calc(50vw-50%)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [touch-action:pan-x_pan-y] [&::-webkit-scrollbar]:hidden ${GUTTER_SNAP}`}
          >
            <ul role="list" aria-label={`Latest reels from @${HANDLE}`} className={`flex w-max gap-4 pb-6 pt-1 ${GUTTER_PAD}`}>
              {REELS.map((reel) => (
                <li key={reel.id}>
                  <ReelCard reel={reel} />
                </li>
              ))}
              <li>
                <FollowCard />
              </li>
            </ul>
          </div>
        </motion.div>

        <div className="rule-paper mt-4" />
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-pen-3">
          <span>@{HANDLE} · Latest reels</span>
          <span className="[@media(hover:hover)]:hidden">Swipe for more</span>
          <span className="hidden [@media(hover:hover)]:inline">Previews are muted · sound on Instagram</span>
        </div>
      </div>
    </section>
  );
}

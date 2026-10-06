import { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import { OFFICE_BEARERS } from '../team';
import Badge from './team/Badge';
import { EASE_OUT } from './team/constants';
import { useSwing } from './team/useSwing';
import TeamModal from './team/TeamModal';

// distance from the viewport edge to the wrap's content box (max-w-6xl, px-4 sm:px-6)
const GUTTER_PAD =
  'px-[max(1rem,calc((100vw-72rem)/2+1rem))] sm:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]';
const GUTTER_SNAP =
  'scroll-pl-[max(1rem,calc((100vw-72rem)/2+1rem))] sm:scroll-pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]';

/**
 * 04 — The staff rail. Six passes hang by their lanyards from one steel rail; the cursor
 * brushing past swings them, a grab pulls one aside and lets it go. Initials stand in for
 * photos, so the section never waits on a headshot and never goes stale.
 */
export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);

  const reduce = useReducedMotion();
  const h2InView = useInView(h2Ref, { once: true, amount: 0.6 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);

  const swing = useSwing(OFFICE_BEARERS.length, { sectionRef, rowRef });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const entrance = reduce
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.3 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  return (
    <section
      id="team"
      data-surface="paper"
      aria-labelledby="team-heading"
      ref={sectionRef}
      onPointerMove={swing.enabled ? swing.onSectionPointerMove : undefined}
      className="section surface-paper [touch-action:pan-y]"
    >
      <div className="grid-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* display watermark — the only scroll-linked element */}
      <motion.div
        aria-hidden="true"
        style={{ y: watermarkY }}
        className="pointer-events-none absolute right-[-0.03em] top-10 select-none font-display uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(72px,14vw,220px)] text-pen opacity-[0.06] md:top-8"
      >
        STAFF
      </motion.div>

      <div className="wrap relative">
        {/* header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <motion.p className="kicker-paper" {...entrance}>
              04 / The Team
            </motion.p>
            <h2
              id="team-heading"
              ref={h2Ref}
              className="mt-6 font-mono font-normal text-[clamp(32px,5.5vw,64px)] leading-[1.0] tracking-[-0.03em] text-pen"
            >
              <span className="block">
                {reduce ? 'Run by students.' : <ScrambleIn text="Run by students." delay={0} triggered={h2InView} />}
              </span>
              <span className="block">
                {reduce ? 'These six.' : <ScrambleIn text="These six." delay={250} triggered={h2InView} />}
              </span>
            </h2>
          </div>
          <motion.p
            className="max-w-xl font-sans text-[17px] leading-[1.55] text-pen-2 sm:text-[19px] md:max-w-sm md:pb-1 md:text-right"
            {...entrance}
          >
            The students who run Hack Club NUST: the events, the partners, the money, the posts,
            and this site.
          </motion.p>
        </div>

        {/* the toy: one rail, six passes */}
        <motion.div className="relative mt-16 md:mt-20" {...entrance}>
          <div className="relative">
            {/* rail: full-bleed, under the strap tops */}
            <div
              aria-hidden="true"
              className="absolute left-[calc(50%-50vw)] right-[calc(50%-50vw)] top-0 h-[3px] rounded-full bg-pen"
            />

            {/* scroller: full-bleed so swinging end badges are never clipped on desktop */}
            <div
              ref={rowRef}
              onScroll={swing.enabled ? swing.onRowScroll : undefined}
              className={`-mx-[calc(50vw-50%)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [touch-action:pan-x_pan-y] xl:snap-none xl:overflow-visible [&::-webkit-scrollbar]:hidden ${GUTTER_SNAP}`}
            >
              <ul
                role="list"
                aria-label="Office bearers"
                className={`grid w-max auto-cols-[180px] grid-flow-col gap-4 pb-12 pt-0 xl:w-full xl:auto-cols-[minmax(168px,1fr)] ${GUTTER_PAD}`}
              >
                {OFFICE_BEARERS.map((m, i) => (
                  <li key={m.name} className="snap-start">
                    <Badge
                      member={m}
                      index={i}
                      rot={swing.rot[i]}
                      enabled={swing.enabled}
                      bind={swing.bindHanger(i)}
                      onOpen={() => setOpenIndex(i)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* caption */}
        <div className="rule-paper mt-4" />
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-pen-3">
          <span>Six badges · Session 2026–27 · Tap one to open their file</span>
          {swing.enabled && (
            <>
              <span className="hidden [@media(hover:hover)]:inline">Grab one, let go</span>
              <span className="[@media(hover:hover)]:hidden">Swipe the rail</span>
            </>
          )}
        </div>
      </div>

      <TeamModal
        members={OFFICE_BEARERS}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onMove={setOpenIndex}
      />
    </section>
  );
}

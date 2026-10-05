import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import DotField from './about/DotField';
import { fade as fadeProps } from './about/motion';

/**
 * 01 — The Club. What Hack Club is, and what this chapter is inside it. This is
 * the first thing after the hero because most visitors arrive knowing the NUST
 * name and not the Hack Club one. Surface: paper ("the lights come on").
 */

/* Figures as published by Hack Club. HQ quotes a few different numbers across
   its own pages; these are the ones on hackclub.com itself. */
const STATS = [
  { value: '2014', label: 'Founded' },
  { value: '100,000', label: 'Teens a year' },
  { value: '1,500+', label: 'Clubs worldwide' },
  { value: '501(c)(3)', label: 'Nonprofit' },
];

const HEADING = ['A worldwide network', 'of student coding clubs.', 'This is the NUST one.'];

const LEDE =
  'Hack Club is a nonprofit network of coding clubs, started in 2014 by a sixteen-year-old and now run as The Hack Foundation, a registered US charity. It reaches around a hundred thousand teenagers a year across more than 1,500 clubs, and it is free, forever, for every one of them.';

const CHAPTER =
  'Hack Club NUST is the chapter at the National University of Sciences and Technology in Islamabad, running since 2021. We run the sessions, the workshops and the hackathons on this campus, and we build our own things in between — which is where the games further down came from.';

export default function About() {
  const reduce = useReducedMotion() ?? false;
  const fade = (delay: number) => fadeProps(reduce, delay);

  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLUListElement>(null);
  const h2InView = useInView(h2Ref, { once: true, amount: 0.6 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.6 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const watermarkY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} id="club" data-surface="paper" className="section surface-paper">
      <div className="grid-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="wrap relative">
        <motion.div
          aria-hidden="true"
          style={{ y: reduce ? 0 : watermarkY }}
          className="pointer-events-none absolute right-4 top-0 select-none font-display text-[clamp(72px,14vw,220px)] uppercase leading-[0.9] tracking-[-0.02em] text-pen opacity-[0.07] sm:right-6"
        >
          01
        </motion.div>

        {/* ------------------------------ header ------------------------------ */}
        <motion.p className="kicker-paper relative" {...fade(0)}>
          01 / The Club
        </motion.p>

        <h2
          ref={h2Ref}
          className="relative mt-6 max-w-[24ch] font-mono text-[clamp(32px,5.5vw,64px)] font-normal leading-[1.0] tracking-[-0.03em] text-pen"
        >
          <span className="sr-only">{HEADING.join(' ')}</span>
          <span aria-hidden="true">
            {HEADING.map((line, i) => (
              <span key={line} className={i === 2 ? 'block text-brand-deep' : 'block'}>
                {reduce ? line : <ScrambleIn text={line} delay={i * 250} triggered={h2InView} />}
              </span>
            ))}
          </span>
        </h2>

        <motion.div
          className="relative mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-8"
          {...fade(0.25)}
        >
          <p className="max-w-prose font-sans text-[17px] leading-[1.55] text-pen sm:text-[19px] lg:col-span-6">
            {LEDE}
          </p>
          <div className="flex max-w-prose flex-col gap-5 font-sans text-[16px] leading-[1.6] text-pen-2 lg:col-span-5 lg:col-start-8">
            <p>
              It is not a course and not competition prep. The whole thing runs on one line —{' '}
              <em className="italic text-pen">we are at our best when we are making</em> — a Slack
              full of people shipping at odd hours, and a rotating stack of challenges that send
              you something real for finishing a project. Their words: for teens, by teens.
            </p>
            <p>{CHAPTER}</p>
          </div>
        </motion.div>

        {/* ------------------------------ figure ------------------------------ */}
        <motion.figure
          className="relative mt-20 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8"
          {...fade(0)}
        >
          <DotField />
          <figcaption className="flex flex-col lg:justify-end lg:pb-1">
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-pen-3">
              Fig. 01
            </span>
            <p className="mt-3 font-sans text-[16px] leading-[1.5] text-pen-2">
              1,500+ clubs. One of them is ours.
            </p>
            <a
              href="https://hackclub.com"
              target="_blank"
              rel="noreferrer"
              className="mt-6 w-fit font-mono text-[12px] uppercase tracking-[0.08em] text-signal-deep underline-offset-4 transition-colors duration-200 hover:text-pen hover:underline"
            >
              hackclub.com ↗
            </a>
          </figcaption>
        </motion.figure>

        {/* ------------------------------- stats ------------------------------ */}
        <ul
          ref={statsRef}
          className="relative mt-20 border-y border-line-paper lg:grid lg:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <li
              key={s.label}
              className="flex items-baseline justify-between gap-4 border-b border-line-paper py-5 last:border-b-0 lg:block lg:border-b-0 lg:border-l lg:py-8 lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="sr-only">
                {s.value} — {s.label}
              </span>
              <span
                aria-hidden="true"
                className="whitespace-nowrap font-mono text-[clamp(40px,3.4vw,48px)] tabular-nums leading-none tracking-[-0.04em] text-pen"
              >
                {reduce ? s.value : <ScrambleIn text={s.value} delay={i * 120} triggered={statsInView} />}
              </span>
              <span
                aria-hidden="true"
                className="text-right font-mono text-[12px] uppercase tracking-[0.08em] text-pen-3 lg:mt-3 lg:block lg:text-left"
              >
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

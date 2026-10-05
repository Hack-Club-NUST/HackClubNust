import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import { PILLARS } from '../events';
import Rack from './events/Rack';
import Ticket from './events/Ticket';
import { EASE_OUT } from './events/motion';

/**
 * What the club runs. This replaced a section that listed Hack Club HQ's own
 * programs — those are HQ's, aimed mostly at 13–18-year-olds, and none of them
 * were things this chapter organises. This is the chapter's half instead.
 *
 * Graphite room. The toy is the rack (./events/Rack); orientation is a ticket.
 */

interface EventsProps {
  /** Null once orientation is over: the "up next" card goes with it. */
  onOpenOrientation: (() => void) | null;
}

export default function Events({ onOpenOrientation }: EventsProps) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(h2Ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  const entrance = (amount: number) =>
    reduce
      ? {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, amount },
          transition: { duration: 0.3 },
        }
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount },
          transition: { duration: 0.7, ease: EASE_OUT },
        };
  const fade = entrance(0.4);

  return (
    <section id="events" data-surface="dark" className="section bg-graphite text-fg">
      <div className="grid-dots pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="wrap relative">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <motion.p className="kicker" {...fade}>
              02 / What we run
            </motion.p>
            <h2
              ref={h2Ref}
              className="mt-6 font-mono text-[clamp(32px,5.5vw,64px)] font-normal leading-[1.0] tracking-[-0.03em] text-fg"
            >
              <span className="block">
                {reduce ? 'Hackathons,' : <ScrambleIn text="Hackathons," delay={0} triggered={inView} />}
              </span>
              <span className="block">
                {reduce ? 'workshops,' : <ScrambleIn text="workshops," delay={250} triggered={inView} />}
              </span>
              <span className="block text-brand">
                {reduce ? 'tech & cyber.' : <ScrambleIn text="tech & cyber." delay={500} triggered={inView} />}
              </span>
            </h2>
          </div>
          <motion.p
            className="max-w-xl font-sans text-[17px] leading-[1.55] text-fg-2 sm:text-[19px] md:col-span-5 md:justify-self-end md:text-right"
            {...fade}
          >
            Everything here is run by students at NUST, from the first poster to the closing
            ceremony. We host the events, find the partners, write the challenges, and hand out
            the prizes.
          </motion.p>
        </div>

        <motion.div className="mt-14 md:mt-20" {...entrance(0.25)}>
          <Rack pillars={PILLARS} />

          {onOpenOrientation && (
            <>
              <div className="rule-label mt-20">On the calendar</div>
              <div className="mt-8">
                <Ticket onOpen={onOpenOrientation} />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

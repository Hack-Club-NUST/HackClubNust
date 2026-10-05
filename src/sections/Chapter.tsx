import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import { OBJECT_POSITION, SCRIM_X } from './chapter/art';
import Dossier from './chapter/Dossier';
import Ledger from './chapter/Ledger';
import { EASE_OUT } from './chapter/motion';
import TorchArt from './chapter/TorchArt';
import { useMediaQuery } from './chapter/useMediaQuery';
import { useTorch } from './chapter/useTorch';
import Watermark from './chapter/Watermark';

const RADIUS = { bleed: { active: 260, rest: 440 }, frame: { active: 150, rest: 230 } };
const OPACITY = { active: 1, rest: 0.55 };

/**
 * 03 — the record. The same dark room as the hero after the lights go out: the Cyber
 * Hackathon key art is a grey ghost until the cursor — a torch — lights it back up in red.
 * At lg+ the art bleeds behind the whole section; below lg it sits in a 3:4 viewfinder frame.
 * Every claim comes from events.ts.
 */
export default function Chapter() {
  const reduce = useReducedMotion() ?? false;
  const bleed = useMediaQuery('(min-width: 1024px)');

  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const h2InView = useInView(h2Ref, { once: true, amount: 0.6 });

  const variant = bleed ? 'bleed' : 'frame';
  useTorch(bleed ? sectionRef : frameRef, litRef, {
    enabled: !reduce,
    radius: RADIUS[variant],
    opacity: OPACITY,
    objectPosition: OBJECT_POSITION[variant],
  });

  const fade = (delay = 0) =>
    reduce
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
          transition: { duration: 0.7, ease: EASE_OUT, delay },
        };

  return (
    <section
      id="record"
      ref={sectionRef}
      data-surface="dark"
      className={`section bg-ink text-fg [touch-action:pan-y] ${reduce ? '' : 'lg:cursor-crosshair'}`}
    >
      {bleed && (
        <>
          <TorchArt variant="bleed" reduce={reduce} litRef={litRef} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: SCRIM_X }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        </>
      )}
      <div aria-hidden="true" className="grid-dots pointer-events-none absolute inset-0" />
      <Watermark className="text-fg opacity-[0.06]" />

      <div className="wrap relative z-10">
        {/* entrance group 1: the header */}
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-6">
            <motion.p className="kicker" {...fade()}>
              03 / On this campus
            </motion.p>
            <h2
              ref={h2Ref}
              className="mt-6 font-mono font-normal text-fg text-[clamp(32px,5.5vw,64px)] leading-[1.0] tracking-[-0.03em]"
            >
              {reduce ? (
                <>
                  Already run
                  <br />
                  by this club.
                </>
              ) : (
                <>
                  <ScrambleIn text="Already run" delay={0} triggered={h2InView} />
                  <br />
                  <ScrambleIn text="by this club." delay={250} triggered={h2InView} />
                </>
              )}
            </h2>
            <motion.p
              className="mt-7 max-w-[30rem] font-sans text-[17px] leading-[1.55] text-fg-2 sm:text-[19px]"
              {...fade(0.1)}
            >
              You do not need permission to start something here. Every event below began as a few
              members who wanted it to exist.
            </motion.p>
          </div>
        </div>

        {/* entrance group 2: dossier + ledger as one unit */}
        <motion.div {...fade()} viewport={{ once: true, amount: 0.15 }}>
          <Dossier bleed={bleed} reduce={reduce} frameRef={frameRef} litRef={litRef} />
          <Ledger />
        </motion.div>
      </div>
    </section>
  );
}

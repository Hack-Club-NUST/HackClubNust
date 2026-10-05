import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import AiHumanGame from '../game/components/AiHumanGame';
import CipherTunesGame from '../game/tunes/components/CipherTunesGame';
import ScrambleIn from '../components/ScrambleIn';
import Cabinet from './games/Cabinet';
import { EASE_OUT, GAMES, type GameId } from './games/data';
import { VIDEOS } from '../videos';

const HEADING = 'Play what we made.';

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const reduce = !!useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const h2InView = useInView(h2Ref, { once: true, amount: 0.6 });
  // not `once`: this is the offscreen pause signal for both attract loops
  const sectionVisible = useInView(sectionRef, { amount: 'some' });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const staticY = useMotionValue(0);
  const watermarkY = reduce ? staticY : parallaxY;

  const fade = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: reduce ? 0.3 : 0.7, ease: EASE_OUT },
  };

  return (
    <section
      id="games"
      data-surface="dark"
      ref={sectionRef}
      className="section bg-ink text-fg [touch-action:pan-y]"
    >
      {/* the room: the black-hole clip, dimmed under the hero's vignette */}
      {!reduce && <Backdrop visible={sectionVisible} />}
      <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      {/* the hero's watermark treatment: red light inside the letters */}
      <motion.div
        aria-hidden="true"
        style={{
          y: watermarkY,
          backgroundImage: 'radial-gradient(circle, rgba(242,98,81,0) 0%, #EB4554 70%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
        className="pointer-events-none absolute right-[-0.04em] top-12 select-none font-display text-[clamp(90px,18vw,300px)] uppercase leading-[0.9] tracking-[-0.03em] opacity-[0.14] md:top-14"
      >
        PLAY
      </motion.div>

      <div className="wrap relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
          <div>
            <motion.p className="kicker" {...fade}>
              05 / Built at the club
            </motion.p>
            <h2
              ref={h2Ref}
              className="mt-5 min-h-[1em] font-mono text-[clamp(32px,5.5vw,64px)] font-normal leading-[1.0] tracking-[-0.03em] text-fg xl:whitespace-nowrap"
            >
              {reduce ? HEADING : <ScrambleIn text={HEADING} delay={0} triggered={h2InView} />}
            </h2>
          </div>
          <motion.p className="font-sans text-[17px] leading-[1.55] text-fg-2 sm:text-[19px] max-w-xl lg:pb-2" {...fade}>
            Both of these started as a club project and ended up on a table at a NUST stall with a queue in front of
            it. Members wrote the engines, recorded the audio and sourced every image. Source is on GitHub — read it,
            fork it, break it.
          </motion.p>
        </div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-2"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0.3 : 0.7, ease: EASE_OUT }}
        >
          <Cabinet index={0} game={GAMES[0]} onPlay={() => setActiveGame('ai-vs-human')} sectionVisible={sectionVisible} />
          <Cabinet index={1} game={GAMES[1]} onPlay={() => setActiveGame('cipher-tunes')} sectionVisible={sectionVisible} />
        </motion.div>
      </div>

      {/* overlays: direct children of <section>, never inside anything with a transform */}
      <AiHumanGame open={activeGame === 'ai-vs-human'} onClose={() => setActiveGame(null)} />
      <CipherTunesGame open={activeGame === 'cipher-tunes'} onClose={() => setActiveGame(null)} />
    </section>
  );
}

/**
 * The section's backdrop video. It is only fetched once the section is near the
 * viewport, plays only while it is on screen, and is never rendered at all for
 * visitors who prefer reduced motion.
 */
function Backdrop({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  // latches on the first time the section is near; never unmounts after that
  const [mounted, setMounted] = useState(false);
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible) void v.play().catch(() => {});
    else v.pause();
  }, [visible, mounted]);
  if (!mounted) return null;
  return (
    <video
      ref={ref}
      src={VIDEOS.games}
      muted
      loop
      playsInline
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.28]"
    />
  );
}

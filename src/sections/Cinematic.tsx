import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { VIDEOS } from '../videos';

export default function Cinematic() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const yScaleValue = useTransform(smooth, [0, 1], [60, -120]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${yScaleValue}px) translateZ(15px)`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen-dvh overflow-hidden"
    >
      <video
        src={VIDEOS.cinematic}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-brand-grad opacity-25 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-ink/50" />

      {/* top blend into the hero */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[180px]"
        style={{ background: 'linear-gradient(to bottom, #010103, transparent)' }}
      />

      <div
        className="relative z-20 flex h-full items-center justify-center"
        style={{ perspective: '400px' }}
      >
        <motion.p
          className="max-w-5xl select-none px-6 text-center font-sans text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]"
          style={{ transform, opacity }}
        >
          Two games, one question: can you still tell the difference? Hack Club NUST is a
          student-run build space where members ship real projects in public. The AI vs Human
          detector trains your eye on generated text, images, and code. The decipher game turns
          cryptography into a race against the clock. Built by students, in the open, for anyone
          who wants to play.
        </motion.p>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import { VIDEOS } from '../videos';

const SENSITIVITY = 0.8;

interface HeroProps {
  entranceComplete: boolean;
}

export default function Hero({ entranceComplete }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTime = useRef(0);
  const isSeeking = useRef(false);
  const lastX = useRef<number | null>(null);

  /* Hero video is never played — it is scrubbed by horizontal pointer movement.
     Seeks are chained through the `seeked` event so fast mouse travel queues one
     pending target instead of hammering currentTime and dropping frames. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* some browsers reject a seek before the buffer is ready */
      }
    };

    const seek = () => {
      if (isSeeking.current) return;
      if (Math.abs(video.currentTime - targetTime.current) < 0.005) return;
      isSeeking.current = true;
      video.currentTime = targetTime.current;
    };

    const onSeeked = () => {
      isSeeking.current = false;
      if (Math.abs(video.currentTime - targetTime.current) > 0.005) seek();
    };

    const scrubBy = (dx: number) => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration)) return;
      const delta = (dx / window.innerWidth) * duration * SENSITIVITY;
      const max = Math.max(duration - 0.05, 0);
      targetTime.current = Math.min(Math.max(targetTime.current + delta, 0), max);
      seek();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (lastX.current === null) {
        lastX.current = e.clientX;
        return;
      }
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      scrubBy(dx);
    };

    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX;
      if (x === undefined) return;
      if (lastX.current === null) {
        lastX.current = x;
        return;
      }
      const dx = x - lastX.current;
      lastX.current = x;
      scrubBy(dx);
    };

    const onTouchEnd = () => {
      lastX.current = null;
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const headingClass =
    'text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]';

  return (
    <section id="top" className="relative w-full h-screen-dvh overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* brand wash + vignette so white type stays readable over any frame */}
      <div className="pointer-events-none absolute inset-0 bg-brand-grad opacity-30 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,5,7,0.30)_0%,rgba(11,5,7,0.85)_100%)]" />

      {/* dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* watermark */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 flex justify-center opacity-[0.12]"
        style={{ transform: 'translateY(calc(-50% + 50px))' }}
      >
        <span
          className="whitespace-nowrap uppercase leading-none"
          style={{
            fontFamily: '"Anton SC", sans-serif',
            fontSize: 'clamp(120px, 30vw, 521px)',
            letterSpacing: '-4px',
            backgroundImage:
              'radial-gradient(circle, rgba(242,98,81,0) 0%, #EB4554 70%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hackclub
        </span>
      </div>

      {/* content */}
      <motion.div
        className="relative z-10 flex h-full flex-col px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: entranceComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex-1" />

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className={headingClass}>
              <ScrambleIn text="Human" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Or Machine" delay={500} triggered={entranceComplete} />
            </h1>

            <motion.p
              className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]"
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1.0], delay: 0.2 }}
            >
              Hack Club NUST builds games that put your instincts against the machine. Two arenas:
              one where you separate human work from model output, and one where you break the
              cipher before the clock breaks you.
            </motion.p>
          </div>

          <h1 className={`${headingClass} text-left md:text-right`}>
            <ScrambleIn text="Break" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="The Cipher" delay={1000} triggered={entranceComplete} />
          </h1>
        </div>
      </motion.div>
    </section>
  );
}

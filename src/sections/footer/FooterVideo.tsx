import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { VIDEOS } from '../../videos';

interface FooterVideoProps {
  /** Footer is within one viewport of the screen: mount the <video>. */
  near: boolean;
  /** Footer is on screen: play; otherwise pause. */
  inView: boolean;
}

/**
 * Full-bleed, dimmed mascot loop behind the footer. Mounted lazily (one viewport
 * early), plays only while the footer is on screen, and is absent entirely under
 * reduced motion — the ink surface, grid and vignette carry the room on their own.
 */
export default function FooterVideo({ near, inView }: FooterVideoProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, near, reduce]);

  if (reduce || !near) return null;

  return (
    <video
      ref={ref}
      src={VIDEOS.footer}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      tabIndex={-1}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_35%] opacity-35"
    />
  );
}

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import HackClubLogo from '../../components/HackClubLogo';
import { FOLLOW_BACKDROP, HANDLE, INSTAGRAM, type Reel } from './data';

/** Instagram's own story-ring gradient, so the avatar reads as theirs. */
const RING = 'bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)]';

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full p-[2px] ${RING}`}
      style={{ width: size, height: size }}
    >
      <span className="grid h-full w-full place-items-center rounded-full border-2 border-black bg-ink text-white">
        <HackClubLogo size={Math.round(size * 0.42)} />
      </span>
    </span>
  );
}

/**
 * One reel, dressed in Instagram's reel chrome: the "Reels" header, the action
 * rail, the avatar + Follow, the caption, the audio line and the progress bar.
 * The counts are left off on purpose — they change daily, and a stale number
 * is worse than none.
 *
 * It plays muted while it is on screen and pauses when it is not. With reduced
 * motion it holds its poster and only plays while hovered or focused. The
 * whole card is a link to the club's Instagram.
 */
export function ReelCard({ reel }: { reel: Reel }) {
  const card = useRef<HTMLAnchorElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const bar = useRef<HTMLSpanElement | null>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const v = video.current;
    const el = card.current;
    if (!v || !el) return;

    const play = () => {
      if (v.preload !== 'auto') v.preload = 'auto';
      void v.play().catch(() => {});
    };
    const pause = () => v.pause();

    const onTime = () => {
      if (bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
    };
    v.addEventListener('timeupdate', onTime);

    if (still) {
      el.addEventListener('pointerenter', play);
      el.addEventListener('pointerleave', pause);
      el.addEventListener('focus', play);
      el.addEventListener('blur', pause);
      return () => {
        v.removeEventListener('timeupdate', onTime);
        el.removeEventListener('pointerenter', play);
        el.removeEventListener('pointerleave', pause);
        el.removeEventListener('focus', play);
        el.removeEventListener('blur', pause);
      };
    }

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()), {
      threshold: 0.6,
    });
    io.observe(el);
    return () => {
      io.disconnect();
      v.removeEventListener('timeupdate', onTime);
    };
  }, [still]);

  return (
    <a
      ref={card}
      href={INSTAGRAM}
      target="_blank"
      rel="noreferrer"
      aria-label={`${reel.caption} Watch on Instagram (opens in a new tab)`}
      className="group relative block aspect-[9/16] w-[228px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-black text-white shadow-[0_1px_0_rgba(20,17,20,0.06),0_24px_40px_-24px_rgba(20,17,20,0.55)] ring-1 ring-pen/10 sm:w-[256px]"
    >
      <video
        ref={video}
        src={reel.src}
        poster={reel.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* the chrome's own scrims */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* header */}
      <span aria-hidden="true" className="absolute inset-x-3.5 top-3 flex items-center justify-between">
        <span className="font-sans text-[16px] font-semibold tracking-[-0.01em]">Reels</span>
        <i className="bi bi-camera text-[17px]" />
      </span>

      {/* action rail */}
      <span
        aria-hidden="true"
        className="absolute bottom-[112px] right-2.5 flex flex-col items-center gap-[18px] text-[21px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      >
        <i className="bi bi-heart" />
        <i className="bi bi-chat" />
        <i className="bi bi-send" />
        <i className="bi bi-three-dots-vertical text-[17px]" />
      </span>

      {/* the audio's cover, beside the audio line as Instagram has it */}
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-3 block h-6 w-6 overflow-hidden rounded-[6px] border-2 border-white"
      >
        <span className="grid h-full w-full place-items-center bg-ink">
          <HackClubLogo size={11} />
        </span>
      </span>

      {/* identity, caption, audio */}
      <span aria-hidden="true" className="absolute bottom-4 left-3 right-12 flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <Avatar size={30} />
          <span className="font-sans text-[13px] font-semibold">{HANDLE}</span>
          <span className="rounded-[7px] border border-white/70 px-2 py-[2px] font-sans text-[11.5px] font-semibold">
            Follow
          </span>
        </span>
        {!reel.captionInVideo && (
          <span className="line-clamp-2 font-sans text-[13px] leading-[1.35] text-white/95">{reel.caption}</span>
        )}
        <span className="flex items-center gap-1.5 font-sans text-[11.5px] text-white/85">
          <i className="bi bi-music-note-beamed text-[11px]" />
          <span className="truncate">{HANDLE} · Original audio</span>
        </span>
      </span>

      {/* progress */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/25">
        <span ref={bar} className="block h-full origin-left scale-x-0 bg-white" />
      </span>

      {/* hover: where the card goes */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="flex translate-y-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 font-sans text-[13px] font-semibold text-black shadow-lg transition-transform duration-200 group-hover:translate-y-0">
          <i className="bi bi-instagram text-[14px]" />
          Watch on Instagram
          <i className="bi bi-arrow-up-right text-[11px]" />
        </span>
      </span>
    </a>
  );
}

/** The last card in the row: the profile itself, over a frame of the club cake. */
export function FollowCard() {
  return (
    <a
      href={INSTAGRAM}
      target="_blank"
      rel="noreferrer"
      aria-label={`Follow @${HANDLE} on Instagram (opens in a new tab)`}
      className="group relative flex aspect-[9/16] w-[228px] shrink-0 snap-start flex-col items-center justify-center overflow-hidden rounded-[18px] bg-ink px-6 text-center text-white ring-1 ring-pen/10 sm:w-[256px]"
    >
      <img
        src={FOLLOW_BACKDROP}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-[2px] transition-transform duration-700 group-hover:scale-[1.15]"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink/90" />

      <span className="relative flex flex-col items-center">
        <Avatar size={76} />
        <span className="mt-4 font-sans text-[17px] font-semibold">@{HANDLE}</span>
        <span className="mt-2 font-sans text-[13.5px] leading-[1.45] text-white/75">
          Every event, every reel, and the stories in between.
        </span>
        <span className="mt-6 inline-flex items-center gap-2 rounded-[9px] bg-[#0095f6] px-5 py-2.5 font-sans text-[14px] font-semibold transition-colors group-hover:bg-[#1877f2]">
          <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
          Follow
        </span>
      </span>
    </a>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import AiHumanAttract from './AiHumanAttract';
import CipherTunesAttract from './CipherTunesAttract';
import useArcadeClock from './useArcadeClock';
import { CRT_ON_MS, CRT_STAGGER_MS, type GameCard } from './data';

interface CabinetProps {
  game: GameCard;
  index: number;
  onPlay: () => void;
  sectionVisible: boolean;
}

/**
 * The phosphor picture. Split out so only the tube re-renders on clock ticks,
 * not the cabinet's body copy.
 */
function Picture({ game, running, frozen }: { game: GameCard; running: boolean; frozen: boolean }) {
  const t = useArcadeClock(running);
  return game.id === 'ai-vs-human' ? <AiHumanAttract t={t} frozen={frozen} /> : <CipherTunesAttract t={t} frozen={frozen} />;
}

export default function Cabinet({ game, index, onPlay, sectionVisible }: CabinetProps) {
  const cabinetRef = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const seen = useInView(cabinetRef, { once: true, amount: 0.5 });
  const [hovered, setHovered] = useState(false);
  const on = reduce || seen || hovered; // never goes back to false

  // The attract clock starts once the unfold has finished, so the loop opens on its first frame.
  const [unfolded, setUnfolded] = useState(false);
  useEffect(() => {
    if (!on || reduce || unfolded) return;
    const id = window.setTimeout(() => setUnfolded(true), CRT_ON_MS + index * CRT_STAGGER_MS);
    return () => window.clearTimeout(id);
  }, [on, reduce, unfolded, index]);

  const bezel = game.bezel.split(/\s{2}·\s{2}/);
  const running = unfolded && sectionVisible && !reduce;
  const wake = () => setHovered(true);

  return (
    <article
      ref={cabinetRef}
      onPointerEnter={hovered ? undefined : wake}
      onFocusCapture={hovered ? undefined : wake}
      aria-labelledby={`${game.id}-title`}
      className="group relative flex flex-col overflow-hidden rounded-[6px] border border-line bg-[#120A0C]/85 text-fg backdrop-blur-sm transition-colors duration-300 hover:border-line-strong focus-within:border-line-strong"
    >
      {/* red light spilling down from the screen on hover — the goggles' glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(237,74,82,0.22),transparent_75%)] opacity-40 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
      />

      {/* marquee */}
      <div className="relative flex h-11 items-center justify-between px-4 font-mono text-[12px] uppercase tracking-[0.12em] text-fg-3 sm:px-5">
        <span>{String(index + 1).padStart(2, '0')} / 02</span>
        <span className="flex items-center gap-2 text-fg-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-led animate-led" aria-hidden="true" />
          Playable
        </span>
      </div>

      {/* screen */}
      <div className="relative px-3 sm:px-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] border border-white/[0.08] bg-[#070304] shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] lg:aspect-[16/10]">
          {!reduce && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-brand shadow-[0_0_18px_3px_rgba(237,74,82,0.85)] transition-opacity delay-150 duration-200 ${
                on ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}
          <div
            aria-hidden="true"
            className={`absolute inset-0 origin-center ${reduce ? '' : on ? 'animate-crt-on' : 'scale-y-[0.004] opacity-0'}`}
            style={reduce ? undefined : { animationDelay: `${index * CRT_STAGGER_MS}ms` }}
          >
            {on && <Picture game={game} running={running} frozen={reduce} />}
          </div>
          <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-60" />
          {/* a low red bloom at the bottom of the glass, like light from the goggles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(237,74,82,0.12),transparent_70%)]"
          />
        </div>
      </div>

      {/* body */}
      <div className="relative flex flex-1 flex-col p-5 pt-7 sm:p-8">
        <h3
          id={`${game.id}-title`}
          className="font-display text-[clamp(44px,5.2vw,72px)] uppercase leading-[0.88] tracking-[-0.01em] text-fg transition-[text-shadow] duration-500 group-hover:[text-shadow:0_0_32px_rgba(237,74,82,0.45)]"
        >
          {game.title}
        </h3>
        <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.2em] text-brand">{game.tagline}</p>
        <p className="mt-5 max-w-prose font-sans text-[16px] leading-[1.6] text-fg-2">{game.desc}</p>
        {game.caption && <p className="mt-3 font-sans text-[14px] leading-[1.55] text-fg-3">{game.caption}</p>}
        <ul className="mt-6 flex flex-wrap gap-2">
          {bezel.map((seg) => (
            <li key={seg} className="tag">
              {seg}
            </li>
          ))}
        </ul>
        <div className="flex-1" />
        <button type="button" onClick={onPlay} aria-label={`Play ${game.title}`} className="btn-primary mt-8 w-full sm:w-fit">
          <i className="bi bi-play-fill text-[18px]" aria-hidden="true" />
          Play Now
        </button>
      </div>
    </article>
  );
}

/**
 * The RECORD word on the wall. Two copies share these exact classes so they register
 * pixel-for-pixel: a faint one always visible, and a brighter one inside the torch mask.
 */
export default function Watermark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute right-[2vw] top-4 select-none whitespace-nowrap font-display uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(72px,14vw,220px)] lg:top-[88px] ${className}`}
    >
      RECORD
    </span>
  );
}

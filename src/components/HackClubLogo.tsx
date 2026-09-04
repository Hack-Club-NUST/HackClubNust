interface HackClubLogoProps {
  size?: number;
  className?: string;
}

/**
 * Hack Club NUST mark — the club's "</>" terminal box, drawn as strokes so it
 * inherits currentColor and stays crisp at 18px in the navbar and footer.
 */
export default function HackClubLogo({ size = 18, className = '' }: HackClubLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* lid / flag on top of the box */}
      <path d="M32 14 H62 a8 8 0 0 1 8 8 v6 H24 v-6 a8 8 0 0 1 8 -8 Z" />
      {/* the terminal box */}
      <rect x="13" y="30" width="74" height="56" rx="13" />
      {/* </> glyph */}
      <path d="M43 46 L31 58 L43 70" />
      <path d="M57 46 L69 58 L57 70" />
      <path d="M54 43 L46 73" />
    </svg>
  );
}

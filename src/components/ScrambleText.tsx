import { useEffect, useState } from 'react';

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

/**
 * Hover-driven scramble: every character goes noisy, then resolves
 * left-to-right at 4 frames per character (25ms frames). Unhover snaps back.
 */
export default function ScrambleText({ text, isHovered, className = '' }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const interval = setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 4);

      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            return i < revealed ? ch : randomChar();
          })
          .join('')
      );

      if (revealed >= text.length) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}

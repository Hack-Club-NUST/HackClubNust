import { useEffect, useState } from 'react';

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

interface ScrambleInProps {
  text: string;
  delay: number;
  triggered: boolean;
}

/**
 * Entrance reveal: characters resolve left-to-right at 0.5 chars per 25ms frame.
 * Unresolved characters within 3 slots of the cursor scramble; anything further
 * out stays empty so the line "grows" instead of flashing full-width noise.
 */
export default function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [display, setDisplay] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!triggered) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      setStarted(true);
      let cursor = 0;

      interval = setInterval(() => {
        cursor += 0.5;

        setDisplay(
          text
            .split('')
            .map((ch, i) => {
              if (ch === ' ') return ' ';
              if (i < cursor) return ch;
              if (i < cursor + 3) return randomChar();
              return '';
            })
            .join('')
        );

        if (cursor >= text.length) {
          setDisplay(text);
          if (interval) clearInterval(interval);
        }
      }, 25);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [triggered, text, delay]);

  if (!started) return <>&nbsp;</>;
  return <>{display}</>;
}

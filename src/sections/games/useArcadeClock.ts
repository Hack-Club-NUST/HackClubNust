import { useEffect, useRef, useState } from 'react';

const FRAME_MS = 33; // commit to React at most ~30fps
const MAX_STEP_MS = 100; // a long frame (tab throttling, jank) never jumps the picture

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/**
 * A pausable attract-mode clock. Returns elapsed ms, accumulated only while
 * `running` is true and the tab is visible, so pausing freezes the picture and
 * resuming continues from the same frame. No rAF is scheduled while paused.
 */
export default function useArcadeClock(running: boolean): number {
  const pageVisible = usePageVisible();
  const active = running && pageVisible;
  const [t, setT] = useState(0);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let lastCommit = -Infinity;

    const tick = (now: number) => {
      elapsed.current += Math.min(MAX_STEP_MS, Math.max(0, now - last));
      last = now;
      if (now - lastCommit >= FRAME_MS) {
        lastCommit = now;
        setT(elapsed.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return t;
}

import { useLayoutEffect, type RefObject } from 'react';

/** Natural size of the key art, and the point the torch parks on (the hood + padlock edge). */
const IMG = { w: 960, h: 1286 };
const FOCUS = { x: 610 / 960, y: 470 / 1286 };

/** How long a lifted finger keeps the beam where it was before it parks. */
const PARK_DELAY = 900;

interface TorchOptions {
  /** false under reduced motion: no listeners, no rAF. */
  enabled: boolean;
  radius: { active: number; rest: number };
  opacity: { active: number; rest: number };
  /** The art's object-position, as fractions, so the rest point lands on the figure. */
  objectPosition: { x: number; y: number };
}

type V = { x: number; y: number; r: number; o: number };

/**
 * The Chapter toy. Writes --tx / --ty / --torch-r onto `containerRef` and the opacity of
 * `litRef` (the `.torch`-masked copy of the art). Events only update refs; one rAF loop
 * lerps toward the target and stops itself once settled, and is cancelled off-screen.
 */
export function useTorch(
  containerRef: RefObject<HTMLElement>,
  litRef: RefObject<HTMLElement>,
  { enabled, radius, opacity, objectPosition }: TorchOptions
) {
  const rA = radius.active;
  const rR = radius.rest;
  const oA = opacity.active;
  const oR = opacity.rest;
  const px = objectPosition.x;
  const py = objectPosition.y;

  useLayoutEffect(() => {
    const el = containerRef.current;
    const lit = litRef.current;
    if (!enabled || !el || !lit) return;

    const rest = { x: 0, y: 0 };
    const computeRest = () => {
      const rect = el.getBoundingClientRect();
      const s = Math.max(rect.width / IMG.w, rect.height / IMG.h);
      const dw = IMG.w * s;
      const dh = IMG.h * s;
      rest.x = (rect.width - dw) * px + FOCUS.x * dw;
      rest.y = (rect.height - dh) * py + FOCUS.y * dh;
    };

    computeRest();
    const target: V = { x: rest.x, y: rest.y, r: rR, o: oR };
    const current: V = { ...target };
    let pointer: { clientX: number; clientY: number } | null = null;
    let active = false;
    let inView = false;
    let raf = 0;
    let parkTimer: ReturnType<typeof setTimeout> | undefined;

    const write = () => {
      el.style.setProperty('--tx', `${current.x}px`);
      el.style.setProperty('--ty', `${current.y}px`);
      el.style.setProperty('--torch-r', `${current.r}px`);
      lit.style.opacity = String(current.o);
    };
    // first paint is already the parked spotlight — no flash of a centred default
    write();

    const tick = () => {
      raf = 0;
      if (active && pointer) {
        const rect = el.getBoundingClientRect(); // once per frame, not per event
        target.x = pointer.clientX - rect.left;
        target.y = pointer.clientY - rect.top;
        target.r = rA;
        target.o = oA;
      } else {
        target.x = rest.x;
        target.y = rest.y;
        target.r = rR;
        target.o = oR;
      }
      current.x += (target.x - current.x) * 0.16; // weighted follow: the beam has mass
      current.y += (target.y - current.y) * 0.16;
      current.r += (target.r - current.r) * 0.1;
      current.o += (target.o - current.o) * 0.1;
      write();
      const settled =
        Math.abs(target.x - current.x) < 0.3 &&
        Math.abs(target.y - current.y) < 0.3 &&
        Math.abs(target.r - current.r) < 0.3 &&
        Math.abs(target.o - current.o) < 0.003;
      if (!settled && inView) raf = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (inView && !raf) raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // touch is driven by touchmove below
      pointer = { clientX: e.clientX, clientY: e.clientY };
      active = true;
      clearTimeout(parkTimer);
      schedule();
    };
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // a lifted finger parks after PARK_DELAY instead
      active = false;
      pointer = null;
      schedule();
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer = { clientX: t.clientX, clientY: t.clientY };
      active = true;
      clearTimeout(parkTimer);
      schedule();
    };
    const onTouchEnd = () => {
      clearTimeout(parkTimer);
      parkTimer = setTimeout(() => {
        active = false;
        pointer = null;
        schedule();
      }, PARK_DELAY);
    };
    // a wheel scroll moves the art under a still cursor; keep the beam on the cursor
    const onScroll = () => {
      if (active) schedule();
    };

    const opts: AddEventListenerOptions = { passive: true };
    el.addEventListener('pointermove', onPointerMove, opts);
    el.addEventListener('pointerleave', onPointerLeave, opts);
    el.addEventListener('touchstart', onTouch, opts);
    el.addEventListener('touchmove', onTouch, opts);
    el.addEventListener('touchend', onTouchEnd, opts);
    el.addEventListener('touchcancel', onTouchEnd, opts);
    window.addEventListener('scroll', onScroll, opts);

    const ro = new ResizeObserver(() => {
      computeRest();
      if (!active) schedule();
    });
    ro.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          schedule();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(el);

    return () => {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('touchstart', onTouch);
      el.removeEventListener('touchmove', onTouch);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(parkTimer);
    };
  }, [containerRef, litRef, enabled, rA, rR, oA, oR, px, py]);
}

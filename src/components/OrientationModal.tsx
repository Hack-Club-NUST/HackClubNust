import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ORIENTATION } from '../events';
import { WHATSAPP_INVITE } from '../links';

interface OrientationModalProps {
  open: boolean;
  onClose: () => void;
}

const DETAILS = [
  { icon: 'bi-calendar3', label: 'When', value: `${ORIENTATION.day}, ${ORIENTATION.date}` },
  { icon: 'bi-clock', label: 'Time', value: ORIENTATION.time },
  { icon: 'bi-geo-alt', label: 'Where', value: `${ORIENTATION.venue}, ${ORIENTATION.campus}` },
];

/**
 * NHC Orientation, dressed like the poster: a Minecraft inventory panel with a
 * grass-block lid, bevelled slots and blocky buttons. The poster itself is the
 * club's six-tile Instagram grid stitched back into one image.
 *
 * Above everything (z-120, over the game overlays at z-100). Escape and the
 * backdrop both close it; focus starts on the close button and the page behind
 * stops scrolling while it is up.
 */
export default function OrientationModal({ open, onClose }: OrientationModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const still = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] overflow-y-auto bg-black/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="orientation-title"
              className="mc-panel relative w-full max-w-[940px] text-[#2b2b2b]"
              initial={still ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={still ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mc-grass" aria-hidden="true" />

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="mc-btn absolute right-3 top-8 z-10 !min-h-0 h-10 w-10 !p-0 sm:right-4"
              >
                <i className="bi bi-x-lg text-[14px]" aria-hidden="true" />
              </button>

              <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-7">
                {/* ------------------------------ poster ------------------------------ */}
                <div className="mc-slot self-start p-[6px] md:self-center">
                  <img
                    src={ORIENTATION.poster}
                    alt={`${ORIENTATION.name} poster: ${ORIENTATION.date}, ${ORIENTATION.time}, ${ORIENTATION.venue}`}
                    className="block aspect-[6/5] w-full object-cover"
                  />
                </div>

                {/* ------------------------------ details ----------------------------- */}
                <div className="flex flex-col gap-5 md:pt-2">
                  <div className="pr-12">
                    <p className="font-pixel text-[9px] uppercase leading-relaxed text-[#3c8527]">
                      ▶ Quest started
                    </p>
                    <h2
                      id="orientation-title"
                      className="mt-3 font-pixel text-[19px] leading-[1.45] text-white sm:text-[23px]"
                      style={{ textShadow: '3px 3px 0 #3f3f3f' }}
                    >
                      {ORIENTATION.name}
                      <span className="mt-1 block text-[#ffff55]">{ORIENTATION.edition}</span>
                    </h2>
                  </div>

                  <p className="text-[13.5px] leading-relaxed text-[#373737]">{ORIENTATION.pitch}</p>

                  <ul className="flex flex-col gap-2.5">
                    {DETAILS.map((d) => (
                      <li key={d.label} className="flex items-center gap-3">
                        <span className="mc-slot flex h-11 w-11 shrink-0 items-center justify-center">
                          <i className={`bi ${d.icon} text-[17px] text-white`} aria-hidden="true" />
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="font-pixel text-[8px] uppercase text-[#555]">{d.label}</span>
                          <span className="text-[14px] font-bold leading-snug text-[#1d1d1d]">{d.value}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="font-pixel text-[10px] leading-[2] text-[#3c8527]">
                    {ORIENTATION.lines.join(' ')}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <a href={ORIENTATION.calendar} target="_blank" rel="noreferrer" className="mc-btn mc-btn-green">
                      <i className="bi bi-calendar-plus text-[14px]" aria-hidden="true" />
                      Add to calendar
                    </a>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <a href={WHATSAPP_INVITE} target="_blank" rel="noreferrer" className="mc-btn">
                        <i className="bi bi-whatsapp text-[14px]" aria-hidden="true" />
                        WhatsApp
                      </a>
                      <a href={ORIENTATION.post} target="_blank" rel="noreferrer" className="mc-btn">
                        <i className="bi bi-instagram text-[14px]" aria-hidden="true" />
                        Instagram
                      </a>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#555]">
                    Art by{' '}
                    {ORIENTATION.art.map((handle, i) => (
                      <span key={handle}>
                        {i > 0 && ' & '}
                        <a
                          href={`https://instagram.com/${handle}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-[#8b8b8b] underline-offset-2 hover:text-[#1d1d1d]"
                        >
                          @{handle}
                        </a>
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

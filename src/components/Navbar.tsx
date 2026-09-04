import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HackClubLogo from './HackClubLogo';
import ScrambleText from './ScrambleText';
import SquashHamburger from './SquashHamburger';

const pillSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };

interface NavbarProps {
  entranceComplete: boolean;
}

export default function Navbar({ entranceComplete }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const links = [
    { label: 'Games', target: '#games' },
    { label: 'Club', target: '#club' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-20 w-full bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* ---------------- desktop ---------------- */}
      <div className="hidden sm:flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          {/* logo pill */}
          <motion.a
            href="#top"
            className={`${menuOpen ? 'hidden md:flex' : 'flex'} h-12 items-center gap-2.5 rounded-[14px] bg-white/15 px-5 backdrop-blur-md`}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
            whileTap={{ scale: 0.98 }}
          >
            <HackClubLogo size={18} className="text-white" />
            <span className="text-[16px] font-medium tracking-tight text-white">Hack Club NUST</span>
          </motion.a>

          {/* expanding menu pill */}
          <motion.div
            className="flex h-12 items-center overflow-hidden rounded-[14px] bg-white/15 backdrop-blur-md"
            animate={{ width: menuOpen ? 290 : 48 }}
            transition={pillSpring}
          >
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex shrink-0 items-center justify-center transition-colors ${
                menuOpen
                  ? 'ml-1.5 h-9 w-9 rounded-[11px] bg-white/10 hover:bg-white/20'
                  : 'h-12 w-12 rounded-[14px]'
              }`}
            >
              <SquashHamburger isOpen={menuOpen} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="flex items-center gap-6 pl-5"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                >
                  {links.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => scrollTo(link.target)}
                      onMouseEnter={() => setHovered(link.label)}
                      onMouseLeave={() => setHovered(null)}
                      className="whitespace-nowrap text-[16px] font-normal text-white/85 transition-colors hover:text-white"
                    >
                      <ScrambleText text={link.label} isHovered={hovered === link.label} />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.a
          href="https://hackclub.com/slack/"
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center gap-2 rounded-full bg-brand-grad px-6 text-white shadow-[0_8px_30px_rgba(235,69,84,0.35)]"
          onMouseEnter={() => setHovered('cta')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <i className="bi bi-slack text-[16px]" aria-hidden="true" />
          <ScrambleText text="Join Slack" isHovered={hovered === 'cta'} className="text-[15px] font-bold" />
        </motion.a>
      </div>

      {/* ---------------- mobile ---------------- */}
      <div className="flex sm:hidden h-20 items-center gap-2 px-4">
        <motion.a
          href="#top"
          className="flex h-9 items-center gap-2 overflow-hidden rounded-[10px] bg-white/15 px-3 backdrop-blur-md"
          animate={{ width: menuOpen ? 0 : 'auto', opacity: menuOpen ? 0 : 1 }}
          transition={pillSpring}
        >
          <HackClubLogo size={15} className="shrink-0 text-white" />
          <span className="whitespace-nowrap text-[13px] font-medium tracking-tight text-white">
            Hack Club NUST
          </span>
        </motion.a>

        <motion.div
          className="flex h-9 items-center overflow-hidden rounded-[10px] bg-white/15 backdrop-blur-md"
          animate={{ width: menuOpen ? '100%' : 36 }}
          transition={pillSpring}
        >
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex shrink-0 items-center justify-center ${
              menuOpen ? 'ml-1 h-7 w-7 rounded-[8px] bg-white/10' : 'h-9 w-9 rounded-[10px]'
            }`}
          >
            <SquashHamburger isOpen={menuOpen} isMobile />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="flex items-center gap-4 pl-4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
              >
                {links.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => scrollTo(link.target)}
                    className="whitespace-nowrap text-[13px] text-white/85"
                  >
                    {link.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!menuOpen && (
          <a
            href="https://hackclub.com/slack/"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand-grad px-3.5 text-white"
          >
            <i className="bi bi-slack text-[13px]" aria-hidden="true" />
            <span className="text-[13px] font-bold">Join</span>
          </a>
        )}
      </div>
    </motion.nav>
  );
}

import { motion } from 'framer-motion';

interface SquashHamburgerProps {
  isOpen: boolean;
  isMobile?: boolean;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };

export default function SquashHamburger({ isOpen, isMobile = false }: SquashHamburgerProps) {
  const width = isMobile ? 15 : 18;
  const height = isMobile ? 10 : 12;
  const bar = isMobile ? 1.2 : 1.5;
  const center = height / 2 - bar / 2;

  const barStyle = {
    position: 'absolute' as const,
    left: 0,
    width,
    height: bar,
    borderRadius: bar,
    background: 'currentColor', // follows the navbar's surface
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      <motion.span
        style={{ ...barStyle, top: 0 }}
        animate={isOpen ? { y: center, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
      <motion.span
        style={{ ...barStyle, top: center }}
        animate={isOpen ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }}
        transition={spring}
      />
      <motion.span
        style={{ ...barStyle, top: height - bar }}
        animate={isOpen ? { y: -center, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
    </div>
  );
}

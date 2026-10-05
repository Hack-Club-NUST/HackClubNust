import { useCallback, useEffect, useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import OrientationModal from './components/OrientationModal';
import { SoundDock } from './components/SoundButton';
import Hero from './sections/Hero';
import About from './sections/About';
import Events from './sections/Events';
import Chapter from './sections/Chapter';
import Team from './sections/Team';
import Games from './sections/Games';
import Social from './sections/Social';
import Footer from './sections/Footer';
import StaffPage from './StaffPage';
import ApplicationsPage from './ApplicationsPage';
import { ORIENTATION_ENDS_AT } from './orientation';

/**
 * Two internal tools live beside the site at fixed paths. A plain pathname
 * switch rather than a router: three routes, no params, no nesting — a router
 * would be more machinery than the whole problem. The check happens before any
 * hook runs, so each branch is its own component with its own hook order.
 */
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/staff') return <StaffPage />;
  if (path === '/applications') return <ApplicationsPage />;
  return <Site />;
}

const SEEN_KEY = 'hcnust:orientation-26-seen';

function Site() {
  const [entranceComplete, setEntranceComplete] = useState(false);
  // Decided once per visit: the bar is up until orientation is over, and the
  // navbar moves down to make room for it only while it is.
  const [barVisible] = useState(() => Date.now() < ORIENTATION_ENDS_AT);

  const [orientationOpen, setOrientationOpen] = useState(false);
  const openOrientation = useCallback(() => setOrientationOpen(true), []);
  const closeOrientation = useCallback(() => setOrientationOpen(false), []);

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  // Orientation opens itself once per visit, a beat after the hero lands. The
  // session flag is a courtesy — if storage is blocked it just opens again.
  useEffect(() => {
    if (!entranceComplete || !barVisible) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* private mode or blocked storage */
    }
    const timeout = setTimeout(openOrientation, 1800);
    return () => clearTimeout(timeout);
  }, [entranceComplete, barVisible, openOrientation]);

  return (
    <div
      className="relative w-full overflow-x-hidden bg-ink"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      {barVisible && <AnnouncementBar entranceComplete={entranceComplete} onOpen={openOrientation} />}
      <Navbar entranceComplete={entranceComplete} offset={barVisible} />
      <Hero entranceComplete={entranceComplete} />
      <About />
      <Events onOpenOrientation={barVisible ? openOrientation : null} />
      <Chapter />
      <Team />
      <Games />
      <Social />
      <Footer />
      <SoundDock />
      <OrientationModal open={orientationOpen} onClose={closeOrientation} />
    </div>
  );
}

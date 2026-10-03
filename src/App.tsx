import { useEffect, useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Programs from './sections/Programs';
import Chapter from './sections/Chapter';
import Games from './sections/Games';
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

function Site() {
  const [entranceComplete, setEntranceComplete] = useState(false);
  // Decided once per visit: the bar is up until orientation is over, and the
  // navbar moves down to make room for it only while it is.
  const [barVisible] = useState(() => Date.now() < ORIENTATION_ENDS_AT);

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="relative w-full overflow-x-hidden bg-ink"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      {barVisible && <AnnouncementBar entranceComplete={entranceComplete} />}
      <Navbar entranceComplete={entranceComplete} offset={barVisible} />
      <Hero entranceComplete={entranceComplete} />
      <About />
      <Programs />
      <Chapter />
      <Games />
      <Footer />
    </div>
  );
}

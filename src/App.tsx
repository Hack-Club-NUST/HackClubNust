import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Programs from './sections/Programs';
import Chapter from './sections/Chapter';
import Games from './sections/Games';
import Recruit from './sections/Recruit';
import Footer from './sections/Footer';
import StaffPage from './StaffPage';
import ApplicationsPage from './ApplicationsPage';

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

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className="relative w-full overflow-x-hidden bg-ink"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Navbar entranceComplete={entranceComplete} />
      <Hero entranceComplete={entranceComplete} />
      <About />
      <Programs />
      <Chapter />
      <Games />
      <Recruit />
      <Footer />
    </div>
  );
}

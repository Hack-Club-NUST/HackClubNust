import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Features from './sections/Features';
import Games from './sections/Games';
import Rounds from './sections/Rounds';
import Footer from './sections/Footer';

export default function App() {
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
      <Features />
      <Games />
      <Rounds />
      <Footer />
    </div>
  );
}

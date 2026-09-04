import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Cinematic from './sections/Cinematic';
import Metrics from './sections/Metrics';
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
      <Cinematic />
      <Metrics />
      <Features />
      <Games />
      <Rounds />
      <Footer />
    </div>
  );
}

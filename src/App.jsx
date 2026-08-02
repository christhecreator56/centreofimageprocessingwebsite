import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Loader from './components/Loader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Projects from './components/Projects';
import Events from './components/Events';
import Newsletter from './components/Newsletter';
import Marquee from './components/Marquee';
import Contact from './components/Contact';
import { CinematicFooter } from './components/CinematicFooter';
import GradualBlur from './components/GradualBlur';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset window scroll position on mount
    window.scrollTo(0, 0);

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard expo ease
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Pause scroll events when loading
    if (loading) {
      lenis.stop();
    } else {
      lenis.start();
    }

    return () => {
      lenis.destroy();
    };
  }, [loading]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-white selection:text-black font-sans">
      <CustomCursor />
      
      <Loader onComplete={() => setLoading(false)} />

      {/* Fade page content in once preloader completes */}
      <main
        id="main-content"
        className={`transition-opacity duration-1000 ease-out ${
          loading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'
        }`}
      >
        {!loading && (
          <>
            <Navbar />
            
            {/* Main content slides over the footer */}
            <div className="relative z-10 bg-[#0a0a0a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] pb-1">
              <Hero />
              <Philosophy />
              <Projects />
              <Events />
              <Newsletter />
              <Marquee />
              <Contact />
              
              {/* Premium gradual blur transition overlay at the bottom border */}
              <GradualBlur
                target="parent"
                position="bottom"
                height="8rem"
                strength={3}
                divCount={8}
                curve="bezier"
                exponential={true}
                opacity={1}
              />
            </div>

            {/* Cinematic Sticky Curtain Reveal Footer */}
            <CinematicFooter />
          </>
        )}
      </main>
    </div>
  );
}

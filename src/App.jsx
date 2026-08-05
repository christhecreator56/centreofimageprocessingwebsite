import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Loader from './components/Loader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import FloatingLogo from './components/FloatingLogo';
import ThemeToggle from './components/ThemeToggle';
import MobileNav from './components/MobileNav';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Projects from './components/Projects';
import Events from './components/Events';
import Newsletter from './components/Newsletter';
import Marquee from './components/Marquee';
import Contact from './components/Contact';
import { CinematicFooter } from './components/CinematicFooter';
import GradualBlur from './components/GradualBlur';
import { scrollBlur } from './lib/scrollBlur';

gsap.registerPlugin(ScrollTrigger);

/**
 * phase drives the whole entrance:
 *   loading   — page is mounted but sitting behind the QR curtain, pushed in
 *   revealing — the QR mask is opening; the page rides its zoom back to 1
 *   live      — entrance transforms removed so fixed positioning works again
 */
export default function App() {
  const [phase, setPhase] = useState('loading');
  const lenisRef = useRef(null);

  // Lenis is created once and simply paused until the reveal starts, so we
  // never tear down and rebuild smooth scroll in the middle of a transition.
  useEffect(() => {
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      // NOTE: this config was written against Lenis v0 option names
      // (`direction`, `gestureDirection`, `smooth`, `smoothTouch`,
      // `mouseMultiplier`). v1.3 ignores all of them silently, so the scroll
      // was running on defaults — including a 1.2s eased glide that reads as
      // laggy because every wheel tick takes over a second to settle.
      //
      // `lerp` instead of `duration` is the frame-rate-independent mode: the
      // view chases the target by a fixed fraction each frame, so input feels
      // immediate while still smoothing. 0.12 is responsive without going
      // choppy.
      lerp: 0.12,
      smoothWheel: true,
      // Touch keeps the platform's own momentum. Intercepting it costs frames
      // on exactly the devices that have the fewest to spare, and native
      // momentum is better tuned than anything we would fake.
      syncTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
      // We drive it from the GSAP ticker below, so it must not start its own.
      autoRaf: false,
    });

    lenisRef.current = lenis;
    lenis.stop();

    // Lenis drives scroll position, so ScrollTrigger has to be told about it
    // or every scrubbed timeline (the footer curtain especially) runs stale.
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker rather than its own requestAnimationFrame.
    // Two independent loops meant two wake-ups per frame and no guarantee that
    // scroll position was updated before the scrubbed timelines read it.
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (phase === 'live') lenisRef.current.start();
    else lenisRef.current.stop();
  }, [phase]);

  // The page mounts behind the curtain while the stage is still scaled to
  // 1.14, so every ScrollTrigger measured a distorted document. Once the
  // entrance transform is gone, re-measure — otherwise scrubbed reveals
  // (the footer's heading and links) never reach their end state.
  useEffect(() => {
    if (phase !== 'live') return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [phase]);

  /**
   * Scroll motion blur.
   *
   * Velocity is sampled per frame from the real scroll position, so it stays
   * correct for wheel, keyboard and scrollbar dragging alike. The blur rises
   * quickly and falls off slowly, which is what makes it read as smear rather
   * than as a flicker.
   *
   * The loop is started by a scroll event and shuts itself down once the blur
   * has decayed to zero and nothing has moved for a moment. A permanently
   * running rAF is the thing that makes an idle page feel heavy, and this one
   * had no reason to tick while nobody was scrolling.
   */
  useEffect(() => {
    if (phase !== 'live') return;
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarse) return;

    const MAX = 3.5; // px — above this the smear turns into mush
    const THRESHOLD = 6; // px/frame before any blur appears
    const GAIN = 0.1;

    let last = window.scrollY;
    let blur = 0;
    let frame = 0;
    let idleFrames = 0;

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      blur = 0;
      idleFrames = 0;
      scrollBlur.set(0);
      root.classList.remove('is-blurring');
      root.style.removeProperty('--scroll-blur');
    };

    const tick = () => {
      const y = window.scrollY;
      const velocity = Math.abs(y - last);
      last = y;

      const target = Math.min(MAX, Math.max(0, (velocity - THRESHOLD) * GAIN));
      blur += (target - blur) * (target > blur ? 0.5 : 0.14);
      if (blur < 0.05) blur = 0;

      scrollBlur.set(blur);
      root.style.setProperty('--scroll-blur', `${blur.toFixed(2)}px`);
      root.classList.toggle('is-blurring', blur > 0);

      // Two idle frames with no blur left and no movement: park the loop.
      idleFrames = blur === 0 && velocity === 0 ? idleFrames + 1 : 0;
      if (idleFrames > 2) {
        stop();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      idleFrames = 0;
      if (!frame) {
        last = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', wake, { passive: true });
    return () => {
      window.removeEventListener('scroll', wake);
      stop();
    };
  }, [phase]);

  const handleReveal = useCallback(() => setPhase('revealing'), []);
  const handleComplete = useCallback(() => setPhase('live'), []);

  return (
    <div className="relative min-h-screen bg-background text-ink antialiased selection:bg-ink selection:text-background font-sans">
      <CustomCursor />

      {/* The page is mounted from the first frame — the mask reveals a live
          hero, not a fade-in of something that only just appeared. */}
      <main id="main-content" className="cis-stage" data-phase={phase}>
        <div className="relative z-10 bg-background shadow-[0_20px_50px_var(--shadow-tint)] pb-1">
          <Hero ready={phase !== 'loading'} />
          <Philosophy />
          <Projects />
          <Events />
          <Newsletter />
          <Marquee />
          <Contact />

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

        <CinematicFooter />
      </main>

      {/* Depth tint: the page comes up out of the dark as the holes open. */}
      {phase !== 'live' && <div className="cis-tint" data-phase={phase} aria-hidden="true" />}

      {/* Navbar lives outside the stage so its fixed positioning is never
          trapped by the entrance transform. */}
      <div className="cis-nav" data-phase={phase}>
        <Navbar />
        <MobileNav />
        <FloatingLogo />
        {/* The phone gets its theme switch inside the bottom bar, where the
            thumb already is, so this floating one is desktop-only. */}
        <div className="fixed right-6 top-6 z-[60] hidden md:block">
          <ThemeToggle />
        </div>
      </div>

      <Loader onReveal={handleReveal} onComplete={handleComplete} />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CityCanvas from './CityCanvas';
import { EASE } from './Reveal';

const LINES = [
  {
    text: 'PERCEIVE.',
    className: 'font-black text-ink',
    from: -60,
    style: undefined,
  },
  {
    text: 'PROCESS.',
    className: 'font-light text-ink/40 pl-12 md:pl-24',
    from: 60,
    style: undefined,
  },
  {
    text: 'PERFECT.',
    className:
      'font-black text-transparent bg-clip-text bg-gradient-to-r from-ink via-ink to-ink/10',
    from: -20,
    style: { WebkitTextStroke: '1px var(--stroke-ink)' },
  },
];

export default function Hero({ ready = true }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
        // Normalised -1..1, used for a very small counter-drift on the type.
        setParallax({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Everything in the hero waits for the mask to open, so the first frame
  // the user sees through the QR holes is frame zero of the type animation.
  const state = ready ? 'show' : 'hide';

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-20 md:px-12 md:pb-16 md:pt-28">
      <div className="noise-overlay" />

      <style>{`
        @keyframes noise-dance {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -2%); }
          20% { transform: translate(-2%, 1%); }
          30% { transform: translate(1%, -2%); }
          40% { transform: translate(-1%, 2%); }
          50% { transform: translate(-2%, 1%); }
          60% { transform: translate(2%, -1%); }
          70% { transform: translate(1%, 1%); }
          80% { transform: translate(0%, -2%); }
          90% { transform: translate(-1%, 1%); }
          100% { transform: translate(0, 0); }
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          width: 110%;
          height: 110%;
          left: -5%;
          top: -5%;
          pointer-events: none;
          z-index: 25;
          opacity: var(--noise-opacity);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise-dance 0.6s steps(10) infinite;
        }
      `}</style>

      {/* Solid Background Base */}
      <div className="absolute inset-0 bg-background -z-30" />

      {/* CityCanvas background — drifts in behind the reveal */}
      <motion.div
        className="themed-canvas absolute inset-0 w-full h-full pointer-events-none -z-20"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 1.18 }}
        transition={{ duration: 2.2, ease: EASE }}
      >
        <CityCanvas />
      </motion.div>

      {/* Dark gradient overlays to blend the canvas into the page */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 pointer-events-none -z-10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none -z-10" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none -z-10" />

      {/* Interactive Background Spotlight */}
      <div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-10 blur-[100px] pointer-events-none -z-10 transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, var(--glow) 0%, transparent 70%)',
          left: `${mousePos.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 4}px`,
          top: `${mousePos.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2}px`,
        }}
      />

      <div className="motion-blur max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center min-h-[70vh]">
        {/* Lab status */}
        <motion.div
          initial={false}
          animate={state}
          variants={{
            hide: { opacity: 0, y: 24, filter: 'blur(10px)' },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.9, ease: EASE, delay: 0.25 },
            },
          }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-ink" />
          </span>
          <p className="text-ink/60 uppercase tracking-[0.3em] text-xs md:text-sm font-semibold">
            CIP // VISION LAB
          </p>
        </motion.div>

        {/* Headline — each line rises out of its own clipping mask, so the
            type is pushed into place instead of fading in. */}
        <div
          className="mb-12 space-y-4 select-none"
          style={{
            transform: `translate3d(${parallax.x * -8}px, ${parallax.y * -6}px, 0)`,
            transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {LINES.map((line, i) => (
            <div key={line.text} className="overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.h1
                initial={false}
                animate={state}
                variants={{
                  hide: { y: '105%', x: line.from, opacity: 0, skewY: 4 },
                  show: {
                    y: '0%',
                    x: 0,
                    opacity: 1,
                    skewY: 0,
                    transition: { duration: 1.25, ease: EASE, delay: 0.32 + i * 0.12 },
                  },
                }}
                style={line.style}
                className={`text-6xl md:text-8xl lg:text-[7vw] tracking-tighter uppercase leading-none hoverable inline-block cursor-default ${line.className}`}
              >
                {line.text}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Description & action */}
        <motion.div
          initial={false}
          animate={state}
          variants={{
            hide: { opacity: 0, y: 30, filter: 'blur(10px)' },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 1, ease: EASE, delay: 0.78 },
            },
          }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-t border-ink/10 pt-8 mt-4"
        >
          <p className="max-w-md text-ink/50 text-sm md:text-base leading-relaxed">
            We design algorithms that map, process, and render the visual world with sub-pixel
            precision and cognitive intelligence.
          </p>
          <a
            href="#philosophy"
            className="group relative uppercase tracking-widest text-xs border border-ink/20 rounded-full px-6 py-4 hoverable whitespace-nowrap text-ink font-medium overflow-hidden"
          >
            {/* wipe fill rather than a flat colour swap */}
            <span className="absolute inset-0 bg-ink origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-background">
              Explore Our Matrix
            </span>
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={false}
        animate={state}
        variants={{
          hide: { opacity: 0, y: 10 },
          show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 1.1 } },
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-ink/30 font-mono">
          Scroll
        </span>
        <span className="block w-px h-10 bg-gradient-to-b from-ink/40 to-transparent" />
      </motion.div>
    </section>
  );
}

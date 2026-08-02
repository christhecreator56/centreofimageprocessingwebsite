import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CityCanvas from './CityCanvas';

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-12 pt-28 pb-16 overflow-hidden">
      {/* Dynamic Sensor Noise/Grain Overlay */}
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
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise-dance 0.6s steps(10) infinite;
        }
      `}</style>
      {/* Solid Background Base */}
      <div className="absolute inset-0 bg-[#0a0a0a] -z-30" />

      {/* CityCanvas Animation background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.7] -z-20">
        <CityCanvas />
      </div>

      {/* Dark gradient overlays to blend the canvas beautifully with the site background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80 pointer-events-none -z-10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none -z-10" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none -z-10" />

      {/* Interactive Background Spotlight */}
      <div 
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-10 blur-[100px] pointer-events-none -z-10 transition-all duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          left: `${mousePos.x - window.innerWidth / 4}px`,
          top: `${mousePos.y - window.innerHeight / 2}px`,
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center min-h-[70vh]">
        {/* Header Lab Status */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <p className="text-white/60 uppercase tracking-[0.3em] text-xs md:text-sm font-semibold">
            CIP // VISION LAB
          </p>
        </motion.div>

        {/* Staggered offset tagline - Giant Typography acting as hoverable cursor expand triggers */}
        <div className="mb-12 space-y-4 select-none">
          <motion.h1 
            initial={{ opacity: 0, x: -30, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[7vw] font-black tracking-tighter uppercase text-white leading-none hoverable inline-block cursor-default"
          >
            PERCEIVE.
          </motion.h1>
          <br />
          <motion.h1 
            initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="text-6xl md:text-8xl lg:text-[7vw] font-light tracking-tighter uppercase text-white/40 leading-none pl-12 md:pl-24 hoverable inline-block cursor-default"
          >
            PROCESS.
          </motion.h1>
          <br />
          <motion.h1 
            initial={{ opacity: 0, x: -10, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="text-6xl md:text-8xl lg:text-[7vw] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/10 leading-none hoverable inline-block cursor-default"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}
          >
            PERFECT.
          </motion.h1>
        </div>

        {/* Description & Action button */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-t border-white/10 pt-8 mt-4"
        >
          <p className="max-w-md text-white/50 text-sm md:text-base leading-relaxed">
            We design algorithms that map, process, and render the visual world with sub-pixel precision and cognitive intelligence.
          </p>
          <a
            href="#philosophy"
            className="uppercase tracking-widest text-xs border border-white/20 rounded-full px-6 py-4 hover:bg-white hover:text-black transition-colors duration-300 hoverable whitespace-nowrap text-white font-medium"
          >
            Explore Our Matrix
          </a>
        </motion.div>
      </div>
    </section>
  );
}

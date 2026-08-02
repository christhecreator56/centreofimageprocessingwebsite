import React from 'react';
import { motion } from 'framer-motion';

export default function Newsletter() {
  const scrollReveal = {
    hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="newsletter" className="py-32 px-6 md:px-12 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollReveal}
          className="flex justify-between items-end mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-white">Newsletter</h2>
          <p className="hidden md:block text-muted text-sm max-w-xs text-right">
            Archived reports and visual documentation from completed initiatives.
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            ...scrollReveal,
            visible: {
              ...scrollReveal.visible,
              transition: { ...scrollReveal.visible.transition, delay: 0.2 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Report 1 */}
          <a href="#" className="group block hoverable text-white">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 mb-6">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Lab Work"
                className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[0.9] transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted block mb-2">Report / Q2 2026</span>
                <h3 className="text-2xl font-medium tracking-tight group-hover:text-white/80 transition-colors">
                  Ocular V2 Launch Highlights
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-rotate-45">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
          
          {/* Report 2 */}
          <a href="#" className="group block hoverable md:mt-24 text-white">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 mb-6">
              <img
                src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Conference"
                className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[0.9] transition-all duration-500 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted block mb-2">Retrospective / 2025</span>
                <h3 className="text-2xl font-medium tracking-tight group-hover:text-white/80 transition-colors">
                  Annual Vision Conference Post-Mortem
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="-rotate-45">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

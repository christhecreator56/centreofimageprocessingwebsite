import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo-wordmark.png';
import { EASE } from './Reveal';

/**
 * Fixed mark in the top-left. It sits outside the transformed stage so it
 * stays pinned, and it scales down slightly once you scroll past the hero.
 */
export default function FloatingLogo() {
  return (
    <motion.a
      href="#"
      aria-label="Centre of Image Processing — back to top"
      className="hoverable group fixed left-3 top-3 z-[60] flex items-center gap-2 rounded-full border border-ink/10 bg-surface/60 px-2.5 py-1.5 shadow-lg backdrop-blur-md transition-colors duration-300 hover:border-ink/25 md:left-6 md:top-6 md:gap-3 md:px-3 md:py-2"
      initial={{ opacity: 0, x: -18, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
    >
      <img
        src={logoImg}
        alt=""
        className="themed-logo pointer-events-none h-5 w-auto select-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 md:h-7"
      />
      <span className="pr-1 font-mono text-[9px] uppercase tracking-[0.28em] text-muted transition-colors duration-300 group-hover:text-ink md:text-[10px]">
        CIP
      </span>
    </motion.a>
  );
}

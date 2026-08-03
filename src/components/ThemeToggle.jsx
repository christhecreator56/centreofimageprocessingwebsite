import React, { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { EASE } from './Reveal';

/**
 * Floating theme switch, top-right. The icon isn't swapped — the sun's rays
 * retract and a shadow slides across the disc to become the moon, so the
 * two states are one continuous object.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const ref = useRef(null);
  const isLight = theme === 'light';
  // The toggle is rendered twice (desktop + mobile bar), so the mask needs
  // an id unique to the instance or both resolve to the first one's mask.
  const maskId = `theme-toggle-mask-${useId().replace(/:/g, '')}`;

  const handleClick = () => {
    const r = ref.current?.getBoundingClientRect();
    toggleTheme(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      aria-pressed={isLight}
      className="hoverable group relative flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-surface/70 backdrop-blur-md shadow-lg transition-colors duration-300 hover:border-ink/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/30"
    >
      <span className="sr-only">Toggle colour theme</span>

      <svg width="19" height="19" viewBox="0 0 24 24" className="overflow-visible text-ink">
        {/* rays — retract into the disc on the way to the moon */}
        <motion.g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: isLight ? 1 : 0, rotate: isLight ? 0 : -45, scale: isLight ? 1 : 0.55 }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{ transformOrigin: '12px 12px' }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="12"
              y1="2.5"
              x2="12"
              y2="5"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </motion.g>

        {/* the disc, with a mask that slides in to bite a crescent out of it */}
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="#fff" />
          <motion.circle
            r="9"
            fill="#000"
            /* attributes carry the current state so the shape is correct on
               the very first paint, before any animation runs */
            cx={isLight ? 30 : 17}
            cy={isLight ? -6 : 7}
            initial={false}
            animate={{ cx: isLight ? 30 : 17, cy: isLight ? -6 : 7 }}
            transition={{ duration: 0.55, ease: EASE }}
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          r={isLight ? 5 : 8.2}
          fill="currentColor"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: isLight ? 5 : 8.2 }}
          transition={{ duration: 0.55, ease: EASE }}
        />
      </svg>
    </button>
  );
}

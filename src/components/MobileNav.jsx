import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { EASE } from './Reveal';

const ITEMS = [
  {
    id: 'top',
    label: 'Home',
    icon: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>
    ),
  },
  {
    id: 'projects',
    label: 'Work',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    id: 'newsletter',
    label: 'Reports',
    icon: (
      <>
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        <path d="m22 6-10 7L2 6" />
      </>
    ),
  },
  {
    id: 'contact',
    label: 'Connect',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
];

/**
 * Phone navigation: a docked bar at the bottom of the screen.
 *
 * The desktop dock lives at the top because that is where a cursor expects a
 * menu. A thumb does not reach there. This sits in the bottom third, tracks
 * which section you are actually looking at, and slides a pill under the
 * active item using a shared layout animation rather than a hard swap.
 *
 * It also hides itself while you scroll down and comes back the moment you
 * scroll up, so it never sits on top of the content you are reading.
 */
export default function MobileNav() {
  const [active, setActive] = useState('top');
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const sections = ITEMS.filter((i) => i.id !== 'top')
      .map((i) => ({ id: i.id, el: document.getElementById(i.id) }))
      .filter((s) => s.el);

    let frame = 0;
    const measure = () => {
      frame = 0;
      const y = window.scrollY;

      // Auto-hide on the way down, reveal on the way up. The 6px deadband
      // stops momentum jitter from flapping the bar.
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 220);
        lastY.current = y;
      }

      // "Current" section = the last one whose top has passed the 45% line.
      const line = window.innerHeight * 0.45;
      let current = 'top';
      for (const s of sections) {
        if (s.el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.nav
      aria-label="Sections"
      className="fixed inset-x-3 bottom-3 z-[70] md:hidden"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: hidden ? 96 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-1 rounded-[1.4rem] border border-ink/10 bg-surface/85 p-1.5 shadow-[0_12px_40px_var(--shadow-tint)] backdrop-blur-md">
        {ITEMS.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={on ? 'true' : undefined}
              aria-label={item.label}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-transform duration-200 active:scale-90"
            >
              {on && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 rounded-2xl bg-ink/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`relative z-10 transition-colors duration-300 ${on ? 'text-ink' : 'text-muted'}`}
              >
                {item.icon}
              </svg>
              <span
                className={`relative z-10 text-[9px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  on ? 'text-ink' : 'text-muted'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        <span className="mx-0.5 h-8 w-px bg-ink/10" />

        <div className="flex items-center px-0.5">
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}

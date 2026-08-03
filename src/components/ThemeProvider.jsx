import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cip-theme';
const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

/** Read whatever the pre-paint script in index.html already decided. */
function readInitialTheme() {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.dataset.theme;
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* private mode — fall through to the system preference */
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);
  // Only follow the OS while the visitor hasn't made a choice of their own.
  const [pinned, setPinned] = useState(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Release the pre-paint curtain colour once React owns the page.
  useEffect(() => {
    document.documentElement.style.backgroundColor = '';
  }, []);

  useEffect(() => {
    if (pinned) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (e) => setThemeState(e.matches ? 'light' : 'dark');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pinned]);

  /**
   * The swap itself. Where the View Transitions API exists we clip the new
   * theme in as a circle growing from the toggle, which matches the QR
   * aperture language the rest of the site uses. Everywhere else we fall
   * back to a short colour cross-fade.
   */
  const applyTheme = useCallback((next, origin) => {
    setPinned(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* nothing we can do; the in-memory choice still holds for this visit */
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;

    if (reduced || !document.startViewTransition || !origin) {
      root.classList.add('theme-fading');
      setThemeState(next);
      window.setTimeout(() => root.classList.remove('theme-fading'), 460);
      return;
    }

    const { x, y } = origin;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => setThemeState(next));
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: 620,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => {
        /* a transition can be skipped if another starts — the state still applied */
      });
  }, []);

  const toggleTheme = useCallback(
    (origin) => applyTheme(theme === 'dark' ? 'light' : 'dark', origin),
    [theme, applyTheme]
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: applyTheme }),
    [theme, toggleTheme, applyTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;

import React from 'react';
import { motion } from 'framer-motion';

/** One easing curve for the whole site, so every transition feels related. */
export const EASE = [0.16, 1, 0.3, 1];
export const EASE_SOFT = [0.33, 1, 0.68, 1];

const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' };

/**
 * Blur-up block reveal. Drop it around any chunk of a section.
 *
 *   <Reveal delay={0.1}><h2>…</h2></Reveal>
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 44,
  x = 0,
  blur = 14,
  duration = 1.05,
  once = true,
  as: Tag = 'div',
  ...rest
}) {
  const M = motion[Tag] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, x, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

/**
 * Stagger container. Children wrapped in <RevealItem> fire in sequence
 * once the group scrolls into view.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  once = true,
  as: Tag = 'div',
  ...rest
}) {
  const M = motion[Tag] || motion.div;
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function RevealItem({ children, className, y = 36, blur = 12, as: Tag = 'div', ...rest }) {
  const M = motion[Tag] || motion.div;
  return (
    <M
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 1, ease: EASE },
        },
      }}
      {...rest}
    >
      {children}
    </M>
  );
}

/**
 * Word-by-word rise out of a clipping mask — the editorial headline move.
 * Each word sits in an overflow-hidden box and slides up from below it,
 * so the text appears to be pushed into place rather than faded in.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  duration = 0.95,
  once = true,
  as: Tag = 'span',
  ...rest
}) {
  const M = motion[Tag] || motion.span;
  const words = String(text).split(' ');

  return (
    <M
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{
            paddingBottom: '0.14em',
            marginBottom: '-0.14em',
            marginRight: i < words.length - 1 ? '0.26em' : 0,
          }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', opacity: 0 },
              visible: { y: '0%', opacity: 1, transition: { duration, ease: EASE } },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </M>
  );
}

export default Reveal;

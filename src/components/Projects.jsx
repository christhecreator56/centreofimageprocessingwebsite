import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal, RevealWords, EASE } from './Reveal';
import { scrollBlur } from '../lib/scrollBlur';
import { useProjects } from '../lib/useContent';
import { usePhone } from '../lib/useMediaQuery';

function CardBody({ project, compact = false }) {
  return (
    <>
      <div
        className={`order-2 flex w-full flex-col justify-between md:order-1 md:h-full md:w-1/2 ${
          compact ? 'h-auto p-6' : 'h-1/2 p-8 md:p-16'
        }`}
      >
        <div>
          <span className="text-xs uppercase tracking-widest text-muted">
            {project.year} / {project.category}
          </span>
          <h3
            className={`mt-3 font-medium tracking-tighter text-ink ${
              compact ? 'text-2xl' : 'text-3xl md:mt-4 md:text-5xl'
            }`}
          >
            {project.title}
          </h3>
          <p
            className={`mt-4 max-w-sm leading-relaxed text-muted ${
              compact ? 'text-sm' : 'text-sm md:mt-6 md:text-base'
            }`}
          >
            {project.description}
          </p>
        </div>
        <div className={compact ? 'mt-5' : 'mt-8'}>
          <a
            href={project.link_url || '#'}
            className="group/btn relative inline-block overflow-hidden rounded-full border border-ink/30 px-6 py-3 text-xs uppercase tracking-widest text-ink hoverable"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:scale-x-100" />
            <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-background">
              Read Case Study
            </span>
          </a>
        </div>
      </div>

      <div
        className={`relative order-1 w-full overflow-hidden md:order-2 md:h-full md:w-1/2 ${
          compact ? 'h-48' : 'h-1/2'
        }`}
      >
        {project.image_url && (
          <img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover contrast-[1.1] brightness-[0.9] grayscale filter transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:contrast-100 group-hover:brightness-100 group-hover:grayscale-0"
          />
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Phone: a swipeable deck.
 *
 * The desktop stack works by pinning cards to the viewport for a full screen
 * each — on a phone that means four screens of scrolling to see three items,
 * and the recede effect is invisible because the card fills the display. A
 * horizontal snap track puts the whole set one thumb-flick apart instead, and
 * the cards tilt slightly toward the centre as they pass.
 * -------------------------------------------------------------------------- */
function ProjectDeck({ projects }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (el.clientWidth * 0.86));
    setActive(Math.max(0, Math.min(projects.length - 1, i)));
  }, [projects.length]);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth * 0.86, behavior: 'smooth' });
  };

  return (
    <div className="-mx-6">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2"
        style={{ scrollPaddingLeft: '1.5rem' }}
      >
        {projects.map((project, i) => (
          <motion.article
            key={project.id}
            className="group w-[86%] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-ink/10 bg-surface"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            animate={{
              scale: active === i ? 1 : 0.96,
              opacity: active === i ? 1 : 0.72,
            }}
          >
            <div className="flex flex-col">
              <CardBody project={project} compact />
            </div>
          </motion.article>
        ))}
      </div>

      {/* progress rail — the active pill stretches rather than jumping */}
      <div className="mt-6 flex items-center justify-center gap-2 px-6">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Go to ${p.title}`}
            onClick={() => goTo(i)}
            className="h-1.5 rounded-full bg-ink/15 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: active === i ? 28 : 8,
              backgroundColor: active === i ? 'var(--color-ink)' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function Projects() {
  const projects = useProjects();
  const isPhone = usePhone();
  const containerRef = useRef(null);

  useEffect(() => {
    if (isPhone) return; // the deck has no stacking behaviour to drive
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.stacked-card');
      // This handler owns `filter` on the cards, so the scroll blur has to be
      // composed in here rather than applied through the .motion-blur class.
      const mb = scrollBlur.value > 0.05 ? ` blur(${scrollBlur.value.toFixed(2)}px)` : '';

      cards.forEach((card, i) => {
        if (i === cards.length - 1) {
          card.style.transform = 'scale(1) translateY(0px)';
          card.style.filter = `brightness(1) saturate(1)${mb}`;
          card.style.opacity = '1';
          return;
        }

        const nextCard = cards[i + 1];
        if (!nextCard) return;

        const cardRect = card.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        const stickyTop = window.innerHeight * 0.1 + i * 20;

        if (cardRect.top <= stickyTop + 2) {
          let p = (window.innerHeight - nextRect.top) / (window.innerHeight - stickyTop);
          p = Math.max(0, Math.min(1, p));
          const e = p * p * (3 - 2 * p);
          card.style.transform = `scale(${1 - e * 0.07}) translateY(${-e * 26}px)`;
          card.style.filter = `brightness(${1 - e * 0.55}) saturate(${1 - e * 0.5})${mb}`;
          card.style.opacity = `${1 - e * 0.25}`;
        } else {
          card.style.transform = 'scale(1) translateY(0px)';
          card.style.filter = `brightness(1) saturate(1)${mb}`;
          card.style.opacity = '1';
        }
      });
    };

    // Reads layout, so coalesce to one pass per frame rather than one per event.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Keep ticking for a few frames after scrolling stops so the blur eases
    // out instead of snapping off with the last scroll event.
    let settle = requestAnimationFrame(function settleTick() {
      if (scrollBlur.value > 0.05) update();
      settle = requestAnimationFrame(settleTick);
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(settle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isPhone, projects.length]);

  return (
    <section id="projects" className="relative z-10 bg-background px-6 py-24 md:px-12 md:py-32">
      <div className="motion-blur mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between md:mb-16">
          <RevealWords
            as="h2"
            text="Applied Research"
            className="block text-4xl font-medium tracking-tighter text-ink md:text-6xl"
          />
        </div>

        {isPhone ? (
          <ProjectDeck projects={projects} />
        ) : (
          <div ref={containerRef} className="relative w-full pb-32" id="card-stack-container">
            {projects.map((project, index) => (
              /* The outer box owns the sticky stack transform (driven by the
                 scroll handler); the inner Reveal owns the entrance. Keeping
                 them on separate elements stops the two from fighting over
                 the same `transform`. */
              <div
                key={project.id}
                className="stacked-card h-[75vh] w-full rounded-[2rem] shadow-2xl"
                style={{
                  position: 'sticky',
                  top: `calc(10vh + ${index * 20}px)`,
                  transformOrigin: 'top center',
                  willChange: 'transform, filter, opacity',
                  zIndex: (index + 1) * 10,
                  marginBottom: index < projects.length - 1 ? '15vh' : '0',
                }}
              >
                <Reveal
                  y={70}
                  blur={16}
                  duration={1.15}
                  className={`group flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-ink/10 md:flex-row ${
                    index % 2 === 1 ? 'bg-elevated' : 'bg-surface'
                  }`}
                >
                  <CardBody project={project} />
                </Reveal>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

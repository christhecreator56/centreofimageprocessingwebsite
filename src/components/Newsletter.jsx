import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem, RevealWords, EASE } from './Reveal';
import { useReports } from '../lib/useContent';
import { usePhone } from '../lib/useMediaQuery';

/** Body-scroll lock that survives the dialog's exit animation. */
function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [active]);
}

function DetailBody({ report, idPrefix }) {
  return (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {report.image_url && (
          <motion.img
            src={report.image_url}
            alt={report.image_alt || ''}
            className="h-full w-full object-cover"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />
        <motion.p
          className="absolute inset-x-0 bottom-0 px-6 pb-5 text-sm leading-relaxed text-muted md:px-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
        >
          {report.caption}
        </motion.p>
      </div>

      <div className="px-6 pb-10 pt-6 md:px-10">
        <motion.span
          className="mb-3 block text-xs uppercase tracking-widest text-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.26 }}
        >
          {report.kicker}
        </motion.span>

        <motion.h3
          id={`${idPrefix}-title`}
          className="text-3xl font-medium tracking-tighter text-ink md:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
        >
          {report.title}
        </motion.h3>

        <motion.p
          className="mt-6 max-w-2xl text-sm leading-relaxed text-muted md:text-base"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.36 }}
        >
          {report.summary}
        </motion.p>

        <motion.dl
          className="mt-10 grid grid-cols-1 gap-6 border-t border-ink/10 pt-6 sm:grid-cols-3"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.42 }}
        >
          {[
            ['Published', report.published_on],
            ['Read time', report.read_time],
            ['Team', report.team],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">{label}</dt>
                <dd className="mt-1 text-base font-medium text-ink">{value}</dd>
              </div>
            ))}
        </motion.dl>

        {report.tags?.length > 0 && (
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.48 }}
          >
            {report.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink/15 px-3 py-1 text-[11px] uppercase tracking-widest text-muted"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- *
 * Phone: a drag-to-dismiss bottom sheet.
 *
 * A centred modal on a phone puts the close button at the top of a tall panel,
 * which is the hardest place on the screen to reach one-handed. The sheet
 * rises from the bottom edge, dims its own backdrop in proportion to how far
 * you have dragged it, and throws away on a flick — so dismissing it never
 * requires aiming at anything.
 * -------------------------------------------------------------------------- */
function ReportSheet({ report, onClose }) {
  const y = useMotionValue(0);
  const backdrop = useTransform(y, [0, 400], [1, 0]);

  useScrollLock(Boolean(report));

  useEffect(() => {
    if (!report) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [report, onClose]);

  return createPortal(
    <AnimatePresence>
      {report && (
        <div className="fixed inset-0 z-[9500]" role="dialog" aria-modal="true" aria-labelledby={`${report.id}-title`}>
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-background/70 backdrop-blur-xl"
            style={{ opacity: backdrop }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />

          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto hide-scrollbar rounded-t-3xl border-t border-ink/10 bg-surface shadow-[0_-20px_80px_var(--shadow-tint)]"
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              // Either a decisive flick or a long drag closes it.
              if (info.offset.y > 140 || info.velocity.y > 700) onClose();
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            <div className="sticky top-0 z-20 flex justify-center bg-gradient-to-b from-surface to-transparent pb-2 pt-3">
              <span className="h-1.5 w-11 rounded-full bg-ink/20" />
            </div>
            <div className="-mt-8">
              <DetailBody report={report} idPrefix={report.id} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* -------------------------------------------------------------------------- *
 * Desktop: centred dialog
 * -------------------------------------------------------------------------- */
function ReportDialog({ report, onClose }) {
  useScrollLock(Boolean(report));

  useEffect(() => {
    if (!report) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [report, onClose]);

  // Portalled to <body>: the section sits inside a `relative z-10` wrapper
  // that forms a stacking context, so an in-place dialog would be trapped
  // beneath the nav no matter how high its z-index.
  return createPortal(
    <AnimatePresence>
      {report && (
        <motion.div
          className="fixed inset-0 z-[9500] flex items-center justify-center p-4 md:p-8"
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${report.id}-title`}
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-none bg-background/70 backdrop-blur-xl"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.4, ease: EASE }}
          />

          <motion.div
            className="hide-scrollbar relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-ink/10 bg-surface shadow-[0_40px_120px_var(--shadow-tint)]"
            variants={{
              hidden: { opacity: 0, y: 40, scale: 0.94, filter: 'blur(16px)' },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.72, ease: EASE },
              },
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close report details"
              className="hoverable absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-surface/80 text-ink backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-90 hover:bg-ink hover:text-background"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <DetailBody report={report} idPrefix={report.id} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */

export default function Newsletter() {
  const reports = useReports();
  const isPhone = usePhone();
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="newsletter" className="relative bg-background px-6 py-24 md:px-12 md:py-32">
      <div className="motion-blur mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between md:mb-16">
          <RevealWords
            as="h2"
            text="Newsletter"
            className="block text-4xl font-medium tracking-tighter text-ink md:text-6xl"
          />
          <Reveal
            as="p"
            delay={0.15}
            y={20}
            blur={8}
            className="hidden max-w-xs text-right text-sm text-muted md:block"
          >
            Archived reports and visual documentation from completed initiatives.
          </Reveal>
        </div>

        <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2" stagger={0.14} delay={0.1}>
          {reports.map((report, i) => (
            <RevealItem key={report.id} className={i % 2 === 1 ? 'md:mt-24' : undefined}>
              <button
                type="button"
                onClick={() => setActive(report)}
                aria-haspopup="dialog"
                className="hoverable group block w-full text-left text-ink"
              >
                <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-ink/10">
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.image_alt || ''}
                      loading="lazy"
                      className="h-full w-full object-cover contrast-[1.1] brightness-[0.9] grayscale filter transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07] group-hover:contrast-100 group-hover:brightness-100 group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-background/20 transition-colors duration-500 group-hover:bg-transparent" />

                  {/* The short detail. On desktop it slides up on hover; on a
                      phone there is no hover, so it simply sits there. */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-y-3 md:p-5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                    <div className="rounded-xl border border-ink/10 bg-surface/85 p-4 backdrop-blur-md">
                      <p className="text-xs leading-relaxed text-muted">{report.caption}</p>
                      <span className="mt-2 block text-[10px] uppercase tracking-[0.25em] text-ink">
                        {isPhone ? 'Tap for details' : 'View details'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted">
                      {report.kicker}
                    </span>
                    <h3 className="text-xl font-medium tracking-tight transition-colors group-hover:text-ink/80 md:text-2xl">
                      {report.title}
                    </h3>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-45 group-hover:scale-110 group-hover:bg-ink group-hover:text-background">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="-rotate-45"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {isPhone ? (
        <ReportSheet report={active} onClose={close} />
      ) : (
        <ReportDialog report={active} onClose={close} />
      )}
    </section>
  );
}

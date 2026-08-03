import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal, RevealWords, EASE } from './Reveal';
import { useEvents } from '../lib/useContent';
import { groupEventsByMonth } from '../lib/content';
import { usePhone } from '../lib/useMediaQuery';

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-500 hover:text-background',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    card: 'border-l-4 border-emerald-500',
    tag: 'text-emerald-500 bg-emerald-500/10',
  },
  cyan: {
    bg: 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 text-cyan-500 hover:text-background',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    card: 'border-l-4 border-cyan-500',
    tag: 'text-cyan-500 bg-cyan-500/10',
  },
  purple: {
    bg: 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500 text-purple-500 hover:text-background',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    card: 'border-l-4 border-purple-500',
    tag: 'text-purple-500 bg-purple-500/10',
  },
  amber: {
    bg: 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 text-amber-500 hover:text-background',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    card: 'border-l-4 border-amber-500',
    tag: 'text-amber-500 bg-amber-500/10',
  },
  rose: {
    bg: 'bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 text-rose-500 hover:text-background',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
    card: 'border-l-4 border-rose-500',
    tag: 'text-rose-500 bg-rose-500/10',
  },
  yellow: {
    bg: 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500 text-yellow-600 hover:text-background',
    dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]',
    card: 'border-l-4 border-yellow-500',
    tag: 'text-yellow-600 bg-yellow-500/10',
  },
};

const accentOf = (name) => colorMap[name] || colorMap.emerald;
const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* -------------------------------------------------------------------------- *
 * Phone: a vertical agenda.
 *
 * A 7-column grid on a 390px screen gives 44px cells that are hard to hit and
 * impossible to label. The agenda carries the same events and the same month
 * paging, but reads as a list you can scan and tap — rows spring in from the
 * side, staggered off each month change, and expand in place.
 * -------------------------------------------------------------------------- */
function AgendaView({ month, data, onPrev, onNext, canPrev, canNext }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-medium tracking-tight text-ink">{month}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-all duration-300 active:scale-90 disabled:opacity-30"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-all duration-300 active:scale-90 disabled:opacity-30"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={month}
          className="flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          exit="out"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07 } },
            out: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
          }}
        >
          {data.list.length === 0 && (
            <motion.li
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
                out: { opacity: 0 },
              }}
              className="rounded-2xl border border-dashed border-ink/15 px-5 py-10 text-center text-sm text-muted"
            >
              Nothing scheduled this month.
            </motion.li>
          )}

          {data.list.map((ev) => {
            const c = accentOf(ev.color);
            const open = openId === ev.id;
            return (
              <motion.li
                key={ev.id}
                variants={{
                  hidden: { opacity: 0, x: 28, filter: 'blur(8px)' },
                  visible: {
                    opacity: 1,
                    x: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.7, ease: EASE },
                  },
                  out: { opacity: 0, x: -20, transition: { duration: 0.25 } },
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : ev.id)}
                  aria-expanded={open}
                  className={`w-full rounded-2xl bg-surface px-4 py-4 text-left transition-transform duration-300 active:scale-[0.985] ${c.card}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-background py-2">
                      <span className="text-lg font-semibold leading-none text-ink">{ev.day}</span>
                      <span className="mt-1 text-[9px] uppercase tracking-widest text-muted">
                        {DAY_INITIALS[ev.date.getDay()]}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${c.tag}`}
                      >
                        {ev.type}
                      </span>
                      <h4 className="text-base font-semibold leading-snug text-ink">{ev.title}</h4>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.p
                            className="overflow-hidden text-sm leading-relaxed text-muted"
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            {ev.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.span
                      className="mt-1 shrink-0 text-muted"
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </motion.span>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Desktop: the calendar grid
 * -------------------------------------------------------------------------- */
function CalendarView({ month, data, onPrev, onNext, canPrev, canNext, active, onHover }) {
  const cells = [];
  for (let i = 0; i < data.emptyDays; i++) cells.push({ type: 'empty', val: i });
  for (let d = 1; d <= data.daysInMonth; d++) {
    cells.push({ type: data.events[d] ? 'event' : 'day', val: d, event: data.events[d] });
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-background p-6 shadow-2xl md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--glow)_0%,transparent_60%)] opacity-20" />

      <div className="relative z-10 mb-8 flex items-center justify-between">
        <h3 className="text-2xl font-medium tracking-tight text-ink">{month}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Previous month"
            className="hoverable flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 hover:bg-ink hover:text-background disabled:pointer-events-none disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Next month"
            className="hoverable flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 hover:bg-ink hover:text-background disabled:pointer-events-none disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative z-10 mb-2 grid grid-cols-7 gap-2 text-center">
        {DAY_INITIALS.map((d, i) => (
          <span key={i} className="text-[10px] uppercase tracking-widest text-muted">
            {d}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={month}
          className="relative z-10 grid grid-cols-7 gap-2"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {cells.map((cell, i) =>
            cell.type === 'empty' ? (
              <div key={`e${i}`} className="aspect-square" />
            ) : cell.event ? (
              <motion.button
                key={cell.val}
                type="button"
                onMouseEnter={() => onHover(cell.event)}
                onFocus={() => onHover(cell.event)}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`hoverable relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors duration-300 ${accentOf(cell.event.color).bg} ${
                  active?.id === cell.event.id ? 'ring-1 ring-ink/30' : ''
                }`}
              >
                {cell.val}
                <span className={`mt-1 h-1 w-1 rounded-full ${accentOf(cell.event.color).dot}`} />
              </motion.button>
            ) : (
              <div
                key={cell.val}
                className="flex aspect-square items-center justify-center rounded-xl text-sm text-muted/50"
              >
                {cell.val}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function Events() {
  const events = useEvents();
  const isPhone = usePhone();
  const { months, byMonth } = useMemo(() => groupEventsByMonth(events), [events]);

  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(null);

  // Land on the first month that actually has something in it, and re-run when
  // rows arrive from the database.
  useEffect(() => {
    if (!months.length) return;
    const firstWithEvents = months.findIndex((m) => byMonth[m].list.length > 0);
    const start = firstWithEvents < 0 ? 0 : firstWithEvents;
    setIndex(start);
    setActive(byMonth[months[start]].list[0] || null);
  }, [months, byMonth]);

  if (!months.length) return null;

  const month = months[index];
  const data = byMonth[month];

  const go = (delta) => {
    const next = Math.min(months.length - 1, Math.max(0, index + delta));
    setIndex(next);
    setActive(byMonth[months[next]].list[0] || null);
  };

  return (
    <section
      id="events"
      className="relative border-y border-ink/10 bg-surface px-6 py-24 md:px-12 md:py-48"
    >
      <div className="motion-blur mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="flex min-h-[180px] flex-col justify-between lg:col-span-5 lg:min-h-[380px]">
            <div>
              <RevealWords
                as="h2"
                text="Events & Reviews"
                className="mb-4 block text-4xl font-medium tracking-tighter text-ink md:text-6xl"
              />
              <Reveal as="p" delay={0.18} y={24} blur={8} className="max-w-md text-sm text-muted md:text-base">
                Discover upcoming symposiums, public lectures, and internal project review dates for
                the current quarter.
              </Reveal>
            </div>

            {/* The hover detail card is a desktop affordance — on a phone the
                agenda rows expand in place instead. */}
            {!isPhone && (
              <div className="relative mt-12 min-h-[160px]">
                <AnimatePresence mode="wait">
                  {active ? (
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className={`rounded-2xl bg-background p-6 shadow-xl ${accentOf(active.color).card}`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-muted">
                          {active.date.toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${accentOf(active.color).tag}`}
                        >
                          {active.type}
                        </span>
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold text-ink">{active.title}</h3>
                      <p className="text-sm leading-relaxed text-muted">{active.desc}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full items-center text-sm text-muted"
                    >
                      Hover a highlighted date to inspect the entry.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <Reveal className="lg:col-span-7" delay={0.12} y={40}>
            {isPhone ? (
              <AgendaView
                month={month}
                data={data}
                onPrev={() => go(-1)}
                onNext={() => go(1)}
                canPrev={index > 0}
                canNext={index < months.length - 1}
              />
            ) : (
              <CalendarView
                month={month}
                data={data}
                onPrev={() => go(-1)}
                onNext={() => go(1)}
                canPrev={index > 0}
                canNext={index < months.length - 1}
                active={active}
                onHover={setActive}
              />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

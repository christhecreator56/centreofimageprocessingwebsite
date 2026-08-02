import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const months = ["July 2026", "August 2026", "September 2026"];

const monthData = {
  "July 2026": {
    emptyDays: 3, // July 2026 starts on Wednesday
    daysInMonth: 31,
    events: {
      10: { title: "Edge AI Benchmark", desc: "Comparative latency and compute testing of real-time vision pipelines.", type: "symposium", color: "purple" },
      24: { title: "Optical Flow Workshop", desc: "Collaborative session designing dense pixel flow motion estimators.", type: "workshop", color: "amber" }
    }
  },
  "August 2026": {
    emptyDays: 6, // August 2026 starts on Saturday
    daysInMonth: 31,
    events: {
      15: { title: "Quantum Imaging Symposium", desc: "Annual gathering of lead researchers discussing photon-level image reconstruction.", type: "symposium", color: "emerald" },
      28: { title: "Project Genesis Review", desc: "Quarterly internal review of the Genesis architecture and performance metrics.", type: "review", color: "cyan" }
    }
  },
  "September 2026": {
    emptyDays: 2, // September 2026 starts on Tuesday
    daysInMonth: 30,
    events: {
      8: { title: "Neural Fields Masterclass", desc: "Deep dive into coordinate-based neural representations and volumetric rendering.", type: "workshop", color: "rose" },
      22: { title: "CIP Advisory Meeting", desc: "Bi-annual review panel evaluating funding, patents, and paper submissions.", type: "review", color: "yellow" }
    }
  }
};

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 text-emerald-400 hover:text-black',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    card: 'border-l-4 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.05)]',
    tag: 'text-emerald-400 bg-emerald-500/10'
  },
  cyan: {
    bg: 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 text-cyan-400 hover:text-black',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    card: 'border-l-4 border-cyan-500 shadow-[0_4px_20px_rgba(6,182,212,0.05)]',
    tag: 'text-cyan-400 bg-cyan-500/10'
  },
  purple: {
    bg: 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500 text-purple-400 hover:text-black',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    card: 'border-l-4 border-purple-500 shadow-[0_4px_20px_rgba(139,92,246,0.05)]',
    tag: 'text-purple-400 bg-purple-500/10'
  },
  amber: {
    bg: 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 text-amber-400 hover:text-black',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    card: 'border-l-4 border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.05)]',
    tag: 'text-amber-400 bg-amber-500/10'
  },
  rose: {
    bg: 'bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 text-rose-400 hover:text-black',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
    card: 'border-l-4 border-rose-500 shadow-[0_4px_20px_rgba(244,63,94,0.05)]',
    tag: 'text-rose-400 bg-rose-500/10'
  },
  yellow: {
    bg: 'bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500 text-yellow-400 hover:text-black',
    dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]',
    card: 'border-l-4 border-yellow-500 shadow-[0_4px_20px_rgba(234,179,8,0.05)]',
    tag: 'text-yellow-400 bg-yellow-500/10'
  }
};

export default function Events() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1); // default to August 2026
  
  // Set default active event for August 15
  const [hoveredEvent, setHoveredEvent] = useState(monthData["August 2026"].events[15]);
  const [hoveredDate, setHoveredDate] = useState(15);

  const currentMonthName = months[currentMonthIndex];
  const currentMonth = monthData[currentMonthName];
  const { emptyDays, daysInMonth, events } = currentMonth;

  const calendarCells = [];
  for (let i = 0; i < emptyDays; i++) {
    calendarCells.push({ type: 'empty', val: i });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const event = events[i];
    calendarCells.push({ type: event ? 'event' : 'day', val: i, event });
  }

  const handleMouseEnter = (dateNum, event) => {
    if (event) {
      setHoveredEvent(event);
      setHoveredDate(dateNum);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const nextIndex = currentMonthIndex - 1;
      setCurrentMonthIndex(nextIndex);
      const newMonth = monthData[months[nextIndex]];
      const firstEventDay = Object.keys(newMonth.events)[0];
      if (firstEventDay) {
        setHoveredEvent(newMonth.events[firstEventDay]);
        setHoveredDate(Number(firstEventDay));
      } else {
        setHoveredEvent(null);
        setHoveredDate(null);
      }
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      const nextIndex = currentMonthIndex + 1;
      setCurrentMonthIndex(nextIndex);
      const newMonth = monthData[months[nextIndex]];
      const firstEventDay = Object.keys(newMonth.events)[0];
      if (firstEventDay) {
        setHoveredEvent(newMonth.events[firstEventDay]);
        setHoveredDate(Number(firstEventDay));
      } else {
        setHoveredEvent(null);
        setHoveredDate(null);
      }
    }
  };

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
    <section id="events" className="py-32 md:py-48 px-6 md:px-12 bg-surface relative border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left panel: Info & Event Description */}
          <div className="lg:col-span-5 flex flex-col justify-between min-h-[380px]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scrollReveal}
            >
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-4 text-white">Events & Reviews</h2>
              <p className="text-muted text-sm md:text-base max-w-md">
                Discover upcoming symposiums, public lectures, and internal project review dates for the current quarter.
              </p>
            </motion.div>
            
            {/* Interactive Details Card */}
            <div className="mt-12 relative min-h-[160px]">
              <AnimatePresence mode="wait">
                {hoveredEvent ? (
                  <motion.div
                    key={`${currentMonthName}-${hoveredDate}`}
                    initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`p-6 bg-background border border-white/5 rounded-2xl w-full ${colorMap[hoveredEvent.color]?.card}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs uppercase tracking-widest text-muted">
                        {currentMonthName.split(" ")[0]} {hoveredDate}, 2026
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${colorMap[hoveredEvent.color]?.tag}`}>
                        {hoveredEvent.type}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-white">{hoveredEvent.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{hoveredEvent.desc}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted italic pt-8"
                  >
                    Hover over a highlighted date to view details.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Right panel: Calendar Grid */}
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
            className="lg:col-span-7"
          >
            {/* Custom Calendar UI */}
            <div className="bg-background rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              
              {/* Decorative grid background lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-medium text-white tracking-tight">{currentMonthName}</h3>
                
                {/* Month Toggles */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    disabled={currentMonthIndex === 0}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hoverable text-white ${
                      currentMonthIndex === 0 
                        ? 'border-white/5 text-white/20 cursor-not-allowed' 
                        : 'border-white/20 hover:bg-white hover:text-black'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    disabled={currentMonthIndex === months.length - 1}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hoverable text-white ${
                      currentMonthIndex === months.length - 1 
                        ? 'border-white/5 text-white/20 cursor-not-allowed' 
                        : 'border-white/20 hover:bg-white hover:text-black'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Days Header */}
              <div className="grid grid-cols-7 mb-4 text-center text-xs tracking-widest uppercase text-muted font-bold relative z-10">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 relative z-10">
                {calendarCells.map((cell, index) => {
                  if (cell.type === 'empty') {
                    return <div key={`empty-${index}`} className="aspect-square flex items-center justify-center text-xs text-muted/20" />;
                  }
                  
                  if (cell.type === 'event') {
                    const activeColorClass = colorMap[cell.event.color]?.bg;
                    const isSelected = hoveredDate === cell.val;

                    return (
                      <motion.div
                        key={`day-event-${cell.val}`}
                        onMouseEnter={() => handleMouseEnter(cell.val, cell.event)}
                        whileHover={{ y: -3, scale: 1.05 }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold cursor-pointer relative transition-all duration-300 ${activeColorClass} ${
                          isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''
                        }`}
                      >
                        <span>{cell.val}</span>
                        {/* Custom Neon Glowing Dot Indicator */}
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-2.5 ${colorMap[cell.event.color]?.dot}`} />
                      </motion.div>
                    );
                  }
                  
                  return (
                    <div
                      key={`day-${cell.val}`}
                      className="aspect-square bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center text-sm text-white/30"
                    >
                      {cell.val}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dock } from './Dock';
import logoImg from '../assets/logo.png';

const PhilosophyIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const NewsletterIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ConnectIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const dockItems = [
    {
      icon: (
        <img src={logoImg} alt="Logo" className="h-[60%] w-auto max-w-[80%] object-contain select-none pointer-events-none invert brightness-200" />
      ),
      label: "Home",
      href: "#",
      separator: true
    },
    {
      icon: <PhilosophyIcon />,
      label: "Philosophy",
      href: "#philosophy"
    },
    {
      icon: <ProjectsIcon />,
      label: "Projects",
      href: "#projects"
    },
    {
      icon: <EventsIcon />,
      label: "Events",
      href: "#events"
    },
    {
      icon: <NewsletterIcon />,
      label: "Newsletter",
      href: "#newsletter"
    },
    {
      icon: <ConnectIcon />,
      label: "Connect",
      href: "#contact"
    }
  ];

  const mobileMenuItems = [
    { label: "Philosophy", href: "#philosophy" },
    { label: "Projects", href: "#projects" },
    { label: "Events", href: "#events" },
    { label: "Newsletter", href: "#newsletter" },
    { label: "Connect", href: "#contact", primary: true }
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <>
      {/* Desktop View: Premium Hover Dock Menu */}
      <div className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <Dock items={dockItems} magnification={1.6} distance={100} iconSize={44} gap={8} />
      </div>

      {/* Mobile View: Floating Header Menu Drawer */}
      <div className="md:hidden fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] flex flex-col items-center">
        <div className="w-full bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
          <a href="#" className="flex items-center hoverable" onClick={() => setIsOpen(false)}>
            <img src={logoImg} alt="Logo" className="h-8 w-auto select-none pointer-events-none invert brightness-200" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 flex items-center justify-center focus:outline-none hoverable"
            aria-label="Toggle Menu"
          >
            <div className="relative w-6 h-[15px]">
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6.5 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 left-0 w-6 h-0.5 bg-white rounded-full origin-center"
              />
              <motion.span
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[6.5px] left-0 w-6 h-0.5 bg-white rounded-full"
              />
              <motion.span
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6.5 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 w-6 h-0.5 bg-white rounded-full origin-center"
              />
            </div>
          </button>
        </div>

        {/* Dropdown navigation overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="w-full mt-2 bg-[#121212]/95 backdrop-blur-lg border border-white/10 rounded-[1.5rem] p-6 shadow-2xl flex flex-col gap-4"
            >
              {mobileMenuItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-center py-3 rounded-full text-xs font-semibold tracking-widest uppercase transition-all hoverable ${
                    item.primary
                      ? "bg-white text-black hover:bg-gray-200 mt-2"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const projectsData = [
  {
    year: "2026",
    category: "Architecture",
    title: "Project Genesis",
    desc: "Real-time multispectral satellite imaging analysis utilizing quantum-inspired neural networks to map topographical anomalies.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bg: "bg-surface"
  },
  {
    year: "2025",
    category: "Automation",
    title: "Ocular V2",
    desc: "Automated defect detection in micro-manufacturing pipelines. Capable of analyzing 10,000 components per minute with zero false positives.",
    img: "https://images.unsplash.com/photo-1616161560417-66d4db528429?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bg: "bg-[#1a1a1a]"
  },
  {
    year: "2024",
    category: "Medical",
    title: "Neural Mesh",
    desc: "High-fidelity 3D reconstruction of cellular structures from 2D electron microscopy scans, revolutionizing non-invasive diagnostics.",
    img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    bg: "bg-surface"
  }
];

export default function Projects() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.stacked-card');
      
      cards.forEach((card, i) => {
        if (i === cards.length - 1) {
          card.style.transform = `scale(1)`;
          card.style.filter = `brightness(1)`;
          return;
        }

        const nextCard = cards[i + 1];
        if (!nextCard) return;

        const cardRect = card.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        const vh10 = window.innerHeight * 0.1;
        const stickyTop = vh10 + (i * 20);

        if (cardRect.top <= stickyTop + 2) {
          let progress = (window.innerHeight - nextRect.top) / (window.innerHeight - stickyTop);
          progress = Math.max(0, Math.min(1, progress));
          const scale = 1 - (progress * 0.05);
          const brightness = 1 - (progress * 0.5);
          card.style.transform = `scale(${scale})`;
          card.style.filter = `brightness(${brightness})`;
        } else {
          card.style.transform = `scale(1)`;
          card.style.filter = `brightness(1)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Run initially in case page loaded scrolled down
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="projects" className="py-32 px-6 md:px-12 bg-background relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-end mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter text-white">Applied Research</h2>
        </motion.div>

        <div ref={containerRef} className="relative w-full pb-32" id="card-stack-container">
          {projectsData.map((project, index) => (
            <div
              key={index}
              className={`stacked-card w-full h-[75vh] ${project.bg} rounded-[2rem] border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl group`}
              style={{
                position: 'sticky',
                top: `calc(10vh + ${index * 20}px)`,
                transformOrigin: 'top center',
                willChange: 'transform, filter',
                zIndex: (index + 1) * 10,
                marginBottom: index < projectsData.length - 1 ? '15vh' : '0'
              }}
            >
              <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between order-2 md:order-1 h-1/2 md:h-full">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted">
                    {project.year} / {project.category}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-medium mt-4 tracking-tighter text-white">
                    {project.title}
                  </h3>
                  <p className="text-muted mt-6 text-sm md:text-base max-w-sm leading-relaxed">
                    {project.desc}
                  </p>
                </div>
                <div className="mt-8">
                  <a
                    href="#"
                    className="uppercase tracking-widest text-xs border border-white/30 rounded-full px-6 py-3 hover:bg-white hover:text-black transition-colors duration-300 hoverable inline-block text-white"
                  >
                    Read Case Study
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden order-1 md:order-2">
                <img
                  src={project.img}
                  alt={project.title}
                  className="w-full h-full object-cover filter grayscale contrast-[1.1] brightness-[0.9] transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

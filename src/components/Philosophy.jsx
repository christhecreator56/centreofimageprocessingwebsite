import React from 'react';
import { motion } from 'framer-motion';

export default function Philosophy() {
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
    <section id="philosophy" className="py-32 md:py-48 px-6 md:px-12 bg-surface relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <div className="md:col-span-4">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scrollReveal}
              className="text-xs uppercase tracking-widest text-muted sticky top-32"
            >
              The Philosophy
            </motion.h2>
          </div>

          <div className="md:col-span-8">
            <motion.h3
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scrollReveal}
              className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-white/90"
            >
              Beyond mere pixels, we seek structure. Our center bridges the gap between raw optical data and actionable neural intelligence, crafting tools for tomorrow's visionaries.
            </motion.h3>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                ...scrollReveal,
                visible: {
                  ...scrollReveal.visible,
                  transition: { ...scrollReveal.visible.transition, delay: 0.2 }
                }
              }}
              className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-3xl font-semibold mb-2">99.9%</h4>
                <p className="text-sm text-muted">Accuracy in spatial mapping algorithms deployed across industry standards.</p>
              </div>
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-3xl font-semibold mb-2">Sub-ms</h4>
                <p className="text-sm text-muted">Latency in real-time edge processing architectures developed in-house.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

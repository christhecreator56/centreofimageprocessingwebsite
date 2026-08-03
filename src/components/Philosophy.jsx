import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem, RevealWords } from './Reveal';

const STATS = [
  {
    value: '99.9%',
    label: 'Accuracy in spatial mapping algorithms deployed across industry standards.',
  },
  {
    value: 'Sub-ms',
    label: 'Latency in real-time edge processing architectures developed in-house.',
  },
];

export default function Philosophy() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // The section drifts very slightly against the scroll, which is what
  // stops a long text block from feeling static as it passes.
  const drift = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      id="philosophy"
      className="py-32 md:py-48 px-6 md:px-12 bg-surface relative z-20 overflow-hidden"
    >
      <div className="motion-blur max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Reveal className="sticky top-32" y={20} blur={8}>
              <motion.h2
                style={{ y: drift }}
                className="text-xs uppercase tracking-widest text-muted"
              >
                The Philosophy
              </motion.h2>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            <RevealWords
              as="h3"
              text="Beyond mere pixels, we seek structure. Our center bridges the gap between raw optical data and actionable neural intelligence, crafting tools for tomorrow's visionaries."
              stagger={0.022}
              duration={1.05}
              className="block text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-ink/90"
            />

            <RevealGroup className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8" stagger={0.12} delay={0.15}>
              {STATS.map((stat) => (
                <RevealItem key={stat.value} className="relative pt-6">
                  {/* the rule draws itself in rather than just appearing */}
                  <motion.span
                    className="absolute top-0 left-0 h-px w-full bg-ink/20 origin-left"
                    variants={{
                      hidden: { scaleX: 0 },
                      visible: { scaleX: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
                    }}
                  />
                  <h4 className="text-3xl font-semibold mb-2">{stat.value}</h4>
                  <p className="text-sm text-muted">{stat.label}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

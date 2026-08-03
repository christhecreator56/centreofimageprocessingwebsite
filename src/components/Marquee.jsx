import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LogoLoop from './LogoLoop';
import { 
  SiPytorch, 
  SiTensorflow, 
  SiOpencv, 
  SiPython, 
  SiCplusplus, 
  SiWebgl, 
  SiNvidia 
} from 'react-icons/si';

export default function Marquee() {
  const techLogos = [
    { node: <SiPytorch className="text-ink/40 hover:text-[#EE4C2C] transition-colors duration-300" />, title: "PyTorch", href: "https://pytorch.org" },
    { node: <SiTensorflow className="text-ink/40 hover:text-[#FF6F00] transition-colors duration-300" />, title: "TensorFlow", href: "https://tensorflow.org" },
    { node: <SiOpencv className="text-ink/40 hover:text-[#5C3EE6] transition-colors duration-300" />, title: "OpenCV", href: "https://opencv.org" },
    { node: <SiPython className="text-ink/40 hover:text-[#3776AB] transition-colors duration-300" />, title: "Python", href: "https://python.org" },
    { node: <SiCplusplus className="text-ink/40 hover:text-[#00599C] transition-colors duration-300" />, title: "C++", href: "https://isocpp.org" },
    { node: <SiWebgl className="text-ink/40 hover:text-[#990000] transition-colors duration-300" />, title: "WebGL", href: "https://khronos.org/webgl" },
    { node: <SiNvidia className="text-ink/40 hover:text-[#76B900] transition-colors duration-300" />, title: "NVIDIA CUDA", href: "https://developer.nvidia.com/cuda-zone" }
  ];

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // The band drifts against the scroll, so the loop reads as a physical
  // strip passing the viewport rather than a element pinned to the page.
  const x = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.25, 1, 1, 0.25]);

  return (
    <section
      ref={ref}
      className="py-12 border-y border-ink/10 overflow-hidden bg-surface relative z-10 flex items-center justify-center select-none"
    >
      <motion.div style={{ x, opacity }} className="motion-blur w-full">
      <LogoLoop
        logos={techLogos}
        speed={80}
        direction="left"
        logoHeight={40}
        gap={64}
        fadeOut={true}
        fadeOutColor="var(--color-surface)" // tracks the section background in either theme
        scaleOnHover={true}
        ariaLabel="Technology Partners"
      />
      </motion.div>
    </section>
  );
}

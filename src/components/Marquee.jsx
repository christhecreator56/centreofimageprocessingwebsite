import React from 'react';
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
    { node: <SiPytorch className="text-white/40 hover:text-[#EE4C2C] transition-colors duration-300" />, title: "PyTorch", href: "https://pytorch.org" },
    { node: <SiTensorflow className="text-white/40 hover:text-[#FF6F00] transition-colors duration-300" />, title: "TensorFlow", href: "https://tensorflow.org" },
    { node: <SiOpencv className="text-white/40 hover:text-[#5C3EE6] transition-colors duration-300" />, title: "OpenCV", href: "https://opencv.org" },
    { node: <SiPython className="text-white/40 hover:text-[#3776AB] transition-colors duration-300" />, title: "Python", href: "https://python.org" },
    { node: <SiCplusplus className="text-white/40 hover:text-[#00599C] transition-colors duration-300" />, title: "C++", href: "https://isocpp.org" },
    { node: <SiWebgl className="text-white/40 hover:text-[#990000] transition-colors duration-300" />, title: "WebGL", href: "https://khronos.org/webgl" },
    { node: <SiNvidia className="text-white/40 hover:text-[#76B900] transition-colors duration-300" />, title: "NVIDIA CUDA", href: "https://developer.nvidia.com/cuda-zone" }
  ];

  return (
    <section className="py-12 border-y border-white/10 overflow-hidden bg-surface relative z-10 flex items-center justify-center select-none">
      <LogoLoop
        logos={techLogos}
        speed={80}
        direction="left"
        logoHeight={40}
        gap={64}
        fadeOut={true}
        fadeOutColor="#121212" // Fades out perfectly against the bg-surface background
        scaleOnHover={true}
        ariaLabel="Technology Partners"
      />
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Loader({ onComplete }) {
  const [fade, setFade] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment loading progress dynamically
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment by a random step to feel organic
        const next = prev + Math.floor(Math.random() * 7) + 3;
        return next > 100 ? 100 : next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const fadeTimeout = setTimeout(() => {
        setFade(true);
      }, 500);

      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [progress, onComplete]);

  return (
    <div
      id="loader"
      className={`fixed inset-0 bg-[#0a0a0a] z-[10000] flex flex-col justify-center items-center gap-8 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Custom Scanning QR Code SVG Wrapper */}
      <div className="relative w-36 h-36 border border-white/10 rounded-2xl bg-white/[0.01] flex items-center justify-center p-6 shadow-2xl">
        
        {/* Glow corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/30" />

        {/* Custom QR Code SVG */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 29 29"
          fill="none"
          stroke="none"
          className="text-white"
        >
          {/* Finder Pattern - Top Left */}
          <rect x="1" y="1" width="7" height="7" fill="currentColor" />
          <rect x="2" y="2" width="5" height="5" fill="#0a0a0a" />
          <rect x="3" y="3" width="3" height="3" fill="currentColor" />

          {/* Finder Pattern - Top Right */}
          <rect x="21" y="1" width="7" height="7" fill="currentColor" />
          <rect x="22" y="2" width="5" height="5" fill="#0a0a0a" />
          <rect x="23" y="3" width="3" height="3" fill="currentColor" />

          {/* Finder Pattern - Bottom Left */}
          <rect x="1" y="21" width="7" height="7" fill="currentColor" />
          <rect x="2" y="22" width="5" height="5" fill="#0a0a0a" />
          <rect x="3" y="23" width="3" height="3" fill="currentColor" />

          {/* Alignment Pattern & Timing Patterns */}
          <rect x="18" y="18" width="5" height="5" fill="currentColor" />
          <rect x="19" y="19" width="3" height="3" fill="#0a0a0a" />
          <rect x="20" y="20" width="1" height="1" fill="currentColor" />

          {/* Custom QR Data bits */}
          <rect x="9" y="1" width="1" height="1" fill="currentColor" />
          <rect x="11" y="2" width="2" height="1" fill="currentColor" />
          <rect x="15" y="1" width="1" height="3" fill="currentColor" />
          <rect x="9" y="5" width="2" height="2" fill="currentColor" />
          <rect x="14" y="6" width="3" height="1" fill="currentColor" />
          <rect x="19" y="5" width="1" height="4" fill="currentColor" />
          
          <rect x="1" y="9" width="1" height="3" fill="currentColor" />
          <rect x="3" y="11" width="3" height="1" fill="currentColor" />
          <rect x="6" y="9" width="1" height="2" fill="currentColor" />
          
          <rect x="9" y="9" width="2" height="2" fill="currentColor" />
          <rect x="12" y="10" width="4" height="2" fill="currentColor" />
          <rect x="17" y="9" width="1" height="4" fill="currentColor" />
          <rect x="19" y="11" width="3" height="2" fill="currentColor" />
          <rect x="23" y="9" width="1" height="2" fill="currentColor" />
          <rect x="26" y="10" width="2" height="2" fill="currentColor" />

          <rect x="9" y="14" width="3" height="1" fill="currentColor" />
          <rect x="13" y="13" width="1" height="3" fill="currentColor" />
          <rect x="15" y="15" width="2" height="1" fill="currentColor" />
          <rect x="18" y="14" width="4" height="2" fill="currentColor" />
          <rect x="24" y="13" width="2" height="1" fill="currentColor" />
          <rect x="27" y="15" width="1" height="3" fill="currentColor" />

          <rect x="9" y="21" width="1" height="3" fill="currentColor" />
          <rect x="11" y="23" width="3" height="1" fill="currentColor" />
          <rect x="15" y="21" width="2" height="2" fill="currentColor" />
          <rect x="14" y="25" width="1" height="3" fill="currentColor" />
          <rect x="16" y="27" width="3" height="1" fill="currentColor" />
          <rect x="21" y="25" width="4" height="1" fill="currentColor" />
          <rect x="26" y="23" width="2" height="3" fill="currentColor" />
        </svg>

        {/* Laser Scanner Bar Animation (Constrained inside QR container) */}
        <div 
          className="absolute left-2 right-2 h-[2px] bg-white shadow-[0_0_12px_#ffffff,0_0_4px_#ffffff] pointer-events-none"
          style={{
            animation: 'scan-loop 2s ease-in-out infinite',
            top: '8px'
          }}
        />
      </div>

      {/* 2. Loading Stats Telemetry Block */}
      <div className="flex flex-col items-center gap-1.5 text-center font-mono select-none">
        <div className="text-white text-xs tracking-[0.25em] uppercase font-semibold">
          CIP_DECODER // ACTIVE
        </div>
        
        {/* Progress bar */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-white transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-white/40 text-[10px] tracking-widest uppercase mt-1">
          {progress < 100 ? (
            <span>READING CODE MATRIX... {progress}%</span>
          ) : (
            <span className="text-white">SYS_READY // CODE RESOLVED</span>
          )}
        </div>
      </div>

      {/* Embedded scanning styles */}
      <style>{`
        @keyframes scan-loop {
          0% { top: 8px; opacity: 0.3; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 10px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

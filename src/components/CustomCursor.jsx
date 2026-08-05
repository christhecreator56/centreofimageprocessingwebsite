import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    // Check if device uses touch/coarse pointer
    const coarseMedia = window.matchMedia("(pointer: coarse)");
    setIsCoarse(coarseMedia.matches);

    if (coarseMedia.matches) {
      document.body.style.cursor = 'auto';
      return;
    }

    // Hide normal cursor
    document.body.style.cursor = 'none';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      wake();
    };

    window.addEventListener('mousemove', onMouseMove);

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    // The cursor eases toward the pointer, so it only needs to animate while
    // there is still a gap to close. Left running unconditionally this is a
    // permanent per-frame wake-up for a dot that is not moving.
    let rafId = 0;
    const renderCursor = () => {
      cursorX = lerp(cursorX, mouseX, 0.15);
      cursorY = lerp(cursorY, mouseY, 0.15);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      if (Math.abs(mouseX - cursorX) < 0.1 && Math.abs(mouseY - cursorY) < 0.1) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(renderCursor);
    };

    function wake() {
      if (!rafId) rafId = requestAnimationFrame(renderCursor);
    }

    wake();

    // Track active class triggers globally
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const isHoverable = 
        target.closest('.hoverable') || 
        target.closest('button') || 
        target.closest('a');
        
      setIsActive(!!isHoverable);
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (rafId) cancelAnimationFrame(rafId);
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (isCoarse) return null;

  return (
    <div
      ref={cursorRef}
      id="cursor"
      className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-[width,height,background-color] duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
        isActive ? 'w-[60px] h-[60px] bg-white' : 'w-3 h-3 bg-white'
      }`}
      style={{
        transform: 'translate3d(0px, 0px, 0px) translate(-50%, -50%)',
        willChange: 'transform',
      }}
    />
  );
}

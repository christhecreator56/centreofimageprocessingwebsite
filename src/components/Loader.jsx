import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { QR_ALL, QR_CENTER, QR_DATA, QR_EYE, QR_SIZE, QR_STRUCTURAL } from '../lib/qr';

// Deliberately literal, not theme tokens: the loader is always the dark
// curtain, so the reveal reads the same whichever theme the site loads in.
const PAPER = '#0a0a0a';
const INK = '#ffffff';
const CORE = QR_EYE[QR_EYE.length - 1]; // the solid centre block — our aperture
const CORE_UNITS = CORE[2]; // aperture width in grid units
// How far the QR pulls back before the punch. The mask has to start at this
// same scale, otherwise the decorative QR and the mask QR are two different
// sizes during the cross-fade and you see the code twice.
const ANTICIPATE = 0.88;

/** Renders a module list as <rect>s. `mode` decides the colour mapping. */
function Modules({ list, mode, shown }) {
  return list.map(([x, y, w, h, on], i) => {
    const fill = mode === 'mask' ? (on ? '#000' : '#fff') : on ? INK : PAPER;
    const staged = shown !== undefined;
    return (
      <rect
        key={`${x}-${y}-${i}`}
        x={x}
        y={y}
        width={w}
        height={h}
        fill={fill}
        style={
          staged
            ? {
                opacity: i < shown ? 1 : 0.05,
                transition: 'opacity 380ms cubic-bezier(0.16, 1, 0.3, 1)',
              }
            : undefined
        }
      />
    );
  });
}

export default function Loader({ onReveal, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Viewport plus the measured on-screen geometry of the decorative QR.
  // The mask is built from this, so the holes land pixel-exactly under
  // the white modules at the moment of handoff.
  const [geom, setGeom] = useState({ w: 0, h: 0, cx: 0, cy: 0, unit: 0 });

  const rootRef = useRef(null);
  const qrSvgRef = useRef(null);
  const qrBoxRef = useRef(null);
  const telemetryRef = useRef(null);
  const maskGroupRef = useRef(null);
  const detailGroupRef = useRef(null);
  const bloomGroupRef = useRef(null);
  const bloomWrapRef = useRef(null);
  const scannerRef = useRef(null);
  const firedRef = useRef(false);

  /* ------------------------- measurement ------------------------- */

  const measure = useCallback(() => {
    if (!qrSvgRef.current) return;
    const r = qrSvgRef.current.getBoundingClientRect();
    setGeom({
      w: window.innerWidth,
      h: window.innerHeight,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      unit: r.width / QR_SIZE,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  /* ------------------------ decode counter ----------------------- */

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const next = prev + Math.floor(Math.random() * 7) + 4;
        return next > 100 ? 100 : next;
      });
    }, 60);
    return () => clearInterval(id);
  }, []);

  /* --------------------------- the reveal ------------------------ */

  useEffect(() => {
    if (progress < 100 || firedRef.current || !geom.unit) return;
    firedRef.current = true;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      const t = setTimeout(() => {
        onReveal?.();
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            setDone(true);
            onComplete?.();
          },
        });
      }, 300);
      return () => clearTimeout(t);
    }

    const { w, h, cx, cy, unit } = geom;
    // The aperture has to grow past the far corner of the viewport, with
    // headroom for the rotation we ride in on.
    const cover = 1.25 * Math.hypot(w, h);
    const endScale = (2.1 * Math.max(w, h)) / CORE_UNITS;
    const zoom = { t: 0 };

    // The handoff happens after the anticipation pull-back, so the mask's
    // starting size is the QR's *current* on-screen size, not its rest size.
    const startScale = unit * ANTICIPATE;

    const paint = () => {
      // Exponential in scale, so the perceived zoom rate stays constant
      // instead of stalling once the modules get big.
      const s = startScale * Math.pow(endScale / startScale, zoom.t);
      const transform = `translate(${cx} ${cy}) rotate(${zoom.t * 7}) scale(${s}) translate(${-QR_CENTER} ${-QR_CENTER})`;
      maskGroupRef.current?.setAttribute('transform', transform);
      bloomGroupRef.current?.setAttribute('transform', transform);
      // Once the aperture alone fills the screen the other ~250 modules
      // are off-canvas — drop them so the last frames stay cheap.
      if (
        s * CORE_UNITS > cover &&
        detailGroupRef.current &&
        detailGroupRef.current.style.display !== 'none'
      ) {
        detailGroupRef.current.style.display = 'none';
      }
    };
    paint();

    const tl = gsap.timeline();

    // Tuning aid: append ?slowmo to the URL to watch the handoff at 1/4 speed.
    if (typeof window !== 'undefined' && window.location.search.includes('slowmo')) {
      tl.timeScale(0.25);
    }

    tl
      // 1. Lock — the scanner parks, the matrix settles.
      .to(scannerRef.current, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0)
      // 2. Anticipation — pull back before the punch.
      .to(qrBoxRef.current, { scale: ANTICIPATE, duration: 0.45, ease: 'power3.inOut' }, 0.1)
      .to(
        telemetryRef.current,
        { opacity: 0, y: 14, filter: 'blur(8px)', duration: 0.4, ease: 'power2.in' },
        0.15
      )
      // 3. Charge — the matrix flares white.
      .to(qrBoxRef.current, { filter: 'brightness(2.6)', duration: 0.16, ease: 'power1.in' }, 0.42)
      .addLabel('punch', 0.58)
      .add(() => onReveal?.(), 'punch')
      // 4. Handoff — white modules cross-fade into windows onto the hero.
      .fromTo(maskGroupRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' }, 'punch')
      .to(qrBoxRef.current, { opacity: 0, duration: 0.22, ease: 'power2.in' }, 'punch')
      // 5. Light leak riding the leading edge of the holes.
      .fromTo(bloomWrapRef.current, { opacity: 0.85 }, { opacity: 0, duration: 0.55, ease: 'power2.out' }, 'punch')
      // 6. The zoom itself.
      .to(zoom, { t: 1, duration: 1.3, ease: 'power1.inOut', onUpdate: paint }, 'punch')
      .add(() => {
        setDone(true);
        onComplete?.();
      });

    return () => tl.kill();
  }, [progress, geom, onReveal, onComplete]);

  if (done) return null;

  const { w, h, cx, cy, unit } = geom;
  const baseTransform = `translate(${cx} ${cy}) scale(${unit * ANTICIPATE}) translate(${-QR_CENTER} ${-QR_CENTER})`;
  const shown = Math.round((progress / 100) * QR_DATA.length);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[10000]">
      {/* ---------- the curtain, with the QR punched out of it ---------- */}
      <svg
        className="absolute inset-0 block w-full h-full"
        width={w || '100%'}
        height={h || '100%'}
        aria-hidden="true"
      >
        <defs>
          <mask id="qr-reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect x="0" y="0" width={w} height={h} fill="#fff" />
            <g ref={maskGroupRef} transform={baseTransform} shapeRendering="crispEdges" style={{ opacity: 0 }}>
              <g ref={detailGroupRef}>
                <Modules list={QR_ALL.filter((m) => m !== CORE)} mode="mask" />
              </g>
              {/* the aperture the whole reveal grows from — kept alive to the end */}
              <rect x={CORE[0]} y={CORE[1]} width={CORE[2]} height={CORE[3]} fill="#000" />
            </g>
          </mask>
        </defs>
        <rect x="0" y="0" width={w} height={h} fill={PAPER} mask="url(#qr-reveal-mask)" />
      </svg>

      {/* ---------- light leak that blooms along with the holes ---------- */}
      <svg
        ref={bloomWrapRef}
        className="absolute inset-0 block w-full h-full pointer-events-none qr-bloom"
        width={w || '100%'}
        height={h || '100%'}
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <g ref={bloomGroupRef} transform={baseTransform} shapeRendering="crispEdges">
          <Modules list={QR_ALL} mode="bloom" />
        </g>
      </svg>

      {/* ---------------------- the loader UI ---------------------- */}
      <div className="absolute inset-0 flex flex-col justify-center items-center gap-8 select-none">
        <div
          ref={qrBoxRef}
          className="relative w-36 h-36 border border-ink/10 rounded-2xl bg-ink/[0.01] flex items-center justify-center p-6 shadow-2xl"
          style={{ willChange: 'transform, opacity, filter' }}
        >
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-ink/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-ink/30" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-ink/30" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-ink/30" />

          <svg
            ref={qrSvgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
            shapeRendering="crispEdges"
          >
            <Modules list={QR_STRUCTURAL} mode="ink" />
            <Modules list={QR_DATA} mode="ink" shown={shown} />
            <Modules list={QR_EYE} mode="ink" />
          </svg>

          <div
            ref={scannerRef}
            className="absolute left-2 right-2 h-[2px] bg-ink shadow-[0_0_12px_#ffffff,0_0_4px_#ffffff] pointer-events-none"
            style={{ animation: 'scan-loop 1.8s ease-in-out infinite', top: '8px' }}
          />
        </div>

        <div ref={telemetryRef} className="flex flex-col items-center gap-1.5 text-center font-mono text-white">
          <div className="text-ink text-xs tracking-[0.25em] uppercase font-semibold">
            CIP_DECODER // ACTIVE
          </div>

          <div className="w-48 h-[2px] bg-ink/10 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-ink transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-ink/40 text-[10px] tracking-widest uppercase mt-1">
            {progress < 100 ? (
              <span>READING CODE MATRIX... {progress}%</span>
            ) : (
              <span className="text-ink">SYS_READY // CODE RESOLVED</span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-loop {
          0%   { top: 8px; opacity: 0.3; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 10px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

export default function CityCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');

    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d');
    const lay = document.createElement('canvas');
    const lctx = lay.getContext('2d');

    const LOOP = 15; // seconds per seamless loop
    let W = 0, H = 0, S = 1, cx = 0, horizon = 0;
    let scene = null, noiseTile = null;
    let animationFrameId = null;

    // Helpers
    const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
    const lerp  = (a, b, t) => a + (b - a) * t;
    const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };

    function mixHex(h1, h2, t) {
      const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
      const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
      const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
      const bl = Math.round(lerp(a & 255, b & 255, t));
      return `rgb(${r},${g},${bl})`;
    }

    function depthCol(d, a = 1) {
      const near = [196, 80, 255], mid = [120, 70, 230], far = [14, 150, 150];
      let r, g, b;
      if (d < 0.5) {
        const t = d / 0.5;
        r = lerp(near[0], mid[0], t);
        g = lerp(near[1], mid[1], t);
        b = lerp(near[2], mid[2], t);
      } else {
        const t = (d - 0.5) / 0.5;
        r = lerp(mid[0], far[0], t);
        g = lerp(mid[1], far[1], t);
        b = lerp(mid[2], far[2], t);
      }
      return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
    }

    const rnd = (seed) => {
      let x = Math.sin(seed * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // Build scene models
    function build() {
      S = H / 900;
      cx = W * 0.5;
      horizon = H * 0.60;
      const buildings = [];
      const lidar = [];
      
      const bands = [
        { d: 0.90, base: horizon, hMin: 0.10, hMax: 0.24, wMin: 26, wMax: 46, gap: 6, y0: horizon },
        { d: 0.62, base: horizon + 8 * S, hMin: 0.16, hMax: 0.34, wMin: 40, wMax: 74, gap: 10, y0: horizon + 6 * S },
        { d: 0.34, base: horizon + 26 * S, hMin: 0.24, hMax: 0.5, wMin: 70, wMax: 120, gap: 16, y0: horizon + 22 * S },
      ];
      
      let seed = 1;
      bands.forEach((bd, bi) => {
        let x = -40 * S;
        while (x < W + 40 * S) {
          const w = (bd.wMin + rnd(seed++) * (bd.wMax - bd.wMin)) * S;
          const h = (bd.hMin + rnd(seed++) * (bd.hMax - bd.hMin)) * H;
          const bx = x, by = bd.y0 - h, bw = w, bh = h;
          
          const win = [];
          const cwin = Math.max(2, Math.floor(bw / (11 * S)));
          const rwin = Math.max(3, Math.floor(bh / (15 * S)));
          for (let c = 0; c < cwin; c++) {
            for (let r = 0; r < rwin; r++) {
              if (rnd(seed++) > 0.5) continue;
              win.push({
                x: bx + (c + 0.5) / cwin * bw - 2 * S,
                y: by + (r + 0.5) / rwin * bh - 3 * S,
                w: 3.4 * S,
                h: 5 * S,
                ph: rnd(seed++),
                fl: 1 + Math.floor(rnd(seed++) * 3)
              });
            }
          }
          buildings.push({ x: bx, y: by, w: bw, h: bh, d: bd.d, band: bi, win });
          const step = w + bd.gap * S * (0.6 + rnd(seed++));
          if (step <= 0.1) {
            x += 10;
          } else {
            x += step;
          }
        }
      });

      // Towers framing near view
      buildings.push({ x: -10 * S, y: horizon - 0.62 * H, w: 120 * S, h: 0.9 * H, d: 0.14, band: 3, win: [] });
      buildings.push({ x: W - 120 * S, y: horizon - 0.55 * H, w: 130 * S, h: 0.85 * H, d: 0.16, band: 3, win: [] });

      [buildings[buildings.length - 2], buildings[buildings.length - 1]].forEach(t => {
        const cwin = Math.floor(t.w / (16 * S)), rwin = Math.floor(t.h / (20 * S));
        for (let c = 0; c < cwin; c++) {
          for (let r = 0; r < rwin; r++) {
            if (rnd(seed++) > 0.55) continue;
            t.win.push({
              x: t.x + (c + 0.5) / cwin * t.w - 3 * S,
              y: t.y + (r + 0.5) / rwin * t.h - 4 * S,
              w: 5 * S,
              h: 7 * S,
              ph: rnd(seed++),
              fl: 1 + Math.floor(rnd(seed++) * 3)
            });
          }
        }
      });

      buildings.forEach(b => {
        const step = 7 * S;
        for (let x = b.x; x < b.x + b.w; x += step) lidar.push({ x, y: b.y, s: rnd(seed++) });
        for (let y = b.y; y < b.y + b.h; y += step * 1.6) {
          lidar.push({ x: b.x, y, s: rnd(seed++) });
          lidar.push({ x: b.x + b.w, y, s: rnd(seed++) });
        }
      });

      for (let i = 1; i <= 14; i++) {
        const yy = horizon + (i * i) * (H - horizon) / (14 * 14);
        for (let x = -W * 0.1; x < W * 1.1; x += Math.max(14 * S, 60 * S * (1 - i / 16))) {
          lidar.push({ x, y: yy, s: rnd(seed++), g: 1 });
        }
      }

      const agents = [];
      for (let i = 0; i < 7; i++) {
        agents.push({ type: 'car', y: horizon + (0.28 + 0.10 * i) * (H - horizon), base: i / 7, laps: (i % 2 ? -1 : 1), size: (26 + i * 7) * S, heat: 1 });
      }
      for (let i = 0; i < 10; i++) {
        agents.push({ type: 'ped', y: horizon + (0.10 + 0.08 * (i % 5)) * (H - horizon) + i * 1.5 * S, base: i / 10, laps: (i % 2 ? 1 : -1), size: (9 + (i % 3) * 2) * S, heat: 0.8 });
      }
      agents.push({ type: 'cyc', y: horizon + 0.5 * (H - horizon), base: 0.2, laps: 1, size: 18 * S, heat: 0.9 });

      const heroes = [
        { type: 'ped', y: horizon + 0.90 * (H - horizon), base: 0.30, laps: 0.5, size: 54 * S },
        { type: 'cyc', y: horizon + 0.80 * (H - horizon), base: 0.58, laps: 0.7, size: 62 * S },
        { type: 'ped', y: horizon + 0.86 * (H - horizon), base: 0.82, laps: -0.45, size: 46 * S },
      ];

      scene = { buildings, lidar, agents, heroes };
    }

    function agentPos(a, time) {
      let ph = (((time / LOOP) * a.laps + a.base) % 1 + 1) % 1;
      const m = W * 0.12;
      const x = -m + ph * (W + 2 * m);
      return { x, y: a.y, ph };
    }

    function makeNoise() {
      const n = 180;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const g = c.getContext('2d');
      const img = g.createImageData(n, n);
      for (let i = 0; i < n * n; i++) {
        const v = Math.random() * 255;
        img.data[i * 4] = v;
        img.data[i * 4 + 1] = v;
        img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      noiseTile = c;
    }

    function paintRGB(c, dayNight, time) {
      const top = mixHex('#1a2748', '#02030a', dayNight);
      const midc = mixHex('#5b3f7a', '#0a1024', dayNight);
      const hor = mixHex('#ff8a4a', '#0b1430', dayNight);
      const g = c.createLinearGradient(0, 0, 0, horizon);
      g.addColorStop(0, top);
      g.addColorStop(0.62, midc);
      g.addColorStop(1, hor);
      c.fillStyle = g;
      c.fillRect(0, 0, W, horizon);

      if (dayNight < 0.9) {
        const sg = c.createRadialGradient(cx + W * 0.12, horizon - 6 * S, 0, cx + W * 0.12, horizon - 6 * S, H * 0.5);
        sg.addColorStop(0, `rgba(255,180,110,${0.55 * (1 - dayNight)})`);
        sg.addColorStop(1, 'rgba(255,180,110,0)');
        c.fillStyle = sg;
        c.fillRect(0, 0, W, horizon);
      }

      const gg = c.createLinearGradient(0, horizon, 0, H);
      gg.addColorStop(0, mixHex('#241a2e', '#060812', dayNight));
      gg.addColorStop(1, mixHex('#0d0a16', '#02030a', dayNight));
      c.fillStyle = gg;
      c.fillRect(0, horizon, W, H - horizon);

      const bs = [...scene.buildings].sort((a, b) => b.d - a.d);
      bs.forEach(b => {
        c.fillStyle = mixHex(mixHex('#0a0d1c', '#20263f', 0.5 * b.d), '#05060e', dayNight * 0.5);
        c.globalAlpha = 1;
        c.fillRect(b.x, b.y, b.w, b.h);
        if (b.d > 0.5) {
          c.fillStyle = `rgba(120,140,190,${0.05 * b.d})`;
          c.fillRect(b.x, b.y, b.w, b.h);
        }
        b.win.forEach(w => {
          const fl = 0.6 + 0.4 * Math.sin(2 * Math.PI * (time / LOOP * w.fl + w.ph));
          const a = (0.15 + 0.75 * dayNight) * fl;
          c.fillStyle = `rgba(255,206,130,${a})`;
          c.fillRect(w.x, w.y, w.w, w.h);
        });
      });

      scene.agents.forEach(a => {
        const p = agentPos(a, time);
        if (a.type === 'car') {
          c.fillStyle = 'rgba(10,10,16,0.9)';
          c.fillRect(p.x - a.size * 0.5, p.y - a.size * 0.28, a.size, a.size * 0.34);
          const a2 = 0.5 + 0.5 * dayNight;
          c.fillStyle = `rgba(255,238,200,${a2})`;
          c.beginPath();
          c.arc(p.x + a.size * 0.5 * (a.laps > 0 ? 1 : -1), p.y, 2.4 * S, 0, 7);
          c.fill();
          c.fillStyle = `rgba(255,80,60,${0.5 * a2})`;
          c.beginPath();
          c.arc(p.x - a.size * 0.5 * (a.laps > 0 ? 1 : -1), p.y, 2 * S, 0, 7);
          c.fill();
        } else {
          c.fillStyle = 'rgba(12,12,20,0.9)';
          c.fillRect(p.x - a.size * 0.22, p.y - a.size, a.size * 0.44, a.size);
          c.beginPath();
          c.arc(p.x, p.y - a.size * 1.06, a.size * 0.22, 0, 7);
          c.fill();
          if (dayNight > 0.4) {
            c.fillStyle = `rgba(255,200,140,${0.10 * dayNight})`;
            c.beginPath();
            c.arc(p.x, p.y - a.size * 0.5, a.size * 1.4, 0, 7);
            c.fill();
          }
        }
      });
      c.globalAlpha = 1;
    }

    function paintDepth(c, time) {
      c.fillStyle = '#04101a';
      c.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) {
        const t = i / 25;
        const y = lerp(H, horizon, t);
        c.fillStyle = depthCol(t, 1);
        c.fillRect(0, y, W, (H - horizon) / 26 + 1.5);
      }
      const bs = [...scene.buildings].sort((a, b) => b.d - a.d);
      bs.forEach(b => {
        c.fillStyle = depthCol(b.d, 1);
        c.fillRect(b.x, b.y, b.w, b.h);
        c.fillStyle = depthCol(clamp(b.d - 0.12), 0.5);
        c.fillRect(b.x, b.y, b.w, 3 * S);
      });
      scene.agents.forEach(a => {
        const p = agentPos(a, time);
        const d = clamp((p.y - horizon) / (H - horizon));
        c.fillStyle = depthCol(1 - d, 1);
        const w = a.type === 'car' ? a.size : a.size * 0.5;
        c.beginPath();
        c.ellipse(p.x, p.y - a.size * 0.4, w * 0.5, a.size * 0.55, 0, 0, 7);
        c.fill();
      });
    }

    function paintLiDAR(c, time) {
      c.fillStyle = '#01030a';
      c.fillRect(0, 0, W, H);
      const rg = c.createRadialGradient(cx, horizon, 0, cx, horizon, H * 0.95);
      rg.addColorStop(0, 'rgba(22,64,96,0.28)');
      rg.addColorStop(1, 'rgba(2,4,12,0)');
      c.fillStyle = rg;
      c.fillRect(0, 0, W, H);
      
      c.globalCompositeOperation = 'lighter';
      scene.lidar.forEach(pt => {
        const drift = Math.sin(time * 1.6 + pt.s * 30) * 1.6 * S;
        const tw = 0.45 + 0.55 * Math.sin(time * 3 + pt.s * 50);
        const s = (pt.g ? 1.8 : 2.4) * S;
        c.fillStyle = pt.g ? `rgba(60,180,215,${0.22 * tw})` : `rgba(120,210,255,${0.30 * tw})`;
        c.fillRect(pt.x + drift - s, pt.y + drift * 0.4 - s, s * 3, s * 3);
        c.fillStyle = pt.g ? `rgba(160,238,255,${0.75 * tw})` : `rgba(215,246,255,${0.98 * tw})`;
        c.fillRect(pt.x + drift, pt.y + drift * 0.4, s, s);
      });

      scene.agents.forEach(a => {
        const p = agentPos(a, time);
        for (let k = 0; k < 14; k++) {
          const ang = k / 14 * 7 + time * 0.5;
          const rr = (6 + (k % 4) * 5) * S;
          c.fillStyle = 'rgba(205,246,255,0.95)';
          c.fillRect(p.x + Math.cos(ang) * rr, p.y - a.size * 0.5 + Math.sin(ang) * rr * 0.6, 2 * S, 2 * S);
        }
      });
      c.globalCompositeOperation = 'source-over';
    }

    function hotBlob(c, x, y, rx, ry, heat) {
      const R = Math.max(rx, ry), a = clamp(heat);
      c.save();
      c.translate(x, y);
      c.scale(rx / R, ry / R);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, R);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.18, `rgba(255,232,150,${a})`);
      g.addColorStop(0.42, `rgba(255,140,44,${a * 0.92})`);
      g.addColorStop(0.68, `rgba(206,44,26,${a * 0.6})`);
      g.addColorStop(1, 'rgba(60,10,44,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, R, 0, 7);
      c.fill();
      c.restore();
    }

    function thermBody(c, type, x, y, z, dir, base, time) {
      const wob = Math.sin(time * 4 + base * 10) * 0.6 * S;
      if (type === 'car') {
        hotBlob(c, x, y, z * 0.70, z * 0.34, 0.60);
        hotBlob(c, x + z * 0.32 * dir, y, z * 0.30, z * 0.24, 1.0);
        hotBlob(c, x - z * 0.55 * dir, y, z * 0.16, z * 0.14, 0.85);
      } else if (type === 'cyc') {
        hotBlob(c, x, y - z * 0.70 + wob, z * 0.40, z * 0.72, 0.90);
        hotBlob(c, x, y - z * 1.22, z * 0.24, z * 0.24, 1.0);
        hotBlob(c, x - z * 0.10 * dir, y + z * 0.16, z * 0.15, z * 0.15, 1.0);
      } else {
        hotBlob(c, x, y - z * 0.55 + wob, z * 0.42, z * 0.82, 0.55);
        hotBlob(c, x, y - z * 0.55 + wob, z * 0.24, z * 0.48, 0.95);
        hotBlob(c, x, y - z * 1.10, z * 0.28, z * 0.28, 1.0);
        c.fillStyle = `rgba(130,170,235,${0.14 + 0.06 * Math.sin(time * 5 + base * 8)})`;
        c.beginPath();
        c.ellipse(x + z * 0.34 * dir, y - z * 1.04, z * 0.22, z * 0.14, 0, 0, 7);
        c.fill();
      }
    }

    function paintThermal(c, time) {
      const bg = c.createRadialGradient(cx, horizon, 0, cx, horizon, H);
      bg.addColorStop(0, '#0e0826');
      bg.addColorStop(0.5, '#070518');
      bg.addColorStop(1, '#01000a');
      c.fillStyle = bg;
      c.fillRect(0, 0, W, H);

      c.globalCompositeOperation = 'lighter';
      const bs = [...scene.buildings].sort((a, b) => b.d - a.d);
      bs.forEach(b => {
        const a = 0.07 * (1 - b.d) + 0.025;
        c.fillStyle = `rgba(48,82,138,${a})`;
        c.fillRect(b.x, b.y, b.w, b.h);
        c.fillStyle = `rgba(96,138,198,${a * 1.6})`;
        c.fillRect(b.x, b.y, b.w, 2 * S);
      });

      bs.forEach((b, bi) => {
        b.win.forEach((w, i) => {
          if (i % 2) return;
          const fl = 0.5 + 0.5 * Math.sin(2 * Math.PI * (time / LOOP * (1 + (i % 3)) + w.ph));
          const r = Math.max(7 * S, w.w * 1.1);
          hotBlob(c, w.x + w.w * 0.5, w.y + w.h * 0.5, r, r * 0.8, (0.45 + 0.35 * (1 - b.d)) * fl);
        });
      });

      scene.agents.forEach(a => {
        if (a.type !== 'car') return;
        const p = agentPos(a, time);
        for (let k = 0; k < 3; k++) {
          const rise = ((time * 0.5 + k * 0.33 + a.base) % 1);
          const y = p.y - rise * 46 * S;
          c.fillStyle = `rgba(255,150,60,${0.12 * (1 - rise)})`;
          c.beginPath();
          c.ellipse(p.x + Math.sin(time * 3 + k) * 4 * S, y, a.size * 0.30, a.size * 0.55 * (0.6 + rise), 0, 0, 7);
          c.fill();
        }
      });

      scene.agents.forEach(a => {
        const p = agentPos(a, time);
        thermBody(c, a.type, p.x, p.y, a.size * 1.6, a.laps > 0 ? 1 : -1, a.base, time);
      });

      scene.heroes.forEach(h => {
        const p = agentPos(h, time);
        if (h.type !== 'car') {
          for (let k = 1; k <= 5; k++) {
            const ph = (((p.ph - h.laps * k * 0.012) % 1) + 1) % 1;
            const x = -W * 0.12 + ph * (W + 2 * W * 0.12);
            hotBlob(c, x, h.y + 4 * S, 12 * S, 5 * S, 0.22 * (1 - k / 6));
          }
        }
        thermBody(c, h.type, p.x, p.y, h.size, h.laps > 0 ? 1 : -1, h.base, time);
      });
      c.globalCompositeOperation = 'source-over';
    }

    function paintFused(c, time) {
      paintRGB(c, 0.86, time);
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = 'rgba(60,30,120,0.10)';
      c.fillRect(0, horizon - 4 * S, W, H - horizon);
      c.globalAlpha = 0.75;
      paintThermalOverlay(c, time);
      c.globalAlpha = 1;
      scene.lidar.forEach((pt, i) => {
        if (i % 6) return;
        const tw = 0.5 + 0.5 * Math.sin(time * 3 + pt.s * 50);
        c.fillStyle = `rgba(120,225,255,${0.5 * tw})`;
        c.fillRect(pt.x, pt.y, 1.4 * S, 1.4 * S);
      });
      c.globalCompositeOperation = 'source-over';
    }

    function paintThermalOverlay(c, time) {
      c.globalCompositeOperation = 'lighter';
      scene.agents.forEach(a => {
        const p = agentPos(a, time);
        thermBody(c, a.type, p.x, p.y, a.size * 1.3, a.laps > 0 ? 1 : -1, a.base, time);
      });
      scene.heroes.forEach(h => {
        const p = agentPos(h, time);
        thermBody(c, h.type, p.x, p.y, h.size * 0.85, h.laps > 0 ? 1 : -1, h.base, time);
      });
      c.globalCompositeOperation = 'source-over';
    }

    function scanAndGrid(c, time, strength) {
      if (strength <= 0.01) return;

      const sy = (time / LOOP * 2 % 1) * H;
      const g = c.createLinearGradient(0, sy - 40 * S, 0, sy + 40 * S);
      g.addColorStop(0, 'rgba(120,225,255,0)');
      g.addColorStop(0.5, `rgba(150,235,255,${0.5 * strength})`);
      g.addColorStop(1, 'rgba(120,225,255,0)');
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.fillRect(0, sy - 40 * S, W, 80 * S);
      c.globalAlpha = 1;
    }

    function grain(c, amt) {
      if (amt <= 0.01 || !noiseTile) return;
      c.globalAlpha = amt;
      const ox = (Math.random() * noiseTile.width) | 0;
      const oy = (Math.random() * noiseTile.height) | 0;
      for (let x = -ox; x < W; x += noiseTile.width) {
        for (let y = -oy; y < H; y += noiseTile.height) {
          c.drawImage(noiseTile, x, y);
        }
      }
      c.globalAlpha = 1;
    }

    function vignette(c) {
      const g = c.createRadialGradient(cx, H * 0.5, H * 0.2, cx, H * 0.5, H * 0.85);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.55)');
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    }

    // Keyframes configuration
    const KF = [
      { t: 0.00, m: 0, dn: 0.05 },
      { t: 0.15, m: 0, dn: 0.08 },
      { t: 0.33, m: 1, dn: 0.20 },
      { t: 0.50, m: 2, dn: 0.40 },
      { t: 0.70, m: 3, dn: 0.95 },
      { t: 0.86, m: 4, dn: 0.86 },
      { t: 1.00, m: 0, dn: 0.05 },
    ];

    function paintMode(c, m, dn, time) {
      if (m === 0) paintRGB(c, dn, time);
      else if (m === 1) paintDepth(c, time);
      else if (m === 2) paintLiDAR(c, time);
      else if (m === 3) paintThermal(c, time);
      else paintFused(c, time);
    }

    function frame(now) {
      const time = (now / 1000);
      const T = (time / LOOP) % 1;
      
      let i = 0;
      while (i < KF.length - 1 && T >= KF[i + 1].t) i++;
      const k0 = KF[i];
      const k1 = KF[Math.min(i + 1, KF.length - 1)];
      const u = smooth((T - k0.t) / Math.max(1e-4, (k1.t - k0.t)));
      const dn = lerp(k0.dn, k1.dn, u);

      paintMode(bctx, k0.m, dn, time);
      if (u > 0.001 && k1.m !== k0.m) {
        lctx.clearRect(0, 0, W, H);
        paintMode(lctx, k1.m, dn, time);
        bctx.globalAlpha = u;
        bctx.drawImage(lay, 0, 0);
        bctx.globalAlpha = 1;
      }

      const dom = u < 0.5 ? k0.m : k1.m;
      const scanStr = (dom === 2 ? 1 : 0.0) + (dom === 4 ? 0.9 : 0) + (dom === 1 ? 0.25 : 0);
      scanAndGrid(bctx, time, clamp(scanStr));
      const grainAmt = (dom === 3 ? 0.10 : 0.04);
      grain(bctx, grainAmt);
      vignette(bctx);

      const seam = Math.max(smooth((0.06 - Math.min(T, 1 - T)) / 0.06), 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (seam <= 0.001) {
        ctx.drawImage(buf, 0, 0);
      } else {
        ctx.drawImage(buf, 0, 0);
        const steps = 10;
        for (let s = 1; s <= steps; s++) {
          const sc = 1 + seam * 0.16 * (s / steps);
          ctx.globalAlpha = 0.16 * (1 - s / steps);
          const w = W * sc, h = H * sc;
          ctx.drawImage(buf, (W - w) / 2, (H - h) / 2, w, h);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(230,240,255,${0.25 * seam})`;
        ctx.fillRect(0, 0, W, H);
      }

      animationFrameId = requestAnimationFrame(frame);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth || 800;
      const height = window.innerHeight || 600;
      W = Math.floor(width * dpr);
      H = Math.floor(height * dpr);
      [cv, buf, lay].forEach(cc => {
        cc.width = W;
        cc.height = H;
      });
      cv.style.width = width + 'px';
      cv.style.height = height + 'px';
      build();
    }

    window.addEventListener('resize', resize);
    makeNoise();
    resize();
    animationFrameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none select-none" 
      style={{ display: 'block' }}
    />
  );
}

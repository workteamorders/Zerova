'use client';
import { useEffect, useRef } from 'react';
import { color } from '@/lib/tokens';

/** Live background: wind trails that fade and curl around the pointer. Pauses when hidden or when motion is off. */
export function Wind() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current!, cx = cvs.getContext('2d')!;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    let BW = 0, BH = 0, mx = -9999, my = -9999, raf = 0, last = 0, slow = 0, lite = false;
    const R = (a: number, b: number) => a + Math.random() * (b - a);
    const rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const FG = rgb(color.fg), AC = rgb(color.accent);
    type P = { x: number; y: number; px: number; py: number; age: number; life: number; sp: number; acc: boolean; lw: number };
    let P: P[] = [];
    const mk = (): P => { const x = R(0, BW), y = R(0, BH); return { x, y, px: x, py: y, age: 0, life: R(260, 720), sp: R(.5, 1.5), acc: Math.random() < .12, lw: R(.7, 1.8) }; };
    const size = () => { BW = innerWidth; BH = innerHeight; cvs.width = BW; cvs.height = BH; cx.clearRect(0, 0, BW, BH); P = Array.from({ length: lite ? 55 : 120 }, mk); };
    const off = () => rm.matches || document.documentElement.dataset.motion === 'off';
    const step = (t: number) => {
      raf = 0; if (off() || document.hidden) return;
      const dt = Math.min(64, t - (last || t)); last = t;
      if (dt > 26) { slow++; if (slow > 90 && !lite) { lite = true; size(); } } else if (slow > 0) slow -= .5;
      cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.045)'; cx.fillRect(0, 0, BW, BH); cx.globalCompositeOperation = 'source-over'; cx.lineCap = 'round';
      for (const p of P) {
        let a = Math.sin(p.x * .0032 + t * .00011) * 1.7 + Math.cos(p.y * .0041 - t * .00009) * 1.7;
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 190) { const w = 1 - d / 190; a = a * (1 - w) + (Math.atan2(dy, dx) + 1.2) * w; }
        const v = p.sp * dt * .045; p.px = p.x; p.py = p.y; p.x += Math.cos(a) * v; p.y += Math.sin(a) * v; p.age++;
        cx.beginPath(); cx.lineWidth = p.lw;
        cx.strokeStyle = p.acc ? `rgba(${AC[0]},${AC[1]},${AC[2]},.34)` : `rgba(${FG[0]},${FG[1]},${FG[2]},.2)`;
        cx.moveTo(p.px, p.py); cx.lineTo(p.x, p.y); cx.stroke();
        if (p.age > p.life || p.x < -20 || p.x > BW + 20 || p.y < -20 || p.y > BH + 20) Object.assign(p, mk());
      }
      raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf && !off() && !document.hidden) { last = 0; raf = requestAnimationFrame(step); } };
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else kick(); };
    const mo = new MutationObserver(() => { if (off()) { cancelAnimationFrame(raf); raf = 0; cx.clearRect(0, 0, BW, BH); } else kick(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    size(); kick();
    addEventListener('resize', size); addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('visibilitychange', onVis);
    return () => { cancelAnimationFrame(raf); mo.disconnect(); removeEventListener('resize', size); removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return <div id="bg" aria-hidden="true"><canvas ref={ref} id="bgcv" /></div>;
}

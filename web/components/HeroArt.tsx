// @ts-nocheck
'use client';
import { useEffect, useRef, useState } from 'react';
import { Ink } from '@/lib/ink';

/** The brand ink circle with sun and mountains, painted on load, plus the 12-ring stroke progression. Illustration. */
export function HeroArt({ height = 520, rings = true }: { height?: number; rings?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const cv = ref.current!; let raf = 0;
    const paint = (animate: boolean) => {
      cancelAnimationFrame(raf);
      const r = cv.getBoundingClientRect(), W = r.width, H = r.height, d = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(W * d); cv.height = Math.round(H * d); const x = cv.getContext('2d')!; x.setTransform(d, 0, 0, d, 0, 0);
      const cx = W * .52, cy = H * .5, R = Math.min(W * .22, H * .3);
      Ink.mountains(x, W * .7, -H * .02, W * .3, H * .22, 9, 2, true); Ink.mountains(x, 0, H * .84, W * .4, H * .16, 7, 3, false);
      Ink.sun(x, cx + R * .86, cy - R * .82, R * .45, 3);
      const e = new Ink.Enso(cx, cy, R, 11);
      const off = document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!animate || off) { e.paint(x, 1); setLit(12); return; }
      let t0 = 0; setLit(0);
      const f = (t: number) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / 3600), q = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; e.paint(x, q); setLit(Math.floor(q * 12 + .001)); if (p < 1) raf = requestAnimationFrame(f); };
      raf = requestAnimationFrame(f);
    };
    paint(true);
    let rt = 0; const onR = () => { clearTimeout(rt); rt = window.setTimeout(() => paint(false), 150); };
    addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onR); };
  }, []);
  return (
    <div>
      <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} role="img" aria-label="An ink circle painted in black and red, with a red sun and misty mountains. Illustration." />
      {rings && (
        <div className="prog-s">
          <p className="lbl" style={{ color: 'var(--c-fg)' }}>Stroke Progression</p>
          <div className="rings">
            {Array.from({ length: 12 }, (_, i) => { const k = i + 1, a = k / 12 * 2 * Math.PI - Math.PI / 2, ex = 12 + 9 * Math.cos(a), ey = 12 + 9 * Math.sin(a);
              return (<figure key={k} className={k <= lit ? 'lit' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><circle className="bg" cx="12" cy="12" r="9" fill="none" strokeWidth="1" strokeDasharray="2 2.2" />
                {k === 12 ? <circle className="arc" cx="12" cy="12" r="9" fill="none" strokeWidth="2.4" /> : <path className="arc" d={`M12 3 A9 9 0 ${k > 6 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`} fill="none" strokeWidth="2.4" strokeLinecap="round" />}
              </svg>{k}</figure>); })}
          </div>
        </div>
      )}
    </div>
  );
}
